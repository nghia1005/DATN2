package org.example.duan.Repository;

import org.example.duan.Entity.ThanhToanHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThanhToanHoaDonRepository extends JpaRepository<ThanhToanHoaDon, Long> {
    java.util.List<ThanhToanHoaDon> findByIdHoaDon(Long idHoaDon);
} 