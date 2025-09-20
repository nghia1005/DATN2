package org.example.duan.Repository;

import org.example.duan.Entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    HoaDon findByMaHoaDon(String maHoaDon);
} 