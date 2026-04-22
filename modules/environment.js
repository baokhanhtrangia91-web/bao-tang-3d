import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function setupEnvironment(scene) {
    // --- KÍCH THƯỚC SIÊU KHỔNG LỒ ---
    const W = 80; 
    const D = 60;
    const H = 15; // Chiều cao trần
    const WALL_THICK = 1;

    const collidableWalls = [];

    const loader = new THREE.TextureLoader();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // --- 1. SÀN NHÀ ---
    const floorTex = loader.load('texture/white-tiles-textures-background.jpg');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(32, 24); 
    
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(W, D), 
        new THREE.MeshStandardMaterial({map: floorTex})
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

    // --- HÀM TẠO PHẦN TRÁM CỔNG VÒM (Archway) ---
    // gapW: Chiều rộng cửa hở
    // d: Độ dày tường
    // x, z: Tọa độ tâm của cửa
    // yBase: Độ cao bắt đầu uốn vòm (Tính từ mặt đất lên)
    // ry: Góc xoay của tường (Dành cho tường dọc trục Z)
    const addArchFill = (gapW, d, x, yBase, z, ry = 0) => {
        const h = H - yBase; // Chiều cao từ phần bắt đầu vòm lên đến đỉnh trần
        
        // Vẽ hình dáng bức tường bị khoét vòm bán nguyệt ở dưới
        const shape = new THREE.Shape();
        shape.moveTo(-gapW / 2, 0); // Điểm góc trái dưới
        // Uốn vòng cung lên trên (radius = gapW/2), chạy từ PI (trái) sang 0 (phải)
        shape.absarc(0, 0, gapW / 2, Math.PI, 0, true); 
        shape.lineTo(gapW / 2, h);  // Kéo thẳng lên trần bên phải
        shape.lineTo(-gapW / 2, h); // Kéo ngang qua trái theo trần
        shape.lineTo(-gapW / 2, 0); // Kéo thẳng xuống điểm bắt đầu

        // Kéo giãn hình học 2D thành khối 3D với độ dày = d
        const extrudeSettings = { 
            depth: d, 
            bevelEnabled: false, 
            curveSegments: 32 // Tăng độ mượt cho đường cong của vòm
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // Đưa tâm hình học về giữa khối để đồng bộ cách căn tọa độ với BoxGeometry
        geometry.translate(0, -h / 2, -d / 2); 

        const mesh = new THREE.Mesh(geometry, wallMat);
        // Đặt khối lấp đầy ở nửa trên của không gian
        mesh.position.set(x, yBase + h / 2, z);
        mesh.rotation.y = ry;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        collidableWalls.push(mesh);
    };

    // ==============================================
    // --- 2. HỆ THỐNG TƯỜNG & CỔNG VÒM ---
    // ==============================================

    // A. TƯỜNG BAO NGOÀI
    addW(80, H, WALL_THICK, 0, -29.5);          // Tường trên
    addW(WALL_THICK, H, 58, -39.5, 0);          // Tường trái
    addW(WALL_THICK, H, 58, 39.5, 0);  
    addW(80, H, WALL_THICK, 0, 29.5);         // Tường phải
    
    // Mặt tiền (Z=29.5) - Khoảng hở 8m ở giữa (X: -4 tới 4)
    addW(36, H, WALL_THICK, -22, 29.5);         
    addW(36, H, WALL_THICK, 22, 29.5);          
    // B. VÁCH DỌC 1 (X = -14)
    addW(WALL_THICK, H, 47, -14, -5.5);         
    addW(WALL_THICK, H, 4, -14, 27);            
    // Khoảng hở 7m (Z: 18 tới 25 -> Tâm Z = 21.5). Phải xoay PI/2 vì là tường dọc
    // TRÁM CỔNG VÒM PHÒNG 1: Rộng 7m, uốn vòm từ độ cao 6m
    addArchFill(7, WALL_THICK, -14, 6, 21.5, Math.PI / 2);

    // C. VÁCH DỌC 2 (X = 14)
    addW(WALL_THICK, H, 47, 14, -5.5);          
    addW(WALL_THICK, H, 4, 14, 27);             
    // Khoảng hở 7m (Z: 18 tới 25 -> Tâm Z = 21.5)
    // TRÁM CỔNG VÒM PHÒNG 3: Rộng 7m, uốn vòm từ độ cao 6m
    addArchFill(7, WALL_THICK, 14, 6, 21.5, Math.PI / 2);

    // D. VÁCH NGANG SẢNH (Z = 15)
    addW(9.5, H, WALL_THICK, -8.75, 15);        
    addW(9.5, H, WALL_THICK, 8.75, 15);         
    // Khoảng hở 8m (X: -4 tới 4 -> Tâm X = 0)
    // TRÁM CỔNG VÒM VÀO PHÒNG TRUNG TÂM: Rộng 8m, uốn vòm từ độ cao 6m
    addArchFill(8, WALL_THICK, 0, 6, 15, 0);

    // E. VÁCH NHÔ RA PHÒNG 3 (Z = -5)
    addW(15, H, WALL_THICK, 31.5, -5);            

    // ==============================================

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
    statueSpotLight.shadow.mapSize.width = 2048; 
    statueSpotLight.shadow.mapSize.height = 2048;
    statueSpotLight.shadow.bias = -0.0005; 
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
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilingMat);
    ceiling.rotation.x = Math.PI / 2; 
    ceiling.position.set(0, H, 0);   
    scene.add(ceiling);

    // --- 5. HỆ THỐNG ĐÈN TRẦN ---
    const addCeilingLight = (x, z) => {
        const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 2 }); 
        const bulb = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 2.5), bulbMat);
        bulb.position.set(x, H - 0.05, z); 
        scene.add(bulb);

        const light = new THREE.PointLight(0xffffee, 150, 45); 
        light.position.set(x, H - 0.5, z); 
        light.castShadow = false; 
        scene.add(light);
    };

    addCeilingLight(-27, -15);    // Phòng 1
    addCeilingLight(-27, 5);      
    addCeilingLight(0, -20);      // Phòng 2
    addCeilingLight(0, 5);        
    addCeilingLight(27, -18);     // Phòng 3 
    addCeilingLight(27, 10);      
    addCeilingLight(0, 22);       // Sảnh

    return { collidableWalls };
}