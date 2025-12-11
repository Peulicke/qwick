import type { vec2 } from "@peulicke/geometry";
import type { QwickInput } from ".";
import type { Input, InputType } from "./input";

const invertVertically = (pos: vec2.Vec2): vec2.Vec2 => [pos[0], window.innerHeight - pos[1]];

export const createQwickInput = (input: Input): QwickInput => ({
    mousePos: {
        get: input.getMousePos,
        getPressed: input.getMousePressedPos,
        getPixels: () => input.mousePos
    },
    mousePosInverted: {
        get: () => invertVertically(input.getMousePos()),
        getPressed: () => invertVertically(input.getMousePressedPos()),
        getPixels: () => invertVertically(input.mousePos)
    },
    isKeyDown: (key: InputType) => input.keysDown.has(key),
    wasKeyPressed: (key: InputType) => input.keysPressed.has(key),
    wasKeyReleased: (key: InputType) => input.keysReleased.has(key),
    getArrowInput: input.getArrowInput
});
