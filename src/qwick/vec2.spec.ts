import * as vec2 from "./vec2";

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
        expect(vec2.sum([])).toStrictEqual([0, 0]);
    });
    it("sums up 1 element", () => {
        expect(vec2.sum([[1, 2]])).toStrictEqual([1, 2]);
    });
    it("sums up 3 elements", () => {
        expect(
            vec2.sum([
                [1, 2],
                [3, 4],
                [5, 6]
            ])
        ).toStrictEqual([9, 12]);
    });
});

describe("mean", () => {
    it("calculates the mean of 1 element", () => {
        expect(vec2.mean([[1, 2]])).toStrictEqual([1, 2]);
    });
    it("calculates the mean of 3 elements", () => {
        expect(
            vec2.mean([
                [1, 2],
                [3, 4],
                [5, 6]
            ])
        ).toStrictEqual([3, 4]);
    });
});

describe("rotation", () => {
    it("rotates 0", () => {
        expect(vec2.rotate([1, 1], 0)).toStrictEqual([1, 1]);
    });
    it("rotates pi/2", () => {
        const v: vec2.Vec2 = [1, 1];
        const rotated = vec2.rotate(v, Math.PI / 2);
        const expected: vec2.Vec2 = [-1, 1];
        const error = vec2.dist(rotated, expected);
        expect(error).toBeLessThan(epsilon);
    });
});

it("clamps", () => {
    expect(vec2.clamp([10, 3], [0, 0], [5, 5])).toStrictEqual([5, 3]);
    expect(vec2.clamp([-3, -30], [-5, -5], [5, 5])).toStrictEqual([-3, -5]);
});
