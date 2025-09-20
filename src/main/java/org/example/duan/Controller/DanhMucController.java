package org.example.duan.Controller;

import org.example.duan.Entity.DanhMuc;
import org.example.duan.Repository.DanhMucRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/danh-muc")
@CrossOrigin(origins = "*")
public class DanhMucController {
    private final DanhMucRepository danhMucRepository;

    public DanhMucController(DanhMucRepository danhMucRepository) {
        this.danhMucRepository = danhMucRepository;
    }

    @GetMapping("/hien-thi")
    public ResponseEntity<List<DanhMuc>> hienThi() {
        return ResponseEntity.ok(danhMucRepository.findAll());
    }

    @PostMapping("/them")
    public ResponseEntity<DanhMuc> themDanhMuc(@RequestBody DanhMuc danhMuc) {
        DanhMuc saved = danhMucRepository.save(danhMuc);
        return ResponseEntity.ok(saved);
    }
} 