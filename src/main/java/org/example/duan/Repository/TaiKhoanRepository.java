package org.example.duan.Repository;

import org.example.duan.Entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    boolean existsByTenTaiKhoan(String tenTaiKhoan);
    TaiKhoan findByTenTaiKhoan(String tenTaiKhoan);
} 