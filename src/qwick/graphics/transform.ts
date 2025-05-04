import { vec2 } from "@peulicke/geometry";
import { TransformType, type Transform2 } from "../transform2";

export const push = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
};

export const pop = (ctx: CanvasRenderingContext2D): void => {
    ctx.restore();
};

export const translate = (ctx: CanvasRenderingContext2D, v: vec2.Vec2): void => {
    ctx.translate(v[0], v[1]);
};

export const rotate = (ctx: CanvasRenderingContext2D, v: number): void => {
    ctx.rotate(v);
};

export const orient = (ctx: CanvasRenderingContext2D, v: vec2.Vec2): void => {
    const angle = Math.atan2(v[1], v[0]);
    ctx.rotate(angle);
};

export const scale = (ctx: CanvasRenderingContext2D, s: number): void => {
    ctx.scale(s, s);
};

export const scale2 = (ctx: CanvasRenderingContext2D, s: vec2.Vec2): void => {
    ctx.scale(s[0], s[1]);
};

export const transform = (ctx: CanvasRenderingContext2D, t: Transform2): void => {
    if (t.type === TransformType.Translate) translate(ctx, t.value);
    if (t.type === TransformType.Scale) scale(ctx, t.value);
    if (t.type === TransformType.Composite)
        [...t.value].reverse().forEach(tt => {
            transform(ctx, tt);
        });
};

export const context = (ctx: CanvasRenderingContext2D, func: () => void) => {
    push(ctx);
    func();
    pop(ctx);
};

export const normalize = (ctx: CanvasRenderingContext2D) => {
    scale(ctx, ctx.canvas.height);
    translate(ctx, [0.5 * (ctx.canvas.width / ctx.canvas.height), 0.5]);
};
