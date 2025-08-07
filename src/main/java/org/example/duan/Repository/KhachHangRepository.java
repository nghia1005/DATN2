package org.example.duan.Repository;

import org.example.duan.Entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Integer> {
    
    Optional<KhachHang> findByMaKhachHang(String maKhachHang);
    
    Optional<KhachHang> findByEmail(String email);
    
    List<KhachHang> findByTrangThai(String trangThai);
    
    @Query("SELECT kh FROM KhachHang kh WHERE kh.tenKhachHang LIKE %:tenKhachHang%")
    List<KhachHang> findByTenKhachHangContaining(String tenKhachHang);
    
    @Query("SELECT kh FROM KhachHang kh WHERE kh.soDienThoai LIKE %:soDienThoai%")
    List<KhachHang> findBySoDienThoaiContaining(String soDienThoai);

    Optional<KhachHang> findByTaiKhoan(org.example.duan.Entity.TaiKhoan taiKhoan);
} 