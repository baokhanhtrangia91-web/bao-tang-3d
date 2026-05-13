# 🏛️ Bảo Tàng Nghệ Thuật 3D

Trải nghiệm tham quan bảo tàng nghệ thuật thế giới ngay trên trình duyệt — không cần cài đặt, không cần plugin. Di chuyển tự do trong không gian 3D, đọc thông tin và nghe thuyết minh cho từng tác phẩm.

---

## ✨ Tính năng

- **Góc nhìn thứ nhất (First-Person)** — di chuyển tự do trong không gian bảo tàng 3D với va chạm tường 8 hướng
- **17 bức tranh** của 3 danh họa: Michelangelo, Leonardo da Vinci, Vincent van Gogh
- **10+ mô hình 3D** trưng bày trong các lồng kính và bệ đỡ (tượng David, Pietà, hoa hướng dương…)
- **Thuyết minh audio** riêng cho từng tác phẩm kèm phụ đề tự động
- **Hệ thống nhiệm vụ** — theo dõi tiến độ khám phá, badge theo họa sĩ, hiệu ứng hoàn thành
- **Chế độ ban đêm (Night Mode)** — gạt cầu dao tổng để tắt toàn bộ đèn, dùng đèn pin khám phá bảo tàng trong bóng tối; tranh nhấp nháy theo nhịp tim
- **Minimap** hiển thị vị trí và hướng nhìn theo thời gian thực (góc dưới trái)
- **Màn hình loading** với thanh tiến trình khi tải tài nguyên
- **Chụp ảnh màn hình** lưu trực tiếp về máy tính
- **Âm nhạc nền** ban ngày/ban đêm tách biệt, tự động chuyển đổi

---

## 🎮 Điều khiển

### Di chuyển

| Phím | Chức năng |
|------|-----------|
| `W` `A` `S` `D` | Di chuyển tiến / lùi / trái / phải |
| `Shift` | Chạy nhanh |
| `Ctrl` | Ngồi xuống (crouch) |
| `Space` | Nhảy |
| `Z` | Zoom (phóng to góc nhìn) |
| `Chuột` | Xoay góc nhìn |

### Tương tác

| Phím | Chức năng |
|------|-----------|
| `E` | Xem thông tin tác phẩm / Bật-tắt thuyết minh audio |
| `R` | Chụp ảnh màn hình |
| `ESC` | Nhả chuột / Mở menu |

### Chế độ ban đêm

| Phím / Hành động | Chức năng |
|------------------|-----------|
| `E` tại cầu dao điện | Bật / tắt toàn bộ điện trong bảo tàng |
| `F` | Bật / tắt đèn pin (chỉ khi đang ở chế độ ban đêm) |

> **Cầu dao điện** nằm tại sảnh chính — tiến lại gần và nhấn `E` để gạt.

---

## 🖼️ Tác phẩm trưng bày

### 🏛️ Michelangelo

| ID | Tác phẩm | Năm | Loại |
|----|----------|-----|------|
| 1 | The Creation of Adam | 1512 | Tranh |
| 2 | Doni Tondo | 1507 | Tranh |
| 3 | The Torment of Saint Anthony | 1487–1488 | Tranh |
| 4 | Crucifixion of Saint Peter | 1546–1550 | Tranh |
| 5 | Sistine Chapel Ceiling | 1508–1512 | Tranh |
| — | David | 1501–1504 | Tượng 3D |
| — | Pietà | 1498–1499 | Tượng 3D |

### 🎨 Leonardo da Vinci

| ID | Tác phẩm | Năm | Loại |
|----|----------|-----|------|
| 6 | Mona Lisa | 1503–1519 | Tranh |
| 7 | The Last Supper | 1495–1498 | Tranh |
| 8 | The Vitruvian Man | 1490 | Tranh |
| 9 | Lady with an Ermine | 1489–1490 | Tranh |
| 10 | The Virgin and Child with Saint Anne | 1503–1519 | Tranh |

### 🌻 Vincent van Gogh

| ID | Tác phẩm | Năm | Loại |
|----|----------|-----|------|
| 11 | The Starry Night | 1889 | Tranh |
| 12 | Bedroom in Arles | 1888 | Tranh |
| 13 | Café Terrace at Night | 1888 | Tranh |
| 14 | Wheatfield with Cypresses | 1889 | Tranh |
| 15 | Sunflowers | 1888 | Tranh |
| 16 | Self Portrait | 1888 | Tranh |
| 17 | The Potato Eaters | 1885 | Tranh |
| — | Ghế Van Gogh | — | Mô hình 3D |
| — | Hoa hướng dương | — | Mô hình 3D |
| — | Đèn dầu | — | Mô hình 3D |
| — | Chiếc ủng cũ | — | Mô hình 3D |

---

## 🚀 Cài đặt & Chạy

**Yêu cầu:** Node.js 18+

```bash
# 1. Clone project
git clone <repo-url>
cd bao-tang-3d

# 2. Cài dependencies
npm install

# 3. Chạy môi trường dev
# Tự động mở tại http://localhost:3000
npm run dev

# 4. Build production
npm run build

# 5. Preview bản build
npm run preview
```

---

## 🗂️ Cấu trúc thư mục

```
bao-tang-3d/
├── index.html               # HTML shell
├── main.js                  # Entry point — khởi tạo & vòng lặp animate
├── data.js                  # Dữ liệu toàn bộ tác phẩm (tranh + model)
├── vite.config.js           # Cấu hình Vite (port 3000, chunking, publicDir)
│
├── modules/
│   ├── scene.js             # Khởi tạo Three.js scene, camera, renderer, fog
│   ├── environment.js       # Tường, sàn, trần, đèn, bục, nội thất phòng
│   ├── artworks.js          # Load tranh + model 3D; mảng interactableObjects
│   ├── controls.js          # Di chuyển FPS, va chạm 8 hướng, trọng lực, zoom
│   ├── ui.js                # Raycast tương tác, tooltip, audio thuyết minh, phụ đề
│   ├── audioManager.js      # Nhạc nền ngày: play / pause / fade
│   ├── nightMode.js         # Chế độ ban đêm: cầu dao, đèn pin [F], hiệu ứng tranh
│   ├── questSystem.js       # Hệ thống nhiệm vụ: tiến độ xem tranh, badge, thông báo
│   ├── minimap.js           # Bản đồ góc dưới trái (vị trí + hướng nhìn)
│   ├── roomManager.js       # Quản lý phòng, chuyển cảnh theo vị trí camera
│   ├── coordinates.js       # Hiển thị tọa độ XYZ (debug)
│   └── screenshot.js        # Chụp và tải ảnh màn hình [R]
│
└── public/
    ├── tranh/
    │   ├── Michelangelo/        # 1.jpg → 5.jpg
    │   ├── Leonardo da Vinci/   # 6.jpg → 10.jpg
    │   └── Vincent van Gogh/    # 11.jpg → 17.jpg (jpg + png)
    ├── model/                   # .glb: David, Pietà, chandelier, chairvangogh…
    └── audio/
        ├── Michelangelo/        # 1.mp3 → 5.mp3 + david_statue.mp3, pieta.mp3…
        ├── Leonardo da Vinci/   # 6.mp3 → 10.mp3
        ├── Vincent van Gogh/    # 11.mp3 → 17.mp3 + tên tác phẩm
        └── 0sound effects/      # nhac1.mp3 (ngày), a.mp3 (đêm), r.mp3, m.mp3, x.mp3
```

---

## 🛠️ Công nghệ

| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| [Three.js](https://threejs.org/) | ^0.184.0 | Render 3D |
| [Vite](https://vitejs.dev/) | ^8.0.0 | Build tool, dev server |
| GLTFLoader + DRACOLoader | (bundled) | Load mô hình 3D nén |
| PointerLockControls | (bundled) | Điều khiển góc nhìn FPS |

---

## ⚙️ Thêm nội dung mới

### Thêm tranh

1. Đặt file ảnh vào `public/tranh/<Tên họa sĩ>/`
2. Đặt file audio vào `public/audio/<Tên họa sĩ>/`
3. Thêm entry vào `data.js`:

```js
{
    id: '18',
    title: 'Tên tranh',
    artist: 'Tên họa sĩ',
    year: '1900',
    desc: 'Mô tả ngắn hiển thị trên tooltip.',
    detail: 'Mô tả chi tiết hiển thị trong panel.',
    frameStyle: 'gold',   // gold | silver | wood | bronze | dark
    imageUrl: 'tranh/HọaSĩ/18.jpg',
    audioUrl: 'audio/HọaSĩ/18.mp3'
}
```

4. Thêm tọa độ vào `ARTWORKS_POSITION` trong `modules/artworks.js`:

```js
{ id: '18', w: 5, h: 7, x: 0, y: 5, z: -10, ry: 0 }
```

> **Lưu ý Night Mode:** nếu tranh mới cần hiệu ứng nhấp nháy đặc biệt, thêm ID vào `HAUNTED_IDS` trong `modules/nightMode.js`.

### Thêm mô hình 3D

1. Đặt file `.glb` vào `public/model/`
2. Thêm entry vào `data.js` với `type: 'model'`:

```js
{
    id: 'm18',
    type: 'model',
    title: 'Tên mô hình',
    artist: 'Tên họa sĩ',
    desc: 'Mô tả ngắn.',
    modelUrl: 'model/my-model.glb'
}
```

3. Thêm tọa độ vào `ARTWORKS_POSITION`:

```js
{ id: 'm18', x: 10, y: 0, z: 5, ry: 0, scale: 1.0 }
```

---

## 🌙 Chi tiết Night Mode

Khi kéo cầu dao điện (`E` lúc đứng gần):

- Toàn bộ đèn tắt, overlay tối phủ màn hình
- Đèn pin gắn camera bật tự động — nhấn `F` để bật/tắt
- Mona Lisa (ID `6`) phát sáng đỏ rực theo nhịp tim (~66 bpm)
- Các tranh cluster Leonardo (ID `7`–`10`) nhấp nháy xanh lân tinh
- Tất cả tranh còn lại nhấp nháy đỏ lệch pha ngẫu nhiên
- Đèn pin có hiệu ứng chớp giật horror ngẫu nhiên
- Nhạc nền horror riêng, tắt điện nhạc ngày tạm dừng
- Toàn bộ chữ trên màn hình đổi sang màu đỏ máu
- Gạt cầu dao lần hai để khôi phục trạng thái ban ngày

---

## 📌 Ghi chú

- Project chạy tốt nhất trên **Chrome** hoặc **Edge** (WebGL + PointerLock API)
- Cần **kết nối chuột** để khóa con trỏ và di chuyển góc nhìn
- Tài nguyên âm thanh phải được phục vụ qua HTTP — không chạy trực tiếp bằng `file://`
- Tọa độ XYZ hiện ở góc màn hình hữu ích khi cần định vị tác phẩm mới
