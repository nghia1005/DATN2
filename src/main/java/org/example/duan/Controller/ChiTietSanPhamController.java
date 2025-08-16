package org.example.duan.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.ChiTietSanPhamDTO;
import org.example.duan.Service.ChiTietSanPhamService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Pageable;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.validation.BindingResult;

@RestController
@RequestMapping("/chi-tiet-san-pham")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChiTietSanPhamController {

    private final ChiTietSanPhamService chiTietSanPhamService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<ChiTietSanPhamDTO>> hienThi() {
        return ResponseEntity.ok(chiTietSanPhamService.getAll());
    }

    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<ChiTietSanPhamDTO> hienThiChiTiet(@PathVariable Integer id) {
        return chiTietSanPhamService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/san-pham/{sanPhamId}")
    public ResponseEntity<List<ChiTietSanPhamDTO>> getBySanPhamId(@PathVariable Integer sanPhamId) {
        return ResponseEntity.ok(chiTietSanPhamService.getBySanPhamId(sanPhamId));
    }

    @GetMapping("/mau-sac/{mauSacId}")
    public ResponseEntity<List<ChiTietSanPhamDTO>> getByMauSacId(@PathVariable Integer mauSacId) {
        return ResponseEntity.ok(chiTietSanPhamService.getByMauSacId(mauSacId));
    }

    @GetMapping("/kich-co/{kichCoId}")
    public ResponseEntity<List<ChiTietSanPhamDTO>> getByKichCoId(@PathVariable Integer kichCoId) {
        return ResponseEntity.ok(chiTietSanPhamService.getByKichCoId(kichCoId));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<ChiTietSanPhamDTO>> getByTrangThai(@PathVariable String trangThai) {
        return ResponseEntity.ok(chiTietSanPhamService.getByTrangThai(trangThai));
    }

    @GetMapping("/tim-kiem")
    public ResponseEntity<Page<ChiTietSanPhamDTO>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(chiTietSanPhamService.searchByKeyword(keyword, PageRequest.of(page, size)));
    }

    @PostMapping("/them")
    public ResponseEntity<?> them(@Valid @RequestBody ChiTietSanPhamDTO chiTietSanPhamDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            // Trả về lỗi đầu tiên (hoặc trả về tất cả lỗi nếu muốn)
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }
        chiTietSanPhamDTO.setIdChiTietSanPham(null);
        return ResponseEntity.ok(chiTietSanPhamService.add(chiTietSanPhamDTO));
    }

    @PutMapping("/sua/{id}")
    public ResponseEntity<?> sua(@PathVariable Integer id, @Valid @RequestBody ChiTietSanPhamDTO chiTietSanPhamDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            // Trả về tất cả lỗi validation để debug
            StringBuilder errorMessage = new StringBuilder();
            bindingResult.getAllErrors().forEach(error -> {
                errorMessage.append(error.getDefaultMessage()).append("; ");
            });
            return ResponseEntity.badRequest().body(errorMessage.toString());
        }
        ChiTietSanPhamDTO updated = chiTietSanPhamService.update(id, chiTietSanPhamDTO);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/xoa/{id}")
    public ResponseEntity<Void> xoa(@PathVariable Integer id) {
        boolean deleted = chiTietSanPhamService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/xoa")
    public ResponseEntity<String> xoaKhongId() {
        return ResponseEntity
                .badRequest()
                .body("Bạn phải truyền id chi tiết sản phẩm cần xóa! Ví dụ: /chi-tiet-san-pham/xoa/1");
    }

    @PutMapping("/doi-trang-thai/{id}")
    public ResponseEntity<?> doiTrangThai(@PathVariable Integer id) {
        boolean result = chiTietSanPhamService.doiTrangThai(id);
        if (result) {
            return ResponseEntity.ok().body("Đổi trạng thái thành công!");
        } else {
            return ResponseEntity.badRequest().body("Không tìm thấy chi tiết sản phẩm hoặc đổi trạng thái thất bại!");
        }
    }

    @GetMapping("/phan-trang")
    public ResponseEntity<Page<ChiTietSanPhamDTO>> hienThiPhanTrang(@RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChiTietSanPhamDTO> result = chiTietSanPhamService.getAllPaged(pageable);
        return ResponseEntity.ok(result);
    }


}
