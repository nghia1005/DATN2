export interface ProductVariant {
  idChiTietSanPham: number;
  idSanPham: number;
  maSanPham: string;
  tenSanPham: string;
  tenThuongHieu: string;
  tenDanhMuc: string;
  duongDanHinhAnh?: string;
  moTa?: string;
  trangThai?: string;
  idMauSac?: number;
  tenMauSac?: string;
  idKichCo?: number;
  tenKichCo?: string;
  gia: number;
  soLuong?: number;
  idDanhMuc?: number;
}

export interface Brand { idThuongHieu: number; tenThuongHieu: string; }
export interface Color { idMauSac: number; mauSac: string; }
export interface Size { idKichCo: number; kichCo: string; }
export interface Category { idDanhMuc: number; tenDanhMuc: string; } 