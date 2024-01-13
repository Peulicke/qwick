import { vec2 } from ".";

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
