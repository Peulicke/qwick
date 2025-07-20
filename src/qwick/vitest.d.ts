import type { vec2, vec3 } from "@peulicke/geometry";

declare module "vitest" {
    interface Assertion<T extends vec2.Vec2> {
        toBeCloseToVec2(expected: T): void;
    }
    interface Assertion<T extends vec3.Vec3> {
        toBeCloseToVec3(expected: T): void;
    }
}
