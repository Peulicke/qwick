export const createCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const destroy = () => {
        document.body.removeChild(canvas);
    };

    return {
        canvas: canvas,
        resize,
        destroy
    };
};

export type Canvas = ReturnType<typeof createCanvas>;
