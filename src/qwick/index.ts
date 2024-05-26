import { createButton } from "./button";
import { emit, EventType } from "./event";
import { createGraphics, Graphics } from "./graphics";
import "./index.css";
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

export type InputType = "lmb" | "rmb";

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

    const mousePos: vec2.Vec2 = [0, 0];
    let levelNum = 0;
    let level: Level | null = null;
    let levelSuccess = false;
    let levelFail = false;

    const keysDown = new Set<string>();
    const keysPressed = new Set<string>();
    const keysReleased = new Set<string>();

    const qwick: Qwick = {
        width: innerWidth,
        height: innerHeight,
        getAspectRatio: () => qwick.width / qwick.height,
        drawImage: () => {},
        getMousePos: () => [0, 0],
        getMousePosPixels: () => [0, 0],
        getPos: (pos: Position) => getPos(pos, qwick.getAspectRatio()),
        isKeyDown: (key: string) => keysDown.has(key),
        wasKeyPressed: (key: string) => keysPressed.has(key),
        wasKeyReleased: (key: string) => keysReleased.has(key)
    };

    qwick.drawImage = (image: HTMLImageElement, pos: vec2.Vec2) => {
        ctx.drawImage(image, pos[0], pos[1]);
    };

    qwick.getMousePos = () => [
        (mousePos[0] - 0.5 * qwick.width) / qwick.height,
        (mousePos[1] - 0.5 * qwick.height) / qwick.height
    ];

    qwick.getMousePosPixels = () => mousePos;

    const game = fromPartialGame(loadGame(qwick));

    const graphics = createGraphics(ctx, game.backgroundColor);

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
    const startButton = createButton(qwick.getMousePos, [0, -0.2], [0.1, 0.04], "Start");
    const successButton = createButton(
        qwick.getMousePos,
        [0, 0],
        () => [graphics.getAspectRatio(), 0.08],
        "Next level"
    );
    const failButton = createButton(qwick.getMousePos, [0, 0], () => [graphics.getAspectRatio(), 0.08], "Retry");

    const buttonGridWidth = Math.ceil(Math.sqrt(game.levels.length));
    const levelButtons = game.levels.map((_, i) => {
        const xIndex = i % buttonGridWidth;
        const yIndex = Math.floor(i / buttonGridWidth);
        const x = (xIndex - (buttonGridWidth - 1) / 2) * 0.22;
        const y = yIndex * 0.1 - 0.05;
        return createButton(qwick.getMousePos, [x, y], [0.1, 0.04], `${i + 1}`);
    });

    const resize = () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        qwick.width = innerWidth;
        qwick.height = innerHeight;
        if (game.resize) game.resize();
        if (level?.resize) level.resize();
    };
    window.addEventListener("resize", resize, true);

    const contextmenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", contextmenu, true);

    const keydown = (e: KeyboardEvent) => {
        if (!keysDown.has(e.code)) keysPressed.add(e.code);
        keysDown.add(e.code);
    };
    window.addEventListener("keydown", keydown, true);

    const keyup = (e: KeyboardEvent) => {
        keysReleased.add(e.code);
        keysDown.delete(e.code);
    };
    window.addEventListener("keyup", keyup, true);

    const mousemove = (e: MouseEvent) => {
        mousePos[0] = e.x;
        mousePos[1] = e.y;
    };
    window.addEventListener("mousemove", mousemove, true);

    const loadLevel = () => {
        levelSuccess = false;
        levelFail = false;
        level = game.loadLevel(game.levels[levelNum]);
        emit({ type: EventType.LEVEL_START, levelNum });
    };

    const onInput = (type: InputType, down: boolean) => {
        if (down) keysDown.add(type);
        else keysDown.delete(type);
        if (level) {
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
        } else {
            startButton.input(type, down);
            if (startButton.clicked) {
                levelNum = 0;
                loadLevel();
            }
            for (let i = 0; i < levelButtons.length; ++i) {
                levelButtons[i].input(type, down);
                if (levelButtons[i].clicked) {
                    levelNum = i;
                    loadLevel();
                }
            }
        }
    };

    const mousedown = (e: MouseEvent) => {
        if (e.button === 0) onInput("lmb", true);
        if (e.button === 2) onInput("rmb", true);
    };
    window.addEventListener("mousedown", mousedown, true);

    const mouseup = (e: MouseEvent) => {
        if (e.button === 0) onInput("lmb", false);
        if (e.button === 2) onInput("rmb", false);
    };
    window.addEventListener("mouseup", mouseup, true);

    const updateMenu = () => {
        graphics.begin();
        graphics.normalize();
        graphics.context(() => {
            graphics.color("gray");
            graphics.translate([0, -0.35]);
            graphics.scale(2);
            graphics.text(game.name, 0.05);
        });
        startButton.draw(graphics);
        const completedLevels = getCompletedLevels();
        levelButtons.forEach((b, i) => {
            b.draw(graphics, completedLevels.has(i) ? "green" : "gray");
        });
        graphics.end();
    };

    const updateLevel = (l: Level) => {
        const fastForward = fastForwardButton.holding || keysDown.has("Space");
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

    const t = setInterval(() => {
        if (level) updateLevel(level);
        else updateMenu();
        keysPressed.clear();
        keysReleased.clear();
    }, 1000 / 60);

    return () => {
        document.body.removeChild(canvas);
        window.removeEventListener("contextmenu", contextmenu, true);
        window.removeEventListener("mousemove", mousemove, true);
        window.removeEventListener("mousedown", mousedown, true);
        window.removeEventListener("keydown", keydown, true);
        window.removeEventListener("keyup", keyup, true);
        window.removeEventListener("resize", resize, true);
        clearInterval(t);
    };
};
