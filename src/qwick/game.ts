import { type Level, defaultLevel } from "./level";
import { type LevelEditor } from "./level-editor";
import { type ShowOptions, defaultShowOptions } from "./show-options";

export type Game<LevelData> = {
    name: string;
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    loadLevelEditor?: () => LevelEditor<LevelData>;
    resize: () => void;
    backgroundColor: string;
    show: ShowOptions;
};

export type PartialGame<LevelData> = Partial<Omit<Game<LevelData>, "loadLevel" | "loadLevelEditor" | "show">> & {
    loadLevel?: (ld: LevelData) => Partial<Level>;
    loadLevelEditor?: () => LevelEditor<LevelData>;
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
