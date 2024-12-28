import { Graphics, Graphics3d } from "./qwick/graphics";
import { CreateQwickTest, TestSuite } from "./qwick/qwick-test";

const testA: CreateQwickTest = ({ input }) => {
    let pos = input.getMousePos();

    const update = () => {
        pos = input.getMousePos();
    };

    const draw = (graphics: Graphics) => {
        graphics.color("white");
        graphics.circle(pos, 0.25);
    };

    return {
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

export const test3d: CreateQwickTest = () => {
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
                g.color("red");
                g.translate([3, 0, -1]);
                g.rotate([0, 1, 0], Math.PI / 8);
                g.box();
            });
            g.context(() => {
                g.color("blue");
                g.translate([1, 0, -1]);
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
