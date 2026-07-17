import { type Level, defaultLevel } from "./level";
import { type LevelEditor } from "./level-editor";
import { type ShowOptions, defaultShowOptions } from "./show-options";
import { defaultUi } from "./ui";

export type Game<LevelData> = {
    name: string;
    levels: LevelData[];
    loadLevel: (ld: LevelData, isInteractingWithUi: () => boolean) => Level;
    loadLevelEditor: ((isInteractingWithUi: () => boolean) => LevelEditor<LevelData>) | undefined;
    resize: () => void;
    backgroundColor: string;
    show: ShowOptions;
};

export type PartialLevelEditor<LevelData> = Partial<
    Omit<LevelEditor<LevelData>, "getLevelData" | "setLevelData" | "show">
> & {
    getLevelData: () => LevelData;
    setLevelData: (levelData: LevelData) => void;
};

export type PartialGame<LevelData> = Partial<Omit<Game<LevelData>, "loadLevel" | "loadLevelEditor" | "show">> & {
    loadLevel?: (ld: LevelData, isInteractingWithUi: () => boolean) => Partial<Level>;
    loadLevelEditor?: (isInteractingWithUi: () => boolean) => PartialLevelEditor<LevelData>;
    show?: Partial<ShowOptions>;
};

export const fromPartialGame = <LevelData>(partialGame: PartialGame<LevelData>): Game<LevelData> => {
    const partialLoadLevelEditor = partialGame.loadLevelEditor;

    return {
        name: "Name of the game",
        levels: [],
        resize: () => {},
        backgroundColor: "#60b1c7",
        ...partialGame,
        loadLevel: (levelData, isInteractingWithUi) => ({
            ...defaultLevel(),
            ...(partialGame.loadLevel?.(levelData, isInteractingWithUi) ?? {})
        }),
        loadLevelEditor:
            partialLoadLevelEditor === undefined
                ? undefined
                : isInteractingWithUi => ({
                      ...defaultUi(),
                      menuInputs: [],
                      menuItems: [],
                      ...partialLoadLevelEditor(isInteractingWithUi)
                  }),
        show: {
            ...defaultShowOptions(),
            ...partialGame.show
        }
    };
};
