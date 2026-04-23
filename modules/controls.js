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
    };

    let velocityY   = 0;
    const gravity     = 30.0;
    const jumpForce   = 10.0;
    const playerHeight = 2.5;
    let canJump = false;

    const raycaster    = new THREE.Raycaster();
    const playerRadius = 1.0;

    camera.position.y = playerHeight;

    // --- UI 元素 ---
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
            case 'ShiftLeft':
            case 'ShiftRight': movement.sprint  = true;  break;
            case 'Space':
                if (canJump) { velocityY = jumpForce; canJump = false; }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW':      movement.forward  = false; break;
            case 'KeyS':      movement.backward = false; break;
            case 'KeyA':      movement.left     = false; break;
            case 'KeyD':      movement.right    = false; break;
            case 'ShiftLeft':
            case 'ShiftRight': movement.sprint  = false; break;
        }
    });

    // 8 hướng để phát hiện va chạm tường
    const directions = [
        new THREE.Vector3( 1,     0,  0),
        new THREE.Vector3(-1,     0,  0),
        new THREE.Vector3( 0,     0,  1),
        new THREE.Vector3( 0,     0, -1),
        new THREE.Vector3( 0.707, 0,  0.707),
        new THREE.Vector3(-0.707, 0,  0.707),
        new THREE.Vector3( 0.707, 0, -0.707),
        new THREE.Vector3(-0.707, 0, -0.707),
    ];

    function update(delta) {
        if (!controls.isLocked) return;

        const speed = movement.sprint ? 10.0 : 5.0;
        const step  = speed * delta;

        const oldX = camera.position.x;
        const oldZ = camera.position.z;

        if (movement.forward)  controls.moveForward(step);
        if (movement.backward) controls.moveForward(-step);
        if (movement.left)     controls.moveRight(-step);
        if (movement.right)    controls.moveRight(step);

        // Kiểm tra va chạm
        if (collidableWalls.length > 0) {
            const origin = camera.position.clone();
            origin.y = playerHeight / 2;

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

        if (camera.position.y <= playerHeight) {
            camera.position.y = playerHeight;
            velocityY = 0;
            canJump = true;
        }
    }

    return { controls, update };
}
