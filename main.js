import { setupScene } from './modules/scene.js';
import { setupEnvironment } from './modules/environment.js';
import { loadArtworks } from './modules/artworks.js';
import { setupControls } from './modules/controls.js';
import { setupUI } from './modules/ui.js';

const { scene, camera, renderer } = setupScene();

// Gọi hàm của tụi nó (Dù tụi nó chưa viết gì thì web vẫn chạy khung rỗng)
setupEnvironment(scene, camera);
loadArtworks(scene);
setupUI();

const controls = setupControls(camera, renderer);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();