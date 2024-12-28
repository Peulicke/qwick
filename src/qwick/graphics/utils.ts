import { Vec3 } from "../vec3";

export const begin = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 3;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
};

export const end = (ctx: CanvasRenderingContext2D): void => {
    ctx.restore();
};

export const rgb2hsv = (rgb: Vec3): Vec3 => {
    const [r, g, b] = [...rgb];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max === min) return [0, s, v];
    let h = 0;
    if (max === r) h = g - b + d * (g < b ? 6 : 0);
    if (max === g) h = b - r + d * 2;
    if (max === b) h = r - g + d * 4;
    h /= 6 * d;
    return [h, s, v];
};

export const hsv2rgb = (hsv: Vec3): Vec3 => {
    const [h, s, v] = [...hsv];
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            return [v, t, p];
        case 1:
            return [q, v, p];
        case 2:
            return [p, v, t];
        case 3:
            return [p, q, v];
        case 4:
            return [t, p, v];
        case 5:
            return [v, p, q];
        default:
            return [0, 0, 0];
    }
};

export type Color = string | Vec3;

export const setColor = (ctx: CanvasRenderingContext2D, color: Color): void => {
    const colorString = typeof color === "string" ? color : `rgb(${color.map(c => 255 * c).join(",")})`;
    ctx.fillStyle = colorString;
    ctx.strokeStyle = colorString;
};
