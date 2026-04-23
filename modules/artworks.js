import * as THREE from 'three';

// Mảng chứa các bức tranh để tối ưu Raycaster
export const interactableObjects = [];

export function loadArtworks(scene) {
    function addArt(url, w, h, x, z, ry, title, desc, mediaUrl = '', mediaType = 'none', frameDepth = 0.1, frameColor = 0x111111) {
        const group = new THREE.Group();
        const loader = new THREE.TextureLoader();
        const art = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshStandardMaterial({ map: loader.load(url) })
        );
        
        // Lưu thông tin để UI lấy ra hiển thị
        art.userData = { isArt: true, title, desc, mediaUrl, mediaType };
        interactableObjects.push(art);
        
        // Khung tranh
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, h + 0.4, frameDepth), 
            new THREE.MeshStandardMaterial({color: frameColor, roughness: 0.95}) 
        );
        frame.castShadow = true;
        frame.receiveShadow = true; 
        
        group.add(frame);
        group.add(art);
        
        art.position.z = (frameDepth / 2) + 0.01;

        // Đèn rọi tranh
        const artLight = new THREE.SpotLight(0xffffee, 150); 
        artLight.position.set(0, 6.9, (frameDepth / 2) + 4); 
        artLight.angle = Math.PI / 5; 
        artLight.penumbra = 0.6; 
        artLight.decay = 2; 
        artLight.distance = 12; 
        artLight.castShadow = false; 

        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0, art.position.z); 
        
        group.add(artLight);
        group.add(lightTarget);
        artLight.target = lightTarget;
        
        group.position.set(x, 5, z);
        group.rotation.y = ry;
        scene.add(group);
    }

    // Danh sách tranh
    addArt('texture/mona.JPG', 10, 6, 0, -24.4, 0, "Mona Lisa", "Tác phẩm kinh điển của Leonardo da Vinci.", 'audio/How the Mona Lisa became so overrated.mp3', 'video');
    addArt('texture/the-madonna.jpg', 5, 5, -24.4, -15, Math.PI/2, "The Madonna", "Thuyết minh về sự ra đời của tác phẩm.", 'audio/madonna.mp3', 'audio');
    addArt('texture/art3.jpg', 5, 5, -24.4, 15, Math.PI/2, "Tranh 3", "Mô tả tranh 3");
    addArt('texture/art2.jpg', 5, 5, 24.4, -15, -Math.PI/2, "Tranh 2", "Mô tả tranh 2");
    addArt('texture/art4.jpg', 5, 5, 24.4, 15, -Math.PI/2, "Tranh 4", "Mô tả tranh 4");
    
    // Bức phiến đá
    addArt('model/z7754643348348_8881844be1db1ee3df4752a2dfa1b8a0.jpg', 3, 9.5, -13.5, 25.9, Math.PI/2, "Thông Tin", "thông tin thông tin thông tin", '', 'none', 1.1, 0x555555);
}