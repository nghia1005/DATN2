# Hướng dẫn restart và test sau khi sửa lỗi

## Các thay đổi đã thực hiện

### 1. Sửa Entity và DTO
- ✅ `SanPham`: `trangThai` từ `Boolean` → `String`
- ✅ `SanPhamDTO`: `trangThai` từ `Boolean` → `String`
- ✅ `ChiTietSanPham`: đã đúng kiểu `String`
- ✅ `ChiTietSanPhamDTO`: đã đúng kiểu `String`

### 2. Sửa Repository
- ✅ `SanPhamRepository`: truy vấn từ `= true` → `= 'Đang bán'`

### 3. Cấu hình Hibernate
- ✅ Tắt cache để force refresh
- ✅ Thêm JpaConfig để scan Entity rõ ràng
- ✅ Cấu hình để không tự động map tất cả bảng

## Bước restart

### 1. Clean và Build
```bash
mvn clean compile
```

### 2. Restart Application
```bash
mvn spring-boot:run
```

### 3. Test API
```bash
# Test lấy danh sách sản phẩm
GET http://localhost:8080/san-pham/hien-thi

# Test lấy chi tiết sản phẩm
GET http://localhost:8080/san-pham/chi-tiet/1

# Test thêm sản phẩm
POST http://localhost:8080/san-pham/them
Content-Type: application/json

{
  "maSanPham": "SP006",
  "tenSanPham": "Giày Test",
  "idThuongHieu": 1,
  "idDanhMuc": 1,
  "trangThai": "Đang bán"
}
```

## Nếu vẫn còn lỗi

### Kiểm tra log
- Xem log startup có lỗi gì không
- Xem log SQL được generate ra sao

### Kiểm tra database
- Đảm bảo dữ liệu trong DB đúng kiểu `NVARCHAR`
- Không có dữ liệu `NULL` hoặc sai kiểu

### Kiểm tra Entity mapping
- Đảm bảo tên cột trong `@Column` khớp với DB
- Đảm bảo kiểu dữ liệu khớp với DB 