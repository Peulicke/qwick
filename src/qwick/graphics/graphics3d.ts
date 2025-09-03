import { getEntries } from "@peulicke/algorithms/object";
import { orient, vec3 } from "@peulicke/geometry";
import {
    applyTransformation,
    combineTransformations,
    createTransformation,
    type Transformation
} from "@peulicke/geometry/transformation";
import type { Mesh } from "@peulicke/mesh/mesh";
import * as THREE from "three";

export const createMesh = (points: vec3.Vec3[], faces: vec3.Vec3[], color: vec3.Vec3): Mesh => ({
    points,
    faces,
    colors: points.map(() => color)
});

export const transformMesh = (mesh: Mesh, transformation: Transformation): Mesh => ({
    points: mesh.points.map(p => applyTransformation(p, transformation)),
    faces: mesh.faces,
    colors: mesh.colors
});

const mergeTwoMeshes = (a: Mesh, b: Mesh): Mesh => {
    return {
        points: [...a.points, ...b.points],
        faces: [
            ...a.faces,
            ...b.faces.map(([i, j, k]): vec3.Vec3 => [i + a.points.length, j + a.points.length, k + a.points.length])
        ],
        colors: [...a.colors, ...b.colors]
    };
};

export const mergeMeshes = (meshes: Mesh[]): Mesh => meshes.reduce((s, v) => mergeTwoMeshes(s, v));

export const createPlaneMesh = (color: vec3.Vec3): Mesh => {
    const points: vec3.Vec3[] = [
        [-1, 0, -1],
        [-1, 0, 1],
        [1, 0, 1],
        [1, 0, -1]
    ];
    return createMesh(
        points,
        [
            [0, 1, 2],
            [0, 2, 3]
        ],
        color
    );
};

export const createBoxMesh = (color: vec3.Vec3): Mesh => {
    const top = transformMesh(createPlaneMesh(color), createTransformation({ pos: [0, 1, 0] }));
    const bottom = transformMesh(top, createTransformation({ orient: orient.fromAxisAngle([1, 0, 0], Math.PI) }));
    const topBottom = mergeMeshes([top, bottom]);
    const leftRight = transformMesh(
        topBottom,
        createTransformation({ orient: orient.fromAxisAngle([0, 0, 1], Math.PI / 2) })
    );
    const frontBack = transformMesh(
        topBottom,
        createTransformation({ orient: orient.fromAxisAngle([1, 0, 0], Math.PI / 2) })
    );
    return mergeMeshes([topBottom, leftRight, frontBack]);
};

type Light = {
    dir: vec3.Vec3;
    color: vec3.Vec3;
    resolution: number;
    size: number;
};

export const createLight = (partialLight: Partial<Light>): Light => {
    const light: Light = {
        dir: [0, 1, 0],
        color: [1, 1, 1],
        resolution: 1024,
        size: 1
    };
    return { ...light, ...partialLight };
};

const createBufferGeometry = (
    points: vec3.Vec3[],
    faces: [number, number, number][],
    vertexColors: vec3.Vec3[] | undefined
) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    if (vertexColors !== undefined)
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(vertexColors.flat(), 3));
    geometry.setIndex(faces.flat());
    geometry.computeVertexNormals();
    return geometry;
};

const transformThreeObject = (object: THREE.Object3D, transformation: Transformation) => {
    object.position.set(...transformation.pos);
    object.scale.set(transformation.scale, transformation.scale, transformation.scale);
    object.quaternion.set(...transformation.orient.v, transformation.orient.w);
};

export const createGraphics3d = (backgroundColor: string) => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(backgroundColor));
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "-1";
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    renderer.clear();

    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight("white", 1);

    const transformations: Transformation[] = [createTransformation({})];
    const meshes: { mesh: Mesh; transformation: Transformation }[] = [];
    const lights: { light: Light; transformation: Transformation }[] = [];

    const threeMeshes: Record<symbol, THREE.InstancedMesh> = {};
    const threeLights: Record<symbol, { light: THREE.Light; target: THREE.Object3D }> = {};

    const meshIds = new WeakMap<Mesh, symbol>();
    const lightIds = new WeakMap<Light, symbol>();

    scene.add(ambientLight);
    return {
        begin: () => {
            meshes.forEach(({ mesh }) => {
                const id = meshIds.get(mesh);
                if (id !== undefined) threeMeshes[id].count = 0;
            });
            meshes.length = 0;
        },
        end: () => {
            meshes.forEach(({ mesh, transformation }) => {
                if (!meshIds.has(mesh)) {
                    const id = Symbol();
                    meshIds.set(mesh, id);
                    const g = createBufferGeometry(mesh.points, mesh.faces, mesh.colors);
                    const material = new THREE.MeshPhongMaterial({
                        vertexColors: true
                    });
                    const threeMesh = new THREE.InstancedMesh(g, material, 10000);
                    threeMesh.frustumCulled = false;
                    threeMesh.receiveShadow = true;
                    threeMesh.castShadow = true;
                    threeMesh.count = 0;
                    threeMeshes[id] = threeMesh;
                    scene.add(threeMesh);
                }
                const id = meshIds.get(mesh);
                if (id === undefined) throw new Error("mesh has no id");
                const index = threeMeshes[id].count ?? 0;
                threeMeshes[id].count = index + 1;

                const matrix = new THREE.Matrix4();
                const position = new THREE.Vector3(...transformation.pos);
                const quaternion = new THREE.Quaternion(...transformation.orient.v, transformation.orient.w);
                const scale = new THREE.Vector3(transformation.scale, transformation.scale, transformation.scale);

                matrix.compose(position, quaternion, scale);

                threeMeshes[id].setMatrixAt(index, matrix);
                threeMeshes[id].instanceMatrix.needsUpdate = true;
            });

            lights.forEach(({ light, transformation }) => {
                if (lightIds.has(light)) return;
                const id = Symbol();
                lightIds.set(light, id);
                const directionalLight = new THREE.DirectionalLight(new THREE.Color(...light.color));
                directionalLight.castShadow = true;
                directionalLight.shadow.mapSize.width = light.resolution;
                directionalLight.shadow.mapSize.height = light.resolution;
                directionalLight.shadow.camera.left = -light.size;
                directionalLight.shadow.camera.right = light.size;
                directionalLight.shadow.camera.top = -light.size;
                directionalLight.shadow.camera.bottom = light.size;
                directionalLight.shadow.camera.near = -100;
                directionalLight.shadow.camera.far = 100;
                directionalLight.shadow.bias = -1e-4;
                const targetObject = new THREE.Object3D();
                directionalLight.target = targetObject;
                scene.add(directionalLight);
                scene.add(targetObject);
                threeLights[id] = { light: directionalLight, target: targetObject };

                transformThreeObject(
                    threeLights[id].light,
                    combineTransformations([transformation, createTransformation({ pos: light.dir })])
                );
            });

            getEntries(threeLights).forEach(([key, threeLight]) => {
                if (lights.find(l => lightIds.get(l.light) === key)) return;
                scene.remove(threeLight.light);
                scene.remove(threeLight.target);
            });

            const aspect = window.innerWidth / window.innerHeight;
            const camera = new THREE.OrthographicCamera(-aspect * 0.5, aspect * 0.5, 0.5, -0.5, -1000, 1000);
            camera.position.set(0, 0, 1);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            renderer.render(scene, camera);
        },
        transformation: (transformation: Partial<Transformation>, func: () => void) => {
            transformations.push(
                combineTransformations([
                    transformations[transformations.length - 1],
                    createTransformation(transformation)
                ])
            );
            func();
            transformations.pop();
        },
        addMesh: (mesh: Mesh) => {
            meshes.push({
                mesh,
                transformation: transformations[transformations.length - 1]
            });
        },
        addLight: (light: Light) => {
            lights.push({
                light,
                transformation: createTransformation({
                    orient: transformations[transformations.length - 1].orient
                })
            });
        }
    };
};

export type Graphics3d = ReturnType<typeof createGraphics3d>;
