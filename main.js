import * as THREE from 'three';
import { setupScene }       from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks }     from './modules/artworks.js';
import { setupControls }    from './modules/controls.js';
import { setupUI }          from './modules/ui.js';

const { scene, camera, renderer } = setupScene();
const { collidableWalls } = setupEnvironment(scene);

setupEnvironment(scene);   // FIX: truyền đúng tham số (chỉ scene)
loadArtworks(scene);
setupUI();

const { controls, update: updateControls } = setupControls(camera, renderer, collidableWalls);

// Clock để tính delta time chính xác
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();  // FIX: cung cấp delta time cho controls
    updateControls(delta);
    renderer.render(scene, camera);
}
animate();
