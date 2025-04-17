import { vec2 } from "@peulicke/geometry";

export enum TransformType {
    Translate,
    Scale,
    Composite
}

export type Transform2 =
    | {
          type: TransformType.Translate;
          value: vec2.Vec2;
      }
    | {
          type: TransformType.Scale;
          value: number;
      }
    | {
          type: TransformType.Composite;
          value: Transform2[];
      };

export const translate = (value: vec2.Vec2): Transform2 => ({ type: TransformType.Translate, value });

export const scale = (value: number): Transform2 => ({ type: TransformType.Scale, value });

export const compose = (value: Transform2[]): Transform2 => ({ type: TransformType.Composite, value });

export const apply = (transform: Transform2, value: vec2.Vec2): vec2.Vec2 => {
    if (transform.type === TransformType.Translate) return vec2.add(value, transform.value);
    if (transform.type === TransformType.Scale) return vec2.scale(value, transform.value);
    return transform.value.reduce((s, v) => apply(v, s), value);
};

export const inverse = (transform: Transform2): Transform2 => {
    if (transform.type === TransformType.Translate)
        return { type: transform.type, value: vec2.negate(transform.value) };
    if (transform.type === TransformType.Scale) return { type: transform.type, value: 1 / transform.value };
    return { type: transform.type, value: transform.value.map(t => inverse(t)).reverse() };
};
