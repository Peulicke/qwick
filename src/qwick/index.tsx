import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { useWindowSize } from "@react-hook/window-size";

export { default as random } from "./random"
export * as vec3 from "./vec3"

export type InputType = "lmb" | "rmb";

export type Level = {
    update: () => void;
    draw: () => void;
    input: (type: InputType, down: boolean) => void;
}

export type Game<LevelData> = {
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    resize: () => void;
}

let ctx: CanvasRenderingContext2D | null = null;

export type Qwick = {
    width: number;
    height: number;
    drawImage: (image: HTMLImageElement, pos: [number, number]) => void;
    getMousePos: () => [number, number];
    levelCompleted: () => void;
    levelLost: () => void;
}

const createGame = <LevelData,>(loadGame: (q: Qwick) => Game<LevelData>) => {
    const mousePos: [number, number] = [0, 0];
    let levelNum = 0;
    let level: Level | null = null;

    const qwick: Qwick = {
        width: innerWidth,
        height: innerHeight,
        drawImage: () => { },
        getMousePos: () => [0, 0],
        levelCompleted: () => { },
        levelLost: () => { }
    }

    qwick.drawImage = (image: HTMLImageElement, pos: [number, number]) => {
        if (ctx) ctx.drawImage(image, pos[0], pos[1]);
    }

    qwick.getMousePos = () => mousePos;

    const game = loadGame(qwick);

    qwick.levelCompleted = () => {
        if (!game) return;
        ++levelNum;
        level = game.loadLevel(game.levels[levelNum]);
    }

    qwick.levelLost = () => {
        if (!game) return;
        level = game.loadLevel(game.levels[levelNum]);
    }

    level = game.loadLevel(game.levels[levelNum]);
    let fastForward = false;

    const resize = () => {
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
        e.preventDefault();
        mousePos[0] = e.x;
        mousePos[1] = e.y;
    };
    window.addEventListener("mousedown", mousemove, true);

    const mousedown = (e: MouseEvent) => {
        e.preventDefault();
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
        if (!ctx) return;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        level.draw();
    }, 1000 / 60);

    return () => {
        window.removeEventListener("contextmenu", contextmenu, true);
        window.removeEventListener("mousemove", mousemove, true);
        window.removeEventListener("mousedown", mousedown, true);
        window.removeEventListener("keydown", keydown, true);
        window.removeEventListener("keyup", keyup, true);
        window.removeEventListener("resize", resize, true);
        clearInterval(t);
        ctx = null;
    };
};

export default <LevelData,>(loadGame: (qwick: Qwick) => Game<LevelData>) => {
    const App = () => {
        const ref = useRef<HTMLCanvasElement>(null);
        const [width, height] = useWindowSize();

        useEffect(() => {
            if (!ref.current) return;
            ctx = ref.current.getContext("2d");
            if (!ctx) return;
            return createGame(loadGame);
        }, [ref]);

        return <canvas ref={ref} width={width} height={height} style={{ background: "#3056bf" }} />;
    };

    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement
    );
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}