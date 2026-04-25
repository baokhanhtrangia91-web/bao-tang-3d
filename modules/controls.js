import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, renderer, collidableWalls = []) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    const movement = {
        forward:  false, backward: false,
        left:     false, right:    false,
        sprint:   false, zoom:     false, crouch:   false,
    };

    let velocityY = 0;
    let canJump   = false;
    const GRAVITY    = 30.0;
    const JUMP_FORCE = 10.0;

    const HEIGHT_STAND  = 2.9;
    const HEIGHT_CROUCH = 1.45;
    const CROUCH_SPEED  = 10.0;
    let currentHeight   = HEIGHT_STAND;

    const FOV_DEFAULT = camera.fov || 75;
    const FOV_ZOOM    = 30;
    const ZOOM_SPEED  = 15.0;

    const raycaster    = new THREE.Raycaster();
    const PLAYER_RADIUS = 0.8;

    // FIX LỖI XUYÊN GÓC: Khôi phục 8 hướng quét (có thêm 4 tia chéo 45 độ)
    const COLLISION_DIRS = [
        new THREE.Vector3( 1, 0,  0),
        new THREE.Vector3(-1, 0,  0),
        new THREE.Vector3( 0, 0,  1),
        new THREE.Vector3( 0, 0, -1),
        new THREE.Vector3( 0.7071, 0,  0.7071),
        new THREE.Vector3(-0.7071, 0,  0.7071),
        new THREE.Vector3( 0.7071, 0, -0.7071),
        new THREE.Vector3(-0.7071, 0, -0.7071),
    ];

    camera.position.y = HEIGHT_STAND;

    // --- UI ---
    const startBtn     = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');
    const crosshair    = document.getElementById('crosshair');
    const minimapDOM   = document.getElementById('minimap-container');
    const coordsDOM    = document.getElementById('coords-ui');

    startBtn?.addEventListener('click', () => controls.lock());

    controls.addEventListener('lock', () => {
        instructions?.classList.add('hidden');
        if (crosshair)  crosshair.style.display  = 'block';
        if (minimapDOM) minimapDOM.style.display  = 'block';
        if (coordsDOM)  coordsDOM.style.display   = 'block';
    });

    controls.addEventListener('unlock', () => {
        instructions?.classList.remove('hidden');
        if (crosshair)  crosshair.style.display  = 'none';
        if (minimapDOM) minimapDOM.style.display  = 'none';
        if (coordsDOM)  coordsDOM.style.display   = 'none';
    });

    // --- Phím điều khiển ---
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW':         movement.forward  = true;  break;
            case 'KeyS':         movement.backward = true;  break;
            case 'KeyA':         movement.left     = true;  break;
            case 'KeyD':         movement.right    = true;  break;
            case 'KeyZ':         movement.zoom     = true;  break;
            case 'ShiftLeft':
            case 'ShiftRight':   movement.sprint   = true;  break;
            case 'ControlLeft':
            case 'ControlRight': movement.crouch   = true;  break;
            case 'Space':
                if (canJump && !movement.crouch) {
                    velocityY = JUMP_FORCE;
                    canJump   = false;
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW':         movement.forward  = false; break;
            case 'KeyS':         movement.backward = false; break;
            case 'KeyA':         movement.left     = false; break;
            case 'KeyD':         movement.right    = false; break;
            case 'KeyZ':         movement.zoom     = false; break;
            case 'ShiftLeft':
            case 'ShiftRight':   movement.sprint   = false; break;
            case 'ControlLeft':
            case 'ControlRight': movement.crouch   = false; break;
        }
    });

    // --- Vòng lặp update ---
    function update(delta) {
        if (!controls.isLocked) return;

        const speed = movement.crouch ? 2.5 : movement.sprint ? 10.0 : 5.0;
        const step  = speed * delta;

        if (movement.forward)  controls.moveForward(step);
        if (movement.backward) controls.moveForward(-step);
        if (movement.left)     controls.moveRight(-step);
        if (movement.right)    controls.moveRight(step);

        const targetFov = movement.zoom ? FOV_ZOOM : FOV_DEFAULT;
        if (Math.abs(camera.fov - targetFov) > 0.1) {
            camera.fov += (targetFov - camera.fov) * ZOOM_SPEED * delta;
            camera.updateProjectionMatrix();
        }

        const targetHeight = movement.crouch ? HEIGHT_CROUCH : HEIGHT_STAND;
        if (Math.abs(currentHeight - targetHeight) > 0.01) {
            currentHeight += (targetHeight - currentHeight) * CROUCH_SPEED * delta;
        }

        // --- VẬT LÝ VA CHẠM SLIDE KÍN KẼ ---
        if (collidableWalls.length > 0) {
            const origin = camera.position.clone();
            origin.y = currentHeight / 2;

            for (const dir of COLLISION_DIRS) {
                raycaster.set(origin, dir);
                
                // CẮT GIẢM TÍNH TOÁN: Chỉ quét trong bán kính của người chơi, xa hơn bỏ qua
                raycaster.far = PLAYER_RADIUS; 
                
                const hits = raycaster.intersectObjects(collidableWalls, false);

                if (hits.length > 0) {
                    // hits[0].distance chắc chắn < PLAYER_RADIUS do đã set raycaster.far
                    const overlap = PLAYER_RADIUS - hits[0].distance;
                    
                    camera.position.x -= dir.x * overlap;
                    camera.position.z -= dir.z * overlap;
                    
                    // Cập nhật lại tâm ngay lập tức để góc chéo không bị cấn
                    origin.x = camera.position.x;
                    origin.z = camera.position.z;
                }
            }
        }

        velocityY -= GRAVITY * delta;
        camera.position.y += velocityY * delta;

        if (camera.position.y <= currentHeight) {
            camera.position.y = currentHeight;
            velocityY = 0;
            canJump   = true;
        }
    }

    return { controls, update };
}