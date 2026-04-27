import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function setupEnvironment(scene) {
    const W = 80;
    const D = 60;
    const H = 15;
    const WALL_THICK = 1;

    const collidableWalls = [];
    const loader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

    const colliderMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });

    // === TEXTURES ===
    const floorTex = loader.load('model/go2.jpg');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24);
    floorTex.colorSpace = THREE.SRGBColorSpace;

    const wallTex = loader.load('model/tuong.jpg');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 2);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xFFDFC4, roughness: 0.85, metalness: 0.0 });

    const ceilingTex = loader.load('model/trần gỗ.jpg');
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(32, 24);
    ceilingTex.colorSpace = THREE.SRGBColorSpace;
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, color: 0xfff8f0, roughness: 0.8 });

    const woodTex = ceilingTex.clone();
    woodTex.needsUpdate = true;
    woodTex.repeat.set(2, 2);
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xe0d5c0, roughness: 0.5 });

    // === ÁNH SÁNG MÔI TRƯỜNG (tối ưu) ===
    const ambient = new THREE.AmbientLight(0xfff8f0, 1.0);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xfff5e8, 0x3a2a18, 0.5);
    hemiLight.position.set(0, H, 0);
    scene.add(hemiLight);

    // === SÀN ===
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D),
        new THREE.MeshStandardMaterial({ map: floorTex, color: 0xcccccc, roughness: 0.6, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // === TRẦN ===
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    scene.add(ceiling);

    // === HELPERS ===
    function addBoxCollider(w, h, d, x, y, z, ry = 0) {
        const collider = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), colliderMat);
        collider.position.set(x, y, z);
        collider.rotation.y = ry;
        scene.add(collider);
        collidableWalls.push(collider);
    }

    function addWall(w, h, d, x, z) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        wall.position.set(x, h / 2, z);
        wall.receiveShadow = true;
        scene.add(wall);
        addBoxCollider(w, h, d, x, h / 2, z);
    }

    function addArch(gapW, d, x, yBase, z, ry = 0) {
        const h = H - yBase;
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
        archMesh.receiveShadow = true;
        scene.add(archMesh);

        const trimW = 0.4, innerOffset = 0.05, trimDepth = d + 0.15;
        const r1 = gapW / 2 - innerOffset, r2 = gapW / 2 + trimW;
        const trimShape = new THREE.Shape();
        trimShape.moveTo(-r1, -yBase); trimShape.lineTo(-r1, 0);
        trimShape.absarc(0, 0, r1, Math.PI, 0, true);
        trimShape.lineTo(r1, -yBase); trimShape.lineTo(r2, -yBase); trimShape.lineTo(r2, 0);
        trimShape.absarc(0, 0, r2, 0, Math.PI, false);
        trimShape.lineTo(-r2, -yBase); trimShape.lineTo(-r1, -yBase);

        const trimGeo = new THREE.ExtrudeGeometry(trimShape, { depth: trimDepth, bevelEnabled: false, curveSegments: 12 });
        trimGeo.translate(0, 0, -trimDepth / 2);
        const trimMesh = new THREE.Mesh(trimGeo, woodMat);
        trimMesh.position.set(x, yBase, z);
        trimMesh.rotation.y = ry;
        scene.add(trimMesh);
    }

    // === TƯỜNG BAO & VÁCH NGĂN ===
    addWall(80, H, WALL_THICK, 0, -29.5);
    addWall(WALL_THICK, H, 58, -39.5, 0);
    addWall(WALL_THICK, H, 58, 39.5, 0);
    addWall(8, H, WALL_THICK, 0, 29.5);
    addWall(36, H, WALL_THICK, -22, 29.5);
    addWall(36, H, WALL_THICK, 22, 29.5);
    addWall(12, H, WALL_THICK, 20, 15);
    addWall(WALL_THICK, H, 47, -14, -5.5);
    addWall(WALL_THICK, H, 4, -14, 27);
    addArch(7, WALL_THICK, -14, 6, 21.5, Math.PI / 2);
    addWall(WALL_THICK, H, 47, 14, -5.5);
    addWall(WALL_THICK, H, 4, 14, 27);
    addArch(7, WALL_THICK, 14, 6, 21.5, Math.PI / 2);
    addWall(9.5, H, WALL_THICK, -8.75, 15);
    addWall(9.5, H, WALL_THICK, 8.75, 15);
    addArch(8, WALL_THICK, 0, 6, 15, 0);
    addWall(15, H, WALL_THICK, 31.5, -5);

    // ====================================================
    // BỆ TRƯNG BÀY — helper tạo bệ
    // ====================================================
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3, metalness: 0.9 });

    function createPedestal(cx, cz, width) {
        width = width || 7;
        const g = new THREE.Group();
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.08, metalness: 0.15 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(width, 1.4, width), whiteMat);
        base.position.set(0, 0.7, 0);
        base.castShadow = true; base.receiveShadow = true;
        g.add(base);

        const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.2, width + 0.4), goldMat);
        top.position.set(0, 1.5, 0);
        top.castShadow = true; top.receiveShadow = true;
        g.add(top);

        const bottom = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.2, width + 0.4), goldMat);
        bottom.position.set(0, 0.1, 0);
        bottom.receiveShadow = true;
        g.add(bottom);

        g.position.set(cx, 0, cz);
        scene.add(g);
        addBoxCollider(width + 0.5, 5.0, width + 0.5, cx, 2.5, cz);
    }

    // Bệ chính giữa sảnh (tượng xe tăng Da Vinci)
    const statueZ = -7;
    createPedestal(0, statueZ, 7);

    // ====================================================
    // 3 BỆ PHÒNG BÊN TRÁI 
    // ====================================================
    const LEFT_X = -26.75;
    const LEFT_BED_W = 4.5;
    const leftZPositions = [-14, 0, 14];

    for (let i = 0; i < leftZPositions.length; i++) {
        createPedestal(LEFT_X, leftZPositions[i], LEFT_BED_W);
    }

    // Đèn rọi xuống từng bệ ở phòng trái
    for (let i = 0; i < leftZPositions.length; i++) {
        const pz = leftZPositions[i];
        const sp = new THREE.SpotLight(0xfff0dd, 280);
        sp.position.set(LEFT_X + 5, 13, pz + 3);
        sp.angle = Math.PI / 6;
        sp.penumbra = 0.4;
        sp.decay = 2;
        sp.distance = 28;
        sp.castShadow = false;
        sp.target.position.set(LEFT_X, 1.5, pz);
        scene.add(sp, sp.target);
    }

    // === RÀO CHẮN VIP (bệ chính) ===
    const barrierSize = 11;
    const barrierOffset = barrierSize / 2;
    const ropeWallH = 2.5;

    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ + barrierOffset);
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ - barrierOffset);
    addBoxCollider(0.3, ropeWallH, barrierSize, -barrierOffset, ropeWallH / 2, statueZ);
    addBoxCollider(0.3, ropeWallH, barrierSize, barrierOffset, ropeWallH / 2, statueZ);

    gltfLoader.load('model/vip_rope_barrier.glb', (gltf) => {
        const rawModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(rawModel);
        const scaleFactor = 2.8 / box.getSize(new THREE.Vector3()).y;
        rawModel.scale.setScalar(scaleFactor);

        const newBox = new THREE.Box3().setFromObject(rawModel);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        rawModel.position.x = -newCenter.x;
        rawModel.position.y = -newBox.min.y;
        rawModel.position.z = -newCenter.z;

        const wrap = new THREE.Group();
        wrap.add(rawModel);

        function placeBarrier(x, z, rotY) {
            const clone = wrap.clone();
            clone.position.set(x, 0, z);
            clone.rotation.y = rotY;
            clone.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            scene.add(clone);
        }

        placeBarrier(0, statueZ + barrierOffset, 0);
        placeBarrier(0, statueZ - barrierOffset, Math.PI);
        placeBarrier(-barrierOffset, statueZ, Math.PI / 2);
        placeBarrier(barrierOffset, statueZ, -Math.PI / 2);
    }, undefined, err => console.error('Lỗi tải rào chắn VIP:', err));

    // === ĐÈN RỌI TƯỢNG CHÍNH ===
    const statueLight = new THREE.SpotLight(0xfff0dd, 400);
    // SỬA Ở ĐÂY: Chuyển x = 0 và z = statueZ để đèn nằm ngay trên đỉnh đầu tượng
    statueLight.position.set(0, 13.5, statueZ);
    statueLight.angle = Math.PI / 5;
    statueLight.penumbra = 0.4;
    statueLight.decay = 2;
    statueLight.distance = 55;
    statueLight.castShadow = true;
    statueLight.shadow.mapSize.set(1024, 1024);
    statueLight.shadow.bias = -0.001;
    statueLight.target.position.set(0, 1.5, statueZ);
    scene.add(statueLight, statueLight.target);

    const statueFill = new THREE.SpotLight(0xc8deff, 60);
    // SỬA Ở ĐÂY: Tương tự, đặt x = 0 và z = statueZ, đưa đèn lên cao một chút (y = 12)
    statueFill.position.set(0, 12, statueZ);
    statueFill.angle = Math.PI / 4;
    statueFill.penumbra = 0.8;
    statueFill.decay = 2;
    statueFill.distance = 30;
    statueFill.castShadow = false;
    statueFill.target.position.set(0, 1.5, statueZ);
    scene.add(statueFill, statueFill.target);

    // === MODEL TƯỢNG CHÍNH ===
    gltfLoader.load('model/da_vinci_tank.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 1.3, statueZ);
        model.scale.setScalar(80);
        model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải model:', err));

    // ====================================================
    // ĐÈN CHÙM
    // ====================================================
    function addChandelier(x, z) {
        const light = new THREE.PointLight(0xffeacc, 110, 32);
        light.position.set(x, H - 4.5, z);
        light.castShadow = false;
        scene.add(light);

        gltfLoader.load('model/chandelier (2).glb', (gltf) => {
            const model = gltf.scene;
            model.position.set(x, H - 5, z);
            model.scale.setScalar(25);
            model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            scene.add(model);
        }, undefined, err => console.error('Lỗi tải đèn chùm:', err));
    }

    // Phòng trái
    addChandelier(-27, -15);
    addChandelier(-27, 0);
    addChandelier(-27, 15);
    // Sảnh giữa
    addChandelier(0, -7);
    addChandelier(0, 22);
    // Phòng phải
    addChandelier(27, -15.5);
    addChandelier(27, 5);
    addChandelier(27, 22);

    // ====================================================
    // NỘI THẤT: GHẾ, ĐÈN SÀN, CỘT
    // ====================================================
    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b6340, roughness: 0.75, metalness: 0.02 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95, metalness: 0.0 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9 });

    function addBench(x, z, ry) {
        ry = ry || 0;
        const g = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.75), lightWoodMat);
        seat.position.set(0, 0.9, 0); seat.receiveShadow = true; g.add(seat);
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.6), cushionMat);
        cushion.position.set(0, 1.0, 0); cushion.receiveShadow = true; g.add(cushion);
        for (const [lx, lz] of [[-1.15, -0.3], [1.15, -0.3], [-1.15, 0.3], [1.15, 0.3]]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), metalMat);
            leg.position.set(lx, 0.45, lz); g.add(leg);
        }
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.05), metalMat);
        crossbar.position.set(0, 0.25, 0); g.add(crossbar);
        g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
        addBoxCollider(2.8, 1.1, 0.8, x, 0.55, z, ry);
    }

    addBench(-8, 10, 0);
    addBench(8, 10, Math.PI);
    addBench(-20, -8, Math.PI / 2);
    addBench(20, -8, -Math.PI / 2);
    addBench(-30, -8, 0);
    addBench(30, -8, 0);
    addBench(-30, 8, 0);
    addBench(30, 8, 0);

    function addFloorLamp(x, z) {
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.2, 10), metalMat);
        pole.position.set(0, 1.1, 0); g.add(pole);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 16), metalMat);
        base.position.set(0, 0.03, 0); base.receiveShadow = true; g.add(base);
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.18, 0.35, 16, 1, true),
            new THREE.MeshStandardMaterial({ color: 0xf5dfa0, roughness: 0.8, side: THREE.DoubleSide })
        );
        shade.position.set(0, 2.38, 0); g.add(shade);
        const lampLight = new THREE.PointLight(0xffe8a0, 20, 8, 2);
        lampLight.position.set(0, 2.2, 0); g.add(lampLight);
        const glowBulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffe8a0 })
        );
        glowBulb.position.set(0, 2.2, 0); g.add(glowBulb);
        g.position.set(x, 0, z); scene.add(g);
    }

    addFloorLamp(-36, -22);
    addFloorLamp(36, -22);
    addFloorLamp(-36, 18);
    addFloorLamp(36, 18);
    addFloorLamp(-5, 24);
    addFloorLamp(5, 24);

    function addColumn(x, z) {
        const g = new THREE.Group();
        const colMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.05 });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 16), colMat);
        shaft.position.set(0, (H - 0.5) / 2, 0); shaft.receiveShadow = true; g.add(shaft);
        const capital = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), colMat);
        capital.position.set(0, H - 0.45, 0); g.add(capital);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), colMat);
        base.position.set(0, 0.15, 0); g.add(base);
        g.position.set(x, 0, z); scene.add(g);
        addBoxCollider(0.9, H, 0.9, x, H / 2, z);
    }

    addColumn(-5.0, 16.0);
    addColumn(5.0, 16.0);

    return { collidableWalls };
}
