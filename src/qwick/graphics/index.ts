import * as vec2 from "../vec2";
import * as utils from "./utils";
import * as transform from "./transform";
import * as draw from "./draw";

export type Graphics = {
    getAspectRatio: () => number;
    begin: () => void;
    end: () => void;
    color: (color: string) => void;
    push: () => void;
    pop: () => void;
    translate: (v: vec2.Vec2) => void;
    rotate: (v: number) => void;
    scale: (v: vec2.Vec2) => void;
    line: (a: vec2.Vec2, b: vec2.Vec2) => void;
    lineStrip: (a: vec2.Vec2[]) => void;
    lineLoop: (a: vec2.Vec2[]) => void;
    lineStrips: (a: vec2.Vec2[][]) => void;
    circle: (v: vec2.Vec2, r: number) => void;
    s: (v: vec2.Vec2, r: number) => void;
    text: (text: string) => void;
    arrow: (a: vec2.Vec2, r: vec2.Vec2) => void;
    fork: (a: vec2.Vec2, r: vec2.Vec2) => void;
    square: () => void;
    rect: (a: vec2.Vec2, b: vec2.Vec2) => void;
};

export default (ctx: CanvasRenderingContext2D): Graphics => ({
    getAspectRatio: (): number => ctx.canvas.width / ctx.canvas.height,
    begin: (): void => utils.begin(ctx),
    end: (): void => utils.end(ctx),
    color: (color: string): void => utils.setColor(ctx, color),
    push: (): void => transform.push(ctx),
    pop: (): void => transform.pop(ctx),
    translate: (v: vec2.Vec2): void => transform.translate(ctx, v),
    rotate: (v: number): void => transform.rotate(ctx, v),
    scale: (v: vec2.Vec2): void => transform.scale(ctx, v),
    line: (a: vec2.Vec2, b: vec2.Vec2): void => draw.line(ctx, a, b),
    lineStrip: (a: vec2.Vec2[]): void => draw.lineStrip(ctx, a),
    lineLoop: (a: vec2.Vec2[]): void => draw.lineLoop(ctx, a),
    lineStrips: (a: vec2.Vec2[][]): void => draw.lineStrips(ctx, a),
    circle: (v: vec2.Vec2, r: number): void => draw.circle(ctx, v, r),
    s: (v: vec2.Vec2, r: number): void => draw.s(ctx, v, r),
    text: (text: string): void => draw.text(ctx, text),
    arrow: (a: vec2.Vec2, r: vec2.Vec2): void => draw.arrow(ctx, a, r),
    fork: (a: vec2.Vec2, r: vec2.Vec2): void => draw.fork(ctx, a, r),
    square: (): void => draw.square(ctx),
    rect: (a: vec2.Vec2, b: vec2.Vec2): void => draw.rect(ctx, a, b)
});
