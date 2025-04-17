import { Vec2 } from "@peulicke/geometry/vec2";
import { Grid } from "./grid";

export const sizeOfGrid = <T>(grid: Grid<T>): Vec2 => [grid.length, grid[0].length];
