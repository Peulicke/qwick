import { createButton } from "./button";
import { Game, Graphics, Qwick } from ".";
import { InputType } from "./input";

export const createMenu = <LevelData>(qwick: Qwick, graphics: Graphics, game: Game<LevelData>) => {
    const startButton = createButton(qwick.getMousePos, [0, -0.2], [0.1, 0.04], "Start");

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
        for (let i = 0; i < levelButtons.length; ++i) {
            levelButtons[i].input(type, down);
            if (levelButtons[i].clicked) return i;
        }
        return undefined;
    };

    const update = (completedLevels: Set<number>) => {
        graphics.begin();
        graphics.normalize();
        graphics.context(() => {
            graphics.color("gray");
            graphics.translate([0, -0.35]);
            graphics.scale(2);
            graphics.text(game.name, 0.05);
        });
        startButton.draw(graphics);
        levelButtons.forEach((b, i) => {
            b.draw(graphics, completedLevels.has(i) ? "green" : "gray");
        });
        graphics.end();
    };

    return {
        input,
        update
    };
};
