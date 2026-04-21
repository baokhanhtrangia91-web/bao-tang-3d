import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Đổi tên thành setupControls để khớp với main.js
export function setupControls(camera, renderer) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    const movement = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };

    // Nút "Khám phá ngay" → lock chuột và ẩn màn hình chào
    const startBtn = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');
    const crosshair = document.getElementById('crosshair');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            controls.lock();
        });
    }

    // Khi chuột được lock → ẩn instructions, hiện crosshair
    controls.addEventListener('lock', () => {
        if (instructions) instructions.classList.add('hidden');
        if (crosshair) crosshair.style.display = 'block';
    });

    // Khi nhấn ESC → hiện lại instructions
    controls.addEventListener('unlock', () => {
        if (instructions) instructions.classList.remove('hidden');
        if (crosshair) crosshair.style.display = 'none';
    });

    // Nhấn phím
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = true; break;
            case 'KeyS': movement.backward = true; break;
            case 'KeyA': movement.left = true; break;
            case 'KeyD': movement.right = true; break;
        }
    });

    // Nhả phím
    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = false; break;
            case 'KeyS': movement.backward = false; break;
            case 'KeyA': movement.left = false; break;
            case 'KeyD': movement.right = false; break;
        }
    });

    // Gọi mỗi frame từ main.js với giá trị delta thời gian
    function update(delta) {
        if (!controls.isLocked) return;
        const speed = 5.0;
        if (movement.forward)  controls.moveForward(speed * delta);
        if (movement.backward) controls.moveForward(-speed * delta);
        if (movement.left)     controls.moveRight(-speed * delta);
        if (movement.right)    controls.moveRight(speed * delta);
    }

    return { controls, update };
}