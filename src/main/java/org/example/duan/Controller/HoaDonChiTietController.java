package org.example.duan.Controller;

import org.example.duan.Entity.HoaDonChiTiet;
import org.example.duan.Repository.HoaDonChiTietRepository;
import org.example.duan.DTO.HoaDonChiTietDTO;
import org.example.duan.Repository.ChiTietSanPhamRepository;
import org.example.duan.Repository.HoaDonRepository;
import org.example.duan.Entity.HoaDon;
import org.example.duan.Service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/hoadonchitiet")
public class HoaDonChiTietController {
    @Autowired
    private HoaDonChiTietRepository repository;
    @Autowired
    private ChiTietSanPhamRepository chiTietSanPhamRepo;
    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private HoaDonService hoaDonService;

    // Lấy chi tiết theo id
    @GetMapping("/{id}")
    public ResponseEntity<HoaDonChiTiet> getById(@PathVariable Long id) {
        Optional<HoaDonChiTiet> result = repository.findById(id);
        return result.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Lấy toàn bộ chi tiết theo idHoaDon
    @GetMapping
    public ResponseEntity<?> getByIdHoaDon(@RequestParam Long idHoaDon) {
        List<HoaDonChiTiet> list = repository.findByHoaDon_IdHoaDon(idHoaDon);
        if (list == null || list.isEmpty()) {
            return ResponseEntity.status(404).body(java.util.Map.of(
                    "success", false,
                    "message", "Không tìm thấy chi tiết hóa đơn!",
                    "data", null
            ));
        }
        // Map sang DTO đầy đủ thông tin sản phẩm
        List<HoaDonChiTietDTO> dtos = new java.util.ArrayList<>();
        for (HoaDonChiTiet ct : list) {
            HoaDonChiTietDTO ctdto = new HoaDonChiTietDTO();
            ctdto.setIdHoaDonChiTiet(ct.getIdHoaDonChiTiet());
            ctdto.setIdHoaDon(ct.getHoaDon() != null ? ct.getHoaDon().getIdHoaDon() : null);
            ctdto.setIdChiTietSanPham(ct.getIdChiTietSanPham());
            ctdto.setSoLuong(ct.getSoLuong());
            ctdto.setDonGia(ct.getDonGia());
            ctdto.setThanhTien(ct.getThanhTien());
            ctdto.setTrangThai(ct.getTrangThai());
            ctdto.setNgayTao(ct.getHoaDon() != null ? ct.getHoaDon().getNgayTao() : null);
            // Lấy thông tin sản phẩm
            var chiTietSanPham = chiTietSanPhamRepo.findById(ct.getIdChiTietSanPham().intValue()).orElse(null);
            if (chiTietSanPham != null) {
                if (chiTietSanPham.getSanPham() != null) {
                    ctdto.setTenSanPham(chiTietSanPham.getSanPham().getTenSanPham());
                    ctdto.setMaSanPham(chiTietSanPham.getSanPham().getMaSanPham());
                    if (chiTietSanPham.getSanPham().getDanhMuc() != null) {
                        ctdto.setDanhMuc(chiTietSanPham.getSanPham().getDanhMuc().getTenDanhMuc());
                    }
                    if (chiTietSanPham.getSanPham().getThuongHieu() != null) {
                        ctdto.setThuongHieu(chiTietSanPham.getSanPham().getThuongHieu().getTenThuongHieu());
                    }
                }
                if (chiTietSanPham.getMauSac() != null) {
                    ctdto.setMauSac(chiTietSanPham.getMauSac().getMauSac());
                }
                if (chiTietSanPham.getKichCo() != null) {
                    ctdto.setKichCo(chiTietSanPham.getKichCo().getKichCo());
                }
            }
            dtos.add(ctdto);
        }
        return ResponseEntity.ok(dtos);
    }

    // Thêm mới
    @PostMapping
    public ResponseEntity<HoaDonChiTiet> create(@RequestBody HoaDonChiTiet chiTiet) {
        // Lấy thông tin sản phẩm để lấy giá
        var chiTietSanPhamOpt = chiTietSanPhamRepo.findById(chiTiet.getIdChiTietSanPham().intValue());
        if (chiTietSanPhamOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        var chiTietSanPham = chiTietSanPhamOpt.get();
        // Kiểm tra đã có sản phẩm này trong hóa đơn chưa
        HoaDonChiTiet existing = repository.findByHoaDon_IdHoaDonAndIdChiTietSanPham(chiTiet.getIdHoaDon(), chiTiet.getIdChiTietSanPham());
        if (existing != null) {
            // Tăng số lượng
            int newQty = (existing.getSoLuong() != null ? existing.getSoLuong() : 0) + (chiTiet.getSoLuong() != null ? chiTiet.getSoLuong() : 0);
            existing.setSoLuong(newQty);
            existing.setThanhTien(chiTietSanPham.getGia().multiply(new java.math.BigDecimal(newQty)));
            repository.save(existing);
            // Kiểm tra trạng thái hóa đơn để quyết định có trừ tồn kho hay không
            HoaDon hoaDon = hoaDonRepository.findById(chiTiet.getIdHoaDon()).orElse(null);
            if (hoaDon != null && "Đã xác nhận".equals(hoaDon.getTrangThai())) {
                // Chỉ trừ tồn kho nếu hóa đơn đã được xác nhận
                var chiTietSanPhamTonKho = chiTietSanPhamRepo.findById(chiTiet.getIdChiTietSanPham().intValue()).orElse(null);
                if (chiTietSanPhamTonKho != null) {
                    int soLuongConLai = (chiTietSanPhamTonKho.getSoLuong() != null ? chiTietSanPhamTonKho.getSoLuong() : 0) - (chiTiet.getSoLuong() != null ? chiTiet.getSoLuong() : 0);
                    if (soLuongConLai < 0) soLuongConLai = 0;
                    chiTietSanPhamTonKho.setSoLuong(soLuongConLai);
                    if (soLuongConLai == 0) {
                        chiTietSanPhamTonKho.setTrangThai("Ngừng bán");
                    }
                    chiTietSanPhamRepo.save(chiTietSanPhamTonKho);
                }
            }
            if (existing.getHoaDon() != null) {
                hoaDonService.capNhatTongTienVaThanhTien(existing.getHoaDon().getIdHoaDon());
            }
            return ResponseEntity.ok(existing);
        }
        // Nếu chưa có thì tạo mới như hiện tại
        chiTiet.setDonGia(chiTietSanPham.getGia());
        chiTiet.setThanhTien(chiTietSanPham.getGia().multiply(new java.math.BigDecimal(chiTiet.getSoLuong())));
        if (chiTiet.getTrangThai() == null) chiTiet.setTrangThai("Đang bán");
        // Gán đối tượng hóa đơn nếu chưa có
        if (chiTiet.getHoaDon() == null) {
            Long idHoaDon = chiTiet.getIdHoaDon();
            if (idHoaDon != null) {
                HoaDon hoaDon = hoaDonRepository.findById(idHoaDon).orElse(null);
                if (hoaDon != null) chiTiet.setHoaDon(hoaDon);
            }
        }
        HoaDonChiTiet saved = repository.save(chiTiet);
        // Kiểm tra trạng thái hóa đơn để quyết định có trừ tồn kho hay không
        HoaDon hoaDon = hoaDonRepository.findById(chiTiet.getIdHoaDon()).orElse(null);
        if (hoaDon != null && "Đã xác nhận".equals(hoaDon.getTrangThai())) {
            // Chỉ trừ tồn kho nếu hóa đơn đã được xác nhận
            var chiTietSanPhamTonKho = chiTietSanPhamRepo.findById(chiTiet.getIdChiTietSanPham().intValue()).orElse(null);
            if (chiTietSanPhamTonKho != null) {
                int soLuongConLai = (chiTietSanPhamTonKho.getSoLuong() != null ? chiTietSanPhamTonKho.getSoLuong() : 0) - (chiTiet.getSoLuong() != null ? chiTiet.getSoLuong() : 0);
                if (soLuongConLai < 0) soLuongConLai = 0;
                chiTietSanPhamTonKho.setSoLuong(soLuongConLai);
                if (soLuongConLai == 0) {
                    chiTietSanPhamTonKho.setTrangThai("Ngừng bán");
                }
                chiTietSanPhamRepo.save(chiTietSanPhamTonKho);
            }
        }
        if (chiTiet.getHoaDon() != null) {
            hoaDonService.capNhatTongTienVaThanhTien(chiTiet.getHoaDon().getIdHoaDon());
        }
        return ResponseEntity.ok(saved);
    }

    // Sửa
    @PutMapping("/{id}")
    public ResponseEntity<HoaDonChiTiet> update(@PathVariable Long id, @RequestBody HoaDonChiTiet chiTiet) {
        Optional<HoaDonChiTiet> existing = repository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        chiTiet.setIdHoaDonChiTiet(id);
        HoaDonChiTiet saved = repository.save(chiTiet);
        return ResponseEntity.ok(saved);
    }

    // Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<HoaDonChiTiet> opt = repository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        HoaDonChiTiet chiTiet = opt.get();
        // Cộng lại tồn kho
        var chiTietSanPhamOpt = chiTietSanPhamRepo.findById(chiTiet.getIdChiTietSanPham().intValue());
        if (chiTietSanPhamOpt.isPresent()) {
            var chiTietSanPham = chiTietSanPhamOpt.get();
            int soLuongMoi = (chiTietSanPham.getSoLuong() != null ? chiTietSanPham.getSoLuong() : 0) + (chiTiet.getSoLuong() != null ? chiTiet.getSoLuong() : 0);
            chiTietSanPham.setSoLuong(soLuongMoi);
            if ("Ngừng bán".equals(chiTietSanPham.getTrangThai()) && soLuongMoi > 0) {
                chiTietSanPham.setTrangThai("Đang bán");
            }
            chiTietSanPhamRepo.save(chiTietSanPham);
        }
        repository.deleteById(id);
        // Cập nhật lại tổng tiền hóa đơn
        if (chiTiet.getHoaDon() != null) {
            hoaDonService.capNhatTongTienVaThanhTien(chiTiet.getHoaDon().getIdHoaDon());
        }
        return ResponseEntity.noContent().build();
    }
} 