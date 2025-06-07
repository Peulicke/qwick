import { orient } from "@peulicke/geometry";
import { createCamera3d } from "./camera3d";
import { expect, it } from "vitest";

it("converts world to screen coords", () => {
    const cam = createCamera3d({});
    expect(cam.worldToScreenCoords([10, 20, 30])).toBeCloseToVec2([10, 20]);
});

it("converts world to screen coords for zoom", () => {
    const cam = createCamera3d({ zoom: 10 });
    expect(cam.worldToScreenCoords([10, 20, 30])).toBeCloseToVec2([100, 200]);
});

it("converts world to screen coords for pos", () => {
    const cam = createCamera3d({ pos: [1, 2, 3] });
    expect(cam.worldToScreenCoords([10, 20, 30])).toBeCloseToVec2([10 - 1, 20 - 2]);
});

it("converts world to screen coords for orient", () => {
    const cam = createCamera3d({ orient: orient.fromAxisAngle([0, 1, 0], Math.PI / 2) });
    expect(cam.worldToScreenCoords([10, 20, 30])).toBeCloseToVec2([30, 20]);
});
