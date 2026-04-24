import * as THREE from 'three';

export const interactableObjects = [];

export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();

    // =====================================================
    // HÀM TẠO KHUNG TRANH ĐẸP
    // =====================================================
    function createBeautifulFrame(w, h, depth, frameStyle = 'gold') {
        const group = new THREE.Group();
        const frameW = 0.18;
        const outerW = w + frameW * 2;
        const outerH = h + frameW * 2;

        let frameMat;
        if (frameStyle === 'gold') {
            frameMat = new THREE.MeshStandardMaterial({ color: 0xc8a84b, roughness: 0.25, metalness: 0.85 });
        } else if (frameStyle === 'dark') {
            frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.6, metalness: 0.3 });
        } else if (frameStyle === 'wood') {
            frameMat = new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.8, metalness: 0.05 });
        } else if (frameStyle === 'silver') {
            frameMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c8, roughness: 0.2, metalness: 0.9 });
        } else {
            frameMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.55, metalness: 0.15 });
        }

        const frameDepth = depth;

        // 4 thanh khung
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(outerW, frameW, frameDepth), frameMat);
        topBar.position.set(0, h / 2 + frameW / 2, 0);
        group.add(topBar);

        const botBar = new THREE.Mesh(new THREE.BoxGeometry(outerW, frameW, frameDepth), frameMat);
        botBar.position.set(0, -h / 2 - frameW / 2, 0);
        group.add(botBar);

        const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameW, h, frameDepth), frameMat);
        leftBar.position.set(-w / 2 - frameW / 2, 0, 0);
        group.add(leftBar);

        const rightBar = new THREE.Mesh(new THREE.BoxGeometry(frameW, h, frameDepth), frameMat);
        rightBar.position.set(w / 2 + frameW / 2, 0, 0);
        group.add(rightBar);

        // Góc khung trang trí
        const cornerColor = frameStyle === 'gold' ? 0xe8c060 : (frameStyle === 'silver' ? 0xe0e0e8 : 0x8b6914);
        const cornerMat = new THREE.MeshStandardMaterial({ color: cornerColor, roughness: 0.15, metalness: 0.95 });
        const cornerSize = frameW + 0.02;
        const corners = [
            [-w/2 - frameW/2,  h/2 + frameW/2],
            [ w/2 + frameW/2,  h/2 + frameW/2],
            [-w/2 - frameW/2, -h/2 - frameW/2],
            [ w/2 + frameW/2, -h/2 - frameW/2],
        ];
        for (const [cx, cy] of corners) {
            const c = new THREE.Mesh(new THREE.BoxGeometry(cornerSize, cornerSize, frameDepth + 0.01), cornerMat);
            c.position.set(cx, cy, 0);
            group.add(c);
        }

        

        group.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        return group;
    }

    // =====================================================
    // ĐÈN RỌI TRANH (ĐÃ SỬA LỖI TÀNG HÌNH)
    // =====================================================
    function addArtworkSpotlight(x, y, z, ry) {
        const dist = 5.5;
        const height = 3.5;
        const ox = Math.sin(ry) * dist;
        const oz = Math.cos(ry) * dist;

        const light = new THREE.SpotLight(0xfff5e0, 55);
        light.position.set(x + ox, y + height, z + oz);
        light.angle    = Math.PI / 8;
        light.penumbra = 0.45;
        light.decay    = 2;
        light.distance = 18;
        
        // TẮT ĐỔ BÓNG ĐỂ TRÁNH LỖI OVERLOAD SHADER
        light.castShadow = false; 

        light.target.position.set(x, y, z);
        scene.add(light, light.target);

        
    }

    // =====================================================
    // HÀM addArt CHÍNH
    // =====================================================
    function addArt({
        url, w, h,
        x, y = 5, z, ry = 0,
        title = '', desc = '',
        mediaUrl = '', mediaType = 'none',
        frameDepth = 0.12,
        frameStyle = 'gold',
        spotlight = true,
        isInfoBoard = false,
    }) {
        const group = new THREE.Group();

        const tex = loader.load(url);
        tex.colorSpace = THREE.SRGBColorSpace;

        const art = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.0 })
        );
        art.position.z = frameDepth / 2 + 0.005;
        art.userData = { isArt: true, title, desc, mediaUrl, mediaType };
        interactableObjects.push(art);

        // Khung đẹp
        const frame = createBeautifulFrame(w, h, frameDepth, isInfoBoard ? 'dark' : frameStyle);

        // Lớp đệm sau
        const backing = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.42, h + 0.42, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 })
        );
        backing.position.z = -frameDepth / 2 - 0.02;

        group.add(backing, frame, art);
        group.position.set(x, y, z);
        group.rotation.y = ry;
        scene.add(group);

        if (spotlight && !isInfoBoard) {
            addArtworkSpotlight(x, y, z, ry);
        }
    }

    // =====================================================
    // DANH SÁCH TRANH
    // =====================================================
    const galleryData = [
        // Tường phía sau
        { url: 'tranh/tranh1.jpg',  w: 6, h: 4,   x: -25,  y: 5,   z: -28.9, ry: 0,          title: 'Tác Phẩm 1',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
        { url: 'tranh/tranh2.jpg',  w: 5, h: 7,   x: -10,  y: 5.5, z: -28.9, ry: 0,          title: 'Tác Phẩm 2',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'dark' },
        { url: 'tranh/tranh3.jpg',  w: 8, h: 5,   x:   5,  y: 6,   z: -28.9, ry: 0,          title: 'Tác Phẩm 3',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
        { url: 'tranh/tranh4.jpg',  w: 5, h: 5,   x:  25,  y: 5,   z: -28.9, ry: 0,          title: 'Tác Phẩm 4',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'wood' },
        // Tường bên trái
        { url: 'tranh/tranh5.jpg',  w: 6, h: 4,   x: -38.9, y: 5,  z: -15,  ry: Math.PI/2,  title: 'Tác Phẩm 5',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'silver' },
        { url: 'tranh/tranh6.jpg',  w: 4, h: 6,   x: -38.9, y: 4,  z:   0,  ry: Math.PI/2,  title: 'Tác Phẩm 6',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
        { url: 'tranh/tranh7.jpg',  w: 7, h: 4,   x: -38.9, y: 5,  z:  15,  ry: Math.PI/2,  title: 'Tác Phẩm 7',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'wood' },
        // Tường bên phải
        { url: 'tranh/tranh8.jpg',  w: 5, h: 5,   x: 38.9,  y: 5,  z: -15,  ry: -Math.PI/2, title: 'Tác Phẩm 8',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
        { url: 'tranh/tranh9.jpg',  w: 8, h: 4,   x: 38.9,  y: 5,  z:   0,  ry: -Math.PI/2, title: 'Tác Phẩm 9',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'dark' },
        { url: 'tranh/tranh10.jpg', w: 5, h: 7,   x: 38.9,  y: 5,  z:  15,  ry: -Math.PI/2, title: 'Tác Phẩm 10', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'silver' },
        // Vách ngăn trong
        { url: 'tranh/tranh11.jpg', w: 4, h: 4,   x: -13.4, y: 5,  z: -20,  ry: Math.PI/2,  title: 'Tác Phẩm 11', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
        { url: 'tranh/tranh12.jpg', w: 5, h: 3,   x: -13.4, y: 5,  z: -10,  ry: Math.PI/2,  title: 'Tác Phẩm 12', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'wood' },
        { url: 'tranh/tranh13.jpg', w: 4, h: 4,   x:  13.4, y: 5,  z: -20,  ry: -Math.PI/2, title: 'Tác Phẩm 13', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
        { url: 'tranh/tranh14.jpg', w: 4, h: 5,   x:  13.4, y: 5,  z: -10,  ry: -Math.PI/2, title: 'Tác Phẩm 14', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'silver' },
    ];

    galleryData.forEach(item => addArt(item));

    // Bảng thông tin
    addArt({ url: 'model/bang.jpg', w: 3.1, h: 4.24, x: -14.5, y: 2.4, z: 27.16, ry: (Math.PI*3)/2, title: 'Thông Tin', desc: 'Khu vực trưng bày chính.', frameDepth: 0.6, frameStyle: 'dark', spotlight: false, isInfoBoard: true });
    addArt({ url: 'model/bang.jpg', w: 3.1, h: 4.24, x:  14.5, y: 2.4, z: 27.16, ry: Math.PI/2,     title: 'Thông Tin', desc: 'Khu vực trưng bày chính.', frameDepth: 0.6, frameStyle: 'dark', spotlight: false, isInfoBoard: true });
    addArt({ url: 'model/bang.jpg', w: 6,   h: 8.4,  x:  10.25,y: 4.42,z: 14.2,  ry: Math.PI,       title: 'Thông Tin', desc: 'Khu vực trưng bày chính.', frameDepth: 0.6, frameStyle: 'dark', spotlight: false, isInfoBoard: true });
}
