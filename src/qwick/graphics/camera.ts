import { vec2 } from "@peulicke/geometry";
import type { Graphics } from ".";

export type CameraState = {
    pos: vec2.Vec2;
    zoom: number;
    verticalInversion: boolean;
};

export type Context = (graphics: Graphics, func: () => void) => void;

export type Camera = {
    state: CameraState;
    screenToWorldCoords: (pos: vec2.Vec2) => vec2.Vec2;
    graphicsTransform: (graphics: Graphics) => void;
    context: Context;
};

export const createCamera = (partialState: Partial<CameraState>): Camera => {
    const defaultState: CameraState = {
        pos: [0, 0],
        zoom: 1,
        verticalInversion: false
    };
    const state = Object.assign(defaultState, partialState);
    const screenToWorldCoords: Camera["screenToWorldCoords"] = pos =>
        vec2.add(vec2.scale(pos, 1 / state.zoom), state.pos);
    const graphicsTransform: Camera["graphicsTransform"] = graphics => {
        graphics.scale(state.zoom);
        graphics.translate(vec2.negate(state.pos));
    };
    const context: Context = (graphics, func) => {
        const c = state.verticalInversion ? graphics.contextVerticalInversion : graphics.context;
        c(() => {
            graphicsTransform(graphics);
            func();
        });
    };
    return {
        state,
        screenToWorldCoords,
        graphicsTransform,
        context
    };
};
