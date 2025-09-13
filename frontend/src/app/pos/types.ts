export interface ProductDetail {
  idChiTietSanPham: number;
  maSanPham: string;
  tenSanPham: string;
  tenThuongHieu: string;
  tenDanhMuc: string;
  tenMauSac: string;
  tenKichCo: string;
  gia: number;
  soLuong: number;
  trangThai: string;
  phanTramGiamGia?: number;
  trangThaiSale?: string;
  giaSale?: number;
} 