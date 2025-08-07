package org.example.duan.Mapper;

import org.example.duan.DTO.SanPhamDTO;
import org.example.duan.Entity.SanPham;
import org.example.duan.Entity.ThuongHieu;
import org.example.duan.Entity.DanhMuc;
import org.springframework.stereotype.Component;

@Component
public class SanPhamMapper {

    public SanPhamDTO toDTO(SanPham sanPham) {
        if (sanPham == null) {
            return null;
        }

        SanPhamDTO dto = new SanPhamDTO();
        dto.setIdSanPham(sanPham.getIdSanPham());
        dto.setMaSanPham(sanPham.getMaSanPham());
        dto.setTenSanPham(sanPham.getTenSanPham());
        dto.setTrangThai(sanPham.getTrangThai());

        dto.setMoTa(sanPham.getMoTa());
        if (sanPham.getThuongHieu() != null) {
            dto.setIdThuongHieu(sanPham.getThuongHieu().getIdThuongHieu());
            dto.setTenThuongHieu(sanPham.getThuongHieu().getTenThuongHieu());
        }

        if (sanPham.getDanhMuc() != null) {
            dto.setIdDanhMuc(sanPham.getDanhMuc().getIdDanhMuc());
            dto.setTenDanhMuc(sanPham.getDanhMuc().getTenDanhMuc());
        }
        // Map ảnh đại diện sản phẩm cha
        // dto.setTongSoLuongBienThe sẽ được set ở Service
        return dto;
    }

    public SanPham toEntity(SanPhamDTO dto) {
        if (dto == null) {
            return null;
        }

        SanPham sanPham = new SanPham();
        sanPham.setIdSanPham(dto.getIdSanPham());
        sanPham.setMaSanPham(dto.getMaSanPham());
        sanPham.setTenSanPham(dto.getTenSanPham());
        sanPham.setTrangThai(dto.getTrangThai());

        sanPham.setMoTa(dto.getMoTa());
        if (dto.getIdThuongHieu() != null) {
            ThuongHieu thuongHieu = new ThuongHieu();
            thuongHieu.setIdThuongHieu(dto.getIdThuongHieu());
            sanPham.setThuongHieu(thuongHieu);
        }

        if (dto.getIdDanhMuc() != null) {
            DanhMuc danhMuc = new DanhMuc();
            danhMuc.setIdDanhMuc(dto.getIdDanhMuc());
            sanPham.setDanhMuc(danhMuc);
        }

        return sanPham;
    }
} 