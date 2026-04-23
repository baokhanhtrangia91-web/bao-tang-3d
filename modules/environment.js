import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function setupEnvironment(scene) {
    // --- KÍCH THƯỚC SIÊU KHỔNG LỒ ---
    const W = 80; 
    const D = 60;
    const H = 15; 
    const WALL_THICK = 1;

    const collidableWalls = [];
    const loader = new THREE.TextureLoader();

    // ==============================================
    // --- KHAI BÁO TEXTURE CHO SÀN, TƯỜNG, TRẦN ---
    // ==============================================

    const floorTex = loader.load('model/O5GLMS0.jpg'); 
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24); 

    const wallTex = loader.load('model/5e213a83-fbce-4f0d-9672-c38746ffe175.jpg'); 
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(8, 2); 
    
    const wallMat = new THREE.MeshStandardMaterial({ 
        map: wallTex, 
        color: 0xdddddd,
        metalness: 0.0,
        roughness: 1.0
    });

    const ceilingTex = loader.load('model/trần gỗ.jpg'); 
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(32, 24); 
    const ceilingMat = new THREE.MeshStandardMaterial({ 
        map: ceilingTex, 
        color: 0xffffff, 
        metalness: 0.0,
        roughness: 1.0 
    });

    // --- TEXTURE VÀ VẬT LIỆU CHO VIỀN GỖ CỔNG VÒM ---
    const woodTex = ceilingTex.clone(); 
    woodTex.needsUpdate = true;
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(2, 2); 
    
    const woodMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        color: 0xdddddd, 
        metalness: 0.0,
        roughness: 0.9
    });

    // ==============================================

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // --- 1. SÀN NHÀ ---
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D), 
        new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0xdddddd,
            metalness: 0.0,
            roughness: 0.8
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- HÀM TẠO TƯỜNG VUÔNG (Cột, vách) ---
    const addW = (w, h, d, x, z) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        wall.position.set(x, h / 2, z);
        wall.receiveShadow = true;
        wall.castShadow = true; 
        scene.add(wall);
        collidableWalls.push(wall);
    };

    // --- HÀM TẠO PHẦN TRÁM CỔNG VÒM (Archway) & KHUNG GỖ ---
    const addArchFill = (gapW, d, x, yBase, z, ry = 0) => {
        // ---- A. VẼ PHẦN TƯỜNG TRÁM PHÍA TRÊN VÒM ----
        const h = H - yBase; 
        const shape = new THREE.Shape();
        shape.moveTo(-gapW / 2, 0); 
        shape.absarc(0, 0, gapW / 2, Math.PI, 0, true); 
        shape.lineTo(gapW / 2, h);  
        shape.lineTo(-gapW / 2, h); 
        shape.lineTo(-gapW / 2, 0); 

        const extrudeSettings = { depth: d, bevelEnabled: false, curveSegments: 12 };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.translate(0, -h / 2, -d / 2); 

        const mesh = new THREE.Mesh(geometry, wallMat);
        mesh.position.set(x, yBase + h / 2, z);
        mesh.rotation.y = ry;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        collidableWalls.push(mesh);

        // ---- B. VẼ VIỀN GỖ ÔM THEO CỔNG VÒM (ĐÃ SỬA LỖI XUYÊN TƯỜNG) ----
        const trimW = 0.4; // Bề rộng viền áp lên mặt tường
        const innerOffset = 0.05; // Độ lồi của viền VÀO BÊN TRONG lòng cửa (để đè lên mép tường)
        const trimDepth = d + 0.15; // Độ lồi của viền RA TRƯỚC/SAU mặt tường

        // Thu nhỏ bán kính trong để khung gỗ lồi ra ngoài một chút, không bị trùng với tường
        const r1 = (gapW / 2) - innerOffset;  
        // Bán kính ngoài
        const r2 = (gapW / 2) + trimW;  

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

        const trimGeom = new THREE.ExtrudeGeometry(trimShape, {
            depth: trimDepth,
            bevelEnabled: false,
            curveSegments: 12
        });
        
        trimGeom.translate(0, 0, -trimDepth / 2);

        const trimMesh = new THREE.Mesh(trimGeom, woodMat);
        trimMesh.position.set(x, yBase, z); 
        trimMesh.rotation.y = ry;
        trimMesh.castShadow = true;
        trimMesh.receiveShadow = true;

        scene.add(trimMesh);
        collidableWalls.push(trimMesh); 
    };

    // --- 2. HỆ THỐNG TƯỜNG & CỔNG VÒM ---
    addW(80, H, WALL_THICK, 0, -29.5);          
    addW(WALL_THICK, H, 58, -39.5, 0);          
    addW(WALL_THICK, H, 58, 39.5, 0);  
    addW(8, H, WALL_THICK, 0, 29.5);         
    
    addW(36, H, WALL_THICK, -22, 29.5);         
    addW(36, H, WALL_THICK, 22, 29.5);     
    addW(12, H, WALL_THICK, 20, 15);     
    
    addW(WALL_THICK, H, 47, -14, -5.5);         
    addW(WALL_THICK, H, 4, -14, 27);            
    addArchFill(7, WALL_THICK, -14, 6, 21.5, Math.PI / 2);

    addW(WALL_THICK, H, 47, 14, -5.5);          
    addW(WALL_THICK, H, 4, 14, 27);             
    addArchFill(7, WALL_THICK, 14, 6, 21.5, Math.PI / 2);

    addW(9.5, H, WALL_THICK, -8.75, 15);        
    addW(9.5, H, WALL_THICK, 8.75, 15);         
    addArchFill(8, WALL_THICK, 0, 6, 15, 0);

    addW(15, H, WALL_THICK, 31.5, -5);            

    // --- 3. TƯỢNG VÀ BỤC ---
    const statueZ = -7; 

    const gHe = new THREE.Mesh(new THREE.BoxGeometry(7, 1.5, 7), new THREE.MeshStandardMaterial({color: 0xdddddd}));
    gHe.position.set(0, 0.75, statueZ);
    gHe.castShadow = true;
    gHe.receiveShadow = true;
    scene.add(gHe);

    const statueSpotLight = new THREE.SpotLight(0xfff0dd, 800); 
    statueSpotLight.position.set(5, 14, statueZ + 15); 
    statueSpotLight.angle = Math.PI / 4.5; 
    statueSpotLight.penumbra = 0.5; 
    statueSpotLight.decay = 2; 
    statueSpotLight.distance = 60;
    statueSpotLight.castShadow = true;
    statueSpotLight.shadow.mapSize.width = 1024; 
    statueSpotLight.shadow.mapSize.height = 1024;
    statueSpotLight.shadow.bias = -0.001; 
    scene.add(statueSpotLight);
    
    statueSpotLight.target.position.set(0, 0, statueZ); 
    scene.add(statueSpotLight.target);

    new GLTFLoader().load(
        'model/ghe_dai.glb', 
        (gltf) => {
            const model = gltf.scene;
            model.position.set(0, 1.5, statueZ);
            model.scale.set(4, 4, 4);
            model.traverse(n => { if(n.isMesh) n.castShadow = true; });
            scene.add(model);
        }, 
        undefined, 
        (error) => console.error("Lỗi khi tải tượng:", error)
    );

    // --- 4. TRẦN NHÀ ---
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2; 
    ceiling.position.set(0, H, 0);   
    scene.add(ceiling);

    // --- 5. HỆ THỐNG ĐÈN TRẦN ---
    const addCeilingLight = (x, z) => {
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffee }); 
        const bulb = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 2.5), bulbMat);
        bulb.position.set(x, H - 0.05, z); 
        scene.add(bulb);

        const light = new THREE.PointLight(0xffffee, 150, 28); 
        light.position.set(x, H - 0.5, z); 
        light.castShadow = false; 
        scene.add(light);
    };

    addCeilingLight(-27, -15);    
    addCeilingLight(-27, 5);      
    addCeilingLight(0, -20);      
    addCeilingLight(0, 5);        
    addCeilingLight(27, -18);     
    addCeilingLight(27, 10);      
    addCeilingLight(0, 22);       

    return { collidableWalls };
}