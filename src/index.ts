import createQwick, { Qwick, InputType } from "./qwick"

type LevelData = string;

const loadGame = (qwick: Qwick) => {
    return {
        levels: ["a", "b", "c"],
        loadLevel: (levelData: LevelData) => {
            console.log(levelData);
            return {
                input: (type: InputType, down: boolean) => {
                    console.log("input", type, down);
                },
                update: () => {
                    console.log("update");
                },
                draw: () => {
                    console.log("draw");
                }
            }
        },
        resize: () => {
            console.log("resize");
        }
    }
}

createQwick(loadGame);
