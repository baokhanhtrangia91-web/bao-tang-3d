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

const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);
const { update: updateCoords } = setupCoordinates(camera);
const { updateInteraction } = setupUI();

const clock = new THREE.Clock();


// =====================================================
// 🎵 BACKGROUND MUSIC
// =====================================================
const listener = new THREE.AudioListener();
camera.add(listener);

const bgMusic = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

let musicReady = false;
let userWantsMusic = false; // 🔥 KEY FIX

audioLoader.load(
    'audio/0sound effects/music.mp3',
    (buffer) => {
        bgMusic.setBuffer(buffer);
        bgMusic.setLoop(true);
        bgMusic.setVolume(0.25);
        musicReady = true;

        // 🔥 nếu user đã bấm start trước đó → auto play ngay
        if (userWantsMusic && !bgMusic.isPlaying) {
            bgMusic.play();
        }
    },
    undefined,
    (err) => console.error('Lỗi load nhạc:', err)
);

function playMusic() {
    userWantsMusic = true; // 🔥 nhớ rằng user muốn nghe

    if (musicReady && !bgMusic.isPlaying) {
        bgMusic.play();
    }
}

function pauseMusic() {
    userWantsMusic = false;

    if (bgMusic.isPlaying) {
        bgMusic.pause();
    }
}


// =====================================================
// 🎯 START BUTTON (QUAN TRỌNG NHẤT)
// =====================================================
const startBtn = document.getElementById('start-btn');

startBtn?.addEventListener('click', () => {
    playMusic(); // gọi trực tiếp từ user click
});


// =====================================================
// ESC → pause
// =====================================================
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