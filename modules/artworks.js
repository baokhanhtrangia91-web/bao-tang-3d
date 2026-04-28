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
        
        const baseMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
        );
        
        const btnMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32),
            new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3, metalness: 0.2 })
        );
        btnMesh.rotation.x = Math.PI / 2; 
        btnMesh.position.z = 0.02 + 0.01; 

        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.1),
            new THREE.MeshBasicMaterial({ visible: false })
        );

        const btnData = { isAudioButton: true, audioData: audioData };
        baseMesh.userData = btnData;
        btnMesh.userData  = btnData;
        hitBox.userData   = btnData;

        interactableObjects.push(hitBox, baseMesh, btnMesh);

        audioBtnGroup.add(baseMesh, btnMesh, hitBox);
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

    // =====================================================
    // TRANH GIỮ NGUYÊN (Mona Lisa + Bữa Tối Cuối Cùng + Lồng A/D)
    // =====================================================

    // Tranh treo trên vách gỗ lồng A và D
    { 
        url: 'tranh/tranh8.jpg', w: 4, h: 5.5, 
        x: 19, y: 4.0, z: -23.45, ry: 0, 
        title: 'Sùng Bái Các Vua (Botticelli)', 
        desc: 'Adoration of the Magi – Sandro Botticelli, c.1475. Bức tranh miêu tả cảnh ba vua phương Đông đến thờ phụng Chúa Hài Đồng, với nhiều nhân vật được cho là chân dung các thành viên gia đình Medici.', 
        frameStyle: 'wood' 
    },
    { 
        url: 'tranh/tranh9.jpg', w: 3.5, h: 4.86, 
        x: 32.95, y: 4.0, z: -2.0, ry: -Math.PI / 2, 
        title: 'Chân Dung Công Nương (La Bella Principessa)', 
        desc: 'La Bella Principessa – Leonardo da Vinci, c.1495–1496. Bức chân dung nghiêng của một thiếu nữ quý tộc Milan, vẽ bằng bút chì màu và mực trên vellum, thể hiện sự tinh tế trong kỹ thuật sfumato đặc trưng của da Vinci.', 
        frameStyle: 'gold' 
    },

    // Tường phía sau (sảnh chính) – GIỮ NGUYÊN
    { 
        url: 'tranh/tranh6.jpg', w: 5, h: 7.5, x: 0, y: 5.5, z: -28.9, ry: 0, 
        title: 'Mona Lisa', 
        desc: 'Kiệt tác của Leonardo da Vinci, được vẽ vào đầu thế kỷ 16. Hiện đang được trưng bày tại Bảo tàng Louvre, Paris. Nụ cười bí ẩn của nhân vật và kỹ thuật sfumato tạo nên sức hút vĩnh cửu của tác phẩm.', 
        frameStyle: 'gold',
        audioData: {
            url: 'model/(7) PSY - GANGNAM STYLE(강남스타일) M-V - YouTube.mp3',
            subtitles: [
                { start: 0, end: 4.5, text: "sau đây là gang nam sờ ty le" },
                { start: 5.0, end: 9.5, text: "enjoy" },
                { start: 10.0, end: 15.0, text: "quá đẳng cấp" }
            ]
        }
    },
    { 
        url: 'tranh/tranh7.jpg', w: 20.7, h: 11.64, x: 13.4, y: 6.9, z: -7.5, ry: -Math.PI / 2, 
        title: 'Bữa Tối Cuối Cùng', 
        desc: 'Bức bích họa nổi tiếng của Leonardo da Vinci, vẽ khoảng 1495–1498. Miêu tả cảnh Chúa Giêsu và 12 tông đồ trong bữa ăn tối cuối cùng trước khi Ngài bị bắt. Hiện tọa lạc tại Santa Maria delle Grazie, Milan.', 
        frameStyle: 'gold' 
    },

    // =====================================================
    // PHÒNG TRÁI – MICHELANGELO (x = -39.0, tường ry = Math.PI/2)
    // =====================================================

    // Tường trái phòng (ry = Math.PI/2, nhìn vào trong)
    // tranh1: Sáng Tạo Adam – ngang rộng ~2.1:1
    { 
        url: 'tranh/tranh1.jpg', w: 8.5 * 2.5, h: 3.86 * 2.5,
        x: -26.7, y: 6.5, z: -28.9, ry: 0,
        title: 'Sáng Tạo Adam', 
        desc: 'The Creation of Adam – Michelangelo Buonarroti, 1508–1512. Một trong chín cảnh trung tâm trên trần Nhà Nguyện Sistine, miêu tả khoảnh khắc Thiên Chúa truyền sự sống cho Adam. Khoảng cách nhỏ giữa hai ngón tay đã trở thành biểu tượng văn hóa nhân loại.',
        frameStyle: 'gold' 
    },

    // tranh2: Doni Tondo – gần vuông/tròn ~1:1
    { 
        url: 'tranh/tranh2.jpg', w: 4.5, h: 4.5,
        x: -39.0, y: 5.0, z: -10.0, ry: Math.PI / 2,
        title: 'Thánh Gia (Doni Tondo)', 
        desc: 'Doni Tondo (Holy Family) – Michelangelo Buonarroti, c.1506–1508. Tác phẩm sơn dầu hình tròn duy nhất được xác thực của Michelangelo, hiện tại Uffizi Gallery, Florence. Sự xoắn vặn của các nhân vật thể hiện phong cách Mannerist đặc sắc.',
        frameStyle: 'gold' 
    },

    // tranh3: Trần Nhà Nguyện Sistine – ngang ~1.25:1
    { 
        url: 'tranh/tranh3.jpg', w: 5.5, h: 4.4,
        x: -39.0, y: 5.0, z: 2.0, ry: Math.PI / 2,
        title: 'Trần Nhà Nguyện Sistine', 
        desc: 'Sistine Chapel Ceiling – Michelangelo Buonarroti, 1508–1512. Công trình fresco vĩ đại nhất lịch sử nghệ thuật, bao gồm hơn 300 nhân vật trải dài 520 m². Michelangelo đã hoàn thành một mình trong 4 năm, làm việc trên giàn giáo cao trong tư thế ngửa mặt lên.',
        frameStyle: 'gold' 
    },

    // tranh4: Cám Dỗ Thánh Anthony – đứng ~0.77:1
    { 
        url: 'tranh/tranh4.jpg', w: 3.5, h: 4.55,
        x: -39.0, y: 5.0, z: 14.0, ry: Math.PI / 2,
        title: 'Sự Cám Dỗ Thánh Anthony', 
        desc: 'The Torment of Saint Anthony – Michelangelo Buonarroti, c.1487–1488. Bức tranh được cho là tác phẩm sơn dầu đầu tiên của Michelangelo, vẽ khi ông mới 12–13 tuổi, phỏng theo bản khắc đồng của Martin Schongauer. Hiện tại Kimbell Art Museum, Texas.',
        frameStyle: 'bronze' 
    },

    // tranh5: Đóng Đinh Thánh Peter – ngang ~1:1
    { 
        url: 'tranh/tranh5.jpg', w: 5.0, h: 5.0,
        x: -39.0, y: 5.0, z: 24.0, ry: Math.PI / 2,
        title: 'Sự Đóng Đinh Thánh Peter', 
        desc: 'Crucifixion of Saint Peter – Michelangelo Buonarroti, 1546–1550. Fresco cuối cùng của Michelangelo, vẽ khi ông đã ngoài 70 tuổi, trong Nhà Nguyện Pauline tại Vatican. Tác phẩm thể hiện chủ đề hy sinh và đức tin với phong cách biểu cảm mạnh mẽ.',
        frameStyle: 'gold' 
    },

    // =====================================================
    // PHÒNG GIỮA – LEONARDO DA VINCI
    // Tường trái (x=-13.4, ry=Math.PI/2) và tường phải (x=-14.6, ry=-Math.PI/2)
    // Tường phía sau (z=-28.9, ry=0) và tường phía trước (z=28.9, ry=Math.PI)
    // =====================================================

    // --- Tường trái phòng giữa (x = -13.4, ry = Math.PI/2) ---

    // tranh11: Lady with an Ermine – đứng ~0.74:1
    { 
        url: 'tranh/tranh11.jpg', w: 3.5, h: 4.73,
        x: -13.4, y: 5.0, z: -20.0, ry: Math.PI / 2,
        title: 'Lady with an Ermine', 
        desc: 'Lady with an Ermine – Leonardo da Vinci, c.1489–1490. Chân dung Cecilia Gallerani, người tình của Ludovico Sforza, Công tước Milan. Đây là một trong bốn tác phẩm chân dung phụ nữ còn được xác thực của da Vinci. Hiện tại Czartoryski Museum, Kraków.',
        frameStyle: 'gold' 
    },

    // tranh12: Madonna of the Carnation – đứng ~0.77:1
    { 
        url: 'tranh/tranh12.jpg', w: 3.5, h: 4.55,
        x: -13.4, y: 5.0, z: -10.0, ry: Math.PI / 2,
        title: 'Madonna với Hoa Cẩm Chướng', 
        desc: 'Madonna of the Carnation – Leonardo da Vinci, c.1478–1480. Một trong những tác phẩm sơn dầu đầu tiên của da Vinci, miêu tả Đức Mẹ Maria dâng bông hoa cẩm chướng đỏ – biểu tượng Cuộc Khổ Nạn – cho Chúa Hài Đồng. Hiện tại Alte Pinakothek, Munich.',
        frameStyle: 'gold' 
    },

    // --- Tường phải phòng giữa (x = -14.6, ry = -Math.PI/2) ---

    // tranh13: Madonna of the Yarnwinder – đứng ~0.77:1
    { 
        url: 'tranh/tranh13.jpg', w: 3.5, h: 4.55,
        x: -14.6, y: 5.0, z: -20.0, ry: -Math.PI / 2,
        title: 'Madonna với Khung Chỉ', 
        desc: 'Madonna of the Yarnwinder – Leonardo da Vinci, c.1499–1507. Bức tranh miêu tả Đức Mẹ và Chúa Hài Đồng đang với tay về phía cuộn chỉ hình chữ thập – ẩn dụ về Thập Tự Giá. Tồn tại hai phiên bản được công nhận, một trong số đó đã từng bị đánh cắp năm 2003.',
        frameStyle: 'gold' 
    },

    // tranh14: Ginevra de' Benci – đứng ~0.73:1
    { 
        url: 'tranh/tranh14.jpg', w: 3.5, h: 4.8,
        x: -14.6, y: 5.0, z: -10.0, ry: -Math.PI / 2,
        title: "Ginevra de' Benci", 
        desc: "Ginevra de' Benci – Leonardo da Vinci, c.1474–1478. Tác phẩm chân dung sớm nhất còn tồn tại của da Vinci, vẽ một quý cô Florence trẻ tuổi trước cây bách xù – tên tiếng Ý 'ginepro' gần với tên Ginevra. Đây là tác phẩm duy nhất của da Vinci tại châu Mỹ, đang trưng bày tại National Gallery of Art, Washington D.C.",
        frameStyle: 'gold' 
    },

    // tranh16: Saint John the Baptist (Titian) – đứng ~0.67:1
    { 
        url: 'tranh/tranh16.jpg', w: 3.0, h: 4.5,
        x: -14.6, y: 5.0, z: 2.0, ry: -Math.PI / 2,
        title: 'Thánh Gioan Tẩy Giả', 
        desc: 'Saint John the Baptist – Titian (Tiziano Vecellio), c.1540. Tác phẩm của Titian thể hiện Thánh Gioan Tẩy Giả với hình thể cường tráng, cây thánh giá sậy và con chiên tượng trưng. Hiện tại Gallerie dell\'Accademia, Venice.',
        frameStyle: 'wood' 
    },

    // tranh17: Lễ Rửa Tội Chúa Kitô – đứng ~0.85:1
    { 
        url: 'tranh/tranh17.jpg', w: 4.0, h: 4.7,
        x: -14.6, y: 5.0, z: 14.0, ry: -Math.PI / 2,
        title: 'Lễ Rửa Tội Chúa Kitô', 
        desc: 'Baptism of Christ – Andrea del Verrocchio & Leonardo da Vinci, c.1472–1475. Người thiên thần bên trái được cho là do da Vinci vẽ khi mới là học trò của Verrocchio, với chất lượng vượt trội đến mức Verrocchio từ bỏ hội họa. Hiện tại Uffizi Gallery, Florence.',
        frameStyle: 'gold' 
    },

    // --- Tường phía sau phòng giữa (z = -28.9, ry = 0) ---


    // tranh19: Madonna Benois – đứng ~0.77:1
    { 
        url: 'tranh/tranh19.jpg', w: 3.5, h: 4.55,
        x: -39.0, y: 5.0, z: -22.0, ry: Math.PI / 2,
        title: 'Madonna Benois', 
        desc: 'Madonna Benois – Leonardo da Vinci, c.1478–1480. Một trong những tác phẩm đầu tiên của da Vinci, miêu tả Đức Mẹ trẻ trung đang vui đùa với Chúa Hài Đồng. Phong cách tự nhiên và chuyển động sinh động đánh dấu sự đổi mới của da Vinci so với truyền thống Florentine. Hiện tại Hermitage Museum, Saint Petersburg.',
        frameStyle: 'gold' 
    },

    // --- Tường phía trước phòng giữa (z = 28.9, ry = Math.PI) ---

    // tranh9: La Bella Principessa (phiên bản thứ hai trên tường trước)
    // Dùng tranh còn lại cho tường trước phòng giữa
    // Không còn tranh da Vinci nào khác, bỏ qua tường này (không treo tranh thừa)
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