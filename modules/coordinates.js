export function setupCoordinates(camera) {
    const coordsDOM = document.getElementById('coords-ui');

    function update() {
        if (!coordsDOM || coordsDOM.style.display === 'none') return;

        const x = camera.position.x.toFixed(2);
        const y = camera.position.y.toFixed(2);
        const z = camera.position.z.toFixed(2);

        coordsDOM.innerHTML = `X: ${x} &nbsp;|&nbsp; Y: ${y} &nbsp;|&nbsp; Z: ${z}`;
    }

    return { update };
}