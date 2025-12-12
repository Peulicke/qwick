import { vec2 } from "@peulicke/geometry";
import { isFunctionKey, type KeyCode } from "./input-types";

export type MouseInputType = "lmb" | "rmb" | "mmb";

export type InputType = MouseInputType | KeyCode;

export type Listeners = {
    resize: () => void;
    input: (type: MouseInputType, down: boolean) => void;
    scroll: (delta: number) => void;
};

export const createInput = () => {
    const listeners: Partial<Listeners> = {};

    const getInitialMousePos = (): vec2.Vec2 => [Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2)];

    const input: {
        mousePos: vec2.Vec2;
        mousePressedPos: vec2.Vec2;
        keysDown: Set<InputType>;
        keysPressed: Set<InputType>;
        keysReleased: Set<InputType>;
    } = {
        mousePos: getInitialMousePos(),
        mousePressedPos: getInitialMousePos(),
        keysDown: new Set(),
        keysPressed: new Set(),
        keysReleased: new Set()
    };

    const onResize = () => {
        if (listeners.resize) listeners.resize();
    };

    const onInput = (type: MouseInputType, down: boolean) => {
        if (down) {
            input.keysPressed.add(type);
            input.keysDown.add(type);
            if (type === "lmb") input.mousePressedPos = input.mousePos;
        } else {
            input.keysReleased.add(type);
            input.keysDown.delete(type);
        }
        if (listeners.input) listeners.input(type, down);
    };

    const onScroll = (delta: number) => {
        if (listeners.scroll) listeners.scroll(delta);
    };

    window.addEventListener("resize", onResize, true);

    const contextmenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", contextmenu, true);

    const keydown = (e: KeyboardEvent) => {
        const code = e.code as KeyCode;
        if (!isFunctionKey(code)) e.preventDefault();
        if (!input.keysDown.has(code)) input.keysPressed.add(code);
        input.keysDown.add(code);
    };
    window.addEventListener("keydown", keydown, true);

    const keyup = (e: KeyboardEvent) => {
        const code = e.code as KeyCode;
        input.keysReleased.add(code);
        input.keysDown.delete(code);
    };
    window.addEventListener("keyup", keyup, true);

    const setMousePos = (x: number, y: number) => {
        input.mousePos[0] = x;
        input.mousePos[1] = y;
    };

    const mousemove = (e: MouseEvent) => setMousePos(e.x, e.y);
    window.addEventListener("mousemove", mousemove, true);

    const touchmove = (e: TouchEvent) => setMousePos(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("touchmove", touchmove, true);

    const mousedown = (e: MouseEvent) => {
        setMousePos(e.x, e.y);
        if (e.button === 0) onInput("lmb", true);
        if (e.button === 1) onInput("mmb", true);
        if (e.button === 2) onInput("rmb", true);
    };
    window.addEventListener("mousedown", mousedown, true);

    const touchstart = (e: TouchEvent) => {
        setMousePos(e.touches[0].clientX, e.touches[0].clientY);
        onInput("lmb", true);
    };
    window.addEventListener("touchstart", touchstart, true);

    const mouseup = (e: MouseEvent) => {
        if (e.button === 0) onInput("lmb", false);
        if (e.button === 1) onInput("mmb", false);
        if (e.button === 2) onInput("rmb", false);
    };
    window.addEventListener("mouseup", mouseup, true);

    const touchend = () => {
        onInput("lmb", false);
    };
    window.addEventListener("touchend", touchend, true);

    document.addEventListener("wheel", event => onScroll(event.deltaY));

    const clear = () => {
        input.keysPressed.clear();
        input.keysReleased.clear();
    };

    const pixelPosToNormalizedPos = (pos: vec2.Vec2): vec2.Vec2 => [
        (pos[0] - 0.5 * window.innerWidth) / window.innerHeight,
        (pos[1] - 0.5 * window.innerHeight) / window.innerHeight
    ];

    const getMousePos = (): vec2.Vec2 => pixelPosToNormalizedPos(input.mousePos);

    const getMousePressedPos = (): vec2.Vec2 => pixelPosToNormalizedPos(input.mousePressedPos);

    const getArrowInput = (): vec2.Vec2 =>
        vec2.normalize([
            (input.keysDown.has("ArrowRight") ? 1 : 0) - (input.keysDown.has("ArrowLeft") ? 1 : 0),
            (input.keysDown.has("ArrowDown") ? 1 : 0) - (input.keysDown.has("ArrowUp") ? 1 : 0)
        ]);

    return {
        ...input,
        listeners,
        clear,
        getMousePos,
        getMousePressedPos,
        getArrowInput,
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
