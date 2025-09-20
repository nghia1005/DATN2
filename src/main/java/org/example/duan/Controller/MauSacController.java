package org.example.duan.Controller;

import org.example.duan.Entity.MauSac;
import org.example.duan.Repository.MauSacRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/mau-sac")
@CrossOrigin(origins = "*")
public class MauSacController {
    private final MauSacRepository mauSacRepository;

    public MauSacController(MauSacRepository mauSacRepository) {
        this.mauSacRepository = mauSacRepository;
    }

    @GetMapping("/hien-thi")
    public ResponseEntity<List<MauSac>> hienThi() {
        return ResponseEntity.ok(mauSacRepository.findAll());
    }

    @PostMapping("/them")
    public ResponseEntity<MauSac> themMauSac(@RequestBody MauSac mauSac) {
        MauSac saved = mauSacRepository.save(mauSac);
        return ResponseEntity.ok(saved);
    }
} 