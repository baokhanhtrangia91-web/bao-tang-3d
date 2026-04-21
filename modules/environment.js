import * as THREE from 'three';

export function setupEnvironment(scene) {
    // Kích thước tổng thể: Rộng 30m, Cao 8m, Sâu 30m
    const W = 30, H = 8, D = 30; 
    
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('modules/interior_tiles_diff_1k.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const wallTexture = textureLoader.load('modules/white-wall-textures.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);

    const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.9 });
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, transparent: true, opacity: 0.1 });

    const collidableWalls = [];

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = H;
    scene.add(ceiling);

    function createWall(x, z, w, d) {
        const geometry = new THREE.BoxGeometry(w, H, d);
        const wall = new THREE.Mesh(geometry, wallMat);
        wall.position.set(x, H / 2, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        collidableWalls.push(wall);
    }

    // --- CẬP NHẬT TỌA ĐỘ TƯỜNG CHÍNH XÁC THEO BẢN VẼ ---
    const walls = [
        // 1. TƯỜNG BAO NGOÀI
        { x: 0, z: -15, w: 30, d: 0.6 },  // Tường trên cùng
        { x: -15, z: 0, w: 0.6, d: 30 },  // Tường trái
        { x: 15, z: 0, w: 0.6, d: 30 },   // Tường phải
        { x: -10, z: 15, w: 10, d: 0.6 }, // Nửa tường dưới trái
        { x: 10, z: 15, w: 10, d: 0.6 },  // Nửa tường dưới phải (để hở sảnh chính)

        // 2. TƯỜNG DỌC (Chia không gian thành 3 cột)
        // Vách dọc ngăn cột trái
        { x: -5, z: -2.5, w: 0.6, d: 25 },
        { x: -5, z: 14, w: 0.6, d: 2 },   
        // Vách dọc ngăn cột phải
        { x: 5, z: -2.5, w: 0.6, d: 25 },
        { x: 5, z: 14, w: 0.6, d: 2 },

        // 3. TƯỜNG NGANG (Điều chỉnh khớp bản vẽ mới)
        { x: 5, z: 5, w: 14, d: 0.6 },    
        { x: 11.5, z: -3, w: 7, d: 0.6 }  
    ];
    
    walls.forEach(w => createWall(w.x, w.z, w.w, w.d));

    function createLabel(text, x, z) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0)'; 
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#222222';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 64);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.1 });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), material);
        mesh.position.set(x, 0.05, z);
        mesh.rotation.x = -Math.PI / 2;
        scene.add(mesh);
    }

    // ==========================================
    // --- ÁNH SÁNG & ĐÈN TRẦN ---
    // ==========================================
    const ambient = new THREE.AmbientLight(0xfff5e0, 0.5);
    scene.add(ambient);

    const lampMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff5e0, 
        emissiveIntensity: 2.0 
    });

    const lampGeometry = new THREE.BoxGeometry(2, 0.1, 2);

    const spotPositions = [
        [ -10, H,   0 ], // Đèn phòng 1
        [   0, H,  -5 ], // Đèn phòng 2
        [  10, H,  -9 ], // Đèn phòng 3 (chỉnh lại tọa độ Z cho khớp tâm phòng)
        [   0, H,  10 ], // Đèn Sảnh
        [  10, H,   1 ]  // Đèn phòng giữa bên phải (mới được tạo ra do vách ngăn thêm)
    ];
    
    spotPositions.forEach(([x, y, z]) => {
        const lampMesh = new THREE.Mesh(lampGeometry, lampMaterial);
        lampMesh.position.set(x, y - 0.05, z); 
        scene.add(lampMesh);

        const spot = new THREE.SpotLight(0xfff5e0, 2.0, 25, Math.PI / 4, 0.5, 1);
        spot.position.set(x, y - 0.1, z); 
        spot.target.position.set(x, 0, z); 
        
        spot.castShadow = true;
        spot.shadow.mapSize.width = 1024;
        spot.shadow.mapSize.height = 1024;
        spot.shadow.bias = -0.0001; 
        
        scene.add(spot);
        scene.add(spot.target);

        const pointLight = new THREE.PointLight(0xfff5e0, 0.3, 10);
        pointLight.position.set(x, y - 0.5, z);
        scene.add(pointLight);
    });

    return { collidableWalls };
}