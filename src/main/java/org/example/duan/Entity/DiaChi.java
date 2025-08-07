package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "DiaChi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaChi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idDiaChi")
    private Integer idDiaChi;

    @ManyToOne
    @JoinColumn(name = "idKhachHang")
    private KhachHang khachHang;

    @Column(name = "thanhPho")
    private String thanhPho;

    @Column(name = "quanHuyen")
    private String quanHuyen;

    @Column(name = "xaPhuong")
    private String xaPhuong;

    @Column(name = "ngoNgach")
    private String ngoNgach;

    @Column(name = "ghiChu")
    private String ghiChu;

    @Column(name = "macDinh")
    private String macDinh;
} 