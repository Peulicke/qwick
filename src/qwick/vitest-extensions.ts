import { vec2, vec3 } from "@peulicke/geometry";
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

export const toBeCloseToVec3 = (
    received: vec3.Vec3,
    expected: vec3.Vec3
): {
    pass: boolean;
    message: () => string;
    actual: vec3.Vec3;
    expected: vec3.Vec3;
} => {
    return {
        pass: vec3.length(vec3.sub(received, expected)) < epsilon,
        message: () => `expected vectors to be close within epsilon ${epsilon}`,
        actual: received,
        expected
    };
};

expect.extend({ toBeCloseToVec2, toBeCloseToVec3 });
