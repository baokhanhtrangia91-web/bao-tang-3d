// =====================================================
// ui.js — NÂNG CẤP: CSS transition mượt, thiết kế sang hơn
// =====================================================
import * as THREE from 'three';
import { interactableObjects } from './artworks.js';

const INTERACTION_DIST = 6.5;

export function setupUI() {
    const artUI    = document.getElementById('art-description');
    const artTitle = document.getElementById('art-title');
    const artText  = document.getElementById('art-text');
    const artAudio = document.getElementById('art-audio');

    if (artAudio) artAudio.volume = 1;

    const subtitleContainer = document.getElementById('subtitle-container');
    const subtitleText      = document.getElementById('subtitle-text');

    let currentSubtitles = null;
    let hoveredObj       = null;
    let isInfoShowing    = false;
    let playingAudioUrl  = '';

    // ── Thêm CSS transition cho panel ─────────────────
    // Inject style nếu chưa có (không cần sửa HTML)
    if (artUI && !artUI.dataset.styled) {
        artUI.dataset.styled = '1';
        Object.assign(artUI.style, {
            transition:  'opacity 0.35s ease, transform 0.35s ease',
            opacity:     '0',
            transform:   'translateY(12px)',
            pointerEvents: 'none',
        });
    }

    // Tooltip tương tác
    const promptUI = (() => {
        let el = document.getElementById('interaction-prompt');
        if (!el) {
            el = document.createElement('div');
            el.id = 'interaction-prompt';
            Object.assign(el.style, {
                position:   'absolute',
                top:        '55%',
                left:       '50%',
                transform:  'translate(-50%, -50%)',
                color:      '#f5e6c8',
                background: 'rgba(10,8,4,0.75)',
                padding:    '10px 20px',
                border:     '1px solid rgba(212,175,55,0.6)',
                borderRadius: '8px',
                fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
                fontSize:     '14px',
                letterSpacing:'0.5px',
                backdropFilter: 'blur(4px)',
                pointerEvents:  'none',
                display:        'none',
                zIndex:         '10',
                boxShadow:      '0 4px 20px rgba(0,0,0,0.6)',
            });
            document.body.appendChild(el);
        }
        return el;
    })();

    // ── Vignette overlay (tối góc màn hình — cảm giác cinematic) ──
    (() => {
        if (document.getElementById('vignette-overlay')) return;
        const v = document.createElement('div');
        v.id = 'vignette-overlay';
        Object.assign(v.style, {
            position:       'fixed',
            inset:          '0',
            pointerEvents:  'none',
            zIndex:         '5',
            background:     'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
        });
        document.body.appendChild(v);
    })();

    // ── Audio & Subtitle ───────────────────────────────
    if (artAudio) {
        artAudio.addEventListener('timeupdate', () => {
            if (!currentSubtitles?.length) return;
            const time = artAudio.currentTime;
            const sub  = currentSubtitles.find(s => time >= s.start && time <= s.end);
            if (sub) {
                subtitleText.innerHTML    = sub.text;
                subtitleText.style.display = 'inline-block';
            } else {
                subtitleText.style.display = 'none';
            }
        });
        artAudio.addEventListener('ended', () => {
            if (subtitleContainer) subtitleContainer.style.display = 'none';
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
        playingAudioUrl  = audioData.url;
        artAudio.src     = audioData.url;
        currentSubtitles = audioData.subtitles || [];
        if (subtitleContainer) subtitleContainer.style.display = 'block';
        if (subtitleText)      subtitleText.style.display      = 'none';
        artAudio.play().catch(e => console.log('Autoplay bị chặn:', e));
    }

    // ── Show / Hide Panel với animation ───────────────
    function showArtInfo(title, desc) {
        if (!artUI) return;
        if (artTitle) artTitle.textContent = title;
        if (artText)  artText.textContent  = desc;

        artUI.style.display      = 'block';
        artUI.style.pointerEvents = 'auto';

        // Trigger reflow để transition hoạt động
        void artUI.offsetWidth;
        artUI.style.opacity   = '1';
        artUI.style.transform = 'translateY(0)';

        isInfoShowing = true;
        promptUI.style.display = 'none';
    }

    function hideArtInfo() {
        if (!artUI) return;
        artUI.style.opacity      = '0';
        artUI.style.transform    = 'translateY(12px)';
        artUI.style.pointerEvents = 'none';
        // Ẩn sau khi animation xong
        setTimeout(() => {
            if (!isInfoShowing) artUI.style.display = 'none';
        }, 360);
        isInfoShowing = false;
    }

    function handleInteract() {
        if (!hoveredObj) return;
        if (hoveredObj.userData.isArt) {
            isInfoShowing ? hideArtInfo() : showArtInfo(hoveredObj.userData.title, hoveredObj.userData.desc);
            if (!isInfoShowing) promptUI.style.display = 'block';
        } else if (hoveredObj.userData.isAudioButton) {
            toggleAudioPlayback(hoveredObj.userData.audioData);
        }
    }

    document.addEventListener('keydown', e => { if (e.code === 'KeyE') handleInteract(); });
    document.addEventListener('click',   ()  => { if (document.pointerLockElement) handleInteract(); });

    // ── Raycaster ──────────────────────────────────────
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
                    promptUI.innerHTML     = 'Nhấn <b>[E]</b> hoặc <b>Click</b> để đọc thông tin';
                    promptUI.style.display = 'block';
                } else if (obj.userData.isAudioButton) {
                    promptUI.innerHTML     = 'Nhấn <b>[E]</b> hoặc <b>Click</b> để Bật/Tắt Thuyết Minh';
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
