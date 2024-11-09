import TinyQueue from "tinyqueue";
import * as vec2 from "./vec2";

export type Grid<T> = T[][];

export const create = <T>(size: vec2.Vec2, getValue: (pos: vec2.Vec2) => T): Grid<T> =>
    [...Array(size[0])].map((_, i) => [...Array(size[1])].map((_, j) => getValue([i, j])));

export const map = <T1, T2>(grid: Grid<T1>, func: (value: T1, pos: vec2.Vec2) => T2): Grid<T2> =>
    grid.map((row, i) => row.map((value, j) => func(value, [i, j])));

export const setCell = <T>(grid: Grid<T>, pos: vec2.Vec2, value: T): void => {
    if (pos[0] < 0 || pos[0] >= grid.length) return;
    if (pos[1] < 0 || pos[1] >= grid[0].length) return;
    (grid[pos[0]] ?? [])[pos[1]] = value;
};

export const getCell = <T>(grid: Grid<T>, pos: vec2.Vec2, getDefaultValue: (pos: vec2.Vec2) => T): T => {
    const value = (grid[pos[0]] ?? [])[pos[1]];
    if (value === undefined) return getDefaultValue(pos);
    return value;
};

export const getNearestCell = <T>(grid: Grid<T>, pos: vec2.Vec2, getDefaultValue: (pos: vec2.Vec2) => T): T =>
    getCell(grid, vec2.round(pos), getDefaultValue);

export const transpose = <T>(grid: Grid<T>) => grid[0].map((_, i) => grid.map((_, j) => grid[j][i]));

export const stringToGrid = (s: string) =>
    transpose(
        s
            .trim()
            .split("\n")
            .map(line => line.split(""))
    );

export const gridToString = (grid: string[][]) =>
    transpose(grid)
        .map(line => line.join(""))
        .join("\n");

export const getSize = <T>(grid: Grid<T>): vec2.Vec2 => [grid.length, grid[0]?.length ?? 0];

export const getBoundingBox = <T>(grid: Grid<T>): vec2.Rect => [[0, 0], getSize(grid)];

export const resize = <T>(grid: Grid<T>, size: vec2.Vec2, getDefaultValue: (pos: vec2.Vec2) => T): Grid<T> =>
    create(size, pos => getCell(grid, pos, getDefaultValue));

const generatePath = (map: Grid<vec2.Vec2>, start: vec2.Vec2): vec2.Vec2[] => {
    const nextPos = getCell(map, start, () => start);
    if (vec2.equals(nextPos, start)) return [];
    return [nextPos, ...generatePath(map, nextPos)];
};

export const aStar = (start: vec2.Vec2, targets: vec2.Vec2[], walls: Grid<boolean>): vec2.Vec2[] => {
    const checked = create(getSize(walls), () => false);
    const map = create<vec2.Vec2>(getSize(walls), pos => pos);
    const queue = new TinyQueue(
        targets.map(pos => ({ pos, prevPos: pos, dist: 0, totalDistEstimate: vec2.dist(pos, start) })),
        (a, b) => a.totalDistEstimate - b.totalDistEstimate
    );
    while (queue.length > 0) {
        const next = queue.pop();
        if (next === undefined) break;
        const { pos, prevPos, dist } = next;
        if (getCell(checked, pos, () => true)) continue;
        setCell(checked, pos, true);
        setCell(map, pos, prevPos);
        if (vec2.equals(pos, start)) break;
        vec2.gridEdges(pos).forEach(({ p }) => {
            if (getCell(walls, p, () => true)) return;
            queue.push({
                prevPos: pos,
                pos: p,
                dist: dist + 1,
                totalDistEstimate: dist + 1 + vec2.dist(p, start)
            });
        });
    }
    return generatePath(map, start);
};
