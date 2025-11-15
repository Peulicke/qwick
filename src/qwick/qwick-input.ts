import type { QwickInput } from ".";
import type { Input, InputType } from "./input";

export const createQwickInput = (input: Input): QwickInput => ({
    getMousePos: input.getMousePos,
    getMousePressedPos: input.getMousePressedPos,
    getMousePosPixels: () => input.mousePos,
    isKeyDown: (key: InputType) => input.keysDown.has(key),
    wasKeyPressed: (key: InputType) => input.keysPressed.has(key),
    wasKeyReleased: (key: InputType) => input.keysReleased.has(key),
    getArrowInput: input.getArrowInput
});
