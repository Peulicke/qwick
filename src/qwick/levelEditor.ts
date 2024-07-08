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

export const createLevelEditorRunner = <LevelData>(qwick: Qwick, graphics: Graphics, game: Game<LevelData>) => {
    let levelEditor: LevelEditor<LevelData> | null = null;

    const menuButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.05]),
        [0.1, 0.04],
        "Menu"
    );

    const start = () => {
        if (game.loadLevelEditor !== undefined) levelEditor = game.loadLevelEditor();
    };

    const input = (type: InputType, down: boolean) => {
        if (levelEditor === null) return;
        menuButton.input(type, down);
        if (menuButton.clicked) {
            levelEditor = null;
            return;
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
                    graphics.translate(qwick.getPos("top-right"));
                    graphics.scale(menuItemSize);
                    graphics.translate([-0.5, 0.5]);
                    graphics.translate([0, i]);
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
        input,
        update: (_: Storage) => {
            if (levelEditor !== null) update(levelEditor);
        },
        isRunning
    };
};
