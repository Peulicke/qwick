import { lerp } from "@peulicke/algorithms/basic";
import { vec2 } from "@peulicke/geometry";

const lerp2 = (v00: number, v10: number, v01: number, v11: number, w: vec2.Vec2) =>
    lerp(lerp(v00, v10, w[0]), lerp(v01, v11, w[0]), w[1]);

export const get = <T>(matrix: T[][], pos: vec2.Vec2, defaultValue: T): T =>
    (matrix[pos[0]] ?? [])[pos[1]] ?? defaultValue;

export const set = <T>(matrix: T[][], pos: vec2.Vec2, value: T): void => {
    matrix[pos[0]][pos[1]] = value;
};

export const getValue = (matrix: number[][], pos: vec2.Vec2, defaultValue = 0): number => {
    const i = Math.floor(pos[0]);
    const j = Math.floor(pos[1]);
    return lerp2(
        (matrix[i] ?? [])[j] ?? defaultValue,
        (matrix[i + 1] ?? [])[j] ?? defaultValue,
        (matrix[i] ?? [])[j + 1] ?? defaultValue,
        (matrix[i + 1] ?? [])[j + 1] ?? defaultValue,
        vec2.sub(pos, [i, j])
    );
};

export const getGradient = (matrix: number[][], pos: vec2.Vec2, defaultValue = 0): vec2.Vec2 => {
    const x1 = getValue(matrix, vec2.add(pos, [-0.5, 0]), defaultValue);
    const x2 = getValue(matrix, vec2.add(pos, [0.5, 0]), defaultValue);
    const y1 = getValue(matrix, vec2.add(pos, [0, -0.5]), defaultValue);
    const y2 = getValue(matrix, vec2.add(pos, [0, 0.5]), defaultValue);
    return [x2 - x1, y2 - y1];
};

export const addValue = (matrix: number[][], pos: vec2.Vec2, amount: number): void => {
    if (matrix[pos[0]] == undefined) return;
    if (matrix[pos[0]][pos[1]] == undefined) return;
    matrix[pos[0]][pos[1]] += amount;
};

export const addValueInterpolated = (matrix: number[][], pos: vec2.Vec2, amount: number): void => {
    const i = Math.floor(pos[0]);
    const j = Math.floor(pos[1]);
    const u = pos[0] - i;
    const v = pos[1] - j;
    addValue(matrix, [i, j], (1 - u) * (1 - v) * amount);
    addValue(matrix, [i + 1, j], u * (1 - v) * amount);
    addValue(matrix, [i, j + 1], (1 - u) * v * amount);
    addValue(matrix, [i + 1, j + 1], u * v * amount);
};
