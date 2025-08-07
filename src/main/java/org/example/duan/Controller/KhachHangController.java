package org.example.duan.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.KhachHangDTO;
import org.example.duan.DTO.DiaChiDTO;
import org.example.duan.DTO.ApiResponse;
import org.example.duan.Entity.DiaChi;
import org.example.duan.Entity.KhachHang;
import org.example.duan.Service.KhachHangService;
import org.example.duan.Repository.DiaChiRepository;
import org.example.duan.Repository.KhachHangRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/khach-hang")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KhachHangController {

    private final KhachHangService khachHangService;
    private final DiaChiRepository diaChiRepository;
    private final KhachHangRepository khachHangRepository;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<KhachHangDTO>> hienThi() {
        return ResponseEntity.ok(khachHangService.getAll());
    }

    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<KhachHangDTO> hienThiChiTiet(@PathVariable Integer id) {
        return khachHangService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoints tìm kiếm
    @GetMapping("/tim-kiem/ten/{tenKhachHang}")
    public ResponseEntity<List<KhachHangDTO>> timKiemTheoTen(@PathVariable String tenKhachHang) {
        return ResponseEntity.ok(khachHangService.searchByTenKhachHang(tenKhachHang));
    }

    @GetMapping("/tim-kiem/sdt/{soDienThoai}")
    public ResponseEntity<List<KhachHangDTO>> timKiemTheoSDT(@PathVariable String soDienThoai) {
        return ResponseEntity.ok(khachHangService.searchBySoDienThoai(soDienThoai));
    }

    @GetMapping("/tim-kiem/trang-thai/{trangThai}")
    public ResponseEntity<List<KhachHangDTO>> timKiemTheoTrangThai(@PathVariable String trangThai) {
        return ResponseEntity.ok(khachHangService.getByTrangThai(trangThai));
    }

    @GetMapping("/tim-kiem/ma/{maKhachHang}")
    public ResponseEntity<KhachHangDTO> timKiemTheoMa(@PathVariable String maKhachHang) {
        return khachHangService.getByMaKhachHang(maKhachHang)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tim-kiem/email/{email}")
    public ResponseEntity<KhachHangDTO> timKiemTheoEmail(@PathVariable String email) {
        return khachHangService.getByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/them")
    public ResponseEntity<ApiResponse> themKhachHang(@Valid @RequestBody KhachHangDTO khachHangDTO) {
        try {
            KhachHangDTO saved = khachHangService.add(khachHangDTO);
            return ResponseEntity.ok(ApiResponse.success("Thêm khách hàng thành công", saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Có lỗi xảy ra khi thêm khách hàng: " + e.getMessage()));
        }
    }

    @PutMapping("/sua/{id}")
    public ResponseEntity<ApiResponse> suaKhachHang(@PathVariable Integer id, @Valid @RequestBody KhachHangDTO khachHangDTO) {
        try {
            KhachHangDTO updated = khachHangService.update(id, khachHangDTO);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật khách hàng thành công", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Có lỗi xảy ra khi cập nhật khách hàng: " + e.getMessage()));
        }
    }

    @DeleteMapping("/xoa/{id}")
    public ResponseEntity<Void> xoaKhachHang(@PathVariable Integer id) {
        boolean deleted = khachHangService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/chuyen-trang-thai/{id}")
    public ResponseEntity<KhachHangDTO> chuyenTrangThai(@PathVariable Integer id) {
        KhachHangDTO updated = khachHangService.toggleTrangThai(id);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // Endpoints cho quản lý địa chỉ
    @GetMapping("/{idKhachHang}/dia-chi")
    public ResponseEntity<List<DiaChi>> getDiaChiByKhachHang(@PathVariable Integer idKhachHang) {
        List<DiaChi> diaChiList = diaChiRepository.findByKhachHangIdKhachHang(idKhachHang);
        return ResponseEntity.ok(diaChiList);
    }

    @PostMapping("/{idKhachHang}/dia-chi")
    public ResponseEntity<DiaChi> themDiaChi(@PathVariable Integer idKhachHang, @Valid @RequestBody DiaChiDTO diaChiDTO) {
        Optional<KhachHang> khachHangOpt = khachHangRepository.findById(idKhachHang);
        if (khachHangOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DiaChi diaChi = new DiaChi();
        diaChi.setKhachHang(khachHangOpt.get());
        diaChi.setThanhPho(diaChiDTO.getThanhPho());
        diaChi.setQuanHuyen(diaChiDTO.getQuanHuyen());
        diaChi.setXaPhuong(diaChiDTO.getXaPhuong());
        diaChi.setNgoNgach(diaChiDTO.getNgoNgach());
        diaChi.setGhiChu(diaChiDTO.getGhiChu());
        diaChi.setMacDinh(diaChiDTO.getMacDinh());

        DiaChi saved = diaChiRepository.save(diaChi);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/dia-chi/{idDiaChi}")
    public ResponseEntity<DiaChi> suaDiaChi(@PathVariable Integer idDiaChi, @Valid @RequestBody DiaChiDTO diaChiDTO) {
        Optional<DiaChi> diaChiOpt = diaChiRepository.findById(idDiaChi);
        if (diaChiOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DiaChi diaChi = diaChiOpt.get();
        diaChi.setThanhPho(diaChiDTO.getThanhPho());
        diaChi.setQuanHuyen(diaChiDTO.getQuanHuyen());
        diaChi.setXaPhuong(diaChiDTO.getXaPhuong());
        diaChi.setNgoNgach(diaChiDTO.getNgoNgach());
        diaChi.setGhiChu(diaChiDTO.getGhiChu());
        diaChi.setMacDinh(diaChiDTO.getMacDinh());

        DiaChi saved = diaChiRepository.save(diaChi);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/dia-chi/{idDiaChi}")
    public ResponseEntity<Void> xoaDiaChi(@PathVariable Integer idDiaChi) {
        if (diaChiRepository.existsById(idDiaChi)) {
            diaChiRepository.deleteById(idDiaChi);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /*
    @PostMapping("/gui-ma-xac-thuc")
    public ResponseEntity<ApiResponse> guiMaXacThuc(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email không được để trống"));
        }
        
        try {
            String maXacThuc = khachHangService.guiMaXacThucEmail(email);
            return ResponseEntity.ok(ApiResponse.success("Mã xác thực đã được gửi đến email", maXacThuc));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Lỗi khi gửi mã xác thực: " + e.getMessage()));
        }
    }

    @PostMapping("/xac-thuc-email")
    public ResponseEntity<ApiResponse> xacThucEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String maXacThuc = request.get("maXacThuc");
        
        if (email == null || maXacThuc == null) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email và mã xác thực không được để trống"));
        }
        
        try {
            boolean isValid = khachHangService.xacThucEmail(email, maXacThuc);
            if (isValid) {
                return ResponseEntity.ok(ApiResponse.success("Email đã được xác thực thành công"));
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Mã xác thực không đúng hoặc đã hết hạn"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Lỗi khi xác thực email: " + e.getMessage()));
        }
    }
    */
} 