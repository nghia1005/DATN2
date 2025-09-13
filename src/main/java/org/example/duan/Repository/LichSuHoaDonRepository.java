package org.example.duan.Repository;

import org.example.duan.Entity.LichSuHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LichSuHoaDonRepository extends JpaRepository<LichSuHoaDon, Long> {
    List<LichSuHoaDon> findByMaHoaDonOrderByNgayTaoDesc(String maHoaDon);
} 