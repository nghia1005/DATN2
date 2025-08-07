package org.example.duan.Controller;

import org.example.duan.DTO.ThanhToanRequest;
import org.example.duan.Service.ThanhToanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thanhtoan")
public class ThanhToanController {
    @Autowired
    private ThanhToanService thanhToanService;

    @PostMapping
    public ResponseEntity<Void> thanhToan(@RequestBody ThanhToanRequest req) {
        thanhToanService.thanhToan(req);
        return ResponseEntity.ok().build();
    }
} 