package org.example.duan.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HinhAnhDTO {
    private Integer idHinhAnh;
    
    @NotBlank(message = "Đường dẫn hình ảnh không được để trống")
    private String duongDan;
    
    private String moTa;
} 