import type { QwickInput } from ".";
import type { Input } from "./input";

export const createQwickInput = (input: Input): QwickInput => ({
    getMousePos: input.getMousePos,
    getMousePressedPos: input.getMousePressedPos,
    getMousePosPixels: () => input.mousePos,
    isKeyDown: (key: string) => input.keysDown.has(key),
    wasKeyPressed: (key: string) => input.keysPressed.has(key),
    wasKeyReleased: (key: string) => input.keysReleased.has(key),
    getArrowInput: input.getArrowInput
});
