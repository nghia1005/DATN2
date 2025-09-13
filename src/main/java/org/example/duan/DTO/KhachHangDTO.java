package org.example.duan.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhachHangDTO {
    private Integer idKhachHang;
    
    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKhachHang;
    
    @NotBlank(message = "Tên khách hàng không được để trống")
    private String tenKhachHang;
    
    private java.util.Date ngaySinh;
    
    private Boolean gioiTinh;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String soDienThoai;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    
    @Pattern(regexp = "^(Hoạt động|Ngừng hoạt động|Chờ xác thực)$", message = "Trạng thái phải là 'Hoạt động', 'Ngừng hoạt động' hoặc 'Chờ xác thực'")
    private String trangThai;
    
    // Các trường text cho frontend
    private String gioiTinhText;
    private String emailXacThucText;
    private String trangThaiText;
    
    // Thông tin bổ sung
    private Integer soDiaChi;
    
    private List<DiaChiDTO> danhSachDiaChi;
} 