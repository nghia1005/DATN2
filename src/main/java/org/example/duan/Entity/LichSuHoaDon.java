package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "lich_su_hoa_don")
public class LichSuHoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLichSu;

    @Column(name = "ma_hoa_don")
    private String maHoaDon;

    @Column(name = "trang_thai_cu")
    private String trangThaiCu;

    @Column(name = "trang_thai_moi")
    private String trangThaiMoi;

    @Column(name = "ngay_tao")
    @Temporal(TemporalType.TIMESTAMP)
    private Date ngayTao;

    @Column(name = "ghi_chu")
    private String ghiChu;
} 