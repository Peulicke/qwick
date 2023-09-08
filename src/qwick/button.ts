import { InputType } from ".";
import { Graphics } from "./graphics";
import * as vec2 from "./vec2";

export type Button = {
    clicked: (type: InputType, down: boolean) => boolean;
    draw: (graphics: Graphics) => void;
};

const insideRect = (pos: vec2.Vec2, rectPos: vec2.Vec2, rectSize: vec2.Vec2) => {
    const dPos = vec2.sub(pos, rectPos);
    return Math.abs(dPos[0]) < rectSize[0] && Math.abs(dPos[1]) < rectSize[1];
};

const insideButton = (getMousePos: () => vec2.Vec2, pos: vec2.Vec2, size: vec2.Vec2) =>
    insideRect(getMousePos(), pos, size);

export const createButton = (
    getMousePos: () => vec2.Vec2,
    pos: vec2.Vec2 | (() => vec2.Vec2),
    size: vec2.Vec2,
    text: string
): Button => {
    const getPos = typeof pos === "function" ? pos : () => pos;
    let mouseDown = false;
    return {
        clicked: (type: InputType, down: boolean) => {
            if (type !== "lmb") return false;
            if (!insideButton(getMousePos, getPos(), size)) {
                mouseDown = false;
                return false;
            }
            if (down) {
                mouseDown = true;
                return false;
            }
            if (mouseDown) {
                mouseDown = false;
                return true;
            }
            return false;
        },
        draw: (graphics: Graphics) => {
            graphics.context(() => {
                graphics.translate(getPos());
                graphics.text(text, 0.05);
                graphics.rect(vec2.negate(size), size, false);
            });
        }
    };
};
