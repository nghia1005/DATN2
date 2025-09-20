package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ChiTietSanPhamHinhAnh")
public class ChiTietSanPhamHinhAnh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idChiTietSanPhamHinhAnh;

    @ManyToOne
    @JoinColumn(name = "idChiTietSanPham")
    private ChiTietSanPham chiTietSanPham;

    @ManyToOne
    @JoinColumn(name = "idHinhAnh")
    private HinhAnh hinhAnh;

    @Column(name = "thuTu")
    private Integer thuTu; // Thứ tự hiển thị: 1, 2, 3

    @Column(name = "laAnhChinh")
    private Boolean laAnhChinh = false; // true = ảnh chính, false = ảnh phụ
} 