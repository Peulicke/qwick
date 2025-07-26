import { orient, type vec3 } from "@peulicke/geometry";
import type { Graphics, Graphics3d } from "./qwick/graphics";
import { createCamera3d } from "./qwick/graphics/camera3d";
import { createBoxMesh, createLight, createMesh, createPlaneMesh } from "./qwick/graphics/graphics3d";
import type { CreateQwickTest, TestSuite } from "./qwick/qwick-test";

const testA: CreateQwickTest = ({ input }) => {
    let pos = input.getMousePos();
    let size = 0.25;

    const scroll = (delta: number) => {
        size *= Math.pow(1.001, delta);
    };

    const update = () => {
        pos = input.getMousePos();
    };

    const draw = (graphics: Graphics) => {
        graphics.color("white");
        graphics.circle(pos, size);
    };

    return {
        scroll,
        update,
        draw
    };
};

export const testB: CreateQwickTest = () => {
    let x = 0;

    const draw = (graphics: Graphics) => {
        x += 0.001;
        graphics.color("black");
        graphics.translate([x, 0]);
        graphics.rotate(x);
        graphics.scale(0.5);
        graphics.square(false);
    };

    return { draw };
};

export const test3d: CreateQwickTest = ({ input }) => {
    const draw = (g: Graphics) => {
        g.context(() => {
            g.scale(0.1);
            g.translate([3, 1]);
            g.rotate(Math.PI / 8);
            g.square(false);
        });
    };

    const cam = createCamera3d({ zoom: 0.1, orient: orient.fromAxisAngle([1, 0, 0], Math.PI / 4) });

    const plane = createPlaneMesh([0.5, 0.5, 0.5]);
    const redBox = createBoxMesh([1, 0, 0]);
    const blueBox = createBoxMesh([0, 0, 1]);

    const points: vec3.Vec3[] = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    const faces: vec3.Vec3[] = [
        [1, 0, 2],
        [2, 0, 3],
        [3, 0, 1],
        [1, 2, 3]
    ];
    const customShape = createMesh(points, faces, [0, 1, 0]);
    const light = createLight({ dir: [0, 1, 0] });

    const draw3d = (g: Graphics3d) => {
        cam.context(g, () => {
            g.addLight(light);
            g.context(() => {
                g.scale(100);
                g.addMesh(plane);
            });
            g.context(() => {
                g.orient(orient.fromAxisAngle([0, 1, 0], Math.PI / 8));
                g.translate([input.getMousePos()[0] * 10, 3, input.getMousePos()[1] * 10 * Math.SQRT2]);
                g.addMesh(redBox);
            });
            g.context(() => {
                g.translate([1, 1, -1]);
                g.orient(orient.fromAxisAngle([1, 1, 1], -Math.PI / 4));
                g.addMesh(blueBox);
            });
            [...Array(10)].forEach((_, i) => {
                g.context(() => {
                    g.orient(orient.fromAxisAngle([0, 1, 0], Date.now() / 1000));
                    g.translate([-1 + i, 1, -1]);
                    g.addMesh(customShape);
                });
            });
        });
    };

    return { draw, draw3d };
};

export const test = (t: TestSuite) => {
    t.context("test", () => {
        t.test("white circle", testA);
        t.test("rotating black square", testB);
        t.test("3d", test3d);
    });
};
