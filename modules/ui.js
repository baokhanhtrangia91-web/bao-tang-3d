// =====================================================
// UI — hiển thị thông tin tác phẩm & tương tác raycasting
// =====================================================
import * as THREE from 'three';
import { interactableObjects } from './artworks.js';

const INTERACTION_DIST = 12; // khoảng cách tối đa để xem thông tin tranh

export function setupUI() {
    const artUI    = document.getElementById('art-description');
    const artTitle = document.getElementById('art-title');
    const artText  = document.getElementById('art-text');
    const mediaBtn = document.getElementById('media-btn');
    const artVideo = document.getElementById('art-video');
    const artAudio = document.getElementById('art-audio');

    // --- Media ---
    function stopAllMedia() {
        if (artVideo) { artVideo.pause(); artVideo.src = ''; artVideo.style.display = 'none'; }
        if (artAudio) { artAudio.pause(); artAudio.src = ''; }
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

    // --- Hiển thị / ẩn bảng thông tin ---
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

    // --- Raycasting: nhìn vào tranh → tự động hiện thông tin ---
    const raycaster  = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0); // tâm màn hình
    let   lastHit    = null;

    function updateInteraction(camera) {
        if (!camera) return;

        raycaster.setFromCamera(screenCenter, camera);
        const hits = raycaster.intersectObjects(interactableObjects, false);

        if (hits.length > 0 && hits[0].distance < INTERACTION_DIST) {
            const obj = hits[0].object;
            const { title, desc, mediaUrl, mediaType } = obj.userData;

            if (obj !== lastHit) {
                lastHit = obj;
                showArtInfo(title, desc, mediaUrl, mediaType);
            }
        } else {
            if (lastHit !== null) {
                lastHit = null;
                hideArtInfo();
            }
        }
    }

    return { showArtInfo, hideArtInfo, stopAllMedia, playMedia, updateInteraction };
}
