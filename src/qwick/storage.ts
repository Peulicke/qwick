export const createStorage = () => {
    const getCompletedLevels = (): Set<number> => new Set(JSON.parse(localStorage.getItem(location.pathname) ?? "[]"));

    const setLevelCompleted = (levelNum: number): void =>
        localStorage.setItem(location.pathname, JSON.stringify([...new Set([...getCompletedLevels(), levelNum])]));

    return {
        getCompletedLevels,
        setLevelCompleted
    };
};

export type Storage = ReturnType<typeof createStorage>;
