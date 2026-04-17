import { scene, camera, renderer } from './modules/scene.js';
import { createEnvironment } from './modules/environment.js';
import { loadArtworks } from './modules/artworks.js';
import { initControls } from './modules/controls.js';

// 1. Chạy môi trường
createEnvironment(scene);
loadArtworks(scene);

// 2. Chạy điều khiển
const controls = initControls(camera, renderer);

// 3. Xử lý nút Start (Giao nhiệm vụ cho Người 4)
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'none';
    controls.lock(); // Khóa chuột để bắt đầu đi bộ
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();