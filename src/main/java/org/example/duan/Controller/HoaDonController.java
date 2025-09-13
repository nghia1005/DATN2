package org.example.duan.Controller;

import org.example.duan.DTO.*;
import org.example.duan.Service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoadon")
public class HoaDonController {
    @Autowired
    private HoaDonService hoaDonService;

    @PostMapping
    public HoaDonDTO create(@RequestBody HoaDonRequest req) {
        return hoaDonService.createHoaDon(req);
    }

    @GetMapping
    public List<HoaDonDTO> getAll() {
        return hoaDonService.getAllHoaDon();
    }

    // Tra cứu đơn hàng theo mã
    @GetMapping("/ma/{maHoaDon}")
    public ResponseEntity<?> getByMaHoaDon(@PathVariable String maHoaDon) {
        try {
            HoaDonDTO hoaDon = hoaDonService.getByMaHoaDon(maHoaDon);
            if (hoaDon == null) {
                return ResponseEntity.status(404).body(java.util.Map.of(
                    "success", false,
                    "message", "Không tìm thấy đơn hàng với mã: " + maHoaDon,
                    "data", null
                ));
            }
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Tìm thấy đơn hàng",
                "data", hoaDon
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of(
                "success", false,
                "message", "Có lỗi xảy ra: " + e.getMessage(),
                "data", null
            ));
        }
    }

    @GetMapping("/{id}")
    public HoaDonDTO getById(@PathVariable Long id) {
        return hoaDonService.getById(id);
    }

    @PutMapping("/{id}")
    public HoaDonDTO update(@PathVariable Long id, @RequestBody HoaDonDTO dto) {
        return hoaDonService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return hoaDonService.delete(id);
    }
} 