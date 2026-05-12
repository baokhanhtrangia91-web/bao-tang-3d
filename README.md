<<<<<<< HEAD
# 🏛️ Bảo Tàng Nghệ Thuật Virtual 3D (Demo)
=======
# 🏛️ Bảo Tàng Nghệ Thuật Virtual 3D(New)
>>>>>>> d37ced204efe3744beda516baea83e34b93d9ce1

Trải nghiệm tham quan bảo tàng nghệ thuật thế giới ngay trên trình duyệt — không cần cài đặt, không cần plugin. Di chuyển tự do trong không gian 3D, đọc thông tin và nghe thuyết minh cho từng tác phẩm.

---

## ✨ Tính năng

- **Góc nhìn thứ nhất (First-Person)** — di chuyển tự do trong không gian bảo tàng 3D
- **17 bức tranh** của 3 danh họa: Michelangelo, Leonardo da Vinci, Vincent van Gogh
- **10 mô hình 3D** trưng bày trong các lồng kính và bệ đỡ
- **Thuyết minh audio** cho từng tác phẩm kèm phụ đề
- **Minimap** hiển thị vị trí và hướng nhìn theo thời gian thực
- **Va chạm tường** — không thể đi xuyên qua vật thể
- **Chụp ảnh màn hình** lưu về máy tính

---

## 🎮 Điều khiển

| Phím | Chức năng |
|------|-----------|
| `W` `A` `S` `D` | Di chuyển |
| `Chuột` | Nhìn xung quanh |
| `Shift` | Chạy nhanh |
| `Ctrl` | Ngồi xuống |
| `Space` | Nhảy |
| `Z` | Zoom (phóng to) |
| `E` | Xem thông tin / Bật-tắt thuyết minh |
| `R` | Chụp ảnh màn hình |
| `ESC` | Thoát / Mở menu |

---

## 🖼️ Tác phẩm trưng bày

### Michelangelo
| Tác phẩm | Năm | Loại |
|----------|-----|------|
| The Creation of Adam | 1512 | Tranh |
| Doni Tondo | — | Tranh |
| The Torment of Saint Anthony | — | Tranh |
| Thánh Peter bị đóng đinh | — | Tranh |
| Trần Nhà nguyện Sistine | 1508–1512 | Tranh |
| David | — | Tượng 3D |
| Pietà | — | Tượng 3D |

### Leonardo da Vinci
| Tác phẩm | Năm | Loại |
|----------|-----|------|
| Mona Lisa | 1503–1519 | Tranh |
| The Last Supper | 1495–1498 | Tranh |
| The Vitruvian Man | 1490 | Tranh |
| Lady with an Ermine | 1489–1490 | Tranh |
| The Virgin and Child with Saint Anne | 1503–1519 | Tranh |

### Vincent van Gogh
| Tác phẩm | Năm | Loại |
|----------|-----|------|
| The Starry Night | 1889 | Tranh |
| Bedroom in Arles | 1888 | Tranh |
| Café Terrace at Night | 1888 | Tranh |
| Wheatfield with Cypresses | 1889 | Tranh |
| Sunflowers | — | Tranh |
| Self Portrait | 1888 | Tranh |
| Đêm đầy sao (3D) | — | Mô hình 3D |
| Sunflowers (3D) | — | Mô hình 3D |
| Chair (3D) | — | Mô hình 3D |
| Oil Lamp (3D) | — | Mô hình 3D |
| Old Boot (3D) | — | Mô hình 3D |

---

## 🚀 Cài đặt & Chạy

**Yêu cầu:** Node.js 18+

```bash
# 1. Clone project
git clone <repo-url>
cd bao-tang-3d

# 2. Cài dependencies
npm install

# 3. Chạy môi trường dev (mở tự động tại localhost:3000)
npm run dev

# 4. Build production
npm run build
```

---

## 🗂️ Cấu trúc thư mục

```
bao-tang-3d-khang/
├── main.js                  # Entry point, vòng lặp animate
├── data.js                  # Dữ liệu tất cả tác phẩm
├── index.html               # HTML shell
├── style.css                # CSS global
├── vite.config.js           # Cấu hình Vite
│
├── modules/
│   ├── scene.js             # Khởi tạo Three.js scene, camera, renderer
│   ├── environment.js       # Tường, sàn, trần, đèn, bục, đồ nội thất
│   ├── artworks.js          # Load tranh và model 3D vào scene
│   ├── controls.js          # Di chuyển, va chạm, trọng lực
│   ├── ui.js                # Tương tác tranh, audio, tooltip
│   ├── minimap.js           # Bản đồ góc dưới trái
│   ├── coordinates.js       # Hiển thị tọa độ XYZ
│   └── screenshot.js        # Chụp và lưu ảnh màn hình
│
├── model/                   # File .glb (mô hình 3D) và texture phòng
├── tranh/                   # Ảnh các tác phẩm (theo thư mục họa sĩ)
└── audio/                   # File .mp3 thuyết minh (theo thư mục họa sĩ)
```

---

## 🛠️ Công nghệ

- **[Three.js](https://threejs.org/)** — render 3D
- **[Vite](https://vitejs.dev/)** — build tool
- **GLTFLoader + DRACOLoader** — load mô hình 3D nén
- **PointerLockControls** — điều khiển góc nhìn first-person

---

## ⚙️ Thêm tác phẩm mới

**Thêm tranh:**

1. Đặt file ảnh vào `tranh/<Tên họa sĩ>/`
2. Thêm entry vào `data.js`:
```js
{
    id: 'XX',
    title: 'Tên tranh',
    artist: 'Tên họa sĩ',
    year: '1900',
    desc: 'Mô tả ngắn.',
    detail: 'Mô tả chi tiết.',
    frameStyle: 'gold',        // gold | silver | wood | bronze | dark
    imageUrl: 'tranh/HọaSĩ/XX.jpg',
    audioUrl: 'audio/HọaSĩ/XX.mp3'
}
```
3. Thêm tọa độ vào `ARTWORKS_POSITION` trong `modules/artworks.js`:
```js
{ id: 'XX', w: 5, h: 7, x: 0, y: 5, z: -10, ry: 0 }
```

**Thêm mô hình 3D:**

1. Đặt file `.glb` vào `model/`
2. Thêm entry vào `data.js` với `type: 'model'`
3. Thêm tọa độ vào `ARTWORKS_POSITION`:
```js
{ id: 'mXX', x: 10, y: 0, z: 5, ry: 0, scale: 1.0 }
```
