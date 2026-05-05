// =====================================================
// environment.js  (REFACTORED — Room-Group Edition)
//
// CHANGES vs original:
//   • scene.add() for world content is now room.add() or shared.add()
//   • All 3 room Groups + 1 shared Group are built and returned
//   • collidableWalls is still a flat array (collision works globally)
//   • GLTF models lazy-load per room (only requested when needed)
//   • No logic removed — just re-routed to the correct Group
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
    // room1 = Left wing   (Michelangelo statues)
    // room2 = Centre hall (David + main corridor)
    // room3 = Right wing  (Van Gogh / Da Vinci cases)
    // shared = floor, ceiling, ambient lights — always visible
    const room1  = new THREE.Group(); room1.name  = 'room1';
    const room2  = new THREE.Group(); room2.name  = 'room2';
    const room3  = new THREE.Group(); room3.name  = 'room3';
    const shared = new THREE.Group(); shared.name = 'shared';

    // Add all groups to scene up front so Three.js frustum-culls them as units
    scene.add(shared, room1, room2, room3);

    // Collision walls are always active regardless of visibility
    const collidableWalls = [];

    // ── LOADERS ──────────────────────────────────────
    const loader     = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader);

    // Invisible collider — shared material
    const colliderMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });

    // ── TEXTURES (load once, reuse) ───────────────────
    const floorTex = loader.load('/model/go2.jpg');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24);
    floorTex.colorSpace = THREE.SRGBColorSpace;

    const wallTex = loader.load('/model/tuong.jpg');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 2);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xFFE4B5, roughness: 0.85 });

    const ceilingTex = loader.load('/model/trần gỗ.jpg');
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(32, 24);
    ceilingTex.colorSpace = THREE.SRGBColorSpace;
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.8 });

    const woodTex = ceilingTex.clone();
    woodTex.needsUpdate = true;
    woodTex.repeat.set(2, 2);
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.5 });

    // ── SHARED MATERIALS (reused across rooms) ────────
    const marbleMat  = new THREE.MeshStandardMaterial({ color: 0xf4f0eb, roughness: 0.18 });
    const moldingMat = new THREE.MeshStandardMaterial({ color: 0xd6d0c8, roughness: 0.28 });
    const plinthMat  = new THREE.MeshStandardMaterial({ color: 0xe2ddd6, roughness: 0.35 });
    const glassMat   = new THREE.MeshPhysicalMaterial({
        color: 0xddeeff, metalness: 0.05, roughness: 0.0,
        transmission: 0.88, transparent: true, side: THREE.DoubleSide,
    });
    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b6340, roughness: 0.75, metalness: 0.02 });
    const cushionMat   = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95 });
    const metalMat     = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9 });
    const colMat       = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.05 });

    // Shared bench geometries
    const seatGeo    = new THREE.BoxGeometry(2.8, 0.1, 0.75);
    const cushionGeo = new THREE.BoxGeometry(2.6, 0.1, 0.6);
    const legGeo     = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
    const crossbarGeo = new THREE.BoxGeometry(2.3, 0.05, 0.05);

    // Column geometries
    const shaftGeo   = new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 12);
    const capitalGeo = new THREE.BoxGeometry(1.0, 0.4, 1.0);
    const colBaseGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);

    // ─────────────────────────────────────────────────
    // HELPER: pick which group an object belongs to
    // by its world X position.
    // ─────────────────────────────────────────────────
    function roomByX(x) {
        if (x < -14) return room1;
        if (x >  14) return room3;
        return room2;
    }

    // ── COLLIDER helper (always scene-level for collision) ──
    function addBoxCollider(w, h, d, x, y, z, ry = 0) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), colliderMat);
        c.position.set(x, y, z);
        if (ry) c.rotation.y = ry;
        scene.add(c); // colliders stay on scene so raycaster always finds them
        collidableWalls.push(c);
    }

    // ── WALL helper ──────────────────────────────────
    function addWall(w, h, d, x, z, customMat = wallMat) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), customMat);
        wall.position.set(x, h / 2, z);
        // Route to the correct room group
        roomByX(x).add(wall);
        addBoxCollider(w, h, d, x, h / 2, z);
    }

    // ── ARCH helper ───────────────────────────────────
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
        // Arches sit at room boundaries — add to both adjacent rooms
        // so the arch is always visible whichever side the player is on.
        // (small cost, very important for visual continuity)
        room1.add(archMesh.clone());
        room2.add(archMesh);

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
        room1.add(trimMesh.clone());
        room2.add(trimMesh);
    }

    // ── UNIFORM UV BOX ────────────────────────────────
    function getUniformBox(w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const pos = geo.attributes.position;
        const uv  = geo.attributes.uv;
        const nor = geo.attributes.normal;
        const scale = 0.15;
        for (let i = 0; i < uv.count; i++) {
            const x  = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
            if (nx > 0.5)      uv.setXY(i, z * scale, y * scale);
            else if (ny > 0.5) uv.setXY(i, x * scale, z * scale);
            else               uv.setXY(i, x * scale, y * scale);
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
    // SHARED — floor, ceiling, ambient lights
    // These are always rendered (cheap quads + 2 lights)
    // =====================================================
    shared.add(new THREE.AmbientLight(0xd4a373, 2));
    const hemiLight = new THREE.HemisphereLight(0xc29b70, 0x1a120b, 0.2);
    hemiLight.position.set(0, H, 0);
    shared.add(hemiLight);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D),
        new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    shared.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    shared.add(ceiling);

    // =====================================================
    // WALLS & PARTITIONS
    // (same calls as original — router helper picks room)
    // =====================================================
    addWall(80, H, WALL_THICK, 0, -29.5);          // back wall (room2 owns it)
    addWall(WALL_THICK, H, 58, -39.5, 0);           // far left  → room1
    addWall(WALL_THICK, H, 58,  39.5, 0);           // far right → room3
    addWall(8,  H, WALL_THICK, 0,   29.5);
    addWall(36, H, WALL_THICK, -22, 29.5);
    addWall(36, H, WALL_THICK,  22, 29.5);
    addWall(12, H, WALL_THICK, 20,  15);
    addWall(WALL_THICK, H, 47, -14, -5.5);
    addWall(WALL_THICK, H,  4, -14,  27);
    addArch(7, WALL_THICK, -14, 6, 21.5, Math.PI / 2);
    addWall(WALL_THICK, H, 47,  14, -5.5);
    addWall(WALL_THICK, H,  4,  14,  27);
    addArch(7, WALL_THICK,  14, 6, 21.5, Math.PI / 2);
    addWall(9.5, H, WALL_THICK, -8.75, 15);
    addWall(9.5, H, WALL_THICK,  8.75, 15);
    addArch(8, WALL_THICK, 0, 6, 15, 0);
    addWall(15, H, WALL_THICK, 31.5, -5);

    // =====================================================
    // PEDESTALS — helper (same logic as original)
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
        targetGroup.add(g); // ← room-specific group

        const totalH = abacusY + 0.10;
        addBoxCollider(width + 0.60, totalH + 3.0, width + 0.60, cx, (totalH + 3.0) / 2, cz);
    }

    // =====================================================
    // ROOM 2 — Central pedestal + david
    // =====================================================
    const statueZ = -7;
    createPedestal(0, statueZ, 7, room2);

    // Barrier colliders (room2)
    const barrierSize = 11, ropeWallH = 2.5, barrierOffset = barrierSize / 2;
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ + barrierOffset);
    addBoxCollider(barrierSize, ropeWallH, 0.3, 0, ropeWallH / 2, statueZ - barrierOffset);
    addBoxCollider(0.3, ropeWallH, barrierSize, -barrierOffset, ropeWallH / 2, statueZ);
    addBoxCollider(0.3, ropeWallH, barrierSize,  barrierOffset, ropeWallH / 2, statueZ);

    // Central statue lights (room2)
    const statueLight = new THREE.SpotLight(0xfff0dd, 300);
    statueLight.position.set(0, 13.5, statueZ);
    statueLight.angle = Math.PI / 5; statueLight.penumbra = 0.4;
    statueLight.decay = 2; statueLight.distance = 55; statueLight.castShadow = false;
    statueLight.target.position.set(0, 1.5, statueZ);
    room2.add(statueLight, statueLight.target);

    const statueFill = new THREE.SpotLight(0xc8deff, 25);
    statueFill.position.set(0, 12, statueZ);
    statueFill.angle = Math.PI / 4; statueFill.penumbra = 0.8;
    statueFill.decay = 2; statueFill.distance = 30; statueFill.castShadow = false;
    statueFill.target.position.set(0, 1.5, statueZ);
    room2.add(statueFill, statueFill.target);

    // Arch columns (room2)
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
    addColumn( 4.5, 16.0);

    // =====================================================
    // ROOM 1 — Left wing: statues on pedestals
    // =====================================================
    const LEFT_X = -26.75;
    const LEFT_BED_W = 4.5;
    const leftZPositions = [-14, 0, 14];

    for (const pz of leftZPositions) createPedestal(LEFT_X, pz, LEFT_BED_W, room1);

    // Spotlights for left wing (room1)
    for (const pz of leftZPositions) {
        const sp = new THREE.SpotLight(0xfff0dd, 120);
        sp.position.set(LEFT_X + 5, 13, pz + 3);
        sp.angle = Math.PI / 6; sp.penumbra = 0.4;
        sp.decay = 2; sp.distance = 28; sp.castShadow = false;
        sp.target.position.set(LEFT_X, 2.5, pz);
        room1.add(sp, sp.target);
    }

    // ── LAZY-LOAD: Room 1 GLTF models ────────────────
    // These are only requested when this module loads,
    // but Three.js will only parse/upload to GPU lazily.
    // For true lazy-loading, wrap each in a function and
    // call it when roomManager.currentRoom === 0.
    gltfLoader.load('/model/David_statue.glb', (gltf) => {
        const m = gltf.scene;
        m.position.set(LEFT_X, 1.7, -14); m.scale.setScalar(1);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        room1.add(m);
    });

    gltfLoader.load('/model/pieta.glb', (gltf) => {
        const m = gltf.scene;
        m.position.set(LEFT_X, 1.95, 0); m.scale.setScalar(6);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        room1.add(m);
    });

    gltfLoader.load('/model/statue1.glb', (gltf) => {
        const m = gltf.scene;
        m.position.set(LEFT_X, 2.4, 14); m.scale.setScalar(0.3);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        room1.add(m);
    });

    // =====================================================
    // ROOM 2 — Central model (davidtank)
    // =====================================================
    gltfLoader.load('/model/davidtank.glb', (gltf) => {
        const m = gltf.scene;
        m.position.set(0, 1.4, statueZ); m.scale.setScalar(80);
        m.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        room2.add(m);
    });

    // =====================================================
    // CHANDELIERS — distributed across rooms by X position
    // =====================================================
    const chandelierPositions = [
        [-27, -15], [-27, 0], [-27, 15],       // room1
        [0, -7],                                 // room2
        [27, -15.5], [27, 5], [27, 22],          // room3
    ];

    for (const [x, z] of chandelierPositions) {
        const pl = new THREE.PointLight(0xffeacc, 70, 32);
        pl.position.set(x, H - 4.5, z);
        pl.castShadow = false;
        roomByX(x).add(pl);
    }

    gltfLoader.load('/model/chandelier (2).glb', (gltf) => {
        const base = gltf.scene;
        base.scale.setScalar(25);
        base.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });

        for (const [x, z] of chandelierPositions) {
            const c = base.clone();
            c.position.set(x, H - 5, z);
            roomByX(x).add(c);
        }
    });

    // =====================================================
    // BENCHES
    // =====================================================
    function addBench(x, z, ry = 0) {
        const g = new THREE.Group();
        const seat = new THREE.Mesh(seatGeo, lightWoodMat); seat.position.set(0, 0.9, 0); g.add(seat);
        const cushion = new THREE.Mesh(cushionGeo, cushionMat); cushion.position.set(0, 1.0, 0); g.add(cushion);
        for (const [lx, lz] of [[-1.15, -0.3], [1.15, -0.3], [-1.15, 0.3], [1.15, 0.3]]) {
            const leg = new THREE.Mesh(legGeo, metalMat); leg.position.set(lx, 0.45, lz); g.add(leg);
        }
        g.add(new THREE.Mesh(crossbarGeo, metalMat)); // crossbar at 0,0,0 of group — then repositioned
        const cb = g.children[g.children.length - 1];
        cb.position.set(0, 0.25, 0);
        g.position.set(x, 0, z);
        g.rotation.y = ry;
        roomByX(x).add(g);
        addBoxCollider(2.8, 1.1, 0.8, x, 0.55, z, ry);
    }

    addBench(-8,   14,  0);
    addBench(12.6, 10,  Math.PI / 2);
    addBench(12.6,  8,  Math.PI / 2);
    addBench(-38.4, 0,  Math.PI / 2);
    addBench(15.1, -2, -Math.PI / 2);
    addBench(-38.4, 8,  Math.PI / 2);
    addBench(15.1, -6, -Math.PI / 2);
    addBench(-38.4, 4,  Math.PI / 2);
    addBench(22,   14,  0);
    addBench(22,   16.1, 0);
    addBench(18,   16.1, 0);

    // =====================================================
    // ROOM 3 — Display cases (Van Gogh / Da Vinci)
    // =====================================================
    const CASE_H = 6;

    function addDisplayUnit(cx, cz, cw, cd, wallSides = []) {
        const centerY = CASE_H / 2;
        const hw = cw / 2, hd = cd / 2;
        const planes = [
            { skip: 'front', geo: new THREE.BoxGeometry(cw, CASE_H, 0.06), pos: [cx, centerY, cz + hd], col: [cw, CASE_H, 0.12, cx, centerY, cz + hd] },
            { skip: 'back',  geo: new THREE.BoxGeometry(cw, CASE_H, 0.06), pos: [cx, centerY, cz - hd], col: [cw, CASE_H, 0.12, cx, centerY, cz - hd] },
            { skip: 'right', geo: new THREE.BoxGeometry(0.06, CASE_H, cd), pos: [cx + hw, centerY, cz], col: [0.12, CASE_H, cd, cx + hw, centerY, cz] },
            { skip: 'left',  geo: new THREE.BoxGeometry(0.06, CASE_H, cd), pos: [cx - hw, centerY, cz], col: [0.12, CASE_H, cd, cx - hw, centerY, cz] },
        ];
        for (const { skip, geo, pos, col } of planes) {
            if (wallSides.includes(skip)) continue;
            const m = new THREE.Mesh(geo, glassMat);
            m.position.set(...pos);
            room3.add(m);
            addBoxCollider(...col);
        }

        const roof = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.06, cd), glassMat);
        roof.position.set(cx, CASE_H, cz);
        room3.add(roof);

        const sl = new THREE.SpotLight(0xfff4e0, 320);
        sl.position.set(cx, 13, cz);
        sl.angle = Math.PI / 5; sl.penumbra = 0.5;
        sl.decay = 1.8; sl.distance = 28; sl.castShadow = false;
        sl.target.position.set(cx, 1.5, cz);
        room3.add(sl, sl.target);
    }

    const A_CW = 16, A_CX = 31.45, A_CZ = -26.5, A_CD = 5;
    const D_CW =  5, D_CX = 36.5,  D_CZ = 14.75,  D_CD = 28.5;
    addDisplayUnit(A_CX, A_CZ, A_CW, A_CD, ['back']);
    addDisplayUnit(D_CX, D_CZ, D_CW, D_CD, ['right']);

    // Wood panel walls around cases (room3)
    addWoodWall(8.95, 16, 6, 18.0, -26.5);
    addWoodWall(1,    15, 5.5, 22.95, -26.25);

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

    // =====================================================
    // RETURN — expose groups for roomManager + collidableWalls
    // =====================================================
    return {
        collidableWalls,
        rooms: [room1, room2, room3],
        shared,
    };
}
