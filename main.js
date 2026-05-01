import * as THREE from 'three';
import { setupScene } from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks } from './modules/artworks.js';
import { setupControls } from './modules/controls.js';
import { setupUI } from './modules/ui.js';
import { setupCoordinates } from './modules/coordinates.js';
import { setupMinimap } from './modules/minimap.js';
import { setupScreenshot } from './modules/screenshot.js';

// =====================================================
// SCENE
// =====================================================
const { scene, camera, renderer } = setupScene();
const { collidableWalls } = setupEnvironment(scene);
const { renderMinimap } = setupMinimap(scene, renderer, camera);

setupScreenshot(renderer, scene, camera);
loadArtworks(scene);

//  LẤY controls CHUẨN
const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

const { update: updateCoords } = setupCoordinates(camera);
const { updateInteraction } = setupUI();

const clock = new THREE.Clock();


// =====================================================
// 🎧 BACKGROUND MUSIC
// =====================================================
const listener = new THREE.AudioListener();
camera.add(listener);

const bgMusic = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

let musicReady = false;

audioLoader.load(
    'audio/0sound effects/music.mp3', // đổi nhạc ở đây nàh !!!
    (buffer) => {
        bgMusic.setBuffer(buffer);
        bgMusic.setLoop(true);
        bgMusic.setVolume(0.25);
        musicReady = true;
    },
    undefined,
    (err) => console.error('Lỗi load nhạc:', err)
);

function playMusic() {
    if (musicReady && !bgMusic.isPlaying) {
        bgMusic.play();
    }
}

function pauseMusic() {
    if (bgMusic.isPlaying) {
        bgMusic.pause();
    }
}


// =====================================================
// =====================================================

//  khi bắt đầu chơi (click "KHÁM PHÁ NGAY")
controls.addEventListener('lock', () => {
    playMusic();
});

//  khi bấm ESC (unlock)
controls.addEventListener('unlock', () => {
    pauseMusic();
});


// =====================================================
// ANIMATE
// =====================================================
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (controls.isLocked) {
        updateControls(delta);
        updateCoords();
        updateInteraction(camera);
    }

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderMinimap();
}

animate();