import { Grid } from "./grid";

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

export const resize = (v: Vec2, l: number): Vec2 => scale(normalize(v), l);

export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];

export const cross = (a: Vec2): Vec2 => [-a[1], a[0]];

export const getAngle = (a: Vec2): number => Math.atan2(a[1], a[0]);

export const averageDirection = (a: Vec2, b: Vec2): Vec2 => normalize(add(normalize(a), normalize(b)));

export const multiply = (a: Vec2, b: Vec2): Vec2 => [a[0] * b[0], a[1] * b[1]];

export const divide = (a: Vec2, b: Vec2): Vec2 => [a[0] / b[0], a[1] / b[1]];

export const lerp = (a: Vec2, b: Vec2, w: number): Vec2 => add(scale(a, 1 - w), scale(b, w));

export const negate = (a: Vec2): Vec2 => [-a[0], -a[1]];

export const proj = (a: Vec2, b: Vec2): Vec2 => {
    const nb = normalize(b);
    return scale(nb, dot(a, nb));
};

export const projOnLine = (v: Vec2, lineStart: Vec2, lineDir: Vec2): Vec2 =>
    add(proj(sub(v, lineStart), lineDir), lineStart);

export const dist = (a: Vec2, b: Vec2): number => length(sub(b, a));

export const dir = (a: Vec2, b: Vec2, l: number): Vec2 => scale(normalize(sub(b, a)), l);

export const floor = (v: Vec2): Vec2 => [Math.floor(v[0]), Math.floor(v[1])];

export const round = (v: Vec2): Vec2 => [Math.round(v[0]), Math.round(v[1])];

export const getNearestObject = <T>(obj: T, allObjs: T[], pos: (t: T) => Vec2): T | undefined => {
    let result: T | undefined = undefined;
    let minDist = Infinity;
    for (const o of allObjs) {
        if (o === obj) continue;
        const d = dist(pos(obj), pos(o));
        if (d > minDist) continue;
        minDist = d;
        result = o;
    }
    return result;
};

export const getNearest = (v: Vec2, all: Vec2[]) => getNearestObject(v, all, t => t);

export const resolveCollision = (pos: Vec2, collisionPoint: Vec2, radius: number): Vec2 => {
    const d = sub(pos, collisionPoint);
    const l = length(d);
    if (l > radius) return pos;
    return add(collisionPoint, scale(d, radius / l));
};

export const edgeDirs = (): Vec2[] => [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
];

export const cornerDirs = (): Vec2[] => [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1]
];

export const gridEdges = (pos: Vec2) => edgeDirs().map(n => ({ n, p: add(pos, n) }));

export const gridCorners = (pos: Vec2) => cornerDirs().map(n => ({ n, p: add(pos, n) }));

export const gridNeighbors = (pos: Vec2 = [0, 0]) => [
    ...gridEdges(pos).map(({ n, p }) => ({ n, p, isEdge: true })),
    ...gridCorners(pos).map(({ n, p }) => ({ n, p, isEdge: false }))
];

export const sizeOfGrid = <T>(grid: Grid<T>): Vec2 => [grid.length, grid[0].length];

export const unique = (vList: Vec2[]): Vec2[] => {
    const result: Vec2[] = [];
    const exists: Map<number, Set<number>> = new Map();
    vList.forEach(v => {
        const [x, y] = v;
        if (!exists.has(x)) exists.set(x, new Set());
        if (exists.get(x)?.has(y)) return;
        exists.get(x)?.add(y);
        result.push([x, y]);
    });
    return result;
};
