package org.example.duan.Controller;

import org.example.duan.DTO.GioHangChiTietDTO;
import org.example.duan.Entity.GioHangChiTiet;
import org.example.duan.Service.GioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/giohang")
public class GioHangController {
    @Autowired
    private GioHangService gioHangService;

    @PostMapping("/them")
    public ResponseEntity<Void> themSanPham(@RequestBody GioHangChiTietDTO dto) {
        gioHangService.themSanPham(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{idGioHang}/chitiet")
    public ResponseEntity<List<GioHangChiTiet>> getChiTiet(@PathVariable Long idGioHang) {
        return ResponseEntity.ok(gioHangService.getChiTietGioHang(idGioHang));
    }

    @PutMapping("/capnhat-so-luong")
    public ResponseEntity<Void> capNhatSoLuong(@RequestBody Map<String, Object> payload) {
        Long idGioHang = Long.valueOf(payload.get("idGioHang").toString());
        Long idChiTietSanPham = Long.valueOf(payload.get("idChiTietSanPham").toString());
        Integer soLuongMoi = Integer.valueOf(payload.get("soLuongMoi").toString());
        gioHangService.capNhatSoLuong(idGioHang, idChiTietSanPham, soLuongMoi);
        return ResponseEntity.ok().build();
    }
} 