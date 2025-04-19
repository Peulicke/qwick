import { vec2, vec3 } from "@peulicke/geometry";
import type { Graphics3d } from ".";

export type Camera3dState = {
    pos: vec3.Vec3;
    zoom: number;
};

export type Camera3d = {
    state: Camera3dState;
    screenToWorldCoords: (pos: vec2.Vec2) => vec3.Vec3;
    graphicsTransform: (graphics: Graphics3d) => void;
};

export const createCamera3d = (partialState: Partial<Camera3dState>): Camera3d => {
    const defaultState: Camera3dState = {
        pos: [0, 0, 0],
        zoom: 1
    };
    const state = Object.assign(defaultState, partialState);
    const screenToWorldCoords: Camera3d["screenToWorldCoords"] = pos =>
        vec3.add(vec3.scale([pos[0], 0, pos[1] * Math.SQRT2], 1 / state.zoom), state.pos);
    const graphicsTransform: Camera3d["graphicsTransform"] = graphics => {
        graphics.scale([state.zoom, state.zoom, state.zoom]);
        graphics.translate(vec3.negate(state.pos));
    };
    return {
        state,
        screenToWorldCoords,
        graphicsTransform
    };
};
