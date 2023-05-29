import createQwick, { Qwick, InputType, Graphics } from "./qwick";

const transpose = <T>(grid: T[][]) => grid[0].map((_, i) => grid.map((_, j) => grid[j][i]));

const stringToGrid = <T>(s: string, transformer: (char: string) => T) =>
    transpose(
        s
            .trim()
            .split("\n")
            .map(line => line.split("").map(transformer))
    );

type LevelData = {
    walls: boolean[][];
};

const level1 = {
    walls: stringToGrid(
        `
##############
#....#.......#
#....#.......#
#....#.......#
#............#
#......####..#
#......#.....#
#......#.....#
##############
`,
        char => char === "#"
    )
};

const levels: LevelData[] = [level1];

const loadGame = (qwick: Qwick) => {
    return {
        levels,
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
                        const border = 0.2;
                        graphics.scale((1 - border) / levelData.walls[0].length);
                        graphics.translate([-(levelData.walls.length - 1) / 2, -(levelData.walls[0].length - 1) / 2]);
                        levelData.walls.forEach((row, x) => {
                            row.forEach((hasWall, y) => {
                                if (!hasWall) return;
                                graphics.context(() => {
                                    graphics.translate([x, y]);
                                    graphics.square();
                                });
                            });
                        });
                    });
                    graphics.context(() => {
                        graphics.color("#800000");
                        graphics.translate([0, -0.45]);
                        graphics.text("Battle game test", 0.05);
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
