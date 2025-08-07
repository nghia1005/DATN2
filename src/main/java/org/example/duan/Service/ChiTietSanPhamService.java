package org.example.duan.Service;

import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.ChiTietSanPhamDTO;
import org.example.duan.Entity.ChiTietSanPham;
import org.example.duan.Mapper.ChiTietSanPhamMapper;
import org.example.duan.Repository.ChiTietSanPhamRepository;
import org.example.duan.Repository.SanPhamRepository;
import org.example.duan.Repository.MauSacRepository;
import org.example.duan.Repository.KichCoRepository;
import org.example.duan.Repository.HinhAnhRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChiTietSanPhamService {

    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final SanPhamRepository sanPhamRepository;
    private final MauSacRepository mauSacRepository;
    private final KichCoRepository kichCoRepository;
    private final HinhAnhRepository hinhAnhRepository;
    private final ChiTietSanPhamMapper chiTietSanPhamMapper;

    public List<ChiTietSanPhamDTO> getAll() {
        return chiTietSanPhamRepository.findAllWithHinhAnh()
                .stream()
                .map(chiTietSanPhamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ChiTietSanPhamDTO> getById(Integer id) {
        return chiTietSanPhamRepository.findById(id)
                .map(chiTietSanPhamMapper::toDTO);
    }

    public List<ChiTietSanPhamDTO> getBySanPhamId(Integer sanPhamId) {
        return chiTietSanPhamRepository.findBySanPhamId(sanPhamId)
                .stream()
                .map(chiTietSanPhamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChiTietSanPhamDTO> getByMauSacId(Integer mauSacId) {
        return chiTietSanPhamRepository.findByMauSacId(mauSacId)
                .stream()
                .map(chiTietSanPhamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChiTietSanPhamDTO> getByKichCoId(Integer kichCoId) {
        return chiTietSanPhamRepository.findByKichCoId(kichCoId)
                .stream()
                .map(chiTietSanPhamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChiTietSanPhamDTO> getByTrangThai(String trangThai) {
        return chiTietSanPhamRepository.findByTrangThai(trangThai)
                .stream()
                .map(chiTietSanPhamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<ChiTietSanPhamDTO> searchByKeyword(String keyword, Pageable pageable) {
        return chiTietSanPhamRepository.searchByKeyword(keyword, pageable)
                .map(chiTietSanPhamMapper::toDTO);
    }

    public ChiTietSanPhamDTO add(ChiTietSanPhamDTO chiTietSanPhamDTO) {

        // Kiểm tra trùng lặp
        if (chiTietSanPhamDTO.getIdSanPham() != null && chiTietSanPhamDTO.getIdMauSac() != null && chiTietSanPhamDTO.getIdKichCo() != null) {
            boolean exists = chiTietSanPhamRepository.existsBySanPham_IdSanPhamAndMauSac_IdMauSacAndKichCo_IdKichCo(
                    chiTietSanPhamDTO.getIdSanPham(),
                    chiTietSanPhamDTO.getIdMauSac(),
                    chiTietSanPhamDTO.getIdKichCo()
            );
            if (exists) {
                throw new RuntimeException("Chi tiết sản phẩm đã tồn tại với tổ hợp sản phẩm, màu sắc, kích cỡ này!");
            }
        }

        ChiTietSanPham chiTietSanPham = chiTietSanPhamMapper.toEntity(chiTietSanPhamDTO);
        chiTietSanPham.setNgayTao(LocalDate.now());

        // Load related entities
        if (chiTietSanPhamDTO.getIdSanPham() != null) {
            sanPhamRepository.findById(chiTietSanPhamDTO.getIdSanPham())
                    .ifPresent(chiTietSanPham::setSanPham);
        }

        if (chiTietSanPhamDTO.getIdMauSac() != null) {
            mauSacRepository.findById(chiTietSanPhamDTO.getIdMauSac())
                    .ifPresent(chiTietSanPham::setMauSac);
        }

        if (chiTietSanPhamDTO.getIdKichCo() != null) {
            kichCoRepository.findById(chiTietSanPhamDTO.getIdKichCo())
                    .ifPresent(chiTietSanPham::setKichCo);
        }

        if (chiTietSanPhamDTO.getIdHinhAnh() != null) {
            hinhAnhRepository.findById(chiTietSanPhamDTO.getIdHinhAnh())
                    .ifPresent(chiTietSanPham::setHinhAnh);
        }

        ChiTietSanPham saved = chiTietSanPhamRepository.save(chiTietSanPham);
        return chiTietSanPhamMapper.toDTO(saved);
    }

    public ChiTietSanPhamDTO update(Integer id, ChiTietSanPhamDTO chiTietSanPhamDTO) {
        Optional<ChiTietSanPham> opt = chiTietSanPhamRepository.findById(id);
        if (opt.isEmpty()) {
            return null;
        }
        ChiTietSanPham chiTietSanPham = opt.get();

        // Cập nhật các trường đơn giản
        chiTietSanPham.setSoLuong(chiTietSanPhamDTO.getSoLuong());
        chiTietSanPham.setGia(chiTietSanPhamDTO.getGia());
        chiTietSanPham.setTrangThai(chiTietSanPhamDTO.getTrangThai());

        // Cập nhật quan hệ
        if (chiTietSanPhamDTO.getIdSanPham() != null) {
            sanPhamRepository.findById(chiTietSanPhamDTO.getIdSanPham())
                .ifPresent(chiTietSanPham::setSanPham);
        }
        if (chiTietSanPhamDTO.getIdMauSac() != null) {
            mauSacRepository.findById(chiTietSanPhamDTO.getIdMauSac())
                .ifPresent(chiTietSanPham::setMauSac);
        }
        if (chiTietSanPhamDTO.getIdKichCo() != null) {
            kichCoRepository.findById(chiTietSanPhamDTO.getIdKichCo())
                .ifPresent(chiTietSanPham::setKichCo);
        }
        if (chiTietSanPhamDTO.getIdHinhAnh() != null) {
            hinhAnhRepository.findById(chiTietSanPhamDTO.getIdHinhAnh())
                .ifPresent(chiTietSanPham::setHinhAnh);
        }

        ChiTietSanPham updated = chiTietSanPhamRepository.save(chiTietSanPham);
        return chiTietSanPhamMapper.toDTO(updated);
    }

    @Transactional
    public boolean delete(Integer id) {
        if (!chiTietSanPhamRepository.existsById(id)) {
            return false;
        }
        chiTietSanPhamRepository.updateTrangThai(id, "Ngừng bán");
        return true;
    }


    @Transactional
    public boolean doiTrangThai(Integer id) {
        Optional<ChiTietSanPham> opt = chiTietSanPhamRepository.findById(id);
        if (opt.isPresent()) {
            ChiTietSanPham ctsp = opt.get();
            if ("Đang bán".equals(ctsp.getTrangThai())) {
                ctsp.setTrangThai("Ngừng bán");
            } else {
                ctsp.setTrangThai("Đang bán");
            }
            chiTietSanPhamRepository.save(ctsp);
            return true;
        }
        return false;
    }

    public Page<ChiTietSanPhamDTO> getAllPaged(Pageable pageable) {
        return chiTietSanPhamRepository.findAll(pageable)
                .map(chiTietSanPhamMapper::toDTO);
    }

    public List<ChiTietSanPhamDTO> getSaleProducts() {
        List<ChiTietSanPham> saleProducts = chiTietSanPhamRepository.findSaleProducts();
        System.out.println("=== DEBUG SALE PRODUCTS ===");
        System.out.println("Raw sale products from repository: " + saleProducts.size());
        saleProducts.forEach(product -> {
            System.out.println("Product: " + product.getSanPham().getTenSanPham() + 
                             ", trangThaiSale: " + product.getTrangThaiSale() + 
                             ", phanTramGiamGia: " + product.getPhanTramGiamGia() +
                             ", trangThai: " + product.getTrangThai());
        });
        
        List<ChiTietSanPhamDTO> result = saleProducts.stream()
                .map(chiTietSanPhamMapper::toDTO)
                .collect(Collectors.toList());
        
        System.out.println("Mapped DTOs: " + result.size());
        System.out.println("=== END DEBUG ===");
        
        return result;
    }

    @Transactional
    public void updateSaleStatus(Integer id, Integer phanTramGiamGia, String trangThaiSale) {
        chiTietSanPhamRepository.updateSaleStatus(id, phanTramGiamGia, trangThaiSale);
    }
} 