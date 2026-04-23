import * as THREE from 'three';

export const interactableObjects = [];

export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();

    // 1. Hàm addArt mới: Nhận vào một Object { ... } thay vì các tham số rời rạc
    function addArt({
        url, w, h, 
        x, y = 5, z, ry = 0, // y mặc định là 5 nếu không được khai báo
        title = '', desc = '', 
        mediaUrl = '', mediaType = 'none', 
        frameDepth = 0.1, frameColor = 0x111111
    }) {
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

        group.add(frame, art);
        group.position.set(x, y, z);
        group.rotation.y = ry;
        scene.add(group);
    }

    // 2. Danh sách tranh
    const galleryData = [
        // Tường phía sau
        { url: 'tranh/tranh1.jpg', w: 6, h: 4, x: -25, y: 5, z: -28.9, ry: 0, title: 'tranh 1', desc: 'Mô tả tranh 1' },
        { url: 'tranh/tranh2.jpg', w: 5, h: 7, x: -10, y: 5, z: -28.9, ry: 0, title: 'tranh 2', desc: 'Mô tả tranh 2' },
        { url: 'tranh/tranh3.jpg', w: 8, h: 5, x:  5, y: 6, z: -28.9, ry: 0, title: 'tranh 3', desc: 'Mô tả tranh 3' },
        { url: 'tranh/tranh4.jpg', w: 5, h: 5, x:  25, y: 5, z: -28.9, ry: 0, title: 'tranh 4', desc: 'Mô tả tranh 4' },

        // Tường bên trái
        { url: 'tranh/tranh5.jpg', w: 6, h: 4, x: -38.9, y: 5, z: -15, ry: Math.PI/2, title: 'tranh 5', desc: 'Mô tả tranh 5' },
        { url: 'tranh/tranh6.jpg', w: 4, h: 6, x: -38.9, y: 4, z:   0, ry: Math.PI/2, title: 'tranh 6', desc: 'Mô tả tranh 6' },
        { url: 'tranh/tranh7.jpg', w: 7, h: 4, x: -38.9, y: 5, z:  15, ry: Math.PI/2, title: 'tranh 7', desc: 'Mô tả tranh 7' },

        // Tường bên phải
        { url: 'tranh/tranh8.jpg', w: 5, h: 5, x: 38.9, y: 5, z: -15, ry: -Math.PI/2, title: 'tranh 8', desc: 'Mô tả tranh 8' },
        { url: 'tranh/tranh9.jpg', w: 8, h: 4, x: 38.9, y: 5, z:   0, ry: -Math.PI/2, title: 'tranh 9', desc: 'Mô tả tranh 9' },
        { url: 'tranh/tranh10.jpg', w: 5, h: 7, x: 38.9, y: 5, z:  15, ry: -Math.PI/2, title: 'tranh 10', desc: 'Mô tả tranh 10' },

        // Vách ngăn trong
        { url: 'tranh/tranh11.jpg', w: 4, h: 4, x: -13.4, y: 5, z: -20, ry: Math.PI/2, title: 'tranh 11', desc: 'Mô tả tranh 11' },
        { url: 'tranh/tranh12.jpg', w: 5, h: 3, x: -13.4, y: 5, z: -10, ry: Math.PI/2, title: 'tranh 12', desc: 'Mô tả tranh 12' },
        { url: 'tranh/tranh13.jpg', w: 4, h: 4, x: 13.4, y: 5, z: -20, ry: -Math.PI/2, title: 'tranh 13', desc: 'Mô tả tranh 13' },
        { url: 'tranh/tranh14.jpg', w: 4, h: 5, x: 13.4, y: 5, z: -10, ry: -Math.PI/2, title: 'tranh 14', desc: 'Mô tả tranh 14' },
    ];

    // Truyền thẳng Object item vào hàm
    galleryData.forEach(item => {
        addArt(item);
    });

    // 3. Bảng thông tin trung tâm 
    addArt({
        url: 'model/bang.jpg',
        w: 3, 
        h: 4.24, 
        x: -13.5, 
        y: 2.4,         
        z: 27.16, 
        ry: Math.PI/2,
        title: 'Thông Tin', 
        desc: 'Khu vực trưng bày chính.',
        frameDepth: 0.6, 
        frameColor: 0x555555
    });
    addArt({
        url: 'model/bang.jpg',
        w: 3, 
        h: 4.24, 
        x: 13.5, 
        y: 2.4,         
        z: 27.16, 
        ry: (Math.PI * 3) / 2,
        title: 'Thông Tin', 
        desc: 'Khu vực trưng bày chính.',
        frameDepth: 0.6, 
        frameColor: 0x555555
    });
    addArt({
        url: 'model/bang.jpg',
        w: 6, 
        h: 8.4, 
        x: 10.25, 
        y: 4.42,         
        z: 15.8, 
        ry: Math.PI*2,
        title: 'Thông Tin', 
        desc: 'Khu vực trưng bày chính.',
        frameDepth: 0.6, 
        frameColor: 0x555555
    });
}