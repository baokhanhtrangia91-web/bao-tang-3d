import * as THREE from 'three';

export function setupMinimap(scene, renderer, player) {
    const minimapCamera = new THREE.OrthographicCamera(-22, 22, 22, -22, 0.1, 120);
    minimapCamera.position.set(0, 60, 0);
    minimapCamera.lookAt(0, 0, 0);

    // Bật Layer 1 cho minimap camera (để nó nhìn thấy các object ở Layer 1)
    // Mặc định mọi thứ ở Layer 0, nên nó vẫn nhìn thấy cảnh vật bình thường.
    minimapCamera.layers.enable(1);

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo( 0,    1.2); 
    arrowShape.lineTo( 0.6, -0.6);
    arrowShape.lineTo(-0.6, -0.6);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const playerMarker = new THREE.Mesh(
        arrowGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    playerMarker.rotation.x = -Math.PI / 2;
    
    // [QUAN TRỌNG] Đưa marker vào Layer 1 để Camera chính KHÔNG nhìn thấy
    playerMarker.layers.set(1); 
    scene.add(playerMarker);

    const SIZE    = 190;
    const PADDING = 14;

    function renderMinimap() {
        const pos = player.position;
        const dir = new THREE.Vector3();
        player.getWorldDirection(dir);

        // 1. Cập nhật vị trí camera
        minimapCamera.position.set(pos.x, 60, pos.z);

        // 2. Xoay bản đồ theo hướng nhìn của người chơi
        minimapCamera.up.set(dir.x, 0, dir.z).normalize();
        minimapCamera.lookAt(pos.x, 0, pos.z);

        // 3. Cập nhật vị trí marker
        playerMarker.position.set(pos.x, 20, pos.z);
        
        // 4. Đồng bộ góc xoay: Copy trực tiếp Quaternion hoặc rotation.y của player 
        // Cách này mượt và chính xác hơn là dùng Math.atan2
        playerMarker.quaternion.copy(player.quaternion); 
        
        // Cần bù lại góc lật ban đầu của mũi tên (nếu có)
        // Vì ta vừa copy toàn bộ quaternion, ta phải lật phẳng nó lại nằm trên mặt đất
        playerMarker.rotateX(-Math.PI / 2);

        // --- Render Minimap ---
        const x = PADDING;
        const y = window.innerHeight - SIZE - PADDING;

        renderer.setScissorTest(true);
        renderer.setScissor(x, y, SIZE, SIZE);
        renderer.setViewport(x, y, SIZE, SIZE);
        renderer.setClearColor(0xf0ede8);
        
        renderer.clearDepth(); // Xoá depth buffer để minimap không bị đè
        renderer.render(scene, minimapCamera);

        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    }

    return { renderMinimap };
}