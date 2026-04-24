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

    // === TEXTURES ===
    const floorTex = loader.load('model/go2.jpg');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24);
    floorTex.colorSpace = THREE.SRGBColorSpace;

    const wallTex = loader.load('model/tuong.jpg');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 2);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xe8e4de, roughness: 0.85, metalness: 0.0 });

    const ceilingTex = loader.load('model/trần gỗ.jpg');
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(32, 24);
    ceilingTex.colorSpace = THREE.SRGBColorSpace;
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, color: 0xfff8f0, roughness: 0.5 });

    const woodTex = ceilingTex.clone();
    woodTex.needsUpdate = true;
    woodTex.repeat.set(2, 2);
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xe0d5c0, roughness: 0.5 });

    // === ÁNH SÁNG TỔNG THỂ ===
    // Ambient nhẹ — để spotlight nổi bật hơn
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.50);
    scene.add(ambient);

    // HemisphereLight: bầu trời ấm, mặt đất tối nhẹ
    const hemiLight = new THREE.HemisphereLight(0xfff5e8, 0x3a2a18, 0.45);
    hemiLight.position.set(0, H, 0);
    scene.add(hemiLight);

    // === SÀN ===
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D),
        new THREE.MeshStandardMaterial({ map: floorTex, color: 0xcccccc, roughness: 0.35, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Baseboard (chân tường) — dải sẫm màu sát sàn
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7, metalness: 0.1 });

    // === TRẦN ===
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    scene.add(ceiling);

    // === HELPER: TẠO TƯỜNG ===
    function addWall(w, h, d, x, z) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        wall.position.set(x, h / 2, z);
        wall.castShadow = wall.receiveShadow = true;
        scene.add(wall);
        collidableWalls.push(wall);

        // Baseboard
        const bbW = w > d ? w : 0.12;
        const bbD = d > w ? d : 0.12;
        const bb = new THREE.Mesh(new THREE.BoxGeometry(bbW, 0.25, bbD + 0.05), baseboardMat);
        bb.position.set(x, 0.125, z);
        scene.add(bb);
    }

    // === HELPER: VÒNG CUỐN ===
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
        archMesh.castShadow = archMesh.receiveShadow = true;
        scene.add(archMesh);
        collidableWalls.push(archMesh);

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
        trimMesh.castShadow = trimMesh.receiveShadow = true;
        scene.add(trimMesh);
        collidableWalls.push(trimMesh);
    }

    // === TƯỜNG BAO & VÁCH NGĂN ===
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

    // === BỆ TRƯNG BÀY ===
    const statueZ = -7;
    const pedestalGroup = new THREE.Group();

    const pedestalBase = new THREE.Mesh(
        new THREE.BoxGeometry(7, 1.4, 7),
        new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.08, metalness: 0.15 })
    );
    pedestalBase.position.set(0, 0.7, 0);
    pedestalBase.castShadow = pedestalBase.receiveShadow = true;
    pedestalGroup.add(pedestalBase);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3, metalness: 0.9 });
    const pedestalTop = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 7.4), goldMat);
    pedestalTop.position.set(0, 1.5, 0);
    pedestalTop.castShadow = pedestalTop.receiveShadow = true;
    pedestalGroup.add(pedestalTop);

    const pedestalBottom = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 7.4), goldMat);
    pedestalBottom.position.set(0, 0.1, 0);
    pedestalBottom.castShadow = pedestalBottom.receiveShadow = true;
    pedestalGroup.add(pedestalBottom);

    pedestalGroup.position.set(0, 0, statueZ);
    scene.add(pedestalGroup);
    collidableWalls.push(pedestalBase);

    // === RÀO CHẮN VIP ===
    const barrierSize = 11;
    const barrierOffset = barrierSize / 2;
    const ropeWallHeight = 2.5;
    const invisibleMat = new THREE.MeshBasicMaterial({ visible: false });
    const wallPadding = 0.8;
    const wallOffset = barrierOffset - wallPadding;
    const wallSize = barrierSize - (wallPadding * 8);

    function addInvisibleWall(w, d, x, z) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, ropeWallHeight, d), invisibleMat);
        wall.position.set(x, ropeWallHeight / 2, z);
        scene.add(wall);
        collidableWalls.push(wall);
    }

    addInvisibleWall(wallSize, 0.3, 0, statueZ + wallOffset);
    addInvisibleWall(wallSize, 0.3, 0, statueZ - wallOffset);
    addInvisibleWall(0.3, wallSize, -wallOffset, statueZ);
    addInvisibleWall(0.3, wallSize,  wallOffset, statueZ);

    gltfLoader.load('model/vip_rope_barrier.glb', (gltf) => {
        const rawModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(rawModel);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = 2.8 / size.y;
        rawModel.scale.setScalar(scaleFactor);

        const newBox = new THREE.Box3().setFromObject(rawModel);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        const newMinY = newBox.min.y;
        rawModel.position.x = -newCenter.x;
        rawModel.position.y = -newMinY;
        rawModel.position.z = -newCenter.z;

        const barrierWrapper = new THREE.Group();
        barrierWrapper.add(rawModel);

        function placeBarrier(x, z, rotY) {
            const clone = barrierWrapper.clone();
            clone.position.set(x, 0, z);
            clone.rotation.y = rotY;
            clone.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            scene.add(clone);
        }

        placeBarrier(0,             statueZ + barrierOffset, 0);
        placeBarrier(0,             statueZ - barrierOffset, Math.PI);
        placeBarrier(-barrierOffset, statueZ,                Math.PI / 2);
        placeBarrier( barrierOffset, statueZ,               -Math.PI / 2);
    }, undefined, err => console.error('Lỗi tải rào chắn VIP:', err));

    // === ĐÈN RỌI TƯỢNG ===
    const statueLight = new THREE.SpotLight(0xfff0dd, 600);
    statueLight.position.set(3, 13.5, statueZ + 12);
    statueLight.angle    = Math.PI / 5;
    statueLight.penumbra = 0.4;
    statueLight.decay    = 2;
    statueLight.distance = 55;
    statueLight.castShadow = true;
    statueLight.shadow.mapSize.set(1024, 1024);
    statueLight.shadow.bias = -0.001;
    statueLight.target.position.set(0, 1.5, statueZ);
    scene.add(statueLight, statueLight.target);

    // Fill nhẹ cho tượng từ phía đối diện
    const statueFill = new THREE.SpotLight(0xc8deff, 80);
    statueFill.position.set(-5, 8, statueZ - 8);
    statueFill.angle    = Math.PI / 4;
    statueFill.penumbra = 0.8;
    statueFill.decay    = 2;
    statueFill.distance = 30;
    statueFill.target.position.set(0, 1.5, statueZ);
    scene.add(statueFill, statueFill.target);

    // MODEL TƯỢNG
    gltfLoader.load('model/da_vinci_tank.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 1.3, statueZ);
        model.scale.setScalar(80);
        model.traverse(n => { if (n.isMesh) n.castShadow = true; });
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải model:', err));

    // === ĐÈN TRẦN (PANEL ĐÈN ĐỒI XỨ) ===
    function addCeilingLight(x, z, intensity = 120, color = 0xfff8f0) {
        // Panel đèn LED dài
        const panelMat = new THREE.MeshBasicMaterial({ color: 0xfff8e8 });
        const panel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.06, 1.0), panelMat);
        panel.position.set(x, H - 0.04, z);
        scene.add(panel);

        // Viền panel đèn
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.8, roughness: 0.2 });
        const rim = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.08, 1.2), rimMat);
        rim.position.set(x, H - 0.06, z);
        scene.add(rim);

        // PointLight chính
        const light = new THREE.PointLight(color, intensity, 30);
        light.position.set(x, H - 0.5, z);
        light.castShadow = false; // Tắt shadow để tối ưu hiệu năng
        scene.add(light);

        // SpotLight hướng xuống để tạo pool ánh sáng rõ nét trên sàn
        const downSpot = new THREE.SpotLight(color, 80, 18, Math.PI / 5, 0.6, 2);
        downSpot.position.set(x, H - 0.6, z);
        downSpot.target.position.set(x, 0, z);
        scene.add(downSpot, downSpot.target);
    }

    // Phòng chính (khu tượng + cánh hai bên)
    addCeilingLight(-27, -15);
    addCeilingLight(-27,   5);
    addCeilingLight(  0, -20);
    addCeilingLight(  0,   5);
    addCeilingLight( 27, -18);
    addCeilingLight( 27,  10);
    addCeilingLight(  0,  22);

    // Thêm đèn phủ các góc còn thiếu
    addCeilingLight(-27, -26, 80, 0xfff0e8);
    addCeilingLight( 27, -26, 80, 0xfff0e8);
    addCeilingLight( 35,  22, 80, 0xfff0e8);
    addCeilingLight(-35,  22, 80, 0xfff0e8);

    // ====================================================
    // NỘI THẤT PHÒNG TRỐNG
    // ====================================================

    // --- VẬT LIỆU DÙNG CHUNG ---
    const darkWoodMat  = new THREE.MeshStandardMaterial({ color: 0x3d2b1a, roughness: 0.7, metalness: 0.05 });
    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b6340, roughness: 0.75, metalness: 0.02 });
    const marbleMat    = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.15, metalness: 0.05 });
    const cushionMat   = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95, metalness: 0.0 });
    const metalMat     = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9 });
    const plantMat     = new THREE.MeshStandardMaterial({ color: 0x2d6a2d, roughness: 0.9, metalness: 0.0 });
    const potMat       = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6, metalness: 0.1 });

    // =====================================================
    // HÀM TẠO GHẾ DÀI GALLERY (BENCH)
    // =====================================================
    function addBench(x, z, ry = 0) {
        const g = new THREE.Group();

        // Mặt ngồi
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.75), lightWoodMat);
        seat.position.set(0, 0.9, 0);
        seat.castShadow = seat.receiveShadow = true;
        g.add(seat);

        // Nệm ngồi
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.6), cushionMat);
        cushion.position.set(0, 1.0, 0);
        cushion.castShadow = true; cushion.receiveShadow = true;
        g.add(cushion);

        // Chân ghế (4 chân kim loại)
        const legPositions = [[-1.15, -0.3], [1.15, -0.3], [-1.15, 0.3], [1.15, 0.3]];
        for (const [lx, lz] of legPositions) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), metalMat);
            leg.position.set(lx, 0.45, lz);
            leg.castShadow = true;
            g.add(leg);
        }

        // Thanh nối chân
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.05), metalMat);
        crossbar.position.set(0, 0.25, 0);
        g.add(crossbar);

        g.position.set(x, 0, z);
        g.rotation.y = ry;
        scene.add(g);
    }

    // Ghế ở phòng chính (xung quanh tượng)
    addBench(-8, 10, 0);
    addBench( 8, 10, Math.PI);
    addBench(-20, -8, Math.PI / 2);
    addBench( 20, -8, -Math.PI / 2);

    // Ghế ở hai cánh phòng
    addBench(-30, -8, 0);
    addBench( 30, -8, 0);
    addBench(-30, 8,  0);
    addBench( 30, 8,  0);

    // =====================================================
    // HÀM TẠO ĐÈN SÀN (FLOOR LAMP)
    // =====================================================
    function addFloorLamp(x, z) {
        const g = new THREE.Group();

        // Chân đèn
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.2, 10), metalMat);
        pole.position.set(0, 1.1, 0);
        pole.castShadow = true;
        g.add(pole);

        // Đế
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 16), metalMat);
        base.position.set(0, 0.03, 0);
        base.castShadow = base.receiveShadow = true;
        g.add(base);

        // Chóa đèn
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.18, 0.35, 16, 1, true),
            new THREE.MeshStandardMaterial({ color: 0xf5dfa0, roughness: 0.8, metalness: 0.0, side: THREE.DoubleSide })
        );
        shade.position.set(0, 2.38, 0);
        shade.castShadow = true;
        g.add(shade);

        // Ánh sáng từ đèn sàn
        const lampLight = new THREE.PointLight(0xffe8a0, 30, 10, 2);
        lampLight.position.set(0, 2.2, 0);
        g.add(lampLight);

        const glowBulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffe8a0 })
        );
        glowBulb.position.set(0, 2.2, 0);
        g.add(glowBulb);

        g.position.set(x, 0, z);
        scene.add(g);
    }

    // Đèn sàn ở góc phòng và cạnh ghế
    addFloorLamp(-36, -22);
    addFloorLamp( 36, -22);
    addFloorLamp(-36,  18);
    addFloorLamp( 36,  18);
    addFloorLamp( -5,  24);
    addFloorLamp(  5,  24);

    // =====================================================
    // HÀM TẠO CÂY TRANG TRÍ
    // =====================================================
    function addDecorativePlant(x, z, scale = 1) {
        const g = new THREE.Group();

        // Chậu
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.18 * scale, 0.4 * scale, 16), potMat);
        pot.position.set(0, 0.2 * scale, 0);
        pot.castShadow = pot.receiveShadow = true;
        g.add(pot);

        // Đất trong chậu
        const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.05 * scale, 16),
            new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 1.0 }));
        soil.position.set(0, 0.4 * scale, 0);
        g.add(soil);

        // Lá tán cây (nhiều quả cầu)
        const leafPositions = [
            [0, 1.2, 0], [-0.18, 1.0, 0.12], [0.2, 0.9, -0.1],
            [0.1, 1.35, -0.15], [-0.12, 1.15, -0.18], [0, 0.8, 0.2],
        ];
        for (const [lx, ly, lz] of leafPositions) {
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry((0.15 + Math.random() * 0.08) * scale, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x1e5c1e + Math.floor(Math.random() * 0x102020), roughness: 0.95 })
            );
            leaf.position.set(lx * scale, ly * scale, lz * scale);
            leaf.castShadow = true;
            g.add(leaf);
        }

        // Thân cây
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.8 * scale, 8),
            new THREE.MeshStandardMaterial({ color: 0x5c3d1a, roughness: 0.9 })
        );
        trunk.position.set(0, 0.6 * scale, 0);
        trunk.castShadow = true;
        g.add(trunk);

        g.position.set(x, 0, z);
        scene.add(g);
    }

    // Cây ở các góc phòng
    addDecorativePlant(-37,  25, 1.3);
    addDecorativePlant( 37,  25, 1.3);
    addDecorativePlant(-37, -27, 1.1);
    addDecorativePlant( 37, -27, 1.1);
    addDecorativePlant( -2, -27, 1.2);
    addDecorativePlant(  2, -27, 1.2);
    addDecorativePlant( 32,  25, 0.9);
    addDecorativePlant(-32,  25, 0.9);

    // =====================================================
    // CỘT TRANG TRÍ (PILLAR / COLUMN)
    // =====================================================
    function addColumn(x, z) {
        const g = new THREE.Group();
        const colMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.05 });

        // Thân cột
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 16), colMat);
        shaft.position.set(0, (H - 0.5) / 2, 0);
        shaft.castShadow = shaft.receiveShadow = true;
        g.add(shaft);

        // Đầu cột
        const capital = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), colMat);
        capital.position.set(0, H - 0.45, 0);
        g.add(capital);

        // Đế cột
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), colMat);
        base.position.set(0, 0.15, 0);
        g.add(base);

        g.position.set(x, 0, z);
        scene.add(g);
        collidableWalls.push(shaft);
    }

    // Cột trang trí ở hai bên cổng trung tâm
    addColumn(-5.0, 15.5);
    addColumn( 5.0, 15.5);

    // =====================================================
    

    // =====================================================
    // DISPLAY PEDESTAL NHỎ (BỤC TRƯNG BÀY HIỆN VẬT)
    // =====================================================
    function addSmallPedestal(x, z, height = 1.2) {
        const g = new THREE.Group();

        const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), marbleMat);
        top.position.set(0, height, 0);
        top.castShadow = top.receiveShadow = true;
        g.add(top);

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, height - 0.1, 0.65), marbleMat);
        body.position.set(0, (height - 0.1) / 2, 0);
        body.castShadow = body.receiveShadow = true;
        g.add(body);

        const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.85), goldMat);
        base.position.set(0, 0.04, 0);
        g.add(base);

        // Vật nhỏ trên bục
        const artifact = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.15, 1),
            new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.1, metalness: 0.9 })
        );
        artifact.position.set(0, height + 0.2, 0);
        artifact.castShadow = true;
        g.add(artifact);

        g.position.set(x, 0, z);
        scene.add(g);
        collidableWalls.push(body);
    }

    // Bục trưng bày nhỏ ở các phòng
    addSmallPedestal(-28, -24, 1.1);
    addSmallPedestal( 28, -24, 1.1);
    addSmallPedestal(-28,  10, 1.3);
    addSmallPedestal( 28,  10, 1.3);

 
    return { collidableWalls };
}
