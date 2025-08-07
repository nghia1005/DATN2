package org.example.duan.Repository;

import org.example.duan.Entity.PhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, Long> {
    PhieuGiamGia findByMaPhieuGiamGia(String maPhieuGiamGia);
} 