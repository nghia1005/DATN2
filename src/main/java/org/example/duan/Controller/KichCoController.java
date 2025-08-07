package org.example.duan.Controller;

import org.example.duan.Entity.KichCo;
import org.example.duan.Repository.KichCoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/kich-co")
@CrossOrigin(origins = "*")
public class KichCoController {
    private final KichCoRepository kichCoRepository;

    public KichCoController(KichCoRepository kichCoRepository) {
        this.kichCoRepository = kichCoRepository;
    }

    @GetMapping("/hien-thi")
    public ResponseEntity<List<KichCo>> hienThi() {
        return ResponseEntity.ok(kichCoRepository.findAll());
    }

    @PostMapping("/them")
    public ResponseEntity<KichCo> themKichCo(@RequestBody KichCo kichCo) {
        KichCo saved = kichCoRepository.save(kichCo);
        return ResponseEntity.ok(saved);
    }
} 