package org.example.duan.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietSanPhamHinhAnhDTO {
    private Integer idChiTietSanPhamHinhAnh;
    private Integer idChiTietSanPham;
    private Integer idHinhAnh;
    private String tenHinhAnh;
    private String urlHinhAnh;
    private Integer thuTu;
    private Boolean laAnhChinh;
} 