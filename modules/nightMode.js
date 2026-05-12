// =====================================================
// nightMode.js — "Đêm Trong Viện Bảo Tàng"
//   • Cầu dao điện tổng đặt trong sảnh chính
//   • Tắt toàn bộ đèn, bật đèn pin gắn Camera
//   • Mona Lisa mắt phát sáng đỏ rực + nhịp tim
//   • Tất cả tranh nhấp nháy đỏ theo nhịp tim (lệch pha)
//   • Đèn pin chiếu thẳng về phía trước + chớp giật ngẫu nhiên
//   • Overlay tối + âm thanh horror
// =====================================================
import * as THREE from 'three';
import { interactableObjects } from './artworks.js';

// ── Private State ────────────────────────────────────
let _isNight       = false;
let _flashlight    = null;
let _nightAmbient  = null;
let _allLights     = [];   // [{ light, origIntensity }]
let _artEffects    = [];   // [{ mat, id, origEmissive, origEI }]
let _leverMesh     = null;
let _nightSfx      = null;
let _overlayEl     = null;
let _indicatorEl   = null;
let _glowTime      = 0;
let _flickerCD     = 0;
let _toggleFn      = null; // set after build — referenced by hitbox userData
let _bgMusic       = null; // nhạc nền đêm (khác với _nightSfx horror sfx)
let _audioManager  = null; // tham chiếu tới audioManager ngày
let _origTextStyles = [];  // [{ el, origColor, origTextShadow }]

// Tranh bị ảnh hưởng đặc biệt
const MONA_LISA_ID   = '6';
const HAUNTED_IDS    = new Set(['6', '7', '8', '9', '10']); // Leonardo + portrait cluster

// Màu sắc ban đêm / ban ngày
const COL_NIGHT_FOG  = new THREE.Color(0x020006);
const COL_DAY_FOG    = new THREE.Color(0x100d08);

// ── Public API ───────────────────────────────────────

/**
 * Khởi tạo hệ thống Night Mode.
 * @param {THREE.Scene}  scene
 * @param {THREE.Camera} camera
 * @param {{ play, pause, toggle, setVolume }} [audioManager] — audioManager ngày (tuỳ chọn)
 * @returns {{ update(delta:number):void, isNightModeActive():boolean }}
 */
export function setupNightMode(scene, camera, audioManager = null) {
    if (!camera.parent) scene.add(camera);
    _audioManager = audioManager;

    // ── 1. Đèn pin ──────────────────────────────────
    // Góc hẹp hơn, penumbra cứng hơn, màu trắng lạnh như đèn pin thật
    _flashlight = new THREE.SpotLight(
        0xddeeff,   // màu trắng lạnh hơi xanh — đặc trưng đèn pin LED
        0,          // tắt lúc khởi tạo
        28,         // range xa hơn
        Math.PI / 8.5, // góc rộng ~33° — tỏa ra như đèn phim
        0.55,       // penumbra mềm → rìa ngoài mờ dần tự nhiên
        1.2         // decay
    );
    _flashlight.castShadow = false;
    _flashlight.position.set(0, 0, 0); // gắn đúng vào gốc camera

    // Đèn fill yếu lan rộng xung quanh để giả viền ánh sáng tràn nhẹ
    const _fillLight = new THREE.PointLight(0x223344, 0, 4, 2);
    _fillLight.position.set(0, 0, 0);
    camera.add(_fillLight);
    // Lưu để bật/tắt cùng flashlight
    _flashlight.userData.fill = _fillLight;

    const flTarget = new THREE.Object3D();
    flTarget.position.set(0, 0, -1); // 1 đơn vị thẳng phía trước camera
    camera.add(flTarget);
    camera.add(_flashlight);
    _flashlight.target = flTarget;

    // ── 2. Ambient đêm (rất mờ tím/đỏ) ─────────────
    _nightAmbient = new THREE.AmbientLight(0x0a0015, 0);
    scene.add(_nightAmbient);

    // ── 3. Tạo cầu dao điện ─────────────────────────
    _buildSwitch(scene, camera);

    // ── 4. Âm thanh horror (sfx) ────────────────────
    _nightSfx = document.createElement('audio');
    _nightSfx.src    = '/audio/0sound effects/';
    _nightSfx.loop   = true;
    _nightSfx.volume = 0;
    document.body.appendChild(_nightSfx);

    // ── 4b. Nhạc nền đêm (tách biệt với sfx) ────────
    _bgMusic = document.createElement('audio');
    _bgMusic.src    = 'public/audio/0sound effects/a.mp3'; // ← thay bằng đường dẫn nhạc nền của bạn
    _bgMusic.loop   = true;
    _bgMusic.volume = 1;
    document.body.appendChild(_bgMusic);

    // ── 5. Màn overlay tối ──────────────────────────
    _overlayEl = document.createElement('div');
    _overlayEl.id = 'night-overlay';
    Object.assign(_overlayEl.style, {
        position:      'fixed',
        inset:         '0',
        pointerEvents: 'none',
        zIndex:        '4',
        background:    'radial-gradient(ellipse at center, transparent 15%, rgba(2,0,8,0.88) 100%)',
        opacity:       '0',
        transition:    'opacity 1.8s ease',
    });
    document.body.appendChild(_overlayEl);

    // ── 6. Indicator điện (góc trên phải) ───────────
    _indicatorEl = document.createElement('div');
    _indicatorEl.id = 'power-indicator';
    Object.assign(_indicatorEl.style, {
        position:    'fixed',
        bottom:      '20px',
        right:       '20px',
        padding:     '7px 14px',
        background:  'rgba(0,0,0,0.72)',
        color:       '#00ff88',
        border:      '1px solid #00cc55',
        borderRadius:'6px',
        fontFamily:  'monospace',
        fontSize:    '13px',
        letterSpacing:'0.5px',
        zIndex:      '20',
        display:     'none',
        transition:  'color 0.4s, border-color 0.4s',
        textShadow:  '0 0 8px currentColor',
    });
    _indicatorEl.innerHTML = '⚡&nbsp;ĐIỆN: <b>BẬT</b>';
    document.body.appendChild(_indicatorEl);

    // Thu thập tất cả đèn sau khi GLTF load xong (3 giây)
    setTimeout(() => {
        _collectLights(scene);
        if (_indicatorEl) _indicatorEl.style.display = 'block';
    }, 3500);

    return {
        update:            (delta) => _updateNight(delta),
        isNightModeActive: ()      => _isNight,
    };
}

// ── Thu thập ánh sáng ────────────────────────────────

function _collectLights(scene) {
    _allLights = [];
    scene.traverse(obj => {
        if (obj.isLight && obj !== _flashlight && obj !== _nightAmbient) {
            _allLights.push({ light: obj, origIntensity: obj.intensity });
        }
    });
    console.log(`[NightMode] Thu thập ${_allLights.length} nguồn sáng.`);
}

function _collectArtEffects(scene) {
    _artEffects = [];
    scene.traverse(obj => {
        if (obj.isMesh && obj.userData.isArt && obj.material?.isMeshStandardMaterial) {
            const mat = obj.material;
            _artEffects.push({
                mat,
                id:              obj.userData.artInfo?.id || '',
                origEmissive:    mat.emissive.clone(),
                origEI:          mat.emissiveIntensity ?? 1,
            });
        }
    });
}

// ── Xây dựng cầu dao điện ────────────────────────────

function _buildSwitch(scene, camera) {
    const root = new THREE.Group();

    /* ---- Tấm panel kim loại ---- */
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x9a9a9a, roughness: 0.25, metalness: 0.9,
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.68, 0.1), panelMat);
    root.add(panel);

    /* ---- Viền cảnh báo vàng-đen ---- */
    const warnCanvas = document.createElement('canvas');
    warnCanvas.width  = 64;
    warnCanvas.height = 96;
    const wCtx = warnCanvas.getContext('2d');
    wCtx.fillStyle = '#FFD700';
    wCtx.fillRect(0, 0, 64, 96);
    wCtx.fillStyle = '#111111';
    for (let i = -2; i < 9; i++) {
        wCtx.beginPath();
        wCtx.moveTo(0,  i * 14);
        wCtx.lineTo(64, i * 14 - 64);
        wCtx.lineTo(64, i * 14 - 50);
        wCtx.lineTo(0,  i * 14 + 14);
        wCtx.closePath();
        wCtx.fill();
    }
    const warnTex = new THREE.CanvasTexture(warnCanvas);
    const border  = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.72, 0.07),
        new THREE.MeshStandardMaterial({ map: warnTex, roughness: 0.6 }),
    );
    border.position.z = -0.015;
    root.add(border);

    /* ---- Tay gạt (lever) ---- */
    const leverMat = new THREE.MeshStandardMaterial({
        color: 0xee2200, roughness: 0.3, metalness: 0.75,
        emissive: new THREE.Color(0x550000), emissiveIntensity: 0.8,
    });
    _leverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.24, 0.14), leverMat);
    _leverMesh.position.set(0, 0.12, 0.085); // vị trí "ON" (gạt lên)
    root.add(_leverMesh);

    /* ---- Trục xoay tay gạt ---- */
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.2 });
    const pivot    = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12), pivotMat);
    pivot.rotation.z = Math.PI / 2;
    pivot.position.set(0, 0, 0.09);
    root.add(pivot);

    /* ---- Nhãn "CẦU DAO TỔNG" ---- */
    const lblCanvas = document.createElement('canvas');
    lblCanvas.width  = 160;
    lblCanvas.height = 56;
    const lCtx = lblCanvas.getContext('2d');
    lCtx.fillStyle = '#f5f5f5';
    lCtx.fillRect(0, 0, 160, 56);
    lCtx.fillStyle = '#111111';
    lCtx.font      = 'bold 12px Arial';
    lCtx.textAlign = 'center';
    lCtx.fillText('⚡ CẦU DAO TỔNG', 80, 20);
    lCtx.font      = '10px Arial';
    lCtx.fillText('MAIN POWER SWITCH', 80, 38);
    const lblTex  = new THREE.CanvasTexture(lblCanvas);
    const lblMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.34, 0.12),
        new THREE.MeshStandardMaterial({ map: lblTex, roughness: 0.8 }),
    );
    lblMesh.position.set(0, -0.24, 0.052);
    root.add(lblMesh);

    /* ---- Đèn trạng thái (nhỏ, màu xanh/đỏ) ---- */
    const statusGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12);
    const statusMat = new THREE.MeshStandardMaterial({
        color: 0x00ff44, emissive: new THREE.Color(0x00ff44), emissiveIntensity: 3,
        roughness: 0.2,
    });
    const statusLED = new THREE.Mesh(statusGeo, statusMat);
    statusLED.rotation.x = Math.PI / 2;
    statusLED.position.set(0, 0.28, 0.075);
    root.add(statusLED);
    root.userData.statusLED = statusLED;
    root.userData.statusMat = statusMat;

    /* ---- Hitbox tương tác ---- */
    const hitBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.1, 0.6),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitBox.userData = {
        isSwitch: true,
        getPromptText: () => _isNight
            ? 'Nhấn <b>[E]</b> để bật lại điện ⚡'
            : 'Nhấn <b>[E]</b> để gạt cầu dao 🔌',
        onActivate: () => _toggle(scene, camera, root),
    };
    interactableObjects.push(hitBox);
    root.add(hitBox);

    /* ---- Đặt vào tường phía sau sảnh chính ---- */
    root.position.set(-4.5, 3.6, -28.9);
    scene.add(root);
}

// ── Toggle ON/OFF ────────────────────────────────────

function _toggle(scene, camera, switchRoot) {
    _isNight = !_isNight;
    if (_isNight) {
        _activate(scene, camera, switchRoot);
    } else {
        _deactivate(scene, camera, switchRoot);
    }
}

function _activate(scene, camera, switchRoot) {
    _collectArtEffects(scene);

    // Tắt nhạc ngày NGAY KHI ấn công tắc
    if (_audioManager) _audioManager.stopNow?.() ?? _audioManager.pause?.();

    /* -- Hiệu ứng nhấp nháy điện trước khi tắt -- */
    let flickCount = 0;
    const flickInterval = setInterval(() => {
        const on = (flickCount % 2 === 0);
        _allLights.forEach(({ light }) => {
            light.intensity = on ? light.intensity : 0;
        });
        flickCount++;
        if (flickCount >= 6) {
            clearInterval(flickInterval);
            _finalizeActivation(scene, camera, switchRoot);
        }
    }, 90);
}

function _finalizeActivation(scene, camera, switchRoot) {
    // 1. Tắt hết đèn
    _allLights.forEach(({ light }) => { light.intensity = 0; });

    // 2. Bật ambient đêm mờ
    _nightAmbient.intensity = 0.14;

    // 3. Bật đèn pin + fill light
    _flashlight.intensity = 90;
    if (_flashlight.userData.fill) _flashlight.userData.fill.intensity = 0.6;

    // 4. Sương mù horror
    if (scene.fog) {
        scene.fog.color.copy(COL_NIGHT_FOG);
        if ('density' in scene.fog) scene.fog.density = 0.032;
    }

    // 5. Overlay tối
    if (_overlayEl) {
        void _overlayEl.offsetWidth;
        _overlayEl.style.opacity = '1';
    }

    // 6. Hiệu ứng tranh kỳ bí
    _applyHauntedArt(true);

    // 7. Lever xuống, LED đỏ
    if (_leverMesh) _leverMesh.position.setY(-0.12);
    _setLED(switchRoot, false);

    // 8. Indicator cập nhật
    _updateIndicator();

    // 9b. Âm thanh horror sfx
    if (_nightSfx) {
        _nightSfx.play().catch(() => {});
        _fadeAudio(_nightSfx, 0, 0.38, 2200);
    }

    // 9b. Nhạc nền đêm
    if (_bgMusic) {
        _bgMusic.currentTime = 0;
        _bgMusic.play().catch(() => {});
        _fadeAudio(_bgMusic, 0, 0.55, 3000);
    }

    // 10. Chữ đỏ máu toàn màn hình
    _applyBloodText(true);

    // 11. Thông báo màn hình
    _showMessage('⚡ Điện đã tắt…', '#ff3333');
}

function _deactivate(scene, camera, switchRoot) {
    // 1. Khôi phục đèn
    _allLights.forEach(({ light, origIntensity }) => {
        light.intensity = origIntensity;
    });

    // 2. Tắt ambient đêm
    _nightAmbient.intensity = 0;

    // 3. Tắt đèn pin + fill light
    _flashlight.intensity = 0;
    if (_flashlight.userData.fill) _flashlight.userData.fill.intensity = 0;

    // 4. Khôi phục sương mù
    if (scene.fog) {
        scene.fog.color.copy(COL_DAY_FOG);
        if ('density' in scene.fog) scene.fog.density = 0.016;
    }

    // 5. Xóa overlay
    if (_overlayEl) _overlayEl.style.opacity = '0';

    // 6. Khôi phục tranh
    _applyHauntedArt(false);

    // 7. Lever lên, LED xanh
    if (_leverMesh) _leverMesh.position.setY(0.12);
    _setLED(switchRoot, true);

    // 8. Indicator cập nhật
    _updateIndicator();

    // 9. Tắt âm thanh horror sfx
    if (_nightSfx) {
        _fadeAudio(_nightSfx, _nightSfx.volume, 0, 1400, () => { _nightSfx.pause(); });
    }

    // 9b. Tắt nhạc nền đêm
    if (_bgMusic) {
        _fadeAudio(_bgMusic, _bgMusic.volume, 0, 1800, () => { _bgMusic.pause(); });
    }

    // 9c. Bật lại nhạc ngày
    if (_audioManager) _audioManager.play();

    // 10. Khôi phục màu chữ
    _applyBloodText(false);

    // 11. Thông báo
    _showMessage('⚡ Điện đã được khôi phục!', '#44ff88');
}

// ── Hiệu ứng tranh kỳ bí ─────────────────────────────

function _applyHauntedArt(nightOn) {
    _artEffects.forEach(({ mat, id, origEmissive, origEI }) => {
        if (nightOn) {
            if (id === MONA_LISA_ID) {
                // Mona Lisa: đỏ huyền bí mạnh nhất
                mat.emissive.set(0x660000);
                mat.emissiveIntensity = 3.0;
            } else if (HAUNTED_IDS.has(id)) {
                // Portrait cluster: xanh lân tinh
                mat.emissive.set(0x002800);
                mat.emissiveIntensity = 2.0;
            } else {
                // Tất cả tranh còn lại: cũng đỏ huyền bí (sẽ nhấp nháy trong update)
                mat.emissive.set(0x440000);
                mat.emissiveIntensity = 2.2;
            }
        } else {
            mat.emissive.copy(origEmissive);
            mat.emissiveIntensity = origEI;
        }
        mat.needsUpdate = true;
    });
}

// ── Update loop ──────────────────────────────────────

function _updateNight(delta) {
    if (!_isNight) return;

    _glowTime += delta;

    const heartbeat = _heartbeatCurve(_glowTime * 1.1); // ~66 bpm

    _artEffects.forEach(({ mat, id }) => {
        if (id === MONA_LISA_ID) {
            // Mona Lisa: đỏ mạnh nhất, nhịp tim rõ nhất
            mat.emissiveIntensity = 1.8 + heartbeat * 3.2;
            mat.emissive.setRGB(0.4 + heartbeat * 0.35, 0, 0);
        } else if (HAUNTED_IDS.has(id)) {
            // Portrait cluster: xanh lân tinh nhấp nháy theo nhịp tim
            const pulse = _heartbeatCurve(_glowTime * 1.1 + 0.3);
            mat.emissiveIntensity = 0.9 + pulse * 2.2;
            mat.emissive.setRGB(0, 0.18 + pulse * 0.25, 0);
        } else {
            // Tất cả tranh còn lại: nhấp nháy đỏ như Mona Lisa, lệch pha theo id
            const offset = parseFloat(id) * 0.4 || 0;
            const pulse  = _heartbeatCurve(_glowTime * 1.1 + offset);
            mat.emissiveIntensity = 1.2 + pulse * 2.5;
            mat.emissive.setRGB(0.28 + pulse * 0.3, 0, 0.04 + pulse * 0.05);
        }
    });

    /* Đèn pin chớp ngẫu nhiên (horror flicker) */
    _flickerCD -= delta;
    if (_flickerCD <= 0 && Math.random() < 0.006) {
        _flashlight.intensity *= 0.08;
        setTimeout(() => {
            if (_isNight) {
                _flashlight.intensity = 90;
                if (_flashlight.userData.fill) _flashlight.userData.fill.intensity = 0.6;
            }
        }, 60 + Math.random() * 110);
        _flickerCD = 4 + Math.random() * 10;
    }
}

/**
 * Đường cong nhịp tim: 0→spike→0→spike nhỏ→0
 * period ≈ 1 giây ở tốc độ normal
 */
function _heartbeatCurve(t) {
    const phase = (t % 1.0); // 0..1
    if (phase < 0.12) return Math.sin(phase / 0.12 * Math.PI);        // đập 1
    if (phase < 0.28 && phase >= 0.18)
        return Math.sin((phase - 0.18) / 0.1 * Math.PI) * 0.45;      // đập 2 nhỏ hơn
    return 0;
}

// ── Chữ đỏ máu ──────────────────────────────────────

function _applyBloodText(nightOn) {
    if (nightOn) {
        // Snapshot màu gốc của tất cả element có text đang hiển thị
        _origTextStyles = [];
        const all = document.querySelectorAll(
            'div, span, p, h1, h2, h3, h4, b, label, button, a, li'
        );
        all.forEach(el => {
            // Bỏ qua element ẩn hoặc không có text thực
            if (!el.offsetParent && el.id !== 'power-indicator') return;
            if (!el.textContent.trim()) return;

            const cs = window.getComputedStyle(el);
            _origTextStyles.push({
                el,
                origColor:      el.style.color,
                origShadow:     el.style.textShadow,
                origTransition: el.style.transition,
            });

            el.style.transition  = 'color 0.6s ease, text-shadow 0.6s ease';
            el.style.color       = '#8b0000';
            el.style.textShadow  = '0 0 10px #ff0000, 0 0 22px #660000';
        });
    } else {
        // Khôi phục màu gốc
        _origTextStyles.forEach(({ el, origColor, origShadow, origTransition }) => {
            el.style.transition  = 'color 0.8s ease, text-shadow 0.8s ease';
            el.style.color       = origColor;
            el.style.textShadow  = origShadow;
            setTimeout(() => {
                el.style.transition = origTransition;
            }, 900);
        });
        _origTextStyles = [];
    }
}

// ── Helpers ──────────────────────────────────────────

function _setLED(switchRoot, powerOn) {
    const mat = switchRoot?.userData?.statusMat;
    if (!mat) return;
    if (powerOn) {
        mat.color.set(0x00ff44);
        mat.emissive.set(0x00ff44);
    } else {
        mat.color.set(0xff2200);
        mat.emissive.set(0xff1100);
    }
}

function _updateIndicator() {
    if (!_indicatorEl) return;
    if (_isNight) {
        _indicatorEl.innerHTML         = '🔦&nbsp;ĐIỆN: <b>TẮT</b>';
        _indicatorEl.style.color       = '#ff4444';
        _indicatorEl.style.borderColor = '#cc1111';
    } else {
        _indicatorEl.innerHTML         = '⚡&nbsp;ĐIỆN: <b>BẬT</b>';
        _indicatorEl.style.color       = '#00ff88';
        _indicatorEl.style.borderColor = '#00cc55';
    }
}

function _showMessage(text, color = '#ffffff') {
    const el = document.createElement('div');
    Object.assign(el.style, {
        position:      'fixed',
        top:           '44%',
        left:          '50%',
        transform:     'translate(-50%,-50%)',
        color,
        fontFamily:    '"Courier New", monospace',
        fontSize:      '24px',
        fontWeight:    'bold',
        textShadow:    `0 0 24px ${color}`,
        zIndex:        '110',
        pointerEvents: 'none',
        opacity:       '1',
        transition:    'opacity 1.4s ease',
        letterSpacing: '2px',
    });
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 1500);
    }, 1800);
}

function _fadeAudio(el, fromVol, toVol, duration, onDone) {
    const STEPS    = 30;
    const stepTime = duration / STEPS;
    const stepVal  = (toVol - fromVol) / STEPS;
    let cur = fromVol;
    el.volume = Math.max(0, Math.min(1, fromVol));

    const id = setInterval(() => {
        cur += stepVal;
        el.volume = Math.max(0, Math.min(1, cur));
        if ((stepVal > 0 && el.volume >= toVol) || (stepVal < 0 && el.volume <= toVol)) {
            el.volume = Math.max(0, Math.min(1, toVol));
            clearInterval(id);
            if (onDone) onDone();
        }
    }, stepTime);
}