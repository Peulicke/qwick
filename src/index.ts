import createQwick, { Qwick, InputType, Graphics } from "./qwick";
import * as vec2 from "./qwick/vec2";
import * as vec3 from "./qwick/vec3";
import * as matrix from "./qwick/matrix";
import * as grid from "./qwick/grid";
import { forEachPair, mean, spliceWhere } from "./qwick/utils";
import { createButton } from "./qwick/button";
import { hsv2rgb, rgb2hsv } from "./qwick/graphics/utils";

const stringToGrid = (s: string) =>
    grid.transpose(
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

const loadLevel = (qwick: Qwick) => (levelData: LevelData) => {
    const gridData = stringToGrid(levelData.areas);

    const areas = grid.map(gridData, char => charToAreaType[char]);

    const getAreaType = (pos: vec2.Vec2) => grid.getNearestCell(areas, pos);

    const units = levelData.ownUnitTypes.map(
        (type, i): Unit =>
            createUnit(0, type, [
                -2,
                Math.round((areas[0].length - 1) / 2 + (i - (levelData.ownUnitTypes.length - 1) / 2))
            ])
    );

    const attacks: Attack[] = [];

    grid.map(gridData, (c, pos) => {
        if (c === "s") units.push(createUnit(1, "sword", pos));
        if (c === "b") units.push(createUnit(1, "bow", pos));
    });

    const getEnemies = (unit: Unit) => units.filter(u => u.team !== unit.team);

    const getNearestEnemy = (unit: Unit) => vec2.getNearestObject(unit, getEnemies(unit), u => u.pos);

    const smell = teamColors.map(() => grid.create(vec2.scale([areas.length, areas[0].length], smellResolution), 0));

    const updateSmell = () => {
        units.forEach(unit => {
            matrix.addValueInterpolated(smell[unit.team], vec2.scale(unit.pos, smellResolution), 0.1);
        });
        for (let team = 0; team < smell.length; ++team) {
            smell[team] = grid.map(smell[team], (value, pos) => {
                if (getAreaType(vec2.floor(vec2.scale(pos, 1 / smellResolution))) === "wall") return 0;
                const neighborMean = mean(vec2.gridEdges(pos).map(({ p }) => matrix.getValue(smell[team], p)));
                return mean([value, neighborMean]) * 0.999;
            });
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

    const allUnitsPlaced = () => units.filter(u => u.team === 0).every(u => getAreaType(u.pos) === "placable");

    const unitMove = (unit: Unit) => {
        const gradient = matrix.getGradient(smell[1 - unit.team], vec2.scale(unit.pos, smellResolution));
        unit.pos = vec2.add(unit.pos, vec2.resize(gradient, unitTypeToSpecs[unit.type].speed));
    };

    const unitHasAttackPosition = (unit: Unit, enemy: Unit | undefined) => {
        if (!enemy) return false;
        return vec2.dist(unit.pos, enemy.pos) < unitTypeToSpecs[unit.type].range;
    };

    const unitAttack = (unit: Unit, enemy: Unit) => {
        attacks.push({ team: unit.team, pos: unit.pos, target: enemy, unitType: unit.type });
        unit.chargeTime = 0;
    };

    const updateUnits = () => {
        units.forEach(unit => {
            ++unit.chargeTime;
            const enemy = getNearestEnemy(unit);
            if (!unitHasAttackPosition(unit, enemy)) return unitMove(unit);
            if (!enemy) return;
            if (unit.chargeTime >= unitTypeToSpecs[unit.type].rechargeTime) unitAttack(unit, enemy);
        });
        spliceWhere(units, unit => unit.hpLost >= unitTypeToSpecs[unit.type].hp);
    };

    const updateAttacks = () => {
        const attackSpeed = 0.1;
        const hits = spliceWhere(attacks, attack => vec2.dist(attack.pos, attack.target.pos) < attackSpeed);
        hits.forEach(attack => {
            attack.target.hpLost += unitTypeToSpecs[attack.unitType].damage;
        });
        attacks.forEach(attack => {
            const n = vec2.dir(attack.pos, attack.target.pos, attackSpeed);
            attack.pos = vec2.add(attack.pos, n);
        });
    };

    const wallCollisions = () => {
        const r = 0.3;
        for (const unit of units) {
            const areaCenter = vec2.round(unit.pos);
            vec2.gridNeighbors(areaCenter)
                .filter(({ p }) => getAreaType(p) === "wall")
                .map(({ p, n, isEdge }) => {
                    const wallPoint = vec2.lerp(areaCenter, p, 0.5);
                    return isEdge ? vec2.projOnLine(wallPoint, unit.pos, n) : wallPoint;
                })
                .forEach(point => {
                    unit.pos = vec2.resolveCollision(unit.pos, point, r);
                });
        }
    };

    const unitCollisions = () => {
        const r = 0.45;
        forEachPair(units, (a, b) => {
            const c = vec2.lerp(a.pos, b.pos, 0.5);
            a.pos = vec2.resolveCollision(a.pos, c, r);
            b.pos = vec2.resolveCollision(b.pos, c, r);
        });
    };

    const updatePreparation = () => {
        if (selectedUnitIndex === -1) return;
        units[selectedUnitIndex].pos = vec2.add(getMousePos(), selectOffset);
    };

    const updateSimulation = () => {
        updateSmell();
        updateUnits();
        updateAttacks();
        wallCollisions();
        unitCollisions();
    };

    let started = false;

    return {
        input: (type: InputType, down: boolean) => {
            if (!started && startButton.clicked(type, down) && allUnitsPlaced()) started = true;
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
            if (started) updateSimulation();
            else updatePreparation();
        },
        hasWon: () => units.every(u => u.team === 0),
        hasLost: () => units.every(u => u.team !== 0),
        draw: (graphics: Graphics) => {
            graphics.context(() => {
                graphics.scale(boardScale);
                graphics.translate(boardTranslate);
                grid.map(areas, (type, pos) => {
                    graphics.color("#555555");
                    if (type === "wall") graphics.color("#000000");
                    if (type === "placable" && !started) graphics.color("#888888");
                    graphics.icon(pos, 1, "square", true);
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
            if (!started) startButton.draw(graphics);
        }
    };
};

createQwick((qwick: Qwick) => ({
    name: "Battle game test",
    levels,
    loadLevel: loadLevel(qwick),
    resize: () => {
        console.log("resize:", qwick.width, qwick.height);
    },
    backgroundColor: "#60b1c7"
}));
