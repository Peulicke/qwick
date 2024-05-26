import { Game, Graphics, Qwick, vec2 } from ".";
import { createButton } from "./button";
import { EventType, emit } from "./event";
import { InputType } from "./input";
import { Level } from "./level";

export const createLevelRunner = <LevelData>(qwick: Qwick, graphics: Graphics, game: Game<LevelData>) => {
    let levelNum = 0;
    let level: Level | null = null;
    let levelSuccess = false;
    let levelFail = false;

    const menuButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.05]),
        [0.1, 0.04],
        "Menu"
    );
    const restartButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.15]),
        [0.1, 0.04],
        "Restart"
    );
    const fastForwardButton = createButton(
        qwick.getMousePos,
        () => vec2.add(qwick.getPos("top-left"), [0.11, 0.25]),
        [0.1, 0.04],
        "▶▶10⨯"
    );
    const successButton = createButton(
        qwick.getMousePos,
        [0, 0],
        () => [graphics.getAspectRatio(), 0.08],
        "Next level"
    );
    const failButton = createButton(qwick.getMousePos, [0, 0], () => [graphics.getAspectRatio(), 0.08], "Retry");

    const loadLevel = () => {
        levelSuccess = false;
        levelFail = false;
        level = game.loadLevel(game.levels[levelNum]);
        emit({ type: EventType.LEVEL_START, levelNum });
    };

    const input = (type: InputType, down: boolean) => {
        if (level === null) return;
        menuButton.input(type, down);
        if (game.show.menu && menuButton.clicked) {
            level = null;
            emit({ type: EventType.LEVEL_EXIT, levelNum });
            return;
        }
        restartButton.input(type, down);
        if (game.show.restart && restartButton.clicked) {
            emit({ type: EventType.LEVEL_RESTART, levelNum });
            loadLevel();
            return;
        }
        fastForwardButton.input(type, down);
        if (levelSuccess) {
            successButton.input(type, down);
            if (successButton.clicked) {
                ++levelNum;
                if (levelNum >= game.levels.length) level = null;
                else loadLevel();
            }
        } else if (levelFail) {
            failButton.input(type, down);
            if (failButton.clicked) loadLevel();
        } else level.input(type, down);
    };

    const update = (l: Level, setLevelCompleted: (n: number) => void) => {
        const fastForward = fastForwardButton.holding || qwick.isKeyDown("Space");
        for (let i = 0; i < (game.show.fastForward && fastForward ? 10 : 1) && !levelSuccess && !levelFail; ++i) {
            l.update();
            if (l.hasWon()) {
                levelSuccess = true;
                setLevelCompleted(levelNum);
                emit({ type: EventType.LEVEL_WON, levelNum });
            } else if (l.hasLost()) {
                levelFail = true;
                emit({ type: EventType.LEVEL_LOST, levelNum });
            }
        }
        graphics.begin();
        graphics.context(() => {
            if (game.useNormalizedCoordinates ?? true) graphics.normalize();
            l.draw(graphics);
        });
        graphics.normalize();
        graphics.context(() => {
            graphics.color("black");
            graphics.translate(vec2.add(qwick.getPos("top-right"), [-0.1, 0.05]));
            if (game.show.level) graphics.text(`Level ${levelNum + 1}`, 0.05);
        });
        if (game.show.menu) menuButton.draw(graphics);
        if (game.show.restart) restartButton.draw(graphics);
        if (game.show.fastForward) fastForwardButton.draw(graphics);
        if (levelSuccess) successButton.drawWithBorder(graphics, "white", "black", 0.03);
        if (levelFail) failButton.drawWithBorder(graphics, "white", "black", 0.03);
        graphics.end();
    };

    const resize = () => {
        if (level?.resize) level.resize();
    };

    const isRunning = () => level !== null;

    const startLevel = (n: number) => {
        levelNum = n;
        loadLevel();
    };

    return {
        input,
        update: (setLevelCompleted: (n: number) => void) => {
            if (level !== null) update(level, setLevelCompleted);
        },
        resize,
        isRunning,
        startLevel
    };
};
