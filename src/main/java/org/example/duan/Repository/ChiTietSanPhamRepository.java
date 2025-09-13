package org.example.duan.Repository;

import org.example.duan.Entity.ChiTietSanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietSanPhamRepository extends JpaRepository<ChiTietSanPham, Integer> {
    @Query("SELECT c FROM ChiTietSanPham c WHERE c.sanPham.idSanPham = :sanPhamId")
    List<ChiTietSanPham> findBySanPhamId(@Param("sanPhamId") Integer sanPhamId);

    @Query("SELECT c FROM ChiTietSanPham c WHERE c.mauSac.idMauSac = :mauSacId")
    List<ChiTietSanPham> findByMauSacId(@Param("mauSacId") Integer mauSacId);

    @Query("SELECT c FROM ChiTietSanPham c WHERE c.kichCo.idKichCo = :kichCoId")
    List<ChiTietSanPham> findByKichCoId(@Param("kichCoId") Integer kichCoId);

    @Query("SELECT c FROM ChiTietSanPham c WHERE c.trangThai = :trangThai")
    List<ChiTietSanPham> findByTrangThai(@Param("trangThai") String trangThai);

    @Query("SELECT c FROM ChiTietSanPham c WHERE c.sanPham.tenSanPham LIKE %:keyword% OR c.sanPham.maSanPham LIKE %:keyword%")
    Page<ChiTietSanPham> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE ChiTietSanPham c SET c.trangThai = :trangThai WHERE c.idChiTietSanPham = :id")
    void updateTrangThai(@Param("id") Integer id, @Param("trangThai") String trangThai);


    boolean existsBySanPham_IdSanPhamAndMauSac_IdMauSacAndKichCo_IdKichCo(Integer idSanPham, Integer idMauSac, Integer idKichCo);

    @Query("SELECT c FROM ChiTietSanPham c LEFT JOIN FETCH c.hinhAnh")
    List<ChiTietSanPham> findAllWithHinhAnh();

    @Query("SELECT SUM(c.soLuong) FROM ChiTietSanPham c WHERE c.sanPham.idSanPham = :sanPhamId")
    Integer getTongSoLuongBienTheBySanPhamId(@Param("sanPhamId") Integer sanPhamId);


} 