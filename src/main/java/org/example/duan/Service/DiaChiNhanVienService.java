package org.example.duan.Service;

import org.example.duan.Entity.DiaChiNhanVien;
import org.example.duan.Repository.DiaChiNhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiaChiNhanVienService {
    @Autowired
    private DiaChiNhanVienRepository diaChiNhanVienRepository;

    public List<DiaChiNhanVien> getByNhanVienId(Integer idNhanVien) {
        return diaChiNhanVienRepository.findByNhanVienIdNhanVien(idNhanVien);
    }

    public DiaChiNhanVien save(DiaChiNhanVien diaChiNhanVien) {
        return diaChiNhanVienRepository.save(diaChiNhanVien);
    }

    public Optional<DiaChiNhanVien> getById(Integer idDiaChi) {
        return diaChiNhanVienRepository.findById(idDiaChi);
    }

    public void deleteById(Integer idDiaChi) {
        diaChiNhanVienRepository.deleteById(idDiaChi);
    }
} 