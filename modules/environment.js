import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function setupEnvironment(scene) {
    const W          = 80;
    const D          = 60;
    const H          = 15;
    const WALL_THICK = 1;

    const collidableWalls = [];
    const loader     = new THREE.TextureLoader();
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

    // === ÁNH SÁNG MÔI TRƯỜNG ===
    const ambient = new THREE.AmbientLight(0xd4a373, 0.8);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xc29b70, 0x1a120b, 0.4);
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

    // === TƯỜNG BAO CĂN PHÒNG & VÁCH NGĂN ===
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

    // ====================================================
    // BỆ TRƯNG BÀY
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

    // Bệ chính giữa sảnh
    const statueZ = -7;
    createPedestal(0, statueZ, 7);

    // 3 BỆ PHÒNG BÊN TRÁI 
    const LEFT_X = -26.75;
    const LEFT_BED_W = 4.5;
    const leftZPositions = [-14, 0, 14];

    for (let i = 0; i < leftZPositions.length; i++) {
        createPedestal(LEFT_X, leftZPositions[i], LEFT_BED_W);
    }

    // Đèn rọi bệ phòng trái
    for (let i = 0; i < leftZPositions.length; i++) {
        const pz = leftZPositions[i];
        const sp = new THREE.SpotLight(0xfff0dd, 280);
        sp.position.set(LEFT_X + 5, 13, pz + 3);
        sp.angle    = Math.PI / 6;
        sp.penumbra = 0.4;
        sp.decay    = 2;
        sp.distance = 28;
        sp.castShadow = false;
        sp.target.position.set(LEFT_X, 1.5, pz);
        scene.add(sp, sp.target);
    }

    // === RÀO CHẮN VIP & MODEL ===
    const barrierSize   = 11;
    const barrierOffset = barrierSize / 2;
    const ropeWallH     = 2.5;

    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ + barrierOffset);
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ - barrierOffset);
    addBoxCollider(0.3, ropeWallH, barrierSize, -barrierOffset, ropeWallH / 2, statueZ);
    addBoxCollider(0.3, ropeWallH, barrierSize,  barrierOffset, ropeWallH / 2, statueZ);

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

        placeBarrier(0,              statueZ + barrierOffset,  0);
        placeBarrier(0,              statueZ - barrierOffset,  Math.PI);
        placeBarrier(-barrierOffset, statueZ,                  Math.PI / 2);
        placeBarrier( barrierOffset, statueZ,                 -Math.PI / 2);
    }, undefined, err => console.error('Lỗi tải rào chắn VIP:', err));

    const statueLight = new THREE.SpotLight(0xfff0dd, 400);
    statueLight.position.set(0, 13.5, statueZ); 
    statueLight.angle    = Math.PI / 5;
    statueLight.penumbra = 0.4;
    statueLight.decay    = 2;
    statueLight.distance = 55;
    statueLight.castShadow = true;
    statueLight.shadow.mapSize.set(1024, 1024);
    statueLight.shadow.bias = -0.001;
    statueLight.target.position.set(0, 1.5, statueZ);
    scene.add(statueLight, statueLight.target);

    const statueFill = new THREE.SpotLight(0xc8deff, 60);
    statueFill.position.set(0, 12, statueZ); 
    statueFill.angle    = Math.PI / 4;
    statueFill.penumbra = 0.8;
    statueFill.decay    = 2;
    statueFill.distance = 30;
    statueFill.castShadow = false;
    statueFill.target.position.set(0, 1.5, statueZ);
    scene.add(statueFill, statueFill.target);

    gltfLoader.load('model/da_vinci_tank.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 1.3, statueZ);
        model.scale.setScalar(80);
        model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải model:', err));

    // ====================================================
    // NỘI THẤT VÀ TRANG TRÍ (Đèn chùm, ghế, đèn sàn, cột)
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
    addChandelier(-27, -15); addChandelier(-27,  0); addChandelier(-27,  15);
    addChandelier(  0,  -7); addChandelier(  0,  22);
    addChandelier( 27, -15.5); addChandelier( 27,  5); addChandelier( 27,  22);

    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b6340, roughness: 0.75, metalness: 0.02 });
    const cushionMat   = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95, metalness: 0.0 });
    const metalMat     = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9 });

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
    addBench(-8, 10, 0); addBench( 8, 10, Math.PI);
    addBench(-20, -8, Math.PI / 2); addBench( 20, -8, -Math.PI / 2);
    addBench(-30, -8, 0); addBench( 30, -8, 0);
    addBench(-30, 8,  0); addBench( 30, 8,  0);

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
    addFloorLamp(-36,  18); 
    addFloorLamp( -5,  24); addFloorLamp(  5,  24);

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
    addColumn(-5.0, 16.0); addColumn( 5.0, 16.0);


    // ====================================================
    // LỒNG KÍNH (Đã dọn dẹp, chỉ còn kính và khung)
    // ====================================================
    const CASE_H = 6;       
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xddeeff, metalness: 0.05, roughness: 0.0,
        transmission: 0.88, opacity: 1, transparent: true, side: THREE.DoubleSide,
    });
    const caseFrameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.8 });

    function addDisplayUnit(cx, cz, cw, cd, wallSides = []) {
        const centerY = CASE_H / 2;
        const hw = cw / 2;
        const hd = cd / 2;

        // --- 4 Tấm kính bên (Chỉ vẽ mặt không bị kẹt) ---
        if (!wallSides.includes('front')) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(cw, CASE_H, 0.06), glassMat);
            m.position.set(cx, centerY, cz + hd); scene.add(m);
            addBoxCollider(cw, CASE_H, 0.12, cx, centerY, cz + hd);
        }
        if (!wallSides.includes('back')) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(cw, CASE_H, 0.06), glassMat);
            m.position.set(cx, centerY, cz - hd); scene.add(m);
            addBoxCollider(cw, CASE_H, 0.12, cx, centerY, cz - hd);
        }
        if (!wallSides.includes('right')) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, CASE_H, cd), glassMat);
            m.position.set(cx + hw, centerY, cz); scene.add(m);
            addBoxCollider(0.12, CASE_H, cd, cx + hw, centerY, cz);
        }
        if (!wallSides.includes('left')) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, CASE_H, cd), glassMat);
            m.position.set(cx - hw, centerY, cz); scene.add(m);
            addBoxCollider(0.12, CASE_H, cd, cx - hw, centerY, cz);
        }

        // --- Nóc kính ---
        const roof = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.06, cd), glassMat);
        roof.position.set(cx, CASE_H, cz);
        scene.add(roof);

        // --- Cột khung kim loại ---
        const pillarH = CASE_H + 0.06;
        for (const [px, pz] of [
            [cx - hw, cz - hd], [cx + hw, cz - hd],
            [cx - hw, cz + hd], [cx + hw, cz + hd],
        ]) {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, pillarH, 0.1), caseFrameMat);
            p.position.set(px, pillarH / 2, pz);
            scene.add(p);
        }

        // --- Viền ngang ---
        for (const [vw, vd, vx, vz] of [
            [cw + 0.1, 0.1,  cx,      cz - hd],
            [cw + 0.1, 0.1,  cx,      cz + hd],
            [0.1,  cd + 0.1, cx - hw, cz     ],
            [0.1,  cd + 0.1, cx + hw, cz     ],
        ]) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(vw, 0.08, vd), caseFrameMat);
            b.position.set(vx, CASE_H + 0.04, vz);
            scene.add(b);
        }

        // --- Đèn chiếu sáng trong lồng ---
        const sl = new THREE.SpotLight(0xfff4e0, 280);
        sl.position.set(cx, 13, cz);
        sl.angle = Math.PI / 5; sl.penumbra = 0.35; sl.decay = 1.8; sl.distance = 28;
        sl.castShadow = false;
        sl.target.position.set(cx, 1.5, cz);
        scene.add(sl, sl.target);

        const fl = new THREE.SpotLight(0xc8e0ff, 70);
        fl.position.set(cx - 2, 11, cz + 2);
        fl.angle = Math.PI / 4; fl.penumbra = 0.7; fl.decay = 2; fl.distance = 20;
        fl.castShadow = false;
        fl.target.position.set(cx, 1, cz);
        scene.add(fl, fl.target);
    }
    
    // TẠO CÁC LỒNG KÍNH (Sử dụng wallSides để nối kính mượt mà)
    addDisplayUnit(26.75, -26.5, 24.5, 5, ['back']);               // Lồng A 
    addDisplayUnit(32.5, -8, 12, 5, ['right', 'front']);         // Lồng B (Xóa kính trước)
    addDisplayUnit(33.0, -2, 12, 5, ['right', 'back']);          // Lồng C (Xóa kính sau để liền với B)
    addDisplayUnit(36.5, 15.35, 5, 29.5, ['right', 'back']);

    // ====================================================
    // TƯỜNG LỬNG BẢO VỆ (Dùng wallMat đồng bộ với phòng)
    // ====================================================
    const LOW_WALL_H = 1.4;    // Chiều cao tường lửng
    const T = 0.4;             // Độ dày tường lửng (Thickness)
    const PAD        = 0.35;   
    
    // Tường 1 (Dọc): Ôm mép trái lồng B & C
    // Cạnh kính trái ở x=26.5. Trừ đi 0.35m khoảng cách + 0.2m nửa độ dày tường = tâm x là 25.95
    addWall(T, LOW_WALL_H, 12.5, 25.95, -5.0); 

    // Tường 2 (Ngang): Bậc thang nối từ Tường 1 sang Tường 3 (dưới lồng C)
    // Ghép vuông vức chính xác vào mép dưới của Tường 1 và mép trái của Tường 3
    addWall(7.1, LOW_WALL_H, T, 29.7, 1.05);

    // Tường 3 (Dọc): Ôm mép trái lồng D
    // Nối tiếp chính xác từ mép dưới của Tường 2 chạy thẳng tới đầu phòng
    addWall(T, LOW_WALL_H, 28.25, 33.45, 15.375);

    // Tường 4 (Ngang): Bịt phía trên lồng B (Đâm vào tường của căn phòng)
    // Ghép vuông vức vào mép trên của Tường 1
    addWall(12.85, LOW_WALL_H, T, 32.575, -11.05);

    // Tường 5 & 6 (Bao quanh Lồng A)
    // Góc vuông tuyệt đối ở phía trước bên trái của lồng A
    addWall(25.5, LOW_WALL_H, T, 26.25, -23.45);        // Tường ngang phía trước Lồng A
    addWall(T, LOW_WALL_H, 5.85, 13.7, -26.575);        // Tường dọc bịt mép trái Lồng A
    
    return { collidableWalls };
}