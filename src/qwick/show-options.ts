export type ShowOptions = {
    menu: boolean;
    restart: boolean;
    fastForward: boolean;
    level: boolean;
};

export const defaultShowOptions = (): ShowOptions => ({
    menu: true,
    restart: true,
    fastForward: true,
    level: true
});
