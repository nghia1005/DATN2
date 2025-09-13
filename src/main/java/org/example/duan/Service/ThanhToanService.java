package org.example.duan.Service;

import org.example.duan.DTO.ThanhToanRequest;
import org.example.duan.Entity.ThanhToanHoaDon;
import org.example.duan.Repository.ThanhToanHoaDonRepository;
import org.example.duan.Repository.HoaDonRepository;
import org.example.duan.Entity.HoaDon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ThanhToanService {
    @Autowired
    private ThanhToanHoaDonRepository repo;
    @Autowired
    private HoaDonRepository hoaDonRepo;

    public void thanhToan(ThanhToanRequest req) {
        ThanhToanHoaDon tt = new ThanhToanHoaDon();
        tt.setIdHoaDon(req.getIdHoaDon());
        tt.setSoTienThanhToan(req.getSoTienThanhToan());
        tt.setPhuongThucThanhToan(req.getPhuongThucThanhToan());
        tt.setGhiChu(req.getGhiChu());
        tt.setTrangThai("Hoàn tất");
        repo.save(tt);
        // Cập nhật trạng thái hóa đơn sang 'Chờ đóng gói'
        HoaDon hoaDon = hoaDonRepo.findById(req.getIdHoaDon()).orElse(null);
        if (hoaDon != null) {
            hoaDon.setTrangThai("Chờ đóng gói");
            hoaDonRepo.save(hoaDon);
        }
    }
}