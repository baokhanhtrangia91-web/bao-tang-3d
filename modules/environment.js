// =====================================================
// environment.js  (MUSEUM EDITION - Tối ưu ánh sáng & Vật liệu)
// =====================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function setupEnvironment(scene) {
    const W = 80;
    const D = 60;
    const H = 15;
    const WALL_THICK = 1;

    // ── ROOM GROUPS ──────────────────────────────────
    const room1 = new THREE.Group(); room1.name = 'room1';
    const room2 = new THREE.Group(); room2.name = 'room2';
    const room3 = new THREE.Group(); room3.name = 'room3';
    const shared = new THREE.Group(); shared.name = 'shared';

    scene.add(shared, room1, room2, room3);
    const collidableWalls = [];

    // ── LOADERS ──────────────────────────────────────
    const loader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader);

    const colliderMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });

    // ── TEXTURES & MUSEUM MATERIALS ───────────────────
    // Sàn gỗ bóng bẩy sang trọng (Polished floor)
    const floorTex = loader.load('/model/go2.jpg');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.15, // Rất bóng
        metalness: 0.1,
        color: 0xcccccc
    });

    // Tường màu Warm Taupe / Gallery Gray (Làm nổi bật tranh)
    const wallTex = loader.load('/model/tuong.jpg');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 2);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    const wallMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        color: 0xCD853F, // Màu xám ấm chuẩn Gallery
        roughness: 0.9,
        metalness: 0.0
    });

    // Trần nhà
    const ceilingTex = loader.load('/model/trần gỗ.jpg');
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(32, 24);
    ceilingTex.colorSpace = THREE.SRGBColorSpace;
    const ceilingMat = new THREE.MeshStandardMaterial({
        map: ceilingTex,
        roughness: 0.9,
        color: 0xaaaaaa // Tối đi một chút để dồn sự chú ý xuống dưới
    });

    // Gỗ ốp tường nghệ thuật
    const woodTex = ceilingTex.clone();
    woodTex.needsUpdate = true;
    woodTex.repeat.set(2, 2);
    const woodMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        color: 0x4a2e1b, // Gỗ màu gụ trầm
        roughness: 0.6
    });

    // Các vật liệu nội thất cao cấp
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfaf9f6, roughness: 0.1, metalness: 0.1 });
    const moldingMat = new THREE.MeshStandardMaterial({ color: 0xc8c3bc, roughness: 0.3 });
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }); // Bệ đen nhám
    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 }); // Gỗ walnut tối
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x6a0dad, roughness: 0.9 }); // Đệm nhung màu tím hoàng gia hoặc 0x800020 (Burgundy)
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.8 }); // Kim loại đen mờ
    const colMat = new THREE.MeshStandardMaterial({ color: 0xFFE4B5, roughness: 0.4 });

    const seatGeo = new THREE.BoxGeometry(2.8, 0.1, 0.75);
    const cushionGeo = new THREE.BoxGeometry(2.6, 0.1, 0.6);
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
    const crossbarGeo = new THREE.BoxGeometry(2.3, 0.05, 0.05);

    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 12);
    const capitalGeo = new THREE.BoxGeometry(1.0, 0.4, 1.0);
    const colBaseGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);

    function roomByX(x) {
        if (Math.abs(Math.abs(x) - 14) < 1.5) return shared;
        if (x < -15) return room1;
        if (x > 15) return room3;
        return room2;
    }

    function addBoxCollider(w, h, d, x, y, z, ry = 0) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), colliderMat);
        c.position.set(x, y, z);
        if (ry) c.rotation.y = ry;
        scene.add(c);
        collidableWalls.push(c);
    }

    function addWall(w, h, d, x, z, customMat = wallMat, targetGroup = null) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), customMat);
        wall.position.set(x, h / 2, z);
        const group = targetGroup ? targetGroup : roomByX(x);
        group.add(wall);
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

        const archGeo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 8 });
        archGeo.translate(0, -h / 2, -d / 2);
        const archMesh = new THREE.Mesh(archGeo, wallMat);
        archMesh.position.set(x, yBase + h / 2, z);
        archMesh.rotation.y = ry;
        shared.add(archMesh);

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
        shared.add(trimMesh);
    }

    function getUniformBox(w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const pos = geo.attributes.position;
        const uv = geo.attributes.uv;
        const nor = geo.attributes.normal;
        const scale = 0.15;
        for (let i = 0; i < uv.count; i++) {
            const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
            if (nx > 0.5) uv.setXY(i, z * scale, y * scale);
            else if (ny > 0.5) uv.setXY(i, x * scale, z * scale);
            else uv.setXY(i, x * scale, y * scale);
        }
        return geo;
    }

    function addWoodWall(w, h, d, x, z) {
        const wall = new THREE.Mesh(getUniformBox(w, h, d), woodMat);
        wall.position.set(x, h / 2, z);
        roomByX(x).add(wall);
        addBoxCollider(w, h, d, x, h / 2, z);
    }

    // =====================================================
    // ÁNH SÁNG TỔNG THỂ (MUSEUM LIGHTING)
    // =====================================================
    // Ánh sáng nền mờ nhẹ để không gian có chiều sâu, tranh tự nổi bật
    shared.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Ánh sáng dội từ trần và sàn nhà (Tạo sự chân thực)
    const hemiLight = new THREE.HemisphereLight(0xfff4e6, 0x222233, 0.4);
    hemiLight.position.set(0, H, 0);
    shared.add(hemiLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    shared.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    shared.add(ceiling);

    // =====================================================
    // TƯỜNG (WALLS & PARTITIONS)
    // =====================================================
    addWall(80, H, WALL_THICK, 0, -29.5, wallMat, shared);
    addWall(WALL_THICK, H, 58, -39.5, 0, wallMat, shared);
    addWall(WALL_THICK, H, 58, 39.5, 0, wallMat, shared);
    addWall(8, H, WALL_THICK, 0, 29.5, wallMat, shared);
    addWall(36, H, WALL_THICK, -22, 29.5, wallMat, shared);
    addWall(36, H, WALL_THICK, 22, 29.5, wallMat, shared);

    addWall(12, H, WALL_THICK, 20, 15, wallMat, shared);
    addWall(WALL_THICK, H, 47, -14, -5.5, wallMat, shared);
    addWall(WALL_THICK, H, 4, -14, 27, wallMat, shared);
    addArch(7, WALL_THICK, -14, 6, 21.5, Math.PI / 2);
    addWall(WALL_THICK, H, 47, 14, -5.5, wallMat, shared);
    addWall(WALL_THICK, H, 4, 14, 27, wallMat, shared);
    addArch(7, WALL_THICK, 14, 6, 21.5, Math.PI / 2);
    addWall(9.5, H, WALL_THICK, -8.75, 15, wallMat, shared);
    addWall(9.5, H, WALL_THICK, 8.75, 15, wallMat, shared);
    addArch(8, WALL_THICK, 0, 6, 15, 0);
    addWall(15, H, WALL_THICK, 31.5, -5, wallMat, shared);

    // =====================================================
    // BỤC TƯỢNG (PEDESTALS)
    // =====================================================
    function createPedestal(cx, cz, width, targetGroup) {
        width = width || 7;
        const g = new THREE.Group();
        const plinthW = width + 0.55;

        const plinth = new THREE.Mesh(new THREE.BoxGeometry(plinthW, 0.22, plinthW), plinthMat);
        plinth.position.set(0, 0.11, 0); g.add(plinth);

        const plinthBevel = new THREE.Mesh(new THREE.BoxGeometry(plinthW + 0.12, 0.08, plinthW + 0.12), moldingMat);
        plinthBevel.position.set(0, 0.04, 0); g.add(plinthBevel);

        const baseH = 0.90;
        const base = new THREE.Mesh(new THREE.BoxGeometry(width, baseH, width), marbleMat);
        base.position.set(0, 0.22 + baseH / 2, 0); g.add(base);

        const astragalBot = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.10, width + 0.14), moldingMat);
        astragalBot.position.set(0, 0.22 + 0.05, 0); g.add(astragalBot);

        const fasciaY = 0.22 + baseH;
        const fascia = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.13, width + 0.08), moldingMat);
        fascia.position.set(0, fasciaY + 0.065, 0); g.add(fascia);

        const neckW = width - 0.10, neckH = 0.45;
        const neck = new THREE.Mesh(new THREE.BoxGeometry(neckW, neckH, neckW), marbleMat);
        neck.position.set(0, fasciaY + 0.13 + neckH / 2, 0); g.add(neck);

        const cymaY = fasciaY + 0.13 + neckH;
        const cyma = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, 0.12, width + 0.18), moldingMat);
        cyma.position.set(0, cymaY + 0.06, 0); g.add(cyma);

        const abacusY = cymaY + 0.12;
        const abacus = new THREE.Mesh(new THREE.BoxGeometry(width + 0.30, 0.10, width + 0.30), plinthMat);
        abacus.position.set(0, abacusY + 0.05, 0); g.add(abacus);

        g.position.set(cx, 0, cz);
        targetGroup.add(g);

        const totalH = abacusY + 0.10;
        addBoxCollider(width + 0.60, totalH + 3.0, width + 0.60, cx, (totalH + 3.0) / 2, cz);
    }

    // =====================================================
    // ROOM 2 — Central pedestal + david
    // =====================================================
    const statueZ = -7;
    createPedestal(0, statueZ, 7, room2);

    const barrierSize = 11, ropeWallH = 2.5, barrierOffset = barrierSize / 2;
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ + barrierOffset);
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ - barrierOffset);
    addBoxCollider(0.3, ropeWallH, barrierSize, -barrierOffset, ropeWallH / 2, statueZ);
    addBoxCollider(0.3, ropeWallH, barrierSize, barrierOffset, ropeWallH / 2, statueZ);

    // Đèn rọi tượng cực đẹp (Chuẩn phim trường/Bảo tàng)
    const statueLight = new THREE.SpotLight(0xfffaeb, 200); // Ánh sáng chính ấm
    statueLight.position.set(3, 14, statueZ + 5);
    statueLight.angle = Math.PI / 6; statueLight.penumbra = 0.8; // Rìa siêu mềm
    statueLight.decay = 2; statueLight.distance = 55; statueLight.castShadow = false;
    statueLight.target.position.set(0, 2, statueZ);
    room2.add(statueLight, statueLight.target);

    const statueFill = new THREE.SpotLight(0xe0edff, 80); // Fill light màu xanh lạnh tôn khối
    statueFill.position.set(-3, 10, statueZ - 4);
    statueFill.angle = Math.PI / 4; statueFill.penumbra = 0.8;
    statueFill.decay = 2; statueFill.distance = 30; statueFill.castShadow = false;
    statueFill.target.position.set(0, 1.5, statueZ);
    room2.add(statueFill, statueFill.target);

    function addColumn(x, z) {
        const g = new THREE.Group();
        const shaft = new THREE.Mesh(shaftGeo, colMat); shaft.position.set(0, (H - 0.5) / 2, 0); g.add(shaft);
        const capital = new THREE.Mesh(capitalGeo, colMat); capital.position.set(0, H - 0.45, 0); g.add(capital);
        const base = new THREE.Mesh(colBaseGeo, colMat); base.position.set(0, 0.15, 0); g.add(base);
        g.position.set(x, 0, z);
        room2.add(g);
        addBoxCollider(0.9, H, 0.9, x, H / 2, z);
    }
    addColumn(-4.5, 16.0);
    addColumn(4.5, 16.0);

    // =====================================================
    // ROOM 1 — Left wing: statues on pedestals
    // =====================================================
    const LEFT_X = -26.75;
    const LEFT_BED_W = 4.5;
    const leftZPositions = [-14, 0, 14];

    for (const pz of leftZPositions) createPedestal(LEFT_X, pz, LEFT_BED_W, room1);

    for (const pz of leftZPositions) {
        // Đèn rọi tượng mềm mại
        const sp = new THREE.SpotLight(0xfff4e6, 150);
        sp.position.set(LEFT_X + 5, 13, pz + 3);
        sp.angle = Math.PI / 6; sp.penumbra = 0.7;
        sp.decay = 2; sp.distance = 30; sp.castShadow = false;
        sp.target.position.set(LEFT_X, 2.5, pz);
        room1.add(sp, sp.target);
    }

    gltfLoader.load('/model/David_statue.glb', (gltf) => {
        const m = gltf.scene; m.position.set(LEFT_X, 1.7, -14); m.scale.setScalar(1);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } }); room1.add(m);
    });

    gltfLoader.load('/model/pieta.glb', (gltf) => {
        const m = gltf.scene; m.position.set(LEFT_X, 1.95, 0); m.scale.setScalar(6);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } }); room1.add(m);
    });

    gltfLoader.load('/model/statue1.glb', (gltf) => {
        const m = gltf.scene; m.position.set(LEFT_X, 2.4, 14); m.scale.setScalar(0.3);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } }); room1.add(m);
    });

    gltfLoader.load('/model/davidtank.glb', (gltf) => {
        const m = gltf.scene; m.position.set(0, 1.4, statueZ); m.scale.setScalar(80);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } }); room2.add(m);
    });

    // =====================================================
    // CHANDELIERS (Tạo vệt sáng đẹp mắt xuống sàn nhà)
    // =====================================================
    const chandelierPositions = [
        [-27, -15], [-27, 0], [-27, 15],
        [0, -7],
        [27, -15.5], [27, 5], [27, 22],
    ];

    for (const [x, z] of chandelierPositions) {
        // Ánh sáng tỏa ra từ đèn chùm ấm áp
        const pl = new THREE.PointLight(0xffe0b2, 100, 40);
        pl.position.set(x, H - 4.5, z);
        pl.decay = 2;
        pl.castShadow = false;
        roomByX(x).add(pl);
    }

    gltfLoader.load('/model/chandelier (2).glb', (gltf) => {
        const base = gltf.scene;
        base.scale.setScalar(25);
        base.traverse(n => {
            if (n.isMesh) {
                n.castShadow = false; n.receiveShadow = false;
                // Tăng độ sáng vật liệu của đèn chùm
                if (n.material) n.material.emissive = new THREE.Color(0x332211);
            }
        });

        for (const [x, z] of chandelierPositions) {
            const c = base.clone();
            c.position.set(x, H - 5, z);
            roomByX(x).add(c);
        }
    });

    // =====================================================
    // BENCHES (Ghế nghỉ màu rượu vang hoàng gia)
    // =====================================================
    function addBench(x, z, ry = 0) {
        const g = new THREE.Group();
        const seat = new THREE.Mesh(seatGeo, lightWoodMat); seat.position.set(0, 0.9, 0); g.add(seat);
        const cushion = new THREE.Mesh(cushionGeo, cushionMat); cushion.position.set(0, 1.0, 0); g.add(cushion);
        for (const [lx, lz] of [[-1.15, -0.3], [1.15, -0.3], [-1.15, 0.3], [1.15, 0.3]]) {
            const leg = new THREE.Mesh(legGeo, metalMat); leg.position.set(lx, 0.45, lz); g.add(leg);
        }
        g.add(new THREE.Mesh(crossbarGeo, metalMat));
        const cb = g.children[g.children.length - 1];
        cb.position.set(0, 0.25, 0);
        g.position.set(x, 0, z);
        g.rotation.y = ry;
        roomByX(x).add(g);
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

    // =====================================================
    // ROOM 3 — Display cases (Tủ trưng bày nghệ thuật)
    // =====================================================
    function addDisplayUnit(cx, cz, cw, cd, wallSides = []) {
        const sl = new THREE.SpotLight(0xffffff, 200); // Đèn spotlight trắng giòn bên trong tủ
        sl.position.set(cx, 13, cz);
        sl.angle = Math.PI / 5; sl.penumbra = 0.6;
        sl.decay = 2; sl.distance = 30; sl.castShadow = false;
        sl.target.position.set(cx, 1.5, cz);
        room3.add(sl, sl.target);
    }

    function addGlassCase(cx, cz, cw, cd, showPedestal = true) {
        // ── dimensions ──────────────────────────────
        const GLASS_H = 13.0;   // visual height of the glass enclosure
        const PANEL_T = 0.08;   // panel thickness (thin glass look)
        const OFFSET = 0.02;   // outward nudge to prevent z-fighting
        const BASE_Y = 0.1;    // low-wall height — glass sits on top of it
        const GLASS_MID = BASE_Y + GLASS_H / 2; // panel centre Y

        // Collider height covers a standing player above the low wall
        const COL_H = 4.0;
        const COL_Y = BASE_Y + COL_H / 2;

        // ── pedestal dims ────────────────────────────
        const PED_W = Math.min(cw, cd) * 0.55;
        const PED_D = Math.min(cw, cd) * 0.55;
        const PED_H = 1.0;
        const PED_Y = BASE_Y + PED_H / 2;

        // ── materials ────────────────────────────────
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xadd8e6,
            transparent: true,
            opacity: 0.22,
            roughness: 0.05,
            metalness: 0.15,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x1c1c1c,
            roughness: 0.35,
            metalness: 0.1,
        });

        const pedestalTopMat = new THREE.MeshStandardMaterial({
            color: 0x2e2e2e,
            roughness: 0.2,
            metalness: 0.15,
        });

        // ── helper: one glass panel ───────────────────
        function glassPanel(w, h, d, ox, oy, oz) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat);
            mesh.position.set(cx + ox, oy, cz + oz);
            room3.add(mesh);
        }

        // ── 5 glass panels ────────────────────────────
        glassPanel(cw, GLASS_H, PANEL_T, 0, GLASS_MID, cd / 2 + OFFSET);   // Front
        glassPanel(cw, GLASS_H, PANEL_T, 0, GLASS_MID, -cd / 2 - OFFSET);   // Back
        glassPanel(PANEL_T, GLASS_H, cd, -cw / 2 - OFFSET, GLASS_MID, 0);    // Left
        glassPanel(PANEL_T, GLASS_H, cd, cw / 2 + OFFSET, GLASS_MID, 0);    // Right
        glassPanel(cw + PANEL_T * 2, PANEL_T, cd + PANEL_T * 2,               // Top
            0, BASE_Y + GLASS_H + OFFSET, 0);

        // ── collision — 4 sides at player height ──────
        addBoxCollider(cw, COL_H, PANEL_T, cx, COL_Y, cz + cd / 2 + OFFSET); // Front
        addBoxCollider(cw, COL_H, PANEL_T, cx, COL_Y, cz - cd / 2 - OFFSET); // Back
        addBoxCollider(PANEL_T, COL_H, cd, cx - cw / 2 - OFFSET, COL_Y, cz);                   // Left
        addBoxCollider(PANEL_T, COL_H, cd, cx + cw / 2 + OFFSET, COL_Y, cz);                   // Right

        // ── pedestal body ─────────────────────────────
        if (showPedestal) {
            const pedBase = new THREE.Mesh(new THREE.BoxGeometry(PED_W, PED_H, PED_D), pedestalMat);
            pedBase.position.set(cx, PED_Y, cz);
            room3.add(pedBase);

            const CAP_H = 0.07;
            const pedCap = new THREE.Mesh(new THREE.BoxGeometry(PED_W + 0.12, CAP_H, PED_D + 0.12), pedestalTopMat);
            pedCap.position.set(cx, BASE_Y + PED_H + CAP_H / 2, cz);
            room3.add(pedCap);

            const REV_H = 0.05;
            const pedRev = new THREE.Mesh(new THREE.BoxGeometry(PED_W + 0.06, REV_H, PED_D + 0.06), pedestalTopMat);
            pedRev.position.set(cx, BASE_Y + REV_H / 2, cz);
            room3.add(pedRev);

            // Pedestal collider
            addBoxCollider(PED_W + 0.2, PED_H + CAP_H + 2.0, PED_D + 0.2,
                cx, BASE_Y + (PED_H + CAP_H + 2.0) / 2, cz);
        }
    }

    const A_CW = 16, A_CX = 31.45, A_CZ = -26.5, A_CD = 5;
    const D_CW = 5, D_CX = 36, D_CZ = 14.75, D_CD = 28.5;
    addDisplayUnit(A_CX, A_CZ, A_CW, A_CD, ['back']);
    addDisplayUnit(D_CX, D_CZ, D_CW, D_CD, ['right']);
    addGlassCase(A_CX, A_CZ, A_CW, A_CD, false);
    addGlassCase(D_CX, D_CZ, D_CW, D_CD, false);

    addWoodWall(8.95, 16, 6, 18.0, -26.5);
    addWoodWall(1, 15, 5.5, 22.95, -26.25);

    const topA = new THREE.Mesh(getUniformBox(16, 9, 1), woodMat);
    topA.position.set(31.45, 10.5, -24.0); room3.add(topA);
    addBoxCollider(16, 9, 1, 31.45, 10.5, -24.0);

    const ceilA = new THREE.Mesh(getUniformBox(18, 0.3, 5.5), woodMat);
    ceilA.position.set(31.45, 14.85, -26.25); room3.add(ceilA);

    const botD = new THREE.Mesh(getUniformBox(6, 15, 1), woodMat);
    botD.position.set(36.0, 7.5, 0.0); room3.add(botD);
    addBoxCollider(6, 15, 1, 36.0, 7.5, 0.0);

    const topFrontD = new THREE.Mesh(getUniformBox(1, 9, 28.5), woodMat);
    topFrontD.position.set(33.5, 10.5, 14.75); room3.add(topFrontD);
    addBoxCollider(1, 9, 28.5, 33.5, 10.5, 14.75);

    const ceilD = new THREE.Mesh(getUniformBox(6, 0.3, 29.5), woodMat);
    ceilD.position.set(36.0, 14.85, 14.25); room3.add(ceilD);

    addWoodWall(6, 15, 5, 36.0, -2.5);

    const LOW_WALL_H = 1.4, T = 0.4;
    addWoodWall(16.2, LOW_WALL_H, T, 31.45, -23.7);
    addWoodWall(T, LOW_WALL_H, 5.5, 22.95, -26.25);
    addWoodWall(T, LOW_WALL_H, 29.0, 33.20, 14.5);


    return {
        collidableWalls,
        rooms: [room1, room2, room3],
        shared,
    };
}