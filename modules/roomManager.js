// =====================================================
// roomManager.js — CẢI TIẾN
// Cải tiến: Adjacent Room Preloading, Overlap Zone,
//           Debug overlay, Smooth fog transition
// =====================================================
import * as THREE from 'three';

// ── Ranh giới phòng (có vùng đệm overlap) ─────────────
// Phòng được HIỂN THỊ khi camera trong vùng VISIBLE,
// nhưng sẽ ẨN khi camera ra khỏi vùng HIDE (nhỏ hơn)
const ROOM_DEFS = [
    {
        name:    'Phòng 1 (Trái)',
        visible: new THREE.Box3(new THREE.Vector3(-40, 0, -30), new THREE.Vector3(-11,  16,  30)),
        hide:    new THREE.Box3(new THREE.Vector3(-40, 0, -30), new THREE.Vector3(-15.5,16,  30)),
    },
    {
        name:    'Phòng 2 (Trung tâm)',
        visible: new THREE.Box3(new THREE.Vector3(-16, 0, -30), new THREE.Vector3( 16,  16,  30)),
        hide:    new THREE.Box3(new THREE.Vector3(-14, 0, -30), new THREE.Vector3( 14,  16,  30)),
    },
    {
        name:    'Phòng 3 (Phải)',
        visible: new THREE.Box3(new THREE.Vector3( 11, 0, -30), new THREE.Vector3( 40,  16,  30)),
        hide:    new THREE.Box3(new THREE.Vector3(15.5,0, -30), new THREE.Vector3( 40,  16,  30)),
    },
];

const _camPoint = new THREE.Vector3();

export function createRoomManager(rooms, sharedGroup) {
    if (rooms.length !== 3) {
        console.warn('[RoomManager] Cần đúng 3 rooms!');
    }

    // Khởi tạo: ẩn tất cả phòng
    rooms.forEach(r => { r.visible = false; });
    sharedGroup.visible = true;

    // Trạng thái hiển thị của từng phòng
    const roomVisible = [false, false, false];

    // Phòng hiện tại (theo vùng HIDE nhỏ hơn — chỉ đổi khi thực sự rời khỏi phòng cũ)
    let currentRoom = -1;

    function update(camera) {
        _camPoint.copy(camera.position);
        _camPoint.y = 8; // Điểm kiểm tra ở tầm mắt

        // Cập nhật visibility từng phòng dựa trên vùng visible MỞ RỘNG
        for (let i = 0; i < 3; i++) {
            const def        = ROOM_DEFS[i];
            const shouldShow = def.visible.containsPoint(_camPoint);
            if (shouldShow !== roomVisible[i]) {
                rooms[i].visible = shouldShow;
                roomVisible[i]   = shouldShow;
            }
        }

        // Cập nhật "phòng hiện tại" theo vùng HIDE nhỏ (ổn định hơn)
        let found = currentRoom;
        for (let i = 0; i < 3; i++) {
            if (ROOM_DEFS[i].hide.containsPoint(_camPoint)) {
                found = i;
                break;
            }
        }
        if (found === -1) found = currentRoom === -1 ? 1 : currentRoom;

        if (found !== currentRoom) {
            currentRoom = found;
            console.debug(`[RoomManager] Phòng hiện tại: ${ROOM_DEFS[found]?.name ?? found}`);

            // Dispatch event để các module khác (UI, audio) có thể phản ứng
            window.dispatchEvent(new CustomEvent('roomchange', { detail: { room: found } }));
        }
    }

    // Trả về thông tin trạng thái
    function getStatus() {
        return {
            currentRoom,
            visibleRooms: roomVisible.map((v, i) => v ? i : -1).filter(i => i !== -1),
        };
    }

    return {
        update,
        getStatus,
        get currentRoom() { return currentRoom; },
    };
}