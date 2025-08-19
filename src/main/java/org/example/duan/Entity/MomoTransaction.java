package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MomoTransaction")
public class MomoTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMomoTransaction")
    private Long idMomoTransaction;
    
    @Column(name = "idHoaDon")
    private Long idHoaDon;
    
    @Column(name = "orderId", nullable = false, unique = true, length = 50)
    private String orderId;
    
    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "orderInfo")
    private String orderInfo;
    
    @Column(name = "qrCodeUrl")
    private String qrCodeUrl;
    
    @Column(name = "payUrl")
    private String payUrl;
    
    @Column(name = "transId", length = 50)
    private String transId;
    
    @Column(name = "resultCode")
    private Integer resultCode;
    
    @Column(name = "message")
    private String message;
    
    @Column(name = "trangThai", nullable = false, length = 50)
    private String trangThai = "Chờ thanh toán";
    
    @Column(name = "loaiGiaoDich", length = 50)
    private String loaiGiaoDich = "Tại quầy";
    
    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;
    
    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat;
    
    // Quan hệ với HoaDon
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idHoaDon", insertable = false, updatable = false)
    private HoaDon hoaDon;
    
    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}
