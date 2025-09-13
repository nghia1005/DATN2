
{
  "idSanPham": 1,
  "maSanPham": "SP001",
  "tenSanPham": "Giày Nike Air Max",
  "idThuongHieu": 1,
  "tenThuongHieu": "Nike",
  "idDanhMuc": 1,
  "tenDanhMuc": "Giày thể thao",
  "trangThai": true
}
```

### 2. ChiTietSanPhamDTO
```json
{
  "idChiTietSanPham": 1,
  "idSanPham": 1,
  "tenSanPham": "Giày Nike Air Max",
  "maSanPham": "SP001",
  "idMauSac": 1,
  "tenMauSac": "Đen",
  "idKichCo": 1,
  "tenKichCo": "42",
  "idHinhAnh": 1,
  "duongDanHinhAnh": "https://example.com/image.jpg",
  "soLuong": 10,
  "gia": 1500000.00,
  "trangThai": "Còn hàng",
  "ngayTao": "2024-01-15"
}
```

## API Endpoints với DTO

### SanPham APIs
- `GET /san-pham/hien-thi` - Lấy danh sách sản phẩm (trả về List<SanPhamDTO>)
- `GET /san-pham/chi-tiet/{id}` - Lấy chi tiết sản phẩm (trả về SanPhamDTO)
- `POST /san-pham/them` - Thêm sản phẩm mới (nhận SanPhamDTO)
- `PUT /san-pham/sua/{id}` - Cập nhật sản phẩm (nhận SanPhamDTO)
- `DELETE /san-pham/xoa/{id}` - Xóa sản phẩm

### ChiTietSanPham APIs
- `GET /chi-tiet-san-pham/hien-thi` - Lấy danh sách chi tiết sản phẩm
- `GET /chi-tiet-san-pham/chi-tiet/{id}` - Lấy chi tiết theo ID
- `GET /chi-tiet-san-pham/san-pham/{sanPhamId}` - Lấy theo sản phẩm
- `POST /chi-tiet-san-pham/them` - Thêm chi tiết sản phẩm
- `PUT /chi-tiet-san-pham/sua/{id}` - Cập nhật chi tiết sản phẩm
- `DELETE /chi-tiet-san-pham/xoa/{id}` - Xóa chi tiết sản phẩm

## Response Format

Tất cả API đều trả về format chuẩn:

### Success Response
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "data": {
    "tenSanPham": "Tên sản phẩm không được để trống",
    "maSanPham": "Mã sản phẩm không được để trống"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

## Validation

DTO sử dụng Bean Validation annotations:

- `@NotBlank` - Không được để trống cho String
- `@NotNull` - Không được null
- `@Min(value = 0)` - Giá trị tối thiểu

## Mapper

Sử dụng Mapper pattern để chuyển đổi giữa Entity và DTO:

- `SanPhamMapper` - Chuyển đổi SanPham ↔ SanPhamDTO
- `ChiTietSanPhamMapper` - Chuyển đổi ChiTietSanPham ↔ ChiTietSanPhamDTO

## Lợi ích của DTO

1. **Bảo mật**: Ẩn thông tin nhạy cảm từ Entity
2. **Linh hoạt**: Có thể thay đổi API response mà không ảnh hưởng Entity
3. **Tách biệt**: Tách biệt layer presentation và domain
4. **Validation**: Validation riêng biệt cho API
5. **Performance**: Chỉ truyền dữ liệu cần thiết

## Ví dụ sử dụng

### Thêm sản phẩm mới
```bash
POST /san-pham/them
Content-Type: application/json

{
  "maSanPham": "SP002",
  "tenSanPham": "Giày Adidas Ultraboost",
  "idThuongHieu": 2,
  "idDanhMuc": 1,
  "trangThai": true
}
```

### Thêm chi tiết sản phẩm
```bash
POST /chi-tiet-san-pham/them
Content-Type: application/json

{
  "idSanPham": 1,
  "idMauSac": 1,
  "idKichCo": 2,
  "soLuong": 15,
  "gia": 2000000.00,
  "trangThai": "Còn hàng"
}
``` 