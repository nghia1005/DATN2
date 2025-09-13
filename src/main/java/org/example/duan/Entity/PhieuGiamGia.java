package org.example.duan.Entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Setter;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class PhieuGiamGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPhieuGiamGia")
    private Long idPhieuGiamGia;

    @Column(name = "maPhieuGiamGia")
    private String maPhieuGiamGia;
    @Column(name = "tenPhieuGiamGia")
    private String tenPhieuGiamGia;
    @Column(name = "kieuGiamGia")
    private String kieuGiamGia;
    @Column(name = "giaTriToiThieu")
    private BigDecimal giaTriToiThieu;
    @Column(name = "giaTriToiDa")
    private BigDecimal giaTriToiDa;
    @Column(name = "soLuong")
    private Integer soLuong;
    @Column(name = "ngayBatDau")
    private LocalDateTime ngayBatDau;
    @Column(name = "ngayKetThuc")
    private LocalDateTime ngayKetThuc;
    @Column(name = "moTa")
    private String moTa;
    @Column(name = "trangThai")
    private String trangThai;
    @Column(name = "phanTramGiamGia")
    private BigDecimal phanTramGiamGia;

    public String getTrangThaiDong() {
        java.util.Date now = new java.util.Date();
        if (ngayBatDau != null && now.toInstant().isBefore(ngayBatDau.atZone(java.time.ZoneId.systemDefault()).toInstant())) {
            return "Sắp diễn ra";
        }
        if (ngayBatDau != null && ngayKetThuc != null && !now.toInstant().isBefore(ngayBatDau.atZone(java.time.ZoneId.systemDefault()).toInstant()) && !now.toInstant().isAfter(ngayKetThuc.atZone(java.time.ZoneId.systemDefault()).toInstant())) {
            return "Đang diễn ra";
        }
        if (ngayKetThuc != null && now.toInstant().isAfter(ngayKetThuc.atZone(java.time.ZoneId.systemDefault()).toInstant())) {
            return "Đã kết thúc";
        }
        return "Không xác định";
    }
} 