import { Graphics } from "./qwick/graphics";
import { TestSuite } from "./qwick/qwickTest";

export const testA = (t: TestSuite) => {
    let x = 0;
    const draw = (graphics: Graphics) => {
        x += 0.001;
        graphics.color("white");
        graphics.circle([x, 0], 0.25);
    };
    t.test("white circle", { draw });
};

export const testB = (t: TestSuite) => {
    let x = 0;
    const draw = (graphics: Graphics) => {
        x += 0.001;
        graphics.color("black");
        graphics.translate([x, 0]);
        graphics.rotate(x);
        graphics.scale(0.5);
        graphics.square(false);
    };
    t.test("rotating black square", { draw });
};

export const test = (t: TestSuite) => {
    t.context("test", () => {
        testA(t);
        testB(t);
    });
};
