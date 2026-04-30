import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function setupEnvironment(scene) {
    const W = 80;
    const D = 60;
    const H = 15;
    const WALL_THICK = 1;

    const collidableWalls = [];
    const loader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

    // Collider vô hình — dùng chung 1 material cho tất cả
    const colliderMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });

    // =====================================================
    // TEXTURES — tải 1 lần, dùng lại
    // =====================================================
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

    // woodMat dùng lại texture trần — clone UV repeat riêng
    const woodTex = ceilingTex.clone();
    woodTex.needsUpdate = true;
    woodTex.repeat.set(2, 2);
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xe0d5c0, roughness: 0.5 });

    // =====================================================
    // ÁNH SÁNG MÔI TRƯỜNG — chỉ 2 light nền, không shadow
    // =====================================================
    scene.add(new THREE.AmbientLight(0xd4a373, 1));
    const hemiLight = new THREE.HemisphereLight(0xc29b70, 0x1a120b, 0.2);
    hemiLight.position.set(0, H, 0);
    scene.add(hemiLight);

    // =====================================================
    // SÀN & TRẦN — receiveShadow chỉ ở sàn
    // =====================================================
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D),
        new THREE.MeshStandardMaterial({ map: floorTex, color: 0xcccccc, roughness: 0.6, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    scene.add(ceiling);

    // =====================================================
    // HELPERS
    // =====================================================
    function addBoxCollider(w, h, d, x, y, z, ry = 0) {
        const collider = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), colliderMat);
        collider.position.set(x, y, z);
        if (ry) collider.rotation.y = ry;
        scene.add(collider);
        collidableWalls.push(collider);
    }

    function addWall(w, h, d, x, z, customMat = wallMat) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), customMat);
        wall.position.set(x, h / 2, z);
        wall.receiveShadow = false;
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

        // curveSegments giảm từ 12 → 8 để nhẹ geometry
        const archGeo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 8 });
        archGeo.translate(0, -h / 2, -d / 2);
        const archMesh = new THREE.Mesh(archGeo, wallMat);
        archMesh.position.set(x, yBase + h / 2, z);
        archMesh.rotation.y = ry;
        archMesh.receiveShadow = false;
        scene.add(archMesh);

        const trimW = 0.4, innerOffset = 0.05, trimDepth = d + 0.15;
        const r1 = gapW / 2 - innerOffset, r2 = gapW / 2 + trimW;
        const trimShape = new THREE.Shape();
        trimShape.moveTo(-r1, -yBase); trimShape.lineTo(-r1, 0);
        trimShape.absarc(0, 0, r1, Math.PI, 0, true);
        trimShape.lineTo(r1, -yBase); trimShape.lineTo(r2, -yBase); trimShape.lineTo(r2, 0);
        trimShape.absarc(0, 0, r2, 0, Math.PI, false);
        trimShape.lineTo(-r2, -yBase); trimShape.lineTo(-r1, -yBase);

        const trimGeo = new THREE.ExtrudeGeometry(trimShape, { depth: trimDepth, bevelEnabled: false, curveSegments: 8 });
        trimGeo.translate(0, 0, -trimDepth / 2);
        const trimMesh = new THREE.Mesh(trimGeo, woodMat);
        trimMesh.position.set(x, yBase, z);
        trimMesh.rotation.y = ry;
        scene.add(trimMesh);
    }

    // =====================================================
    // TƯỜNG BAO & VÁCH NGĂN
    // =====================================================
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

    // =====================================================
    // BỆ TRƯNG BÀY — share material
    // =====================================================
    // VẬT LIỆU BỤC — phong cách Tân Cổ Điển Ý (đá cẩm thạch trắng + viền đá xám)
    // =====================================================

    // Đá cẩm thạch trắng Carrara
    const marbleMat = new THREE.MeshStandardMaterial({
        color: 0xf4f0eb, roughness: 0.18, metalness: 0.0,
    });
    // Gờ/viền đá xám nhạt
    const moldingMat = new THREE.MeshStandardMaterial({
        color: 0xd6d0c8, roughness: 0.28, metalness: 0.0,
    });
    // Đế chân — đá đậm hơn, tạo cảm giác nặng chắc
    const plinthMat = new THREE.MeshStandardMaterial({
        color: 0xe2ddd6, roughness: 0.35, metalness: 0.0,
    });

    // =====================================================
    // createPedestal — Bục Tân Cổ Điển gồm 5 lớp:
    //   1. Plinth  — đế chân vuông dày, hơi nhô ra
    //   2. Base    — thân chính cao, đá cẩm thạch
    //   3. Fascia  — dải đá ngang giữa (đường chỉ ngang)
    //   4. Neck    — cổ thu nhỏ phía trên
    //   5. Abacus  — bản phẳng trên cùng đỡ tượng
    // =====================================================
    function createPedestal(cx, cz, width) {
        width = width || 7;
        const g = new THREE.Group();

        // 1. Plinth (đế chân)
        const plinthW = width + 0.55;
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(plinthW, 0.22, plinthW), plinthMat);
        plinth.position.set(0, 0.11, 0);
        plinth.castShadow = false; plinth.receiveShadow = true;
        g.add(plinth);

        // Gờ bevel mỏng dưới plinth
        const plinthBevel = new THREE.Mesh(new THREE.BoxGeometry(plinthW + 0.12, 0.08, plinthW + 0.12), moldingMat);
        plinthBevel.position.set(0, 0.04, 0);
        plinthBevel.receiveShadow = true;
        g.add(plinthBevel);

        // 2. Base — thân chính đá cẩm thạch
        const baseH = 0.90;
        const base = new THREE.Mesh(new THREE.BoxGeometry(width, baseH, width), marbleMat);
        base.position.set(0, 0.22 + baseH / 2, 0);
        base.castShadow = false; base.receiveShadow = true;
        g.add(base);

        // Gờ astragal dưới base
        const astragalBot = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.10, width + 0.14), moldingMat);
        astragalBot.position.set(0, 0.22 + 0.05, 0);
        astragalBot.receiveShadow = true;
        g.add(astragalBot);

        // 3. Fascia — dải ngang giữa
        const fasciaY = 0.22 + baseH;
        const fascia = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.13, width + 0.08), moldingMat);
        fascia.position.set(0, fasciaY + 0.065, 0);
        fascia.castShadow = false; fascia.receiveShadow = true;
        g.add(fascia);

        // 4. Neck — cổ bục hơi nhỏ hơn
        const neckW = width - 0.10;
        const neckH = 0.45;
        const neck = new THREE.Mesh(new THREE.BoxGeometry(neckW, neckH, neckW), marbleMat);
        neck.position.set(0, fasciaY + 0.13 + neckH / 2, 0);
        neck.castShadow = false; neck.receiveShadow = true;
        g.add(neck);

        // Gờ cyma recta trên neck
        const cymaY = fasciaY + 0.13 + neckH;
        const cyma = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, 0.12, width + 0.18), moldingMat);
        cyma.position.set(0, cymaY + 0.06, 0);
        cyma.castShadow = false; cyma.receiveShadow = true;
        g.add(cyma);

        // 5. Abacus — bản phẳng trên cùng đỡ tượng
        const abacusY = cymaY + 0.12;
        const abacus = new THREE.Mesh(new THREE.BoxGeometry(width + 0.30, 0.10, width + 0.30), plinthMat);
        abacus.position.set(0, abacusY + 0.05, 0);
        abacus.castShadow = false; abacus.receiveShadow = true;
        g.add(abacus);

        g.position.set(cx, 0, cz);
        scene.add(g);

        // Đỉnh bục ≈ abacusY + 0.10 ≈ 2.05 — collider bọc toàn bục
        const totalH = abacusY + 0.10;
        addBoxCollider(width + 0.60, totalH + 3.0, width + 0.60, cx, (totalH + 3.0) / 2, cz);
    }

    const statueZ = -7;
    const LEFT_X = -26.75;
    const LEFT_BED_W = 4.5;
    const leftZPositions = [-14, 0, 14];

    createPedestal(0, statueZ, 7);
    for (const pz of leftZPositions) createPedestal(LEFT_X, pz, LEFT_BED_W);

    // =====================================================
    // ĐÈN RỌI BỆ PHÒNG TRÁI — castShadow: false, dùng vòng lặp
    // =====================================================
    for (const pz of leftZPositions) {
        const sp = new THREE.SpotLight(0xfff0dd, 120);
        sp.position.set(LEFT_X + 5, 13, pz + 3);
        sp.angle = Math.PI / 6;
        sp.penumbra = 0.4;
        sp.decay = 2;
        sp.distance = 28;
        sp.castShadow = false;
        sp.target.position.set(LEFT_X, 2.5, pz);
        scene.add(sp, sp.target);
    }

    // =====================================================
    // TƯỢNG 3D PHÒNG TRÁI — 3 bục tại Z = -14, 0, 14
    // Chỉnh: đường dẫn file, position.set(x, y, z), scale.setScalar(n), rotation.y
    // =====================================================
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader)
    // --- TƯỢNG BỤC 1 (Z = -14) ---
    gltfLoader.load('model/David_statue.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(LEFT_X, 1.8, -14); // x=bục trái, y=đỉnh bục mới (2.05), z=vị trí bục
        model.scale.setScalar(1);              // <-- chỉnh scale tại đây
        model.rotation.y = 0;                  // <-- chỉnh góc xoay tại đây (Math.PI/2, Math.PI,...)
        model.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải tượng bục 1:', err));

    // --- TƯỢNG BỤC 2 (Z = 0) ---
    gltfLoader.load('model/pieta.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(LEFT_X, 2.05, 0);   // x=bục trái, y=đỉnh bục mới (2.05), z=vị trí bục
        model.scale.setScalar(6);              // <-- chỉnh scale tại đây
        model.rotation.y = 0;                  // <-- chỉnh góc xoay tại đây
        model.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải tượng bục 2:', err));

    // --- TƯỢNG BỤC 3 (Z = 14) ---
    gltfLoader.load('model/statue1.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(LEFT_X, 2.5, 14);  // x=bục trái, y=đỉnh bục mới (2.05), z=vị trí bục
        model.scale.setScalar(0.3);              // <-- chỉnh scale tại đây
        model.rotation.y = 0;                  // <-- chỉnh góc xoay tại đây
        model.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải tượng bục 3:', err));

    // =====================================================
    // RÀO CHẮN VIP & MODEL TRUNG TÂM
    // =====================================================
    const barrierSize = 11;
    const barrierOffset = barrierSize / 2;
    const ropeWallH = 2.5;

    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ + barrierOffset);
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ - barrierOffset);
    addBoxCollider(0.3, ropeWallH, barrierSize, -barrierOffset, ropeWallH / 2, statueZ);
    addBoxCollider(0.3, ropeWallH, barrierSize, barrierOffset, ropeWallH / 2, statueZ);

    // Load rào VIP 1 lần → clone 4 bản
    gltfLoader.load('model/vip_rope_barrier.glb', (gltf) => {
        const raw = gltf.scene;
        const box = new THREE.Box3().setFromObject(raw);
        const sf = 2.8 / box.getSize(new THREE.Vector3()).y;
        raw.scale.setScalar(sf);

        const newBox = new THREE.Box3().setFromObject(raw);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        raw.position.set(-newCenter.x, -newBox.min.y, -newCenter.z);

        const wrap = new THREE.Group();
        wrap.add(raw);

        const placements = [
            [0, statueZ + barrierOffset, 0],
            [0, statueZ - barrierOffset, Math.PI],
            [-barrierOffset, statueZ, Math.PI / 2],
            [barrierOffset, statueZ, -Math.PI / 2],
        ];
        for (const [x, z, ry] of placements) {
            const c = wrap.clone();
            c.position.set(x, 0, z);
            c.rotation.y = ry;
            c.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
            scene.add(c);
        }
    }, undefined, err => console.error('Lỗi tải rào chắn VIP:', err));

    // Đèn tượng trung tâm — chỉ 1 SpotLight có shadow
    const statueLight = new THREE.SpotLight(0xfff0dd, 300);
    statueLight.position.set(0, 13.5, statueZ);
    statueLight.angle = Math.PI / 5;
    statueLight.penumbra = 0.4;
    statueLight.decay = 2;
    statueLight.distance = 55;
    statueLight.castShadow = false;
    statueLight.shadow.mapSize.set(128, 128); // giảm từ 1024 → 512 để nhẹ GPU
    statueLight.shadow.bias = -0.001;
    statueLight.target.position.set(0, 1.5, statueZ);
    scene.add(statueLight, statueLight.target);

    const statueFill = new THREE.SpotLight(0xc8deff, 25);
    statueFill.position.set(0, 12, statueZ);
    statueFill.angle = Math.PI / 4;
    statueFill.penumbra = 0.8;
    statueFill.decay = 2;
    statueFill.distance = 30;
    statueFill.castShadow = false;
    statueFill.target.position.set(0, 1.5, statueZ);
    scene.add(statueFill, statueFill.target);

    gltfLoader.load('model/davidtank.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 1.4, statueZ);
        model.scale.setScalar(80);
        model.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải model:', err));

    // =====================================================
    // ĐÈN CHÙM — load 1 lần, clone 8 bản
    // =====================================================
    const chandelierPositions = [
        [-27, -15], [-27, 0], [-27, 15],
        [0, -7], [0, 22],
        [27, -15.5], [27, 5], [27, 22],
    ];

    // Đặt PointLight trước (không phụ thuộc GLTF)
    for (const [x, z] of chandelierPositions) {
        const pl = new THREE.PointLight(0xffeacc, 70, 32);
        pl.position.set(x, H - 4.5, z);
        pl.castShadow = false;
        scene.add(pl);
    }

    // Load model 1 lần → clone
    gltfLoader.load('model/chandelier (2).glb', (gltf) => {
        const base = gltf.scene;
        base.scale.setScalar(25);
        base.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });

        for (const [x, z] of chandelierPositions) {
            const c = base.clone();
            c.position.set(x, H - 5, z);
            scene.add(c);
        }
    }, undefined, err => console.error('Lỗi tải đèn chùm:', err));

    // =====================================================
    // NỘI THẤT — share material, geometry đơn giản
    // =====================================================
    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b6340, roughness: 0.75, metalness: 0.02 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95, metalness: 0.0 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9 });

    // Geometry ghế dùng chung
    const seatGeo = new THREE.BoxGeometry(2.8, 0.1, 0.75);
    const cushionGeo = new THREE.BoxGeometry(2.6, 0.1, 0.6);
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6); // segment 8 → 6
    const crossbarGeo = new THREE.BoxGeometry(2.3, 0.05, 0.05);

    function addBench(x, z, ry = 0) {
        const g = new THREE.Group();
        const seat = new THREE.Mesh(seatGeo, lightWoodMat);
        seat.position.set(0, 0.9, 0); seat.receiveShadow = false; g.add(seat);
        const cushion = new THREE.Mesh(cushionGeo, cushionMat);
        cushion.position.set(0, 1.0, 0); cushion.receiveShadow = false; g.add(cushion);
        for (const [lx, lz] of [[-1.15, -0.3], [1.15, -0.3], [-1.15, 0.3], [1.15, 0.3]]) {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(lx, 0.45, lz); g.add(leg);
        }
        const crossbar = new THREE.Mesh(crossbarGeo, metalMat);
        crossbar.position.set(0, 0.25, 0); g.add(crossbar);
        g.position.set(x, 0, z);
        g.rotation.y = ry;
        scene.add(g);
        addBoxCollider(2.8, 1.1, 0.8, x, 0.55, z, ry);
    }
    addBench(-8, 14, 0);
    addBench(12.6, 10, Math.PI / 2);
    addBench(12.6, 8, Math.PI / 2);
    addBench(-38.4, 0, Math.PI / 2);
    addBench(15.1, -2, -Math.PI / 2);
    addBench(-38.4, 8, Math.PI / 2);
    addBench(15.1, -6, -Math.PI / 2);
    addBench(-38.4, 4, Math.PI / 2);
    addBench(22, 14, 0);
    addBench(22, 16.1, 0);
    addBench(18, 16.1, 0);
    // Đèn sàn — share geometry & material cho shade
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xf5dfa0, roughness: 0.8, side: THREE.DoubleSide });
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.06, 2.2, 8);
    const baseGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.06, 12);
    const shadeGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.35, 12, 1, true);
    const bulbGeo = new THREE.SphereGeometry(0.07, 6, 6);

    // Cột — share geometry & material
    const colMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.05 });
    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 12); // 16 → 12
    const capitalGeo = new THREE.BoxGeometry(1.0, 0.4, 1.0);
    const colBaseGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);

    function addColumn(x, z) {
        const g = new THREE.Group();
        const shaft = new THREE.Mesh(shaftGeo, colMat);
        shaft.position.set(0, (H - 0.5) / 2, 0); shaft.receiveShadow = false; g.add(shaft);
        const capital = new THREE.Mesh(capitalGeo, colMat);
        capital.position.set(0, H - 0.45, 0); g.add(capital);
        const base = new THREE.Mesh(colBaseGeo, colMat);
        base.position.set(0, 0.15, 0); g.add(base);
        g.position.set(x, 0, z);
        scene.add(g);
        addBoxCollider(0.9, H, 0.9, x, H / 2, z);
    }
    addColumn(-4.5, 16.0); addColumn(4.5, 16.0);

    // =====================================================
    // LỒNG KÍNH — dùng chung glassMat
    // (ĐÃ BỎ: caseFrameMat, cột khung 4 góc, viền ngang trên đỉnh)
    // =====================================================
    const CASE_H = 6;
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xddeeff, metalness: 0.05, roughness: 0.0,
        transmission: 0.88, opacity: 1, transparent: true, side: THREE.DoubleSide,
    });

    function addDisplayUnit(cx, cz, cw, cd, wallSides = []) {
        const centerY = CASE_H / 2;
        const hw = cw / 2;
        const hd = cd / 2;

        // Tấm kính — chỉ vẽ mặt không kề tường
        const glassPlanes = [
            { skip: 'front', geo: new THREE.BoxGeometry(cw, CASE_H, 0.06), pos: [cx, centerY, cz + hd], col: [cw, CASE_H, 0.12, cx, centerY, cz + hd] },
            { skip: 'back', geo: new THREE.BoxGeometry(cw, CASE_H, 0.06), pos: [cx, centerY, cz - hd], col: [cw, CASE_H, 0.12, cx, centerY, cz - hd] },
            { skip: 'right', geo: new THREE.BoxGeometry(0.06, CASE_H, cd), pos: [cx + hw, centerY, cz], col: [0.12, CASE_H, cd, cx + hw, centerY, cz] },
            { skip: 'left', geo: new THREE.BoxGeometry(0.06, CASE_H, cd), pos: [cx - hw, centerY, cz], col: [0.12, CASE_H, cd, cx - hw, centerY, cz] },
        ];
        for (const { skip, geo, pos, col } of glassPlanes) {
            if (wallSides.includes(skip)) continue;
            const m = new THREE.Mesh(geo, glassMat);
            m.position.set(...pos);
            scene.add(m);
            addBoxCollider(...col);
        }

        // Nóc kính
        const roof = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.06, cd), glassMat);
        roof.position.set(cx, CASE_H, cz);
        scene.add(roof);

        // 1 SpotLight duy nhất mỗi lồng
        const sl = new THREE.SpotLight(0xfff4e0, 320);
        sl.position.set(cx, 13, cz);
        sl.angle = Math.PI / 5;
        sl.penumbra = 0.5;
        sl.decay = 1.8;
        sl.distance = 28;
        sl.castShadow = false;
        sl.target.position.set(cx, 1.5, cz);
        scene.add(sl, sl.target);
    }

    // =====================================================
    // TẠO LỒNG KÍNH
    // =====================================================
    const A_CW = 16, A_CX = 31.45, A_CZ = -26.5, A_CD = 5;

    // Kéo dài Lồng D: Chiều dài Z chạy chính xác từ 0.5 đến 29.0
    const D_CW = 5, D_CX = 36.5, D_CZ = 14.75, D_CD = 28.5;

    // Lồng A: skip 'back' (z=-29.0)
    addDisplayUnit(A_CX, A_CZ, A_CW, A_CD, ['back']);
    // Lồng D: skip 'right' (x=39.0)
    addDisplayUnit(D_CX, D_CZ, D_CW, D_CD, ['right']);

    // =====================================================
    // HÀM HỖ TRỢ: XỬ LÝ VÂN GỖ ĐỒNG NHẤT
    // =====================================================
    function getUniformBox(w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const pos = geo.attributes.position;
        const uv = geo.attributes.uv;
        const nor = geo.attributes.normal;

        // Phóng to/thu nhỏ vân gỗ tại đây (thử thay đổi từ 0.1 đến 0.5 để xem kết quả)
        const scale = 0.15;

        for (let i = 0; i < uv.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            let nx = Math.abs(nor.getX(i));
            let ny = Math.abs(nor.getY(i));

            // Tính toán lại UV dựa trên kích thước thật ở không gian 3D
            if (nx > 0.5) uv.setXY(i, z * scale, y * scale);
            else if (ny > 0.5) uv.setXY(i, x * scale, z * scale);
            else uv.setXY(i, x * scale, y * scale);
        }
        return geo;
    }

    // Tạo hàm addWoodWall riêng để sử dụng getUniformBox thay vì BoxGeometry mặc định
    function addWoodWall(w, h, d, x, z) {
        const wall = new THREE.Mesh(getUniformBox(w, h, d), woodMat);
        wall.position.set(x, h / 2, z);
        wall.receiveShadow = true;
        scene.add(wall);
        addBoxCollider(w, h, d, x, h / 2, z);
    }

    // =====================================================
    // TƯỜNG BAO HỐC — Ốp gỗ toàn bộ với vân đồng nhất
    // =====================================================

    // ── LỒNG A ──────────────────────────────────────────
    // Tường lấp bên trái lồng A
    addWoodWall(8.95, 16, 6, 18.0, -26.5);

    // Tường trái bao hốc A
    addWoodWall(1, 15, 5.5, 22.95, -26.25);

    // Tường gỗ trên mặt kính trước A
    const topA = new THREE.Mesh(getUniformBox(16, 9, 1), woodMat);
    topA.position.set(31.45, 10.5, -24.0);
    topA.receiveShadow = true; scene.add(topA);
    addBoxCollider(16, 9, 1, 31.45, 10.5, -24.0);

    // Viền trần hốc A
    const ceilA = new THREE.Mesh(getUniformBox(18, 0.3, 5.5), woodMat);
    ceilA.position.set(31.45, 14.85, -26.25); scene.add(ceilA);

    // ── LỒNG D ──────────────────────────────────────────
    // Tường bịt đầu dưới hốc D 
    const botD = new THREE.Mesh(getUniformBox(6, 15, 1), woodMat);
    botD.position.set(36.0, 7.5, 0.0);
    botD.receiveShadow = true; scene.add(botD);
    addBoxCollider(6, 15, 1, 36.0, 7.5, 0.0);

    // Tường gỗ trên mặt kính D
    const topFrontD = new THREE.Mesh(getUniformBox(1, 9, 28.5), woodMat);
    topFrontD.position.set(33.5, 10.5, 14.75);
    topFrontD.receiveShadow = true; scene.add(topFrontD);
    addBoxCollider(1, 9, 28.5, 33.5, 10.5, 14.75);

    // Viền trần hốc D 
    const ceilD = new THREE.Mesh(getUniformBox(6, 0.3, 29.5), woodMat);
    ceilD.position.set(36.0, 14.85, 14.25); scene.add(ceilD);

    // Tường lấp khoảng trống bên dưới lồng D 
    addWoodWall(6, 15, 5, 36.0, -2.5);

    // =====================================================
    // TƯỜNG LỬNG BẢO VỆ (ỐP GỖ BÊN NGOÀI)
    // =====================================================
    const LOW_WALL_H = 1.4;
    const T = 0.4;

    // Lồng A: ngang phía trước + dọc bờ trái
    addWoodWall(16.2, LOW_WALL_H, T, 31.45, -23.7);
    addWoodWall(T, LOW_WALL_H, 5.5, 22.95, -26.25);

    // Lồng D: dọc bờ trái
    addWoodWall(T, LOW_WALL_H, 29.0, 33.20, 14.5);

    return { collidableWalls };
}