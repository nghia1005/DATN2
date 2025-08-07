package org.example.duan.Mapper;

import org.example.duan.DTO.ChiTietSanPhamDTO;
import org.example.duan.Entity.ChiTietSanPham;
import org.example.duan.Entity.SanPham;
import org.example.duan.Entity.MauSac;
import org.example.duan.Entity.KichCo;
import org.example.duan.Entity.HinhAnh;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ChiTietSanPhamMapper {

    public ChiTietSanPhamDTO toDTO(ChiTietSanPham chiTietSanPham) {
        if (chiTietSanPham == null) {
            return null;
        }

        ChiTietSanPhamDTO dto = new ChiTietSanPhamDTO();
        dto.setIdChiTietSanPham(chiTietSanPham.getIdChiTietSanPham());
        dto.setSoLuong(chiTietSanPham.getSoLuong());
        dto.setGia(chiTietSanPham.getGia());
        dto.setTrangThai(chiTietSanPham.getTrangThai());
        dto.setNgayTao(chiTietSanPham.getNgayTao());
        dto.setPhanTramGiamGia(chiTietSanPham.getPhanTramGiamGia());
        dto.setTrangThaiSale(chiTietSanPham.getTrangThaiSale());

        // Tính giá sale nếu sản phẩm đang được bật sale
        if (chiTietSanPham.getTrangThaiSale() != null && 
            ("Bật".equals(chiTietSanPham.getTrangThaiSale()) || "ACTIVE".equals(chiTietSanPham.getTrangThaiSale())) && 
            chiTietSanPham.getPhanTramGiamGia() != null && 
            chiTietSanPham.getPhanTramGiamGia() > 0) {
            
            BigDecimal giaGoc = chiTietSanPham.getGia();
            BigDecimal phanTram = BigDecimal.valueOf(chiTietSanPham.getPhanTramGiamGia());
            BigDecimal giaSale = giaGoc.subtract(giaGoc.multiply(phanTram).divide(BigDecimal.valueOf(100)));
            dto.setGiaSale(giaSale);
        } else {
            // Nếu không sale thì giá sale = giá gốc
            dto.setGiaSale(chiTietSanPham.getGia());
        }

        if (chiTietSanPham.getSanPham() != null) {
            dto.setIdSanPham(chiTietSanPham.getSanPham().getIdSanPham());
            dto.setTenSanPham(chiTietSanPham.getSanPham().getTenSanPham());
            dto.setMaSanPham(chiTietSanPham.getSanPham().getMaSanPham());

            if (chiTietSanPham.getSanPham().getThuongHieu() != null) {
                dto.setTenThuongHieu(chiTietSanPham.getSanPham().getThuongHieu().getTenThuongHieu());
            }
            if (chiTietSanPham.getSanPham().getDanhMuc() != null) {
                dto.setTenDanhMuc(chiTietSanPham.getSanPham().getDanhMuc().getTenDanhMuc());
            }
            dto.setMoTa(chiTietSanPham.getSanPham().getMoTa());
        }

        if (chiTietSanPham.getMauSac() != null) {
            dto.setIdMauSac(chiTietSanPham.getMauSac().getIdMauSac());
            dto.setTenMauSac(chiTietSanPham.getMauSac().getMauSac());
        }

        if (chiTietSanPham.getKichCo() != null) {
            dto.setIdKichCo(chiTietSanPham.getKichCo().getIdKichCo());
            dto.setTenKichCo(chiTietSanPham.getKichCo().getKichCo());
        }

        if (chiTietSanPham.getHinhAnh() != null) {
            dto.setIdHinhAnh(chiTietSanPham.getHinhAnh().getIdHinhAnh());
            dto.setDuongDanHinhAnh(chiTietSanPham.getHinhAnh().getUrlHinhAnh());
        }

        return dto;
    }

    public ChiTietSanPham toEntity(ChiTietSanPhamDTO dto) {
        if (dto == null) {
            return null;
        }

        ChiTietSanPham chiTietSanPham = new ChiTietSanPham();
        chiTietSanPham.setIdChiTietSanPham(dto.getIdChiTietSanPham());
        chiTietSanPham.setSoLuong(dto.getSoLuong());
        chiTietSanPham.setGia(dto.getGia());
        chiTietSanPham.setTrangThai(dto.getTrangThai());
        chiTietSanPham.setNgayTao(dto.getNgayTao());
        chiTietSanPham.setPhanTramGiamGia(dto.getPhanTramGiamGia());
        chiTietSanPham.setTrangThaiSale(dto.getTrangThaiSale());

        if (dto.getIdSanPham() != null) {
            SanPham sanPham = new SanPham();
            sanPham.setIdSanPham(dto.getIdSanPham());
            chiTietSanPham.setSanPham(sanPham);
        }

        if (dto.getIdMauSac() != null) {
            MauSac mauSac = new MauSac();
            mauSac.setIdMauSac(dto.getIdMauSac());
            chiTietSanPham.setMauSac(mauSac);
        }

        if (dto.getIdKichCo() != null) {
            KichCo kichCo = new KichCo();
            kichCo.setIdKichCo(dto.getIdKichCo());
            chiTietSanPham.setKichCo(kichCo);
        }

        if (dto.getIdHinhAnh() != null) {
            HinhAnh hinhAnh = new HinhAnh();
            hinhAnh.setIdHinhAnh(dto.getIdHinhAnh());
            chiTietSanPham.setHinhAnh(hinhAnh);
        }

        return chiTietSanPham;
    }
} 