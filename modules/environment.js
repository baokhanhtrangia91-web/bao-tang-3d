import * as THREE from 'three';

export function setupEnvironment(scene) {
    const W = 20, H = 5, D = 30; // chiều rộng, cao, sâu của phòng

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
    const wallMat  = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 });
    const ceilMat  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });

    // --- Sàn ---
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Trần ---
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = H;
    scene.add(ceiling);

    // --- Tường trái / phải ---
    [-W / 2, W / 2].forEach((x, i) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
        wall.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
        wall.position.set(x, H / 2, 0);
        wall.receiveShadow = true;
        scene.add(wall);
    });

    // --- Tường trước / sau ---
    [-D / 2, D / 2].forEach((z, i) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
        wall.rotation.y = i === 0 ? 0 : Math.PI;
        wall.position.set(0, H / 2, z);
        wall.receiveShadow = true;
        scene.add(wall);
    });

    // --- Ánh sáng môi trường ---
    const ambient = new THREE.AmbientLight(0xfff5e0, 0.5);
    scene.add(ambient);

    // --- Đèn chiếu chính (spotlight từ trần) ---
    const spotPositions = [
        [0, H - 0.1, -10],
        [0, H - 0.1,   0],
        [0, H - 0.1,  10],
    ];
    spotPositions.forEach(([x, y, z]) => {
        const spot = new THREE.SpotLight(0xfff5e0, 1.5, 15, Math.PI / 5, 0.3);
        spot.position.set(x, y, z);
        spot.target.position.set(x, 0, z);
        spot.castShadow = true;
        scene.add(spot);
        scene.add(spot.target);
    });
}
