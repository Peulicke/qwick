import { createCanvas } from "./canvas";
import { PartialGame, fromPartialGame } from "./game";
import { createGraphics } from "./graphics";
import "./index.css";
import { createInput, InputType } from "./input";
import { createLevelRunner } from "./level";
import { createLevelEditorRunner } from "./levelEditor";
import { createMenu } from "./menu";
import { Position, getPos } from "./position";
import { TestSuite, createTestSuite } from "./qwickTest";
import { createStorage } from "./storage";
import * as vec2 from "./vec2";

export { default as random } from "./random";
export type { Graphics } from "./graphics";
export type { InputType } from "./input";
export * as vec2 from "./vec2";
export * as vec3 from "./vec3";
export * as matrix from "./matrix";
export * as grid from "./grid";
export * as transform2 from "./transform2";
export * as button from "./button";
export * as graphics from "./graphics";
export * as utils from "./utils";
export * as event from "./event";

export type QwickInput = {
    getMousePos: () => vec2.Vec2;
    getMousePosPixels: () => vec2.Vec2;
    getPos: (pos: Position) => vec2.Vec2;
    isKeyDown: (key: string) => boolean;
    wasKeyPressed: (key: string) => boolean;
    wasKeyReleased: (key: string) => boolean;
};

export type Qwick = {
    width: number;
    height: number;
    getAspectRatio: () => number;
    input: QwickInput;
};

export const createQwick = <LevelData>(
    loadGame: (qwick: Qwick) => PartialGame<LevelData>,
    loadTest?: (qwickTest: TestSuite) => void
) => {
    const path = window.location.pathname
        .split("/")
        .filter(x => x !== "")
        .map(decodeURIComponent);
    if (path.length > 0) {
        const qwickTest = createTestSuite(path);
        if (loadTest) loadTest(qwickTest);
        return;
    }
    const canvas = createCanvas();
    const storage = createStorage();
    const input = createInput();

    const getAspectRatio = () => canvas.canvas.width / canvas.canvas.height;

    const qwickInput: QwickInput = {
        getMousePos: input.getMousePos,
        getMousePosPixels: () => input.mousePos,
        getPos: (pos: Position) => getPos(pos, getAspectRatio()),
        isKeyDown: (key: string) => input.keysDown.has(key),
        wasKeyPressed: (key: string) => input.keysPressed.has(key),
        wasKeyReleased: (key: string) => input.keysReleased.has(key)
    };

    const qwick: Qwick = {
        width: window.innerWidth,
        height: window.innerHeight,
        getAspectRatio,
        input: qwickInput
    };

    const game = fromPartialGame(loadGame(qwick));

    const graphics = createGraphics(canvas.ctx, game.backgroundColor);

    const menu = createMenu(qwick, graphics, game);

    const levelRunner = createLevelRunner(qwick, graphics, game);
    const levelEditorRunner = createLevelEditorRunner(qwick, graphics, game);

    input.listeners.resize = () => {
        canvas.resize();
        qwick.width = window.innerWidth;
        qwick.height = window.innerHeight;
        game.resize();
        levelRunner.resize();
    };

    input.listeners.input = (type: InputType, down: boolean) => {
        if (levelRunner.isRunning()) {
            levelRunner.input(type, down);
            return;
        }
        if (levelEditorRunner.isRunning()) {
            levelEditorRunner.input(type, down);
            return;
        }
        const levelPressed = menu.input(type, down);
        if (levelPressed === undefined) return;
        if (levelPressed === -1) return levelEditorRunner.start();
        levelRunner.startLevel(levelPressed);
    };

    const t = setInterval(() => {
        if (levelRunner.isRunning()) levelRunner.update(storage);
        else if (levelEditorRunner.isRunning()) levelEditorRunner.update(storage);
        else menu.update(storage);
        input.clear();
    }, 1000 / 60);

    return () => {
        canvas.destroy();
        input.destroy();
        clearInterval(t);
    };
};
