// =====================================================
// audioManager.js — CẢI TIẾN
// Thêm: Fade In/Out nhạc nền, Volume control,
//       Resume AudioContext sau gesture người dùng
// =====================================================
import * as THREE from 'three';

const FADE_DURATION = 1.5;  // giây để fade in/out
const MUSIC_VOLUME = 0.3; // âm lượng mặc định (0-1)

export function setupAudio(camera) {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const bgMusic = new THREE.Audio(listener);
    const loader = new THREE.AudioLoader();

    let musicReady = false;
    let userWantsMusic = false;
    let fadeInterval = null;

    // ── Load nhạc nền ──────────────────────────────────
    loader.load(
        '/audio/0sound effects/nhac1.mp3',
        (buffer) => {
            bgMusic.setBuffer(buffer);
            bgMusic.setLoop(true);
            bgMusic.setVolume(-1); // Bắt đầu từ 0, fade in sau
            musicReady = true;

            if (userWantsMusic && !bgMusic.isPlaying) {
                bgMusic.play();
                fadeVolume(MUSIC_VOLUME);
            }
        },
        undefined,
        (err) => console.warn('[Audio] Không load được nhạc nền:', err)
    );

    // ── Resume AudioContext (nhiều browser block cho tới khi có gesture) ──
    document.addEventListener('click', resumeContext, { once: true });
    document.addEventListener('keydown', resumeContext, { once: true });

    function resumeContext() {
        const ctx = listener.context;
        if (ctx?.state === 'suspended') {
            ctx.resume().then(() => {
                if (userWantsMusic && musicReady && !bgMusic.isPlaying) {
                    bgMusic.play();
                    fadeVolume(MUSIC_VOLUME);
                }
            });
        }
    }

    // ── Fade helper ────────────────────────────────────
    function fadeVolume(targetVol, onDone) {
        if (fadeInterval) clearInterval(fadeInterval);

        const steps = 60;
        const stepTime = (FADE_DURATION * 1000) / steps;
        const startVol = bgMusic.gain?.gain?.value ?? bgMusic.getVolume?.() ?? 0;
        const delta = (targetVol - startVol) / steps;
        let count = 0;

        fadeInterval = setInterval(() => {
            count++;
            const newVol = Math.max(0, Math.min(1, startVol + delta * count));
            try { bgMusic.setVolume(newVol); } catch (_) { }
            if (count >= steps) {
                clearInterval(fadeInterval);
                fadeInterval = null;
                try { bgMusic.setVolume(targetVol); } catch (_) { }
                if (targetVol === 0) {
                    // Dừng bất kể isPlaying có đúng hay không
                    try { if (bgMusic.source) bgMusic.stop(); else bgMusic.pause(); } catch (_) { }
                }
                if (onDone) onDone();
            }
        }, stepTime);
    }

    // ── API công khai ───────────────────────────────────
    function play() {
        userWantsMusic = true;
        if (!musicReady) return;

        resumeContext();

        if (!bgMusic.isPlaying) {
            bgMusic.setVolume(0);
            bgMusic.play();
        }
        fadeVolume(MUSIC_VOLUME);
    }

    function pause() {
        userWantsMusic = false;
        if (!musicReady) return;
        // Không kiểm tra isPlaying — bỏ qua luôn để tránh bug THREE.Audio
        if (fadeInterval) clearInterval(fadeInterval);
        fadeVolume(0);
    }

    // Dừng ngay lập tức không fade (dùng cho night mode khi cần tắt tức thì)
    function stopNow() {
        userWantsMusic = false;
        if (fadeInterval) clearInterval(fadeInterval);
        try { bgMusic.setVolume(0); } catch (_) { }
        try { if (bgMusic.source) bgMusic.stop(); else bgMusic.pause(); } catch (_) { }
    }

    function setVolume(vol) {
        if (!musicReady) return;
        try { bgMusic.setVolume(Math.max(0, Math.min(1, vol))); } catch (_) { }
    }

    function toggle() {
        userWantsMusic ? pause() : play();
    }

    return { play, pause, stopNow, toggle, setVolume };
}