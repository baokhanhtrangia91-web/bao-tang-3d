import * as THREE from 'three';

export function setupMinimap(scene, renderer, player) {
    // Camera nhìn từ trên xuống cho minimap
    const minimapCamera = new THREE.OrthographicCamera(-22, 22, 22, -22, 0.1, 120);
    minimapCamera.position.set(0, 60, 0);
    minimapCamera.lookAt(0, 0, 0);

    // Marker hình tam giác chỉ hướng nhìn của người chơi
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo( 0,    1.2);   // đầu mũi tên
    arrowShape.lineTo( 0.6, -0.6);
    arrowShape.lineTo(-0.6, -0.6);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const playerMarker = new THREE.Mesh(
        arrowGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    playerMarker.rotation.x = -Math.PI / 2;
    scene.add(playerMarker);

    const SIZE    = 190;
    const PADDING = 14;

    function renderMinimap() {
        const pos = player.position;
        const dir = new THREE.Vector3();
        player.getWorldDirection(dir);

        // Camera và marker bám theo người chơi
        minimapCamera.position.x = pos.x;
        minimapCamera.position.z = pos.z;

        // Xoay mũi tên theo hướng nhìn (trục Y trên mặt phẳng ngang)
        playerMarker.position.set(pos.x, 20, pos.z);
        playerMarker.rotation.y = Math.atan2(dir.x, dir.z);

        const x = PADDING;
        const y = window.innerHeight - SIZE - PADDING;

        renderer.setScissorTest(true);
        renderer.setScissor(x, y, SIZE, SIZE);
        renderer.setViewport(x, y, SIZE, SIZE);
        renderer.setClearColor(0xf0ede8);
        renderer.clear();
        renderer.render(scene, minimapCamera);

        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    }

    return { renderMinimap };
}
