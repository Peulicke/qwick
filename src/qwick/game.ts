import { Level, defaultLevel } from "./level";
import { ShowOptions, defaultShowOptions } from "./showOptions";

export type Game<LevelData> = {
    name: string;
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    resize: () => void;
    backgroundColor: string;
    show: ShowOptions;
};

export type PartialGame<LevelData> = Partial<Omit<Game<LevelData>, "loadLevel" | "show">> & {
    loadLevel?: (ld: LevelData) => Partial<Level>;
    show?: Partial<ShowOptions>;
};

export const fromPartialGame = <LevelData>(partialGame: PartialGame<LevelData>): Game<LevelData> => ({
    name: "Name of the game",
    levels: [],
    resize: () => {},
    backgroundColor: "#60b1c7",
    ...partialGame,
    loadLevel: (ld: LevelData): Level => {
        if (partialGame.loadLevel === undefined) return defaultLevel();
        const level = partialGame.loadLevel(ld);
        if (level === undefined) return defaultLevel();
        return { ...defaultLevel(), ...level };
    },
    show: {
        ...defaultShowOptions(),
        ...partialGame.show
    }
});
