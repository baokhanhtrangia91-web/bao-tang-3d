// Dữ liệu các bức tranh trong bảo tàng
// x, y, z: vị trí trong không gian 3D
// rotY: góc xoay quanh trục Y (radian)
// image: đường dẫn ảnh tranh (thay bằng ảnh thực của bạn)

export const artworkData = [
    // --- Tường bên trái (x = -9.8, quay về phải) ---
    { id: 1, title: 'Tác phẩm 1', image: '/images/art1.jpg', x: -9.8, y: 2, z: -8,  rotY: -Math.PI / 2 },
    { id: 2, title: 'Tác phẩm 2', image: '/images/art2.jpg', x: -9.8, y: 2, z:  0,  rotY: -Math.PI / 2 },
    { id: 3, title: 'Tác phẩm 3', image: '/images/art3.jpg', x: -9.8, y: 2, z:  8,  rotY: -Math.PI / 2 },

    // --- Tường bên phải (x = 9.8, quay về phải - úp vào tường) ---
    { id: 4, title: 'Tác phẩm 4', image: '/images/art4.jpg', x:  9.8, y: 2, z: -8,  rotY: Math.PI / 2 },
    { id: 5, title: 'Tác phẩm 5', image: '/images/art5.jpg', x:  9.8, y: 2, z:  0,  rotY: Math.PI / 2 },
    { id: 6, title: 'Tác phẩm 6', image: '/images/art6.jpg', x:  9.8, y: 2, z:  8,  rotY: Math.PI / 2 },

    // --- Tường sau (z = -14.8, quay về phía sau - úp vào tường) ---
    { id: 7, title: 'Tác phẩm 7', image: '/images/art7.jpg', x: -4,   y: 2, z: -14.8, rotY: Math.PI },
    { id: 8, title: 'Tác phẩm 8', image: '/images/art8.jpg', x:  4,   y: 2, z: -14.8, rotY: Math.PI },
];