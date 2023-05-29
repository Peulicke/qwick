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
    canvas.style.background = "#3056bf";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
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

    const game = loadGame(qwick);

    qwick.levelCompleted = () => {
        if (!game) return;
        ++levelNum;
        level = game.loadLevel(game.levels[levelNum]);
    };

    qwick.levelLost = () => {
        if (!game) return;
        level = game.loadLevel(game.levels[levelNum]);
    };

    level = game.loadLevel(game.levels[levelNum]);
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
        mousePos[0] = e.x;
        mousePos[1] = e.y;
    };
    window.addEventListener("mousedown", mousemove, true);

    const mousedown = (e: MouseEvent) => {
        if (!level) return;
        if (e.button === 0) level.input("lmb", true);
        if (e.button === 2) level.input("rmb", true);
    };
    window.addEventListener("mousedown", mousedown, true);

    const t = setInterval(() => {
        if (!level) return;
        for (let i = 0; i < (fastForward ? 10 : 1); ++i) {
            level.update();
        }
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        level.draw(graphics);
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
