package org.example.duan.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "KhachHang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idKhachHang")
    private Integer idKhachHang;

    @NotBlank(message = "Mã khách hàng không được để trống")
    @Pattern(regexp = "^KH[A-Z0-9]+$", message = "Mã khách hàng phải bắt đầu bằng 'KH' và chỉ chứa chữ hoa và số")
    @Column(name = "maKhachHang", unique = true)
    private String maKhachHang;

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(min = 2, max = 100, message = "Tên khách hàng phải có từ 2 đến 100 ký tự")
    @Pattern(regexp = "^[^\\s].*", message = "Tên khách hàng không được bắt đầu bằng dấu cách")
    @Pattern(regexp = "^[^\\s].*[^\\s]$", message = "Tên khách hàng không được kết thúc bằng dấu cách")
    @Pattern(regexp = "^[^\\s]+(\\s[^\\s]+)*$", message = "Tên khách hàng chỉ được có 1 dấu cách giữa các từ")
    @Column(name = "tenKhachHang")
    private String tenKhachHang;

    @NotNull(message = "Giới tính không được để trống")
    @Column(name = "gioiTinh")
    private Boolean gioiTinh;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10}$", message = "Số điện thoại phải có đúng 10 chữ số")
    @Pattern(regexp = "^[^\\s].*", message = "Số điện thoại không được bắt đầu bằng dấu cách")
    @Column(name = "soDienThoai")
    private String soDienThoai;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Pattern(regexp = "^[^\\s].*", message = "Email không được bắt đầu bằng dấu cách")
    @Pattern(regexp = "^[^\\s].*[^\\s]$", message = "Email không được kết thúc bằng dấu cách")
    @Pattern(regexp = "^[^\\s]+(\\s[^\\s]+)*@[^\\s]+(\\s[^\\s]+)*\\.[^\\s]+(\\s[^\\s]+)*$", message = "Email không được có nhiều dấu cách liên tiếp")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "Trạng thái không được để trống")
    @Column(name = "trangThai")
    private String trangThai;

    @Column(name = "ngaySinh")
    private java.util.Date ngaySinh;

    @OneToMany(mappedBy = "khachHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiaChi> danhSachDiaChi;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idTaiKhoan", unique = true, nullable = false)
    private TaiKhoan taiKhoan;
} 