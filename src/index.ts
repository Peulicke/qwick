import createQwick, { Qwick, InputType, Graphics } from "./qwick";
import * as vec2 from "./qwick/vec2";

const transpose = <T>(grid: T[][]) => grid[0].map((_, i) => grid.map((_, j) => grid[j][i]));

const stringToGrid = <T>(s: string, transformer: (char: string) => T) =>
    transpose(
        s
            .trim()
            .split("\n")
            .map(line => line.split("").map(transformer))
    );

const teamColors = ["#008000", "#800000"];

type UnitType = "sword" | "bow";

type Unit = {
    team: number;
    type: UnitType;
    pos: vec2.Vec2;
};

type LevelData = {
    walls: boolean[][];
    ownUnitTypes: UnitType[];
    opponentUnitTypes: UnitType[];
};

const level1: LevelData = {
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
    ),
    ownUnitTypes: ["sword", "sword", "bow"],
    opponentUnitTypes: ["sword", "bow"]
};

const levels: LevelData[] = [level1];

const loadGame = (qwick: Qwick) => {
    return {
        levels,
        loadLevel: (levelData: LevelData) => {
            const units: Unit[] = [
                ...levelData.ownUnitTypes.map(
                    (type, i): Unit => ({
                        team: 0,
                        type,
                        pos: [
                            -2,
                            Math.floor(
                                (levelData.walls[0].length - 1) / 2 + (i - (levelData.ownUnitTypes.length - 1) / 2)
                            )
                        ]
                    })
                ),
                ...levelData.opponentUnitTypes.map(
                    (type, i): Unit => ({
                        team: 1,
                        type,
                        pos: [
                            levelData.walls.length + 1,
                            Math.floor(
                                (levelData.walls[0].length - 1) / 2 + (i - (levelData.opponentUnitTypes.length - 1) / 2)
                            )
                        ]
                    })
                )
            ];
            return {
                input: (type: InputType, down: boolean) => {
                    console.log("input", type, down);
                },
                update: () => {},
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
                        units.forEach(unit => {
                            graphics.context(() => {
                                graphics.color(teamColors[unit.team]);
                                if (unit.type === "bow") graphics.circle(unit.pos, 0.5);
                                if (unit.type === "sword") {
                                    graphics.translate(unit.pos);
                                    graphics.circle([0, 0], 0.5);
                                    graphics.lineStrips([
                                        [
                                            [-0.5, 0],
                                            [0.5, 0]
                                        ],
                                        [
                                            [0, -0.5],
                                            [0, 0.5]
                                        ]
                                    ]);
                                }
                            });
                        });
                    });
                    graphics.context(() => {
                        graphics.color("#800000");
                        graphics.translate([0, -0.45]);
                        graphics.text("Battle game test", 0.05);
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
