import { createButton } from "./button";
import createGraphics, { Graphics } from "./graphics";
import "./index.css";

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

export type InputType = "lmb" | "rmb";

export type Level = {
    update: () => void;
    hasWon: () => boolean;
    hasLost: () => boolean;
    draw: (graphics: Graphics) => void;
    input: (type: InputType, down: boolean) => void;
};

export type Game<LevelData> = {
    name: string;
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    resize?: () => void;
    backgroundColor: string;
};

export type Qwick = {
    width: number;
    height: number;
    drawImage: (image: HTMLImageElement, pos: [number, number]) => void;
    getMousePos: () => [number, number];
    getMousePosPixels: () => [number, number];
};

enum LocalStorage {
    CompletedLevels = "completedLevels"
}

const getCompletedLevels = (): Set<number> =>
    new Set(JSON.parse(localStorage.getItem(LocalStorage.CompletedLevels) ?? "[]"));

const setLevelCompleted = (levelNum: number): void =>
    localStorage.setItem(
        LocalStorage.CompletedLevels,
        JSON.stringify([...new Set([...getCompletedLevels(), levelNum])])
    );

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
        getMousePosPixels: () => [0, 0]
    };

    qwick.drawImage = (image: HTMLImageElement, pos: [number, number]) => {
        ctx.drawImage(image, pos[0], pos[1]);
    };

    qwick.getMousePos = () => [
        (mousePos[0] - 0.5 * qwick.width) / qwick.height,
        (mousePos[1] - 0.5 * qwick.height) / qwick.height
    ];

    qwick.getMousePosPixels = () => mousePos;

    const game = loadGame(qwick);

    const graphics = createGraphics(ctx, game.backgroundColor);

    const menuButton = createButton(
        qwick.getMousePos,
        () => [-0.5 * graphics.getAspectRatio() + 0.11, -0.5 + 0.05],
        [0.1, 0.04],
        "Menu"
    );
    const restartButton = createButton(
        qwick.getMousePos,
        () => [-0.5 * graphics.getAspectRatio() + 0.11, -0.5 + 0.15],
        [0.1, 0.04],
        "Restart"
    );
    const startButton = createButton(qwick.getMousePos, [0, -0.2], [0.1, 0.04], "Start");
    const successButton = createButton(qwick.getMousePos, [0, 0], [0.15, 0.04], "Next level");
    const failButton = createButton(qwick.getMousePos, [0, 0], [0.15, 0.04], "Retry");

    const buttonGridWidth = Math.ceil(Math.sqrt(game.levels.length));
    const levelButtons = game.levels.map((_, i) => {
        const xIndex = i % buttonGridWidth;
        const yIndex = Math.floor(i / buttonGridWidth);
        const x = (xIndex - (buttonGridWidth - 1) / 2) * 0.22;
        const y = yIndex * 0.1 - 0.05;
        return createButton(qwick.getMousePos, [x, y], [0.1, 0.04], `${i + 1}`);
    });

    let fastForward = false;

    const resize = () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        qwick.width = innerWidth;
        qwick.height = innerHeight;
        if (game.resize) game.resize();
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
            if (restartButton.clicked(type, down)) {
                loadLevel();
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
        for (let i = 0; i < (fastForward ? 10 : 1) && !levelSuccess && !levelFail; ++i) {
            l.update();
            if (l.hasWon()) {
                levelSuccess = true;
                setLevelCompleted(levelNum);
            } else if (l.hasLost()) levelFail = true;
        }
        graphics.begin();
        l.draw(graphics);
        graphics.context(() => {
            graphics.color("black");
            graphics.translate([0.5 * graphics.getAspectRatio() - 0.1, -0.5 + 0.05]);
            graphics.text(`Level ${levelNum + 1}`, 0.05);
        });
        menuButton.draw(graphics);
        restartButton.draw(graphics);
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
