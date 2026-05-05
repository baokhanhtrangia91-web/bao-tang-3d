// =====================================================
// main.js  (REFACTORED — Room Visibility System)
//
// CHANGES vs original:
//   1. setupEnvironment now returns { collidableWalls, rooms, shared }
//   2. createRoomManager is imported and called
//   3. roomManager.update(camera) is called inside animate()
//   4. Everything else is identical
// =====================================================

import * as THREE from 'three';
import { setupScene } from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { createRoomManager } from './modules/roomManager.js';   // ← NEW
import { loadArtworks } from './modules/artworks.js';
import { setupControls } from './modules/controls.js';
import { setupUI } from './modules/ui.js';
import { setupCoordinates } from './modules/coordinates.js';
import { setupMinimap } from './modules/minimap.js';
import { setupScreenshot } from './modules/screenshot.js';
import { setupAudio } from './modules/audioManager.js';

// ── SCENE ─────────────────────────────────────────────
const { scene, camera, renderer } = setupScene();

// ── ENVIRONMENT ───────────────────────────────────────
// Now returns rooms[] and shared group in addition to collidableWalls
const { collidableWalls, rooms, shared } = setupEnvironment(scene);

// ── ROOM MANAGER ──────────────────────────────────────
// Pass the 3 room Groups and the always-on shared Group
const roomManager = createRoomManager(rooms, shared);

// ── MINIMAP & SCREENSHOT ──────────────────────────────
const { renderMinimap } = setupMinimap(scene, renderer, camera);
setupScreenshot(renderer, scene, camera);

// ── ARTWORKS ──────────────────────────────────────────
// artworks.js adds meshes to `scene` directly.
// If you want per-room artwork culling, move artwork adds
// into environment.js and route them via roomByX().
loadArtworks(scene);

// ── CONTROLS ──────────────────────────────────────────
const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

// ── UI & COORDS ───────────────────────────────────────
const { update: updateCoords } = setupCoordinates(camera);
const { updateInteraction }    = setupUI();

// ── AUDIO ─────────────────────────────────────────────
const audio = setupAudio(camera);

const clock = new THREE.Clock();

// ── EVENT LISTENERS ───────────────────────────────────
const startBtn = document.getElementById('start-btn');
startBtn?.addEventListener('click', () => { audio.play(); });

controls.addEventListener('unlock', () => { audio.pause(); });

// =====================================================
// ANIMATE LOOP
// =====================================================
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (controls.isLocked) {
        updateControls(delta);
        updateCoords();
        updateInteraction(camera);

        // ← ONLY CHANGE in the loop:
        // Update which room is visible based on camera X position.
        // This is O(3) — negligible cost.
        roomManager.update(camera);
    }

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderMinimap();
}

animate();
