import * as THREE from 'three';

export const interactableObjects = [];

// =====================================================
// VẬT LIỆU KHUNG — dùng chung, tránh tạo lại mỗi lần
// =====================================================
const FRAME_MATERIALS = {
    gold:   new THREE.MeshStandardMaterial({ color: 0xc8a84b, roughness: 0.25, metalness: 0.85 }),
    dark:   new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.6,  metalness: 0.3  }),
    wood:   new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.8,  metalness: 0.05 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xc0c0c8, roughness: 0.2,  metalness: 0.9  }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.55, metalness: 0.15 }),
};

const CORNER_MATERIALS = {
    gold:   new THREE.MeshStandardMaterial({ color: 0xe8c060, roughness: 0.15, metalness: 0.95 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xe0e0e8, roughness: 0.15, metalness: 0.95 }),
    other:  new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.15, metalness: 0.95 }),
};

const BACKING_MAT = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 });

// =====================================================
// HÀM TẠO KHUNG TRANH
// =====================================================
function createFrame(w, h, depth, frameStyle = 'gold') {
    const group  = new THREE.Group();
    const FW     = 0.18; // độ rộng thanh khung
    const outerW = w + FW * 2;

    const mat       = FRAME_MATERIALS[frameStyle] ?? FRAME_MATERIALS.bronze;
    const cornerMat = CORNER_MATERIALS[frameStyle] ?? CORNER_MATERIALS.other;

    // 4 thanh khung (top, bottom, left, right)
    const bars = [
        { size: [outerW, FW, depth], pos: [0,           h / 2 + FW / 2, 0] },
        { size: [outerW, FW, depth], pos: [0,          -h / 2 - FW / 2, 0] },
        { size: [FW,     h,  depth], pos: [-w / 2 - FW / 2, 0,          0] },
        { size: [FW,     h,  depth], pos: [ w / 2 + FW / 2, 0,          0] },
    ];
    for (const { size, pos } of bars) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
        mesh.position.set(...pos);
        group.add(mesh);
    }

    // 4 góc trang trí
    const cs = FW + 0.02;
    for (const [cx, cy] of [
        [-w / 2 - FW / 2,  h / 2 + FW / 2],
        [ w / 2 + FW / 2,  h / 2 + FW / 2],
        [-w / 2 - FW / 2, -h / 2 - FW / 2],
        [ w / 2 + FW / 2, -h / 2 - FW / 2],
    ]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(cs, cs, depth + 0.01), cornerMat);
        c.position.set(cx, cy, 0);
        group.add(c);
    }

    group.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    return group;
}

// =====================================================
// ĐÈN RỌI TRANH
// =====================================================
function addArtworkSpotlight(scene, x, y, z, ry) {
    const dist = 5.5;
    const light = new THREE.SpotLight(0xfff5e0, 55);
    light.position.set(x + Math.sin(ry) * dist, y + 3.5, z + Math.cos(ry) * dist);
    light.angle    = Math.PI / 8;
    light.penumbra = 0.45;
    light.decay    = 2;
    light.distance = 18;
    light.castShadow = false;
    light.target.position.set(x, y, z);
    scene.add(light, light.target);
}

// =====================================================
// HÀM addArt CHÍNH
// =====================================================
function addArt(scene, loader, {
    url, w, h,
    x, y = 5, z, ry = 0,
    title = '', desc = '',
    mediaUrl = '', mediaType = 'none',
    frameDepth = 0.12,
    frameStyle = 'gold',
    spotlight = true,
    isInfoBoard = false,
}) {
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;

    const art = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.0 })
    );
    art.position.z = frameDepth / 2 + 0.005;
    art.userData   = { isArt: true, title, desc, mediaUrl, mediaType };
    interactableObjects.push(art);

    const frame = createFrame(w, h, frameDepth, isInfoBoard ? 'dark' : frameStyle);

    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.42, h + 0.42, 0.04),
        BACKING_MAT
    );
    backing.position.z = -frameDepth / 2 - 0.02;

    const group = new THREE.Group();
    group.add(backing, frame, art);
    group.position.set(x, y, z);
    group.rotation.y = ry;
    scene.add(group);

    if (spotlight && !isInfoBoard) {
        addArtworkSpotlight(scene, x, y, z, ry);
    }
}

// =====================================================
// DANH SÁCH TRANH
// =====================================================
const GALLERY_DATA = [
    // Tường phía sau
    { url: 'tranh/tranh6.jpg',  w: 5, h: 7.5,   x:   0,   y: 5.5, z: -28.9, ry: 0,            title: 'mona lisa',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold'   },
    // Tường bên trái
    { url: 'tranh/tranh7.jpg',  w: 20.7, h: 11.64,   x: 13.4, y: 6.9,   z: -7.5,   ry:  -Math.PI / 2, title: 'bữa ăn',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold' },
    { url: 'tranh/tranh6.jpg',  w: 4, h: 6,   x: -38.9, y: 4,   z:   0,   ry:  Math.PI / 2, title: 'Tác Phẩm 6',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold'   },
    { url: 'tranh/tranh7.jpg',  w: 7, h: 4,   x: -38.9, y: 5,   z:  15,   ry:  Math.PI / 2, title: 'Tác Phẩm 7',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'wood'   },
    // Tường bên phải
    { url: 'tranh/tranh8.jpg',  w: 5, h: 5,   x:  38.9, y: 5,   z: -15,   ry: -Math.PI / 2, title: 'Tác Phẩm 8',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold'   },
    { url: 'tranh/tranh9.jpg',  w: 8, h: 4,   x:  38.9, y: 5,   z:   0,   ry: -Math.PI / 2, title: 'Tác Phẩm 9',  desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'dark'   },
    { url: 'tranh/tranh10.jpg', w: 5, h: 7,   x:  38.9, y: 5,   z:  15,   ry: -Math.PI / 2, title: 'Tác Phẩm 10', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'silver' },
    // Vách ngăn trong
    { url: 'tranh/tranh11.jpg', w: 4, h: 4,   x: -13.4, y: 5,   z: -20,   ry:  Math.PI / 2, title: 'Tác Phẩm 11', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'gold'   },
    { url: 'tranh/tranh12.jpg', w: 5, h: 3,   x: -13.4, y: 5,   z: -10,   ry:  Math.PI / 2, title: 'Tác Phẩm 12', desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.', frameStyle: 'wood'   },
   
];

const INFO_BOARDS = [
    { url: 'model/bang.jpg', w: 3.1, h: 4.24, x: -14.5, y: 2.3,  z:  27.16, ry: (Math.PI * 3) / 2 },
    { url: 'model/bang.jpg', w: 3.1, h: 4.24, x:  14.5, y: 2.3,  z:  27.16, ry:  Math.PI / 2       },
    { url: 'model/bang.jpg', w: 6,   h: 8.4,  x:  10.25,y: 4.32, z:  14.2,  ry:  Math.PI            },
];

// =====================================================
// ENTRY POINT
// =====================================================
export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();

    for (const item of GALLERY_DATA) {
        addArt(scene, loader, item);
    }

    for (const board of INFO_BOARDS) {
        addArt(scene, loader, {
            ...board,
            title: 'Thông Tin', desc: 'Khu vực trưng bày chính.',
            frameDepth: 0.6, frameStyle: 'dark',
            spotlight: false, isInfoBoard: true,
        });
    }
}
