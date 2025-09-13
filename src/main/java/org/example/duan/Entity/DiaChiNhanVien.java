package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DiaChiNhanVien")
public class DiaChiNhanVien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDiaChi;

    @ManyToOne
    @JoinColumn(name = "idNhanVien")
    private NhanVien nhanVien;

    @Column(name = "diaChiChiTiet")
    private String diaChiChiTiet;

    @Column(name = "xaPhuong")
    private String xaPhuong;

    @Column(name = "quanHuyen")
    private String quanHuyen;

    @Column(name = "thanhPho")
    private String thanhPho;
} 