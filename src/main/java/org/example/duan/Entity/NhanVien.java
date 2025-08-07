package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import org.example.duan.Entity.TaiKhoan;

@Getter
@Setter
@Entity
@Table(name = "NhanVien")
public class NhanVien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idNhanVien")
    private Integer idNhanVien;

    @OneToOne
    @JoinColumn(name = "idTaiKhoan", unique = true, nullable = false)
    private TaiKhoan taiKhoan;

    @Column(name = "maNhanVien", nullable = false)
    private String maNhanVien;

    @Column(name = "tenNhanVien", nullable = false)
    private String tenNhanVien;

    @Column(name = "gioiTinh")
    private Boolean gioiTinh;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "soDienThoai")
    private String soDienThoai;

    @Column(name = "email")
    private String email;
} 