import { vec2 } from "@peulicke/geometry";
import type { Graphics, Qwick } from ".";
import { EventType, emit } from "./event";
import type { Game } from "./game";
import type { InputType } from "./input";
import type { Storage } from "./storage";

export type Level = {
    update: () => void;
    hasWon: () => boolean;
    hasLost: () => boolean;
    draw: (graphics: Graphics) => void;
    input: (type: InputType, down: boolean) => void;
    scroll: (delta: number) => void;
    resize: () => void;
};

export const defaultLevel = (): Level => ({
    update: () => {},
    hasWon: () => false,
    hasLost: () => false,
    draw: () => {},
    input: () => {},
    scroll: () => {},
    resize: () => {}
});

export const createLevelRunner = <LevelDatas>(qwick: Qwick, graphics: Graphics, game: Game<LevelDatas>) => {
    let levelNum = 0;
    let level: Level | null = null;
    let levelSuccess = false;
    let levelFail = false;

    const buttonMargin: vec2.Vec2 = [0.005, 0.005];
    const buttonGridSize: vec2.Vec2 = [6, 12];

    const getButtonRect = (index: number): vec2.Rect =>
        qwick.canvas.getSubSquareLeft(buttonGridSize, [0, index], buttonMargin, buttonMargin);

    const menuButton = qwick.createButton(() => getButtonRect(0), "Menu");
    const restartButton = qwick.createButton(() => getButtonRect(1), "Restart");
    const fastForwardButton = qwick.createButton(() => getButtonRect(2), "▶▶10⨯");

    const gameOverButtonHeight = 0.08;
    const getGameOverButtonRect = () => vec2.createRect([0, 0], [graphics.getAspectRatio(), gameOverButtonHeight]);

    const successButton = qwick.createButton(getGameOverButtonRect, "Next level");
    const failButton = qwick.createButton(getGameOverButtonRect, "Retry");

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

    const scroll = (delta: number) => {
        if (level === null) return;
        level.scroll(delta);
    };

    const update = (l: Level, setLevelCompleted: (n: number) => void) => {
        const fastForward = fastForwardButton.holding || qwick.input.isKeyDown("Space");
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
            graphics.normalize();
            l.draw(graphics);
        });
        graphics.normalize();
        graphics.context(() => {
            graphics.color("black");
            graphics.translate(vec2.add(qwick.canvas.getPos("top-right"), [-0.1, 0.05]));
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
        scroll,
        update: (storage: Storage) => {
            if (level !== null) update(level, storage.setLevelCompleted);
        },
        resize,
        isRunning,
        startLevel
    };
};
