import * as vec2 from "../vec2";
import * as transform from "./transform";

const stroke = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.stroke();
    ctx.restore();
};

export const line = (ctx: CanvasRenderingContext2D, a: vec2.Vec2, b: vec2.Vec2): void => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    stroke(ctx);
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
    stroke(ctx);
};

export const lineLoop = (ctx: CanvasRenderingContext2D, a: vec2.Vec2[]): void => {
    ctx.beginPath();
    ctx.moveTo(a[0][0], a[0][1]);
    a.forEach((p, i) => {
        if (i === 0) return;
        ctx.lineTo(p[0], p[1]);
    });
    ctx.lineTo(a[0][0], a[0][1]);
    stroke(ctx);
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
    stroke(ctx);
};

export const square = (ctx: CanvasRenderingContext2D): void => {
    lineStrip(ctx, [
        [0.5, 0.5],
        [-0.5, 0.5],
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5]
    ]);
};

export const rect = (ctx: CanvasRenderingContext2D, a: vec2.Vec2, b: vec2.Vec2): void => {
    ctx.beginPath();
    lineStrip(ctx, [
        [a[0], a[1]],
        [a[0], b[1]],
        [b[0], b[1]],
        [b[0], a[1]],
        [a[0], a[1]]
    ]);
    stroke(ctx);
};

export const circle = (ctx: CanvasRenderingContext2D, v: vec2.Vec2, r: number): void => {
    ctx.beginPath();
    transform.push(ctx);
    transform.translate(ctx, [v[0], v[1]]);
    transform.scale(ctx, r);
    ctx.moveTo(1, 0);
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    transform.pop(ctx);
    stroke(ctx);
};

export const s = (ctx: CanvasRenderingContext2D, v: vec2.Vec2, r: number): void => {
    ctx.beginPath();
    ctx.moveTo(v[0], v[1]);
    ctx.arc(v[0] - r / 2, v[1], r / 2, 0, Math.PI);
    ctx.moveTo(v[0], v[1]);
    ctx.arc(v[0] + r / 2, v[1], r / 2, -Math.PI, 0);
    stroke(ctx);
};

export const text = (ctx: CanvasRenderingContext2D, t: string, size: number): void => {
    transform.push(ctx);
    ctx.font = "100px Arial";
    ctx.textAlign = "center";
    transform.scale(ctx, 0.01 * size);
    transform.translate(ctx, [0, 25]);
    ctx.fillText(t, 0, 0);
    transform.pop(ctx);
};