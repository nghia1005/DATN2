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
public class ThuongHieuDTO {
    private Integer idThuongHieu;
    
    @NotBlank(message = "Tên thương hiệu không được để trống")
    private String tenThuongHieu;
    
    private String moTa;
} 