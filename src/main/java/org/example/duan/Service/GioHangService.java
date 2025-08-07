package org.example.duan.Service;

import org.example.duan.DTO.GioHangChiTietDTO;
import org.example.duan.Entity.GioHangChiTiet;
import org.example.duan.Repository.GioHangChiTietRepository;
import org.example.duan.Repository.ChiTietSanPhamRepository;
import org.example.duan.Entity.ChiTietSanPham;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GioHangService {
    @Autowired
    private GioHangChiTietRepository gioHangChiTietRepository;

    @Autowired
    private ChiTietSanPhamRepository chiTietSanPhamRepository;

    public void themSanPham(GioHangChiTietDTO dto) {
        ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(dto.getIdChiTietSanPham().intValue())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm chi tiết với ID: " + dto.getIdChiTietSanPham()));
        if (dto.getSoLuong() > chiTietSanPham.getSoLuong()) {
            throw new IllegalArgumentException("Số lượng trong giỏ hàng không được lớn hơn số lượng tồn kho!");
        }
        GioHangChiTiet ct = new GioHangChiTiet();
        ct.setIdGioHang(dto.getIdGioHang());
        ct.setIdChiTietSanPham(dto.getIdChiTietSanPham());
        ct.setSoLuong(dto.getSoLuong());
        gioHangChiTietRepository.save(ct);
    }

    public List<GioHangChiTiet> getChiTietGioHang(Long idGioHang) {
        return gioHangChiTietRepository.findByIdGioHang(idGioHang);
    }

    public void capNhatSoLuong(Long idGioHang, Long idChiTietSanPham, Integer soLuongMoi) {
        ChiTietSanPham chiTietSanPham = chiTietSanPhamRepository.findById(idChiTietSanPham.intValue())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm chi tiết với ID: " + idChiTietSanPham));
        if (soLuongMoi > chiTietSanPham.getSoLuong()) {
            throw new IllegalArgumentException("Số lượng trong giỏ hàng không được lớn hơn số lượng tồn kho!");
        }
        GioHangChiTiet chiTiet = gioHangChiTietRepository.findByIdGioHangAndIdChiTietSanPham(idGioHang, idChiTietSanPham)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm trong giỏ hàng!"));
        chiTiet.setSoLuong(soLuongMoi);
        gioHangChiTietRepository.save(chiTiet);
    }
} 