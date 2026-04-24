import * as THREE from 'three';
import { setupScene }       from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks }     from './modules/artworks.js';
import { setupControls }    from './modules/controls.js';
import { setupUI }          from './modules/ui.js';

const { scene, camera, renderer } = setupScene();

// Bật shadow cho renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const { collidableWalls } = setupEnvironment(scene);

loadArtworks(scene);
setupUI();

const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateControls(delta);
    renderer.render(scene, camera);
}
animate();
