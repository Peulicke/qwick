import { vec2 } from ".";
import { Vec2, dist, mean, rotate, sum } from "./vec2";

const epsilon = 1e-10;

describe("unique", () => {
    it("returns empty array", () => {
        expect(vec2.unique([])).toStrictEqual([]);
    });

    it("returns 1 item", () => {
        expect(
            vec2.unique([
                [0, 0],
                [0, 0]
            ])
        ).toStrictEqual([[0, 0]]);
    });

    it("returns 2 items", () => {
        expect(
            vec2.unique([
                [0, 0],
                [1, 0],
                [0, 0],
                [1, 0],
                [1, 0],
                [0, 0],
                [0, 0]
            ])
        ).toStrictEqual([
            [0, 0],
            [1, 0]
        ]);
    });
});

describe("sum", () => {
    it("sums up 0 elements", () => {
        expect(sum([])).toStrictEqual([0, 0]);
    });
    it("sums up 1 element", () => {
        expect(sum([[1, 2]])).toStrictEqual([1, 2]);
    });
    it("sums up 3 elements", () => {
        expect(
            sum([
                [1, 2],
                [3, 4],
                [5, 6]
            ])
        ).toStrictEqual([9, 12]);
    });
});

describe("mean", () => {
    it("calculates the mean of 1 element", () => {
        expect(mean([[1, 2]])).toStrictEqual([1, 2]);
    });
    it("calculates the mean of 3 elements", () => {
        expect(
            mean([
                [1, 2],
                [3, 4],
                [5, 6]
            ])
        ).toStrictEqual([3, 4]);
    });
});

describe("rotation", () => {
    it("rotates 0", () => {
        expect(rotate([1, 1], 0)).toStrictEqual([1, 1]);
    });
    it("rotates pi/2", () => {
        const v: Vec2 = [1, 1];
        const rotated = rotate(v, Math.PI / 2);
        const expected: Vec2 = [-1, 1];
        const error = dist(rotated, expected);
        expect(error).toBeLessThan(epsilon);
    });
});
