import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { artworkData } from '../data.js';

const loader = new GLTFLoader();

export function loadArtworks(scene) {
    loader.load(
        '/model/picture_frame.glb',
        (gltf) => {
            artworkData.forEach((artwork) => {
                const frame = gltf.scene.clone();
                frame.scale.set(1, 1, 1);
                frame.position.set(artwork.x, artwork.y, artwork.z);
                frame.rotation.y = artwork.rotY;
                frame.castShadow = true;

                // Gắn ảnh tranh vào mặt trước của khung
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(artwork.image, (texture) => {
                    const imgMat = new THREE.MeshStandardMaterial({ map: texture });
                    const imgMesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(1.2, 0.9),
                        imgMat
                    );
                    // Đặt ảnh hơi nhô ra trước mặt khung
                    imgMesh.position.set(0, 0, 0.06);
                    frame.add(imgMesh);
                });

                scene.add(frame);
            });
        },
        undefined,
        (err) => console.error('Lỗi load model khung tranh:', err)
    );
}