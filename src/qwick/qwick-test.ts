import "./index.css";
import { createCanvas } from "./canvas";
import { Graphics, Graphics3d, createGraphics } from "./graphics";
import { Input, InputType, createInput } from "./input";
import { createButton } from "./button";
import { vec2 } from ".";

const buttonHeight = 0.03;
const charWidth = 0.3;

export type QwickTest = {
    input?: (type: InputType, down: boolean) => void;
    scroll?: (delta: number) => void;
    update?: () => void;
    draw?: (graphics: Graphics) => void;
    draw3d?: (graphics3d: Graphics3d) => void;
};

export type CreateQwickTest = ({ input }: { input: Input }) => QwickTest;

export const runTestMenu = (testNames: string[]) => {
    const canvas = createCanvas();
    const input = createInput();
    const graphics = createGraphics(canvas, "gray");

    const buttons = testNames.map((name, i) =>
        createButton(
            input.getMousePos,
            vec2.createRect(
                [0, 0.07 * (i - (testNames.length - 1) / 2)],
                vec2.scale([name.length * charWidth, 1], buttonHeight)
            ),
            name
        )
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

export const runTest = (createQwickTest: CreateQwickTest) => {
    const canvas = createCanvas();
    const input = createInput();
    const graphics = createGraphics(canvas, "gray");

    const qwickTest = createQwickTest({ input });

    input.listeners.resize = () => canvas.resize();
    input.listeners.input = qwickTest.input;
    input.listeners.scroll = qwickTest.scroll;

    const t = setInterval(() => {
        if (qwickTest.update) qwickTest.update();
        graphics.begin();
        graphics.get3d().context(() => {
            if (qwickTest.draw3d) qwickTest.draw3d(graphics.get3d());
        });
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

    const test = (name: string, createQwickTest: CreateQwickTest) => {
        path.push(name);
        pushToNames(name);
        if (isSamePath(locationPath, path)) runTest(createQwickTest);
        path.pop();
    };

    return {
        context,
        test
    };
};

export type TestSuite = ReturnType<typeof createTestSuite>;
