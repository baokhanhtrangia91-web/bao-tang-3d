import * as THREE from 'three';

export function setupScreenshot(renderer, scene, camera) {
    const btn = document.getElementById('screenshot-btn');

    function takeScreenshot() {
        // Tạm thời render lại scene chính trên toàn bộ màn hình
        // Việc này giúp bức ảnh lưu ra sạch sẽ, không bị dính Minimap vào góc
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissorTest(true);
        renderer.clear();
        renderer.render(scene, camera);

        try {
            // Lấy dữ liệu hình ảnh từ Canvas
            const dataURL = renderer.domElement.toDataURL('image/png');
            
            // Tạo thẻ <a> tàng hình để tự động tải file xuống
            const link = document.createElement('a');
            link.download = `BaoTang_Virtual_${Date.now()}.png`;
            link.href = dataURL;
            link.click();

            // Hiệu ứng chớp màn hình (Flash)
            showFlashEffect();
        } catch (err) {
            console.error("Lỗi khi chụp ảnh: ", err);
        }
    }

    function showFlashEffect() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100vw';
        flash.style.height = '100vh';
        flash.style.backgroundColor = '#ffffff';
        flash.style.zIndex = '9999';
        flash.style.opacity = '0.8';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 0.4s ease-out';
        
        document.body.appendChild(flash);

        // Kích hoạt mờ dần
        requestAnimationFrame(() => {
            flash.style.opacity = '0';
        });

        // Xóa DOM đi cho nhẹ máy sau khi chớp xong
        setTimeout(() => {
            if (document.body.contains(flash)) {
                document.body.removeChild(flash);
            }
        }, 400);
    }

    // --- Lắng nghe sự kiện ---

    // 1. Click nút trên màn hình (nếu đang Unlock chuột)
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            takeScreenshot();
        });
    }

    // 2. Bấm phím R (tiện lợi khi đang đi dạo First-Person)
    document.addEventListener('keydown', (e) => {
        // Nếu giữ lỳ phím R thì chỉ chụp 1 tấm, không chụp liên phanh gây lag
        if (e.repeat) return; 
        
        if (e.code === 'KeyR') {
            takeScreenshot();
        }
    });
}