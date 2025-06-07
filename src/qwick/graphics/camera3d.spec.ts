import type { vec2 } from "@peulicke/geometry";
import { createCamera3d } from "./camera3d";
import { expect, it } from "vitest";

it("converts screen to world pos and back again", () => {
    const cam = createCamera3d({ pos: [1, 2, 3], zoom: 10 });
    const pos: vec2.Vec2 = [0.1, 0.2];
    expect(cam.worldToScreenCoords(cam.screenToWorldCoords(pos))).toBeCloseToVec2(pos);
});
