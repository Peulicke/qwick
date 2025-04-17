import { vec2 } from "@peulicke/geometry";
import { Graphics } from "./graphics";
import { Color } from "./graphics/utils";
import { InputType } from "./input";

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
    rect: vec2.Rect | (() => vec2.Rect),
    text: string | (() => string),
    textSize?: number | (() => number)
): Button => {
    const getRect = typeof rect === "function" ? rect : () => rect;
    const getCenter = () => vec2.getRectCenter(getRect());
    const getR = () => vec2.getRectR(getRect());
    const getText = typeof text === "function" ? text : () => text;
    const getTextSize = typeof textSize === "function" ? textSize : () => textSize ?? getR()[1];

    const button: Button = {
        holding: false,
        clicked: false,
        input: (type: InputType, down: boolean) => {
            if (down) button.clicked = false;
            if (type !== "lmb") return;
            if (!insideButton(getMousePos, getCenter(), getR())) {
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
                const s = getR();
                graphics.translate(getCenter());
                drawRect(graphics, s, fillColor, true);
                drawRect(graphics, s, borderColor, false);
                graphics.text(getText(), getTextSize());
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
                const s = getR();
                const innerSize: vec2.Vec2 = [s[0] - borderWidth, s[1] - borderWidth];
                graphics.translate(getCenter());
                drawRect(graphics, s, borderColor, true);
                drawRect(graphics, innerSize, fillColor, true);
                graphics.color(borderColor);
                graphics.text(getText(), getTextSize());
                if (button.holding) drawRect(graphics, s, "rgba(0,0,0,0.5)", true);
            });
        }
    };
    return button;
};
