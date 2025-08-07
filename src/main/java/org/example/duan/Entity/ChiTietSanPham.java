package org.example.duan.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ChiTietSanPham")
public class ChiTietSanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idChiTietSanPham;

    @NotNull(message = "Sản phẩm không được để trống")
    @ManyToOne
    @JoinColumn(name = "idSanPham")
    private SanPham sanPham;

    @NotNull(message = "Màu sắc không được để trống")
    @ManyToOne
    @JoinColumn(name = "idMauSac")
    private MauSac mauSac;

    @NotNull(message = "Kích cỡ không được để trống")
    @ManyToOne
    @JoinColumn(name = "idKichCo")
    private KichCo kichCo;

    @ManyToOne
    @JoinColumn(name = "idHinhAnh")
    private HinhAnh hinhAnh;

    @Column(name = "soLuong")
    private Integer soLuong;

    @Column(name = "gia")
    private BigDecimal gia;

    @Column(name = "trangThai")
    private String trangThai;

    @Column(name = "ngayTao")
    private LocalDate ngayTao;

    @Column(name = "phanTramGiamGia")
    private Integer phanTramGiamGia;

    @Column(name = "trangThaiSale")
    private String trangThaiSale;
} 