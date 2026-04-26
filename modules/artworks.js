import * as THREE from 'three';

export const interactableObjects = [];

// =====================================================
// VẬT LIỆU KHUNG — dùng chung
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

function createFrame(w, h, depth, frameStyle) {
    frameStyle = frameStyle || 'gold';
    const group  = new THREE.Group();
    const FW     = 0.18;
    const outerW = w + FW * 2;
    const mat       = FRAME_MATERIALS[frameStyle] || FRAME_MATERIALS.bronze;
    const cornerMat = CORNER_MATERIALS[frameStyle] || CORNER_MATERIALS.other;

    const bars = [
        { size: [outerW, FW, depth], pos: [0, h / 2 + FW / 2, 0] },
        { size: [outerW, FW, depth], pos: [0, -h / 2 - FW / 2, 0] },
        { size: [FW, h, depth], pos: [-w / 2 - FW / 2, 0, 0] },
        { size: [FW, h, depth], pos: [ w / 2 + FW / 2, 0, 0] },
    ];
    for (const { size, pos } of bars) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
        mesh.position.set(...pos);
        group.add(mesh);
    }

    const cs = FW + 0.02;
    for (const [cx, cy] of [
        [-w / 2 - FW / 2,  h / 2 + FW / 2], [ w / 2 + FW / 2,  h / 2 + FW / 2],
        [-w / 2 - FW / 2, -h / 2 - FW / 2], [ w / 2 + FW / 2, -h / 2 - FW / 2],
    ]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(cs, cs, depth + 0.01), cornerMat);
        c.position.set(cx, cy, 0);
        group.add(c);
    }
    group.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    return group;
}

// =====================================================
// HÀM addArt CHÍNH
// =====================================================
function addArt(scene, loader, opts) {
    const {
        url, w, h, x, z, ry, title, desc,
        frameDepth, frameStyle, isInfoBoard, audioData
    } = Object.assign({
        y: 5, ry: 0, title: '', desc: '',
        frameDepth: 0.12, frameStyle: 'gold',
        isInfoBoard: false, audioData: null
    }, opts);

    const y = opts.y !== undefined ? opts.y : 5;
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;

    const art = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.0 })
    );
    art.position.z = frameDepth / 2 + 0.005;
    
    // Đánh dấu Object là BỨC TRANH
    art.userData = { isArt: true, title, desc };
    interactableObjects.push(art); 

    const frame   = createFrame(w, h, frameDepth, isInfoBoard ? 'dark' : frameStyle);
    const backing = new THREE.Mesh(new THREE.BoxGeometry(w + 0.42, h + 0.42, 0.04), BACKING_MAT);
    backing.position.z = -frameDepth / 2 - 0.02;

    const group = new THREE.Group();
    group.add(backing, frame, art);

    // =====================================================
    // NÚT PHÁT AUDIO (CỤC HỘP TRÒN ĐỎ)
    // =====================================================
    if (audioData && audioData.url) {
        const audioBtnGroup = new THREE.Group();
        
        // 1. Tấm nền (Hộp đen)
        const baseMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
        );
        
        // 2. Nút tròn màu đỏ (Cylinder nằm ngang)
        const btnMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32),
            new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3, metalness: 0.2 })
        );
        btnMesh.rotation.x = Math.PI / 2; 
        btnMesh.position.z = 0.02 + 0.01; 

        // 3. Khối tàng hình bọc bên ngoài để tia ngắm dễ chạm trúng
        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.1),
            new THREE.MeshBasicMaterial({ visible: false })
        );

        // Gắn dữ liệu audio vào các vật thể này để UI.js có thể nhận diện
        const btnData = { isAudioButton: true, audioData: audioData };
        baseMesh.userData = btnData;
        btnMesh.userData  = btnData;
        hitBox.userData   = btnData;

        // Push cả 3 vào mảng Raycaster
        interactableObjects.push(hitBox, baseMesh, btnMesh);

        audioBtnGroup.add(baseMesh, btnMesh, hitBox);
        // Đặt lùi xuống dưới bức tranh một đoạn (Y: -h/2 - 0.5)
        audioBtnGroup.position.set(0, -h / 2 - 0.5, frameDepth / 2);
        group.add(audioBtnGroup);
    }

    group.position.set(x, y, z);
    group.rotation.y = ry;
    scene.add(group);
}

// =====================================================
// DANH SÁCH TRANH
// =====================================================
const GALLERY_DATA = [
    // --- Tường phía sau (sảnh chính) ---
    { 
        url: 'tranh/tranh6.jpg',  w: 5, h: 7.5, x: 0, y: 5.5, z: -28.9, ry: 0, 
        title: 'Mona Lisa', 
        desc: 'Kiệt tác của Leonardo da Vinci, được vẽ vào đầu thế kỷ 16.', 
        frameStyle: 'gold',
        audioData: {
            url: 'model/(7) PSY - GANGNAM STYLE(강남스타일) M-V - YouTube.mp3', // Đổi đường dẫn audio thật của bạn vào đây
            subtitles: [
                { start: 0, end: 4.5, text: "sau đây là gang nam sờ ty le" },
                { start: 5.0, end: 9.5, text: "enjoy" },
                { start: 10.0, end: 15.0, text: "quá đẳng cấp" }
            ]
        }
    },

    { url: 'tranh/tranh7.jpg',  w: 20.7, h: 11.64, x: 13.4,  y: 6.9, z: -7.5,  ry: -Math.PI / 2,  title: 'Bữa Tối Cuối Cùng', desc: 'Bức bích họa nổi tiếng của Leonardo da Vinci.',              frameStyle: 'gold'   },
    { url: 'tranh/tranh11.jpg', w: 4,    h: 4,     x: -13.4, y: 5,   z: -20,   ry:  Math.PI / 2,  title: 'Tác Phẩm 11',      desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.',         frameStyle: 'gold'   },
    { url: 'tranh/tranh12.jpg', w: 5,    h: 3,     x: -13.4, y: 5,   z: -10,   ry:  Math.PI / 2,  title: 'Tác Phẩm 12',      desc: 'Tác phẩm trưng bày tại bảo tàng nghệ thuật virtual.',         frameStyle: 'wood'   },

    { url: 'tranh/tranh1.jpg',  w: 4,    h: 5,     x: -39.0, y: 5,   z: -22,   ry:  Math.PI / 2,  title: 'Tranh 1',           desc: 'Nghệ thuật trừu tượng đương đại.',                             frameStyle: 'gold'   },
    { url: 'tranh/tranh2.jpg',  w: 5,    h: 3.5,   x: -39.0, y: 5,   z: -10,   ry:  Math.PI / 2,  title: 'Tranh 2',           desc: 'Phong cảnh thiên nhiên kỳ vĩ.',                                frameStyle: 'silver' },
    { url: 'tranh/tranh3.jpg',  w: 4,    h: 4,     x: -39.0, y: 5,   z:   2,   ry:  Math.PI / 2,  title: 'Tranh 3',           desc: 'Chân dung người phụ nữ cổ điển.',                              frameStyle: 'wood'   },
    { url: 'tranh/tranh4.jpg',  w: 4,    h: 5.5,   x: -39.0, y: 5,   z:  14,   ry:  Math.PI / 2,  title: 'Tranh 4',           desc: 'Hội họa ấn tượng phái.',                                       frameStyle: 'gold'   },
    { url: 'tranh/tranh5.jpg',  w: 5,    h: 3,     x: -39.0, y: 5,   z:  24,   ry:  Math.PI / 2,  title: 'Tranh 5',           desc: 'Sơn dầu phong cảnh Châu Âu.',                                  frameStyle: 'bronze' },

    { url: 'tranh/tranh13.jpg', w: 4,    h: 4.5,   x: -14.6, y: 5,   z: -22,   ry: -Math.PI / 2,  title: 'Tranh 13',          desc: 'Hoa sen trong nghệ thuật Á Đông.',                             frameStyle: 'gold'   },
    { url: 'tranh/tranh14.jpg', w: 5,    h: 3.5,   x: -14.6, y: 5,   z: -10,   ry: -Math.PI / 2,  title: 'Tranh 14',          desc: 'Bình nguyên trải dài vô tận.',                                 frameStyle: 'silver' },
    { url: 'tranh/tranh15.jpg', w: 4,    h: 4,     x: -14.6, y: 5,   z:   2,   ry: -Math.PI / 2,  title: 'Tranh 15',          desc: 'Rừng mưa nhiệt đới.',                                          frameStyle: 'wood'   },
    { url: 'tranh/tranh16.jpg', w: 4,    h: 5,     x: -14.6, y: 5,   z:  14,   ry: -Math.PI / 2,  title: 'Tranh 16',          desc: 'Làng chài ven biển.',                                          frameStyle: 'dark'   },
    
    { url: 'tranh/tranh18.jpg', w: 5,    h: 4,     x: -32,   y: 5,   z: -28.9, ry:  0,             title: 'Tranh 18',          desc: 'Cảnh hoàng hôn trên sông.',                                    frameStyle: 'gold'   },
    { url: 'tranh/tranh19.jpg', w: 4,    h: 5.5,   x: -26,   y: 5,   z: -28.9, ry:  0,             title: 'Tranh 19',          desc: 'Phố cổ Hội An về đêm.',                                        frameStyle: 'silver' },
    { url: 'tranh/tranh20.jpg', w: 5,    h: 4,     x: -20,   y: 5,   z: -28.9, ry:  0,             title: 'Tranh 20',          desc: 'Biển cả và trăng tròn.',                                       frameStyle: 'wood'   },

    { url: 'tranh/tranh21.jpg', w: 5,    h: 4,     x: -32,   y: 5,   z:  28.9, ry:  Math.PI,        title: 'Tranh 21',          desc: 'Mùa thu lá vàng.',                                             frameStyle: 'gold'   },
    { url: 'tranh/tranh22.jpg', w: 3.5,  h: 4.5,   x: -26,   y: 5,   z:  28.9, ry:  Math.PI,        title: 'Tranh 22',          desc: 'Chân dung nghệ sĩ.',                                           frameStyle: 'bronze' },
    { url: 'tranh/tranh23.jpg', w: 4,    h: 4,     x: -20,   y: 5,   z:  28.9, ry:  Math.PI,        title: 'Tranh 23',          desc: 'Nghệ thuật pop art hiện đại.',                                 frameStyle: 'silver' },
];

const INFO_BOARDS = [
    { url: 'model/bang.jpg', w: 3.1, h: 4.24, x: -14.5, y: 2.3,  z:  27.16, ry: (Math.PI * 3) / 2 },
    { url: 'model/z7754718409982_fa3b56a56702c325f8c0a95f4d907868.jpg', w: 3.1, h: 4.24, x:  14.5, y: 2.3,  z:  27.16, ry:  Math.PI / 2       },
    { url: 'model/bang.jpg', w: 6,   h: 8.4,  x:  10.25,y: 4.32, z:  14.2,  ry:  Math.PI            },
];

export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();
    for (const item of GALLERY_DATA) addArt(scene, loader, item);
    for (const board of INFO_BOARDS) {
        addArt(scene, loader, {
            ...board,
            title: 'Thông Tin', desc: 'Khu vực trưng bày chính.',
            frameDepth: 0.6, frameStyle: 'dark', isInfoBoard: true,
        });
    }
}