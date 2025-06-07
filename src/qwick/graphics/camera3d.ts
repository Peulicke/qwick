import { orient, vec2, vec3 } from "@peulicke/geometry";
import type { Graphics3d } from ".";

export type Camera3dState = {
    pos: vec3.Vec3;
    zoom: number;
    orient: orient.Orient;
};

export type Context = (graphics: Graphics3d, func: () => void) => void;

export type Camera3d = {
    state: Camera3dState;
    worldToScreenCoords: (pos: vec3.Vec3) => vec2.Vec2;
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

    const worldToScreenCoords: Camera3d["worldToScreenCoords"] = pos =>
        proj(orient.rotateVec3(state.orient, vec3.scale(vec3.sub(pos, state.pos), state.zoom)));

    const graphicsTransform: Camera3d["graphicsTransform"] = graphics => {
        graphics.orient(state.orient);
        graphics.scale([state.zoom, state.zoom, state.zoom]);
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
        graphicsTransform,
        context
    };
};
