import { orient, vec2, vec3 } from "@peulicke/geometry";
import type { Graphics3d } from ".";

export type Camera3dState = {
    pos: vec3.Vec3;
    zoom: number;
    orient: orient.Orient;
};

export type Context = (graphics: Graphics3d, func: () => void) => void;

type Line = {
    from: vec3.Vec3;
    to: vec3.Vec3;
};

type Plane = {
    pos: vec3.Vec3;
    dir: vec3.Vec3;
};

export const linePlaneIntersection = (line: Line, plane: Plane): vec3.Vec3 => {
    const n = vec3.normalize(plane.dir);
    const lineDir = vec3.normalize(vec3.sub(line.to, line.from));
    const lineDirAlongNormal = vec3.dot(lineDir, n);
    const lineToPlaneDiff = vec3.sub(plane.pos, line.from);
    const lineToPlaneDiffAlongNormal = vec3.dot(lineToPlaneDiff, n);
    const scale = lineToPlaneDiffAlongNormal / lineDirAlongNormal;
    return vec3.add(line.from, vec3.scale(lineDir, scale));
};

export type Camera3d = {
    state: Camera3dState;
    worldToScreenCoords: (pos: vec3.Vec3) => vec2.Vec2;
    screenToWorldCoords: (pos: vec2.Vec2, plane: Plane) => vec3.Vec3;
    graphicsTransform: (graphics: Graphics3d) => void;
    context: Context;
};

const proj = (v: vec3.Vec3): vec2.Vec2 => [v[0], v[1]];

export const createCamera3d = (partialState: Partial<Camera3dState>): Camera3d => {
    const defaultState: Camera3dState = {
        pos: [0, 0, 0],
        zoom: 1,
        orient: orient.identity()
    };

    const state = Object.assign(defaultState, partialState);

    const worldToScreenCoords3d = (pos: vec3.Vec3) =>
        orient.rotateVec3(state.orient, vec3.scale(vec3.sub(pos, state.pos), state.zoom));

    const screenToWorldCoords3d = (pos: vec3.Vec3) =>
        vec3.add(vec3.scale(orient.rotateVec3(orient.inverse(state.orient), pos), 1 / state.zoom), state.pos);

    const worldToScreenCoords: Camera3d["worldToScreenCoords"] = pos => proj(worldToScreenCoords3d(pos));

    const screenToWorldCoords: Camera3d["screenToWorldCoords"] = (pos, plane) => {
        const from = screenToWorldCoords3d([pos[0], pos[1], 0]);
        const to = screenToWorldCoords3d([pos[0], pos[1], 1]);
        return linePlaneIntersection({ from, to }, plane);
    };

    const graphicsTransform: Camera3d["graphicsTransform"] = graphics => {
        graphics.scale(state.zoom);
        graphics.orient(state.orient);
        graphics.translate(vec3.negate(state.pos));
    };

    const context: Context = (graphics, func) => {
        graphics.context(() => {
            graphicsTransform(graphics);
            func();
        });
    };

    return {
        state,
        worldToScreenCoords,
        screenToWorldCoords,
        graphicsTransform,
        context
    };
};
