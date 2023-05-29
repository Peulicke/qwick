import createQwick, { Qwick, InputType, Graphics } from "./qwick";

type LevelData = string;

const loadGame = (qwick: Qwick) => {
    return {
        levels: ["a", "b", "c"],
        loadLevel: (levelData: LevelData) => {
            let angle = 0;
            console.log(levelData);
            return {
                input: (type: InputType, down: boolean) => {
                    console.log("input", type, down);
                },
                update: () => {
                    angle += 0.01;
                },
                draw: (graphics: Graphics) => {
                    graphics.context(() => {
                        graphics.color("red");
                        graphics.translate([-0.25 * graphics.getAspectRatio(), 0]);
                        graphics.text("test text", 0.1);
                    });
                    graphics.context(() => {
                        graphics.translate(qwick.getMousePos());
                        graphics.scale(0.1);
                        graphics.rotate(angle);
                        graphics.square();
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
