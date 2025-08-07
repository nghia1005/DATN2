# Hướng dẫn Setup Hệ thống Quản lý Khách hàng

## 🎯 Tổng quan
Hệ thống quản lý khách hàng đã được hoàn thiện với đầy đủ chức năng:
- ✅ Hiển thị danh sách khách hàng
- ✅ Tìm kiếm khách hàng
- ✅ Thêm/sửa khách hàng
- ✅ Chuyển đổi trạng thái (Hoạt động/Khóa)
- ✅ Xác thực email
- ✅ Quản lý địa chỉ (thêm, sửa, xóa, đặt mặc định)

## 📋 Các file đã tạo/cập nhật

### Backend (Java Spring Boot)
1. **KhachHangController.java** - API endpoints cho khách hàng và địa chỉ
2. **KhachHangService.java** - Logic nghiệp vụ khách hàng
3. **DiaChiService.java** - Logic nghiệp vụ địa chỉ
4. **KhachHangDTO.java** - Data Transfer Object cho khách hàng
5. **KhachHangRepository.java** - Repository với các method tìm kiếm
6. **DiaChiRepository.java** - Repository cho địa chỉ

### Frontend (NextJS/React)
1. **dashboard/page.tsx** - Đã import KhachHangTable
2. **KhachHangTable.tsx** - Bảng hiển thị khách hàng
3. **KhachHangForm.tsx** - Form thêm/sửa khách hàng
4. **DiaChiList.tsx** - Quản lý địa chỉ
5. **api.ts** - Các hàm gọi API

## 🚀 Các bước chạy hệ thống

### 1. Database Setup
```sql
-- Chạy script UPDATE_DATABASE.sql trong SQL Server Management Studio
-- Hoặc chạy từng lệnh SQL trong file đó
```

### 2. Backend (Port 8080)
```bash
cd src/main/java/org/example/duan
mvn spring-boot:run
```

### 3. Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

## 🔍 Kiểm tra API

### Test các API endpoints:
```bash
# Lấy danh sách khách hàng
GET http://localhost:8080/khach-hang

# Tìm kiếm khách hàng
GET http://localhost:8080/khach-hang/search?keyword=Nguyễn

# Lấy địa chỉ của khách hàng
GET http://localhost:8080/khach-hang/1/dia-chi

# Thêm khách hàng mới
POST http://localhost:8080/khach-hang
Content-Type: application/json

{
  "maKhachHang": "KH011",
  "tenKhachHang": "Nguyễn Văn Test",
  "gioiTinh": true,
  "soDienThoai": "0901234567",
  "email": "test@example.com",
  "trangThai": "Hoạt động",
  "emailXacThuc": false
}
```

## 🎨 Giao diện Frontend

### Truy cập:
- URL: http://localhost:3000/dashboard
- Chọn menu "Quản lý khách hàng" từ sidebar

### Chức năng có sẵn:
- 🔍 **Tìm kiếm**: Theo tên, email, mã khách hàng
- ➕ **Thêm khách hàng**: Form validation đầy đủ
- ✏️ **Sửa khách hàng**: Cập nhật thông tin
- 🔒 **Khóa/Mở khóa**: Chuyển đổi trạng thái
- ✅ **Xác thực email**: Toggle switch
- 📍 **Quản lý địa chỉ**: Thêm, sửa, xóa, đặt mặc định

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **"Lỗi tải dữ liệu khách hàng!"**
   - Kiểm tra backend có chạy không (port 8080)
   - Kiểm tra database connection
   - Kiểm tra console browser (F12)

2. **"CORS error"**
   - Backend đã có `@CrossOrigin(origins = "*")`
   - Kiểm tra URL API trong frontend

3. **"404 Not Found"**
   - Kiểm tra endpoint URL
   - Kiểm tra controller mapping

4. **Database connection error**
   - Kiểm tra SQL Server có chạy không
   - Kiểm tra credentials trong application.properties
   - Kiểm tra database QLBanGiay có tồn tại không

### Debug steps:
1. Mở DevTools (F12) → Console tab
2. Kiểm tra Network tab khi gọi API
3. Kiểm tra backend logs
4. Test API bằng Postman

## 📊 Database Schema

### Bảng KhachHang:
- idKhachHang (PK)
- maKhachHang (unique)
- tenKhachHang
- gioiTinh (bit)
- soDienThoai
- email (unique)
- trangThai
- emailXacThuc (bit)

### Bảng DiaChi:
- idDiaChi (PK)
- idKhachHang (FK)
- thanhPho
- quanHuyen
- xaPhuong
- ngoNgach
- ghiChu
- macDinh

## ✅ Checklist hoàn thành

- [x] Backend API endpoints
- [x] Frontend components
- [x] Database schema
- [x] CRUD operations
- [x] Search functionality
- [x] Address management
- [x] Status toggle
- [x] Email verification
- [x] Form validation
- [x] Error handling
- [x] CORS configuration

## 🎉 Kết quả

Hệ thống quản lý khách hàng đã hoàn thiện và sẵn sàng sử dụng!
- Backend: RESTful APIs đầy đủ
- Frontend: Giao diện thân thiện, responsive
- Database: Schema tối ưu, dữ liệu mẫu
- Integration: Kết nối mượt mà giữa frontend-backend 