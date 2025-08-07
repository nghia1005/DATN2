package org.example.duan.Controller;

import org.example.duan.DTO.ApDungVoucherRequest;
import org.example.duan.Entity.PhieuGiamGia;
import org.example.duan.Repository.PhieuGiamGiaRepository;
import org.example.duan.Service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/voucher")
public class VoucherController {
    @Autowired
    private PhieuGiamGiaRepository repo;
    @Autowired
    private VoucherService voucherService;

    private String mapKieuGiamGia(String kieuGiamGia) {
        if ("PHAN_TRAM".equalsIgnoreCase(kieuGiamGia)) return "PERCENT";
        if ("GIAM_TRUC_TIEP".equalsIgnoreCase(kieuGiamGia)) return "FIXED";
        return kieuGiamGia;
    }

    @GetMapping
    public ResponseEntity<List<java.util.Map<String, Object>>> getAll() {
        List<PhieuGiamGia> vouchers = repo.findAll();
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (PhieuGiamGia v : vouchers) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("idPhieuGiamGia", v.getIdPhieuGiamGia());
            map.put("maPhieuGiamGia", v.getMaPhieuGiamGia());
            map.put("tenPhieuGiamGia", v.getTenPhieuGiamGia());
            map.put("kieuGiamGia", mapKieuGiamGia(v.getKieuGiamGia()));
            map.put("giaTriToiThieu", v.getGiaTriToiThieu());
            map.put("giaTriToiDa", v.getGiaTriToiDa());
            map.put("phanTramGiamGia", v.getPhanTramGiamGia());
            map.put("soLuong", v.getSoLuong());
            map.put("ngayBatDau", v.getNgayBatDau());
            map.put("ngayKetThuc", v.getNgayKetThuc());
            map.put("moTa", v.getMoTa());
            String trangThai = v.getTrangThai();
            if ("Tạm ngưng".equalsIgnoreCase(trangThai)) {
                map.put("trangThai", "Kết thúc sớm");
            } else {
                map.put("trangThai", v.getTrangThaiDong());
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        PhieuGiamGia v = repo.findById(id).orElse(null);
        if (v == null) {
            return ResponseEntity.notFound().build();
        }
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("idPhieuGiamGia", v.getIdPhieuGiamGia());
        map.put("maPhieuGiamGia", v.getMaPhieuGiamGia());
        map.put("tenPhieuGiamGia", v.getTenPhieuGiamGia());
        map.put("kieuGiamGia", mapKieuGiamGia(v.getKieuGiamGia()));
        map.put("giaTriToiThieu", v.getGiaTriToiThieu());
        map.put("giaTriToiDa", v.getGiaTriToiDa());
        map.put("phanTramGiamGia", v.getPhanTramGiamGia());
        map.put("soLuong", v.getSoLuong());
        map.put("ngayBatDau", v.getNgayBatDau());
        map.put("ngayKetThuc", v.getNgayKetThuc());
        map.put("moTa", v.getMoTa());
        map.put("trangThai", v.getTrangThaiDong());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/apdung")
    public ResponseEntity<BigDecimal> apDungVoucher(@RequestBody ApDungVoucherRequest req) {
        BigDecimal discount = voucherService.tinhGiamGia(req.getMaPhieuGiamGia(), req.getTongTien());
        return ResponseEntity.ok(discount);
    }

    @PostMapping
    public ResponseEntity<java.util.Map<String, Object>> add(@RequestBody PhieuGiamGia voucher) {
        PhieuGiamGia v = voucherService.add(voucher);
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("idPhieuGiamGia", v.getIdPhieuGiamGia());
        map.put("maPhieuGiamGia", v.getMaPhieuGiamGia());
        map.put("tenPhieuGiamGia", v.getTenPhieuGiamGia());
        map.put("kieuGiamGia", mapKieuGiamGia(v.getKieuGiamGia()));
        map.put("giaTriToiThieu", v.getGiaTriToiThieu());
        map.put("giaTriToiDa", v.getGiaTriToiDa());
        map.put("phanTramGiamGia", v.getPhanTramGiamGia());
        map.put("soLuong", v.getSoLuong());
        map.put("ngayBatDau", v.getNgayBatDau());
        map.put("ngayKetThuc", v.getNgayKetThuc());
        map.put("moTa", v.getMoTa());
        map.put("trangThai", v.getTrangThaiDong());
        return ResponseEntity.ok(map);
    }

    @PutMapping("/{id}")
    public ResponseEntity<java.util.Map<String, Object>> update(@PathVariable Long id, @RequestBody PhieuGiamGia voucher) {
        PhieuGiamGia v = voucherService.update(id, voucher);
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("idPhieuGiamGia", v.getIdPhieuGiamGia());
        map.put("maPhieuGiamGia", v.getMaPhieuGiamGia());
        map.put("tenPhieuGiamGia", v.getTenPhieuGiamGia());
        map.put("kieuGiamGia", mapKieuGiamGia(v.getKieuGiamGia()));
        map.put("giaTriToiThieu", v.getGiaTriToiThieu());
        map.put("giaTriToiDa", v.getGiaTriToiDa());
        map.put("phanTramGiamGia", v.getPhanTramGiamGia());
        map.put("soLuong", v.getSoLuong());
        map.put("ngayBatDau", v.getNgayBatDau());
        map.put("ngayKetThuc", v.getNgayKetThuc());
        map.put("moTa", v.getMoTa());
        map.put("trangThai", v.getTrangThaiDong());
        return ResponseEntity.ok(map);
    }

    @PutMapping("/doi-trang-thai/{id}")
    public ResponseEntity<java.util.Map<String, Object>> doiTrangThai(@PathVariable Long id) {
        PhieuGiamGia v = voucherService.toggleStatus(id);
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("idPhieuGiamGia", v.getIdPhieuGiamGia());
        map.put("maPhieuGiamGia", v.getMaPhieuGiamGia());
        map.put("tenPhieuGiamGia", v.getTenPhieuGiamGia());
        map.put("kieuGiamGia", mapKieuGiamGia(v.getKieuGiamGia()));
        map.put("giaTriToiThieu", v.getGiaTriToiThieu());
        map.put("giaTriToiDa", v.getGiaTriToiDa());
        map.put("phanTramGiamGia", v.getPhanTramGiamGia());
        map.put("soLuong", v.getSoLuong());
        map.put("ngayBatDau", v.getNgayBatDau());
        map.put("ngayKetThuc", v.getNgayKetThuc());
        map.put("moTa", v.getMoTa());
        map.put("trangThai", v.getTrangThai());
        return ResponseEntity.ok(map);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 