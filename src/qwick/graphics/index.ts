import * as utils from "./utils";
import * as transform from "./transform";
import * as draw from "./draw";
import { createGraphics3d } from "./graphics3d";
import { vec2 } from "@peulicke/geometry";
import type { Canvas } from "../canvas";
import type { Transform2 } from "../transform2";

export * as utils from "./utils";
export * as transform from "./transform";
export * as draw from "./draw";
export type { Graphics3d } from "./graphics3d";

export const createGraphics = (canvas: Canvas, backgroundColor: string) => {
    const graphics3d = createGraphics3d(backgroundColor);
    const ctx = canvas.canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Can't get canvas 2d context");

    let invertVertical = false;

    const doNotInvertVertical = (func: () => void): (() => void) => {
        if (!invertVertical) return func;
        return () => transform.invertedVerticalContext(ctx, func);
    };

    return {
        getAspectRatio: (): number => ctx.canvas.width / ctx.canvas.height,
        begin: (): void => {
            utils.begin(ctx);
            graphics3d.begin();
        },
        end: (): void => {
            utils.end(ctx);
            graphics3d.end();
        },
        color: (color: utils.Color): void => utils.setColor(ctx, color),
        push: (): void => transform.push(ctx),
        pop: (): void => transform.pop(ctx),
        context: (func: () => void): void => transform.context(ctx, func),
        contextVerticalInversion: (func: () => void): void => {
            invertVertical = true;
            transform.invertedVerticalContext(ctx, func);
            invertVertical = false;
        },
        normalize: (): void => transform.normalize(ctx),
        translate: (v: vec2.Vec2): void => transform.translate(ctx, v),
        rotate: (v: number): void => transform.rotate(ctx, v),
        orient: (v: vec2.Vec2): void => transform.orient(ctx, v),
        scale: (v: number): void => transform.scale(ctx, [v, v]),
        scale2: (v: vec2.Vec2): void => transform.scale(ctx, v),
        transform: (t: Transform2) => transform.transform(ctx, t),
        line: (a: vec2.Vec2, b: vec2.Vec2): void => draw.line(ctx, a, b),
        lineStrip: (a: vec2.Vec2[]): void => draw.lineStrip(ctx, a),
        lineLoop: (a: vec2.Vec2[], fill: boolean): void => draw.lineLoop(ctx, a, fill),
        lineStrips: (a: vec2.Vec2[][]): void => draw.lineStrips(ctx, a),
        circle: (v: vec2.Vec2, r: number, fill = false, angleFrom = 0, angleTo = 2 * Math.PI): void =>
            draw.circle(ctx, v, r, fill, angleFrom, angleTo),
        s: (v: vec2.Vec2, r: number): void => doNotInvertVertical(() => draw.s(ctx, v, r))(),
        text: (text: string, size: number, textAlign: CanvasTextAlign = "center"): void =>
            doNotInvertVertical(() => draw.text(ctx, text, size, textAlign))(),
        arrow: (a: vec2.Vec2, r: vec2.Vec2): void => draw.arrow(ctx, a, r),
        fork: (a: vec2.Vec2, r: vec2.Vec2): void => draw.fork(ctx, a, r),
        square: (fill: boolean): void => draw.square(ctx, fill),
        rect: (a: vec2.Vec2, b: vec2.Vec2, fill: boolean): void => draw.rect(ctx, a, b, fill),
        icon: (v: vec2.Vec2, r: number, type: draw.IconType, filled = false): void =>
            doNotInvertVertical(() => draw.icon(ctx, v, r, type, filled))(),
        image: (img: HTMLImageElement): void => doNotInvertVertical(() => draw.image(ctx, img))(),
        get3d: () => graphics3d
    };
};

export type Graphics = ReturnType<typeof createGraphics>;
