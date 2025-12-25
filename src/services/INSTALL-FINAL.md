# 🚀 HƯỚNG DẪN CÀI ĐẶT - CỰC KỲ ĐƠN GIẢN

## ⚡ CHỈ 3 BƯỚC - 2 PHÚT!

---

## 📁 BƯỚC 1: BACKUP FILE CŨ (BẮT BUỘC!)

### Cách 1: Đổi tên (KHUYẾN NGHỊ)
```
1. Mở: C:\Projects\app\src\pages\
2. Tìm file: Product.js
3. Click phải → Rename
4. Đổi tên thành: Product.js.backup
```

### Cách 2: Copy
```
1. Mở: C:\Projects\app\src\pages\Product.js
2. Ctrl + A (chọn tất cả)
3. Ctrl + C (copy)
4. Tạo file mới: Product.js.backup
5. Ctrl + V (paste)
6. Save
```

**⚠️ QUAN TRỌNG: Phải backup để khôi phục nếu lỗi!**

---

## 📦 BƯỚC 2: COPY 3 FILES MỚI

### File 1: FileUpload.js
```
TỪ: FileUpload-v2.js (file đã tải)
ĐẾN: C:\Projects\app\src\components\FileUpload.js

Cách làm:
1. Mở folder Downloads
2. Tìm file: FileUpload-v2.js
3. Click phải → Copy
4. Mở: C:\Projects\app\src\components\
5. Click phải → Paste
6. Đổi tên từ "FileUpload-v2.js" → "FileUpload.js"
```

---

### File 2: mockUploadService.js
```
TỪ: mockUploadService.js (file đã tải)
ĐẾN: C:\Projects\app\src\services\mockUploadService.js

Cách làm:
1. Mở: C:\Projects\app\src\
2. Tạo folder mới tên: services
3. Vào folder services
4. Copy file mockUploadService.js vào đây
```

---

### File 3: Product-COMPLETE.js → Product.js
```
TỪ: Product-COMPLETE.js (file đã tải)
ĐẾN: C:\Projects\app\src\pages\Product.js

Cách làm:
1. Mở folder Downloads
2. Tìm file: Product-COMPLETE.js
3. Click phải → Copy
4. Mở: C:\Projects\app\src\pages\
5. Click phải → Paste
6. Đổi tên từ "Product-COMPLETE.js" → "Product.js"
   (Nếu hỏi "File đã tồn tại" → Chọn "Replace/Thay thế")
```

---

## ▶️ BƯỚC 3: CHẠY & TEST

### Chạy app:
```bash
1. Mở Command Prompt hoặc PowerShell
2. Gõ: cd C:\Projects\app
3. Gõ: npm start
4. Đợi app chạy (khoảng 10-20 giây)
5. Trình duyệt tự động mở
```

### Test:
```
1. ✅ Vào trang "Thành phẩm"
2. ✅ Bảng có 2 cột mới: "Mã phim", "Mã khuôn"
3. ✅ Click "Thêm thành phẩm"
4. ✅ Cuộn xuống phần "Công đoạn"
5. ✅ Thấy:
   - Mã phim: [...]
   - File thiết kế (PDF/Ảnh): [Chọn file PDF]
   - Mã khuôn: [...]
   - File thiết kế (PDF/Ảnh): [Chọn file PDF]
6. ✅ Test upload 1 file
7. ✅ Lưu
8. ✅ Kiểm tra bảng → Click vào 📄
```

---

## ✅ CHECKLIST

```
□ Đã backup Product.js → Product.js.backup

□ Đã copy FileUpload-v2.js → components/FileUpload.js

□ Đã tạo folder: src/services

□ Đã copy mockUploadService.js → services/mockUploadService.js

□ Đã copy Product-COMPLETE.js → pages/Product.js (thay thế)

□ npm start chạy không lỗi

□ Bảng Thành phẩm có 2 cột mới

□ Form có nút upload file

□ Upload file test thành công
```

---

## 📁 CẤU TRÚC SAU KHI CÀI ĐẶT

```
C:\Projects\app\src\
├── components\
│   ├── FileUpload.js          ✅ MỚI (từ FileUpload-v2.js)
│   ├── TextInput.js           (cũ)
│   └── TextArea.js            (cũ)
│
├── services\
│   └── mockUploadService.js   ✅ MỚI
│
└── pages\
    ├── Product.js             ✅ MỚI (từ Product-COMPLETE.js)
    ├── Product.js.backup      ✅ BACKUP (file cũ)
    └── ...
```

---

## 🆘 NẾU GẶP LỖI

### Lỗi "Cannot find module FileUpload":
```
→ Kiểm tra file: C:\Projects\app\src\components\FileUpload.js
→ Tên file PHẢI là: FileUpload.js (KHÔNG có -v2)
```

### Lỗi "Cannot find module mockUploadService":
```
→ Kiểm tra folder: C:\Projects\app\src\services\ đã tạo chưa?
→ Kiểm tra file: C:\Projects\app\src\services\mockUploadService.js
```

### App không chạy / Màn hình trắng:
```
1. Mở Command Prompt
2. Gõ: cd C:\Projects\app
3. Gõ: npm start
4. Xem lỗi gì hiển thị
5. Chụp màn hình gửi tôi
```

### Muốn khôi phục file cũ:
```
1. Mở: C:\Projects\app\src\pages\
2. Xóa: Product.js (file mới)
3. Đổi tên: Product.js.backup → Product.js
4. npm start lại
```

---

## 💡 LƯU Ý

### File Downloads:
```
Tìm 3 files trong folder Downloads:
1. FileUpload-v2.js
2. mockUploadService.js
3. Product-COMPLETE.js
```

### Đổi tên file:
```
FileUpload-v2.js → FileUpload.js
Product-COMPLETE.js → Product.js
```

### Thay thế file:
```
Khi copy Product-COMPLETE.js vào pages/
Nếu hỏi "File already exists"
→ Chọn "Replace" hoặc "Thay thế"
```

---

## 🎯 TÓM TẮT SIÊU NGẮN

```
BACKUP:
Product.js → Product.js.backup

COPY:
FileUpload-v2.js → components/FileUpload.js
mockUploadService.js → services/mockUploadService.js
Product-COMPLETE.js → pages/Product.js

RUN:
npm start
```

---

**BẮT ĐẦU TỪ BƯỚC 1 - BACKUP TRƯỚC NHÉ!** 🔒✨
