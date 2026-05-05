// =====================================================
// roomManager.js
// Manages which room is visible based on camera position.
// Each room is a THREE.Group. Only 1 room (+ shared) is
// visible per frame, drastically reducing draw calls.
// =====================================================

import * as THREE from 'three';

// ── ROOM BOUNDARY DEFINITIONS ────────────────────────
// Adjust these AABB boxes to match your actual geometry.
// Use coordinates.js (F3 overlay) to find exact positions.
//
//  Room 1 (Michelangelo) : Left wing, X < -14
//  Room 2 (Center Hall)  : Center corridor, -14 ≤ X ≤ 14
//  Room 3 (Van Gogh/Da Vinci) : Right wing, X > 14
// ──────────────────────────────────────────────────────
const ROOM_BOUNDS = [
    // Room 1: Left wing  (x: -40 → -14,  z: -30 → 30)
    new THREE.Box3(
        new THREE.Vector3(-40, 0, -30),
        new THREE.Vector3(-14,  16,  30)
    ),
    // Room 2: Central hall (x: -14 → 14,  z: -30 → 30)
    new THREE.Box3(
        new THREE.Vector3(-14, 0, -30),
        new THREE.Vector3( 14, 16,  30)
    ),
    // Room 3: Right wing  (x: 14 → 40,  z: -30 → 30)
    new THREE.Box3(
        new THREE.Vector3(14, 0, -30),
        new THREE.Vector3(40, 16,  30)
    ),
];

// Reused scratch vector — avoids a new Vector3 each frame
const _camPoint = new THREE.Vector3();

/**
 * createRoomManager(rooms, sharedGroup)
 *
 * @param {THREE.Group[]} rooms        - Array of 3 room Groups [room1, room2, room3]
 * @param {THREE.Group}   sharedGroup  - Objects always visible (floor, ceiling, ambient lights)
 * @returns {{ update(camera): void, currentRoom: number }}
 */
export function createRoomManager(rooms, sharedGroup) {
    // Start with all rooms hidden; update() will reveal the correct one on first call
    rooms.forEach(r => { r.visible = false; });
    sharedGroup.visible = true;

    let currentRoom = -1; // index of the currently visible room (-1 = unset)

    /**
     * Call this every frame inside animate().
     * It is O(3) – three AABB containment tests.
     */
    function update(camera) {
        _camPoint.copy(camera.position);
        _camPoint.y = 1; // flatten to floor level so the test is 2-D-ish

        let found = -1;
        for (let i = 0; i < ROOM_BOUNDS.length; i++) {
            if (ROOM_BOUNDS[i].containsPoint(_camPoint)) {
                found = i;
                break;
            }
        }

        // Fallback: if player is somehow between rooms (archways, etc.)
        // keep the last known room visible rather than blanking everything.
        if (found === -1) found = currentRoom === -1 ? 0 : currentRoom;

        if (found !== currentRoom) {
            // Hide old room
            if (currentRoom !== -1) rooms[currentRoom].visible = false;
            // Show new room
            rooms[found].visible = true;
            currentRoom = found;
            console.debug(`[RoomManager] Entered room ${found + 1}`);
        }
    }

    return { update, get currentRoom() { return currentRoom; } };
}
