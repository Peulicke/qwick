import { Graphics } from "./qwick/graphics";
import { TestSuite } from "./qwick/qwickTest";

export const test = (qTest: TestSuite) => {
    qTest.context("test", () => {
        let x = 0;

        const draw = (graphics: Graphics) => {
            x += 0.001;
            graphics.color("white");
            graphics.circle([x, 0], 0.5);
        };

        qTest.test({ draw });
    });
};
