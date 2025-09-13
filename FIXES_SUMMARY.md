# Tóm tắt các sửa đổi để khắc phục lỗi

## Lỗi gốc
```
Conversion failed when converting the nvarchar value 'Đang bán' to data type int.
```

## Nguyên nhân
- Entity `SanPham` có trường `trangThai` kiểu `Boolean` nhưng database là `NVARCHAR(20)`
- Các truy vấn trong Repository so sánh `trangThai = true` (Boolean) thay vì `trangThai = 'Đang bán'` (String)
- Một số DTO có trường `trangThai` không tồn tại trong Entity tương ứng

## Các sửa đổi đã thực hiện

### 1. Entity SanPham
```java
// Trước
@Column(name = "trangThai", nullable = false)
private Boolean trangThai;

// Sau
@Column(name = "trangThai", nullable = false)
private String trangThai;
```

### 2. DTO SanPhamDTO
```java
// Trước
@NotNull(message = "Trạng thái không được để trống")
private Boolean trangThai;

// Sau
@NotBlank(message = "Trạng thái không được để trống")
private String trangThai;
```

### 3. Repository SanPhamRepository
```java
// Trước
@Query("SELECT DISTINCT s FROM SanPham s WHERE s.trangThai = true")

// Sau
@Query("SELECT DISTINCT s FROM SanPham s WHERE s.trangThai = 'Đang bán'")
```

### 4. Loại bỏ trường trangThai không cần thiết
Các DTO sau đã được loại bỏ trường `trangThai` vì Entity tương ứng không có:
- `ThuongHieuDTO`
- `DanhMucDTO`
- `MauSacDTO`
- `KichCoDTO`
- `HinhAnhDTO`

## Kết quả
- Tất cả trường `trangThai` giờ đây đều là kiểu `String` khớp với database
- Các truy vấn đã được sửa để so sánh đúng kiểu dữ liệu
- Loại bỏ các trường không tồn tại trong database

## Lưu ý
- Entity `ChiTietSanPham` đã có trường `trangThai` kiểu `String` nên không cần sửa
- Các giá trị trạng thái trong database: `'Đang bán'`, `'Ngừng bán'`, `'Còn hàng'`, `'Hết hàng'`, etc. 