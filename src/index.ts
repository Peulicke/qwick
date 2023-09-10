import createQwick, { Qwick, InputType, Graphics } from "./qwick";
import * as vec2 from "./qwick/vec2";
import * as vec3 from "./qwick/vec3";
import * as matrix from "./qwick/matrix";
import { createButton } from "./qwick/button";
import { hsv2rgb, rgb2hsv } from "./qwick/graphics/utils";

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

const charToAreaType: Record<string, AreaType> = {
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
    hpLost: number;
    chargeTime: number;
};

type Attack = {
    team: number;
    pos: vec2.Vec2;
    target: Unit;
    unitType: UnitType;
};

const createUnit = (team: number, type: UnitType, pos: vec2.Vec2): Unit => ({
    team,
    type,
    pos,
    hpLost: 0,
    chargeTime: 0
});

type UnitSpecs = {
    speed: number;
    range: number;
    rechargeTime: number;
    damage: number;
    hp: number;
};

const unitTypeToSpecs: Record<UnitType, UnitSpecs> = {
    sword: {
        speed: 0.01,
        range: 1,
        rechargeTime: 100,
        damage: 2,
        hp: 10
    },
    bow: {
        speed: 0.01,
        range: 3,
        rechargeTime: 100,
        damage: 1,
        hp: 3
    }
};

type LevelData = {
    areas: string;
    ownUnitTypes: UnitType[];
};

const level1: LevelData = {
    areas: `
##############
#0000#.......#
#0000#.......#
#0000#.......#
#0000........#
#0000..####..#
#0000..#sss..#
#0000..#ss...#
##############
`,
    ownUnitTypes: ["sword", "sword", "bow", "bow", "bow", "bow"]
};

const level2: LevelData = {
    areas: `
##################
#0000...........b#
#0000...........b#
#0000.....s......#
#0000.....s......#
#0000.....s......#
#0000...........b#
#0000...........b#
##################
`,
    ownUnitTypes: ["sword", "sword", "sword", "sword", "bow", "bow", "bow", "bow"]
};

const level3: LevelData = {
    areas: `
##################
#00.#........#.00#
#00.#........#.00#
#...#..#..#..#...#
#...#..#ss#..#...#
#......#ss#......#
#......#ss#......#
#...#..#ss#..#...#
#...#..#..#..#...#
#00.#........#.00#
#00.#........#.00#
##################
`,
    ownUnitTypes: ["sword", "sword", "sword", "sword", "bow", "bow", "bow", "bow"]
};

const levels: LevelData[] = [level1, level2, level3];

const smellResolution = 2;

createQwick((qwick: Qwick) => {
    return {
        levels,
        loadLevel: (levelData: LevelData) => {
            const grid = stringToGrid(levelData.areas);

            const areas = grid.map(row => row.map(char => charToAreaType[char]));

            const getAreaType = (pos: vec2.Vec2): AreaType | undefined =>
                (areas[Math.round(pos[0])] ?? [])[Math.round(pos[1])];

            const units = levelData.ownUnitTypes.map(
                (type, i): Unit =>
                    createUnit(0, type, [
                        -2,
                        Math.round((areas[0].length - 1) / 2 + (i - (levelData.ownUnitTypes.length - 1) / 2))
                    ])
            );

            const attacks: Attack[] = [];

            grid.forEach((row, i) =>
                row.forEach((c, j) => {
                    const pos: vec2.Vec2 = [i, j];
                    if (c === "s") units.push(createUnit(1, "sword", pos));
                    if (c === "b") units.push(createUnit(1, "bow", pos));
                })
            );

            const getEnemies = (unit: Unit) => units.filter(u => u.team !== unit.team);

            const getNearestEnemy = (unit: Unit) => vec2.getNearestObject(unit, getEnemies(unit), u => u.pos);

            const smell = teamColors.map(() =>
                [...Array(areas.length * smellResolution)].map(() =>
                    [...Array(areas[0].length * smellResolution)].map(() => 0)
                )
            );
            const updateSmell = () => {
                units.forEach(unit => {
                    matrix.addValueInterpolated(smell[unit.team], vec2.scale(unit.pos, smellResolution), 0.1);
                });
                for (let team = 0; team < smell.length; ++team) {
                    smell[team] = smell[team].map((row, i) =>
                        row.map((_, j) => {
                            if (
                                getAreaType([Math.floor(i / smellResolution), Math.floor(j / smellResolution)]) ===
                                "wall"
                            )
                                return 0;
                            const posList: vec2.Vec2[] = [
                                [i - 1, j],
                                [i + 1, j],
                                [i, j - 1],
                                [i, j + 1]
                            ];
                            return (
                                ((smell[team][i][j] +
                                    posList.map(pos => matrix.getValue(smell[team], pos)).reduce((s, v) => s + v, 0) /
                                        4) /
                                    2) *
                                0.999
                            );
                        })
                    );
                }
            };

            const border = 0.25;
            const boardScale = (1 - border) / areas[0].length;
            const boardTranslate: vec2.Vec2 = [-(areas.length - 1) / 2, -(areas[0].length - 1) / 2];
            const getMousePos = () => vec2.sub(vec2.scale(qwick.getMousePos(), 1 / boardScale), boardTranslate);
            let selectedUnitIndex = -1;
            let selectOffset: vec2.Vec2 = [0, 0];

            const startButtonPos: vec2.Vec2 = [0, 0.45];
            const startButtonSize: vec2.Vec2 = [0.1, 0.04];
            const startButton = createButton(qwick.getMousePos, startButtonPos, startButtonSize, "Start");
            const stopButton = createButton(qwick.getMousePos, startButtonPos, startButtonSize, "Stop");

            const allUnitsPlaced = () => units.filter(u => u.team === 0).every(u => getAreaType(u.pos) === "placable");

            const updateUnits = () => {
                units.forEach(unit => {
                    ++unit.chargeTime;
                    const nearestEnemy = getNearestEnemy(unit);
                    const specs = unitTypeToSpecs[unit.type];
                    if (nearestEnemy && vec2.dist(unit.pos, nearestEnemy.pos) < specs.range) {
                        if (unit.chargeTime > specs.rechargeTime) {
                            attacks.push({ team: unit.team, pos: unit.pos, target: nearestEnemy, unitType: unit.type });
                            unit.chargeTime = 0;
                        }
                    } else
                        unit.pos = vec2.add(
                            unit.pos,
                            vec2.scale(
                                vec2.normalize(
                                    matrix.getGradient(smell[1 - unit.team], vec2.scale(unit.pos, smellResolution))
                                ),
                                specs.speed
                            )
                        );
                });
                for (let i = units.length - 1; i >= 0; --i) {
                    if (units[i].hpLost >= unitTypeToSpecs[units[i].type].hp) units.splice(i, 1);
                }
            };

            const updateAttacks = () => {
                const attackSpeed = 0.1;
                for (let i = attacks.length - 1; i >= 0; --i) {
                    const attack = attacks[i];
                    const d = vec2.sub(attack.target.pos, attack.pos);
                    const l = vec2.length(d);
                    if (l < attackSpeed) {
                        attack.target.hpLost += unitTypeToSpecs[attack.unitType].damage;
                        attacks.splice(i, 1);
                        continue;
                    }
                    const n = vec2.scale(d, attackSpeed / l);
                    attack.pos = vec2.add(attack.pos, n);
                }
            };

            const wallCollisions = () => {
                const r = 0.2;
                for (const unit of units) {
                    const i = Math.round(unit.pos[0]);
                    const j = Math.round(unit.pos[1]);
                    const di = unit.pos[0] - i;
                    const dj = unit.pos[1] - j;
                    if (di > r && getAreaType([i + 1, j]) === "wall") unit.pos[0] = i + r;
                    if (di < -r && getAreaType([i - 1, j]) === "wall") unit.pos[0] = i - r;
                    if (dj > r && getAreaType([i, j + 1]) === "wall") unit.pos[1] = j + r;
                    if (dj < -r && getAreaType([i, j - 1]) === "wall") unit.pos[1] = j - r;
                    const p11: vec2.Vec2 = [i + 0.5, j + 0.5];
                    const p10: vec2.Vec2 = [i + 0.5, j - 0.5];
                    const p01: vec2.Vec2 = [i - 0.5, j + 0.5];
                    const p00: vec2.Vec2 = [i - 0.5, j - 0.5];
                    const d11 = vec2.sub(unit.pos, p11);
                    const d10 = vec2.sub(unit.pos, p10);
                    const d01 = vec2.sub(unit.pos, p01);
                    const d00 = vec2.sub(unit.pos, p00);
                    const l11 = vec2.length(d11);
                    const l10 = vec2.length(d10);
                    const l01 = vec2.length(d01);
                    const l00 = vec2.length(d00);
                    if (l11 < 0.5 - r && getAreaType([i + 1, j + 1]) === "wall")
                        unit.pos = vec2.add(p11, vec2.scale(d11, (0.5 - r) / l11));
                    if (l10 < 0.5 - r && getAreaType([i + 1, j - 1]) === "wall")
                        unit.pos = vec2.add(p10, vec2.scale(d10, (0.5 - r) / l10));
                    if (l01 < 0.5 - r && getAreaType([i - 1, j + 1]) === "wall")
                        unit.pos = vec2.add(p01, vec2.scale(d01, (0.5 - r) / l01));
                    if (l00 < 0.5 - r && getAreaType([i - 1, j - 1]) === "wall")
                        unit.pos = vec2.add(p00, vec2.scale(d00, (0.5 - r) / l00));
                }
            };

            const unitCollisions = () => {
                const r = 0.1;
                for (let i = 0; i < units.length; ++i) {
                    for (let j = i + 1; j < units.length; ++j) {
                        const c = vec2.scale(vec2.add(units[i].pos, units[j].pos), 0.5);
                        const d = vec2.sub(units[j].pos, units[i].pos);
                        const l = vec2.length(d);
                        if (l > 1 - r) continue;
                        const n = vec2.scale(d, (1 - r) * (0.5 / l));
                        units[i].pos = vec2.sub(c, n);
                        units[j].pos = vec2.add(c, n);
                    }
                }
            };

            let started = false;

            return {
                input: (type: InputType, down: boolean) => {
                    if (!started && startButton.clicked(type, down) && allUnitsPlaced()) started = true;
                    else if (started && stopButton.clicked(type, down)) started = false;
                    if (type !== "lmb") return;
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
                        updateSmell();
                        updateUnits();
                        updateAttacks();
                        wallCollisions();
                        unitCollisions();
                        if (units.every(u => u.team !== 0)) qwick.levelLost();
                        else if (units.every(u => u.team === 0)) qwick.levelCompleted();
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
                        areas.forEach((row, x) => {
                            row.forEach((type, y) => {
                                graphics.color("#555555");
                                if (type === "wall") graphics.color("#000000");
                                if (type === "placable" && !started) graphics.color("#888888");
                                graphics.icon([x, y], 1, "square", true);
                            });
                        });
                        units.forEach(unit => {
                            graphics.context(() => {
                                graphics.color(teamColors[unit.team]);
                                graphics.translate(unit.pos);
                                graphics.icon([0, 0], 0.5, "o");
                                graphics.text(unit.type, 0.25);
                                const totalHp = unitTypeToSpecs[unit.type].hp;
                                const hp = totalHp - unit.hpLost;
                                const frac = hp / totalHp;
                                graphics.color(hsv2rgb(vec3.lerp(rgb2hsv([1, 0, 0]), rgb2hsv([0, 1, 0]), frac)));
                                graphics.rect([-0.5, -0.5], [frac - 0.5, -0.4], true);
                            });
                        });
                        attacks.forEach(attack => {
                            graphics.context(() => {
                                graphics.color(teamColors[attack.team]);
                                graphics.translate(attack.pos);
                                graphics.orient(vec2.sub(attack.target.pos, attack.pos));
                                if (attack.unitType === "sword") graphics.icon([0, 0], 1, "sword", true);
                                if (attack.unitType === "bow") graphics.icon([0, 0], 0.5, "arrow", true);
                            });
                        });
                    });
                    graphics.context(() => {
                        graphics.color("#800000");
                        graphics.translate([0, -0.45]);
                        graphics.text("Battle game test", 0.05);
                    });
                    if (!started) startButton.draw(graphics);
                    else stopButton.draw(graphics);
                }
            };
        },
        resize: () => {
            console.log("resize:", qwick.width, qwick.height);
        },
        backgroundColor: "#60b1c7"
    };
});
