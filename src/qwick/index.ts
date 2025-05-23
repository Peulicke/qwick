import { vec2 } from "@peulicke/geometry";
import { type Button, createButton } from "./button";
import { createCanvas } from "./canvas";
import { type PartialGame, fromPartialGame } from "./game";
import { createGraphics } from "./graphics";
import "./index.css";
import { createInput, type InputType } from "./input";
import { createLevelRunner } from "./level";
import { createLevelEditorRunner } from "./level-editor";
import { createMenu } from "./menu";
import { type Position, getPos } from "./position";
import { type TestSuite, createTestSuite } from "./qwick-test";
import { createStorage } from "./storage";
import { createQwickInput } from "./qwick-input";

export type { Graphics } from "./graphics";
export type { InputType } from "./input";
export * as matrix from "./matrix";
export * as transform2 from "./transform2";
export * as button from "./button";
export * as graphics from "./graphics";
export * as event from "./event";

export type QwickInput = {
    getMousePos: () => vec2.Vec2;
    getMousePosPixels: () => vec2.Vec2;
    isKeyDown: (key: string) => boolean;
    wasKeyPressed: (key: string) => boolean;
    wasKeyReleased: (key: string) => boolean;
    getArrowInput: () => vec2.Vec2;
};

type GetSubRect = (count: vec2.Vec2, posIndex: vec2.Vec2, superMargin?: vec2.Vec2, subMargin?: vec2.Vec2) => vec2.Rect;

export type QwickCanvas = {
    getSize: () => vec2.Vec2;
    getAspectRatio: () => number;
    getRect: () => vec2.Rect;
    getSubRect: GetSubRect;
    getSubSquareLeft: GetSubRect;
    getSubSquareMiddle: GetSubRect;
    getSubSquareRight: GetSubRect;
    getPos: (pos: Position) => vec2.Vec2;
};

export type Qwick = {
    canvas: QwickCanvas;
    input: QwickInput;
    createButton: (
        rect: vec2.Rect | (() => vec2.Rect),
        text: string | (() => string),
        textSize?: number | (() => number)
    ) => Button;
};

export const createQwick = <LevelData>(
    loadGame: (qwick: Qwick) => PartialGame<LevelData>,
    loadTest?: (qwickTest: TestSuite) => void
) => {
    const path = window.location.pathname
        .split("/")
        .filter(x => x !== "")
        .map(decodeURIComponent);
    if (path.length > 0 && path[0] !== "games") {
        const qwickTest = createTestSuite(path);
        if (loadTest) loadTest(qwickTest);
        return;
    }
    const canvas = createCanvas();
    const storage = createStorage();
    const input = createInput();

    const qwickInput = createQwickInput(input);

    const getAspectRatio = () => canvas.canvas.width / canvas.canvas.height;
    const getNormalizedSize = (): vec2.Vec2 => [getAspectRatio(), 1];
    const getNormalizedR = () => vec2.scale(getNormalizedSize(), 0.5);
    const getCanvasRect = () => vec2.createRect([0, 0], getNormalizedR());
    const getSquareLeft = (): vec2.Rect => [
        [-getAspectRatio() / 2, -0.5],
        [-getAspectRatio() / 2 + 1, 0.5]
    ];
    const getSquareMiddle = (): vec2.Rect => [
        [-0.5, -0.5],
        [0.5, 0.5]
    ];
    const getSquareRight = (): vec2.Rect => [
        [getAspectRatio() / 2 - 1, -0.5],
        [getAspectRatio() / 2, 0.5]
    ];

    const createGetSubRect =
        (getRect: () => vec2.Rect): GetSubRect =>
        (count, posIndex, superMargin = [0, 0], subMargin = [0, 0]) =>
            vec2.getSubRect(getRect(), count, posIndex, superMargin, subMargin);

    const qwickCanvas: QwickCanvas = {
        getSize: () => [canvas.canvas.width, canvas.canvas.height],
        getAspectRatio,
        getRect: getCanvasRect,
        getSubRect: createGetSubRect(getCanvasRect),
        getSubSquareLeft: createGetSubRect(getSquareLeft),
        getSubSquareMiddle: createGetSubRect(getSquareMiddle),
        getSubSquareRight: createGetSubRect(getSquareRight),
        getPos: (pos: Position) => getPos(pos, getAspectRatio())
    };

    const qwick: Qwick = {
        input: qwickInput,
        canvas: qwickCanvas,
        createButton: (rect, text, textSize) => createButton(input.getMousePos, rect, text, textSize)
    };

    const game = fromPartialGame(loadGame(qwick));

    const graphics = createGraphics(canvas, game.backgroundColor);

    const menu = createMenu(qwick, graphics, game);

    const levelRunner = createLevelRunner(qwick, graphics, game);
    const levelEditorRunner = createLevelEditorRunner(qwick, graphics, game);

    input.listeners.resize = () => {
        canvas.resize();
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

    input.listeners.scroll = (delta: number) => {
        if (levelRunner.isRunning()) levelRunner.scroll(delta);
        if (levelEditorRunner.isRunning()) levelEditorRunner.scroll(delta);
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
