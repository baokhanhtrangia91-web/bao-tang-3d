import { defineConfig } from 'vite';

export default defineConfig({
  // 1. Chỉ định thư mục chứa tài nguyên tĩnh (tranh, model 3D của Người 3)
  publicDir: 'public',

  server: {
    port: 3000,    // Đặt cổng 3000 cho cả nhóm thống nhất
    open: true,    // Tự động mở trình duyệt khi gõ npm run dev
    host: true     // Cho phép xem web qua điện thoại bằng địa chỉ IP (để test di chuyển)
  },

  build: {
    outDir: 'dist',          // Thư mục chứa sản phẩm cuối cùng sau khi build
    assetsInlineLimit: 0,    // Giữ nguyên file ảnh/3D, không biến chúng thành code base64 (giúp load nhanh hơn)
    chunkSizeWarningLimit: 1000, // Tăng giới hạn cảnh báo dung lượng vì thư viện Three.js khá nặng

    rollupOptions: {
      output: {
        // Gom thư viện Three.js vào một file riêng để trình duyệt tải hiệu quả hơn
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});