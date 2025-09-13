package org.example.duan.Entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GioHangChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGioHangChiTiet;

    private Long idNhanVien;
    private Long idGioHang;
    private Long idChiTietSanPham;
    private String tenSanPham;
    private Integer soLuong;
    private BigDecimal giaBan;

    // Getters and Setters
    public Long getIdGioHangChiTiet() { return idGioHangChiTiet; }
    public void setIdGioHangChiTiet(Long idGioHangChiTiet) { this.idGioHangChiTiet = idGioHangChiTiet; }
    public Long getIdNhanVien() { return idNhanVien; }
    public void setIdNhanVien(Long idNhanVien) { this.idNhanVien = idNhanVien; }
    public Long getIdGioHang() { return idGioHang; }
    public void setIdGioHang(Long idGioHang) { this.idGioHang = idGioHang; }
    public Long getIdChiTietSanPham() { return idChiTietSanPham; }
    public void setIdChiTietSanPham(Long idChiTietSanPham) { this.idChiTietSanPham = idChiTietSanPham; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    public BigDecimal getGiaBan() { return giaBan; }
    public void setGiaBan(BigDecimal giaBan) { this.giaBan = giaBan; }
} 