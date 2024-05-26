import { createGraphics, Graphics } from "./graphics";
import "./index.css";
import { createInput, InputType } from "./input";
import { createLevelRunner } from "./levelRunner";
import { createMenu } from "./menu";
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

export type Level = {
    update: () => void;
    hasWon: () => boolean;
    hasLost: () => boolean;
    draw: (graphics: Graphics) => void;
    input: (type: InputType, down: boolean) => void;
    resize: () => void;
};

const defaultLevel = (): Level => ({
    update: () => {},
    hasWon: () => false,
    hasLost: () => false,
    draw: () => {},
    input: () => {},
    resize: () => {}
});

export type ShowOptions = {
    menu: boolean;
    restart: boolean;
    fastForward: boolean;
    level: boolean;
};

const defaultShowOptions = (): ShowOptions => ({
    menu: true,
    restart: true,
    fastForward: true,
    level: true
});

export type Game<LevelData> = {
    name: string;
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    resize: () => void;
    backgroundColor: string;
    useNormalizedCoordinates: boolean;
    show: ShowOptions;
};

export type PartialGame<LevelData> = Partial<Omit<Game<LevelData>, "loadLevel" | "show">> & {
    loadLevel?: (ld: LevelData) => Partial<Level>;
    show?: Partial<ShowOptions>;
};

export type Position =
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

const positionToUnitCoords: Record<Position, vec2.Vec2> = {
    "top-left": [-1, -1],
    left: [-1, 0],
    "bottom-left": [-1, 1],
    top: [0, -1],
    center: [0, 0],
    bottom: [0, 1],
    "top-right": [1, -1],
    right: [1, 0],
    "bottom-right": [1, 1]
};

const getPos = (pos: Position, aspectRatio: number): vec2.Vec2 =>
    vec2.multiply(positionToUnitCoords[pos], [0.5 * aspectRatio, 0.5]);

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

const getCompletedLevels = (): Set<number> => new Set(JSON.parse(localStorage.getItem(location.pathname) ?? "[]"));

const setLevelCompleted = (levelNum: number): void =>
    localStorage.setItem(location.pathname, JSON.stringify([...new Set([...getCompletedLevels(), levelNum])]));

const fromPartialGame = <LevelData>(partialGame: PartialGame<LevelData>): Game<LevelData> => ({
    name: "Name of the game",
    levels: [],
    resize: () => {},
    backgroundColor: "#60b1c7",
    useNormalizedCoordinates: true,
    ...partialGame,
    loadLevel: (ld: LevelData): Level => {
        if (partialGame.loadLevel === undefined) return defaultLevel();
        const level = partialGame.loadLevel(ld);
        if (level === undefined) return defaultLevel();
        return { ...defaultLevel(), ...level };
    },
    show: {
        ...defaultShowOptions(),
        ...partialGame.show
    }
});

export const createQwick = <LevelData>(loadGame: (qwick: Qwick) => PartialGame<LevelData>) => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

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
        if (levelRunner.isRunning()) levelRunner.update(setLevelCompleted);
        else menu.update(getCompletedLevels());
        input.clear();
    }, 1000 / 60);

    return () => {
        document.body.removeChild(canvas);
        input.destroy();
        clearInterval(t);
    };
};
