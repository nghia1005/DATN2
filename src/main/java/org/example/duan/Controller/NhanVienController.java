package org.example.duan.Controller;

import org.example.duan.Service.NhanVienService;
import org.example.duan.DTO.ApiResponse;
import org.example.duan.DTO.NhanVienDTO;

import org.example.duan.Entity.NhanVien;
import org.example.duan.Entity.VaiTro;
import org.example.duan.Repository.NhanVienRepository;
import org.example.duan.Repository.VaiTroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nhan-vien")
@CrossOrigin(origins = "*")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    // Lấy danh sách nhân viên
    @GetMapping("/hien-thi")
    public ResponseEntity<ApiResponse<List<NhanVienDTO>>> getAllNhanVien() {
        List<NhanVienDTO> nhanVienList = nhanVienService.getAllNhanVien();
//        return ResponseEntity.ok(ApiResponse.success(nhanVienList, "Lấy danh sách nhân viên thành công"));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhân viên thành công", nhanVienList));
    }

    // Lấy chi tiết nhân viên theo ID
    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<ApiResponse<NhanVienDTO>> getNhanVienById(@PathVariable Integer id) {
        return nhanVienService.getNhanVienById(id)
                .map(nhanVien -> ResponseEntity.ok(ApiResponse.success("Lấy thông tin nhân viên thành công", nhanVien)))

                .orElse(ResponseEntity.ok(ApiResponse.error("Không tìm thấy nhân viên với ID: " + id)));
    }

    // Thêm nhân viên mới
    @PostMapping("/them")
    public ResponseEntity<ApiResponse<NhanVienDTO>> createNhanVien(@RequestBody NhanVienDTO nhanVienDTO) {
        try {
            String soDienThoai = nhanVienDTO.getSoDienThoai() == null ? null : nhanVienDTO.getSoDienThoai().trim();
            String email = nhanVienDTO.getEmail() == null ? null : nhanVienDTO.getEmail().trim().toLowerCase();
            if (soDienThoai != null && nhanVienRepository.existsBySoDienThoaiIgnoreCase(soDienThoai)) {
                throw new IllegalArgumentException("Số điện thoại đã được sử dụng!");
            }
            if (email != null && nhanVienRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("Email đã được sử dụng!");
            }
            nhanVienDTO.setSoDienThoai(soDienThoai);
            nhanVienDTO.setEmail(email);
            NhanVienDTO createdNhanVien = nhanVienService.createNhanVien(nhanVienDTO);

            return ResponseEntity.ok(ApiResponse.success("Thêm nhân viên thành công", createdNhanVien));


        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Có lỗi xảy ra khi thêm nhân viên: " + e.getMessage()));
        }
    }

    // Cập nhật thông tin nhân viên
    @PutMapping("/sua/{id}")
    public ResponseEntity<ApiResponse<NhanVienDTO>> updateNhanVien(@PathVariable Integer id, @RequestBody NhanVienDTO nhanVienDTO) {
        try {
            NhanVienDTO updatedNhanVien = nhanVienService.updateNhanVien(id, nhanVienDTO);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin nhân viên thành công", updatedNhanVien));

//            return ResponseEntity.ok(ApiResponse.success(updatedNhanVien, "Cập nhật thông tin nhân viên thành công"));

//            return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin nhân viên thành công", updatedNhanVien));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Có lỗi xảy ra khi cập nhật thông tin nhân viên: " + e.getMessage()));
        }
    }

    //Đổi trạng thái
    @PutMapping("/doi-trang-thai/{id}")
    public ResponseEntity<ApiResponse<NhanVienDTO>> doiTrangThai(@PathVariable Integer id) {
        try {
            NhanVienDTO updated = nhanVienService.toggleTrangThai(id);
            return ResponseEntity.ok(ApiResponse.success("Đổi trạng thái thành công!", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Tìm kiếm nhân viên
    @GetMapping("/tim-kiem")
    public ResponseEntity<ApiResponse<List<NhanVienDTO>>> searchNhanVien(@RequestParam("keyword") String keyword) {
        List<NhanVienDTO> result = nhanVienService.searchNhanVien(keyword);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm nhân viên thành công", result));
    }
    // Phân trang
    @GetMapping("/phan-trang")
    public ResponseEntity<ApiResponse<Page<NhanVienDTO>>> phanTrang(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size,
            @RequestParam(name = "trangThai", required = false) String trangThai,
            @RequestParam(name = "gioiTinh", required = false) String gioiTinhStr) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "idNhanVien"));
            Boolean gioiTinh = null;
            if (gioiTinhStr != null) {
                if (gioiTinhStr.equalsIgnoreCase("true")) gioiTinh = Boolean.TRUE;
                else if (gioiTinhStr.equalsIgnoreCase("false")) gioiTinh = Boolean.FALSE;

            }
            Page<NhanVienDTO> nhanVienPage = nhanVienService.phanTrangDTO(pageable, trangThai, gioiTinh);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhân viên phân trang thành công", nhanVienPage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Có lỗi xảy ra khi phân trang: " + e.getMessage()));
        }
    }

}

