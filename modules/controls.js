import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export function setupControls(camera, renderer) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    // Thêm trạng thái sprint vào movement
    const movement = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false
    };

    // --- Cấu hình vật lý cho Nhảy & Trọng lực ---
    let velocityY = 0; 
    const gravity = 30.0;        // Lực hút kéo xuống
    const jumpForce = 12.0;      // Sức bật khi nhảy
    const playerHeight = 1.6;    // Chiều cao mắt người (camera)
    let canJump = false;         // Cờ kiểm tra xem có đang ở trên mặt đất không

    // Đặt vị trí Y ban đầu cho camera
    camera.position.y = playerHeight;

    // Các element UI
    const startBtn = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');
    const crosshair = document.getElementById('crosshair');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            controls.lock();
        });
    }

    controls.addEventListener('lock', () => {
        if (instructions) instructions.classList.add('hidden');
        if (crosshair) crosshair.style.display = 'block';
    });

    controls.addEventListener('unlock', () => {
        if (instructions) instructions.classList.remove('hidden');
        if (crosshair) crosshair.style.display = 'none';
    });

    // Bắt sự kiện nhấn phím
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = true; break;
            case 'KeyS': movement.backward = true; break;
            case 'KeyA': movement.left = true; break;
            case 'KeyD': movement.right = true; break;
            
            // Nhấn Shift để chạy
            case 'ShiftLeft':
            case 'ShiftRight':
                movement.sprint = true; break;
                
            // Nhấn Space để nhảy
            case 'Space':
                if (canJump === true) {
                    velocityY = jumpForce; // Cung cấp lực đẩy lên
                    canJump = false;       // Đang ở trên không nên không thể nhảy tiếp
                }
                break;
        }
    });

    // Bắt sự kiện nhả phím
    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = false; break;
            case 'KeyS': movement.backward = false; break;
            case 'KeyA': movement.left = false; break;
            case 'KeyD': movement.right = false; break;
            
            // Nhả Shift thì ngừng chạy nhanh
            case 'ShiftLeft':
            case 'ShiftRight':
                movement.sprint = false; break;
        }
    });

    function update(delta) {
        if (!controls.isLocked) return;

        // 1. Cập nhật di chuyển ngang (X, Z)
        // Nếu nhấn Shift thì tốc độ là 12, đi bộ bình thường là 5
        const speed = movement.sprint ? 12.0 : 5.0;

        if (movement.forward)  controls.moveForward(speed * delta);
        if (movement.backward) controls.moveForward(-speed * delta);
        if (movement.left)     controls.moveRight(-speed * delta);
        if (movement.right)    controls.moveRight(speed * delta);

        // 2. Cập nhật di chuyển dọc (Y) cho Nhảy và Trọng lực
        velocityY -= gravity * delta;             // Trọng lực kéo velocityY xuống dần đều theo thời gian
        camera.position.y += velocityY * delta;   // Áp dụng vận tốc Y vào vị trí camera

        // 3. Xử lý va chạm với mặt đất
        if (camera.position.y <= playerHeight) {
            camera.position.y = playerHeight; // Chốt chặt ở mặt đất
            velocityY = 0;                    // Dừng rơi
            canJump = true;                   // Chạm đất rồi thì được nhảy lại
        }
    }

    return { controls, update };
}