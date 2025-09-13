package org.example.duan.Controller;

import org.example.duan.Entity.LichSuHoaDon;
import org.example.duan.Repository.LichSuHoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lich-su-hoa-don")
@CrossOrigin(origins = "*")
public class LichSuHoaDonController {

    @Autowired
    private LichSuHoaDonRepository lichSuHoaDonRepository;

    @GetMapping("/ma/{maHoaDon}")
    public ResponseEntity<?> getLichSuByMaHoaDon(@PathVariable String maHoaDon) {
        try {
            List<LichSuHoaDon> lichSu = lichSuHoaDonRepository.findByMaHoaDonOrderByNgayTaoDesc(maHoaDon);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Lấy lịch sử thành công",
                "data", lichSu
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Có lỗi xảy ra: " + e.getMessage(),
                "data", null
            ));
        }
    }

    @PostMapping("/them")
    public ResponseEntity<?> themLichSu(@RequestBody LichSuHoaDon lichSu) {
        try {
            LichSuHoaDon saved = lichSuHoaDonRepository.save(lichSu);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thêm lịch sử thành công",
                "data", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Có lỗi xảy ra: " + e.getMessage(),
                "data", null
            ));
        }
    }
} 