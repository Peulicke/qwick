import "./index.css";
import { createCanvas } from "./canvas";
import { Graphics, createGraphics } from "./graphics";
import { InputType, createInput } from "./input";
import { createButton } from "./button";

export type QwickTest = {
    input?: (type: InputType, down: boolean) => void;
    update?: () => void;
    draw?: (graphics: Graphics) => void;
};

export const runTestMenu = (testNames: string[]) => {
    const canvas = createCanvas();
    const input = createInput();
    const graphics = createGraphics(canvas.ctx, "gray");

    const buttons = testNames.map((name, i) =>
        createButton(input.getMousePos, [0, 0.07 * (i - (testNames.length - 1) / 2)], [0.3, 0.03], name)
    );
    input.listeners.resize = () => canvas.resize();
    input.listeners.input = (type, down) => {
        buttons.forEach((button, i) => {
            button.input(type, down);
            if (button.clicked) window.location.href += "/" + testNames[i];
        });
    };

    const t = setInterval(() => {
        graphics.begin();
        graphics.context(() => {
            graphics.normalize();
            buttons.forEach(button => {
                button.draw(graphics);
            });
        });
        graphics.end();
        input.clear();
    }, 1000 / 60);

    return () => {
        canvas.destroy();
        input.destroy();
        clearInterval(t);
    };
};

export const runTest = (qwickTest: QwickTest) => {
    const canvas = createCanvas();
    const input = createInput();
    const graphics = createGraphics(canvas.ctx, "gray");

    input.listeners.resize = () => canvas.resize();
    input.listeners.input = qwickTest.input;

    const t = setInterval(() => {
        if (qwickTest.update) qwickTest.update();
        graphics.begin();
        graphics.context(() => {
            graphics.normalize();
            if (qwickTest.draw) qwickTest.draw(graphics);
        });
        graphics.end();
        input.clear();
    }, 1000 / 60);

    return () => {
        canvas.destroy();
        input.destroy();
        clearInterval(t);
    };
};

const isSamePath = (a: string[], b: string[]) => a.join("/") === b.join("/");

export const createTestSuite = (locationPath: string[]) => {
    const path: string[] = [];
    const names: string[] = [];

    const pushToNames = (name: string) => {
        if (isSamePath([...locationPath, name], path)) names.push(name);
    };

    const context = (name: string, func: () => void) => {
        path.push(name);
        pushToNames(name);
        func();
        if (isSamePath(locationPath, path)) {
            runTestMenu([...names]);
            names.length = 0;
        }
        path.pop();
    };

    const test = (name: string, qwickTest: QwickTest) => {
        path.push(name);
        pushToNames(name);
        if (isSamePath(locationPath, path)) runTest(qwickTest);
        path.pop();
    };

    return {
        context,
        test
    };
};

export type TestSuite = ReturnType<typeof createTestSuite>;
