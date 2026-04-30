import * as THREE from 'three';
import { ARTWORKS_INFO } from '../data.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export const interactableObjects = [];

// =====================================================
// VẬT LIỆU KHUNG — dùng chung
// =====================================================
const FRAME_MATERIALS = {
    gold: new THREE.MeshStandardMaterial({ color: 0xc8a84b, roughness: 0.25, metalness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.6, metalness: 0.3 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.8, metalness: 0.05 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xc0c0c8, roughness: 0.2, metalness: 0.9 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.55, metalness: 0.15 }),
};

const CORNER_MATERIALS = {
    gold: new THREE.MeshStandardMaterial({ color: 0xe8c060, roughness: 0.15, metalness: 0.95 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xe0e0e8, roughness: 0.15, metalness: 0.95 }),
    other: new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.15, metalness: 0.95 }),
};

const BACKING_MAT = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 });

// =====================================================
// TẠO KHUNG
// =====================================================
function createFrame(w, h, depth, frameStyle) {
    frameStyle = frameStyle || 'gold';
    const group = new THREE.Group();
    const FW = 0.18;
    const outerW = w + FW * 2;

    const mat = FRAME_MATERIALS[frameStyle] || FRAME_MATERIALS.bronze;
    const cornerMat = CORNER_MATERIALS[frameStyle] || CORNER_MATERIALS.other;

    const bars = [
        { size: [outerW, FW, depth], pos: [0, h / 2 + FW / 2, 0] },
        { size: [outerW, FW, depth], pos: [0, -h / 2 - FW / 2, 0] },
        { size: [FW, h, depth], pos: [-w / 2 - FW / 2, 0, 0] },
        { size: [FW, h, depth], pos: [w / 2 + FW / 2, 0, 0] },
    ];

    for (const { size, pos } of bars) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
        mesh.position.set(...pos);
        group.add(mesh);
    }

    const cs = FW + 0.02;
    for (const [cx, cy] of [
        [-w / 2 - FW / 2, h / 2 + FW / 2],
        [w / 2 + FW / 2, h / 2 + FW / 2],
        [-w / 2 - FW / 2, -h / 2 - FW / 2],
        [w / 2 + FW / 2, -h / 2 - FW / 2],
    ]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(cs, cs, depth + 0.01), cornerMat);
        c.position.set(cx, cy, 0);
        group.add(c);
    }

    group.traverse(n => {
        if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
        }
    });

    return group;
}

// =====================================================
// ADD ART
// =====================================================
function addArt(scene, loader, opts) {
    const {
        url, w, h, x, z, ry, title, desc,
        frameDepth, frameStyle, isInfoBoard, audioData, artInfo
    } = Object.assign({
        y: 5,
        ry: 0,
        title: '',
        desc: '',
        frameDepth: 0.12,
        frameStyle: 'gold',
        isInfoBoard: false,
        audioData: null,
        artInfo: null
    }, opts);

    const y = opts.y !== undefined ? opts.y : 5;

    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;

    const art = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })
    );

    art.position.z = frameDepth / 2 + 0.005;

    // 🔥 QUAN TRỌNG: lưu full info
    art.userData = {
        isArt: true,
        title,
        desc,
        artInfo
    };

    interactableObjects.push(art);

    const frame = createFrame(w, h, frameDepth, isInfoBoard ? 'dark' : frameStyle);

    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.42, h + 0.42, 0.04),
        BACKING_MAT
    );
    backing.position.z = -frameDepth / 2 - 0.02;

    const group = new THREE.Group();
    group.add(backing, frame, art);

    // =====================================================
    // AUDIO BUTTON
    // =====================================================
    if (audioData && audioData.url) {
        const audioBtnGroup = new THREE.Group();

        const baseMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );

        const btnMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32),
            new THREE.MeshStandardMaterial({ color: 0xcc0000 })
        );

        btnMesh.rotation.x = Math.PI / 2;
        btnMesh.position.z = 0.03;

        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.1),
            new THREE.MeshBasicMaterial({ visible: false })
        );

        const btnData = { isAudioButton: true, audioData };

        baseMesh.userData = btnData;
        btnMesh.userData = btnData;
        hitBox.userData = btnData;

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
// CHỈ CHỨA TỌA ĐỘ
// =====================================================
const ARTWORKS_POSITION = [
    // add arts
    { id: '6', w: 5, h: 7.5, x: 0, y: 5.5, z: -28.9, ry: 0 },
    { id: '7', w: 20.7, h: 11.64, x: 13.4, y: 6.9, z: -7.5, ry: -Math.PI / 2 },
    { id: '8', w: 4, h: 6, x: -13.4, y: 6, z: -23, ry: Math.PI / 2 },

    { id: '1', w: 18, h: 10, x: -26, y: 8, z: -28.9, ry: 0 },
    { id: '2', w: 8, h: 7, x: -38.9, y: 6, z: -10, ry: Math.PI / 2 },
    { id: '3', w: 8, h: 8, x: -38.9, y: 6, z: 18, ry: Math.PI / 2 },
    { id: '4', w: 9, h: 10.5, x: -14.6, y: 7, z: -15, ry: -Math.PI / 2 },
    { id: '5', w: 9, h: 7, x: -14.6, y: 7, z: 2, ry: -Math.PI / 2 },

    { id: '9', w: 6, h: 6.5, x: -13.4, y: 6, z: -8.5, ry: Math.PI / 2 },
    { id: '10', w: 5, h: 7, x: -13.4, y: 6, z: 5, ry: Math.PI / 2 },

    { id: '11', w: 7, h: 6, x: 38.9, y: 6, z: -13.5, ry: -Math.PI / 2 },
    { id: '12', w: 6, h: 6, x: 14.6, y: 6, z: -14, ry: Math.PI / 2 },
    { id: '13', w: 8, h: 6, x: 31.5, y: 6, z: -5.6, ry: Math.PI },

    { id: '14', w: 7, h: 6, x: 14.6, y: 6, z: 8, ry: Math.PI / 2 },
    { id: '15', w: 6, h: 7, x: 19, y: 5, z: -23.4, ry: 0 },
    { id: '16', w: 6, h: 6, x: 32.9, y: 10, z: 24.3, ry: -Math.PI / 2 },
    { id: '17', w: 6, h: 6, x: 32.9, y: 10, z: 15, ry: -Math.PI / 2 },
    // add models
    { id: 'm4', x: 36.7, y: 2.5, z: 24.3, ry: Math.PI * 2 / 3, scale: 6.8 },
    { id: 'm9', x: 36.7, y: 1, z: 3, ry: 0, scale: 1.5 },
    { id: 'm8', x: 36.9, y: 0, z: 15, ry: -Math.PI / 2, scale: 2.4 },
    { id: 'm7', x: 31, y: 3, z: -26.5, ry: 0, scale: 2.5 },
    { id: 'm10', x: 36.7, y: 1, z: 8.7, ry: 0, scale: 0.7 },
    // add trees
    { id: 'tree', x: -12, y: 0, z: 13, ry: 0, scale: 2 },
    { id: 'tree', x: -12, y: 0, z: 16.5, ry: 0, scale: 1.5 },
    { id: 'tree', x: 12, y: 0, z: 16.5, ry: 0, scale: 1.5 },
    { id: 'tree', x: -12, y: 0, z: 27.5, ry: 0, scale: 1.5 },
    { id: 'tree', x: 12, y: 0, z: 27.5, ry: 0, scale: 1.5 },
    { id: 'tree', x: 16.5, y: 0, z: 27.5, ry: 0, scale: 1.5 },
    { id: 'tree', x: 15.5, y: 0, z: 13.5, ry: 0, scale: 1.5 },
    { id: 'tree', x: -38, y: 0, z: 12.2, ry: 0, scale: 1.5 },
    { id: 'tree', x: -15.6, y: 0, z: 12.2, ry: 0, scale: 1.5 },
];

// =====================================================
// GHÉP DATA
// =====================================================
const GALLERY_DATA = ARTWORKS_POSITION.map(pos => {
    const info = ARTWORKS_INFO.find(a => a.id === pos.id);

    if (!info) {
        console.warn('Missing data for id:', pos.id);
        return null;
    }

    return {
        ...pos,
        url: info.imageUrl,
        title: info.title,
        desc: info.desc,
        frameStyle: info.frameStyle,
        artInfo: info,
        audioData: { url: info.audioUrl }
    };
}).filter(Boolean);

// =====================================================
// LOAD
const INFO_BOARDS = [
    { url: 'model/bang.jpg', w: 6, h: 8.4, x: -25.5, y: 4.35, z: 28.5, ry: Math.PI },
    { url: 'model/z7754718409982_fa3b56a56702c325f8c0a95f4d907868.jpg', w: 6, h: 8.4, x: 23.5, y: 4.35, z: 28.5, ry: Math.PI },
    { url: 'model/bang.jpg', w: 6, h: 8.4, x: 10.25, y: 4.35, z: 14.2, ry: Math.PI },
    { url: 'model/thông báo.jpg', w: 4, h: 6.4, x: 33, y: 3.5, z: -2, ry: -Math.PI / 2 },
];
// =====================================================
export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader)

    for (const item of GALLERY_DATA) {
        if (!item) continue;

        // ================= MODEL 3D =================
        if (item.artInfo?.type === 'model') {

            gltfLoader.load(item.artInfo.modelUrl, (gltf) => {

                const model = gltf.scene;

                model.position.set(item.x, item.y, item.z);

                model.rotation.y = item.ry || 0;

                model.scale.setScalar(item.scale || 1);

                model.traverse((n) => {
                    if (n.isMesh) {
                        n.castShadow = true;
                        n.receiveShadow = true;
                    }
                });

                scene.add(model);

            }, undefined, (err) => {
                console.error('Lỗi load model:', err);
            });

            continue;
        }
        for (const board of INFO_BOARDS) {
            addArt(scene, loader, {
                ...board,
                title: 'Thông Tin', desc: 'Khu vực trưng bày chính.',
                frameDepth: 0.6, frameStyle: 'dark', isInfoBoard: true,
            });
        }
        // ================= TRANH =================
        addArt(scene, loader, item);
    }
}
