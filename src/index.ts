import createQwick, { Qwick, InputType, Graphics } from "./qwick";
import * as vec2 from "./qwick/vec2";

const transpose = <T>(grid: T[][]) => grid[0].map((_, i) => grid.map((_, j) => grid[j][i]));

const stringToGrid = (s: string) =>
    transpose(
        s
            .trim()
            .split("\n")
            .map(line => line.split(""))
    );

const teamColors = ["#008000", "#800000"];

type AreaType = "none" | "wall" | "placable";

const charToAreaType = {
    ".": "none",
    "#": "wall",
    "0": "placable",
    s: "none",
    b: "none"
};

type UnitType = "sword" | "bow";

type Unit = {
    team: number;
    type: UnitType;
    pos: vec2.Vec2;
};

type LevelData = {
    areas: string;
    ownUnitTypes: UnitType[];
};

const level1: LevelData = {
    areas: `
##############
#0000#.......#
#0000#...s...#
#0000#....b..#
#0000........#
#0000..####..#
#0000..#.....#
#0000..#.....#
##############
`,
    ownUnitTypes: ["sword", "sword", "bow"]
};

const levels: LevelData[] = [level1];

const insideRect = (pos: vec2.Vec2, rectPos: vec2.Vec2, rectSize: vec2.Vec2) => {
    const dPos = vec2.sub(pos, rectPos);
    return Math.abs(dPos[0]) < rectSize[0] && Math.abs(dPos[1]) < rectSize[1];
};

const loadGame = (qwick: Qwick) => {
    return {
        levels,
        loadLevel: (levelData: LevelData) => {
            const grid = stringToGrid(levelData.areas);

            const areas = grid.map(row => row.map(char => charToAreaType[char]));

            const units = levelData.ownUnitTypes.map(
                (type, i): Unit => ({
                    team: 0,
                    type,
                    pos: [-2, Math.floor((areas[0].length - 1) / 2 + (i - (levelData.ownUnitTypes.length - 1) / 2))]
                })
            );

            grid.forEach((row, i) =>
                row.forEach((c, j) => {
                    const pos: vec2.Vec2 = [i, j];
                    if (c === "s")
                        units.push({
                            team: 1,
                            type: "sword",
                            pos
                        });
                    if (c === "b")
                        units.push({
                            team: 1,
                            type: "bow",
                            pos
                        });
                })
            );

            const border = 0.25;
            const boardScale = (1 - border) / areas[0].length;
            const boardTranslate: vec2.Vec2 = [-(areas.length - 1) / 2, -(areas[0].length - 1) / 2];
            const getMousePos = () => vec2.sub(vec2.scale(qwick.getMousePos(), 1 / boardScale), boardTranslate);
            let selectedUnitIndex = -1;
            let selectOffset: vec2.Vec2 = [0, 0];
            const forEachAreaOfType = (type: AreaType, func: (pos: vec2.Vec2) => void) => {
                areas.forEach((row, x) => {
                    row.forEach((t, y) => {
                        if (t === type) func([x, y]);
                    });
                });
            };

            const startButtonPos: vec2.Vec2 = [0, 0.45];
            const startButtonSize: vec2.Vec2 = [0.1, 0.04];

            let started = false;

            return {
                input: (type: InputType, down: boolean) => {
                    if (type !== "lmb") return;
                    if (down) {
                        if (insideRect(qwick.getMousePos(), startButtonPos, startButtonSize)) started = !started;
                    }
                    if (started) return;
                    if (down) {
                        units.forEach((unit, i) => {
                            if (unit.team !== 0) return;
                            if (vec2.dist(getMousePos(), unit.pos) > 0.5) return;
                            selectedUnitIndex = i;
                            selectOffset = vec2.sub(unit.pos, getMousePos());
                        });
                    } else if (selectedUnitIndex !== -1) {
                        units[selectedUnitIndex].pos = vec2.round(units[selectedUnitIndex].pos);
                        selectedUnitIndex = -1;
                    }
                },
                update: () => {
                    if (started) {
                        units.forEach(unit => {
                            unit.pos[0] += 0.001;
                        });
                    } else {
                        if (selectedUnitIndex !== -1) {
                            units[selectedUnitIndex].pos = vec2.add(getMousePos(), selectOffset);
                        }
                    }
                },
                draw: (graphics: Graphics) => {
                    graphics.context(() => {
                        graphics.scale(boardScale);
                        graphics.translate(boardTranslate);
                        forEachAreaOfType("placable", pos => {
                            graphics.context(() => {
                                graphics.color("#444444");
                                graphics.translate(pos);
                                graphics.square(true);
                            });
                        });
                        forEachAreaOfType("wall", pos => {
                            graphics.context(() => {
                                graphics.translate(pos);
                                graphics.square(false);
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
                    graphics.context(() => {
                        graphics.translate(startButtonPos);
                        graphics.text(started ? "Stop" : "Start", 0.05);
                        graphics.rect(vec2.negate(startButtonSize), startButtonSize, false);
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
