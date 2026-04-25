import * as THREE from 'three';
import { interactableObjects } from './artworks.js';

const INTERACTION_DIST = 16; // Tăng khoảng cách nhận diện lên một chút cho dễ bấm

export function setupUI() {
    const artUI    = document.getElementById('art-description');
    const artTitle = document.getElementById('art-title');
    const artText  = document.getElementById('art-text');
    const artAudio = document.getElementById('art-audio');
    
    const subtitleContainer = document.getElementById('subtitle-container');
    const subtitleText      = document.getElementById('subtitle-text');
    
    let currentSubtitles    = null; 
    let hoveredObj          = null;  
    let isInfoShowing       = false; 
    let playingAudioUrl     = "";

    // --- TẠO TOOLTIP NHẮC NHỞ TƯƠNG TÁC ---
    let promptUI = document.getElementById('interact-prompt');
    if (!promptUI) {
        promptUI = document.createElement('div');
        promptUI.id = 'interact-prompt';
        promptUI.style.position = 'absolute';
        promptUI.style.top = '55%'; 
        promptUI.style.left = '50%';
        promptUI.style.transform = 'translate(-50%, -50%)';
        promptUI.style.color = '#fff';
        promptUI.style.background = 'rgba(0, 0, 0, 0.6)';
        promptUI.style.padding = '8px 16px';
        promptUI.style.border = '1px solid #d4af37';
        promptUI.style.borderRadius = '6px';
        promptUI.style.fontFamily = 'sans-serif';
        promptUI.style.fontSize = '15px';
        promptUI.style.pointerEvents = 'none';
        promptUI.style.display = 'none'; 
        promptUI.style.zIndex = '10';
        document.body.appendChild(promptUI);
    }

    // --- XỬ LÝ AUDIO & PHỤ ĐỀ ---
    if (artAudio) {
        artAudio.addEventListener('timeupdate', () => {
            if (!currentSubtitles || currentSubtitles.length === 0) return;
            const time = artAudio.currentTime;
            const activeSub = currentSubtitles.find(sub => time >= sub.start && time <= sub.end);
            
            if (activeSub) {
                subtitleText.innerHTML = activeSub.text;
                subtitleText.style.display = 'inline-block';
            } else {
                subtitleText.style.display = 'none';
            }
        });

        // Kết thúc audio -> giấu chữ đi
        artAudio.addEventListener('ended', () => {
            subtitleContainer.style.display = 'none';
            playingAudioUrl = "";
        });
    }

    function stopAudio() {
        if (artAudio) { 
            artAudio.pause(); 
            artAudio.currentTime = 0; 
        }
        if (subtitleContainer) subtitleContainer.style.display = 'none';
        playingAudioUrl = "";
        currentSubtitles = null;
    }

    // --- BẬT/TẮT AUDIO KHI ẤN E VÀO NÚT ĐỎ ---
    function toggleAudioPlayback(audioData) {
        if (!audioData || !audioData.url) return;
        
        // Nếu bài này đang phát -> Ấn E lần nữa để Tắt
        if (playingAudioUrl === audioData.url && !artAudio.paused) {
            stopAudio();
            return;
        }

        stopAudio(); // Tắt bài cũ (nếu có)
        
        playingAudioUrl = audioData.url;
        artAudio.src = audioData.url;
        currentSubtitles = audioData.subtitles || [];
        
        subtitleContainer.style.display = 'block';
        subtitleText.style.display = 'none'; 
        
        artAudio.play().catch(e => console.log(e));
    }

    // --- HIỆN THÔNG TIN KHI ẤN E VÀO BỨC TRANH ---
    function showArtInfo(title, desc) {
        if (!artUI) return;
        if (artTitle) artTitle.textContent = title;
        if (artText)  artText.textContent  = desc;

        artUI.style.display = 'block';
        isInfoShowing = true;
        promptUI.style.display = 'none'; // Giấu nhắc nhở đi cho đỡ vướng mắt
    }

    function hideArtInfo() {
        if (artUI) artUI.style.display = 'none';
        isInfoShowing = false;
    }

    // --- BẮT SỰ KIỆN PHÍM E ---
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE' && hoveredObj) {
            
            // 1. Nhìn vào BỨC TRANH
            if (hoveredObj.userData.isArt) {
                if (isInfoShowing) {
                    hideArtInfo();
                    promptUI.style.display = 'block'; 
                } else {
                    showArtInfo(hoveredObj.userData.title, hoveredObj.userData.desc);
                }
            } 
            // 2. Nhìn vào NÚT AUDIO ĐỎ
            else if (hoveredObj.userData.isAudioButton) {
                toggleAudioPlayback(hoveredObj.userData.audioData);
            }
        }
    });

    // --- TIA NGẮM (RAYCASTER) ---
    const raycaster  = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);

    function updateInteraction(camera) {
        if (!camera) return;

        raycaster.setFromCamera(screenCenter, camera);
        const hits = raycaster.intersectObjects(interactableObjects, false);

        if (hits.length > 0 && hits[0].distance < INTERACTION_DIST) {
            const obj = hits[0].object;
            
            if (obj !== hoveredObj) {
                hideArtInfo(); // Tự động đóng thông tin của tranh cũ
                hoveredObj = obj;
                
                // Đổi chữ hiển thị tùy thuộc vào vật thể ngắm trúng
                if (obj.userData.isArt) {
                    promptUI.innerHTML = 'Nhấn <b>[E]</b> để đọc thông tin';
                    promptUI.style.display = 'block';
                } else if (obj.userData.isAudioButton) {
                    promptUI.innerHTML = 'Nhấn <b>[E]</b> để Bật/Tắt Thuyết Minh';
                    promptUI.style.display = 'block';
                }
            }
        } else {
            // Không ngắm vào cái gì cả
            if (hoveredObj !== null) {
                hoveredObj = null;
                promptUI.style.display = 'none'; 
                hideArtInfo(); 
                // Ở đây mình KHÔNG gọi stopAudio() để bạn có thể vừa đi dạo vừa nghe thuyết minh.
            }
        }
    }

    return { showArtInfo, hideArtInfo, updateInteraction };
}