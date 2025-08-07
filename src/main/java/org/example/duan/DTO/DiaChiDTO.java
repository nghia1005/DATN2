package org.example.duan.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaChiDTO {
    private Integer idDiaChi;
    private Integer idKhachHang;
    
    @NotBlank(message = "Thành phố không được để trống")
    private String thanhPho;
    
    @NotBlank(message = "Quận huyện không được để trống")
    private String quanHuyen;
    
    @NotBlank(message = "Xã phường không được để trống")
    private String xaPhuong;
    
    private String ngoNgach;
    private String ghiChu;
    
    @Pattern(regexp = "^(Có|Không)$", message = "Mặc định phải là 'Có' hoặc 'Không'")
    private String macDinh;
} 