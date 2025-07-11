import { orient, vec3 } from "@peulicke/geometry";
import * as THREE from "three";

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

    const boxGeometry = new THREE.BoxGeometry(1, 1);
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const materials: Record<string, THREE.Material> = {};
    const ambientLight = new THREE.AmbientLight("white", 1);

    let color = "white";

    const transformations: THREE.Group[] = [];

    const extendTransformation = () => {
        const group = new THREE.Group();
        transformations[transformations.length - 1].add(group);
        transformations[transformations.length - 1] = group;
    };

    const geometries: Record<string, THREE.BufferGeometry> = {};

    return {
        begin: () => {
            scene.clear();
        },
        end: () => {
            const aspect = window.innerWidth / window.innerHeight;
            const camera = new THREE.OrthographicCamera(-aspect * 0.5, aspect * 0.5, 0.5, -0.5, 0.1, 1000);
            camera.position.set(0, 0, 1);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            scene.add(ambientLight);

            renderer.render(scene, camera);
        },
        context: (func: () => void) => {
            const group = new THREE.Group();
            if (transformations.length === 0) scene.add(group);
            else transformations[transformations.length - 1].add(group);
            transformations.push(group);
            func();
            transformations.pop();
        },
        translate: (pos: vec3.Vec3) => {
            extendTransformation();
            transformations[transformations.length - 1].translateX(pos[0]);
            transformations[transformations.length - 1].translateY(pos[1]);
            transformations[transformations.length - 1].translateZ(pos[2]);
        },
        scale: (s: vec3.Vec3) => {
            extendTransformation();
            transformations[transformations.length - 1].scale.x *= s[0];
            transformations[transformations.length - 1].scale.y *= s[1];
            transformations[transformations.length - 1].scale.z *= s[2];
        },
        rotate: (axis: vec3.Vec3, angle: number) => {
            extendTransformation();
            transformations[transformations.length - 1].rotateOnAxis(new THREE.Vector3(...axis).normalize(), angle);
        },
        orient: (o: orient.Orient) => {
            extendTransformation();
            transformations[transformations.length - 1].applyQuaternion(
                new THREE.Quaternion(o.v[0], o.v[1], o.v[2], o.w)
            );
        },
        color: (c: string) => {
            color = c;
        },
        box: () => {
            const material = materials[color] ?? new THREE.MeshPhongMaterial({ color });
            materials[color] = material;
            const mesh = new THREE.Mesh(boxGeometry, material);
            transformations[transformations.length - 1].add(mesh);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        },
        plane: () => {
            const material = materials[color] ?? new THREE.MeshPhongMaterial({ color });
            materials[color] = material;
            const mesh = new THREE.Mesh(planeGeometry, material);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            transformations[transformations.length - 1].add(mesh);
        },
        drawGeometry: (
            name: string,
            points: vec3.Vec3[],
            faces: [number, number, number][],
            vertexColors: vec3.Vec3[] | undefined = undefined
        ) => {
            if (geometries[name] === undefined) geometries[name] = createBufferGeometry(points, faces, vertexColors);
            const material =
                materials[color] ??
                new THREE.MeshPhongMaterial({
                    color: vertexColors === undefined ? color : undefined,
                    vertexColors: vertexColors !== undefined
                });
            materials[color] = material;
            const mesh = new THREE.Mesh(geometries[name], material);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            transformations[transformations.length - 1].add(mesh);
        },
        addLight: (dir: vec3.Vec3, color: vec3.Vec3 = [1, 1, 1], resolution = 1024, size = 1) => {
            const directionalLight = new THREE.DirectionalLight(new THREE.Color(...color));
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = resolution;
            directionalLight.shadow.mapSize.height = resolution;
            directionalLight.shadow.camera.left = -size;
            directionalLight.shadow.camera.right = size;
            directionalLight.shadow.camera.top = -size;
            directionalLight.shadow.camera.bottom = size;
            directionalLight.shadow.camera.near = -100;
            directionalLight.shadow.camera.far = 100;
            directionalLight.shadow.bias = -1e-4;
            directionalLight.position.set(...dir);
            const targetObject = new THREE.Object3D();
            directionalLight.target = targetObject;
            transformations[transformations.length - 1].add(directionalLight);
            transformations[transformations.length - 1].add(targetObject);
        }
    };
};

export type Graphics3d = ReturnType<typeof createGraphics3d>;
