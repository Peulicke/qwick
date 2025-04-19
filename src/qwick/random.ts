import { create } from "random-seed";

let r = create("");

export const seed = (s: string) => (r = create(s));

export const rand = r.random;

export const randInt = r.intBetween;
