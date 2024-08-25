import random from "./random";

export type Vec3 = [number, number, number];

export const clone = (v: Vec3): Vec3 => [...v];

export const negate = (v: Vec3): Vec3 => [-v[0], -v[1], -v[2]];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const scale = (v: Vec3, n: number): Vec3 => [v[0] * n, v[1] * n, v[2] * n];

export const multiply = (a: Vec3, b: Vec3): Vec3 => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];

export const divide = (a: Vec3, b: Vec3): Vec3 => [a[0] / b[0], a[1] / b[1], a[2] / b[2]];

export const lerp = (a: Vec3, b: Vec3, w: number): Vec3 => add(scale(a, 1 - w), scale(b, w));

export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
];

export const length = (v: Vec3): number => Math.sqrt(dot(v, v));

export const proj = (a: Vec3, b: Vec3): Vec3 => scale(b, dot(a, b) / dot(b, b));

export const projPlane = (a: Vec3, b: Vec3): Vec3 => sub(a, proj(a, b));

export const min = (a: Vec3, b: Vec3): Vec3 => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])];

export const max = (a: Vec3, b: Vec3): Vec3 => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];

export const round = (v: Vec3): Vec3 => [Math.round(v[0]), Math.round(v[1]), Math.round(v[2])];

export const floor = (v: Vec3): Vec3 => [Math.floor(v[0]), Math.floor(v[1]), Math.floor(v[2])];

export const ceil = (v: Vec3): Vec3 => [Math.ceil(v[0]), Math.ceil(v[1]), Math.ceil(v[2])];

export const abs = (v: Vec3): Vec3 => [Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])];

export const normalize = (v: Vec3): Vec3 => {
    const l = length(v);
    if (l < 1e-10) return v;
    return scale(v, 1 / l);
};

export const rand = (amount: number): Vec3 => scale([random() - 0.5, random() - 0.5, random() - 0.5], amount * 2);

export const rotateX = (v: Vec3, angle: number): Vec3 => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]];
};

export const rotateY = (v: Vec3, angle: number): Vec3 => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [s * v[2] + c * v[0], v[1], c * v[2] - s * v[0]];
};

export const rotateZ = (v: Vec3, angle: number): Vec3 => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [c * v[0] - s * v[1], s * v[0] + c * v[1], v[2]];
};
