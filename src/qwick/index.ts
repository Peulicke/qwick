import { PartialGame, fromPartialGame } from "./game";
import { createGraphics } from "./graphics";
import "./index.css";
import { createInput, InputType } from "./input";
import { createLevelRunner } from "./levelRunner";
import { createMenu } from "./menu";
import { Position, getPos } from "./position";
import { createStorage } from "./storage";
import * as vec2 from "./vec2";

export { default as random } from "./random";
export type { Graphics } from "./graphics";
export * as vec2 from "./vec2";
export * as vec3 from "./vec3";
export * as matrix from "./matrix";
export * as grid from "./grid";
export * as transform2 from "./transform2";
export * as button from "./button";
export * as graphics from "./graphics";
export * as utils from "./utils";
export * as event from "./event";

export type Qwick = {
    width: number;
    height: number;
    getAspectRatio: () => number;
    drawImage: (image: HTMLImageElement, pos: vec2.Vec2) => void;
    getMousePos: () => vec2.Vec2;
    getMousePosPixels: () => vec2.Vec2;
    getPos: (pos: Position) => vec2.Vec2;
    isKeyDown: (key: string) => boolean;
    wasKeyPressed: (key: string) => boolean;
    wasKeyReleased: (key: string) => boolean;
};

export const createQwick = <LevelData>(loadGame: (qwick: Qwick) => PartialGame<LevelData>) => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const storage = createStorage();

    const input = createInput();

    const qwick: Qwick = {
        width: innerWidth,
        height: innerHeight,
        getAspectRatio: () => qwick.width / qwick.height,
        drawImage: () => {},
        getMousePos: () => [0, 0],
        getMousePosPixels: () => [0, 0],
        getPos: (pos: Position) => getPos(pos, qwick.getAspectRatio()),
        isKeyDown: (key: string) => input.keysDown.has(key),
        wasKeyPressed: (key: string) => input.keysPressed.has(key),
        wasKeyReleased: (key: string) => input.keysReleased.has(key)
    };

    qwick.drawImage = (image: HTMLImageElement, pos: vec2.Vec2) => {
        ctx.drawImage(image, pos[0], pos[1]);
    };

    qwick.getMousePos = () => [
        (input.mousePos[0] - 0.5 * qwick.width) / qwick.height,
        (input.mousePos[1] - 0.5 * qwick.height) / qwick.height
    ];

    qwick.getMousePosPixels = () => input.mousePos;

    const game = fromPartialGame(loadGame(qwick));

    const graphics = createGraphics(ctx, game.backgroundColor);

    const menu = createMenu(qwick, graphics, game);

    const levelRunner = createLevelRunner(qwick, graphics, game);

    input.listeners.resize = () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        qwick.width = innerWidth;
        qwick.height = innerHeight;
        if (game.resize) game.resize();
        levelRunner.resize();
    };

    input.listeners.input = (type: InputType, down: boolean) => {
        if (levelRunner.isRunning()) {
            levelRunner.input(type, down);
            return;
        }
        const levelPressed = menu.input(type, down);
        if (levelPressed !== undefined) levelRunner.startLevel(levelPressed);
    };

    const t = setInterval(() => {
        if (levelRunner.isRunning()) levelRunner.update(storage);
        else menu.update(storage);
        input.clear();
    }, 1000 / 60);

    return () => {
        document.body.removeChild(canvas);
        input.destroy();
        clearInterval(t);
    };
};
