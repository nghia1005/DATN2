package org.example.duan.Service;

import org.example.duan.DTO.*;
import org.example.duan.Entity.*;
import org.example.duan.Repository.*;
import org.example.duan.Entity.HoaDonChiTiet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.Map;
import java.util.HashMap;
import org.example.duan.Repository.ChiTietSanPhamRepository;
import org.example.duan.Repository.LichSuHoaDonRepository;
import org.example.duan.Entity.LichSuHoaDon;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class HoaDonService {
    private static final Logger logger = LoggerFactory.getLogger(HoaDonService.class);
    
    @Autowired
    private HoaDonRepository hoaDonRepo;
    @Autowired
    private HoaDonChiTietRepository chiTietRepo;
    @Autowired
    private PhieuGiamGiaRepository voucherRepo;
    @Autowired
    private ChiTietSanPhamRepository chiTietSanPhamRepository;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private LichSuHoaDonRepository lichSuHoaDonRepository;
    @Autowired
    private EmailThanhToan emailThanhToan;
    
    @Transactional
    public HoaDonDTO createHoaDon(HoaDonRequest req) {
        HoaDon hd = new HoaDon();
        hd.setMaHoaDon("HD" + System.currentTimeMillis());
        hd.setIdKhachHang(req.getIdKhachHang());
        hd.setIdNhanVien(req.getIdNhanVien());
        hd.setTongTien(req.getTongTien());
        hd.setPhiShip(req.getPhiShip());
        hd.setGhiChu(req.getGhiChu());
        String trangThai = req.getTrangThai();
        if (trangThai == null || trangThai.trim().isEmpty()) {
            trangThai = "Chờ xác nhận";
        }
        hd.setTrangThai(trangThai);
        
        // Tạo lịch sử trạng thái ban đầu (tạm thời comment để tránh lỗi database)
        /*
        LichSuHoaDon lichSu = new LichSuHoaDon();
        lichSu.setMaHoaDon(hd.getMaHoaDon());
        lichSu.setTrangThaiCu("Mới tạo");
        lichSu.setTrangThaiMoi(trangThai);
        lichSu.setNgayTao(new Date());
        lichSu.setGhiChu("Tạo đơn hàng mới");
        lichSuHoaDonRepository.save(lichSu);
        */
        hd.setNgayTao(new Date());
        hd.setIdPhieuGiamGia(req.getIdPhieuGiamGia());
        hd.setLoaiDon(req.getLoaiDon());
        hd.setPhuongThucThanhToan(req.getPhuongThucThanhToan()); // Thêm field mới
        // Bổ sung map các trường giao hàng
        hd.setTenNguoiNhan(req.getTenNguoiNhan());
        hd.setSoDienThoai(req.getSoDienThoai());
        hd.setDiaChiNhanHang(req.getDiaChiNhanHang());
        hd.setEmail(req.getEmail());

        // Tính giảm giá nếu có voucher
        java.math.BigDecimal giamGia = java.math.BigDecimal.ZERO;
        if (req.getIdPhieuGiamGia() != null) {
            var voucherOpt = voucherRepo.findById(req.getIdPhieuGiamGia());
            if (voucherOpt.isPresent()) {
                var voucher = voucherOpt.get();
                if ("PERCENT".equalsIgnoreCase(voucher.getKieuGiamGia())) {
                    giamGia = req.getTongTien().multiply(voucher.getPhanTramGiamGia()).divide(java.math.BigDecimal.valueOf(100));
                    if (voucher.getGiaTriToiDa() != null && voucher.getGiaTriToiDa().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        giamGia = giamGia.min(voucher.getGiaTriToiDa());
                    }
                } else if ("FIXED".equalsIgnoreCase(voucher.getKieuGiamGia())) {
                    giamGia = voucher.getGiaTriToiDa();
                }
            }
        }
        hd.setGiamGia(giamGia);
        // Thành tiền = tổng tiền - giảm giá + phí ship
        java.math.BigDecimal thanhTien = req.getTongTien().subtract(giamGia).add(req.getPhiShip() != null ? req.getPhiShip() : java.math.BigDecimal.ZERO);
        hd.setThanhTien(thanhTien);

        // Lưu hóa đơn trước, không gắn chi tiết để tránh JPA cascade lưu trùng HDCT
        HoaDon savedHoaDon = hoaDonRepo.save(hd);
        
        // Gộp chi tiết trùng (merge) và lưu một lần
        Map<Long, HoaDonChiTietDTO> mergedItems = new HashMap<>();
        if (req.getChiTiet() != null && !req.getChiTiet().isEmpty()) {
            for (HoaDonChiTietDTO ctDto : req.getChiTiet()) {
                Long productId = ctDto.getIdChiTietSanPham();
                if (mergedItems.containsKey(productId)) {
                    HoaDonChiTietDTO existing = mergedItems.get(productId);
                    int newQty = (existing.getSoLuong() != null ? existing.getSoLuong() : 0) +
                                 (ctDto.getSoLuong() != null ? ctDto.getSoLuong() : 0);
                    java.math.BigDecimal newThanhTien = existing.getThanhTien().add(ctDto.getThanhTien());
                    existing.setSoLuong(newQty);
                    existing.setThanhTien(newThanhTien);
                } else {
                    mergedItems.put(productId, ctDto);
                }
            }

            for (HoaDonChiTietDTO ctDto : mergedItems.values()) {
                HoaDonChiTiet chiTietEntity = new HoaDonChiTiet();
                chiTietEntity.setHoaDon(savedHoaDon);
                chiTietEntity.setIdChiTietSanPham(ctDto.getIdChiTietSanPham());
                chiTietEntity.setSoLuong(ctDto.getSoLuong());
                chiTietEntity.setDonGia(ctDto.getDonGia());
                chiTietEntity.setThanhTien(ctDto.getThanhTien());
                chiTietEntity.setTrangThai("Đã xác nhận");
                
                chiTietRepo.save(chiTietEntity);
                logger.info("Đã lưu chi tiết hóa đơn (merged): {} x {} = {}",
                    ctDto.getIdChiTietSanPham(), ctDto.getSoLuong(), ctDto.getThanhTien());
            }
        }

        // Sau khi lưu hóa đơn, giảm số lượng voucher đi 1 nếu có sử dụng
        if (req.getIdPhieuGiamGia() != null) {
            var voucherOpt = voucherRepo.findById(req.getIdPhieuGiamGia());
            if (voucherOpt.isPresent()) {
                var voucher = voucherOpt.get();
                int soLuongConLai = voucher.getSoLuong() != null ? voucher.getSoLuong() : 0;
                if (soLuongConLai > 0) {
                    voucher.setSoLuong(soLuongConLai - 1);
                    voucherRepo.save(voucher);
                }
            }
        }

        // Trừ tồn kho theo danh sách đã merge để tránh trừ trùng
        if (!mergedItems.isEmpty()) {
            for (HoaDonChiTietDTO ct : mergedItems.values()) {
                ChiTietSanPham chiTiet = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham().intValue())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết với ID: " + ct.getIdChiTietSanPham()));
                
                int soLuongHienTai = chiTiet.getSoLuong() != null ? chiTiet.getSoLuong() : 0;
                int soLuongDat = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
                
                // Kiểm tra tồn kho trước khi trừ
                if (soLuongHienTai < soLuongDat) {
                    throw new RuntimeException("Số lượng tồn kho không đủ cho sản phẩm: " + chiTiet.getIdChiTietSanPham() + 
                        " (Có: " + soLuongHienTai + ", Cần: " + soLuongDat + ")");
                }
                
                // Trừ tồn kho
                int soLuongConLai = soLuongHienTai - soLuongDat;
                chiTiet.setSoLuong(soLuongConLai);
                
                // Nếu số lượng = 0 thì cập nhật trạng thái thành "Ngừng bán"
                if (soLuongConLai == 0) {
                    chiTiet.setTrangThai("Ngừng bán");
                }
                
                chiTietSanPhamRepository.save(chiTiet);
                logger.info("Đã trừ {} sản phẩm (ID: {}) khỏi kho khi tạo hóa đơn {} - Loại: {} - Phương thức: {}",
                    soLuongDat, ct.getIdChiTietSanPham(), hd.getMaHoaDon(), req.getLoaiDon(), req.getPhuongThucThanhToan());
            }
        }

        HoaDonDTO dto = new HoaDonDTO();
        dto.setIdHoaDon(hd.getIdHoaDon());
        dto.setMaHoaDon(hd.getMaHoaDon());
        dto.setIdKhachHang(hd.getIdKhachHang());
        dto.setIdNhanVien(hd.getIdNhanVien());
        dto.setTongTien(hd.getTongTien());
        dto.setGiamGia(hd.getGiamGia());
        dto.setPhiShip(hd.getPhiShip());
        dto.setThanhTien(hd.getThanhTien());
        dto.setTrangThai(hd.getTrangThai());
        dto.setGhiChu(hd.getGhiChu());
        dto.setNgayTao(hd.getNgayTao());
        dto.setIdPhieuGiamGia(hd.getIdPhieuGiamGia());
        dto.setLoaiDon(hd.getLoaiDon());
        dto.setPhuongThucThanhToan(hd.getPhuongThucThanhToan()); // Thêm mapping field mới
        // Bổ sung mapping các trường người nhận
        dto.setTenNguoiNhan(hd.getTenNguoiNhan());
        dto.setSoDienThoai(hd.getSoDienThoai());
        dto.setDiaChiNhanHang(hd.getDiaChiNhanHang());
        dto.setEmail(hd.getEmail());
        if (hd.getIdKhachHang() != null) {
            khachHangRepository.findById(hd.getIdKhachHang().intValue())
                .ifPresent(kh -> dto.setTenKhachHang(kh.getTenKhachHang()));
        }
        // Gửi email xác nhận đơn hàng
        try {
            if (hd.getEmail() != null && !hd.getEmail().trim().isEmpty()) {
                String tenKhachHang = dto.getTenKhachHang() != null ? dto.getTenKhachHang() : hd.getTenNguoiNhan();
                emailThanhToan.sendInvoiceConfirmation(hd.getEmail(), tenKhachHang, hd.getMaHoaDon());
                logger.info("Email xác nhận đơn hàng đã được gửi đến: {}", hd.getEmail());
            } else {
                logger.warn("Không có email để gửi xác nhận đơn hàng cho mã: {}", hd.getMaHoaDon());
            }
        } catch (Exception e) {
            logger.error("Lỗi gửi email xác nhận đơn hàng: {}", e.getMessage());
            // Không throw exception để không ảnh hưởng đến việc tạo hóa đơn
        }
        return dto;
    }

    public List<HoaDonDTO> getAllHoaDon() {
        List<HoaDon> list = hoaDonRepo.findAll();
        // Sắp xếp theo ngày tạo giảm dần (mới nhất lên đầu)
        list.sort((a, b) -> {
            if (a.getNgayTao() == null && b.getNgayTao() == null) return 0;
            if (a.getNgayTao() == null) return 1;
            if (b.getNgayTao() == null) return -1;
            return b.getNgayTao().compareTo(a.getNgayTao());
        });
        List<HoaDonDTO> dtos = new ArrayList<>();
        for (HoaDon hd : list) {
            HoaDonDTO dto = new HoaDonDTO();
            dto.setIdHoaDon(hd.getIdHoaDon());
            dto.setMaHoaDon(hd.getMaHoaDon());
            dto.setIdKhachHang(hd.getIdKhachHang());
            dto.setIdNhanVien(hd.getIdNhanVien());
            dto.setTongTien(hd.getTongTien());
            dto.setGiamGia(hd.getGiamGia());
            dto.setPhiShip(hd.getPhiShip());
            dto.setThanhTien(hd.getThanhTien());
            dto.setTrangThai(hd.getTrangThai());
            dto.setGhiChu(hd.getGhiChu());
            dto.setNgayTao(hd.getNgayTao());
            dto.setIdPhieuGiamGia(hd.getIdPhieuGiamGia());
            dto.setLoaiDon(hd.getLoaiDon());
            dto.setPhuongThucThanhToan(hd.getPhuongThucThanhToan());
            // Bổ sung mapping các trường người nhận
            dto.setTenNguoiNhan(hd.getTenNguoiNhan());
            dto.setSoDienThoai(hd.getSoDienThoai());
            dto.setDiaChiNhanHang(hd.getDiaChiNhanHang());
            dto.setEmail(hd.getEmail());
            if (hd.getIdKhachHang() != null) {
                khachHangRepository.findById(hd.getIdKhachHang().intValue())
                    .ifPresent(kh -> dto.setTenKhachHang(kh.getTenKhachHang()));
            }
            
            // Load chi tiết sản phẩm với thông tin đầy đủ
            List<HoaDonChiTiet> chiTietList = chiTietRepo.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
            List<HoaDonChiTietDTO> chiTietDTOs = new ArrayList<>();
            
            for (HoaDonChiTiet ct : chiTietList) {
                HoaDonChiTietDTO ctDto = new HoaDonChiTietDTO();
                ctDto.setIdHoaDonChiTiet(ct.getIdHoaDonChiTiet());
                ctDto.setIdHoaDon(ct.getHoaDon().getIdHoaDon());
                ctDto.setIdChiTietSanPham(ct.getIdChiTietSanPham());
                ctDto.setSoLuong(ct.getSoLuong());
                ctDto.setDonGia(ct.getDonGia());
                ctDto.setThanhTien(ct.getThanhTien());
                ctDto.setTrangThai(ct.getTrangThai());
                
                // Load thông tin sản phẩm từ ChiTietSanPham
                ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham().intValue()).orElse(null);
                if (chiTietSanPham != null) {
                    ctDto.setTenSanPham(chiTietSanPham.getSanPham().getTenSanPham());
                    ctDto.setMaSanPham(chiTietSanPham.getSanPham().getMaSanPham());
                    ctDto.setDanhMuc(chiTietSanPham.getSanPham().getDanhMuc().getTenDanhMuc());
                    ctDto.setThuongHieu(chiTietSanPham.getSanPham().getThuongHieu().getTenThuongHieu());
                    ctDto.setMauSac(chiTietSanPham.getMauSac().getMauSac());
                    ctDto.setKichCo(chiTietSanPham.getKichCo().getKichCo());
                }
                
                chiTietDTOs.add(ctDto);
            }
            
            dto.setChiTiet(chiTietDTOs);
            dtos.add(dto);
        }
        return dtos;
    }

    public HoaDonDTO getById(Long id) {
        HoaDon hd = hoaDonRepo.findById(id).orElse(null);
        if (hd == null) return null;
        HoaDonDTO dto = new HoaDonDTO();
        dto.setIdHoaDon(hd.getIdHoaDon());
        dto.setMaHoaDon(hd.getMaHoaDon());
        dto.setIdKhachHang(hd.getIdKhachHang());
        dto.setIdNhanVien(hd.getIdNhanVien());
        dto.setTongTien(hd.getTongTien());
        dto.setGiamGia(hd.getGiamGia());
        dto.setPhiShip(hd.getPhiShip());
        dto.setThanhTien(hd.getThanhTien());
        dto.setTrangThai(hd.getTrangThai());
        dto.setGhiChu(hd.getGhiChu());
        dto.setNgayTao(hd.getNgayTao());
        dto.setIdPhieuGiamGia(hd.getIdPhieuGiamGia());
        dto.setLoaiDon(hd.getLoaiDon());
        dto.setPhuongThucThanhToan(hd.getPhuongThucThanhToan()); // Thêm mapping field mới
        // Bổ sung mapping các trường người nhận
        dto.setTenNguoiNhan(hd.getTenNguoiNhan());
        dto.setSoDienThoai(hd.getSoDienThoai());
        dto.setDiaChiNhanHang(hd.getDiaChiNhanHang());
        dto.setEmail(hd.getEmail());
        if (hd.getIdKhachHang() != null) {
            khachHangRepository.findById(hd.getIdKhachHang().intValue())
                .ifPresent(kh -> dto.setTenKhachHang(kh.getTenKhachHang()));
        }
        
        // Load chi tiết sản phẩm với thông tin đầy đủ
        List<HoaDonChiTiet> chiTietList = chiTietRepo.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
        List<HoaDonChiTietDTO> chiTietDTOs = new ArrayList<>();
        
        for (HoaDonChiTiet ct : chiTietList) {
            HoaDonChiTietDTO ctDto = new HoaDonChiTietDTO();
            ctDto.setIdHoaDonChiTiet(ct.getIdHoaDonChiTiet());
            ctDto.setIdHoaDon(ct.getHoaDon().getIdHoaDon());
            ctDto.setIdChiTietSanPham(ct.getIdChiTietSanPham());
            ctDto.setSoLuong(ct.getSoLuong());
            ctDto.setDonGia(ct.getDonGia());
            ctDto.setThanhTien(ct.getThanhTien());
            ctDto.setTrangThai(ct.getTrangThai());
            
            // Load thông tin sản phẩm từ ChiTietSanPham
            ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham().intValue()).orElse(null);
            if (chiTietSanPham != null) {
                ctDto.setTenSanPham(chiTietSanPham.getSanPham().getTenSanPham());
                ctDto.setMaSanPham(chiTietSanPham.getSanPham().getMaSanPham());
                ctDto.setDanhMuc(chiTietSanPham.getSanPham().getDanhMuc().getTenDanhMuc());
                ctDto.setThuongHieu(chiTietSanPham.getSanPham().getThuongHieu().getTenThuongHieu());
                ctDto.setMauSac(chiTietSanPham.getMauSac().getMauSac());
                ctDto.setKichCo(chiTietSanPham.getKichCo().getKichCo());
            }
            
            chiTietDTOs.add(ctDto);
        }
        
        dto.setChiTiet(chiTietDTOs);
        return dto;
    }

    public HoaDonDTO getByMaHoaDon(String maHoaDon) {
        HoaDon hd = hoaDonRepo.findByMaHoaDon(maHoaDon);
        if (hd == null) return null;
        HoaDonDTO dto = new HoaDonDTO();
        dto.setIdHoaDon(hd.getIdHoaDon());
        dto.setMaHoaDon(hd.getMaHoaDon());
        dto.setIdKhachHang(hd.getIdKhachHang());
        dto.setIdNhanVien(hd.getIdNhanVien());
        dto.setTongTien(hd.getTongTien());
        dto.setGiamGia(hd.getGiamGia());
        dto.setPhiShip(hd.getPhiShip());
        dto.setThanhTien(hd.getThanhTien());
        dto.setTrangThai(hd.getTrangThai());
        dto.setGhiChu(hd.getGhiChu());
        dto.setNgayTao(hd.getNgayTao());
        dto.setIdPhieuGiamGia(hd.getIdPhieuGiamGia());
        dto.setLoaiDon(hd.getLoaiDon());
        dto.setPhuongThucThanhToan(hd.getPhuongThucThanhToan()); // Thêm mapping field mới
        // Bổ sung mapping các trường người nhận
        dto.setTenNguoiNhan(hd.getTenNguoiNhan());
        dto.setSoDienThoai(hd.getSoDienThoai());
        dto.setDiaChiNhanHang(hd.getDiaChiNhanHang());
        dto.setEmail(hd.getEmail());
        if (hd.getIdKhachHang() != null) {
            khachHangRepository.findById(hd.getIdKhachHang().intValue())
                .ifPresent(kh -> dto.setTenKhachHang(kh.getTenKhachHang()));
        }
        
        // Load chi tiết sản phẩm với thông tin đầy đủ
        List<HoaDonChiTiet> chiTietList = chiTietRepo.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
        List<HoaDonChiTietDTO> chiTietDTOs = new ArrayList<>();
        
        for (HoaDonChiTiet ct : chiTietList) {
            HoaDonChiTietDTO ctDto = new HoaDonChiTietDTO();
            ctDto.setIdHoaDonChiTiet(ct.getIdHoaDonChiTiet());
            ctDto.setIdHoaDon(ct.getHoaDon().getIdHoaDon());
            ctDto.setIdChiTietSanPham(ct.getIdChiTietSanPham());
            ctDto.setSoLuong(ct.getSoLuong());
            ctDto.setDonGia(ct.getDonGia());
            ctDto.setThanhTien(ct.getThanhTien());
            ctDto.setTrangThai(ct.getTrangThai());
            
            // Load thông tin sản phẩm từ ChiTietSanPham
            ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham().intValue()).orElse(null);
            if (chiTietSanPham != null) {
                ctDto.setTenSanPham(chiTietSanPham.getSanPham().getTenSanPham());
                ctDto.setMaSanPham(chiTietSanPham.getSanPham().getMaSanPham());
                ctDto.setDanhMuc(chiTietSanPham.getSanPham().getDanhMuc().getTenDanhMuc());
                ctDto.setThuongHieu(chiTietSanPham.getSanPham().getThuongHieu().getTenThuongHieu());
                ctDto.setMauSac(chiTietSanPham.getMauSac().getMauSac());
                ctDto.setKichCo(chiTietSanPham.getKichCo().getKichCo());
            }
            
            chiTietDTOs.add(ctDto);
        }
        
        dto.setChiTiet(chiTietDTOs);
        return dto;
    }

    public HoaDonDTO update(Long id, HoaDonDTO dto) {
        HoaDon hd = hoaDonRepo.findById(id).orElse(null);
        if (hd == null) return null;
        
        // Lưu trạng thái cũ để tạo lịch sử
        String trangThaiCu = hd.getTrangThai();
        
        // Cập nhật các trường cần thiết, đặc biệt là trạng thái
        if (dto.getTrangThai() != null) hd.setTrangThai(dto.getTrangThai());
        if (dto.getGhiChu() != null) hd.setGhiChu(dto.getGhiChu());
        // Bổ sung cập nhật địa chỉ giao hàng
        if (dto.getTenNguoiNhan() != null) hd.setTenNguoiNhan(dto.getTenNguoiNhan());
        if (dto.getSoDienThoai() != null) hd.setSoDienThoai(dto.getSoDienThoai());
        if (dto.getDiaChiNhanHang() != null) hd.setDiaChiNhanHang(dto.getDiaChiNhanHang());
        
        // Xử lý thay đổi trạng thái và quản lý tồn kho
        if (dto.getTrangThai() != null && !dto.getTrangThai().equals(trangThaiCu)) {
            List<HoaDonChiTiet> chiTietList = chiTietRepo.findByHoaDon_IdHoaDon(id);
            
            if ("Đã xác nhận".equals(dto.getTrangThai()) && "Chờ xác nhận".equals(trangThaiCu)) {
                // Trừ số lượng khi xác nhận đơn hàng COD
                for (HoaDonChiTiet ct : chiTietList) {
                    ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham().intValue()).orElse(null);
                    if (chiTietSanPham != null) {
                        int soLuongHienTai = chiTietSanPham.getSoLuong() != null ? chiTietSanPham.getSoLuong() : 0;
                        int soLuongTru = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
                        int soLuongMoi = soLuongHienTai - soLuongTru;
                        
                        if (soLuongMoi < 0) {
                            throw new RuntimeException("Số lượng tồn kho không đủ cho sản phẩm: " + ct.getIdChiTietSanPham());
                        }
                        
                        chiTietSanPham.setSoLuong(soLuongMoi);
                        if (soLuongMoi == 0) {
                            chiTietSanPham.setTrangThai("Ngừng bán");
                        }
                        chiTietSanPhamRepository.save(chiTietSanPham);
                        
                        logger.info("Đã trừ {} sản phẩm (ID: {}) khỏi kho khi xác nhận hóa đơn {}", 
                            soLuongTru, ct.getIdChiTietSanPham(), hd.getMaHoaDon());
                    }
                }
            } else if ("Đã hủy".equals(dto.getTrangThai()) || "Giao hàng thất bại".equals(dto.getTrangThai())) {
                // Hoàn trả số lượng về kho khi hủy đơn hàng hoặc giao hàng thất bại
                for (HoaDonChiTiet ct : chiTietList) {
                    ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham().intValue()).orElse(null);
                    if (chiTietSanPham != null) {
                        int soLuongHienTai = chiTietSanPham.getSoLuong() != null ? chiTietSanPham.getSoLuong() : 0;
                        int soLuongHoanTra = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
                        int soLuongMoi = soLuongHienTai + soLuongHoanTra;
                        
                        chiTietSanPham.setSoLuong(soLuongMoi);
                        // Nếu số lượng > 0 và đang ở trạng thái "Ngừng bán" thì chuyển về "Đang bán"
                        if (soLuongMoi > 0 && "Ngừng bán".equals(chiTietSanPham.getTrangThai())) {
                            chiTietSanPham.setTrangThai("Đang bán");
                        }
                        chiTietSanPhamRepository.save(chiTietSanPham);
                        
                        logger.info("Đã hoàn trả {} sản phẩm (ID: {}) về kho cho hóa đơn {}", 
                            soLuongHoanTra, ct.getIdChiTietSanPham(), hd.getMaHoaDon());
                    }
                }
            }
        }
        
        // Tạo lịch sử nếu trạng thái thay đổi (tạm thời comment để tránh lỗi database)
        /*
        if (dto.getTrangThai() != null && !dto.getTrangThai().equals(trangThaiCu)) {
            LichSuHoaDon lichSu = new LichSuHoaDon();
            lichSu.setMaHoaDon(hd.getMaHoaDon());
            lichSu.setTrangThaiCu(trangThaiCu != null ? trangThaiCu : "Không xác định");
            lichSu.setTrangThaiMoi(dto.getTrangThai());
            lichSu.setNgayTao(new Date());
            lichSu.setGhiChu("Cập nhật trạng thái đơn hàng");
            lichSuHoaDonRepository.save(lichSu);
        }
        */
        
        hoaDonRepo.save(hd);
        HoaDonDTO result = new HoaDonDTO();
        result.setIdHoaDon(hd.getIdHoaDon());
        result.setMaHoaDon(hd.getMaHoaDon());
        result.setIdKhachHang(hd.getIdKhachHang());
        result.setIdNhanVien(hd.getIdNhanVien());
        result.setTongTien(hd.getTongTien());
        result.setGiamGia(hd.getGiamGia());
        result.setPhiShip(hd.getPhiShip());
        result.setThanhTien(hd.getThanhTien());
        result.setTrangThai(hd.getTrangThai());
        result.setGhiChu(hd.getGhiChu());
        result.setNgayTao(hd.getNgayTao());
        result.setIdPhieuGiamGia(hd.getIdPhieuGiamGia());
        result.setLoaiDon(hd.getLoaiDon());
        // Bổ sung mapping các trường người nhận
        result.setTenNguoiNhan(hd.getTenNguoiNhan());
        result.setSoDienThoai(hd.getSoDienThoai());
        result.setDiaChiNhanHang(hd.getDiaChiNhanHang());
        result.setEmail(hd.getEmail());
        return result;
    }
    // Xóa hoàn toàn hóa đơn và các chi tiết liên quan
    @Transactional
    public boolean delete(Long id) {
        HoaDon hd = hoaDonRepo.findById(id).orElse(null);
        if (hd == null) return false;
        // Xóa chi tiết hóa đơn trước (nếu có)
        List<HoaDonChiTiet> chiTietList = chiTietRepo.findByHoaDon_IdHoaDon(id);
        if (chiTietList != null) {
            for (HoaDonChiTiet ct : chiTietList) {
                chiTietRepo.delete(ct);
            }
        }
        hoaDonRepo.delete(hd);
        return true;
    }
    // Thêm các hàm getAll, getById, update, delete...

    public void capNhatTongTienVaThanhTien(Long idHoaDon) {
        HoaDon hoaDon = hoaDonRepo.findById(idHoaDon).orElse(null);
        if (hoaDon == null) return;
        List<HoaDonChiTiet> chiTietList = chiTietRepo.findByHoaDon_IdHoaDon(idHoaDon);
        java.math.BigDecimal tongTien = java.math.BigDecimal.ZERO;
        for (HoaDonChiTiet ct : chiTietList) {
            if (ct.getThanhTien() != null) tongTien = tongTien.add(ct.getThanhTien());
        }
        hoaDon.setTongTien(tongTien);
        // Thành tiền = tổng tiền - giảm giá + phí ship
        java.math.BigDecimal giamGia = hoaDon.getGiamGia() != null ? hoaDon.getGiamGia() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal phiShip = hoaDon.getPhiShip() != null ? hoaDon.getPhiShip() : java.math.BigDecimal.ZERO;
        hoaDon.setThanhTien(tongTien.subtract(giamGia).add(phiShip));
        hoaDonRepo.save(hoaDon);
    }
} 