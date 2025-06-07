import { vec2 } from "@peulicke/geometry";
import { expect } from "vitest";

const epsilon = 1e-6;

export const toBeCloseToVec2 = (
    received: vec2.Vec2,
    expected: vec2.Vec2
): {
    pass: boolean;
    message: () => string;
    actual: vec2.Vec2;
    expected: vec2.Vec2;
} => {
    return {
        pass: vec2.length(vec2.sub(received, expected)) < epsilon,
        message: () => `expected vectors to be close within epsilon ${epsilon}`,
        actual: received,
        expected
    };
};

expect.extend({ toBeCloseToVec2 });
