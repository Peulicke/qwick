import type { vec2 } from "@peulicke/geometry";
import type { QwickInput } from ".";
import type { Input, InputType } from "./input";

const invertVertically = (pos: vec2.Vec2, height: number): vec2.Vec2 => [pos[0], height - pos[1]];

export const createQwickInput = (input: Input): QwickInput => ({
    mousePos: {
        get: input.getMousePos,
        getPressed: input.getMousePressedPos,
        getPixels: () => input.mousePos
    },
    mousePosInverted: {
        get: () => invertVertically(input.getMousePos(), 1),
        getPressed: () => invertVertically(input.getMousePressedPos(), 1),
        getPixels: () => invertVertically(input.mousePos, window.innerHeight)
    },
    isKeyDown: (key: InputType) => input.keysDown.has(key),
    wasKeyPressed: (key: InputType) => input.keysPressed.has(key),
    wasKeyReleased: (key: InputType) => input.keysReleased.has(key),
    getArrowInput: input.getArrowInput
});
