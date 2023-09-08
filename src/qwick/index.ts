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
    getMousePosPixels: () => [number, number];
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
    let levelSuccess = false;
    let levelFail = false;

    const qwick: Qwick = {
        width: innerWidth,
        height: innerHeight,
        drawImage: () => {},
        getMousePos: () => [0, 0],
        getMousePosPixels: () => [0, 0],
        levelCompleted: () => {},
        levelLost: () => {}
    };
    const graphics = createGraphics(ctx);

    qwick.drawImage = (image: HTMLImageElement, pos: [number, number]) => {
        ctx.drawImage(image, pos[0], pos[1]);
    };

    qwick.getMousePos = () => [
        (mousePos[0] - 0.5 * qwick.width) / qwick.height,
        (mousePos[1] - 0.5 * qwick.height) / qwick.height
    ];

    qwick.getMousePosPixels = () => mousePos;

    const menuButton = createButton(
        qwick.getMousePos,
        () => [-0.5 * graphics.getAspectRatio() + 0.11, -0.5 + 0.05],
        [0.1, 0.04],
        "Menu"
    );
    const startButton = createButton(qwick.getMousePos, [0, -0.3], [0.1, 0.04], "Start");
    const successButton = createButton(qwick.getMousePos, [0, 0], [0.15, 0.04], "Next level");
    const failButton = createButton(qwick.getMousePos, [0, 0], [0.15, 0.04], "Retry");

    const game = loadGame(qwick);

    const buttonGridWidth = Math.ceil(Math.sqrt(game.levels.length));
    const levelButtons = game.levels.map((_, i) => {
        const xIndex = i % buttonGridWidth;
        const yIndex = Math.floor(i / buttonGridWidth);
        const x = (xIndex - (buttonGridWidth - 1) / 2) * 0.22;
        const y = yIndex * 0.1 - 0.15;
        return createButton(qwick.getMousePos, [x, y], [0.1, 0.04], `${i + 1}`);
    });

    qwick.levelCompleted = () => {
        levelSuccess = true;
    };

    qwick.levelLost = () => {
        levelFail = true;
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
        mousePos[0] = e.x;
        mousePos[1] = e.y;
    };
    window.addEventListener("mousemove", mousemove, true);

    const loadLevel = () => {
        levelSuccess = false;
        levelFail = false;
        level = game.loadLevel(game.levels[levelNum]);
    };

    const onInput = (type: InputType, down: boolean) => {
        if (level) {
            if (menuButton.clicked(type, down)) {
                level = null;
                return;
            }
            if (levelSuccess) {
                if (successButton.clicked(type, down)) {
                    ++levelNum;
                    if (levelNum >= game.levels.length) level = null;
                    else loadLevel();
                }
            } else if (levelFail) {
                if (failButton.clicked(type, down)) loadLevel();
            } else level.input(type, down);
        } else {
            if (startButton.clicked(type, down)) {
                levelNum = 0;
                loadLevel();
            }
            for (let i = 0; i < levelButtons.length; ++i) {
                if (levelButtons[i].clicked(type, down)) {
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
        startButton.draw(graphics);
        levelButtons.forEach(b => {
            b.draw(graphics);
        });
        graphics.end();
    };

    const updateLevel = (l: Level) => {
        if (!levelSuccess && !levelFail) {
            const lvlNum = levelNum;
            for (let i = 0; i < (fastForward ? 10 : 1) && lvlNum === levelNum; ++i) {
                l.update();
            }
        }
        graphics.begin();
        l.draw(graphics);
        graphics.context(() => {
            graphics.translate([0.5 * graphics.getAspectRatio() - 0.1, -0.5 + 0.05]);
            graphics.text(`Level ${levelNum + 1}`, 0.05);
        });
        menuButton.draw(graphics);
        if (levelSuccess) successButton.draw(graphics);
        if (levelFail) failButton.draw(graphics);
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
