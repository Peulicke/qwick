import * as THREE from "three";
import { vec3 } from "..";

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
    const directionalLight = new THREE.DirectionalLight("white", 2); // 2 seems to make the brightest color white
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = window.innerWidth;
    directionalLight.shadow.mapSize.height = window.innerHeight;
    const size = 0.9;
    directionalLight.shadow.camera.left = -size * 2;
    directionalLight.shadow.camera.right = size * 2;
    directionalLight.shadow.camera.top = -size;
    directionalLight.shadow.camera.bottom = size;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.position.set(-0.1, 8, 1);

    let color = "white";

    let zoom = 1;

    const transformations: THREE.Group[] = [];

    const extendTransformation = () => {
        const group = new THREE.Group();
        transformations[transformations.length - 1].add(group);
        transformations[transformations.length - 1] = group;
    };

    return {
        begin: () => {
            scene.clear();
        },
        end: () => {
            const aspect = window.innerWidth / window.innerHeight;
            const camera = new THREE.OrthographicCamera(
                -aspect * 0.5 * zoom,
                aspect * 0.5 * zoom,
                0.5 * zoom,
                -0.5 * zoom,
                0.1,
                1000
            );
            camera.position.set(0, 1, 1);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            scene.add(ambientLight);
            scene.add(directionalLight);

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
        color: (c: string) => {
            color = c;
        },
        zoom: (z: number) => {
            zoom = z;
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
        }
    };
};

export type Graphics3d = ReturnType<typeof createGraphics3d>;
