import * as vec2 from "./vec2";

export type Grid<T> = T[][];

export const create = <T>(size: vec2.Vec2, value: T): Grid<T> =>
    [...Array(size[0])].map(() => [...Array(size[1])].map(() => value));

export const map = <T1, T2>(grid: Grid<T1>, func: (value: T1, pos: vec2.Vec2) => T2): Grid<T2> =>
    grid.map((row, i) => row.map((value, j) => func(value, [i, j])));

export const getNearestCell = <T>(grid: Grid<T>, pos: vec2.Vec2): T | undefined =>
    (grid[Math.round(pos[0])] ?? [])[Math.round(pos[1])];

export const transpose = <T>(grid: Grid<T>) => grid[0].map((_, i) => grid.map((_, j) => grid[j][i]));
