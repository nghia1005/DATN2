package org.example.duan.Repository;

import org.example.duan.Entity.GioHangChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GioHangChiTietRepository extends JpaRepository<GioHangChiTiet, Long> {
    List<GioHangChiTiet> findByIdGioHang(Long idGioHang);
    Optional<GioHangChiTiet> findByIdGioHangAndIdChiTietSanPham(Long idGioHang, Long idChiTietSanPham);
} 