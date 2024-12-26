import { Graphics, Qwick, vec2 } from ".";
import { InputType } from "./input";
import { Game } from "./game";
import { Storage } from "./storage";

export const createMenu = <LevelDatas>(qwick: Qwick, graphics: Graphics, game: Game<LevelDatas>) => {
    const hasLevelEditor = game.loadLevelEditor !== undefined;
    const gridCount: vec2.Vec2 = [2, 11];
    const leftPos: vec2.Vec2 = [hasLevelEditor ? 0 : 0.5, 3];
    const rightPos: vec2.Vec2 = [1, 3];
    const subMargin: vec2.Vec2 = [0.01, 0.01];
    const startButton = qwick.createButton(
        () => qwick.canvas.getSubSquareMiddle(gridCount, leftPos, [0, 0], subMargin),
        "Start"
    );
    const editorButton = qwick.createButton(
        () => qwick.canvas.getSubSquareMiddle(gridCount, rightPos, [0, 0], subMargin),
        "Level Editor"
    );

    const buttonGridWidth = Math.ceil(Math.sqrt(game.levels.length));
    const levelButtons = game.levels.map((_, i) => {
        const xIndex = i % buttonGridWidth;
        const yIndex = Math.floor(i / buttonGridWidth);
        return qwick.createButton(
            () =>
                qwick.canvas.getSubSquareMiddle(
                    [buttonGridWidth, buttonGridWidth + 4],
                    [xIndex, yIndex + 3],
                    [0, 0],
                    subMargin
                ),
            `${i + 1}`
        );
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
