package org.example.duan.Controller;

import org.example.duan.Entity.ThuongHieu;
import org.example.duan.Repository.ThuongHieuRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/thuong-hieu")
@CrossOrigin(origins = "*")
public class ThuongHieuController {
    private final ThuongHieuRepository thuongHieuRepository;

    public ThuongHieuController(ThuongHieuRepository thuongHieuRepository) {
        this.thuongHieuRepository = thuongHieuRepository;
    }

    @GetMapping("/hien-thi")
    public ResponseEntity<List<ThuongHieu>> hienThi() {
        return ResponseEntity.ok(thuongHieuRepository.findAll());
    }

    @PostMapping("/them")
    public ResponseEntity<ThuongHieu> themThuongHieu(@RequestBody ThuongHieu thuongHieu) {
        ThuongHieu saved = thuongHieuRepository.save(thuongHieu);
        return ResponseEntity.ok(saved);
    }
} 