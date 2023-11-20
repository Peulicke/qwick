export const forEachPair = <T>(list: T[], func: (a: T, b: T) => void): void => {
    for (let i = 0; i < list.length; ++i) {
        for (let j = i + 1; j < list.length; ++j) {
            func(list[i], list[j]);
        }
    }
};

export const spliceWhere = <T>(list: T[], condition: (t: T) => boolean): T[] => {
    const spliced: T[] = [];
    for (let i = list.length - 1; i >= 0; --i) {
        if (condition(list[i])) spliced.push(...list.splice(i, 1));
    }
    return spliced;
};

export const sum = (array: number[]): number => array.reduce((s, v) => s + v, 0);

export const mean = (array: number[]): number => sum(array) / array.length;

export const lerp = (a: number, b: number, w: number) => a * (1 - w) + b * w;
