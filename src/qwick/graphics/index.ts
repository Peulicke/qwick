import * as vec2 from "../vec2";
import * as utils from "./utils";
import * as transform from "./transform";
import * as draw from "./draw";

const createGraphics = (ctx: CanvasRenderingContext2D) => ({
    getAspectRatio: (): number => ctx.canvas.width / ctx.canvas.height,
    begin: (): void => utils.begin(ctx),
    end: (): void => utils.end(ctx),
    color: (color: string): void => utils.setColor(ctx, color),
    push: (): void => transform.push(ctx),
    pop: (): void => transform.pop(ctx),
    at: (pos: vec2.Vec2, func: () => void): void => transform.at(ctx, pos, func),
    translate: (v: vec2.Vec2): void => transform.translate(ctx, v),
    rotate: (v: number): void => transform.rotate(ctx, v),
    scale: (v: number): void => transform.scale(ctx, v),
    line: (a: vec2.Vec2, b: vec2.Vec2): void => draw.line(ctx, a, b),
    lineStrip: (a: vec2.Vec2[]): void => draw.lineStrip(ctx, a),
    lineLoop: (a: vec2.Vec2[]): void => draw.lineLoop(ctx, a),
    lineStrips: (a: vec2.Vec2[][]): void => draw.lineStrips(ctx, a),
    circle: (v: vec2.Vec2, r: number): void => draw.circle(ctx, v, r),
    s: (v: vec2.Vec2, r: number): void => draw.s(ctx, v, r),
    text: (text: string, size: number): void => draw.text(ctx, text, size),
    arrow: (a: vec2.Vec2, r: vec2.Vec2): void => draw.arrow(ctx, a, r),
    fork: (a: vec2.Vec2, r: vec2.Vec2): void => draw.fork(ctx, a, r),
    square: (): void => draw.square(ctx),
    rect: (a: vec2.Vec2, b: vec2.Vec2): void => draw.rect(ctx, a, b)
});

export type Graphics = ReturnType<typeof createGraphics>;

export default createGraphics;
