package org.example.duan.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HoaDonRequest {
    private Long idKhachHang;
    private Long idNhanVien;
    private BigDecimal tongTien;
    private BigDecimal giamGia;
    private BigDecimal phiShip;
    private BigDecimal thanhTien;
    private String ghiChu;
    private Long idPhieuGiamGia;
    private List<HoaDonChiTietDTO> chiTiet;

    // Bổ sung các trường giao hàng
    private String tenNguoiNhan;
    private String soDienThoai;
    private String email;
    private String loaiDon;
    // Thêm trường trạng thái hóa đơn
    private String trangThai;
    private String diaChiNhanHang;
    private String phuongThucThanhToan;
    // Xóa các trường địa chỉ chi tiết vì sẽ lấy từ bảng DiaChi của khách hàng
    // private String ngoNgach;
    // private String phuongXa;
    // private String quanHuyen;
    // private String tinhThanh;

    // Thêm getter/setter nếu không dùng Lombok hoặc để chắc chắn
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
} 