import * as THREE from 'three';
import { setupScene }       from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks }     from './modules/artworks.js';
import { setupControls }    from './modules/controls.js';
import { setupUI }          from './modules/ui.js';
import { setupCoordinates } from './modules/coordinates.js';

const { scene, camera, renderer } = setupScene();
const { collidableWalls } = setupEnvironment(scene);

loadArtworks(scene);
setupUI();

const { update: updateControls } = setupControls(camera, renderer, collidableWalls);

const { update: updateCoords } = setupCoordinates(camera);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateControls(delta);
    updateCoords();
    renderer.render(scene, camera);
}
animate();
