import { InputType } from ".";
import { Graphics } from "./graphics";
import { Color } from "./graphics/utils";
import * as vec2 from "./vec2";

export type Button = {
    holding: boolean;
    clicked: boolean;
    input: (type: InputType, down: boolean) => void;
    draw: (graphics: Graphics, fillColor?: Color, borderColor?: Color) => void;
    drawWithBorder: (graphics: Graphics, fillColor?: Color, borderColor?: Color, borderWidth?: number) => void;
};

const insideRect = (pos: vec2.Vec2, rectPos: vec2.Vec2, rectSize: vec2.Vec2) => {
    const dPos = vec2.sub(pos, rectPos);
    return Math.abs(dPos[0]) < rectSize[0] && Math.abs(dPos[1]) < rectSize[1];
};

const insideButton = (getMousePos: () => vec2.Vec2, pos: vec2.Vec2, size: vec2.Vec2) =>
    insideRect(getMousePos(), pos, size);

const drawRect = (graphics: Graphics, size: vec2.Vec2, color: Color, fill: boolean): void => {
    graphics.color(color);
    graphics.rect(vec2.negate(size), size, fill);
};

export const createButton = (
    getMousePos: () => vec2.Vec2,
    pos: vec2.Vec2 | (() => vec2.Vec2),
    size: vec2.Vec2 | (() => vec2.Vec2),
    text: string
): Button => {
    const getPos = typeof pos === "function" ? pos : () => pos;
    const getSize = typeof size === "function" ? size : () => size;
    const button: Button = {
        holding: false,
        clicked: false,
        input: (type: InputType, down: boolean) => {
            if (down) button.clicked = false;
            if (type !== "lmb") return;
            if (!insideButton(getMousePos, getPos(), getSize())) {
                button.holding = false;
                button.clicked = false;
                return;
            }
            if (down) {
                button.holding = true;
                button.clicked = false;
                return;
            }
            if (button.holding) {
                button.holding = false;
                button.clicked = true;
                return;
            }
            button.clicked = false;
        },
        draw: (graphics: Graphics, fillColor: Color = "rgba(0,0,0,0)", borderColor: Color = "black") => {
            graphics.context(() => {
                const s = getSize();
                graphics.translate(getPos());
                drawRect(graphics, s, fillColor, true);
                drawRect(graphics, s, borderColor, false);
                graphics.text(text, 0.05);
                if (button.holding) drawRect(graphics, s, "rgba(0,0,0,0.5)", true);
            });
        },
        drawWithBorder: (
            graphics: Graphics,
            fillColor: Color = "rgba(0,0,0,0)",
            borderColor: Color = "black",
            borderWidth = 1
        ) => {
            graphics.context(() => {
                const s = getSize();
                const innerSize: vec2.Vec2 = [s[0] - borderWidth, s[1] - borderWidth];
                graphics.translate(getPos());
                drawRect(graphics, s, borderColor, true);
                drawRect(graphics, innerSize, fillColor, true);
                graphics.color(borderColor);
                graphics.text(text, 0.05);
                if (button.holding) drawRect(graphics, s, "rgba(0,0,0,0.5)", true);
            });
        }
    };
    return button;
};
