import type { vec2 } from "@peulicke/geometry";

declare module "vitest" {
    interface Assertion<T extends vec2.Vec2> {
        toBeCloseToVec2(expected: T): void;
    }
}
