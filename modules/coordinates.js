// =====================================================
// coordinates.js — TÍCH HỢP BẢNG TỌA ĐỘ VÀ FPS COUNTER
// Cải tiến: Tối ưu bộ đếm FPS và xử lý phím F3
// =====================================================

export function setupCoordinates(camera, renderer) {
    // ─── 1. BẢNG TỌA ĐỘ ──────────────────────────────
    const coordsDOM = document.getElementById('coords-ui');
    let lastX = null, lastY = null, lastZ = null;

    // ─── 2. FPS COUNTER ──────────────────────────────
    let showFPS = false;
    let frames = 0;
    let lastTime = performance.now();

    // Tự động tạo hoặc lấy DOM cho FPS
    const fpsDOM = (() => {
        let el = document.getElementById('fps-counter');
        if (!el) {
            el = document.createElement('div');
            el.id = 'fps-counter';
            Object.assign(el.style, {
                position:   'absolute',
                top:        '60px',
                right:      '20px',
                color:      '#00ff00',
                fontFamily: 'monospace',
                fontSize:   '13px',
                background: 'rgba(0,0,0,0.6)',
                padding:    '4px 10px',
                borderRadius: '4px',
                display:    'none', // Mặc định ẩn
                zIndex:     '100',
                pointerEvents: 'none' // Không cản trở click chuột
            });
            document.body.appendChild(el);
        }
        return el;
    })();

    // Lắng nghe phím F3 để Bật/Tắt FPS
    document.addEventListener('keydown', (e) => {
        if (e.code === 'F3') {
            e.preventDefault(); // Ngăn chặn chức năng tìm kiếm mặc định của trình duyệt
            showFPS = !showFPS;
            fpsDOM.style.display = showFPS ? 'block' : 'none';
            
            // Reset dữ liệu khi vừa bật để con số hiển thị chính xác ngay lập tức
            if (showFPS) {
                frames = 0;
                lastTime = performance.now();
                fpsDOM.textContent = "FPS: ... | Draw: ...";
            }
        }
    });

    // ─── 3. HÀM UPDATE CHUNG ─────────────────────────
    function update() {
        // Cập nhật tọa độ (Chỉ ghi ra DOM khi giá trị thay đổi để tối ưu hiệu năng)[cite: 21]
        if (coordsDOM && coordsDOM.style.display !== 'none') {
            const x = camera.position.x.toFixed(1);
            const y = camera.position.y.toFixed(1);
            const z = camera.position.z.toFixed(1);

            if (x !== lastX || y !== lastY || z !== lastZ) {
                coordsDOM.innerHTML = `X: ${x} &nbsp;|&nbsp; Y: ${y} &nbsp;|&nbsp; Z: ${z}`;
                lastX = x; lastY = y; lastZ = z;
            }
        }

        // Cập nhật FPS khi showFPS được bật
        if (showFPS) {
            frames++;
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;

            // Cập nhật thông số mỗi 0.5 giây để tránh số nhảy quá nhanh gây mỏi mắt
            if (elapsed >= 500) { 
                const fps = Math.round((frames * 1000) / elapsed);
                // Lấy Draw calls từ renderer.info để theo dõi độ phức tạp của scene[cite: 12]
                const drawCalls = renderer ? renderer.info.render.calls : 0;
                
                fpsDOM.textContent = `FPS: ${fps} | Draw: ${drawCalls}`;
                
                // Chuẩn bị cho chu kỳ đếm tiếp theo
                frames = 0;
                lastTime = currentTime;
            }
        }
    }

    return { update };
}