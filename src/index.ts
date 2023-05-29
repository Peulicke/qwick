import createQwick, { Qwick, InputType, Graphics } from "./qwick";

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
                draw: (graphics: Graphics) => {
                    graphics.at([-0.25 * graphics.getAspectRatio(), 0], () => {
                        graphics.text("test text", 0.1);
                    });
                    graphics.at([0.25 * graphics.getAspectRatio(), 0], () => {
                        graphics.arrow([0, 0], [-0.1, -0.1]);
                    });
                }
            };
        },
        resize: () => {
            console.log("resize:", qwick.width, qwick.height);
        }
    };
};

createQwick(loadGame);
