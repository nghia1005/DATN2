package org.example.duan.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SanPham")
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idSanPham;

    @NotBlank(message = "Mã sản phẩm không được để trống")
    @Column(name = "maSanPham", nullable = false)
    private String maSanPham;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Column(name = "tenSanPham", nullable = false)
    private String tenSanPham;

    @NotNull(message = "Thương hiệu không được để trống")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idThuongHieu", nullable = false)
    private ThuongHieu thuongHieu;

    @NotNull(message = "Danh mục không được để trống")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idDanhMuc", nullable = false)
    private DanhMuc danhMuc;

    @NotBlank(message = "Trạng thái không được để trống")
    @Column(name = "trangThai", nullable = false)
    private String trangThai;


    @Column(name = "moTa")
    private String moTa;

}