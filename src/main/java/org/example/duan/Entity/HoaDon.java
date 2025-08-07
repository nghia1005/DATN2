package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
public class HoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    private Long idPhieuGiamGia;
    private String loaiDon;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ngayTao;

    // Bổ sung các trường thông tin người nhận
    private String tenNguoiNhan;
    private String soDienThoai;
    private String diaChiNhanHang;
    private String email;

    // Xóa các trường địa chỉ chi tiết vì sẽ lấy từ bảng DiaChi của khách hàng
    // private String ngoNgach;
    // private String phuongXa;
    // private String quanHuyen;
    // private String tinhThanh;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL)
    private List<HoaDonChiTiet> chiTiet;
} 