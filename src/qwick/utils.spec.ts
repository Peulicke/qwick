import { getMinObj } from "./utils";

it("gets the smallest value", () => {
    expect(getMinObj([2, 1, 3], v => v)).toBe(1);
});

it("gets the object with smallest value", () => {
    const object = { value: 1 };
    expect(getMinObj([{ value: 2 }, object, { value: 3 }], o => o.value)).toBe(object);
});
