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

    // === VẬT LIỆU CHO BOX COLLIDER (TÀNG HÌNH) ===
    const colliderMat = new THREE.MeshBasicMaterial({ 
        visible: false, 
        side: THREE.DoubleSide 
    });

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
    // Giảm nhẹ ambient so với lúc tắt đèn để các vùng sáng nổi bật hơn
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.8);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xfff5e8, 0x3a2a18, 0.6);
    hemiLight.position.set(0, H, 0);
    scene.add(hemiLight);

    // === SÀN ===
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D),
        new THREE.MeshStandardMaterial({ map: floorTex, color: 0xcccccc, roughness: 0.6, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    // BẬT LẠI: Nhận bóng đổ từ đèn chính
    floor.receiveShadow = true; 
    scene.add(floor);

    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7, metalness: 0.1 });

    // === TRẦN ===
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    ceiling.castShadow = false;
    ceiling.receiveShadow = false;
    scene.add(ceiling);

    // === HELPER: TẠO BOX COLLIDER ===
    function addBoxCollider(w, h, d, x, y, z, ry = 0) {
        const collider = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), colliderMat);
        collider.position.set(x, y, z);
        collider.rotation.y = ry;
        scene.add(collider);
        collidableWalls.push(collider);
    }

    // === HELPER: TẠO TƯỜNG ===
    function addWall(w, h, d, x, z) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        wall.position.set(x, h / 2, z);
        wall.castShadow = false; 
        // Cho phép tường nhận bóng từ đèn Spotlight để không gian sâu hơn
        wall.receiveShadow = true; 
        scene.add(wall);

        addBoxCollider(w, h, d, x, h / 2, z);

        const bbW = w > d ? w : 0.12;
        const bbD = d > w ? d : 0.12;
        const bb = new THREE.Mesh(new THREE.BoxGeometry(bbW, 0.25, bbD + 0.05), baseboardMat);
        bb.position.set(x, 0.125, z);
        bb.castShadow = false; 
        bb.receiveShadow = false;
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
        archMesh.castShadow = false; 
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
        trimMesh.castShadow = false;
        trimMesh.receiveShadow = false;
        scene.add(trimMesh);
    }

    // === TƯỜNG BAO & VÁCH NGĂN ===
    addWall(80,         H, WALL_THICK,  0,     -29.5);
    addWall(WALL_THICK, H, 58,         -39.5,   0);
    addWall(WALL_THICK, H, 58,          39.5,   0);
    
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
    pedestalBase.castShadow = true; 
    pedestalBase.receiveShadow = true; 
    pedestalGroup.add(pedestalBase);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3, metalness: 0.9 });
    const pedestalTop = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 7.4), goldMat);
    pedestalTop.position.set(0, 1.5, 0);
    pedestalTop.castShadow = true; 
    pedestalTop.receiveShadow = true; 
    pedestalGroup.add(pedestalTop);

    const pedestalBottom = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 7.4), goldMat);
    pedestalBottom.position.set(0, 0.1, 0);
    pedestalBottom.castShadow = false;
    pedestalBottom.receiveShadow = true; 
    pedestalGroup.add(pedestalBottom);

    pedestalGroup.position.set(0, 0, statueZ);
    scene.add(pedestalGroup);

    addBoxCollider(7.5, 5.0, 7.5, 0, 2.5, statueZ);

    // === RÀO CHẮN VIP ===
    const barrierSize = 11;
    const barrierOffset = barrierSize / 2;
    const ropeWallHeight = 2.5;
    const wallThick = 0.3; 

    addBoxCollider(barrierSize, ropeWallHeight, wallThick, 0, ropeWallHeight / 2, statueZ + barrierOffset); 
    addBoxCollider(barrierSize, ropeWallHeight, wallThick, 0, ropeWallHeight / 2, statueZ - barrierOffset); 
    addBoxCollider(wallThick, ropeWallHeight, barrierSize, -barrierOffset, ropeWallHeight / 2, statueZ); 
    addBoxCollider(wallThick, ropeWallHeight, barrierSize,  barrierOffset, ropeWallHeight / 2, statueZ); 

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

    // ====================================================
    // BẬT LẠI: ĐÈN RỌI TƯỢNG (HERO LIGHT) 
    // Đây là nguồn sáng duy nhất có castShadow = true
    // ====================================================
    const statueLight = new THREE.SpotLight(0xfff0dd, 400);
    statueLight.position.set(3, 13.5, statueZ + 12);
    statueLight.angle    = Math.PI / 5;
    statueLight.penumbra = 0.4;
    statueLight.decay    = 2;
    statueLight.distance = 55;
    statueLight.castShadow = true; 
    statueLight.shadow.mapSize.set(1024, 1024); // Đủ nét để thấy bóng tượng
    statueLight.shadow.bias = -0.001;
    statueLight.target.position.set(0, 1.5, statueZ);
    scene.add(statueLight, statueLight.target);

    // Đèn Fill (Nhẹ nhàng bổ trợ mặt tối của tượng, không tạo bóng đổ)
    const statueFill = new THREE.SpotLight(0xc8deff, 60);
    statueFill.position.set(-5, 8, statueZ - 8);
    statueFill.angle    = Math.PI / 4;
    statueFill.penumbra = 0.8;
    statueFill.decay    = 2;
    statueFill.distance = 30;
    statueFill.castShadow = false;
    statueFill.target.position.set(0, 1.5, statueZ);
    scene.add(statueFill, statueFill.target);

    // MODEL TƯỢNG
    gltfLoader.load('model/da_vinci_tank.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 1.3, statueZ);
        model.scale.setScalar(80);
        model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } }); 
        scene.add(model);
    }, undefined, err => console.error('Lỗi tải model:', err));

    // === ĐÈN TRẦN (Bật lại PointLight nhưng KHÔNG tạo bóng) ===
    function addCeilingLight(x, z) {
        const panelMat = new THREE.MeshBasicMaterial({ color: 0xfff8e8 });
        const panel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.06, 1.0), panelMat);
        panel.position.set(x, H - 0.04, z);
        scene.add(panel);

        const rimMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.8, roughness: 0.2 });
        const rim = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.08, 1.2), rimMat);
        rim.position.set(x, H - 0.06, z);
        scene.add(rim);

        // Ánh sáng tỏa ra từ đèn trần để tạo vùng sáng trên tường/sàn
        const light = new THREE.PointLight(0xfff8f0, 80, 25);
        light.position.set(x, H - 0.5, z);
        light.castShadow = false; // Tắt shadow để tối ưu
        scene.add(light);
    }

    addCeilingLight(-27, -15);
    addCeilingLight(-27,   5);
    addCeilingLight(  0, -20);
    addCeilingLight(  0,   5);
    addCeilingLight( 27, -18);
    addCeilingLight( 27,  10);
    addCeilingLight(  0,  22);
    addCeilingLight(-27, -26);
    addCeilingLight( 27, -26);
    addCeilingLight( 35,  22);
    addCeilingLight(-35,  22);

    // ====================================================
    // NỘI THẤT PHÒNG TRỐNG
    // ====================================================
    const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b6340, roughness: 0.75, metalness: 0.02 });
    const cushionMat   = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.95, metalness: 0.0 });
    const metalMat     = new THREE.MeshStandardMaterial({ color: 0x888890, roughness: 0.25, metalness: 0.9 });

    function addBench(x, z, ry = 0) {
        const g = new THREE.Group();

        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.75), lightWoodMat);
        seat.position.set(0, 0.9, 0);
        seat.castShadow = false; 
        seat.receiveShadow = true; 
        g.add(seat);

        const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.6), cushionMat);
        cushion.position.set(0, 1.0, 0);
        cushion.castShadow = false; cushion.receiveShadow = true; 
        g.add(cushion);

        const legPositions = [[-1.15, -0.3], [1.15, -0.3], [-1.15, 0.3], [1.15, 0.3]];
        for (const [lx, lz] of legPositions) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), metalMat);
            leg.position.set(lx, 0.45, lz);
            leg.castShadow = false; 
            g.add(leg);
        }

        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.05), metalMat);
        crossbar.position.set(0, 0.25, 0);
        crossbar.castShadow = false; 
        g.add(crossbar);

        g.position.set(x, 0, z);
        g.rotation.y = ry;
        scene.add(g);
        
        addBoxCollider(2.8, 1.1, 0.8, x, 0.55, z, ry);
    }

    addBench(-8, 10, 0);
    addBench( 8, 10, Math.PI);
    addBench(-20, -8, Math.PI / 2);
    addBench( 20, -8, -Math.PI / 2);
    addBench(-30, -8, 0);
    addBench( 30, -8, 0);
    addBench(-30, 8,  0);
    addBench( 30, 8,  0);

    function addFloorLamp(x, z) {
        const g = new THREE.Group();

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.2, 10), metalMat);
        pole.position.set(0, 1.1, 0);
        pole.castShadow = false; 
        g.add(pole);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 16), metalMat);
        base.position.set(0, 0.03, 0);
        base.castShadow = false; base.receiveShadow = true; 
        g.add(base);

        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.18, 0.35, 16, 1, true),
            new THREE.MeshStandardMaterial({ color: 0xf5dfa0, roughness: 0.8, metalness: 0.0, side: THREE.DoubleSide })
        );
        shade.position.set(0, 2.38, 0);
        shade.castShadow = false; 
        g.add(shade);

        // BẬT LẠI: Đèn hắt nhẹ từ góc phòng
        const lampLight = new THREE.PointLight(0xffe8a0, 20, 8, 2);
        lampLight.position.set(0, 2.2, 0);
        lampLight.castShadow = false; // Không tạo bóng
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

    addFloorLamp(-36, -22);
    addFloorLamp( 36, -22);
    addFloorLamp(-36,  18);
    addFloorLamp( 36,  18);
    addFloorLamp( -5,  24);
    addFloorLamp(  5,  24);

    // =====================================================
    // CỘT TRANG TRÍ (PILLAR / COLUMN)
    // =====================================================
    function addColumn(x, z) {
        const g = new THREE.Group();
        const colMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.05 });

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, H - 0.5, 16), colMat);
        shaft.position.set(0, (H - 0.5) / 2, 0);
        shaft.castShadow = false; 
        shaft.receiveShadow = true; 
        g.add(shaft);

        const capital = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), colMat);
        capital.position.set(0, H - 0.45, 0);
        capital.castShadow = false; 
        capital.receiveShadow = true; 
        g.add(capital);

        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), colMat);
        base.position.set(0, 0.15, 0);
        base.castShadow = false; 
        base.receiveShadow = true; 
        g.add(base);

        g.position.set(x, 0, z);
        scene.add(g);
        
        addBoxCollider(0.9, H, 0.9, x, H / 2, z);
    }

    addColumn(-5.0, 15.5);
    addColumn( 5.0, 15.5);

    return { collidableWalls };
}