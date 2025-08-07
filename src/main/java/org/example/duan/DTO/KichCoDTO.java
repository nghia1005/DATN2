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
public class KichCoDTO {
    private Integer idKichCo;
    
    @NotBlank(message = "Tên kích cỡ không được để trống")
    private String tenKichCo;
    
    private String moTa;
} 