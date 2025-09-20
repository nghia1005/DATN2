package org.example.duan.Controller;

import lombok.RequiredArgsConstructor;
import org.example.duan.Service.ThongKeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.Collections;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/thongke")
@RequiredArgsConstructor
public class ThongKeController {
    private final ThongKeService thongKeService;

    // Thống kê doanh thu theo khoảng thời gian
    @GetMapping("/doanh-thu")
    public ResponseEntity<Map<String, Object>> thongKeDoanhThu(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeDoanhThu(from, to));
    }

    // Thống kê doanh thu từng ngày trong khoảng thời gian
    @GetMapping("/doanh-thu-ngay")
    public ResponseEntity<List<Map<String, Object>>> thongKeDoanhThuTungNgay(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeDoanhThuTungNgay(from, to));
    }

    // Thống kê doanh thu từng tháng trong khoảng thời gian
    @GetMapping("/doanh-thu-thang")
    public ResponseEntity<List<Map<String, Object>>> thongKeDoanhThuTungThang(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeDoanhThuTungThang(from, to));
    }

    // Thống kê doanh thu từng quý trong khoảng thời gian
    @GetMapping("/doanh-thu-quy")
    public ResponseEntity<List<Map<String, Object>>> thongKeDoanhThuTungQuy(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeDoanhThuTungQuy(from, to));
    }

    // Thống kê doanh thu từng năm trong khoảng thời gian
    @GetMapping("/doanh-thu-nam")
    public ResponseEntity<List<Map<String, Object>>> thongKeDoanhThuTungNam(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeDoanhThuTungNam(from, to));
    }

    @GetMapping("/san-pham-ban-nhieu-nhat")
    public ResponseEntity<?> getSanPhamBanNhieuNhat() {
        try {
            Map<String, Object> result = thongKeService.getSanPhamBanNhieuNhat();
            return ResponseEntity.ok(result != null ? result : Collections.emptyMap());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/tong-so-san-pham-da-ban")
    public ResponseEntity<?> getTongSoSanPhamDaBan() {
        Long total = thongKeService.getTongSoSanPhamDaBan();
        return ResponseEntity.ok(Collections.singletonMap("tongSoSanPhamDaBan", total));
    }

    @GetMapping("/so-luong-ban-ngay")
    public ResponseEntity<?> thongKeSoLuongBanTheoNgay(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoNgay(from, to));
    }

    @GetMapping("/so-luong-ban-thang")
    public ResponseEntity<?> thongKeSoLuongBanTheoThang(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoThang(from, to));
    }

    @GetMapping("/so-luong-ban-quy")
    public ResponseEntity<?> thongKeSoLuongBanTheoQuy(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoQuy(from, to));
    }

    @GetMapping("/so-luong-ban-nam")
    public ResponseEntity<?> thongKeSoLuongBanTheoNam(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoNam(from, to));
    }

    @GetMapping("/so-luong-ban-thang-tang-truong")
    public ResponseEntity<?> thongKeSoLuongBanTheoThangVaTangTruong(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoThangVaTangTruong(from, to));
    }

    @GetMapping("/so-luong-ban-quy-tang-truong")
    public ResponseEntity<?> thongKeSoLuongBanTheoQuyVaTangTruong(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoQuyVaTangTruong(from, to));
    }

    @GetMapping("/so-luong-ban-nam-tang-truong")
    public ResponseEntity<?> thongKeSoLuongBanTheoNamVaTangTruong(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoNamVaTangTruong(from, to));
    }

    @GetMapping("/doanh-thu-thang-day-du")
    public ResponseEntity<?> thongKeDoanhThuTungThangDayDu(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeDoanhThuTungThangDayDu(from, to));
    }

    @GetMapping("/so-luong-ban-thang-day-du")
    public ResponseEntity<?> thongKeSoLuongBanTheoThangDayDu(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoThangDayDu(from, to));
    }

    @GetMapping("/so-luong-ban-quy-day-du")
    public ResponseEntity<?> thongKeSoLuongBanTheoQuyDayDu(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoQuyDayDu(from, to));
    }

    @GetMapping("/so-luong-ban-nam-day-du")
    public ResponseEntity<?> thongKeSoLuongBanTheoNamDayDu(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(thongKeService.thongKeSoLuongBanTheoNamDayDu(from, to));
    }

    // API để kiểm tra trạng thái hóa đơn
    @GetMapping("/kiem-tra-trang-thai")
    public ResponseEntity<?> kiemTraTrangThai() {
        return ResponseEntity.ok(thongKeService.kiemTraTrangThaiHoaDon());
    }
} 