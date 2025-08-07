package org.example.duan.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HoaDonDTO {
    private Long idHoaDon;
    private String maHoaDon;
    private Long idKhachHang;
    private Long idNhanVien;
    private BigDecimal tongTien;
    private BigDecimal giamGia;
    private BigDecimal phiShip;
    private BigDecimal thanhTien;
    private String trangThai;
    private String ghiChu;
    private Date ngayTao;
    private Long idPhieuGiamGia;
    private List<HoaDonChiTietDTO> chiTiet;
    private String tenNguoiNhan;
    private String soDienThoai;
    private String email;
    private String loaiDon;
    private String tenKhachHang;
    private String diaChiNhanHang;
    public String getTenKhachHang() { return tenKhachHang; }
    public void setTenKhachHang(String tenKhachHang) { this.tenKhachHang = tenKhachHang; }
} 