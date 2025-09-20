package org.example.duan.Service;

import org.example.duan.Entity.PhieuGiamGia;
import org.example.duan.Repository.PhieuGiamGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class VoucherService {
    @Autowired
    private PhieuGiamGiaRepository repo;

    public BigDecimal tinhGiamGia(String maPhieuGiamGia, BigDecimal tongTien) {
        PhieuGiamGia voucher = repo.findByMaPhieuGiamGia(maPhieuGiamGia);
        if (voucher == null) return BigDecimal.ZERO;
        
        // Chỉ tính giảm giá theo phần trăm
        BigDecimal discount = BigDecimal.ZERO;
        
        // Tính giảm giá theo phần trăm: tongTien * phanTramGiamGia / 100
        discount = tongTien.multiply(voucher.getPhanTramGiamGia()).divide(BigDecimal.valueOf(100));
        
        // Giới hạn tối đa nếu vượt quá giaTriToiDa
        if (discount.compareTo(voucher.getGiaTriToiDa()) > 0) {
            discount = voucher.getGiaTriToiDa();
        }
        
        return discount;
    }

    public PhieuGiamGia add(PhieuGiamGia voucher) {
        // Kiểm tra mã không trùng
        if (repo.findByMaPhieuGiamGia(voucher.getMaPhieuGiamGia()) != null) {
            throw new RuntimeException("Mã phiếu giảm giá đã tồn tại");
        }
        return repo.save(voucher);
    }

    public PhieuGiamGia update(Long id, PhieuGiamGia voucher) {
        PhieuGiamGia existing = repo.findById(id).orElse(null);
        if (existing == null) {
            throw new RuntimeException("Không tìm thấy phiếu giảm giá");
        }
        // Nếu đổi mã, kiểm tra mã mới không trùng
        if (!existing.getMaPhieuGiamGia().equals(voucher.getMaPhieuGiamGia()) && repo.findByMaPhieuGiamGia(voucher.getMaPhieuGiamGia()) != null) {
            throw new RuntimeException("Mã phiếu giảm giá đã tồn tại");
        }
        // Chuẩn hóa trạng thái
        String currentStatus = existing.getTrangThai();
        if (currentStatus != null && (
            currentStatus.equalsIgnoreCase("Hoạt động") ||
            currentStatus.equalsIgnoreCase("Còn hiệu lực") ||
            currentStatus.equalsIgnoreCase("hoạt động") ||
            currentStatus.equalsIgnoreCase("ho?t d?ng")
        )) {
            existing.setTrangThai("Ngừng hoạt động");
        } else {
            existing.setTrangThai("Hoạt động");
        }
        // Cập nhật các trường khác (trừ trạng thái)
        existing.setMaPhieuGiamGia(voucher.getMaPhieuGiamGia());
        existing.setTenPhieuGiamGia(voucher.getTenPhieuGiamGia());
        existing.setKieuGiamGia(voucher.getKieuGiamGia());
        existing.setGiaTriToiThieu(voucher.getGiaTriToiThieu());
        existing.setGiaTriToiDa(voucher.getGiaTriToiDa());
        existing.setSoLuong(voucher.getSoLuong());
        existing.setNgayBatDau(voucher.getNgayBatDau());
        existing.setNgayKetThuc(voucher.getNgayKetThuc());
        existing.setMoTa(voucher.getMoTa());
        existing.setPhanTramGiamGia(voucher.getPhanTramGiamGia());
        return repo.save(existing);
    }

    public void delete(Long id) {
        PhieuGiamGia existing = repo.findById(id).orElse(null);
        if (existing == null) {
            throw new RuntimeException("Không tìm thấy phiếu giảm giá");
        }
        existing.setTrangThai("Ngừng hoạt động");
        repo.save(existing);
    }

    public PhieuGiamGia toggleStatus(Long id) {
        PhieuGiamGia existing = repo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giảm giá"));
        java.util.Date now = new java.util.Date();
        boolean isExpired = existing.getNgayKetThuc() != null && now.toInstant().isAfter(existing.getNgayKetThuc().atZone(java.time.ZoneId.systemDefault()).toInstant());
        if (isExpired) {
            throw new RuntimeException("Voucher đã hết hạn, không thể bật lại!");
        }
        String currentStatus = existing.getTrangThai();
        if (currentStatus != null && (currentStatus.equalsIgnoreCase("Đang diễn ra") || currentStatus.equalsIgnoreCase("Hoạt động") || currentStatus.equalsIgnoreCase("Còn hiệu lực"))) {
            existing.setTrangThai("Tạm ngưng");
        } else if (currentStatus != null && currentStatus.equalsIgnoreCase("Tạm ngưng")) {
            existing.setTrangThai("Đang diễn ra");
        } else {
            // Nếu trạng thái khác, mặc định chuyển sang Tạm ngưng
            existing.setTrangThai("Tạm ngưng");
        }
        return repo.save(existing);
    }
} 