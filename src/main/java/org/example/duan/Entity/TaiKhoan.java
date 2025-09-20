package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "TaiKhoan")
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTaiKhoan")
    private Integer idTaiKhoan;

    @Column(name = "tenTaiKhoan")
    private String tenTaiKhoan;

    @Column(name = "matKhau", nullable = false)
    private String matKhau;

    @ManyToOne
    @JoinColumn(name = "idVaiTro")
    private VaiTro vaiTro;

    @Column(name = "trangThai", nullable = false, length = 20)
    private String trangThai;
} 