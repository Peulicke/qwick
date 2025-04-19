import type { Graphics, Graphics3d } from "./qwick/graphics";
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

    const draw3d = (g: Graphics3d) => {
        g.context(() => {
            g.scale([0.1, 0.1, 0.1]);
            g.context(() => {
                g.color("gray");
                g.rotate([1, 0, 0], -Math.PI / 2);
                g.scale([100, 100, 100]);
                g.plane();
            });
            g.context(() => {
                g.color("red");
                g.translate([input.getMousePos()[0] * 10, 3, input.getMousePos()[1] * 10 * Math.SQRT2]);
                g.rotate([0, 1, 0], Math.PI / 8);
                g.box();
            });
            g.context(() => {
                g.color("blue");
                g.translate([1, 1, -1]);
                g.rotate([1, 1, 1], -Math.PI / 4);
                g.box();
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
