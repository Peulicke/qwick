import { vec2 } from "@peulicke/geometry";

export type Position =
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

const positionToUnitCoords: Record<Position, vec2.Vec2> = {
    "top-left": [-1, -1],
    left: [-1, 0],
    "bottom-left": [-1, 1],
    top: [0, -1],
    center: [0, 0],
    bottom: [0, 1],
    "top-right": [1, -1],
    right: [1, 0],
    "bottom-right": [1, 1]
};

export const getPos = (pos: Position, aspectRatio: number): vec2.Vec2 =>
    vec2.multiply(positionToUnitCoords[pos], [0.5 * aspectRatio, 0.5]);
