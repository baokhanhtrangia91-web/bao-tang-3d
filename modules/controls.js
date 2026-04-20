import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export function initControls(camera, renderer) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    // trạng thái di chuyển
    const movement = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };

    // click để lock chuột
    document.addEventListener('click', () => {
        controls.lock();
    });

    // nhấn phím
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = true; break;
            case 'KeyS': movement.backward = true; break;
            case 'KeyA': movement.left = true; break;
            case 'KeyD': movement.right = true; break;
        }
    });

    // nhả phím
    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': movement.forward = false; break;
            case 'KeyS': movement.backward = false; break;
            case 'KeyA': movement.left = false; break;
            case 'KeyD': movement.right = false; break;
        }
    });

    // update mỗi frame
    function update(delta) {
        const speed = 5.0;

        if (movement.forward) controls.moveForward(speed * delta);
        if (movement.backward) controls.moveForward(-speed * delta);
        if (movement.left) controls.moveRight(-speed * delta);
        if (movement.right) controls.moveRight(speed * delta);
    }

    return {
        controls,
        update
    };
}