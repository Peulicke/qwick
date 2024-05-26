export const createCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Can't get canvas context");

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const destroy = () => {
        document.body.removeChild(canvas);
    };

    return {
        canvas,
        ctx,
        resize,
        destroy
    };
};
