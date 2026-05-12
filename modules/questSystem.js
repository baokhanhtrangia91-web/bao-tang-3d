// =====================================================
// questSystem.js — HỆ THỐNG NHIỆM VỤ BẢO TÀNG
// Theo dõi tiến độ xem tranh, thông báo & phần thưởng
// =====================================================

// IDs của 17 bức tranh chính
const PAINTING_IDS = new Set(['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17']);
const TOTAL = PAINTING_IDS.size; 

const viewedPaintings = new Set();
let questInitialized = false;
let notificationTimeout = null;
let isCompleted = false;

// ── Khởi tạo âm thanh ──
const achievementSound = new Audio('public/audio/0sound effects/r.mp3'); 
achievementSound.volume = 0.7; 

const finalCompletionSound = new Audio('public/audio/0sound effects/m.mp3'); 
finalCompletionSound.volume = 1.0; 

// ── Elements ──
let hudEl = null;
let notifEl = null;
let celebrationEl = null;

// ── Badge nghệ sĩ ──
function getArtistBadge(artistName) {
    if (!artistName) return '';
    if (artistName.includes('Michelangelo')) return '🏛️';
    if (artistName.includes('Leonardo')) return '🎨';
    if (artistName.includes('van Gogh') || artistName.includes('Van Gogh')) return '🌻';
    return '🖼️';
}

// ── Tạo HUD tiến độ ──
function createHUD() {
    if (document.getElementById('quest-hud')) return document.getElementById('quest-hud');

    const hud = document.createElement('div');
    hud.id = 'quest-hud';
    hud.innerHTML = `
        <div class="quest-hud-inner">
            <div class="quest-hud-title">🗺️ Khám Phá Bảo Tàng</div>
            <div class="quest-hud-bar-wrap">
                <div class="quest-hud-bar-fill" id="quest-bar-fill"></div>
            </div>
            <div class="quest-hud-count" id="quest-hud-count">0 / ${TOTAL} bức tranh</div>
        </div>
    `;

    const style = `
        #quest-hud {
            position: fixed;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 50;
            pointer-events: none;
            font-family: Arial, Helvetica, sans-serif;
        }
        .quest-hud-inner {
            background: rgba(10, 8, 4, 0.82);
            border: 1px solid rgba(212, 175, 55, 0.5);
            border-radius: 10px;
            padding: 10px 16px;
            min-width: 190px;
            backdrop-filter: blur(6px);
            box-shadow: 0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.15);
        }
        .quest-hud-title {
            color: #d4af37;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 8px;
            opacity: 0.9;
            text-align: center;
        }
        .quest-hud-bar-wrap {
            background: rgba(255,255,255,0.08);
            border-radius: 4px;
            height: 6px;
            overflow: hidden;
            margin-bottom: 6px;
        }
        .quest-hud-bar-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #d4af37, #ffd700);
            border-radius: 4px;
            transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 0 8px rgba(212, 175, 55, 0.7);
        }
        .quest-hud-count {
            color: #f5e6c8;
            font-size: 13px;
            text-align: center;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
    document.body.appendChild(hud);
    return hud;
}

// ── Tạo notification ──
function createNotifEl() {
    if (document.getElementById('quest-notif')) return document.getElementById('quest-notif');

    const el = document.createElement('div');
    el.id = 'quest-notif';
    document.body.appendChild(el);

    const style = `
        #quest-notif {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(30px);
            z-index: 60;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: Arial, Helvetica, sans-serif;
        }
        #quest-notif.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .quest-notif-inner {
            background: rgba(10, 8, 4, 0.9);
            border: 1px solid rgba(212, 175, 55, 0.7);
            border-radius: 12px;
            padding: 12px 22px;
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(8px);
            box-shadow: 0 6px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.1);
            white-space: nowrap;
        }
        .quest-notif-icon {
            font-size: 22px;
        }
        .quest-notif-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .quest-notif-top {
            color: #d4af37;
            font-size: 13px;
        }
        .quest-notif-bottom {
            color: #f5e6c8;
            font-size: 11px;
            opacity: 0.8;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
    return el;
}

function showNotification(icon, topText, bottomText) {
    if (!notifEl) notifEl = createNotifEl();

    notifEl.innerHTML = `
        <div class="quest-notif-inner">
            <span class="quest-notif-icon">${icon}</span>
            <div class="quest-notif-text">
                <div class="quest-notif-top">${topText}</div>
                <div class="quest-notif-bottom">${bottomText}</div>
            </div>
        </div>
    `;

    notifEl.classList.add('show');
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notifEl.classList.remove('show');
    }, 3500);
}

function updateHUD() {
    const count = viewedPaintings.size;
    const pct = (count / TOTAL) * 100;
    const fill = document.getElementById('quest-bar-fill');
    const countEl = document.getElementById('quest-hud-count');
    if (fill) fill.style.width = pct + '%';
    if (countEl) countEl.textContent = `${count} / ${TOTAL} bức tranh`;
}

function launchConfetti() {
    const colors = ['#d4af37', '#ffd700', '#f5e6c8', '#ffffff', '#c0c0c8', '#b8860b'];
    const container = document.createElement('div');
    Object.assign(container.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999', overflow: 'hidden' });
    document.body.appendChild(container);

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @keyframes confettiFall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
            position: absolute;
            top: -10px;
            border-radius: 2px;
            animation: confettiFall linear forwards;
        }
    `;
    document.head.appendChild(styleEl);

    for (let i = 0; i < 120; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const size = 6 + Math.random() * 10;
            Object.assign(piece.style, {
                left: Math.random() * 100 + 'vw',
                width: size + 'px',
                height: size * (Math.random() > 0.5 ? 1 : 2.5) + 'px',
                background: colors[Math.floor(Math.random() * colors.length)],
                animationDuration: (2.5 + Math.random() * 2.5) + 's',
            });
            container.appendChild(piece);
            setTimeout(() => piece.remove(), 5500);
        }, Math.random() * 2000);
    }
    setTimeout(() => container.remove(), 7500);
}

// ── Chúc mừng ──
function showCelebration() {
    // Giải phóng chuột
    if (document.pointerLockElement) document.exitPointerLock();

    launchConfetti();
    celebrationEl = document.createElement('div');
    celebrationEl.id = 'quest-celebration';

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #quest-celebration {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(5, 4, 2, 0.88);
            backdrop-filter: blur(10px);
            font-family: Arial, Helvetica, sans-serif;
            animation: celebFadeIn 0.6s ease forwards;
            pointer-events: auto;
        }
        @keyframes celebFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .celeb-box {
            background: linear-gradient(160deg, #1a1408 0%, #0d0b06 100%);
            border: 2px solid #d4af37;
            border-radius: 20px;
            padding: 50px 60px;
            text-align: center;
            max-width: 520px;
            box-shadow: 0 0 80px rgba(212,175,55,0.3);
            animation: celebPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes celebPop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .celeb-medal { font-size: 72px; margin-bottom: 16px; display: block; filter: drop-shadow(0 0 20px rgba(212,175,55,0.9)); }
        .celeb-title { color: #d4af37; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .celeb-subtitle { color: #f5e6c8; font-size: 16px; opacity: 0.85; margin-bottom: 24px; line-height: 1.6; }
        .celeb-stats { display: flex; gap: 20px; justify-content: center; margin-bottom: 32px; }
        .celeb-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.2); border-radius: 10px; padding: 12px 20px; color: #f5e6c8; }
        .celeb-stat-num { font-size: 26px; color: #ffd700; font-weight: bold; display: block; }
        .celeb-stat-label { font-size: 11px; opacity: 0.7; text-transform: uppercase; }
        .celeb-close {
            background: linear-gradient(135deg, #d4af37, #b8860b);
            color: #1a1408;
            border: none;
            padding: 14px 36px;
            border-radius: 50px;
            font-size: 15px;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .celeb-close:hover { transform: scale(1.05); }
    `;
    document.head.appendChild(styleEl);

    celebrationEl.innerHTML = `
        <div class="celeb-box">
            <span class="celeb-medal">🏅</span>
            <div class="celeb-title">CHÚC MỪNG!</div>
            <div class="celeb-subtitle">Bạn đã hoàn thành hành trình khám phá toàn bộ bộ sưu tập bảo tàng!</div>
            <div class="celeb-stats">
                <div class="celeb-stat"><span class="celeb-stat-num">${TOTAL}</span><span class="celeb-stat-label">Tác Phẩm</span></div>
                <div class="celeb-stat"><span class="celeb-stat-num">3</span><span class="celeb-stat-label">Nghệ Sĩ</span></div>
                <div class="celeb-stat"><span class="celeb-stat-num">⭐</span><span class="celeb-stat-label">Hoàn Hảo</span></div>
            </div>
            <button class="celeb-close" id="celeb-close-btn">🔄 Khám Phá Lại Từ Đầu</button>
        </div>
    `;

    document.body.appendChild(celebrationEl);
    document.getElementById('celeb-close-btn').addEventListener('click', () => {
        window.location.reload(); 
    });
}

// ── API CHÍNH ──
export function onArtworkViewed(artInfo) {
    if (!artInfo || !artInfo.id || !PAINTING_IDS.has(artInfo.id)) return;
    if (viewedPaintings.has(artInfo.id)) return; 

    viewedPaintings.add(artInfo.id);
    updateHUD();

    const remaining = TOTAL - viewedPaintings.size;
    const badge = getArtistBadge(artInfo.artist);

    if (remaining === 0) {
        finalCompletionSound.currentTime = 0; 
        finalCompletionSound.play().catch(() => {});
        showNotification('🏅', `${badge} "${artInfo.title}" — Tranh thứ ${TOTAL}!`, '✨ Bạn đã khám phá toàn bộ!');
        setTimeout(() => showCelebration(), 2000);
        isCompleted = true;
    } else {
        achievementSound.currentTime = 0; 
        achievementSound.play().catch(() => {});
        showNotification('✅', `${badge} Đã xem: "${artInfo.title}"`, `Còn ${remaining} bức tranh nữa`);
    }
}

export function isPaintingViewed(artInfo) {
    return artInfo && artInfo.id ? viewedPaintings.has(artInfo.id) : false;
}

export function initQuestSystem() {
    if (questInitialized) return;
    questInitialized = true;
    hudEl = createHUD();
    notifEl = createNotifEl();
    updateHUD();
}