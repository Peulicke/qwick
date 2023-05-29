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
                    console.log("draw");
                    graphics.arrow([0, qwick.height], [100, -100]);
                    graphics.push();
                    graphics.translate([100, 100]);
                    graphics.scale([50, 50]);
                    graphics.text("test text");
                    graphics.pop();
                }
            };
        },
        resize: () => {
            console.log("resize:", qwick.width, qwick.height);
        }
    };
};

createQwick(loadGame);
