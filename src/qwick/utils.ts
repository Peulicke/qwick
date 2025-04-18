export const forEachPair = <T>(list: T[], func: (a: T, b: T) => void): void => {
    for (let i = 0; i < list.length; ++i) {
        for (let j = i + 1; j < list.length; ++j) {
            func(list[i], list[j]);
        }
    }
};

export const deleteWhere = <T>(list: T[], condition: (t: T) => boolean): T[] => {
    const deleted: T[] = [];
    for (let i = list.length - 1; i >= 0; --i) {
        if (condition(list[i])) deleted.push(...list.splice(i, 1));
    }
    return deleted;
};

export const sum = (array: number[]): number => array.reduce((s, v) => s + v, 0);

export const mean = (array: number[]): number => sum(array) / array.length;

export const lerp = (a: number, b: number, w: number) => a * (1 - w) + b * w;

export const getMinObj = <T>(objects: T[], getValue: (t: T) => number): T | undefined => {
    let minValue = Infinity;
    let result: T | undefined = undefined;
    objects.forEach(object => {
        const value = getValue(object);
        if (value > minValue) return;
        minValue = value;
        result = object;
    });
    return result;
};

export const swap = <T>(objects: T[], i: number, j: number) => {
    const [oi, oj] = [objects[i], objects[j]];
    [objects[i], objects[j]] = [oj, oi];
};

export const shuffle = <T>(objects: T[], randInt: (min: number, max: number) => number) => {
    for (let i = 0; i + 1 < objects.length; ++i) {
        swap(objects, i, randInt(i + 1, objects.length - 1));
    }
};

export const clamp = (value: number, from: number, to: number): number => Math.min(Math.max(value, from), to);
