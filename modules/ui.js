export function setupUI() {
    const instructions = document.getElementById('instructions');
    const hudStatus = document.getElementById('status');
    const hudPos = document.getElementById('pos');
    const crosshair = document.getElementById('crosshair');
    const artUI = document.getElementById('art-description');
    const artTitle = document.getElementById('art-title');
    const artText = document.getElementById('art-text');
    const mediaBtn = document.getElementById('media-btn');
    const artVideo = document.getElementById('art-video');
    const artAudio = document.getElementById('art-audio');

    function stopAllMedia() {
        if (artVideo) {
            artVideo.pause();
            artVideo.src = "";
            artVideo.style.display = 'none';
        }
        if (artAudio) {
            artAudio.pause();
            artAudio.src = "";
        }
    }

    function playMedia(url, type) {
        stopAllMedia();
        if (type === 'video' && artVideo) {
            artVideo.src = url;
            artVideo.style.display = 'block';
            artVideo.play();
        } else if (type === 'audio' && artAudio) {
            artAudio.src = url;
            artAudio.play();
        }
    }

    return { 
        instructions, hudStatus, hudPos, crosshair, 
        artUI, artTitle, artText, mediaBtn, 
        stopAllMedia, playMedia 
    };
}