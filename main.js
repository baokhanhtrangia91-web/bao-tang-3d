import * as THREE from 'three';
import { setupScene }       from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks }     from './modules/artworks.js';
import { setupControls }    from './modules/controls.js';
import { setupUI }          from './modules/ui.js';

const { scene, camera, renderer } = setupScene();
const { collidableWalls } = setupEnvironment(scene);

loadArtworks(scene);
setupUI();

const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

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
    renderer.render(scene, camera);
}
animate();