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
public class DanhMucDTO {
    private Integer idDanhMuc;
    
    @NotBlank(message = "Tên danh mục không được để trống")
    private String tenDanhMuc;
    
    private String moTa;
} 