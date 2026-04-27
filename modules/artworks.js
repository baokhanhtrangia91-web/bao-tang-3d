import * as THREE from 'three';
import { ARTWORKS_INFO } from '../data.js';

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
    { id: '6', w: 5, h: 7.5, x: 0, y: 5.5, z: -28.9, ry: 0 },
    { id: '7', w: 20.7, h: 11.64, x: 13.4, y: 6.9, z: -7.5, ry: -Math.PI / 2 },
    { id: '8', w: 4, h: 4, x: -13.4, y: 5, z: -20, ry: Math.PI / 2 },

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
// =====================================================
export function loadArtworks(scene) {
    const loader = new THREE.TextureLoader();

    for (const item of GALLERY_DATA) {
        if (!item) continue;
        addArt(scene, loader, item);
    }
}