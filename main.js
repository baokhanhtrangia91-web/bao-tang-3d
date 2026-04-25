import * as THREE from 'three';
import { setupScene }       from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks }     from './modules/artworks.js';
import { setupControls }    from './modules/controls.js';
import { setupUI }          from './modules/ui.js';
import { setupCoordinates } from './modules/coordinates.js';
import { setupMinimap }     from './modules/minimap.js';
import { setupScreenshot }  from './modules/screenshot.js';

const { scene, camera, renderer } = setupScene();
const { collidableWalls }         = setupEnvironment(scene);
const { renderMinimap }           = setupMinimap(scene, renderer, camera);

setupScreenshot(renderer, scene, camera);
loadArtworks(scene);

const { update: updateControls }   = setupControls(camera, renderer, collidableWalls);
const { update: updateCoords }     = setupCoordinates(camera);
const { updateInteraction }        = setupUI();

const instructions = document.getElementById('instructions');

function startExperience() {
    instructions.classList.add('hidden');
    renderer.domElement.requestPointerLock?.();
}

function handleExit() {
    if (!document.pointerLockElement) {
        instructions.classList.remove('hidden');
    }
}

document.addEventListener('pointerlockchange', handleExit);
document.addEventListener('keydown', startExperience);
document.addEventListener('click', startExperience);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    updateControls(delta);
    updateCoords();
    updateInteraction(camera);

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderMinimap();
}

animate();