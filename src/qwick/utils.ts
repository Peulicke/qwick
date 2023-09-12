export const forEachPair = <T>(list: T[], func: (a: T, b: T) => void): void => {
    for (let i = 0; i < list.length; ++i) {
        for (let j = i + 1; j < list.length; ++j) {
            func(list[i], list[j]);
        }
    }
};
