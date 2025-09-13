package org.example.duan.Controller;

import org.example.duan.Entity.DiaChiNhanVien;
import org.example.duan.Service.DiaChiNhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/dia-chi-nhan-vien")
public class DiaChiNhanVienController {
    @Autowired
    private DiaChiNhanVienService diaChiNhanVienService;

    @GetMapping("/nhan-vien/{idNhanVien}")
    public ResponseEntity<List<DiaChiNhanVien>> getByNhanVien(@PathVariable Integer idNhanVien) {
        return ResponseEntity.ok(diaChiNhanVienService.getByNhanVienId(idNhanVien));
    }

    @PostMapping
    public ResponseEntity<DiaChiNhanVien> create(@RequestBody DiaChiNhanVien diaChiNhanVien) {
        return ResponseEntity.ok(diaChiNhanVienService.save(diaChiNhanVien));
    }

    @PutMapping("/{idDiaChi}")
    public ResponseEntity<DiaChiNhanVien> update(@PathVariable Integer idDiaChi, @RequestBody DiaChiNhanVien diaChiNhanVien) {
        Optional<DiaChiNhanVien> old = diaChiNhanVienService.getById(idDiaChi);
        if (old.isEmpty()) return ResponseEntity.notFound().build();
        diaChiNhanVien.setIdDiaChi(idDiaChi);
        return ResponseEntity.ok(diaChiNhanVienService.save(diaChiNhanVien));
    }

    @DeleteMapping("/{idDiaChi}")
    public ResponseEntity<Void> delete(@PathVariable Integer idDiaChi) {
        diaChiNhanVienService.deleteById(idDiaChi);
        return ResponseEntity.ok().build();
    }
} 