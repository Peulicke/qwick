export const begin = (ctx: CanvasRenderingContext2D): void => {
    const aspectRatio = ctx.canvas.width / ctx.canvas.height;
    ctx.save();
    ctx.scale(ctx.canvas.height, ctx.canvas.height);
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, aspectRatio, 1);
    ctx.lineWidth = 3;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.translate(aspectRatio / 2, 1 / 2);
};

export const end = (ctx: CanvasRenderingContext2D): void => {
    ctx.restore();
};

export const setColor = (ctx: CanvasRenderingContext2D, color: string): void => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
};
