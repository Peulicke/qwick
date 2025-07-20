import { orient } from "@peulicke/geometry";
import { expect, it } from "vitest";
import { createCamera3d, linePlaneIntersection } from "./camera3d";

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

it("gets intersection of plane and line", () => {
    expect(
        linePlaneIntersection({ from: [0, 0, 0], to: [0, 1, 0] }, { pos: [0, 0, 0], dir: [0, 1, 0] })
    ).toBeCloseToVec3([0, 0, 0]);
    expect(
        linePlaneIntersection({ from: [0, 0, 0], to: [0, 1, 0] }, { pos: [0, 10, 0], dir: [1, 1, 1] })
    ).toBeCloseToVec3([0, 10, 0]);
    expect(
        linePlaneIntersection({ from: [-1, -2, -3], to: [1, 2, 3] }, { pos: [0, 0, 0], dir: [1, 1, 1] })
    ).toBeCloseToVec3([0, 0, 0]);
    expect(
        linePlaneIntersection({ from: [-1, -2, -3], to: [1, 2, 3] }, { pos: [2, 4, 6], dir: [1, 3, 5] })
    ).toBeCloseToVec3([2, 4, 6]);
});
