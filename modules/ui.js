import * as THREE from 'three';
import { interactableObjects } from './artworks.js';

const INTERACTION_DIST = 6;

export function setupUI() {
    const artUI    = document.getElementById('art-description');
    const artTitle = document.getElementById('art-title');
    const artText  = document.getElementById('art-text');
    const artAudio = document.getElementById('art-audio');
    if (artAudio) artAudio.volume = 0.3;

    const subtitleContainer = document.getElementById('subtitle-container');
    const subtitleText      = document.getElementById('subtitle-text');

    let currentSubtitles = null;
    let hoveredObj       = null;
    let isInfoShowing    = false;
    let playingAudioUrl  = '';

    // Tooltip nhắc tương tác
    const promptUI = (() => {
        const el = document.createElement('div');
        Object.assign(el.style, {
            position: 'absolute', top: '55%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff', background: 'rgba(0,0,0,0.6)',
            padding: '8px 16px', border: '1px solid #d4af37',
            borderRadius: '6px', fontFamily: 'sans-serif',
            fontSize: '15px', pointerEvents: 'none',
            display: 'none', zIndex: '10',
        });
        document.body.appendChild(el);
        return el;
    })();

    // --- Audio & phụ đề ---
    if (artAudio) {
        artAudio.addEventListener('timeupdate', () => {
            if (!currentSubtitles || !currentSubtitles.length) return;
            const time = artAudio.currentTime;
            const sub  = currentSubtitles.find(s => time >= s.start && time <= s.end);
            if (sub) {
                subtitleText.innerHTML  = sub.text;
                subtitleText.style.display = 'inline-block';
            } else {
                subtitleText.style.display = 'none';
            }
        });

        artAudio.addEventListener('ended', () => {
            subtitleContainer.style.display = 'none';
            playingAudioUrl  = '';
            currentSubtitles = null;
        });
    }

    function stopAudio() {
        if (artAudio) { artAudio.pause(); artAudio.currentTime = 0; }
        if (subtitleContainer) subtitleContainer.style.display = 'none';
        playingAudioUrl  = '';
        currentSubtitles = null;
    }

    function toggleAudioPlayback(audioData) {
        if (!audioData?.url) return;
        if (playingAudioUrl === audioData.url && !artAudio.paused) { stopAudio(); return; }
        stopAudio();
        playingAudioUrl      = audioData.url;
        artAudio.src         = audioData.url;
        currentSubtitles     = audioData.subtitles || [];
        subtitleContainer.style.display = 'block';
        subtitleText.style.display      = 'none';
        artAudio.play().catch(e => console.log(e));
    }

    function showArtInfo(title, desc) {
        if (!artUI) return;
        if (artTitle) artTitle.textContent = title;
        if (artText)  artText.textContent  = desc;
        artUI.style.display = 'block';
        isInfoShowing       = true;
        promptUI.style.display = 'none';
    }

    function hideArtInfo() {
        if (artUI) artUI.style.display = 'none';
        isInfoShowing = false;
    }

    // Phím E
    document.addEventListener('keydown', (e) => {
        if (e.code !== 'KeyE' || !hoveredObj) return;
        if (hoveredObj.userData.isArt) {
            isInfoShowing ? (hideArtInfo(), promptUI.style.display = 'block')
                          : showArtInfo(hoveredObj.userData.title, hoveredObj.userData.desc);
        } else if (hoveredObj.userData.isAudioButton) {
            toggleAudioPlayback(hoveredObj.userData.audioData);
        }
    });

    // Raycaster — reuse vector
    const raycaster    = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);

    function updateInteraction(camera) {
        if (!camera) return;
        raycaster.setFromCamera(screenCenter, camera);
        const hits = raycaster.intersectObjects(interactableObjects, false);

        if (hits.length > 0 && hits[0].distance < INTERACTION_DIST) {
            const obj = hits[0].object;
            if (obj !== hoveredObj) {
                hideArtInfo();
                hoveredObj = obj;
                if (obj.userData.isArt) {
                    promptUI.innerHTML     = 'Nhấn <b>[E]</b> để đọc thông tin';
                    promptUI.style.display = 'block';
                } else if (obj.userData.isAudioButton) {
                    promptUI.innerHTML     = 'Nhấn <b>[E]</b> để Bật/Tắt Thuyết Minh';
                    promptUI.style.display = 'block';
                }
            }
        } else if (hoveredObj !== null) {
            hoveredObj             = null;
            promptUI.style.display = 'none';
            hideArtInfo();
        }
    }

    return { showArtInfo, hideArtInfo, updateInteraction };
}
