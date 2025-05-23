import { vec2 } from "@peulicke/geometry";
import type { Graphics, Qwick } from ".";
import type { Button } from "./button";
import type { Game } from "./game";
import type { InputType } from "./input";
import { loadFile, saveFile } from "./io";
import type { Level } from "./level";
import type { Storage } from "./storage";

const menuItemSize = 0.1;

export type MenuItem = {
    update: () => void;
    draw: (g: Graphics) => void;
};

export type MenuInput = {
    label: string;
    getValue: () => string;
    setValue: (value: string) => void;
};

export type LevelEditor<LevelData> = {
    getLevelData: () => LevelData;
    setLevelData: (levelData: LevelData) => void;
    menuItems: MenuItem[];
    menuInputs: MenuInput[];
    draw: (graphics: Graphics) => void;
};

const getMenuItemPos = (graphics: Graphics, index: number) =>
    vec2.add([graphics.getAspectRatio() * 0.5, -0.5], vec2.scale([-0.5, 0.5 + index], menuItemSize));

const getMenuItemR = (): vec2.Vec2 => [menuItemSize / 2, menuItemSize / 2];

const getMenuInputRect = (graphics: Graphics, index: number) =>
    vec2.createRect(vec2.add(getMenuItemPos(graphics, index), [-menuItemSize, 0]), getMenuItemR());

const drawMenuItems = (graphics: Graphics, menuItems: MenuItem[], selectedMenuItemIndex: number) => {
    graphics.context(() => {
        menuItems.forEach((item, i) => {
            graphics.context(() => {
                graphics.translate(getMenuItemPos(graphics, i));
                graphics.scale(menuItemSize);
                if (i === selectedMenuItemIndex) {
                    graphics.color("black");
                    graphics.square(false);
                }
                graphics.scale(0.9);
                item.draw(graphics);
            });
        });
    });
};

export const createLevelEditorRunner = <LevelData>(qwick: Qwick, graphics: Graphics, game: Game<LevelData>) => {
    let levelEditor: LevelEditor<LevelData> | null = null;
    let level: Level | null = null;
    let selectedMenuItemIndex = 0;
    let menuInputButtons: Button[] = [];

    const buttonMargin: vec2.Vec2 = [0.005, 0.005];
    const buttonGridSize: vec2.Vec2 = [6, 12];

    const getButtonRect = (index: number) =>
        qwick.canvas.getSubSquareLeft(buttonGridSize, [0, index], buttonMargin, buttonMargin);

    const menuButton = qwick.createButton(() => getButtonRect(0), "Menu");
    const loadButton = qwick.createButton(() => getButtonRect(1), "Load");
    const saveButton = qwick.createButton(() => getButtonRect(2), "Save");
    const playButton = qwick.createButton(() => getButtonRect(3), "Play");
    const fastForwardButton = qwick.createButton(() => getButtonRect(2), "▶▶10⨯");
    const stopButton = qwick.createButton(() => getButtonRect(3), "Stop");

    const start = () => {
        if (game.loadLevelEditor === undefined) return;
        levelEditor = game.loadLevelEditor();
        menuInputButtons = levelEditor.menuInputs.map((menuInput, i) =>
            qwick.createButton(
                () => getMenuInputRect(graphics, i),
                () => menuInput.label + "\n" + menuInput.getValue(),
                () => 0.5 * getMenuItemR()[1]
            )
        );
    };

    const input = (type: InputType, down: boolean, l: LevelEditor<LevelData>) => {
        if (level !== null) {
            fastForwardButton.input(type, down);
            stopButton.input(type, down);
            if (stopButton.clicked) {
                level = null;
                return;
            }
            level.input(type, down);
            return;
        }
        if (levelEditor === null) return;
        menuButton.input(type, down);
        loadButton.input(type, down);
        saveButton.input(type, down);
        playButton.input(type, down);
        menuInputButtons.forEach(b => b.input(type, down));
        if (menuButton.clicked) {
            levelEditor = null;
            return;
        }
        if (loadButton.clicked) {
            loadFile().then(data => {
                if (levelEditor !== null) levelEditor.setLevelData(JSON.parse(data));
            });
            return;
        }
        if (saveButton.clicked) {
            saveFile(JSON.stringify(levelEditor.getLevelData(), null, 4), "level.json");
            return;
        }
        if (playButton.clicked) {
            level = game.loadLevel(levelEditor.getLevelData());
            return;
        }
        l.menuInputs.forEach((menuInput, i) => {
            if (!menuInputButtons[i].clicked) return;
            const newValue = window.prompt(menuInput.label, menuInput.getValue());
            if (newValue === null) return;
            menuInput.setValue(newValue);
        });
        if (type === "lmb" && down) {
            l.menuItems.forEach((_, i) => {
                const rect = vec2.createRect(getMenuItemPos(graphics, i), getMenuItemR());
                if (!vec2.insideRect(qwick.input.getMousePos(), rect)) return;
                selectedMenuItemIndex = i;
            });
        }
    };

    const scroll = (delta: number) => {
        if (level !== null) level.scroll(delta);
    };

    const drawPlaying = (l: Level) => {
        if (game.show.fastForward) fastForwardButton.draw(graphics);
        stopButton.draw(graphics);
        graphics.context(() => {
            l.draw(graphics);
        });
        if (l.hasWon()) graphics.text("Win", 0.1);
        if (l.hasLost()) graphics.text("Lose", 0.1);
    };

    const drawNotPlaying = (l: LevelEditor<LevelData>) => {
        graphics.context(() => {
            l.draw(graphics);
        });
        drawMenuItems(graphics, l.menuItems, selectedMenuItemIndex);
        menuInputButtons.forEach(b => b.draw(graphics));
        graphics.context(() => {
            graphics.color("black");
            graphics.translate(vec2.add(qwick.canvas.getPos("top"), [0, 0.05]));
            graphics.text("Level Editor", 0.05);
        });
        menuButton.draw(graphics);
        loadButton.draw(graphics);
        saveButton.draw(graphics);
        playButton.draw(graphics);
    };

    const draw = (l: LevelEditor<LevelData>) => {
        graphics.begin();
        graphics.normalize();
        if (level === null) drawNotPlaying(l);
        else drawPlaying(level);
        graphics.end();
    };

    const update = (l: LevelEditor<LevelData>) => {
        if (level === null) {
            if (l.menuItems.length > 0) l.menuItems[selectedMenuItemIndex].update();
        } else {
            const fastForward = fastForwardButton.holding || qwick.input.isKeyDown("Space");
            for (let i = 0; i < (game.show.fastForward && fastForward ? 10 : 1); ++i) {
                level.update();
            }
        }
        draw(l);
    };

    const isRunning = () => levelEditor !== null;

    return {
        start,
        input: (type: InputType, down: boolean) => {
            if (levelEditor !== null) input(type, down, levelEditor);
        },
        scroll: (delta: number) => {
            if (levelEditor !== null) scroll(delta);
        },
        update: (_: Storage) => {
            if (levelEditor !== null) update(levelEditor);
        },
        isRunning
    };
};
