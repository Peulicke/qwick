import { ShowOptions } from ".";
import { Level } from "./level";

export type Game<LevelData> = {
    name: string;
    levels: LevelData[];
    loadLevel: (ld: LevelData) => Level;
    resize: () => void;
    backgroundColor: string;
    useNormalizedCoordinates: boolean;
    show: ShowOptions;
};

export type PartialGame<LevelData> = Partial<Omit<Game<LevelData>, "loadLevel" | "show">> & {
    loadLevel?: (ld: LevelData) => Partial<Level>;
    show?: Partial<ShowOptions>;
};
