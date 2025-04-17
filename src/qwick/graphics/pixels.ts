import { vec3 } from "@peulicke/geometry";

export type Pixel = {
    color: vec3.Vec3;
    alpha: number;
};

export type Pixels = Pixel[][];

export const getTransparent = (): Pixel => ({ color: [0, 0, 0], alpha: 0 });

const waitForLoad = (img: HTMLImageElement): Promise<HTMLImageElement> =>
    new Promise(resolve => {
        img.onload = () => {
            resolve(img);
        };
    });

export const pixelsToImage = async (pixels: Pixels) => {
    const canvas = document.createElement("canvas");
    canvas.width = pixels.length;
    canvas.height = pixels[0].length;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new Image();
    const image = ctx.createImageData(pixels.length, pixels[0].length);
    pixels.forEach((col, i) => {
        col.forEach((pixel, j) => {
            image.data[4 * (i + j * pixels.length)] = pixel.color[0] * 255;
            image.data[4 * (i + j * pixels.length) + 1] = pixel.color[1] * 255;
            image.data[4 * (i + j * pixels.length) + 2] = pixel.color[2] * 255;
            image.data[4 * (i + j * pixels.length) + 3] = pixel.alpha * 255;
        });
    });
    ctx.putImageData(image, 0, 0);
    const url = canvas.toDataURL("image/png");
    const img = new Image(pixels.length, pixels[0].length);
    img.src = url;
    return await waitForLoad(img);
};

export const loadImage = (src: string): HTMLImageElement => {
    const image = new Image();
    image.src = src;
    return image;
};
