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
    scene.add(new THREE.AmbientLight(0xd4a373, 0.8));
    const hemiLight = new THREE.HemisphereLight(0xc29b70, 0x1a120b, 0.4);
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
    floor.receiveShadow = true;
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

        // curveSegments giảm từ 12 → 8 để nhẹ geometry
        const archGeo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 8 });
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

    // =====================================================
    // BỆ TRƯNG BÀY — share material
    // =====================================================
    const goldMat  = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3, metalness: 0.9 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.08, metalness: 0.15 });

    // Geometry bệ dùng chung — tái sử dụng qua clone mesh
    function createPedestal(cx, cz, width) {
        width = width || 7;
        const g = new THREE.Group();

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

    const statueZ      = -7;
    const LEFT_X       = -26.75;
    const LEFT_BED_W   = 4.5;
    const leftZPositions = [-14, 0, 14];

    createPedestal(0, statueZ, 7);
    for (const pz of leftZPositions) createPedestal(LEFT_X, pz, LEFT_BED_W);

    // =====================================================
    // ĐÈN RỌI BỆ PHÒNG TRÁI — castShadow: false, dùng vòng lặp
    // =====================================================
    for (const pz of leftZPositions) {
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

    // =====================================================
    // RÀO CHẮN VIP & MODEL TRUNG TÂM
    // =====================================================
    const barrierSize   = 11;
    const barrierOffset = barrierSize / 2;
    const ropeWallH     = 2.5;

    addBoxCollider(barrierSize, ropeWallH, 0.3, 0,              ropeWallH / 2, statueZ + barrierOffset);
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0,              ropeWallH / 2, statueZ - barrierOffset);
    addBoxCollider(0.3, ropeWallH, barrierSize, -barrierOffset, ropeWallH / 2, statueZ);
    addBoxCollider(0.3, ropeWallH, barrierSize,  barrierOffset, ropeWallH / 2, statueZ);

    // Load rào VIP 1 lần → clone 4 bản
    gltfLoader.load('model/vip_rope_barrier.glb', (gltf) => {
        const raw = gltf.scene;
        const box = new THREE.Box3().setFromObject(raw);
        const sf  = 2.8 / box.getSize(new THREE.Vector3()).y;
        raw.scale.setScalar(sf);

        const newBox    = new THREE.Box3().setFromObject(raw);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        raw.position.set(-newCenter.x, -newBox.min.y, -newCenter.z);

        const wrap = new THREE.Group();
        wrap.add(raw);

        const placements = [
            [0,              statueZ + barrierOffset,  0           ],
            [0,              statueZ - barrierOffset,  Math.PI     ],
            [-barrierOffset, statueZ,                  Math.PI / 2 ],
            [ barrierOffset, statueZ,                 -Math.PI / 2 ],
        ];
        for (const [x, z, ry] of placements) {
            const c = wrap.clone();
            c.position.set(x, 0, z);
            c.rotation.y = ry;
            c.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            scene.add(c);
        }
    }, undefined, err => console.error('Lỗi tải rào chắn VIP:', err));

    // Đèn tượng trung tâm — chỉ 1 SpotLight có shadow
    const statueLight = new THREE.SpotLight(0xfff0dd, 400);
    statueLight.position.set(0, 13.5, statueZ);
    statueLight.angle    = Math.PI / 5;
    statueLight.penumbra = 0.4;
    statueLight.decay    = 2;
    statueLight.distance = 55;
    statueLight.castShadow = true;
    statueLight.shadow.mapSize.set(512, 512); // giảm từ 1024 → 512 để nhẹ GPU
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

    // =====================================================
    // ĐÈN CHÙM — load 1 lần, clone 8 bản
    // =====================================================
    const chandelierPositions = [
        [-27, -15], [-27, 0], [-27, 15],
        [  0,  -7], [  0, 22],
        [ 27, -15.5], [27,  5], [27, 22],
    ];

    // Đặt PointLight trước (không phụ thuộc GLTF)
    for (const [x, z] of chandelierPositions) {
        const pl = new THREE.PointLight(0xffeacc, 110, 32);
        pl.position.set(x, H - 4.5, z);
        pl.castShadow = false;
        scene.add(pl);
    }

    // Load model 1 lần → clone
    gltfLoader.load('model/chandelier (2).glb', (gltf) => {
        const base = gltf.scene;
        base.scale.setScalar(25);
        base.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

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
    const cushionMat   = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95, metalness: 0.0 });
    const metalMat     = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9  });

    // Geometry ghế dùng chung
    const seatGeo     = new THREE.BoxGeometry(2.8, 0.1, 0.75);
    const cushionGeo  = new THREE.BoxGeometry(2.6, 0.1, 0.6);
    const legGeo      = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6); // segment 8 → 6
    const crossbarGeo = new THREE.BoxGeometry(2.3, 0.05, 0.05);

    function addBench(x, z, ry = 0) {
        const g       = new THREE.Group();
        const seat    = new THREE.Mesh(seatGeo, lightWoodMat);
        seat.position.set(0, 0.9, 0); seat.receiveShadow = true; g.add(seat);
        const cushion = new THREE.Mesh(cushionGeo, cushionMat);
        cushion.position.set(0, 1.0, 0); cushion.receiveShadow = true; g.add(cushion);
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
    addBench(-8, 10, 0);          addBench( 8, 10, Math.PI);
    addBench(-20, -8, Math.PI/2); addBench(20, -8, -Math.PI/2);
    addBench(-30, -8, 0);         addBench(30, -8, 0);
    addBench(-30,  8, 0);         addBench(30,  8, 0);

    // Đèn sàn — share geometry & material cho shade
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xf5dfa0, roughness: 0.8, side: THREE.DoubleSide });
    const poleGeo  = new THREE.CylinderGeometry(0.04, 0.06, 2.2, 8);
    const baseGeo  = new THREE.CylinderGeometry(0.22, 0.25, 0.06, 12);
    const shadeGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.35, 12, 1, true);
    const bulbGeo  = new THREE.SphereGeometry(0.07, 6, 6);

    function addFloorLamp(x, z) {
    const g = new THREE.Group();
    
    // 1. Khởi tạo thân đèn và set vị trí đúng chuẩn Three.js
    const pole = new THREE.Mesh(poleGeo, metalMat);
    pole.position.set(0, 1.1, 0);
    g.add(pole);

    // Các phần còn lại giữ nguyên hoàn toàn
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.set(0, 0.03, 0); 
    base.receiveShadow = true; 
    g.add(base);

    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(0, 2.38, 0); 
    g.add(shade);

    const lampLight = new THREE.PointLight(0xffe8a0, 20, 8, 2);
    lampLight.position.set(0, 2.2, 0); 
    g.add(lampLight);

    const bulb = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0xffe8a0 }));
    bulb.position.set(0, 2.2, 0); 
    g.add(bulb);

    g.position.set(x, 0, z);
    scene.add(g);

    }
    addFloorLamp(-36, 18);
    addFloorLamp( -5, 24); addFloorLamp(5, 24);

    // Cột — share geometry & material
    const colMat     = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.05 });
    const shaftGeo   = new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 12); // 16 → 12
    const capitalGeo = new THREE.BoxGeometry(1.0, 0.4, 1.0);
    const colBaseGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);

    function addColumn(x, z) {
        const g = new THREE.Group();
        const shaft = new THREE.Mesh(shaftGeo, colMat);
        shaft.position.set(0, (H - 0.5) / 2, 0); shaft.receiveShadow = true; g.add(shaft);
        const capital = new THREE.Mesh(capitalGeo, colMat);
        capital.position.set(0, H - 0.45, 0); g.add(capital);
        const base = new THREE.Mesh(colBaseGeo, colMat);
        base.position.set(0, 0.15, 0); g.add(base);
        g.position.set(x, 0, z);
        scene.add(g);
        addBoxCollider(0.9, H, 0.9, x, H / 2, z);
    }
    addColumn(-5.0, 16.0); addColumn(5.0, 16.0);

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
            { skip: 'back',  geo: new THREE.BoxGeometry(cw, CASE_H, 0.06), pos: [cx, centerY, cz - hd], col: [cw, CASE_H, 0.12, cx, centerY, cz - hd] },
            { skip: 'right', geo: new THREE.BoxGeometry(0.06, CASE_H, cd), pos: [cx + hw, centerY, cz], col: [0.12, CASE_H, cd, cx + hw, centerY, cz] },
            { skip: 'left',  geo: new THREE.BoxGeometry(0.06, CASE_H, cd), pos: [cx - hw, centerY, cz], col: [0.12, CASE_H, cd, cx - hw, centerY, cz] },
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
        sl.angle    = Math.PI / 5;
        sl.penumbra = 0.5;
        sl.decay    = 1.8;
        sl.distance = 28;
        sl.castShadow = false;
        sl.target.position.set(cx, 1.5, cz);
        scene.add(sl, sl.target);
    }

    // =====================================================
    // TẠO LỒNG KÍNH
    // =====================================================
    const A_CW = 16,  A_CX = 31.45, A_CZ = -26.5, A_CD = 5;

    // Kéo dài Lồng D: Chiều dài Z chạy chính xác từ 0.5 đến 29.0
    const D_CW = 5,   D_CX = 36.5,  D_CZ = 14.75, D_CD = 28.5;

    // Lồng A: skip 'back' (z=-29.0)
    addDisplayUnit(A_CX, A_CZ, A_CW, A_CD, ['back']);
    // Lồng D: skip 'right' (x=39.0)
    addDisplayUnit(D_CX, D_CZ, D_CW, D_CD, ['right']);

    // =====================================================
    // TƯỜNG BAO HỐC — dùng woodMat (ốp gỗ toàn bộ)
    // =====================================================

    // ── LỒNG A ──────────────────────────────────────────
    // Tường lấp bên trái lồng A  (w=8.95, h=15, d=7, x=17.975, z=-26.5)
    addWall(8.95, 15, 6, 17.975, -26.5, woodMat);

    // Tường trái bao hốc A  (w=1, h=15, d=5.5, x=22.95, z=-26.25)
    addWall(1, 15, 5.5, 22.95, -26.25, woodMat);

    // Tường gỗ trên mặt kính trước A  (w=16, h=9, d=1, x=31.45, y=10.5, z=-24.0)
    const topA = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 1), woodMat);
    topA.position.set(31.45, 10.5, -24.0);
    topA.receiveShadow = true; scene.add(topA);
    addBoxCollider(16, 9, 1, 31.45, 10.5, -24.0);

    // Viền trần hốc A  (w=18, h=0.3, d=5.5, x=31.45, y=14.85, z=-26.25)
    const ceilA = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 5.5), woodMat);
    ceilA.position.set(31.45, 14.85, -26.25); scene.add(ceilA);

    // ── LỒNG D ──────────────────────────────────────────

    // Tường bịt đầu dưới hốc D 
    // (Đã sửa w=6, x=36.0 để nằm gọn gàng từ x=33.0 đến mép tường x=39.0)
    const botD = new THREE.Mesh(new THREE.BoxGeometry(6, 15, 1), woodMat);
    botD.position.set(36.0, 7.5, 0.0);
    botD.receiveShadow = true; scene.add(botD);
    addBoxCollider(6, 15, 1, 36.0, 7.5, 0.0);

    // Tường gỗ trên mặt kính D (Giữ nguyên, tọa độ đã chuẩn)
    const topFrontD = new THREE.Mesh(new THREE.BoxGeometry(1, 9, 28.5), woodMat);
    topFrontD.position.set(33.5, 10.5, 14.75);
    topFrontD.receiveShadow = true; scene.add(topFrontD);
    addBoxCollider(1, 9, 28.5, 33.5, 10.5, 14.75);

    // Viền trần hốc D 
    // (Đã sửa x=36.0 để không lẹm sang không gian bên ngoài bức tường phải)
    const ceilD = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 29.5), woodMat);
    ceilD.position.set(36.0, 14.85, 14.25); scene.add(ceilD);

    // ĐÃ XÓA: Tường lấp đầu trên hốc D (addWall tại z=29.5) 
    // Lý do: Trùng 100% với tường bao chính của phòng gây hiện tượng nhấp nháy bề mặt.

    // Tường lấp khoảng trống bên dưới lồng D 
    // (Đã sửa w=6, x=36.0 để lấp kín bề ngang 6 unit, không để lại khe hở 1 unit như trước)
    addWall(6, 15, 5, 36.0, -2.5, woodMat);

    // =====================================================
    // TƯỜNG LỬNG BẢO VỆ (ỐP GỖ BÊN NGOÀI)
    // =====================================================
    const LOW_WALL_H = 1.4;
    const T          = 0.4;

    // Lồng A: ngang phía trước + dọc bờ trái
    addWall(17.5, LOW_WALL_H, T, 31.45, -23.7, woodMat);
    addWall(T, LOW_WALL_H, 5.5, 22.95, -26.25, woodMat);

    // Lồng D: dọc bờ trái
    addWall(T, LOW_WALL_H, 29.0, 33.20, 14.5, woodMat);

    return { collidableWalls };
}