import { Graphics } from "./qwick/graphics";
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

export const test = (t: TestSuite) => {
    t.context("test", () => {
        t.test("white circle", testA);
        t.test("rotating black square", testB);
    });
};
