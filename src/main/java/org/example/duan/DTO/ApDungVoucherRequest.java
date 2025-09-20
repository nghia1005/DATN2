package org.example.duan.DTO;

import java.math.BigDecimal;

public class ApDungVoucherRequest {
    private String maPhieuGiamGia;
    private BigDecimal tongTien;
    // Getters and Setters
    public String getMaPhieuGiamGia() { return maPhieuGiamGia; }
    public void setMaPhieuGiamGia(String maPhieuGiamGia) { this.maPhieuGiamGia = maPhieuGiamGia; }
    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
} 