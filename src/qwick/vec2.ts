export type Vec2 = [number, number];

export const equals = (a: Vec2, b: Vec2): boolean => a[0] === b[0] && a[1] === b[1];

export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];

export const mid = (a: Vec2, b: Vec2): Vec2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

export const length = (a: Vec2): number => Math.sqrt(a[0] ** 2 + a[1] ** 2);

export const scale = (a: Vec2, n: number): Vec2 => [a[0] * n, a[1] * n];

export const normalize = (a: Vec2): Vec2 => {
    const l = length(a);
    if (l === 0) return a;
    return scale(a, 1 / l);
};

export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];

export const cross = (a: Vec2): Vec2 => [-a[1], a[0]];

export const getAngle = (a: Vec2): number => Math.atan2(a[1], a[0]);

export const averageDirection = (a: Vec2, b: Vec2): Vec2 => normalize(add(normalize(a), normalize(b)));

export const lerp = (a: Vec2, b: Vec2, w: number): Vec2 => add(scale(a, 1 - w), scale(b, w));

export const negate = (a: Vec2): Vec2 => [-a[0], -a[1]];

export const proj = (a: Vec2, b: Vec2): Vec2 => {
    const nb = normalize(b);
    return scale(nb, dot(a, nb));
};

export const dist = (a: Vec2, b: Vec2): number => length(sub(b, a));

export const dir = (a: Vec2, b: Vec2): Vec2 => normalize(sub(b, a));