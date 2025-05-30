import { vec2 } from "@peulicke/geometry";
import * as transform from "./transform";

const stroke = (ctx: CanvasRenderingContext2D, fill: boolean): void => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.stroke();
    if (fill) ctx.fill();
    ctx.restore();
};

export const line = (ctx: CanvasRenderingContext2D, a: vec2.Vec2, b: vec2.Vec2): void => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    stroke(ctx, false);
};

export const arrow = (ctx: CanvasRenderingContext2D, a: vec2.Vec2, r: vec2.Vec2): void => {
    const b = vec2.add(a, r);
    line(ctx, a, b);
    const s = 0.25;
    const d = vec2.scale(r, -s);
    const n = vec2.cross(d);
    line(ctx, b, vec2.add(b, vec2.add(d, n)));
    line(ctx, b, vec2.add(b, vec2.sub(d, n)));
};

export const fork = (ctx: CanvasRenderingContext2D, a: vec2.Vec2, r: vec2.Vec2): void => {
    const b = vec2.add(a, r);
    line(ctx, a, b);
    const s = 0.25;
    const d = vec2.scale(r, -s);
    const n = vec2.cross(d);
    line(ctx, vec2.add(b, d), vec2.add(b, n));
    line(ctx, vec2.add(b, d), vec2.sub(b, n));
};

export const lineStrip = (ctx: CanvasRenderingContext2D, a: vec2.Vec2[]): void => {
    ctx.beginPath();
    ctx.moveTo(a[0][0], a[0][1]);
    a.forEach((p, i) => {
        if (i === 0) return;
        ctx.lineTo(p[0], p[1]);
    });
    stroke(ctx, false);
};

export const lineLoop = (ctx: CanvasRenderingContext2D, a: vec2.Vec2[], fill: boolean): void => {
    ctx.beginPath();
    ctx.moveTo(a[0][0], a[0][1]);
    a.forEach((p, i) => {
        if (i === 0) return;
        ctx.lineTo(p[0], p[1]);
    });
    ctx.lineTo(a[0][0], a[0][1]);
    stroke(ctx, fill);
};

export const lineStrips = (ctx: CanvasRenderingContext2D, a: vec2.Vec2[][]): void => {
    ctx.beginPath();
    a.forEach(b => {
        ctx.moveTo(b[0][0], b[0][1]);
        b.forEach((p, i) => {
            if (i === 0) return;
            ctx.lineTo(p[0], p[1]);
        });
    });
    stroke(ctx, false);
};

export const square = (ctx: CanvasRenderingContext2D, fill: boolean): void => {
    lineLoop(
        ctx,
        [
            [0.5, 0.5],
            [-0.5, 0.5],
            [-0.5, -0.5],
            [0.5, -0.5]
        ],
        fill
    );
};

export const rect = (ctx: CanvasRenderingContext2D, a: vec2.Vec2, b: vec2.Vec2, fill: boolean): void => {
    ctx.beginPath();
    lineLoop(
        ctx,
        [
            [a[0], a[1]],
            [a[0], b[1]],
            [b[0], b[1]],
            [b[0], a[1]]
        ],
        fill
    );
    stroke(ctx, false);
};

export const circle = (
    ctx: CanvasRenderingContext2D,
    v: vec2.Vec2,
    r: number,
    fill: boolean,
    angleFrom: number,
    angleTo: number
): void => {
    ctx.beginPath();
    transform.push(ctx);
    transform.translate(ctx, [v[0], v[1]]);
    transform.scale(ctx, [r, r]);
    ctx.moveTo(1, 0);
    ctx.arc(0, 0, 1, angleFrom, angleTo);
    transform.pop(ctx);
    stroke(ctx, fill);
};

export const s = (ctx: CanvasRenderingContext2D, v: vec2.Vec2, r: number): void => {
    ctx.beginPath();
    ctx.moveTo(v[0], v[1]);
    ctx.arc(v[0] - r / 2, v[1], r / 2, 0, Math.PI);
    ctx.moveTo(v[0], v[1]);
    ctx.arc(v[0] + r / 2, v[1], r / 2, -Math.PI, 0);
    stroke(ctx, false);
};

export const text = (ctx: CanvasRenderingContext2D, t: string, size: number, textAlign: CanvasTextAlign): void => {
    transform.push(ctx);
    ctx.font = "100px Courier";
    ctx.textAlign = textAlign;
    transform.scale(ctx, [0.01 * size, 0.01 * size]);
    transform.translate(ctx, [0, 25]);
    const lines = t.split("\n");
    transform.translate(ctx, [0, -0.5 * 100 * (lines.length - 1)]);
    lines.forEach(l => {
        ctx.fillText(l, 0, 0);
        transform.translate(ctx, [0, 100]);
    });
    transform.pop(ctx);
};

export type IconType = "o" | "+" | "square" | "arrow" | "sword";

export const icon = (ctx: CanvasRenderingContext2D, v: vec2.Vec2, r: number, type: IconType, filled: boolean): void => {
    transform.context(ctx, () => {
        transform.translate(ctx, v);
        transform.scale(ctx, [r, r]);
        if (type === "o") return circle(ctx, [0, 0], 1, filled, 0, 2 * Math.PI);
        if (type === "+")
            return lineStrips(ctx, [
                [
                    [-1, 0],
                    [1, 0]
                ],
                [
                    [0, -1],
                    [0, 1]
                ]
            ]);
        if (type === "square") return square(ctx, filled);
        if (type === "arrow") {
            line(ctx, [-0.5, 0], [0.5, 0]);
            line(ctx, [-0.5, 0], [-0.6, -0.1]);
            line(ctx, [-0.5, 0], [-0.6, 0.1]);
            line(ctx, [-0.4, 0], [-0.5, -0.1]);
            line(ctx, [-0.4, 0], [-0.5, 0.1]);
            line(ctx, [0.5, 0], [0.4, -0.1]);
            line(ctx, [0.5, 0], [0.4, 0.1]);
            return;
        }
        if (type === "sword") {
            line(ctx, [-0.5, 0], [0.5, 0]);
            line(ctx, [-0.2, -0.2], [-0.2, 0.2]);
            return;
        }
    });
};

export const image = (ctx: CanvasRenderingContext2D, img: HTMLImageElement): void => {
    const aspectRatio = img.width / img.height;
    transform.context(ctx, () => {
        transform.translate(ctx, [-aspectRatio / 2, -0.5]);
        ctx.drawImage(img, 0, 0, aspectRatio, 1);
    });
};
