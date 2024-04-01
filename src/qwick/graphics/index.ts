import * as vec2 from "../vec2";
import { Transform2 } from "../transform2";
import * as utils from "./utils";
import * as transform from "./transform";
import * as draw from "./draw";

export * as utils from "./utils";
export * as transform from "./transform";
export * as draw from "./draw";

export const createGraphics = (ctx: CanvasRenderingContext2D, backgroundColor: string) => ({
    getAspectRatio: (): number => ctx.canvas.width / ctx.canvas.height,
    begin: (): void => utils.begin(ctx, backgroundColor),
    end: (): void => utils.end(ctx),
    color: (color: utils.Color): void => utils.setColor(ctx, color),
    push: (): void => transform.push(ctx),
    pop: (): void => transform.pop(ctx),
    context: (func: () => void): void => transform.context(ctx, func),
    normalize: (): void => transform.normalize(ctx),
    translate: (v: vec2.Vec2): void => transform.translate(ctx, v),
    rotate: (v: number): void => transform.rotate(ctx, v),
    orient: (v: vec2.Vec2): void => transform.orient(ctx, v),
    scale: (v: number): void => transform.scale(ctx, v),
    transform: (t: Transform2) => transform.transform(ctx, t),
    line: (a: vec2.Vec2, b: vec2.Vec2): void => draw.line(ctx, a, b),
    lineStrip: (a: vec2.Vec2[]): void => draw.lineStrip(ctx, a),
    lineLoop: (a: vec2.Vec2[], fill: boolean): void => draw.lineLoop(ctx, a, fill),
    lineStrips: (a: vec2.Vec2[][]): void => draw.lineStrips(ctx, a),
    circle: (v: vec2.Vec2, r: number, fill = false, angleFrom = 0, angleTo = 2 * Math.PI): void =>
        draw.circle(ctx, v, r, fill, angleFrom, angleTo),
    s: (v: vec2.Vec2, r: number): void => draw.s(ctx, v, r),
    text: (text: string, size: number): void => draw.text(ctx, text, size),
    arrow: (a: vec2.Vec2, r: vec2.Vec2): void => draw.arrow(ctx, a, r),
    fork: (a: vec2.Vec2, r: vec2.Vec2): void => draw.fork(ctx, a, r),
    square: (fill: boolean): void => draw.square(ctx, fill),
    rect: (a: vec2.Vec2, b: vec2.Vec2, fill: boolean): void => draw.rect(ctx, a, b, fill),
    icon: (v: vec2.Vec2, r: number, type: draw.IconType, filled = false): void => draw.icon(ctx, v, r, type, filled)
});

export type Graphics = ReturnType<typeof createGraphics>;
