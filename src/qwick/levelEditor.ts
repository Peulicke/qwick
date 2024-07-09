import { Graphics, Qwick, vec2 } from ".";
import { createButton } from "./button";
import { Game } from "./game";
import { InputType } from "./input";
import { loadFile, saveFile } from "./io";
import { Storage } from "./storage";

const menuItemSize = 0.1;
const menuInputTextSize = 0.2;

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

const getMenuInputPos = (graphics: Graphics, index: number) =>
    vec2.add(getMenuItemPos(graphics, index), [-menuItemSize, 0]);

const getMenuItemR = (): vec2.Vec2 => [menuItemSize / 2, menuItemSize / 2];

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

const drawMenuInputs = (graphics: Graphics, menuInputs: MenuInput[]) => {
    graphics.context(() => {
        menuInputs.forEach((input, i) => {
            graphics.context(() => {
                graphics.translate(getMenuInputPos(graphics, i));
                graphics.scale(menuItemSize);
                graphics.color("gray");
                graphics.square(true);
                graphics.color("white");
                graphics.text(input.label + "\n" + input.getValue(), menuInputTextSize);
            });
        });
    });
};

export const createLevelEditorRunner = <LevelData>(qwick: Qwick, graphics: Graphics, game: Game<LevelData>) => {
    let levelEditor: LevelEditor<LevelData> | null = null;
    let selectedMenuItemIndex = 0;

    const menuButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.05]),
        [0.1, 0.04],
        "Menu"
    );

    const loadButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.15]),
        [0.1, 0.04],
        "Load"
    );

    const saveButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.25]),
        [0.1, 0.04],
        "Save"
    );

    const start = () => {
        if (game.loadLevelEditor !== undefined) levelEditor = game.loadLevelEditor();
    };

    const input = (type: InputType, down: boolean, l: LevelEditor<LevelData>) => {
        if (levelEditor === null) return;
        menuButton.input(type, down);
        loadButton.input(type, down);
        saveButton.input(type, down);
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
        if (type === "lmb" && down) {
            l.menuItems.forEach((_, i) => {
                const bb = vec2.createBoundingBox(getMenuItemPos(graphics, i), getMenuItemR());
                if (!vec2.insideBoundingBox(qwick.getMousePos(), bb)) return;
                selectedMenuItemIndex = i;
            });
            l.menuInputs.forEach((menuInput, i) => {
                const bb = vec2.createBoundingBox(getMenuInputPos(graphics, i), getMenuItemR());
                if (!vec2.insideBoundingBox(qwick.getMousePos(), bb)) return;
                const newValue = window.prompt(menuInput.label, menuInput.getValue());
                if (newValue === null) return;
                menuInput.setValue(newValue);
            });
        }
    };

    const update = (l: LevelEditor<LevelData>) => {
        l.menuItems[selectedMenuItemIndex].update();
        graphics.begin();
        graphics.normalize();
        graphics.context(() => {
            l.draw(graphics);
        });
        drawMenuItems(graphics, l.menuItems, selectedMenuItemIndex);
        drawMenuInputs(graphics, l.menuInputs);
        graphics.context(() => {
            graphics.color("black");
            graphics.translate(vec2.add(qwick.getPos("top"), [0, 0.05]));
            graphics.text("Level Editor", 0.05);
        });
        menuButton.draw(graphics);
        loadButton.draw(graphics);
        saveButton.draw(graphics);
        graphics.end();
    };

    const isRunning = () => levelEditor !== null;

    return {
        start,
        input: (type: InputType, down: boolean) => {
            if (levelEditor !== null) input(type, down, levelEditor);
        },
        update: (_: Storage) => {
            if (levelEditor !== null) update(levelEditor);
        },
        isRunning
    };
};
