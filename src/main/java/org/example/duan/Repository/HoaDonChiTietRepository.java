package org.example.duan.Repository;

import org.example.duan.Entity.HoaDonChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HoaDonChiTietRepository extends JpaRepository<HoaDonChiTiet, Long> {
    List<HoaDonChiTiet> findByHoaDon_IdHoaDon(Long idHoaDon);
    HoaDonChiTiet findByHoaDon_IdHoaDonAndIdChiTietSanPham(Long idHoaDon, Long idChiTietSanPham);
} 