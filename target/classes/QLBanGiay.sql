CREATE DATABASE QLBanGiay;
GO
USE QLBanGiay;
GO
CREATE TABLE VaiTro (
    idVaiTro INT PRIMARY KEY IDENTITY,
    tenVaiTro NVARCHAR(50)
);

CREATE TABLE TaiKhoan (
    idTaiKhoan INT PRIMARY KEY IDENTITY,
    idVaiTro INT,
    tenTaiKhoan NVARCHAR(100),
    matKhau NVARCHAR(100),
    trangThai NVARCHAR(20),
    FOREIGN KEY (idVaiTro) REFERENCES VaiTro(idVaiTro)
);

CREATE TABLE NhanVien (
    idNhanVien INT PRIMARY KEY IDENTITY,
    idTaiKhoan INT,
    maNhanVien NVARCHAR(50) UNIQUE,
    tenNhanVien NVARCHAR(100),
    ngaySinh DATE,
    gioiTinh BIT,
    soDienThoai NVARCHAR(20),
    email NVARCHAR(100),
    diaChi NVARCHAR(255),
    FOREIGN KEY (idTaiKhoan) REFERENCES TaiKhoan(idTaiKhoan)
);

CREATE TABLE KhachHang (
    idKhachHang INT PRIMARY KEY IDENTITY,
    idTaiKhoan INT,
    maKhachHang NVARCHAR(50) UNIQUE,
    tenKhachHang NVARCHAR(100),
    ngaySinh DATE,
    gioiTinh BIT,
    soDienThoai NVARCHAR(20),
    email NVARCHAR(100),
    trangThai NVARCHAR(20),
    FOREIGN KEY (idTaiKhoan) REFERENCES TaiKhoan(idTaiKhoan)
);

CREATE TABLE ThuongHieu (
    idThuongHieu INT PRIMARY KEY IDENTITY,
    tenThuongHieu NVARCHAR(100)
);

CREATE TABLE DanhMuc (
    idDanhMuc INT PRIMARY KEY IDENTITY,
    tenDanhMuc NVARCHAR(100)
);

CREATE TABLE MauSac (
    idMauSac INT PRIMARY KEY IDENTITY,
    mauSac NVARCHAR(50)
);

CREATE TABLE KichCo (
    idKichCo INT PRIMARY KEY IDENTITY,
    kichCo NVARCHAR(50)
);

CREATE TABLE SanPham (
    idSanPham INT PRIMARY KEY IDENTITY,
    maSanPham NVARCHAR(50) UNIQUE,
    tenSanPham NVARCHAR(100),
    idThuongHieu INT,
    idDanhMuc INT,
    moTa NVARCHAR(MAX),
    trangThai NVARCHAR(20),
    FOREIGN KEY (idThuongHieu) REFERENCES ThuongHieu(idThuongHieu),
    FOREIGN KEY (idDanhMuc) REFERENCES DanhMuc(idDanhMuc)
);

CREATE TABLE HinhAnh (
    idHinhAnh INT PRIMARY KEY IDENTITY,
    tenHinhAnh NVARCHAR(255),
    urlHinhAnh NVARCHAR(MAX)
);

CREATE TABLE ChiTietSanPham (
    idChiTietSanPham INT PRIMARY KEY IDENTITY,
    idSanPham INT,
    idMauSac INT,
    idKichCo INT,
    idHinhAnh INT,
    soLuong INT,
    gia DECIMAL(18, 2),
    trangThai NVARCHAR(20),
    ngayTao DATE DEFAULT GETDATE(),
    FOREIGN KEY (idSanPham) REFERENCES SanPham(idSanPham),
    FOREIGN KEY (idMauSac) REFERENCES MauSac(idMauSac),
    FOREIGN KEY (idKichCo) REFERENCES KichCo(idKichCo),
    FOREIGN KEY (idHinhAnh) REFERENCES HinhAnh(idHinhAnh)
);

CREATE TABLE DiaChi (
    idDiaChi INT PRIMARY KEY IDENTITY,
    idKhachHang INT,
    thanhPho NVARCHAR(100),
    quanHuyen NVARCHAR(100),
    xaPhuong NVARCHAR(100),
    ngoNgach NVARCHAR(100),
    ghiChu NVARCHAR(MAX),
    macDinh NVARCHAR(20),
    FOREIGN KEY (idKhachHang) REFERENCES KhachHang(idKhachHang)
);

CREATE TABLE PhieuGiamGia (
    idPhieuGiamGia INT PRIMARY KEY IDENTITY,
    maPhieuGiamGia NVARCHAR(50) NOT NULL UNIQUE,
    tenPhieuGiamGia NVARCHAR(100),
    kieuGiamGia NVARCHAR(20),
    giaTriToiThieu DECIMAL(18,2),
    giaTriToiDa DECIMAL(18,2),
	phanTramGiamGia DECIMAL(5,2),
    soLuong INT,
    ngayBatDau DATE,
    ngayKetThuc DATE,
    moTa NVARCHAR(MAX),
    trangThai NVARCHAR(20)
);

CREATE TABLE HoaDon (
    idHoaDon INT PRIMARY KEY IDENTITY,
    idKhachHang INT,
    idNhanVien INT,
    idPhieuGiamGia INT,
    maHoaDon NVARCHAR(50) UNIQUE,
    loaiDon NVARCHAR(50),
    tongTien DECIMAL(18,2),
    thanhTien DECIMAL(18,2),
    phiShip DECIMAL(18,2),
    tenNguoiNhan NVARCHAR(100),
    soDienThoai NVARCHAR(20),
    email NVARCHAR(100),
    diaChiNhanHang NVARCHAR(255),
    ngayGiaoHang DATE,
    ghiChu NVARCHAR(MAX),
    trangThai NVARCHAR(20),
    FOREIGN KEY (idKhachHang) REFERENCES KhachHang(idKhachHang),
    FOREIGN KEY (idNhanVien) REFERENCES NhanVien(idNhanVien),
    FOREIGN KEY (idPhieuGiamGia) REFERENCES PhieuGiamGia(idPhieuGiamGia)
);

ALTER TABLE HoaDon 
ADD ngayTao DATETIME DEFAULT GETDATE();

CREATE TABLE HoaDonChiTiet (
    idHoaDonChiTiet INT PRIMARY KEY IDENTITY,
    idHoaDon INT,
    idChiTietSanPham INT,
    soLuong INT,
    donGia DECIMAL(18,2),
    thanhTien DECIMAL(18,2),
    trangThai NVARCHAR(20),
    ngayTao DATE DEFAULT GETDATE(),
    FOREIGN KEY (idHoaDon) REFERENCES HoaDon(idHoaDon),
    FOREIGN KEY (idChiTietSanPham) REFERENCES ChiTietSanPham(idChiTietSanPham)
);


CREATE TABLE ThanhToanHoaDon (
    idThanhToanHoaDon INT PRIMARY KEY IDENTITY,
    idHoaDon INT,
    soTienThanhToan DECIMAL(18,2),
    phuongThucThanhToan NVARCHAR(50),
    ghiChu NVARCHAR(MAX),
    trangThai NVARCHAR(20),
    ngayTao DATE DEFAULT GETDATE(),
    FOREIGN KEY (idHoaDon) REFERENCES HoaDon(idHoaDon)
);

CREATE TABLE GioHang (
    idGioHang INT PRIMARY KEY IDENTITY,
    idKhachHang INT,
    tenNhanVien NVARCHAR(100),
    ngayTao DATE DEFAULT GETDATE(),
    trangThai NVARCHAR(20),
    FOREIGN KEY (idKhachHang) REFERENCES KhachHang(idKhachHang)
);

CREATE TABLE GioHangChiTiet (
    idGioHangChiTiet INT PRIMARY KEY IDENTITY,
    idNhanVien INT,
    idGioHang INT NOT NULL,
    idChiTietSanPham INT NOT NULL,
    tenSanPham NVARCHAR(100),
    soLuong INT,
    giaBan DECIMAL(18,2),
    FOREIGN KEY (idNhanVien) REFERENCES NhanVien(idNhanVien),
    FOREIGN KEY (idGioHang) REFERENCES GioHang(idGioHang),
    FOREIGN KEY (idChiTietSanPham) REFERENCES ChiTietSanPham(idChiTietSanPham)
);

CREATE TABLE LichSuHoaDon (
    idLichSuHoaDon INT PRIMARY KEY IDENTITY,
    idHoaDon INT NOT NULL,
    trangThaiCu NVARCHAR(50),
    trangThaiMoi NVARCHAR(50),
    ngayTao DATE DEFAULT GETDATE(),
    FOREIGN KEY (idHoaDon) REFERENCES HoaDon(idHoaDon)
);

INSERT INTO VaiTro (tenVaiTro) VALUES 
(N'Quản trị viên'), 
(N'Nhân viên'), 
(N'Khách hàng');

INSERT INTO TaiKhoan (idVaiTro, tenTaiKhoan, matKhau, trangThai) VALUES
(1, N'admin1', N'adminpass', N'Hoạt động'),    -- id = 1
(2, N'staff1', N'staffpass', N'Hoạt động'),     -- id = 2
(2, N'staff2', N'staffpass', N'Hoạt động'),     -- id = 3
(3, N'customer1', N'custpass', N'Hoạt động'),   -- id = 4
(3, N'customer2', N'custpass', N'Hoạt động'),   -- id = 5
(3, N'customer3', N'custpass', N'Hoạt động'),   -- id = 6
(3, N'customer4', N'custpass', N'Hoạt động'),   -- id = 7
(3, N'customer5', N'custpass', N'Hoạt động');   -- id = 8

INSERT INTO NhanVien (idTaiKhoan, maNhanVien, tenNhanVien, ngaySinh, gioiTinh, soDienThoai, email, diaChi) VALUES
(2, N'NV001', N'Nguyễn Văn Bình', '1995-03-12', 1, N'0911000006', N'binh.nguyen@example.com', N'12 Hoàng Quốc Việt, Hà Nội'),
(3, N'NV002', N'Lê Thị Hương', '1993-07-25', 0, N'0933000007', N'huong.le@example.com', N'89 Lý Thường Kiệt, TP HCM');

INSERT INTO KhachHang (idTaiKhoan, maKhachHang, tenKhachHang, ngaySinh, gioiTinh, soDienThoai, email, trangThai) VALUES
(4, N'KH001', N'Đỗ Thị Lan', '1994-02-15', 0, N'0911222233', N'lan.do@example.com', N'Hoạt động'),
(5, N'KH002', N'Trần Văn Hậu', '1989-07-10', 1, N'0933444555', N'hau.tran@example.com', N'Hoạt động'),
(6, N'KH003', N'Phan Thị Kim', '1990-03-25', 0, N'0977666888', N'kim.phan@example.com', N'Hoạt động'),
(7, N'KH004', N'Ngô Minh Tâm', '1988-11-11', 1, N'0909888777', N'tam.ngo@example.com', N'Hoạt động'),
(8, N'KH005', N'Lý Văn Phúc', '1996-06-05', 1, N'0922333444', N'phuc.ly@example.com', N'Hoạt động');

INSERT INTO ThuongHieu (tenThuongHieu) VALUES 
(N'Nike'), (N'Adidas'), (N'Puma'), (N'Converse'), (N'Vans');

INSERT INTO DanhMuc (tenDanhMuc) VALUES 
(N'Giày thể thao'), (N'Giày chạy bộ'), (N'Giày cao cấp'), (N'Giày lười'), (N'Giày boot');

INSERT INTO MauSac (mauSac) VALUES 
(N'Đen'), (N'Trắng'), (N'Đỏ'), (N'Xanh'), (N'Vàng');

INSERT INTO KichCo (kichCo) VALUES 
(N'38'), (N'39'), (N'40'), (N'41'), (N'42');

INSERT INTO SanPham (maSanPham, tenSanPham, idThuongHieu, idDanhMuc, moTa, trangThai) VALUES
(N'SP001', N'Giày Nike Air Max', 1, 1, N'Mẫu giày phổ biến của Nike', N'Đang bán'),
(N'SP002', N'Giày Adidas Run', 2, 2, N'Giày chạy bộ nhẹ và êm', N'Đang bán'),
(N'SP003', N'Puma Classic', 3, 3, N'Dép phong cách thể thao', N'Ngừng bán'),
(N'SP004', N'Vans Old Skool', 5, 1, N'Giày trượt ván nổi tiếng', N'Đang bán'),
(N'SP005', N'Converse Chuck', 4, 1, N'Giày cao cổ huyền thoại', N'Đang bán');

INSERT INTO HinhAnh (tenHinhAnh, urlHinhAnh) VALUES
(N'Nike Air Max - Đen', N'/images/GiayNikeAirMax_den.webp'),
(N'Nike Air Max - Trắng', N'/images/GiayNikeAirMax_trang.webp'),
(N'Nike Air Max - Đỏ', N'/images/GiayNikeAirMax_do.png'),
(N'Nike Air Max - Xanh', N'/images/GiayNikeAirMax_xanh.webp'),
(N'Nike Air Max - Vàng', N'/images/GiayNikeAirMax_vang.webp'),

(N'Adidas Run - Đen', N'/images/AdidasRun_den.webp'),
(N'Adidas Run - Trắng', N'/images/AdidasRun_trang.webp'),
(N'Adidas Run - Đỏ', N'/images/AdidasRun_do.webp'),
(N'Adidas Run - Xanh', N'/images/AdidasRun_xanh.jpg'),

(N'Puma Classic - Đen', N'/images/PumaClassic_den.webp'),
(N'Puma Classic - Trắng', N'/images/PumaClassic_trang.webp'),
(N'Puma Classic - Đỏ', N'/images/PumaClassic_do.jpg'),
(N'Puma Classic - Xanh', N'/images/PumaClassic_xanh.webp'),
(N'Puma Classic - Vàng', N'/images/PumaClassic_vang.webp'),

(N'Vans Old Skool - Đen', N'/images/VansOldSkool_den.webp'),
(N'Vans Old Skool - Trắng', N'/images/VansOldSkool_trang.webp'),
(N'Vans Old Skool - Đỏ', N'/images/VansOldSkool_do.webp'),
(N'Vans Old Skool - Xanh', N'/images/VansOldSkool_xanh.webp'),
(N'Vans Old Skool - Vàng', N'/images/VansOldSkool_vang.webp'),

(N'Converse Chuck - Đen', N'/images/ConverseChuck_den.webp'),
(N'Converse Chuck - Trắng', N'/images/ConverseChuck_trang.jpg'),
(N'Converse Chuck - Đỏ', N'/images/ConverseChuck_do.jpg'),
(N'Converse Chuck - Xanh', N'/images/ConverseChuck_xanh.webp'),
(N'Converse Chuck - Vàng', N'/images/ConverseChuck_vang.jpg');

INSERT INTO ChiTietSanPham (idSanPham, idMauSac, idKichCo, idHinhAnh, soLuong, gia, trangThai) VALUES
-- SP001: Nike Air Max (có đủ 5 màu)
(1, 1, 2, 1, 10, 2400000, N'Còn hàng'),
(1, 2, 4, 2, 12, 2400000, N'Còn hàng'),
(1, 3, 3, 3, 8, 2400000, N'Còn hàng'),
(1, 4, 1, 4, 15, 2400000, N'Còn hàng'),
(1, 5, 5, 5, 9, 2400000, N'Còn hàng'),

-- SP002: Adidas Run (không có màu vàng)
(2, 1, 2, 6, 14, 2200000, N'Còn hàng'),
(2, 2, 3, 7, 13, 2200000, N'Còn hàng'),
(2, 3, 5, 8, 7, 2200000, N'Còn hàng'),
(2, 4, 4, 9, 10, 2200000, N'Còn hàng'),

-- SP003: Puma Classic (đủ 5 màu)
(3, 1, 3, 10, 6, 2300000, N'Còn hàng'),
(3, 2, 2, 11, 7, 2300000, N'Còn hàng'),
(3, 3, 5, 12, 5, 2300000, N'Còn hàng'),
(3, 4, 4, 13, 4, 2300000, N'Còn hàng'),
(3, 5, 1, 14, 7, 2300000, N'Còn hàng'),

-- SP004: Vans Old Skool (đủ 5 màu)
(4, 1, 5, 15, 10, 2100000, N'Còn hàng'),
(4, 2, 1, 16, 11, 2100000, N'Còn hàng'),
(4, 3, 2, 17, 9, 2100000, N'Còn hàng'),
(4, 4, 3, 18, 15, 2100000, N'Còn hàng'),
(4, 5, 4, 19, 8, 2100000, N'Còn hàng'),

-- SP005: Converse Chuck (đủ 5 màu)
(5, 1, 1, 20, 6, 2500000, N'Còn hàng'),
(5, 2, 4, 21, 10, 2500000, N'Còn hàng'),
(5, 3, 2, 22, 12, 2500000, N'Còn hàng'),
(5, 4, 3, 23, 14, 2500000, N'Còn hàng'),
(5, 5, 5, 24, 7, 2500000, N'Còn hàng'),

-- Thêm các bản ghi phụ để đủ 30
(2, 1, 1, 6, 5, 2200000, N'Còn hàng'),  -- Adidas đen lần 2
(4, 3, 5, 17, 6, 2100000, N'Còn hàng'), -- Vans đỏ lần 2
(5, 2, 1, 21, 7, 2500000, N'Còn hàng'), -- Converse trắng lần 2
(3, 4, 2, 13, 6, 2300000, N'Còn hàng'), -- Puma xanh lần 2
(1, 1, 3, 1, 10, 2400000, N'Còn hàng'); -- Nike đen lần 2

INSERT INTO DiaChi (idKhachHang, thanhPho, quanHuyen, xaPhuong, ngoNgach, ghiChu, macDinh) VALUES
(1, N'Hà Nội', N'Ba Đình', N'Kim Mã', N'Ngõ 12', N'Gần công viên', N'Có'),
(2, N'HCM', N'Q1', N'Bến Nghé', N'Ngõ 3', N'Chung cư A', N'Không'),
(3, N'Đà Nẵng', N'Hải Châu', N'Phước Ninh', N'Ngõ 20', N'Nhà riêng', N'Có'),
(4, N'Hải Phòng', N'Lê Chân', N'An Biên', N'Ngách 5', N'Gần chợ', N'Không'),
(5, N'Cần Thơ', N'Ninh Kiều', N'An Cư', N'Ngõ 7', N'Giao buổi tối', N'Có');

INSERT INTO PhieuGiamGia (
    maPhieuGiamGia, tenPhieuGiamGia, kieuGiamGia, giaTriToiThieu, giaTriToiDa,
    phanTramGiamGia, soLuong, ngayBatDau, ngayKetThuc, moTa, trangThai
) VALUES
('PGG001', N'Giảm 10%', 'PHAN_TRAM', 200000.00, 200000.00, 10.00, 100, '2025-06-01', '2025-07-31', N'Dành cho khách mới', N'Hoạt động'),
('FREESHIP01', N'Voucher miễn phí vận chuyển', 'FREE_SHIP', 500000.00, 0.00, 0.00, 100, '2025-07-01', '2025-12-31', N'Áp dụng miễn phí vận chuyển cho đơn hàng', N'Hoạt động'),
('KMDB', N'Giảm 30000', 'GIAM_TRUC_TIEP', 300000.00, 30000.00, 0.00, 12, '2025-07-10', '2025-07-22', N'khuyến mãi hè', N'Hoạt động');


INSERT INTO GioHang (idKhachHang, tenNhanVien, trangThai) VALUES
(1, N'Nguyễn Văn Bình', N'Đang xử lý'),
(2, N'Lê Thị Hương', N'Chờ thanh toán');

INSERT INTO GioHangChiTiet (idNhanVien, idGioHang, idChiTietSanPham, tenSanPham, soLuong, giaBan) VALUES
(1, 1, 1, N'Nike Air Max', 1, 2500000),
(2, 2, 2, N'Adidas Run', 2, 1050000);

UPDATE VaiTro SET tenVaiTro = 'KHACH_HANG' WHERE tenVaiTro = N'Khách hàng';
UPDATE VaiTro SET tenVaiTro = 'NHAN_VIEN' WHERE tenVaiTro = N'Nhân viên';
UPDATE VaiTro SET tenVaiTro = 'QUAN_TRI_VIEN' WHERE tenVaiTro = N'Quản trị viên';
ALTER TABLE HoaDon ADD giamGia DECIMAL(18,2) DEFAULT 0;
UPDATE PhieuGiamGia SET kieuGiamGia = 'PERCENT' WHERE kieuGiamGia = 'PHAN_TRAM';
UPDATE PhieuGiamGia SET kieuGiamGia = 'FIXED' WHERE kieuGiamGia = 'GIAM_TRUC_TIEP';
DELETE FROM PhieuGiamGia WHERE kieuGiamGia NOT IN ('PERCENT', 'FIXED', 'FREE_SHIP');
UPDATE PhieuGiamGia
SET trangThai = 
  CASE
    WHEN CAST(GETDATE() AS DATE) < ngayBatDau THEN N'Sắp diễn ra'
    WHEN CAST(GETDATE() AS DATE) > ngayKetThuc THEN N'Đã kết thúc'
    ELSE N'Đang diễn ra'
  END;

ALTER TABLE PhieuGiamGia
ALTER COLUMN ngayBatDau DATETIME;

ALTER TABLE PhieuGiamGia
ALTER COLUMN ngayKetThuc DATETIME;

UPDATE HoaDon
SET trangThai = N'Đã xác nhận'
WHERE trangThai = N'Chờ xác nhận';
UPDATE HoaDon
SET trangThai = N'Giao hàng thành công'
WHERE trangThai = N'Hoàn tất';
UPDATE HoaDon
SET trangThai = N'Giao hàng thành công'
WHERE trangThai = N'Đã thanh toán';
UPDATE HoaDon
SET trangThai = N'Đang vận chuyển'
WHERE trangThai = N'Chờ đóng gói';

ALTER TABLE NhanVien
DROP COLUMN diaChi;
CREATE TABLE DiaChiNhanVien (
    idDiaChi INT IDENTITY(1,1) PRIMARY KEY,
    idNhanVien INT FOREIGN KEY REFERENCES NhanVien(idNhanVien),
    diaChiChiTiet NVARCHAR(255),  -- VD: "Số 12 Lý Thường Kiệt"
    xaPhuong NVARCHAR(100),
    quanHuyen NVARCHAR(100),
    thanhPho NVARCHAR(100)
);
-- Ví dụ dữ liệu gốc bạn đã có bảng trung gian lưu thông tin địa chỉ tách ra
INSERT INTO DiaChiNhanVien (idNhanVien, diaChiChiTiet, xaPhuong, quanHuyen, thanhPho)
VALUES 
(1, N'12 Hoàng Quốc Việt', N'Phước Ninh', N'Hải Châu', N'Đà Nẵng'),
(2, N'89 Lý Thường Kiệt', N'Kim Mã', N'Ba Đình', N'Hà Nội');

SELECT 
    nv.maNhanVien,
    nv.tenNhanVien,
    dc.diaChiChiTiet,
    dc.xaPhuong,
    dc.quanHuyen,
    dc.thanhPho
FROM NhanVien nv
LEFT JOIN DiaChiNhanVien dc ON nv.idNhanVien = dc.idNhanVien;

-- Tạo bảng ChiTietSanPhamHinhAnh
CREATE TABLE ChiTietSanPhamHinhAnh (
    idChiTietSanPhamHinhAnh INT IDENTITY(1,1) PRIMARY KEY,
    idChiTietSanPham INT NOT NULL,
    idHinhAnh INT NOT NULL,
    thuTu INT NOT NULL DEFAULT 1,
    laAnhChinh BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (idChiTietSanPham) REFERENCES ChiTietSanPham(idChiTietSanPham),
    FOREIGN KEY (idHinhAnh) REFERENCES HinhAnh(idHinhAnh)
);


select * from NhanVien
select * from KhachHang
select * from VaiTro
select * from TaiKhoan
select * from ChiTietSanPham
select * from SanPham
select * from ChiTietSanPham
select * from SanPham
select * from PhieuGiamGia
select * from HoaDon
select * from HoaDonChiTiet

SELECT * FROM TaiKhoan
WHERE idVaiTro = 3;

UPDATE KhachHang 
SET trangThai = N'Ngừng hoạt động' 
WHERE trangThai LIKE N'Không hoạt động';

-- Tạo bảng MomoTransaction cho thanh toán MoMo (tại quầy + online)
CREATE TABLE MomoTransaction (
    idMomoTransaction INT IDENTITY(1,1) PRIMARY KEY,
    idHoaDon INT,
    orderId NVARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(18,2) NOT NULL,
    orderInfo NVARCHAR(255),
    qrCodeUrl NVARCHAR(MAX),
    payUrl NVARCHAR(MAX),
    transId NVARCHAR(50),
    resultCode INT,
    message NVARCHAR(255),
    trangThai NVARCHAR(50) NOT NULL DEFAULT N'Chờ thanh toán',
    loaiGiaoDich NVARCHAR(50) DEFAULT N'Tại quầy', -- 'Tại quầy' hoặc 'Online'
    ngayTao DATETIME DEFAULT GETDATE(),
    ngayCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (idHoaDon) REFERENCES HoaDon(idHoaDon)
);

-- Thêm cột thanh toán MoMo vào HoaDon
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('HoaDon') AND name = 'phuongThucThanhToan')
BEGIN
    ALTER TABLE HoaDon ADD phuongThucThanhToan NVARCHAR(50) DEFAULT N'Tiền mặt';
END

-- Cập nhật phương thức thanh toán cho các hóa đơn hiện tại
UPDATE HoaDon SET phuongThucThanhToan = N'Tiền mặt' WHERE phuongThucThanhToan IS NULL;

-- Thêm dữ liệu mẫu
INSERT INTO MomoTransaction (
    orderId, amount, orderInfo, trangThai, loaiGiaoDich
) VALUES
('ORDER_POS_001', 2500000, N'Thanh toán tại quầy - Giày Nike', N'Chờ thanh toán', N'Tại quầy'),
('ORDER_ONLINE_001', 1800000, N'Thanh toán online - Giày Adidas', N'Chờ thanh toán', N'Online');