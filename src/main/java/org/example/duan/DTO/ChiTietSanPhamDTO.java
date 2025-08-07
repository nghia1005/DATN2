package org.example.duan.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietSanPhamDTO {
    private Integer idChiTietSanPham;

    @NotNull(message = "Sản phẩm không được để trống")
    private Integer idSanPham;

    private String tenSanPham;
    private String maSanPham;


    private String tenThuongHieu;
    private String tenDanhMuc;


    @NotNull(message = "Màu sắc không được để trống")
    private Integer idMauSac;

    private String tenMauSac;

    @NotNull(message = "Kích cỡ không được để trống")
    private Integer idKichCo;

    private String tenKichCo;

    private Integer idHinhAnh;
    private String duongDanHinhAnh;

    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private Integer soLuong;

    @DecimalMin(value = "1", message = "Giá phải lớn hơn 0")
    private BigDecimal gia;


    private String moTa;

    private String trangThai;
    private LocalDate ngayTao;
    private Integer phanTramGiamGia;
    private String trangThaiSale;
    private BigDecimal giaSale;
} 