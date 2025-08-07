-- Thêm cột phanTramGiamGia và trangThaiSale vào bảng ChiTietSanPham
ALTER TABLE ChiTietSanPham 
ADD phanTramGiamGia INT DEFAULT 0;

ALTER TABLE ChiTietSanPham 
ADD trangThaiSale NVARCHAR(20) DEFAULT N'INACTIVE';

-- Cập nhật comment cho các cột mới (nếu cần)
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Phần trăm giảm giá (0-100)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'ChiTietSanPham', 
    @level2type = N'COLUMN', @level2name = N'phanTramGiamGia';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Trạng thái sale: ACTIVE/INACTIVE', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'ChiTietSanPham', 
    @level2type = N'COLUMN', @level2name = N'trangThaiSale';

-- Tạo index để tối ưu query sale products
CREATE INDEX idx_chitiet_sale_status ON ChiTietSanPham(trangThaiSale, trangThai);

-- Kiểm tra kết quả
SELECT TOP 10 
    idChiTietSanPham, 
    idSanPham, 
    soLuong, 
    gia, 
    trangThai, 
    ngayTao,
    phanTramGiamGia,
    trangThaiSale
FROM ChiTietSanPham; 