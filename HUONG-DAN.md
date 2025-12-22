# 🎉 HƯỚNG DẪN CHẠY ỨNG DỤNG

## ✅ ĐÃ TẠO XONG:

### Giao diện gồm:
- ✅ Màn hình đăng nhập (màu xanh dương)
- ✅ Sidebar menu dọc bên trái
- ✅ Header với search & thông tin user
- ✅ Dashboard với thống kê
- ✅ Trang Khách hàng (mẫu)

---

## 🚀 CÁCH CHẠY:

### Bước 1: Copy thư mục `app` vào máy bạn
- Đặt ở: `C:\Projects\quan-ly-carton\`

### Bước 2: Mở Command Prompt
- Nhấn Windows + R
- Gõ: `cmd`
- Enter

### Bước 3: Di chuyển vào thư mục
```bash
cd C:\Projects\quan-ly-carton\app
```

### Bước 4: Cài đặt Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Bước 5: Chạy ứng dụng
```bash
npm start
```

⏳ Chờ 30-60 giây...

✅ Trình duyệt sẽ tự động mở: `http://localhost:3000`

---

## 🔐 ĐĂNG NHẬP:

**Tài khoản demo:**
- Username: `admin`
- Password: `123456`

---

## 🎨 TÍNH NĂNG HIỆN CÓ:

### ✅ Đăng nhập
- Form đẹp màu xanh dương
- Validate input
- Hiển thị lỗi

### ✅ Dashboard
- 4 thẻ thống kê (Doanh thu, Đơn hàng, SX, Công nợ)
- Bảng đơn hàng gần đây
- Màu sắc trực quan

### ✅ Khách hàng
- Danh sách dạng bảng
- Tìm kiếm
- Nút Thêm/Sửa/Xóa
- Hiển thị công nợ

### ✅ Sidebar Menu
- Dashboard
- Danh mục (Khách hàng, NCC, Thành phẩm)
- Đơn hàng (Xuất, Nhập)
- Sản xuất
- Tài chính (Hóa đơn, Thu/Chi)
- Báo cáo
- Đăng xuất

---

## 📱 RESPONSIVE:
- ✅ Desktop: Hiển thị đầy đủ
- ✅ Laptop: Menu thu gọn
- ⏳ Mobile: Sẽ làm sau

---

## 🎯 TIẾP THEO LÀM GÌ?

Sau khi bạn chạy được và xem giao diện, tôi sẽ:

1. Sửa giao diện nếu bạn muốn thay đổi
2. Làm HOÀN CHỈNH trang Khách hàng:
   - Form thêm/sửa
   - Xóa có xác nhận
   - Lưu vào LocalStorage (tạm thời)
3. Làm tiếp trang Đơn hàng xuất
4. Kết nối Database thật

---

## ⚠️ NẾU GẶP LỖI:

### Lỗi: "npm not found"
→ Chưa cài Node.js
→ Xem lại tài liệu "huong-dan-lap-trinh-chi-tiet.docx"

### Lỗi: "Module not found"
→ Chạy lại: `npm install`

### Màn hình trắng
→ Mở Console (F12) → Chụp ảnh lỗi → Gửi cho tôi

---

## 💡 GHI CHÚ:

- Code hiện tại chưa có Database (dữ liệu cứng)
- Đăng nhập chưa bảo mật (chỉ check cứng)
- Tính năng Thêm/Sửa/Xóa chưa hoạt động
- → Sẽ làm dần từng bước!

---

**Chúc bạn chạy thành công! 🎉**
