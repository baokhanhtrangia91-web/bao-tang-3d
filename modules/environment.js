import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function setupEnvironment(scene) {
    const W          = 80;
    const D          = 60;
    const H          = 15;
    const WALL_THICK = 1;

    const collidableWalls = [];
    const loader = new THREE.TextureLoader();

    // --- Textures ---
    const floorTex = loader.load('model/go2.jpg');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24);

    const wallTex = loader.load('model/tuong.jpg');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 2);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xdddddd, roughness: 1.0 });

    const ceilingTex = loader.load('model/trần gỗ.jpg');
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(32, 24);
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, color: 0xffffff, roughness: 0.5 });

    const woodTex = ceilingTex.clone();
    woodTex.needsUpdate = true;
    woodTex.repeat.set(2, 2);
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xdddddd, roughness: 0.5 });

    // --- Ánh sáng nền ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // --- Sàn ---
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D),
        new THREE.MeshStandardMaterial({ map: floorTex, color: 0xdddddd, roughness: 0.35 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Trần ---
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    scene.add(ceiling);

    // --- Helper: tạo tường phẳng ---
    function addWall(w, h, d, x, z) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        wall.position.set(x, h / 2, z);
        wall.castShadow    = true;
        wall.receiveShadow = true;
        scene.add(wall);
        collidableWalls.push(wall);
    }

    // --- Helper: tạo cổng vòm + viền gỗ ---
    function addArch(gapW, d, x, yBase, z, ry = 0) {
        const h = H - yBase;

        // Phần tường trám trên vòm
        const shape = new THREE.Shape();
        shape.moveTo(-gapW / 2, 0);
        shape.absarc(0, 0, gapW / 2, Math.PI, 0, true);
        shape.lineTo(gapW / 2, h);
        shape.lineTo(-gapW / 2, h);
        shape.lineTo(-gapW / 2, 0);

        const archGeo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 12 });
        archGeo.translate(0, -h / 2, -d / 2);

        const archMesh = new THREE.Mesh(archGeo, wallMat);
        archMesh.position.set(x, yBase + h / 2, z);
        archMesh.rotation.y = ry;
        archMesh.castShadow = archMesh.receiveShadow = true;
        scene.add(archMesh);
        collidableWalls.push(archMesh);

        // Viền gỗ ôm vòm
        const trimW      = 0.4;
        const innerOffset = 0.05;
        const trimDepth  = d + 0.15;
        const r1 = gapW / 2 - innerOffset;
        const r2 = gapW / 2 + trimW;

        const trimShape = new THREE.Shape();
        trimShape.moveTo(-r1, -yBase);
        trimShape.lineTo(-r1, 0);
        trimShape.absarc(0, 0, r1, Math.PI, 0, true);
        trimShape.lineTo(r1, -yBase);
        trimShape.lineTo(r2, -yBase);
        trimShape.lineTo(r2, 0);
        trimShape.absarc(0, 0, r2, 0, Math.PI, false);
        trimShape.lineTo(-r2, -yBase);
        trimShape.lineTo(-r1, -yBase);

        const trimGeo = new THREE.ExtrudeGeometry(trimShape, { depth: trimDepth, bevelEnabled: false, curveSegments: 12 });
        trimGeo.translate(0, 0, -trimDepth / 2);

        const trimMesh = new THREE.Mesh(trimGeo, woodMat);
        trimMesh.position.set(x, yBase, z);
        trimMesh.rotation.y = ry;
        trimMesh.castShadow = trimMesh.receiveShadow = true;
        scene.add(trimMesh);
        collidableWalls.push(trimMesh);
    }

    // --- Tường bao & vách ngăn ---
    addWall(80,         H, WALL_THICK,  0,     -29.5);
    addWall(WALL_THICK, H, 58,         -39.5,   0);
    addWall(WALL_THICK, H, 58,          39.5,   0);
    addWall(8,          H, WALL_THICK,  0,      29.5);
    addWall(36,         H, WALL_THICK, -22,     29.5);
    addWall(36,         H, WALL_THICK,  22,     29.5);
    addWall(12,         H, WALL_THICK,  20,     15);
    addWall(WALL_THICK, H, 47,         -14,    -5.5);
    addWall(WALL_THICK, H, 4,          -14,     27);
    addArch(7, WALL_THICK, -14, 6, 21.5, Math.PI / 2);
    addWall(WALL_THICK, H, 47,          14,    -5.5);
    addWall(WALL_THICK, H, 4,           14,     27);
    addArch(7, WALL_THICK,  14, 6, 21.5, Math.PI / 2);
    addWall(9.5,        H, WALL_THICK, -8.75,   15);
    addWall(9.5,        H, WALL_THICK,  8.75,   15);
    addArch(8, WALL_THICK,   0, 6, 15,   0);
    addWall(15,         H, WALL_THICK,  31.5,  -5);

    // --- Bục trưng bày ---
    const statueZ = -7;
    const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(7, 1.5, 7),
        new THREE.MeshStandardMaterial({ color: 0xdddddd })
    );
    pedestal.position.set(0, 0.75, statueZ);
    pedestal.castShadow = pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Đèn rọi tượng
    const statueLight = new THREE.SpotLight(0xfff0dd, 800);
    statueLight.position.set(5, 14, statueZ + 15);
    statueLight.angle    = Math.PI / 4.5;
    statueLight.penumbra = 0.5;
    statueLight.decay    = 2;
    statueLight.distance = 60;
    statueLight.castShadow = true;
    statueLight.shadow.mapSize.set(1024, 1024);
    statueLight.shadow.bias = -0.001;
    statueLight.target.position.set(0, 0, statueZ);
    scene.add(statueLight, statueLight.target);

    // Model tượng
    new GLTFLoader().load(
        'model/ghe_dai.glb',
        (gltf) => {
            const model = gltf.scene;
            model.position.set(0, 1.5, statueZ);
            model.scale.setScalar(4);
            model.traverse(n => { if (n.isMesh) n.castShadow = true; });
            scene.add(model);
        },
        undefined,
        (err) => console.error('Lỗi tải model:', err)
    );

    // --- Đèn trần ---
    function addCeilingLight(x, z) {
        const bulb = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 2.5),
            new THREE.MeshBasicMaterial({ color: 0xffffee })
        );
        bulb.position.set(x, H - 0.05, z);
        scene.add(bulb);

        const light = new THREE.PointLight(0xffffee, 150, 28);
        light.position.set(x, H - 0.5, z);
        scene.add(light);
    }

    addCeilingLight(-27, -15);
    addCeilingLight(-27,   5);
    addCeilingLight(  0, -20);
    addCeilingLight(  0,   5);
    addCeilingLight( 27, -18);
    addCeilingLight( 27,  10);
    addCeilingLight(  0,  22);

    return { collidableWalls };
}
