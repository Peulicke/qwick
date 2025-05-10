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
        vec2.add(vec2.multiply(vec2.scale(pos, 1 / state.zoom), [1, state.verticalInversion ? -1 : 1]), state.pos);
    const graphicsTransform = (graphics: Graphics) => {
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
        context
    };
};
