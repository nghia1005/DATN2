package org.example.duan.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.SanPhamDTO;
import org.example.duan.Entity.ThuongHieu;
import org.example.duan.Entity.DanhMuc;
import org.example.duan.Entity.MauSac;
import org.example.duan.Entity.KichCo;
import org.example.duan.Entity.HinhAnh;
import org.example.duan.Entity.SanPham;
import org.example.duan.Service.SanPhamService;
import org.example.duan.Repository.SanPhamRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.example.duan.Repository.ThuongHieuRepository;
import org.example.duan.Repository.DanhMucRepository;
import org.example.duan.Repository.MauSacRepository;
import org.example.duan.Repository.KichCoRepository;
import org.example.duan.Repository.HinhAnhRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/san-pham")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SanPhamController {

    private final SanPhamService sanPhamService;
    private final SanPhamRepository sanPhamRepository;
    private final ThuongHieuRepository thuongHieuRepository;
    private final DanhMucRepository danhMucRepository;
    private final MauSacRepository mauSacRepository;
    private final KichCoRepository kichCoRepository;
    private final HinhAnhRepository hinhAnhRepository;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<SanPhamDTO>> hienThi() {
        return ResponseEntity.ok(sanPhamService.getAll());
    }

    @GetMapping("/test-all")
    public ResponseEntity<List<SanPham>> testAll() {
        return ResponseEntity.ok(sanPhamRepository.findAll());
    }

    @GetMapping("/test-active")
    public ResponseEntity<List<SanPham>> testActive() {
        return ResponseEntity.ok(sanPhamRepository.findAllActive());
    }

    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<SanPhamDTO> hienThiChiTiet(@PathVariable Integer id) {
        return sanPhamService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/them")
    public ResponseEntity<SanPhamDTO> themSanPham(@Valid @RequestBody SanPhamDTO sanPhamDTO) {
        SanPhamDTO saved = sanPhamService.add(sanPhamDTO);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/sua/{id}")
    public ResponseEntity<SanPhamDTO> suaSanPham(@PathVariable Integer id, @Valid @RequestBody SanPhamDTO sanPhamDTO) {
        SanPhamDTO updated = sanPhamService.update(id, sanPhamDTO);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/xoa/{id}")
    public ResponseEntity<Void> xoaSanPham(@PathVariable Integer id) {
        boolean deleted = sanPhamService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/xoa")
    public ResponseEntity<String> xoaKhongId() {
        return ResponseEntity
                .badRequest()
                .body("Bạn phải truyền id sản phẩm cần xóa! Ví dụ: /san-pham/xoa/1");
    }

    @GetMapping("/thuong-hieu")
    public ResponseEntity<List<ThuongHieu>> getAllThuongHieu() {
        return ResponseEntity.ok(thuongHieuRepository.findAll());
    }

    @GetMapping("/danh-muc")
    public ResponseEntity<List<DanhMuc>> getAllDanhMuc() {
        return ResponseEntity.ok(danhMucRepository.findAll());
    }

    @GetMapping("/danh-muc/{id}")
    public ResponseEntity<DanhMuc> getDanhMucById(@PathVariable Integer id) {
        return danhMucRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mau-sac")
    public ResponseEntity<List<MauSac>> getAllMauSac() {
        return ResponseEntity.ok(mauSacRepository.findAll());
    }

    @GetMapping("/kich-co")
    public ResponseEntity<List<KichCo>> getAllKichCo() {
        return ResponseEntity.ok(kichCoRepository.findAll());
    }

    @GetMapping("/hinh-anh")
    public ResponseEntity<List<HinhAnh>> getAllHinhAnh() {
        return ResponseEntity.ok(hinhAnhRepository.findAll());
    }

    @PostMapping("/danh-muc")
    public ResponseEntity<DanhMuc> createDanhMuc(@RequestBody DanhMuc danhMuc) {
        DanhMuc saved = danhMucRepository.save(danhMuc);
        return ResponseEntity.ok(saved);
    }


    @PostMapping("/thuong-hieu")
    public ResponseEntity<ThuongHieu> createThuongHieu(@RequestBody ThuongHieu thuongHieu) {
        ThuongHieu saved = thuongHieuRepository.save(thuongHieu);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/phan-trang")
    public ResponseEntity<Page<SanPhamDTO>> hienThiPhanTrang(@RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SanPhamDTO> result = sanPhamService.getAllPaged(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/kiem-tra-ma")
    public ResponseEntity<?> kiemTraMaSanPham(@RequestParam String maSanPham) {
        boolean exists = sanPhamRepository.existsByMaSanPham(maSanPham);
        return ResponseEntity.ok(java.util.Collections.singletonMap("exists", exists));
    }

}

