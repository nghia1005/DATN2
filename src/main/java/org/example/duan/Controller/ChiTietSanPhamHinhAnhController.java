package org.example.duan.Controller;

import org.example.duan.DTO.ChiTietSanPhamHinhAnhDTO;
import org.example.duan.Entity.ChiTietSanPhamHinhAnh;
import org.example.duan.Entity.ChiTietSanPham;
import org.example.duan.Entity.HinhAnh;
import org.example.duan.Repository.ChiTietSanPhamHinhAnhRepository;
import org.example.duan.Repository.ChiTietSanPhamRepository;
import org.example.duan.Repository.HinhAnhRepository;
import org.example.duan.DTO.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chi-tiet-san-pham-hinh-anh")
@CrossOrigin(origins = "*")
public class ChiTietSanPhamHinhAnhController {

    @Autowired
    private ChiTietSanPhamHinhAnhRepository chiTietSanPhamHinhAnhRepository;

    @Autowired
    private ChiTietSanPhamRepository chiTietSanPhamRepository;

    @Autowired
    private HinhAnhRepository hinhAnhRepository;

    // Lấy tất cả hình ảnh của một chi tiết sản phẩm
    @GetMapping("/{idChiTietSanPham}")
    public ResponseEntity<ApiResponse<List<ChiTietSanPhamHinhAnhDTO>>> getHinhAnhByChiTietSanPham(@PathVariable Integer idChiTietSanPham) {
        try {
            List<ChiTietSanPhamHinhAnh> hinhAnhList = chiTietSanPhamHinhAnhRepository.findByChiTietSanPhamIdChiTietSanPhamOrderByThuTuAsc(idChiTietSanPham);
            
            List<ChiTietSanPhamHinhAnhDTO> dtoList = hinhAnhList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hình ảnh thành công", dtoList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy danh sách hình ảnh: " + e.getMessage()));
        }
    }

    // Thêm hình ảnh cho chi tiết sản phẩm
    @PostMapping("/them")
    public ResponseEntity<ApiResponse<ChiTietSanPhamHinhAnhDTO>> themHinhAnh(@RequestBody ChiTietSanPhamHinhAnhDTO dto) {
        try {
            ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(dto.getIdChiTietSanPham())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi tiết sản phẩm"));
            
            HinhAnh hinhAnh = hinhAnhRepository.findById(dto.getIdHinhAnh())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hình ảnh"));

            // Kiểm tra số lượng hình ảnh hiện tại (tăng giới hạn lên 10 ảnh)
            long soLuongHinhAnh = chiTietSanPhamHinhAnhRepository.countByChiTietSanPhamIdChiTietSanPham(dto.getIdChiTietSanPham());
            if (soLuongHinhAnh >= 10) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mỗi sản phẩm chỉ được tối đa 10 hình ảnh"));
            }

            ChiTietSanPhamHinhAnh entity = new ChiTietSanPhamHinhAnh();
            entity.setChiTietSanPham(chiTietSanPham);
            entity.setHinhAnh(hinhAnh);
            entity.setThuTu(dto.getThuTu() != null ? dto.getThuTu() : (int) (soLuongHinhAnh + 1));
            entity.setLaAnhChinh(dto.getLaAnhChinh() != null ? dto.getLaAnhChinh() : false);

            // Nếu đây là ảnh chính, bỏ ảnh chính cũ và cập nhật duongDanHinhAnh trong ChiTietSanPham
            if (entity.getLaAnhChinh()) {
                ChiTietSanPhamHinhAnh anhChinhCu = chiTietSanPhamHinhAnhRepository.findByChiTietSanPhamIdChiTietSanPhamAndLaAnhChinhTrue(dto.getIdChiTietSanPham());
                if (anhChinhCu != null) {
                    anhChinhCu.setLaAnhChinh(false);
                    chiTietSanPhamHinhAnhRepository.save(anhChinhCu);
                }
                
                // Cập nhật duongDanHinhAnh trong ChiTietSanPham
                chiTietSanPham.setHinhAnh(hinhAnh);
                chiTietSanPhamRepository.save(chiTietSanPham);
            }

            ChiTietSanPhamHinhAnh saved = chiTietSanPhamHinhAnhRepository.save(entity);
            return ResponseEntity.ok(ApiResponse.success("Thêm hình ảnh thành công", convertToDTO(saved)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi thêm hình ảnh: " + e.getMessage()));
        }
    }

    // Xóa hình ảnh
    @DeleteMapping("/xoa/{id}")
    public ResponseEntity<ApiResponse<String>> xoaHinhAnh(@PathVariable Integer id) {
        try {
            ChiTietSanPhamHinhAnh entity = chiTietSanPhamHinhAnhRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hình ảnh"));
            
            boolean isAnhChinh = entity.getLaAnhChinh();
            Integer idChiTietSanPham = entity.getChiTietSanPham().getIdChiTietSanPham();
            
            chiTietSanPhamHinhAnhRepository.deleteById(id);
            
            // Nếu xóa ảnh chính, cập nhật ảnh chính mới hoặc xóa duongDanHinhAnh
            if (isAnhChinh) {
                ChiTietSanPhamHinhAnh anhChinhMoi = chiTietSanPhamHinhAnhRepository.findByChiTietSanPhamIdChiTietSanPhamOrderByThuTuAsc(idChiTietSanPham)
                    .stream()
                    .findFirst()
                    .orElse(null);
                
                ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(idChiTietSanPham)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi tiết sản phẩm"));
                
                if (anhChinhMoi != null) {
                    // Đặt ảnh đầu tiên làm ảnh chính
                    anhChinhMoi.setLaAnhChinh(true);
                    chiTietSanPhamHinhAnhRepository.save(anhChinhMoi);
                    
                    // Cập nhật duongDanHinhAnh
                    chiTietSanPham.setHinhAnh(anhChinhMoi.getHinhAnh());
                } else {
                    // Không còn ảnh nào, xóa duongDanHinhAnh
                    chiTietSanPham.setHinhAnh(null);
                }
                chiTietSanPhamRepository.save(chiTietSanPham);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Xóa hình ảnh thành công", ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi xóa hình ảnh: " + e.getMessage()));
        }
    }

    // Cập nhật thứ tự hình ảnh
    @PutMapping("/cap-nhat-thu-tu")
    public ResponseEntity<ApiResponse<String>> capNhatThuTu(@RequestBody List<ChiTietSanPhamHinhAnhDTO> dtoList) {
        try {
            for (ChiTietSanPhamHinhAnhDTO dto : dtoList) {
                ChiTietSanPhamHinhAnh entity = chiTietSanPhamHinhAnhRepository.findById(dto.getIdChiTietSanPhamHinhAnh())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hình ảnh"));
                entity.setThuTu(dto.getThuTu());
                entity.setLaAnhChinh(dto.getLaAnhChinh());
                chiTietSanPhamHinhAnhRepository.save(entity);
                
                // Nếu đây là ảnh chính, cập nhật duongDanHinhAnh trong ChiTietSanPham
                if (dto.getLaAnhChinh()) {
                    ChiTietSanPham chiTietSanPham = entity.getChiTietSanPham();
                    chiTietSanPham.setHinhAnh(entity.getHinhAnh());
                    chiTietSanPhamRepository.save(chiTietSanPham);
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật thứ tự thành công", ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi cập nhật thứ tự: " + e.getMessage()));
        }
    }

    private ChiTietSanPhamHinhAnhDTO convertToDTO(ChiTietSanPhamHinhAnh entity) {
        ChiTietSanPhamHinhAnhDTO dto = new ChiTietSanPhamHinhAnhDTO();
        dto.setIdChiTietSanPhamHinhAnh(entity.getIdChiTietSanPhamHinhAnh());
        dto.setIdChiTietSanPham(entity.getChiTietSanPham().getIdChiTietSanPham());
        dto.setIdHinhAnh(entity.getHinhAnh().getIdHinhAnh());
        dto.setTenHinhAnh(entity.getHinhAnh().getTenHinhAnh());
        dto.setUrlHinhAnh(entity.getHinhAnh().getUrlHinhAnh());
        dto.setThuTu(entity.getThuTu());
        dto.setLaAnhChinh(entity.getLaAnhChinh());
        return dto;
    }
} 