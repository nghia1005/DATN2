package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
public class HoaDonChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHoaDonChiTiet;

    @ManyToOne
    @JoinColumn(name = "idHoaDon")
    private HoaDon hoaDon;

    private Long idChiTietSanPham;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private String trangThai;

    @Transient
    private Long idHoaDon;
    public Long getIdHoaDon() { return idHoaDon; }
    public void setIdHoaDon(Long idHoaDon) { this.idHoaDon = idHoaDon; }
} 