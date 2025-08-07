package org.example.duan.DTO;

import java.math.BigDecimal;

public class ThanhToanRequest {
    private Long idHoaDon;
    private BigDecimal soTienThanhToan;
    private String phuongThucThanhToan;
    private String ghiChu;
    // Getters and Setters
    public Long getIdHoaDon() { return idHoaDon; }
    public void setIdHoaDon(Long idHoaDon) { this.idHoaDon = idHoaDon; }
    public BigDecimal getSoTienThanhToan() { return soTienThanhToan; }
    public void setSoTienThanhToan(BigDecimal soTienThanhToan) { this.soTienThanhToan = soTienThanhToan; }
    public String getPhuongThucThanhToan() { return phuongThucThanhToan; }
    public void setPhuongThucThanhToan(String phuongThucThanhToan) { this.phuongThucThanhToan = phuongThucThanhToan; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
} 