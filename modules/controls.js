import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, renderer, collidableWalls = []) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    const movement = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false
    };

    // --- Cấu hình vật lý cho Nhảy & Trọng lực ---
    let velocityY = 0; 
    const gravity = 30.0;        
    const jumpForce = 10.0;      
    const playerHeight = 1.6;    
    let canJump = false;         

    // CẤU HÌNH RAYCASTER CHO VA CHẠM
    const raycaster = new THREE.Raycaster();
    const playerRadius = 1.0; // Bán kính cơ thể: Tăng lên 1.2 hoặc 1.5 nếu vẫn lọt tường

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

    // Bắt sự kiện phím
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = true; break;
            case 'KeyS': movement.backward = true; break;
            case 'KeyA': movement.left = true; break;
            case 'KeyD': movement.right = true; break;
            case 'ShiftLeft':
            case 'ShiftRight': movement.sprint = true; break;
            case 'Space':
                if (canJump === true) {
                    velocityY = jumpForce; 
                    canJump = false;       
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = false; break;
            case 'KeyS': movement.backward = false; break;
            case 'KeyA': movement.left = false; break;
            case 'KeyD': movement.right = false; break;
            case 'ShiftLeft':
            case 'ShiftRight': movement.sprint = false; break;
        }
    });

    // Các vector 8 hướng để tạo thành "lá chắn" quanh người chơi
    const directions = [
        new THREE.Vector3(1, 0, 0),   // Phải
        new THREE.Vector3(-1, 0, 0),  // Trái
        new THREE.Vector3(0, 0, 1),   // Lùi
        new THREE.Vector3(0, 0, -1),  // Tiến
        new THREE.Vector3(0.707, 0, 0.707),   // Chéo
        new THREE.Vector3(-0.707, 0, 0.707),  // Chéo
        new THREE.Vector3(0.707, 0, -0.707),  // Chéo
        new THREE.Vector3(-0.707, 0, -0.707)  // Chéo
    ];

    function update(delta) {
        if (!controls.isLocked) return;

        const speed = movement.sprint ? 10.0 : 5.0;
        const actualMoveSpeed = speed * delta;

        // 1. LƯU LẠI VỊ TRÍ CŨ TRƯỚC KHI BƯỚC ĐI
        const oldX = camera.position.x;
        const oldZ = camera.position.z;

        // 2. THỰC HIỆN BƯỚC ĐI
        if (movement.forward) controls.moveForward(actualMoveSpeed);
        if (movement.backward) controls.moveForward(-actualMoveSpeed);
        if (movement.left) controls.moveRight(-actualMoveSpeed);
        if (movement.right) controls.moveRight(actualMoveSpeed);

        // 3. KIỂM TRA VA CHẠM TẠI VỊ TRÍ MỚI
        if (collidableWalls && collidableWalls.length > 0) {
            // Lấy tâm bắn tia là vị trí mới, hạ xuống ngang hông (0.8m)
            const origin = camera.position.clone();
            origin.y = playerHeight / 2; 

            let isHit = false;

            // Quét 8 tia xung quanh người
            for (let i = 0; i < directions.length; i++) {
                raycaster.set(origin, directions[i]);
                const intersects = raycaster.intersectObjects(collidableWalls, false);
                
                // Nếu có tường cản và cự ly nhỏ hơn bán kính cơ thể -> Chạm tường
                if (intersects.length > 0 && intersects[0].distance < playerRadius) {
                    isHit = true;
                    break; 
                }
            }

            // 4. NẾU CHẠM TƯỜNG -> DỊCH CHUYỂN NGƯỢC LẠI VỊ TRÍ CŨ
            if (isHit) {
                camera.position.x = oldX;
                camera.position.z = oldZ;
            }
        } else {
            // Nếu bạn thấy dòng này hiện trong Console (F12), nghĩa là main.js truyền mảng bị sai
            console.warn("CẢNH BÁO: Mảng collidableWalls đang trống!");
        }

        // --- Cập nhật Nhảy và Trọng lực ---
        velocityY -= gravity * delta;             
        camera.position.y += velocityY * delta;   

        // Chốt chặt chân trên mặt đất
        if (camera.position.y <= playerHeight) {
            camera.position.y = playerHeight; 
            velocityY = 0;                    
            canJump = true;                   
        }
    }

    return { controls, update };
}