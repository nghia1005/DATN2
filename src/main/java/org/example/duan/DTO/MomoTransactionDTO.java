package org.example.duan.DTO;

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
public class MomoTransactionDTO {
    
    private Long idMomoTransaction;
    private Long idHoaDon;
    private String orderId;
    private BigDecimal amount;
    private String orderInfo;
    private String qrCodeUrl;
    private String payUrl;
    private String transId;
    private Integer resultCode;
    private String message;
    private String trangThai;
    private String loaiGiaoDich;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    
    // Thông tin hóa đơn liên quan
    private String maHoaDon;
    private String tenNguoiNhan;
    private String tenNhanVien;
}
