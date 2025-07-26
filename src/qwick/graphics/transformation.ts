import { orient, vec3 } from "@peulicke/geometry";

const epsilon = 1e-6;

export type Transformation = {
    pos: vec3.Vec3;
    orient: orient.Orient;
    scale: number;
};

export const createTransformation = (partialTransformation: Partial<Transformation>): Transformation => {
    const identityTransformation: Transformation = {
        pos: [0, 0, 0],
        orient: orient.identity(),
        scale: 1
    };
    return { ...identityTransformation, ...partialTransformation };
};

const combineTwoTransformations = (t1: Transformation, t2: Transformation): Transformation => ({
    pos: vec3.add(t1.pos, vec3.scale(orient.rotateVec3(t1.orient, t2.pos), t1.scale)),
    orient: orient.combine([t2.orient, t1.orient]),
    scale: t1.scale * t2.scale
});

export const combineTransformations = (t: Transformation[]): Transformation =>
    t.reduce((s, v) => combineTwoTransformations(s, v), createTransformation({}));

const floatEqual = (a: number, b: number): boolean => Math.abs(a - b) < epsilon;

export const vec3Equal = (a: vec3.Vec3, b: vec3.Vec3): boolean => vec3.length(vec3.sub(a, b)) < epsilon;

export const orientEqual = (a: orient.Orient, b: orient.Orient): boolean =>
    (vec3Equal(a.v, b.v) && floatEqual(a.w, b.w)) || (vec3Equal(a.v, vec3.negate(b.v)) && floatEqual(a.w, -b.w)); // Flipping the sign of an orientation makes no difference

export const transformationEqual = (t1: Transformation, t2: Transformation): boolean =>
    vec3Equal(t1.pos, t2.pos) && orientEqual(t1.orient, t2.orient) && floatEqual(t1.scale, t2.scale);

export const getInverseTransformation = (t: Transformation): Transformation => {
    const inverseOrient = orient.inverse(t.orient);
    const inversePos = vec3.scale(orient.rotateVec3(inverseOrient, vec3.negate(t.pos)), 1 / t.scale);
    return {
        pos: inversePos,
        orient: inverseOrient,
        scale: 1 / t.scale
    };
};

export const applyTransformation = (pos: vec3.Vec3, transformation: Transformation): vec3.Vec3 =>
    combineTransformations([transformation, createTransformation({ pos })]).pos;
