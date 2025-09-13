package org.example.duan.Repository;

import org.example.duan.Entity.DiaChiNhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiaChiNhanVienRepository extends JpaRepository<DiaChiNhanVien, Integer> {
    List<DiaChiNhanVien> findByNhanVienIdNhanVien(Integer idNhanVien);
} 