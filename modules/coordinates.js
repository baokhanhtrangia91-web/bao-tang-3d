// File: modules/coordinates.js

export function setupCoordinates(camera) {
    const coordsDOM = document.getElementById('coords-ui');

    function update() {
        // Nếu UI đang bị ẩn thì không cần tốn tài nguyên update
        if (!coordsDOM || coordsDOM.style.display === 'none') return;
        
        // Lấy tọa độ và làm tròn 2 chữ số thập phân
        const x = camera.position.x.toFixed(2);
        const y = camera.position.y.toFixed(2);
        const z = camera.position.z.toFixed(2);
        
        coordsDOM.innerHTML = `X: ${x} &nbsp;|&nbsp; Y: ${y} &nbsp;|&nbsp; Z: ${z}`;
    }

    return { update };
}