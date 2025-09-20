package org.example.duan.Controller;

import org.example.duan.Entity.HinhAnh;
import org.example.duan.Repository.HinhAnhRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.util.*;

@RestController
@RequestMapping("/hinh-anh")
@CrossOrigin(origins = "*")
public class HinhAnhController {

    private final HinhAnhRepository hinhAnhRepository;

    // Đọc đường dẫn upload từ application.properties
    private String uploadDir = "D:/DATN2-T/src/main/resources/static/images";

    public HinhAnhController(HinhAnhRepository hinhAnhRepository) {
        this.hinhAnhRepository = hinhAnhRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        if (file.isEmpty()) {
            response.put("message", "File rỗng!");
            return ResponseEntity.badRequest().body(response);
        }
        try {
            String originalFileName = file.getOriginalFilename().replaceAll("[^a-zA-Z0-9./-_]", "_");
            String fileName = UUID.randomUUID() + "_" + originalFileName;
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();
            File dest = new File(uploadPath, fileName);
            file.transferTo(dest);
            // Lưu DB (chỉ lưu tên file)
            HinhAnh hinhAnh = new HinhAnh();
            hinhAnh.setTenHinhAnh(fileName);
            hinhAnh.setUrlHinhAnh(fileName); // chỉ lưu tên file
            hinhAnh = hinhAnhRepository.save(hinhAnh);
            // Trả về URL truy cập ảnh
            String fileUrl = "/images/" + fileName;
            response.put("message", "Upload thành công!");
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);
            response.put("idHinhAnh", hinhAnh.getIdHinhAnh());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", "Lỗi khi upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint truy cập ảnh
    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<byte[]> viewImage(@PathVariable String fileName) throws IOException {
        File file = new File(uploadDir, fileName); // Ghép path an toàn
        if (!file.exists()) return ResponseEntity.notFound().build();
        byte[] image = Files.readAllBytes(file.toPath());

        // Đoán content type từ file
        String contentType = Files.probeContentType(file.toPath());
        if (contentType == null) contentType = "application/octet-stream";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    @GetMapping("/hien-thi")
    public ResponseEntity<List<HinhAnh>> hienThi() {
        return ResponseEntity.ok(hinhAnhRepository.findAll());
    }
} 