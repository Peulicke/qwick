import type { Graphics, Graphics3d } from "./graphics";
import type { MouseInputType } from "./input";

export type Ui = {
    update: () => void;
    draw: (graphics: Graphics) => void;
    draw3d: (graphics: Graphics3d) => void;
    input: (type: MouseInputType, down: boolean) => void;
    scroll: (delta: number) => void;
    resize: () => void;
};

export const defaultUi = (): Ui => ({
    update: () => {},
    draw: () => {},
    draw3d: () => {},
    input: () => {},
    scroll: () => {},
    resize: () => {}
});
