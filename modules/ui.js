// Module UI — hiển thị thông tin tranh, thông báo, v.v.

export function setupUI() {
    // Tạo label tên tranh (hiện khi nhìn gần)
    const label = document.createElement('div');
    label.id = 'artwork-label';
    label.style.cssText = `
        position: absolute; bottom: 60px; left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.6);
        color: #d4af37; font-family: sans-serif;
        padding: 8px 20px; border: 1px solid #d4af37;
        display: none; pointer-events: none;
        font-size: 0.95rem; letter-spacing: 1px;
    `;
    document.body.appendChild(label);
    return { label };
}
