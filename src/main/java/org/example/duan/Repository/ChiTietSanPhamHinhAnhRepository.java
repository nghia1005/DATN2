package org.example.duan.Repository;

import org.example.duan.Entity.ChiTietSanPhamHinhAnh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietSanPhamHinhAnhRepository extends JpaRepository<ChiTietSanPhamHinhAnh, Integer> {
    
    // Lấy tất cả hình ảnh của một chi tiết sản phẩm, sắp xếp theo thứ tự
    List<ChiTietSanPhamHinhAnh> findByChiTietSanPhamIdChiTietSanPhamOrderByThuTuAsc(Integer idChiTietSanPham);
    
    // Lấy ảnh chính của một chi tiết sản phẩm
    ChiTietSanPhamHinhAnh findByChiTietSanPhamIdChiTietSanPhamAndLaAnhChinhTrue(Integer idChiTietSanPham);
    
    // Đếm số hình ảnh của một chi tiết sản phẩm
    long countByChiTietSanPhamIdChiTietSanPham(Integer idChiTietSanPham);
    
    // Xóa tất cả hình ảnh của một chi tiết sản phẩm
    void deleteByChiTietSanPhamIdChiTietSanPham(Integer idChiTietSanPham);
} 