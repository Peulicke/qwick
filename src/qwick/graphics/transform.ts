import * as vec2 from "../vec2";

export const push = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
};

export const pop = (ctx: CanvasRenderingContext2D): void => {
    ctx.restore();
};

export const translate = (ctx: CanvasRenderingContext2D, v: vec2.Vec2): void => {
    ctx.translate(v[0], v[0]);
};

export const rotate = (ctx: CanvasRenderingContext2D, v: number): void => {
    ctx.rotate(v);
};

export const scale = (ctx: CanvasRenderingContext2D, v: vec2.Vec2): void => {
    ctx.scale(v[0], v[1]);
};
