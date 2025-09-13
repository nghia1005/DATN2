package org.example.duan.Repository;

import org.example.duan.Entity.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {

    @Query("SELECT DISTINCT s FROM SanPham s WHERE s.trangThai = 'Đang bán'")
    List<SanPham> findAllActive();

    @Query("SELECT s FROM SanPham s WHERE s.tenSanPham LIKE %:keyword% OR s.maSanPham LIKE %:keyword%")
    Page<SanPham> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT s FROM SanPham s WHERE s.thuongHieu.idThuongHieu = :thuongHieuId AND s.trangThai = 'Đang bán'")
    Page<SanPham> findByThuongHieuId(@Param("thuongHieuId") Integer thuongHieuId, Pageable pageable);

    @Query("SELECT s FROM SanPham s WHERE s.danhMuc.idDanhMuc = :danhMucId AND s.trangThai = 'Đang bán'")
    Page<SanPham> findByDanhMucId(@Param("danhMucId") Integer danhMucId, Pageable pageable);

    @Modifying
    @Query("UPDATE SanPham s SET s.trangThai = :trangThai WHERE s.idSanPham = :id")
    void updateTrangThai(@Param("id") Integer id, @Param("trangThai") String trangThai);


    boolean existsByMaSanPham(String maSanPham);

    @Query(value = "SELECT TOP 1 sp.tenSanPham, SUM(hdct.soLuong) as total " +
           "FROM HoaDonChiTiet hdct " +
           "JOIN ChiTietSanPham ctsp ON hdct.idChiTietSanPham = ctsp.idChiTietSanPham " +
           "JOIN SanPham sp ON ctsp.idSanPham = sp.idSanPham " +
           "GROUP BY sp.tenSanPham " +
           "ORDER BY total DESC", nativeQuery = true)
    List<Object[]> findSanPhamBanNhieuNhat();

    @Query(value = "SELECT SUM(hdct.soLuong) FROM HoaDonChiTiet hdct JOIN HoaDon hd ON hdct.idHoaDon = hd.idHoaDon WHERE hd.trangThai = N'Giao hàng thành công'", nativeQuery = true)
    Long getTongSoSanPhamDaBan();

    @Query(value = "SELECT CONVERT(varchar, ISNULL(tthd.ngayTao, hd.ngayTao), 23) as date, SUM(hdct.soLuong) as sold " +
           "FROM HoaDonChiTiet hdct " +
           "JOIN HoaDon hd ON hdct.idHoaDon = hd.idHoaDon " +
           "LEFT JOIN ThanhToanHoaDon tthd ON tthd.idHoaDon = hd.idHoaDon " +
           "WHERE ISNULL(tthd.ngayTao, hd.ngayTao) >= :from AND ISNULL(tthd.ngayTao, hd.ngayTao) <= :to " +
           "AND (hd.trangThai = N'Giao hàng thành công') " +
           "GROUP BY CONVERT(varchar, ISNULL(tthd.ngayTao, hd.ngayTao), 23) " +
           "ORDER BY date ASC", nativeQuery = true)
    List<Object[]> thongKeSoLuongBanTheoNgay(@Param("from") String from, @Param("to") String to);

    @Query(value = "SELECT FORMAT(ISNULL(tthd.ngayTao, hd.ngayTao), 'yyyy-MM') as thang, SUM(hdct.soLuong) as so_luong_ban " +
           "FROM HoaDonChiTiet hdct " +
           "JOIN HoaDon hd ON hdct.idHoaDon = hd.idHoaDon " +
           "LEFT JOIN ThanhToanHoaDon tthd ON tthd.idHoaDon = hd.idHoaDon " +
           "WHERE ISNULL(tthd.ngayTao, hd.ngayTao) BETWEEN :from AND :to " +
           "AND (hd.trangThai = N'Giao hàng thành công') " +
           "GROUP BY FORMAT(ISNULL(tthd.ngayTao, hd.ngayTao), 'yyyy-MM') " +
           "ORDER BY thang", nativeQuery = true)
    List<Object[]> thongKeSoLuongBanTheoThang(@Param("from") String from, @Param("to") String to);

    @Query(value = "SELECT FORMAT(ISNULL(tthd.ngayTao, hd.ngayTao), 'yyyy-MM') as thang, SUM(hd.thanhTien) as revenue " +
           "FROM HoaDon hd " +
           "LEFT JOIN ThanhToanHoaDon tthd ON tthd.idHoaDon = hd.idHoaDon " +
           "WHERE ISNULL(tthd.ngayTao, hd.ngayTao) BETWEEN :from AND :to " +
           "AND (hd.trangThai = N'Giao hàng thành công') " +
           "AND EXISTS (SELECT 1 FROM HoaDonChiTiet hdct WHERE hdct.idHoaDon = hd.idHoaDon) " +
           "GROUP BY FORMAT(ISNULL(tthd.ngayTao, hd.ngayTao), 'yyyy-MM') " +
           "ORDER BY thang", nativeQuery = true)
    List<Object[]> thongKeDoanhThuTheoThang(@Param("from") String from, @Param("to") String to);

    @Query(value = "SELECT CONCAT(YEAR(ISNULL(tthd.ngayTao, hd.ngayTao)), '-Q', DATEPART(QUARTER, ISNULL(tthd.ngayTao, hd.ngayTao))) as quy, SUM(hdct.soLuong) as so_luong_ban " +
           "FROM HoaDonChiTiet hdct " +
           "JOIN HoaDon hd ON hdct.idHoaDon = hd.idHoaDon " +
           "LEFT JOIN ThanhToanHoaDon tthd ON tthd.idHoaDon = hd.idHoaDon " +
           "WHERE ISNULL(tthd.ngayTao, hd.ngayTao) BETWEEN :from AND :to " +
           "AND (hd.trangThai = N'Giao hàng thành công') " +
           "GROUP BY YEAR(ISNULL(tthd.ngayTao, hd.ngayTao)), DATEPART(QUARTER, ISNULL(tthd.ngayTao, hd.ngayTao)) " +
           "ORDER BY quy", nativeQuery = true)
    List<Object[]> thongKeSoLuongBanTheoQuy(@Param("from") String from, @Param("to") String to);

    @Query(value = "SELECT YEAR(ISNULL(tthd.ngayTao, hd.ngayTao)) as nam, SUM(hdct.soLuong) as so_luong_ban " +
           "FROM HoaDonChiTiet hdct " +
           "JOIN HoaDon hd ON hdct.idHoaDon = hd.idHoaDon " +
           "LEFT JOIN ThanhToanHoaDon tthd ON tthd.idHoaDon = hd.idHoaDon " +
           "WHERE ISNULL(tthd.ngayTao, hd.ngayTao) BETWEEN :from AND :to " +
           "AND (hd.trangThai = N'Giao hàng thành công') " +
           "GROUP BY YEAR(ISNULL(tthd.ngayTao, hd.ngayTao)) " +
           "ORDER BY nam", nativeQuery = true)
    List<Object[]> thongKeSoLuongBanTheoNam(@Param("from") String from, @Param("to") String to);

}