import * as THREE from 'three';
import { setupScene } from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks } from './modules/artworks.js';
import { setupControls } from './modules/controls.js';
import { setupUI } from './modules/ui.js';
import { setupCoordinates } from './modules/coordinates.js';
import { setupMinimap } from './modules/minimap.js';
import { setupScreenshot } from './modules/screenshot.js';
import { setupAudio } from './modules/audioManager.js';

// =====================================================
// SCENE
// =====================================================
const { scene, camera, renderer } = setupScene();
const { collidableWalls } = setupEnvironment(scene);
const { renderMinimap } = setupMinimap(scene, renderer, camera);

setupScreenshot(renderer, scene, camera);
loadArtworks(scene);

// controls
const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

// UI + coords
const { update: updateCoords } = setupCoordinates(camera);
const { updateInteraction } = setupUI();

//  AUDIO (tách riêng)
const audio = setupAudio(camera);

const clock = new THREE.Clock();


// =====================================================
// =====================================================

// click "KHÁM PHÁ NGAY"
const startBtn = document.getElementById('start-btn');
startBtn?.addEventListener('click', () => {
    audio.play(); //  phát nhạc ngay từ user click
});

// ESC (unlock chuột)
controls.addEventListener('unlock', () => {
    audio.pause(); //  pause nhạc
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