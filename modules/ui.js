export function setupUI() {
    const instructions = document.getElementById('instructions');
    const crosshair    = document.getElementById('crosshair');
    const artUI        = document.getElementById('art-description');
    const artTitle     = document.getElementById('art-title');
    const artText      = document.getElementById('art-text');
    const mediaBtn     = document.getElementById('media-btn');
    const artVideo     = document.getElementById('art-video');
    const artAudio     = document.getElementById('art-audio');

    function stopAllMedia() {
        if (artVideo) {
            artVideo.pause();
            artVideo.src = '';
            artVideo.style.display = 'none';
        }
        if (artAudio) {
            artAudio.pause();
            artAudio.src = '';
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

    function showArtInfo(title, desc, mediaUrl, mediaType) {
        if (!artUI) return;
        if (artTitle) artTitle.textContent = title;
        if (artText)  artText.textContent  = desc;

        if (mediaBtn) {
            if (mediaUrl && mediaType !== 'none') {
                mediaBtn.style.display = 'inline-block';
                mediaBtn.onclick = () => playMedia(mediaUrl, mediaType);
            } else {
                mediaBtn.style.display = 'none';
            }
        }

        artUI.style.display = 'block';
    }

    function hideArtInfo() {
        stopAllMedia();
        if (artUI) artUI.style.display = 'none';
    }

    return {
        instructions, crosshair,
        artUI, artTitle, artText, mediaBtn,
        showArtInfo, hideArtInfo,
        stopAllMedia, playMedia,
    };
}
