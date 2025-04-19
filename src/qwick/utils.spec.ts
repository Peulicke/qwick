import { getMinObj, shuffle, swap } from "./utils";

it("gets the smallest value", () => {
    expect(getMinObj([2, 1, 3], v => v)).toBe(1);
});

it("gets the object with smallest value", () => {
    const object = { value: 1 };
    expect(getMinObj([{ value: 2 }, object, { value: 3 }], o => o.value)).toBe(object);
});

it("swaps", () => {
    const array = [1, 2];
    swap(array, 0, 1);
    expect(array).toStrictEqual([2, 1]);
});

it("shuffles", () => {
    const array = [1, 2, 3, 4];
    shuffle(array, () => 0);
    expect(array.length).toBe(4);
});
