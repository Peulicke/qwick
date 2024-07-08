import { test } from "./test";
import {
    createQwick,
    Qwick,
    InputType,
    Graphics,
    vec2,
    vec3,
    matrix,
    grid,
    transform2,
    utils,
    button,
    graphics
} from "./qwick";
import { LevelEditor } from "./qwick/levelEditor";

const smellResolution = 2;
const border = 0.25;
const unitRadius = 0.45;

const teamColors = ["#008000", "#800000"];

const areaTypes = ["none", "wall", "placable"] as const;

type AreaType = (typeof areaTypes)[number];

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

type LevelState = {
    areas: grid.Grid<AreaType>;
    units: Unit[];
    attacks: Attack[];
    smell: grid.Grid<number>[];
    selectedUnit: { index: number; offset: vec2.Vec2 };
    started: boolean;
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

const getBoardToScreen = (areas: grid.Grid<AreaType>) =>
    transform2.compose([
        transform2.translate(vec2.scale(vec2.sub(vec2.sizeOfGrid(areas), [1, 1]), -0.5)),
        transform2.scale((1 - border) / areas[0].length)
    ]);

const colors: Record<AreaType, string> = {
    none: "#555555",
    wall: "#000000",
    placable: "#888888"
};

const drawArea = (g: Graphics, type: AreaType, levelState: LevelState) => {
    g.color(colors.none);
    if (type === "wall") g.color(colors.wall);
    if (type === "placable" && !levelState.started) g.color(colors.placable);
    g.icon([0, 0], 1, "square", true);
};

const drawWorld = (g: Graphics, levelState: LevelState) => {
    g.context(() => {
        g.transform(getBoardToScreen(levelState.areas));
        grid.map(levelState.areas, (type, pos) => {
            g.context(() => {
                g.translate(pos);
                drawArea(g, type, levelState);
            });
        });
        levelState.units.forEach(unit => {
            g.context(() => {
                g.color(teamColors[unit.team]);
                g.translate(unit.pos);
                g.icon([0, 0], unitRadius, "o");
                g.text(unit.type, 0.25);
                const totalHp = unitTypeToSpecs[unit.type].hp;
                const hp = totalHp - unit.hpLost;
                const frac = hp / totalHp;
                g.color(
                    graphics.utils.hsv2rgb(
                        vec3.lerp(graphics.utils.rgb2hsv([1, 0, 0]), graphics.utils.rgb2hsv([0, 1, 0]), frac)
                    )
                );
                g.rect([-0.5, -0.5], [frac - 0.5, -0.4], true);
            });
        });
        levelState.attacks.forEach(attack => {
            g.context(() => {
                g.color(teamColors[attack.team]);
                g.translate(attack.pos);
                g.orient(vec2.sub(attack.target.pos, attack.pos));
                if (attack.unitType === "sword") g.icon([0, 0], 1, "sword", true);
                if (attack.unitType === "bow") g.icon([0, 0], 0.5, "arrow", true);
            });
        });
    });
};

const levelDataToState = (levelData: LevelData): LevelState => {
    const gridData = grid.stringToGrid(levelData.areas);

    const areas = grid.map(gridData, char => charToAreaType[char]);

    const units = levelData.ownUnitTypes.map(
        (type, i): Unit =>
            createUnit(0, type, [-2, i + Math.round((areas[0].length - levelData.ownUnitTypes.length) / 2)])
    );

    const attacks: Attack[] = [];

    grid.map(gridData, (c, pos) => {
        if (c === "s") units.push(createUnit(1, "sword", pos));
        if (c === "b") units.push(createUnit(1, "bow", pos));
    });

    const smell = teamColors.map(() => grid.create(vec2.scale(vec2.sizeOfGrid(areas), smellResolution), 0));

    const selectedUnit: { index: number; offset: vec2.Vec2 } = { index: -1, offset: [0, 0] };

    return {
        areas,
        units,
        attacks,
        smell,
        selectedUnit,
        started: false
    };
};

const loadLevel = (qwick: Qwick) => (levelData: LevelData) => {
    const startButton = button.createButton(
        qwick.getMousePos,
        vec2.add(qwick.getPos("bottom"), [0, -0.05]),
        [0.1, 0.04],
        "Start"
    );

    const levelState = levelDataToState(levelData);

    const getAreaType = (pos: vec2.Vec2) => grid.getNearestCell(levelState.areas, pos);

    const getEnemies = (unit: Unit) => levelState.units.filter(u => u.team !== unit.team);

    const getNearestEnemy = (unit: Unit) => vec2.getNearestObject(unit, getEnemies(unit), u => u.pos);

    const updateSmell = () => {
        levelState.units.forEach(unit => {
            matrix.addValueInterpolated(levelState.smell[unit.team], vec2.scale(unit.pos, smellResolution), 0.1);
        });
        for (let team = 0; team < levelState.smell.length; ++team) {
            levelState.smell[team] = grid.map(levelState.smell[team], (value, pos) => {
                if (getAreaType(vec2.floor(vec2.scale(pos, 1 / smellResolution))) === "wall") return 0;
                const neighborMean = utils.mean(
                    vec2.gridEdges(pos).map(({ p }) => matrix.getValue(levelState.smell[team], p))
                );
                return utils.mean([value, neighborMean]) * 0.999;
            });
        }
    };

    const getMousePos = () =>
        transform2.apply(transform2.inverse(getBoardToScreen(levelState.areas)), qwick.getMousePos());

    const allUnitsPlaced = () =>
        levelState.units.filter(u => u.team === 0).every(u => getAreaType(u.pos) === "placable");

    const unitMove = (unit: Unit) => {
        const gradient = matrix.getGradient(levelState.smell[1 - unit.team], vec2.scale(unit.pos, smellResolution));
        unit.pos = vec2.add(unit.pos, vec2.resize(gradient, unitTypeToSpecs[unit.type].speed));
    };

    const unitHasAttackPosition = (unit: Unit, enemy: Unit | undefined) => {
        if (!enemy) return false;
        return vec2.dist(unit.pos, enemy.pos) < unitTypeToSpecs[unit.type].range;
    };

    const unitAttack = (unit: Unit, enemy: Unit) => {
        levelState.attacks.push({ team: unit.team, pos: unit.pos, target: enemy, unitType: unit.type });
        unit.chargeTime = 0;
    };

    const updateUnits = () => {
        levelState.units.forEach(unit => {
            ++unit.chargeTime;
            const enemy = getNearestEnemy(unit);
            if (!unitHasAttackPosition(unit, enemy)) return unitMove(unit);
            if (!enemy) return;
            if (unit.chargeTime >= unitTypeToSpecs[unit.type].rechargeTime) unitAttack(unit, enemy);
        });
        utils.spliceWhere(levelState.units, unit => unit.hpLost >= unitTypeToSpecs[unit.type].hp);
    };

    const updateAttacks = () => {
        const attackSpeed = 0.1;
        const hits = utils.spliceWhere(
            levelState.attacks,
            attack => vec2.dist(attack.pos, attack.target.pos) < attackSpeed
        );
        hits.forEach(attack => {
            attack.target.hpLost += unitTypeToSpecs[attack.unitType].damage;
        });
        levelState.attacks.forEach(attack => {
            const n = vec2.dir(attack.pos, attack.target.pos, attackSpeed);
            attack.pos = vec2.add(attack.pos, n);
        });
    };

    const wallCollisions = () => {
        for (const unit of levelState.units) {
            const areaCenter = vec2.round(unit.pos);
            vec2.gridNeighbors(areaCenter)
                .filter(({ p }) => getAreaType(p) === "wall")
                .map(({ p, n, isEdge }) => {
                    const wallPoint = vec2.lerp(areaCenter, p, 0.5);
                    return isEdge ? vec2.projOnLine(wallPoint, unit.pos, n) : wallPoint;
                })
                .forEach(point => {
                    unit.pos = vec2.resolveCollision(unit.pos, point, unitRadius);
                });
        }
    };

    const unitCollisions = () => {
        utils.forEachPair(levelState.units, (a, b) => {
            const c = vec2.lerp(a.pos, b.pos, 0.5);
            a.pos = vec2.resolveCollision(a.pos, c, unitRadius);
            b.pos = vec2.resolveCollision(b.pos, c, unitRadius);
        });
    };

    const updatePreparation = () => {
        if (levelState.selectedUnit.index === -1) return;
        levelState.units[levelState.selectedUnit.index].pos = vec2.add(getMousePos(), levelState.selectedUnit.offset);
    };

    const updateSimulation = () => {
        updateSmell();
        updateUnits();
        updateAttacks();
        wallCollisions();
        unitCollisions();
    };

    const img = new Image();
    img.src = "example.png";

    return {
        input: (type: InputType, down: boolean) => {
            startButton.input(type, down);
            if (!levelState.started && startButton.clicked && allUnitsPlaced()) levelState.started = true;
            if (type !== "lmb") return;
            if (levelState.started) return;
            if (down) {
                levelState.units.forEach((unit, i) => {
                    if (unit.team !== 0) return;
                    if (vec2.dist(getMousePos(), unit.pos) > 0.5) return;
                    levelState.selectedUnit.index = i;
                    levelState.selectedUnit.offset = vec2.sub(unit.pos, getMousePos());
                });
            } else if (levelState.selectedUnit.index !== -1) {
                levelState.units[levelState.selectedUnit.index].pos = vec2.round(
                    levelState.units[levelState.selectedUnit.index].pos
                );
                levelState.selectedUnit.index = -1;
            }
        },
        update: () => {
            if (levelState.started) updateSimulation();
            else updatePreparation();
        },
        hasWon: () => levelState.units.every(u => u.team === 0),
        hasLost: () => levelState.units.every(u => u.team !== 0),
        draw: (g: Graphics) => {
            g.context(() => {
                g.transform(getBoardToScreen(levelState.areas));
                g.context(() => {
                    g.translate([-1, -1]);
                    g.image(img);
                });
            });
            drawWorld(g, levelState);
            if (!levelState.started) startButton.draw(g);
        }
    };
};

const getEmptyLevelData = (): LevelData => ({
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
});

const loadLevelEditor = (_: Qwick) => (): LevelEditor<LevelData> => {
    const levelData = getEmptyLevelData();

    const draw = (g: Graphics) => {
        drawWorld(g, levelDataToState(levelData));
    };

    return {
        levelData: level1,
        menuItems: areaTypes.map(type => ({
            id: type,
            draw: g => drawArea(g, type, levelDataToState(levelData))
        })),
        draw
    };
};

createQwick(
    (qwick: Qwick) => ({
        name: "Battle game test",
        levels,
        loadLevel: loadLevel(qwick),
        loadLevelEditor: loadLevelEditor(qwick)
    }),
    test
);
