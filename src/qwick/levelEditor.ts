import { Graphics, Qwick, vec2 } from ".";
import { createButton } from "./button";
import { Game } from "./game";
import { InputType } from "./input";
import { Storage } from "./storage";

const menuItemSize = 0.1;

export type MenuItem = {
    id: string;
    draw: (g: Graphics) => void;
};

export type LevelEditor<LevelData> = {
    levelData: LevelData;
    menuItems: MenuItem[];
    draw: (graphics: Graphics) => void;
};

const getMenuItemPos = (qwick: Qwick, index: number) =>
    vec2.add(qwick.getPos("top-right"), vec2.scale([-0.5, 0.5 + index], menuItemSize));

const getMenuItemR = (): vec2.Vec2 => [menuItemSize / 2, menuItemSize / 2];

export const createLevelEditorRunner = <LevelData>(qwick: Qwick, graphics: Graphics, game: Game<LevelData>) => {
    let levelEditor: LevelEditor<LevelData> | null = null;
    let selectedMenuItemIndex = 0;

    const menuButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.05]),
        [0.1, 0.04],
        "Menu"
    );

    const start = () => {
        if (game.loadLevelEditor !== undefined) levelEditor = game.loadLevelEditor();
    };

    const input = (type: InputType, down: boolean, l: LevelEditor<LevelData>) => {
        if (levelEditor === null) return;
        menuButton.input(type, down);
        if (menuButton.clicked) {
            levelEditor = null;
            return;
        }
        if (type === "lmb" && down) {
            l.menuItems.forEach((_, i) => {
                const bb = vec2.createBoundingBox(getMenuItemPos(qwick, i), getMenuItemR());
                if (!vec2.insideBoundingBox(qwick.getMousePos(), bb)) return;
                selectedMenuItemIndex = i;
            });
        }
    };

    const update = (l: LevelEditor<LevelData>) => {
        graphics.begin();
        graphics.normalize();
        graphics.context(() => {
            l.draw(graphics);
        });
        graphics.context(() => {
            l.menuItems.forEach((item, i) => {
                graphics.context(() => {
                    graphics.translate(getMenuItemPos(qwick, i));
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
        graphics.context(() => {
            graphics.color("black");
            graphics.translate(vec2.add(qwick.getPos("top"), [0, 0.05]));
            graphics.text("Level Editor", 0.05);
        });
        menuButton.draw(graphics);
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
