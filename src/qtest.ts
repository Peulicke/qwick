import { Graphics } from "./qwick/graphics";
import { createTest } from "./qwick/test";

let x = 0;

const draw = (graphics: Graphics) => {
    x += 0.001;
    graphics.color("white");
    graphics.circle([x, 0], 0.5);
};

createTest({ draw });
