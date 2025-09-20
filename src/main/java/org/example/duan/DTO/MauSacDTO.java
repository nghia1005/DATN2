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
public class MauSacDTO {
    private Integer idMauSac;
    
    @NotBlank(message = "Tên màu sắc không được để trống")
    private String tenMauSac;
    
    private String moTa;
} 