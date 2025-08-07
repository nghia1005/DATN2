package org.example.duan.Repository;

import org.example.duan.Entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Integer> {
    Optional<NhanVien> findByMaNhanVien(String maNhanVien);
    boolean existsByMaNhanVien(String maNhanVien);
    boolean existsByEmail(String email);
    boolean existsBySoDienThoai(String soDienThoai);
    NhanVien findByTaiKhoan(org.example.duan.Entity.TaiKhoan taiKhoan);


    // Tìm kiếm nhân viên theo tên, mã, số điện thoại hoặc email
    @Query("SELECT n FROM NhanVien n WHERE LOWER(n.tenNhanVien) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.maNhanVien) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<NhanVien> searchByKeyword(@Param("keyword") String keyword);

    // Phân trang và lọc theo trạng thái tài khoản
    @Query("SELECT n FROM NhanVien n WHERE (:trangThai IS NULL OR n.taiKhoan.trangThai = :trangThai)")
    Page<NhanVien> findByTrangThai(@Param("trangThai") String trangThai, Pageable pageable);

    // Phân trang và lọc theo trạng thái tài khoản và giới tính
    @Query("SELECT n FROM NhanVien n WHERE (:trangThai IS NULL OR n.taiKhoan.trangThai = :trangThai) AND (:gioiTinh IS NULL OR n.gioiTinh = :gioiTinh)")
    Page<NhanVien> findByTrangThaiAndGioiTinh(@Param("trangThai") String trangThai, @Param("gioiTinh") Boolean gioiTinh, Pageable pageable);

    @Query("SELECT COUNT(n) > 0 FROM NhanVien n WHERE LOWER(n.maNhanVien) = LOWER(:maNhanVien)")
    boolean existsByMaNhanVienIgnoreCase(@Param("maNhanVien") String maNhanVien);

    @Query("SELECT COUNT(n) > 0 FROM NhanVien n WHERE LOWER(n.email) = LOWER(:email)")
    boolean existsByEmailIgnoreCase(@Param("email") String email);

    @Query("SELECT COUNT(n) > 0 FROM NhanVien n WHERE LOWER(n.soDienThoai) = LOWER(:soDienThoai)")
    boolean existsBySoDienThoaiIgnoreCase(@Param("soDienThoai") String soDienThoai);

} 