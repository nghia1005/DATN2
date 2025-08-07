package org.example.duan.Repository;

import org.example.duan.Entity.DiaChi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaChiRepository extends JpaRepository<DiaChi, Integer> {
    
    List<DiaChi> findByKhachHangIdKhachHang(Integer idKhachHang);
    
    List<DiaChi> findByMacDinh(String macDinh);
} 