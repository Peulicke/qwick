import { createButton } from "./button";
import createGraphics, { Graphics } from "./graphics";
import "./index.css";

export { default as random } from "./random";
export * as vec3 from "./vec3";
export type { Graphics } from "./graphics";

export type InputType = "lmb" | "rmb";

export type Level = {
    update: () => void;
    draw: (graphics: Graphics) => void;
    input: (type: InputType, down: boolean) => void;
};

export type Game<LevelData> = {
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    resize: () => void;
};

export type Qwick = {
    width: number;
    height: number;
    drawImage: (image: HTMLImageElement, pos: [number, number]) => void;
    getMousePos: () => [number, number];
    levelCompleted: () => void;
    levelLost: () => void;
};

export default <LevelData>(loadGame: (qwick: Qwick) => Game<LevelData>) => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const mousePos: [number, number] = [0, 0];
    let levelNum = 0;
    let level: Level | null = null;

    const qwick: Qwick = {
        width: innerWidth,
        height: innerHeight,
        drawImage: () => {},
        getMousePos: () => [0, 0],
        levelCompleted: () => {},
        levelLost: () => {}
    };
    const graphics = createGraphics(ctx);

    qwick.drawImage = (image: HTMLImageElement, pos: [number, number]) => {
        ctx.drawImage(image, pos[0], pos[1]);
    };

    qwick.getMousePos = () => mousePos;

    const startButton = createButton(qwick.getMousePos, [0, 0], [0.1, 0.04], "Start");

    const game = loadGame(qwick);

    qwick.levelCompleted = () => {
        ++levelNum;
        if (levelNum >= game.levels.length) level = null;
        else level = game.loadLevel(game.levels[levelNum]);
    };

    qwick.levelLost = () => {
        level = game.loadLevel(game.levels[levelNum]);
    };

    let fastForward = false;

    const resize = () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        qwick.width = innerWidth;
        qwick.height = innerHeight;
        game.resize();
    };
    window.addEventListener("resize", resize, true);

    const contextmenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", contextmenu, true);

    const keydown = (e: KeyboardEvent) => {
        if (e.code === "Space") fastForward = true;
    };
    window.addEventListener("keydown", keydown, true);

    const keyup = (e: KeyboardEvent) => {
        if (e.code === "Space") fastForward = false;
    };
    window.addEventListener("keyup", keyup, true);

    const mousemove = (e: MouseEvent) => {
        mousePos[0] = (e.x - 0.5 * qwick.width) / qwick.height;
        mousePos[1] = (e.y - 0.5 * qwick.height) / qwick.height;
    };
    window.addEventListener("mousemove", mousemove, true);

    const onInput = (type: InputType, down: boolean) => {
        if (level) level.input(type, down);
        else {
            if (startButton.clicked(type, down)) {
                levelNum = 0;
                level = game.loadLevel(game.levels[levelNum]);
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
        startButton.draw(graphics);
        graphics.end();
    };

    const updateLevel = (l: Level) => {
        const lvlNum = levelNum;
        for (let i = 0; i < (fastForward ? 10 : 1) && lvlNum === levelNum; ++i) {
            l.update();
        }
        graphics.begin();
        l.draw(graphics);
        graphics.end();
    };

    const t = setInterval(() => {
        if (level) updateLevel(level);
        else updateMenu();
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
