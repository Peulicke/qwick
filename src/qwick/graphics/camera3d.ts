import { orient, vec2, vec3 } from "@peulicke/geometry";
import { combineTransformations, createTransformation } from "@peulicke/geometry/transformation";
import type { Graphics3d } from ".";
import { linePlaneIntersection, type Plane } from "@peulicke/geometry/plane";

export type Camera3dState = {
    pos: vec3.Vec3;
    zoom: number;
    orient: orient.Orient;
};

export type Context = (graphics: Graphics3d, func: () => void) => void;

export type Camera3d = {
    state: Camera3dState;
    worldToScreenCoords: (pos: vec3.Vec3) => vec2.Vec2;
    screenToWorldCoords: (pos: vec2.Vec2, plane: Plane) => vec3.Vec3;
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

    const context: Context = (graphics, func) => {
        graphics.transformation(
            combineTransformations([
                createTransformation({ scale: state.zoom }),
                createTransformation({ orient: state.orient }),
                createTransformation({ pos: vec3.negate(state.pos) })
            ]),
            func
        );
    };

    return {
        state,
        worldToScreenCoords,
        screenToWorldCoords,
        context
    };
};
