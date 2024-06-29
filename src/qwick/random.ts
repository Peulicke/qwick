import { create } from "random-seed";

let r = create("");

export const seed = (s: string) => (r = create(s));

export const rand = () => r(Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER;

export const randInt = (min: number, max: number) => Math.floor(rand() * (max - min)) + min;

export default rand;
