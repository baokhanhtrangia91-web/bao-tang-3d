import * as THREE from 'three';

export const interactableObjects = [];

export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();

    function addArt(url, w, h, x, z, ry, title, desc, mediaUrl = '', mediaType = 'none', frameDepth = 0.1, frameColor = 0x111111) {
        const group = new THREE.Group();

        // Mặt tranh
        const art = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshStandardMaterial({ map: loader.load(url) })
        );
        art.userData = { isArt: true, title, desc, mediaUrl, mediaType };
        interactableObjects.push(art);

        // Khung tranh
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, h + 0.4, frameDepth),
            new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.95 })
        );
        frame.castShadow    = true;
        frame.receiveShadow = true;

        art.position.z = frameDepth / 2 + 0.01;

        // Đèn rọi tranh
        const spotLight = new THREE.SpotLight(0xffffee, 150);
        spotLight.position.set(0, 6.9, frameDepth / 2 + 4);
        spotLight.angle    = Math.PI / 5;
        spotLight.penumbra = 0.6;
        spotLight.decay    = 2;
        spotLight.distance = 12;
        spotLight.castShadow = false;

        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0, art.position.z);
        spotLight.target = lightTarget;

        group.add(frame, art, spotLight, lightTarget);
        group.position.set(x, 5, z);
        group.rotation.y = ry;
        scene.add(group);
    }

    // --- Danh sách tác phẩm ---
    addArt('texture/mona.JPG',       10, 6,  0,     -24.4,  0,           'Mona Lisa',   'Tác phẩm kinh điển của Leonardo da Vinci.',  'audio/How the Mona Lisa became so overrated.mp3', 'video');
    addArt('texture/the-madonna.jpg', 5, 5, -24.4, -15,     Math.PI/2,   'The Madonna', 'Thuyết minh về sự ra đời của tác phẩm.',     'audio/madonna.mp3', 'audio');
    addArt('texture/art3.jpg',        5, 5, -24.4,  15,     Math.PI/2,   'Tranh 3',     'Mô tả tranh 3');
    addArt('texture/art2.jpg',        5, 5,  24.4, -15,    -Math.PI/2,   'Tranh 2',     'Mô tả tranh 2');
    addArt('texture/art4.jpg',        5, 5,  24.4,  15,    -Math.PI/2,   'Tranh 4',     'Mô tả tranh 4');

    // Bức phiến đá thông tin
    addArt(
        'model/bang.jpg',
        3, 9.5, -13.5, 25.9, Math.PI/2,
        'Thông Tin', 'thông tin thông tin thông tin',
        '', 'none', 1.1, 0x555555
    );
}
