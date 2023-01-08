import { create } from "random-seed";

let r = create("");

export const seed = (s: string) => (r = create(s));

export default () => r(Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER;
