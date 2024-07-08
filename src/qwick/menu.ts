import { createButton } from "./button";
import { Graphics, Qwick } from ".";
import { InputType } from "./input";
import { Game } from "./game";
import { Storage } from "./storage";

export const createMenu = <LevelDatas>(qwick: Qwick, graphics: Graphics, game: Game<LevelDatas>) => {
    const hasLevelEditor = game.loadLevelEditor !== undefined;
    const startButton = createButton(qwick.getMousePos, [hasLevelEditor ? -0.15 : 0, -0.2], [0.12, 0.04], "Start");
    const editorButton = createButton(qwick.getMousePos, [0.15, -0.2], [0.12, 0.04], "Level Editor");

    const buttonGridWidth = Math.ceil(Math.sqrt(game.levels.length));
    const levelButtons = game.levels.map((_, i) => {
        const xIndex = i % buttonGridWidth;
        const yIndex = Math.floor(i / buttonGridWidth);
        const x = (xIndex - (buttonGridWidth - 1) / 2) * 0.22;
        const y = yIndex * 0.1 - 0.05;
        return createButton(qwick.getMousePos, [x, y], [0.1, 0.04], `${i + 1}`);
    });

    const input = (type: InputType, down: boolean): number | undefined => {
        startButton.input(type, down);
        if (startButton.clicked) return 0;
        if (hasLevelEditor) {
            editorButton.input(type, down);
            if (editorButton.clicked) return -1;
        }
        for (let i = 0; i < levelButtons.length; ++i) {
            levelButtons[i].input(type, down);
            if (levelButtons[i].clicked) return i;
        }
        return undefined;
    };

    const update = (storage: Storage) => {
        graphics.begin();
        graphics.normalize();
        graphics.context(() => {
            graphics.color("gray");
            graphics.translate([0, -0.35]);
            graphics.scale(2);
            graphics.text(game.name, 0.05);
        });
        startButton.draw(graphics);
        if (hasLevelEditor) editorButton.draw(graphics);
        levelButtons.forEach((b, i) => {
            b.draw(graphics, storage.getCompletedLevels().has(i) ? "green" : "gray");
        });
        graphics.end();
    };

    return {
        input,
        update
    };
};
