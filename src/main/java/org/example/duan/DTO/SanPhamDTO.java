package org.example.duan.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamDTO {
    private Integer idSanPham;

    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String maSanPham;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String tenSanPham;

    @NotNull(message = "Thương hiệu không được để trống")
    private Integer idThuongHieu;

    private String tenThuongHieu;

    @NotNull(message = "Danh mục không được để trống")
    private Integer idDanhMuc;

    private String tenDanhMuc;

    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;


    private String moTa;

    // Thêm trường đường dẫn ảnh đại diện sản phẩm cha
    private String duongDanHinhAnh;

    // Thêm trường tổng số lượng các biến thể
    private Integer tongSoLuongBienThe;
} 


