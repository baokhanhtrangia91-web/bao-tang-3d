// =====================================================
// main.js — BẢN TỐI ƯU (GIỮ MINIMAP)
// =====================================================

import * as THREE from 'three';
import { setupScene }       from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
<<<<<<< Updated upstream
=======
import { createRoomManager }from './modules/roomManager.js';
>>>>>>> Stashed changes
import { loadArtworks }     from './modules/artworks.js';
import { setupControls }    from './modules/controls.js';
import { setupUI }          from './modules/ui.js';
import { setupCoordinates } from './modules/coordinates.js';
import { setupMinimap }     from './modules/minimap.js';
<<<<<<< Updated upstream
import { setupScreenshot }  from './modules/screenshot.js'; 

const { scene, camera, renderer } = setupScene();
const { collidableWalls }         = setupEnvironment(scene);
const { renderMinimap }           = setupMinimap(scene, renderer, camera);

setupScreenshot(renderer, scene, camera);

loadArtworks(scene);

const { update: updateControls }        = setupControls(camera, renderer, collidableWalls);
const { update: updateCoords }          = setupCoordinates(camera);
const { updateInteraction }             = setupUI();
=======
import { setupScreenshot }  from './modules/screenshot.js';
import { setupAudio }       from './modules/audioManager.js';

// ── Loading Manager ────────────────────────────────────
THREE.DefaultLoadingManager.onStart = (url, loaded, total) => {
    updateLoadingProgress(loaded / total);
};

THREE.DefaultLoadingManager.onLoad = () => {
    setTimeout(hideLoadingScreen, 400);
};

THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
    updateLoadingProgress(loaded / total);
};

function updateLoadingProgress(ratio) {
    const bar = document.getElementById('loading-bar-fill');
    const pct = document.getElementById('loading-pct');
    if (bar) bar.style.width = `${Math.round(ratio * 100)}%`;
    if (pct) pct.textContent = `${Math.round(ratio * 100)}%`;
}

function hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    screen.style.transition = 'opacity 0.6s ease';
    screen.style.opacity    = '0';
    setTimeout(() => { screen.style.display = 'none'; }, 650);
}

// ── KHỞI TẠO HỆ THỐNG ──────────────────────────────────
const { scene, camera, renderer } = setupScene();
const { collidableWalls, rooms, shared } = setupEnvironment(scene);
const roomManager = createRoomManager(rooms, shared);

// Giữ lại Screenshot và Minimap[cite: 12, 20]
const { renderMinimap } = setupMinimap(scene, renderer, camera);
setupScreenshot(renderer, scene, camera);

loadArtworks(scene, (progress) => {});

const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

// Tọa độ & FPS counter[cite: 21]
const { update: updateCoords } = setupCoordinates(camera, renderer);
const { updateInteraction }    = setupUI();
>>>>>>> Stashed changes

const audio = setupAudio(camera);

// ── XỬ LÝ SỰ KIỆN ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('pointerdown', () => {
            controls.lock(); 
            audio.play();    
        });
    }
});

controls.addEventListener('unlock', () => { 
    audio.pause(); 
});

// ── ANIMATE LOOP ────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

<<<<<<< Updated upstream
    updateControls(delta);
    updateCoords();
    updateInteraction(camera);          
=======
    if (controls.isLocked) {
        updateControls(delta);
        updateCoords();
        updateInteraction(camera);
        roomManager.update(camera);
    }
>>>>>>> Stashed changes

    // Main render[cite: 12]
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
<<<<<<< Updated upstream
    
=======

    // Render Minimap
>>>>>>> Stashed changes
    renderMinimap();
}

animate();