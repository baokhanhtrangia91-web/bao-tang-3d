import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, renderer, collidableWalls = []) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    const movement = {
        forward:  false,
        backward: false,
        left:     false,
        right:    false,
        sprint:   false,
        zoom:     false,
        crouch:   false, // <-- 1. Thêm trạng thái ngồi
    };

    let velocityY   = 0;
    const gravity     = 30.0;
    const jumpForce   = 10.0;
    
    // --- 2. Cấu hình chiều cao ---
    const standingHeight = 2.4; // Chiều cao mặc định khi đứng
    const crouchingHeight = 1.2; // Chiều cao khi ngồi
    let currentHeight = standingHeight;
    const crouchSpeed = 10.0; // Tốc độ chuyển đổi đứng/ngồi
    
    let canJump = false;

    // --- Cấu hình Zoom ---
    const defaultFov = camera.fov || 75;
    const zoomFov = 30;                  
    const zoomSpeed = 15.0;              

    const raycaster    = new THREE.Raycaster();
    const playerRadius = 1.0;

    camera.position.y = standingHeight;

    // --- UI  ---
    const startBtn    = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');
    const crosshair   = document.getElementById('crosshair');

    startBtn?.addEventListener('click', () => controls.lock());

    controls.addEventListener('lock', () => {
        instructions?.classList.add('hidden');
        if (crosshair) crosshair.style.display = 'block';
    });

    controls.addEventListener('unlock', () => {
        instructions?.classList.remove('hidden');
        if (crosshair) crosshair.style.display = 'none';
    });

    // --- Phím điều khiển ---
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW':      movement.forward  = true;  break;
            case 'KeyS':      movement.backward = true;  break;
            case 'KeyA':      movement.left     = true;  break;
            case 'KeyD':      movement.right    = true;  break;
            case 'KeyZ':      movement.zoom     = true;  break; 
            case 'ShiftLeft':
            case 'ShiftRight': movement.sprint  = true;  break;
            case 'ControlLeft':
            case 'ControlRight': movement.crouch = true;  break; // <-- 3. Nhấn Ctrl để ngồi
            case 'Space':
                // Chỉ cho phép nhảy khi đang đứng (không ngồi)
                if (canJump && !movement.crouch) { 
                    velocityY = jumpForce; 
                    canJump = false; 
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW':      movement.forward  = false; break;
            case 'KeyS':      movement.backward = false; break;
            case 'KeyA':      movement.left     = false; break;
            case 'KeyD':      movement.right    = false; break;
            case 'KeyZ':      movement.zoom     = false; break; 
            case 'ShiftLeft':
            case 'ShiftRight': movement.sprint  = false; break;
            case 'ControlLeft':
            case 'ControlRight': movement.crouch = false; break; // <-- Nhả Ctrl để đứng lên
        }
    });

    // 8 hướng để phát hiện va chạm tường
    const directions = [
        new THREE.Vector3( 1,    0,  0),
        new THREE.Vector3(-1,    0,  0),
        new THREE.Vector3( 0,    0,  1),
        new THREE.Vector3( 0,    0, -1),
        new THREE.Vector3( 0.707, 0,  0.707),
        new THREE.Vector3(-0.707, 0,  0.707),
        new THREE.Vector3( 0.707, 0, -0.707),
        new THREE.Vector3(-0.707, 0, -0.707),
    ];

    function update(delta) {
        if (!controls.isLocked) return;

        // --- 4. Chỉnh tốc độ tùy theo trạng thái ---
        let speed = 5.0; // Tốc độ đi bộ
        if (movement.crouch) {
            speed = 2.5; // Đi chậm khi ngồi
        } else if (movement.sprint) {
            speed = 10.0; // Chạy nhanh
        }
        const step = speed * delta;

        const oldX = camera.position.x;
        const oldZ = camera.position.z;

        if (movement.forward)  controls.moveForward(step);
        if (movement.backward) controls.moveForward(-step);
        if (movement.left)     controls.moveRight(-step);
        if (movement.right)    controls.moveRight(step);

        // --- Xử lý Zoom mượt ---
        const targetFov = movement.zoom ? zoomFov : defaultFov;
        if (Math.abs(camera.fov - targetFov) > 0.1) {
            camera.fov += (targetFov - camera.fov) * zoomSpeed * delta;
            camera.updateProjectionMatrix(); 
        }

        // --- 5. Xử lý Ngồi (Lerp chiều cao) ---
        const targetHeight = movement.crouch ? crouchingHeight : standingHeight;
        if (Math.abs(currentHeight - targetHeight) > 0.01) {
            currentHeight += (targetHeight - currentHeight) * crouchSpeed * delta;
        }

        // Kiểm tra va chạm (sử dụng currentHeight thay cho playerHeight tĩnh)
        if (collidableWalls.length > 0) {
            const origin = camera.position.clone();
            origin.y = currentHeight / 2;

            for (const dir of directions) {
                raycaster.set(origin, dir);
                const hits = raycaster.intersectObjects(collidableWalls, false);
                if (hits.length > 0 && hits[0].distance < playerRadius) {
                    camera.position.x = oldX;
                    camera.position.z = oldZ;
                    break;
                }
            }
        }

        // Trọng lực & nhảy
        velocityY -= gravity * delta;
        camera.position.y += velocityY * delta;

        // Chạm đất (Sử dụng currentHeight làm mốc mặt đất của nhân vật)
        if (camera.position.y <= currentHeight) {
            camera.position.y = currentHeight;
            velocityY = 0;
            canJump = true;
        }
    }

    return { controls, update };
}