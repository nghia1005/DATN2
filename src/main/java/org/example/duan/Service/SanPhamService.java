package org.example.duan.Service;

import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.SanPhamDTO;
import org.example.duan.Entity.SanPham;
import org.example.duan.Mapper.SanPhamMapper;
import org.example.duan.Repository.SanPhamRepository;
import org.example.duan.Repository.ThuongHieuRepository;
import org.example.duan.Repository.DanhMucRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final ThuongHieuRepository thuongHieuRepository;
    private final DanhMucRepository danhMucRepository;
    private final SanPhamMapper sanPhamMapper;
    // Thêm repository chi tiết sản phẩm
    private final org.example.duan.Repository.ChiTietSanPhamRepository chiTietSanPhamRepository;

    public List<SanPhamDTO> getAll() {
        return sanPhamRepository.findAll()
                .stream()
                .map(sp -> {
                    SanPhamDTO dto = sanPhamMapper.toDTO(sp);
                    // Lấy tổng số lượng biến thể
                    Integer tong = chiTietSanPhamRepository.getTongSoLuongBienTheBySanPhamId(sp.getIdSanPham());
                    dto.setTongSoLuongBienThe(tong != null ? tong : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Optional<SanPhamDTO> getById(Integer id) {
        return sanPhamRepository.findById(id)
                .map(sanPhamMapper::toDTO);
    }

    public SanPhamDTO add(SanPhamDTO sanPhamDTO) {
        SanPham sanPham = sanPhamMapper.toEntity(sanPhamDTO);

        // Load related entities
        if (sanPhamDTO.getIdThuongHieu() != null) {
            thuongHieuRepository.findById(sanPhamDTO.getIdThuongHieu())
                    .ifPresent(sanPham::setThuongHieu);
        }

        if (sanPhamDTO.getIdDanhMuc() != null) {
            danhMucRepository.findById(sanPhamDTO.getIdDanhMuc())
                    .ifPresent(sanPham::setDanhMuc);
        }

        SanPham saved = sanPhamRepository.save(sanPham);
        return sanPhamMapper.toDTO(saved);
    }

    public SanPhamDTO update(Integer id, SanPhamDTO sanPhamDTO) {
        if (!sanPhamRepository.existsById(id)) {
            return null;
        }

        SanPham sanPham = sanPhamMapper.toEntity(sanPhamDTO);
        sanPham.setIdSanPham(id);

        // Load related entities
        if (sanPhamDTO.getIdThuongHieu() != null) {
            thuongHieuRepository.findById(sanPhamDTO.getIdThuongHieu())
                    .ifPresent(sanPham::setThuongHieu);
        }

        if (sanPhamDTO.getIdDanhMuc() != null) {
            danhMucRepository.findById(sanPhamDTO.getIdDanhMuc())
                    .ifPresent(sanPham::setDanhMuc);
        }

        SanPham updated = sanPhamRepository.save(sanPham);
        return sanPhamMapper.toDTO(updated);
    }

    @Transactional
    public boolean delete(Integer id) {
        if (!sanPhamRepository.existsById(id)) {
            return false;
        }
        sanPhamRepository.updateTrangThai(id, "Ngừng bán");
        return true;
    }


    public Page<SanPhamDTO> getAllPaged(Pageable pageable) {
        return sanPhamRepository.findAll(pageable)
                .map(sanPhamMapper::toDTO);
    }

}