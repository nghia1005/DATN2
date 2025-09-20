package org.example.duan.Service;

import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.KhachHangDTO;
import org.example.duan.DTO.DiaChiDTO;
import org.example.duan.Entity.KhachHang;
import org.example.duan.Entity.DiaChi;
import org.example.duan.Entity.TaiKhoan;
import org.example.duan.Entity.VaiTro;
import org.example.duan.Repository.KhachHangRepository;
import org.example.duan.Repository.DiaChiRepository;
import org.example.duan.Repository.TaiKhoanRepository;
import org.example.duan.Repository.VaiTroRepository;
import org.example.duan.Service.EmailServiceOne;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;
    private final DiaChiRepository diaChiRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final EmailServiceOne emailServiceOne;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // Lưu trữ mã xác thực tạm thời (trong thực tế nên dùng Redis)
    private final ConcurrentHashMap<String, String> emailVerificationCodes = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public List<KhachHangDTO> getAll() {
        return khachHangRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<KhachHangDTO> getById(Integer id) {
        return khachHangRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<KhachHangDTO> getByTrangThai(String trangThai) {
        return khachHangRepository.findByTrangThai(trangThai).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<KhachHangDTO> searchByTenKhachHang(String tenKhachHang) {
        return khachHangRepository.findByTenKhachHangContaining(tenKhachHang).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<KhachHangDTO> searchBySoDienThoai(String soDienThoai) {
        return khachHangRepository.findBySoDienThoaiContaining(soDienThoai).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<KhachHangDTO> getByMaKhachHang(String maKhachHang) {
        return khachHangRepository.findByMaKhachHang(maKhachHang)
                .map(this::convertToDTO);
    }

    public Optional<KhachHangDTO> getByEmail(String email) {
        return khachHangRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    public KhachHangDTO add(KhachHangDTO khachHangDTO) {
        formatAndValidateData(khachHangDTO);
        if (khachHangRepository.findByMaKhachHang(khachHangDTO.getMaKhachHang()).isPresent()) {
            throw new RuntimeException("Mã khách hàng đã tồn tại trong hệ thống");
        }
        if (khachHangRepository.findByEmail(khachHangDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }
        String cleanPhone = khachHangDTO.getSoDienThoai().replaceAll("[\\s\\-\\(\\)]", "");
        List<KhachHang> existingPhones = khachHangRepository.findAll().stream()
                .filter(kh -> kh.getSoDienThoai().replaceAll("[\\s\\-\\(\\)]", "").equals(cleanPhone))
                .collect(Collectors.toList());
        if (!existingPhones.isEmpty()) {
            throw new RuntimeException("Số điện thoại đã tồn tại trong hệ thống");
        }
        
        // 1. Sinh mật khẩu random
        String randomPassword = generateRandomPassword(6, 12);
        // 2. Tạo tài khoản
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setTenTaiKhoan(khachHangDTO.getEmail());
        taiKhoan.setMatKhau(passwordEncoder.encode(randomPassword));
        VaiTro vaiTro = vaiTroRepository.findAll().stream()
            .filter(v -> v.getTenVaiTro().equalsIgnoreCase("KHACH_HANG"))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò KHACH_HANG"));
        taiKhoan.setVaiTro(vaiTro);
        taiKhoan.setTrangThai("Hoạt động");
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        // 3. Gán tài khoản cho khách hàng
        KhachHang khachHang = convertToEntity(khachHangDTO);
        khachHang.setTaiKhoan(taiKhoan);
        KhachHang saved = khachHangRepository.save(khachHang);

        // 4. Gửi email cho khách hàng (bọc try-catch)
        try {
            emailServiceOne.sendAccountInfo(
                khachHang.getEmail(),
                khachHang.getEmail(),
                randomPassword,
                khachHang.getTenKhachHang()
            );
        } catch (Exception ex) {
            System.err.println("Lỗi gửi email cho khách hàng: " + ex.getMessage());
        }
        return convertToDTO(saved);
    }

    public KhachHangDTO update(Integer id, KhachHangDTO khachHangDTO) {
        if (!khachHangRepository.existsById(id)) {
            return null;
        }
        
        // Format và validate dữ liệu
        formatAndValidateData(khachHangDTO);
        
        // Kiểm tra mã khách hàng đã tồn tại (trừ khách hàng hiện tại)
        Optional<KhachHang> existingByMa = khachHangRepository.findByMaKhachHang(khachHangDTO.getMaKhachHang());
        if (existingByMa.isPresent() && !existingByMa.get().getIdKhachHang().equals(id)) {
            throw new RuntimeException("Mã khách hàng đã tồn tại trong hệ thống");
        }
        
        // Kiểm tra email đã tồn tại (trừ khách hàng hiện tại)
        Optional<KhachHang> existingByEmail = khachHangRepository.findByEmail(khachHangDTO.getEmail());
        if (existingByEmail.isPresent() && !existingByEmail.get().getIdKhachHang().equals(id)) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }
        
        // Kiểm tra số điện thoại đã tồn tại (trừ khách hàng hiện tại)
        String cleanPhone = khachHangDTO.getSoDienThoai().replaceAll("[\\s\\-\\(\\)]", "");
        List<KhachHang> existingPhones = khachHangRepository.findAll().stream()
                .filter(kh -> kh.getSoDienThoai().replaceAll("[\\s\\-\\(\\)]", "").equals(cleanPhone))
                .filter(kh -> !kh.getIdKhachHang().equals(id))
                .collect(Collectors.toList());
        if (!existingPhones.isEmpty()) {
            throw new RuntimeException("Số điện thoại đã tồn tại trong hệ thống");
        }
        
        KhachHang khachHang = convertToEntity(khachHangDTO);
        khachHang.setIdKhachHang(id);
        KhachHang saved = khachHangRepository.save(khachHang);
        return convertToDTO(saved);
    }

    public boolean delete(Integer id) {
        if (khachHangRepository.existsById(id)) {
            khachHangRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public KhachHangDTO toggleTrangThai(Integer id) {
        Optional<KhachHang> khachHangOpt = khachHangRepository.findById(id);
        if (khachHangOpt.isEmpty()) {
            return null;
        }

        KhachHang khachHang = khachHangOpt.get();
        String trangThaiHienTai = khachHang.getTrangThai();
        
        // Chuyển đổi trạng thái - sử dụng "Ngừng hoạt động" để thống nhất với UI
        if ("Hoạt động".equals(trangThaiHienTai)) {
            khachHang.setTrangThai("Ngừng hoạt động");
        } else if ("Ngừng hoạt động".equals(trangThaiHienTai)) {
            khachHang.setTrangThai("Hoạt động");
        } else {
            // Nếu là trạng thái khác (như "Chờ xác thực"), chuyển về "Hoạt động"
            khachHang.setTrangThai("Hoạt động");
        }

        KhachHang saved = khachHangRepository.save(khachHang);
        return convertToDTO(saved);
    }

    /*
    public String guiMaXacThucEmail(String email) {
        // Kiểm tra email đã tồn tại chưa
        Optional<KhachHang> existingKhachHang = khachHangRepository.findByEmail(email);
        if (existingKhachHang.isPresent()) {
            throw new RuntimeException("Email này đã được sử dụng bởi khách hàng khác");
        }
        
        // Tạo mã xác thực 6 chữ số
        Random random = new Random();
        String maXacThuc = String.format("%06d", random.nextInt(1000000));
        
        // Lưu mã xác thực
        emailVerificationCodes.put(email, maXacThuc);
        
        // Xóa mã sau 5 phút
        scheduler.schedule(() -> {
            emailVerificationCodes.remove(email);
        }, 5, TimeUnit.MINUTES);
        
        // Trong thực tế, gửi email ở đây
        // sendEmail(email, "Mã xác thực email", "Mã xác thực của bạn là: " + maXacThuc);
        
        return maXacThuc; // Trả về để test, trong thực tế không trả về
    }
    
    public boolean xacThucEmail(String email, String maXacThuc) {
        String savedCode = emailVerificationCodes.get(email);
        if (savedCode != null && savedCode.equals(maXacThuc)) {
            emailVerificationCodes.remove(email);
            return true;
        }
        return false;
    }
    */

    private KhachHangDTO convertToDTO(KhachHang khachHang) {
        KhachHangDTO dto = new KhachHangDTO();
        dto.setIdKhachHang(khachHang.getIdKhachHang());
        dto.setMaKhachHang(khachHang.getMaKhachHang());
        dto.setTenKhachHang(khachHang.getTenKhachHang());
        dto.setNgaySinh(khachHang.getNgaySinh());
        dto.setGioiTinh(khachHang.getGioiTinh());
        dto.setSoDienThoai(khachHang.getSoDienThoai());
        dto.setEmail(khachHang.getEmail());
        dto.setTrangThai(khachHang.getTrangThai());
        
        // Lấy danh sách địa chỉ
        List<DiaChi> diaChiList = diaChiRepository.findByKhachHangIdKhachHang(khachHang.getIdKhachHang());
        List<DiaChiDTO> diaChiDTOList = diaChiList.stream()
                .map(this::convertDiaChiToDTO)
                .collect(Collectors.toList());
        dto.setDanhSachDiaChi(diaChiDTOList);
        
        // Tính số lượng địa chỉ
        dto.setSoDiaChi(diaChiList.size());
        
        return dto;
    }

    private KhachHang convertToEntity(KhachHangDTO dto) {
        KhachHang khachHang = new KhachHang();
        khachHang.setIdKhachHang(dto.getIdKhachHang());
        khachHang.setMaKhachHang(dto.getMaKhachHang());
        khachHang.setTenKhachHang(dto.getTenKhachHang());
        khachHang.setNgaySinh(dto.getNgaySinh());
        khachHang.setGioiTinh(dto.getGioiTinh());
        khachHang.setSoDienThoai(dto.getSoDienThoai());
        khachHang.setEmail(dto.getEmail());
        khachHang.setTrangThai(dto.getTrangThai());
        return khachHang;
    }

    private DiaChiDTO convertDiaChiToDTO(DiaChi diaChi) {
        DiaChiDTO dto = new DiaChiDTO();
        dto.setIdDiaChi(diaChi.getIdDiaChi());
        dto.setIdKhachHang(diaChi.getKhachHang().getIdKhachHang());
        dto.setThanhPho(diaChi.getThanhPho());
        dto.setQuanHuyen(diaChi.getQuanHuyen());
        dto.setXaPhuong(diaChi.getXaPhuong());
        dto.setNgoNgach(diaChi.getNgoNgach());
        dto.setGhiChu(diaChi.getGhiChu());
        dto.setMacDinh(diaChi.getMacDinh());
        return dto;
    }

    private void formatAndValidateData(KhachHangDTO khachHangDTO) {
        // Format mã khách hàng
        if (khachHangDTO.getMaKhachHang() != null) {
            khachHangDTO.setMaKhachHang(khachHangDTO.getMaKhachHang().trim().toUpperCase());
        }
        
        // Format tên khách hàng (viết hoa đầu mỗi từ)
        if (khachHangDTO.getTenKhachHang() != null) {
            String ten = khachHangDTO.getTenKhachHang().trim();
            String[] words = ten.split("\\s+");
            StringBuilder formattedTen = new StringBuilder();
            for (String word : words) {
                if (word.length() > 0) {
                    formattedTen.append(word.substring(0, 1).toUpperCase())
                               .append(word.substring(1).toLowerCase())
                               .append(" ");
                }
            }
            khachHangDTO.setTenKhachHang(formattedTen.toString().trim());
        }
        
        // Format số điện thoại
        if (khachHangDTO.getSoDienThoai() != null) {
            khachHangDTO.setSoDienThoai(khachHangDTO.getSoDienThoai().trim());
        }
        
        // Format email
        if (khachHangDTO.getEmail() != null) {
            khachHangDTO.setEmail(khachHangDTO.getEmail().trim().toLowerCase());
        }
    }

    // Hàm sinh mật khẩu random
    private String generateRandomPassword(int minLen, int maxLen) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        int len = minLen + (int)(Math.random() * (maxLen - minLen + 1));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < len; i++) {
            int idx = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(idx));
        }
        return sb.toString();
    }
} 