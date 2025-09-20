package org.example.duan.DTO;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class NhanVienDTO {
    private Integer idNhanVien;
    private String maNhanVien;
    private String tenNhanVien;
    private Boolean gioiTinh;
    private LocalDate ngaySinh;
    private String soDienThoai;
    private String email;
    private String diaChi;

    // Thông tin địa chỉ chi tiết
    private String thanhPho;
    private String quanHuyen;
    private String xaPhuong;
    private String ngoNgach;

    // Thông tin tài khoản
    private String tenTaiKhoan;
    private String matKhau;
    private Integer idVaiTro;

    private String trangThai;
}

