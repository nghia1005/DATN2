package org.example.duan.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HoaDonChiTietDTO {
    private Long idHoaDonChiTiet;
    private Long idHoaDon;
    private Long idChiTietSanPham;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private String trangThai;
    private String tenSanPham;
    private String maSanPham;
    private String danhMuc;
    private String thuongHieu;
    private String mauSac;
    private String kichCo;
    private java.util.Date ngayTao;
} 