import { vec2, vec3 } from "@peulicke/geometry";
import type { Graphics3d } from ".";

export type Camera3dState = {
    pos: vec3.Vec3;
    zoom: number;
};

export type Camera3d = {
    state: Camera3dState;
    screenToWorldCoords: (pos: vec2.Vec2) => vec3.Vec3;
    worldToScreenCoords: (pos: vec3.Vec3) => vec2.Vec2;
    graphicsTransform: (graphics: Graphics3d) => void;
};

const proj = (v: vec3.Vec3): vec2.Vec2 => [v[0], (v[1] - v[2]) * Math.SQRT1_2];

export const createCamera3d = (partialState: Partial<Camera3dState>): Camera3d => {
    const defaultState: Camera3dState = {
        pos: [0, 0, 0],
        zoom: 1
    };

    const state = Object.assign(defaultState, partialState);

    const screenToWorldCoords: Camera3d["screenToWorldCoords"] = pos =>
        vec3.add(vec3.scale([pos[0], 0, -pos[1] * Math.SQRT2], 1 / state.zoom), state.pos);

    const worldToScreenCoords: Camera3d["worldToScreenCoords"] = pos =>
        proj(vec3.scale(vec3.sub(pos, state.pos), state.zoom));

    const graphicsTransform: Camera3d["graphicsTransform"] = graphics => {
        graphics.scale([state.zoom, state.zoom, state.zoom]);
        graphics.translate(vec3.negate(state.pos));
    };

    return {
        state,
        screenToWorldCoords,
        worldToScreenCoords,
        graphicsTransform
    };
};
