import * as vec2 from "./vec2";

export type InputType = "lmb" | "rmb";

export type Listeners = {
    resize: () => void;
    input: (type: InputType, down: boolean) => void;
};

export const createInput = () => {
    const listeners: Partial<Listeners> = {};

    const input: {
        mousePos: vec2.Vec2;
        keysDown: Set<string>;
        keysPressed: Set<string>;
        keysReleased: Set<string>;
    } = {
        mousePos: [0, 0],
        keysDown: new Set(),
        keysPressed: new Set(),
        keysReleased: new Set()
    };

    const onResize = () => {
        if (listeners.resize) listeners.resize();
    };

    const onInput = (type: InputType, down: boolean) => {
        if (down) input.keysDown.add(type);
        else input.keysDown.delete(type);
        if (listeners.input) listeners.input(type, down);
    };

    window.addEventListener("resize", onResize, true);

    const contextmenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", contextmenu, true);

    const keydown = (e: KeyboardEvent) => {
        if (!input.keysDown.has(e.code)) input.keysPressed.add(e.code);
        input.keysDown.add(e.code);
    };
    window.addEventListener("keydown", keydown, true);

    const keyup = (e: KeyboardEvent) => {
        input.keysReleased.add(e.code);
        input.keysDown.delete(e.code);
    };
    window.addEventListener("keyup", keyup, true);

    const mousemove = (e: MouseEvent) => {
        input.mousePos[0] = e.x;
        input.mousePos[1] = e.y;
    };
    window.addEventListener("mousemove", mousemove, true);

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

    const clear = () => {
        input.keysPressed.clear();
        input.keysReleased.clear();
    };

    const getMousePos = (): vec2.Vec2 => [
        (input.mousePos[0] - 0.5 * window.innerWidth) / window.innerHeight,
        (input.mousePos[1] - 0.5 * window.innerHeight) / window.innerHeight
    ];

    return {
        ...input,
        listeners,
        clear,
        getMousePos,
        destroy: () => {
            window.removeEventListener("contextmenu", contextmenu, true);
            window.removeEventListener("mousemove", mousemove, true);
            window.removeEventListener("mousedown", mousedown, true);
            window.removeEventListener("keydown", keydown, true);
            window.removeEventListener("keyup", keyup, true);
            window.removeEventListener("resize", onResize, true);
        }
    };
};

export type Input = ReturnType<typeof createInput>;
