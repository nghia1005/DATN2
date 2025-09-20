package org.example.duan.Service;

import org.example.duan.Repository.NhanVienRepository;
import org.example.duan.Repository.TaiKhoanRepository;
import org.example.duan.Repository.VaiTroRepository;
import org.example.duan.Repository.DiaChiNhanVienRepository;
import org.example.duan.Entity.NhanVien;
import org.example.duan.Entity.TaiKhoan;
import org.example.duan.Entity.VaiTro;
import org.example.duan.Entity.DiaChiNhanVien;
import org.example.duan.DTO.NhanVienDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
public class NhanVienService {
    private static final Logger logger = LoggerFactory.getLogger(NhanVienService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{9}$");

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Autowired
    private DiaChiNhanVienRepository diaChiNhanVienRepository;

    @Autowired
    private EmailService emailService;

    // Lấy danh sách nhân viên
    public List<NhanVienDTO> getAllNhanVien() {
        return nhanVienRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết nhân viên theo ID
    public Optional<NhanVienDTO> getNhanVienById(Integer id) {
        return nhanVienRepository.findById(id)
                .map(this::convertToDTO);
    }

    // Validate thông tin nhân viên
    private void validateNhanVien(NhanVienDTO nhanVienDTO, boolean isUpdate) {
        if (nhanVienDTO.getTenNhanVien() == null || nhanVienDTO.getTenNhanVien().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên nhân viên không được để trống");
        }
        if (nhanVienDTO.getSoDienThoai() == null || nhanVienDTO.getSoDienThoai().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống");
        }
        if (!PHONE_PATTERN.matcher(nhanVienDTO.getSoDienThoai()).matches()) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)");
        }
        if (nhanVienDTO.getEmail() == null || nhanVienDTO.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        if (!EMAIL_PATTERN.matcher(nhanVienDTO.getEmail()).matches()) {
            throw new IllegalArgumentException("Email không hợp lệ");
        }

        // Validate ngày sinh và tuổi
        if (nhanVienDTO.getNgaySinh() != null) {
            try {
                LocalDate ngaySinh = nhanVienDTO.getNgaySinh();
                LocalDate today = LocalDate.now();

                Period age = Period.between(ngaySinh, today);
                if (age.getYears() < 15) {
                    throw new IllegalArgumentException("Nhân viên phải từ 15 tuổi trở lên");
                }
            } catch (Exception e) {
                throw new IllegalArgumentException("Ngày sinh không hợp lệ");
            }
        } else {
            throw new IllegalArgumentException("Ngày sinh không được để trống");
        }
    }

    // Thêm nhân viên mới
    @Transactional
    public NhanVienDTO createNhanVien(NhanVienDTO nhanVienDTO) {
        validateNhanVien(nhanVienDTO, false);

        // 1. Sinh tên đăng nhập từ email
        String email = nhanVienDTO.getEmail();
        String username = email.split("@")[0];
        String originalUsername = username;
        int suffix = 1;
        while (taiKhoanRepository.existsByTenTaiKhoan(username)) {
            username = originalUsername + suffix;
            suffix++;
        }

        // 2. Sinh mật khẩu random 8-12 ký tự
        String password = generateRandomPassword(8, 12);

        try {
            // 3. Tạo tài khoản
            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setTenTaiKhoan(username);
            taiKhoan.setMatKhau(password); // Nên mã hóa nếu có PasswordEncoder
            taiKhoan.setTrangThai("Hoạt động");
            // Gán vai trò mặc định là NHAN_VIEN
            VaiTro vaiTro = vaiTroRepository.findAll().stream()
                    .filter(v -> v.getTenVaiTro().equalsIgnoreCase("NHAN_VIEN"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò NHAN_VIEN"));
            taiKhoan.setVaiTro(vaiTro);
            taiKhoan = taiKhoanRepository.save(taiKhoan);

            // 4. Tạo nhân viên
            NhanVien nhanVien = new NhanVien();
            // Generate mã nhân viên tự động
            String maNhanVien = generateMaNhanVien();
            nhanVien.setMaNhanVien(maNhanVien);
            nhanVien.setTenNhanVien(nhanVienDTO.getTenNhanVien());
            nhanVien.setGioiTinh(nhanVienDTO.getGioiTinh());
            nhanVien.setNgaySinh(nhanVienDTO.getNgaySinh());
            nhanVien.setSoDienThoai(nhanVienDTO.getSoDienThoai());
            nhanVien.setEmail(nhanVienDTO.getEmail());
            nhanVien.setTaiKhoan(taiKhoan);

            nhanVien = nhanVienRepository.save(nhanVien);

            // 5. Tạo địa chỉ chi tiết nếu có thông tin địa chỉ
            if (nhanVienDTO.getThanhPho() != null && nhanVienDTO.getQuanHuyen() != null && nhanVienDTO.getXaPhuong() != null) {
                DiaChiNhanVien diaChiNhanVien = new DiaChiNhanVien();
                diaChiNhanVien.setNhanVien(nhanVien);
                diaChiNhanVien.setThanhPho(nhanVienDTO.getThanhPho());
                diaChiNhanVien.setQuanHuyen(nhanVienDTO.getQuanHuyen());
                diaChiNhanVien.setXaPhuong(nhanVienDTO.getXaPhuong());
                diaChiNhanVien.setDiaChiChiTiet(nhanVienDTO.getNgoNgach());
                diaChiNhanVienRepository.save(diaChiNhanVien);
            }
            logger.info("Created new employee with ID: {}", nhanVien.getIdNhanVien());

            // 5. Gửi mail tài khoản
            emailService.sendAccountInfo(
                    nhanVien.getEmail(),
                    username,
                    password,
                    nhanVien.getTenNhanVien()
            );

            // 6. Trả về DTO (có thể trả về username và password nếu muốn)
            NhanVienDTO result = convertToDTO(nhanVien);
            result.setTenTaiKhoan(username);
            result.setMatKhau(password); // Chỉ trả về nếu muốn hiển thị cho admin
            return result;
        } catch (Exception e) {
            logger.error("Error creating employee: {}", e.getMessage(), e);
            throw e;
        }
    }

    public String generateRandomPassword(int minLen, int maxLen) {
        int len = new java.util.Random().nextInt(maxLen - minLen + 1) + minLen;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // Generate mã nhân viên tự động
    private String generateMaNhanVien() {
        // Lấy số lượng nhân viên hiện tại để tạo mã mới
        long count = nhanVienRepository.count();
        String maNhanVien = "NV" + String.format("%03d", count + 1);

        // Kiểm tra nếu mã đã tồn tại thì tăng số
        while (nhanVienRepository.existsByMaNhanVienIgnoreCase(maNhanVien)) {
            count++;
            maNhanVien = "NV" + String.format("%03d", count + 1);
        }

        return maNhanVien;
    }

    // Cập nhật thông tin nhân viên
    @Transactional
    public NhanVienDTO updateNhanVien(Integer id, NhanVienDTO nhanVienDTO) {
        try {
            NhanVien nhanVien = nhanVienRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên với ID: " + id));

            // Validate thông tin
            validateNhanVien(nhanVienDTO, true);

            // Check if email is being changed and already exists
            if (!nhanVien.getEmail().equalsIgnoreCase(nhanVienDTO.getEmail()) &&
                    nhanVienRepository.existsByEmailIgnoreCase(nhanVienDTO.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }

            // Check if phone number is being changed and already exists
            if (!nhanVien.getSoDienThoai().equals(nhanVienDTO.getSoDienThoai()) &&
                    nhanVienRepository.existsBySoDienThoaiIgnoreCase(nhanVienDTO.getSoDienThoai())) {
                throw new IllegalArgumentException("Số điện thoại đã tồn tại");
            }

            // Cập nhật thông tin nhân viên
            nhanVien.setTenNhanVien(nhanVienDTO.getTenNhanVien());
            nhanVien.setGioiTinh(nhanVienDTO.getGioiTinh());
            nhanVien.setNgaySinh(nhanVienDTO.getNgaySinh());
            nhanVien.setSoDienThoai(nhanVienDTO.getSoDienThoai());
            nhanVien.setEmail(nhanVienDTO.getEmail());

            nhanVien = nhanVienRepository.save(nhanVien);

            // Cập nhật địa chỉ chi tiết nếu có thông tin địa chỉ
            if (nhanVienDTO.getThanhPho() != null && nhanVienDTO.getQuanHuyen() != null && nhanVienDTO.getXaPhuong() != null) {
                // Tìm địa chỉ hiện tại của nhân viên
                List<DiaChiNhanVien> existingAddresses = diaChiNhanVienRepository.findByNhanVienIdNhanVien(id);
                DiaChiNhanVien diaChiNhanVien;

                if (!existingAddresses.isEmpty()) {
                    // Cập nhật địa chỉ đầu tiên
                    diaChiNhanVien = existingAddresses.get(0);
                } else {
                    // Tạo địa chỉ mới
                    diaChiNhanVien = new DiaChiNhanVien();
                    diaChiNhanVien.setNhanVien(nhanVien);
                }

                diaChiNhanVien.setThanhPho(nhanVienDTO.getThanhPho());
                diaChiNhanVien.setQuanHuyen(nhanVienDTO.getQuanHuyen());
                diaChiNhanVien.setXaPhuong(nhanVienDTO.getXaPhuong());
                diaChiNhanVien.setDiaChiChiTiet(nhanVienDTO.getNgoNgach());
                diaChiNhanVienRepository.save(diaChiNhanVien);
            }

            return convertToDTO(nhanVien);
        } catch (Exception e) {
            logger.error("Error updating employee: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Chuyển đổi từ Entity sang DTO
    private NhanVienDTO convertToDTO(NhanVien nhanVien) {
        NhanVienDTO dto = new NhanVienDTO();
        dto.setIdNhanVien(nhanVien.getIdNhanVien());
        dto.setMaNhanVien(nhanVien.getMaNhanVien());
        dto.setTenNhanVien(nhanVien.getTenNhanVien());
        dto.setGioiTinh(nhanVien.getGioiTinh());
        dto.setNgaySinh(nhanVien.getNgaySinh());
        dto.setSoDienThoai(nhanVien.getSoDienThoai());
        dto.setEmail(nhanVien.getEmail());

        // Lấy thông tin địa chỉ chi tiết
        List<DiaChiNhanVien> diaChiList = diaChiNhanVienRepository.findByNhanVienIdNhanVien(nhanVien.getIdNhanVien());
        if (!diaChiList.isEmpty()) {
            DiaChiNhanVien diaChi = diaChiList.get(0);
            dto.setThanhPho(diaChi.getThanhPho());
            dto.setQuanHuyen(diaChi.getQuanHuyen());
            dto.setXaPhuong(diaChi.getXaPhuong());
            dto.setNgoNgach(diaChi.getDiaChiChiTiet());

            // Tạo chuỗi địa chỉ hoàn chỉnh
            String diaChiDayDu = "";
            if (diaChi.getDiaChiChiTiet() != null && !diaChi.getDiaChiChiTiet().trim().isEmpty()) {
                diaChiDayDu += diaChi.getDiaChiChiTiet() + ", ";
            }
            diaChiDayDu += diaChi.getXaPhuong() + ", " + diaChi.getQuanHuyen() + ", " + diaChi.getThanhPho();
            dto.setDiaChi(diaChiDayDu);
        }

        if (nhanVien.getTaiKhoan() != null) {
            dto.setTenTaiKhoan(nhanVien.getTaiKhoan().getTenTaiKhoan());
            dto.setMatKhau(nhanVien.getTaiKhoan().getMatKhau());
            dto.setTrangThai(nhanVien.getTaiKhoan().getTrangThai());
        }

        return dto;
    }

    @Transactional
    public NhanVienDTO toggleTrangThai(Integer id) {
        NhanVien nv = nhanVienRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên!"));
        TaiKhoan tk = nv.getTaiKhoan();
        if (tk == null) throw new IllegalArgumentException("Nhân viên chưa có tài khoản!");
        String newStatus = "Hoạt động".equalsIgnoreCase(tk.getTrangThai()) ? "Ngừng hoạt động" : "Hoạt động";
        tk.setTrangThai(newStatus);
        taiKhoanRepository.save(tk);
        return convertToDTO(nv);
    }

    // Tìm kiếm nhân viên
    public List<NhanVienDTO> searchNhanVien(String keyword) {
        return nhanVienRepository.searchByKeyword(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<NhanVienDTO> phanTrangDTO(Pageable pageable, String trangThai, Boolean gioiTinh) {
        Page<NhanVien> page = nhanVienRepository.findByTrangThaiAndGioiTinh(trangThai, gioiTinh, pageable);
        return page.map(nv -> {
            NhanVienDTO dto = new NhanVienDTO();
            dto.setIdNhanVien(nv.getIdNhanVien());
            dto.setMaNhanVien(nv.getMaNhanVien());
            dto.setTenNhanVien(nv.getTenNhanVien());
            dto.setGioiTinh(nv.getGioiTinh());
            dto.setNgaySinh(nv.getNgaySinh());
            dto.setSoDienThoai(nv.getSoDienThoai());
            dto.setEmail(nv.getEmail());

            // Lấy thông tin địa chỉ chi tiết
            List<DiaChiNhanVien> diaChiList = diaChiNhanVienRepository.findByNhanVienIdNhanVien(nv.getIdNhanVien());
            if (!diaChiList.isEmpty()) {
                DiaChiNhanVien diaChi = diaChiList.get(0);
                dto.setThanhPho(diaChi.getThanhPho());
                dto.setQuanHuyen(diaChi.getQuanHuyen());
                dto.setXaPhuong(diaChi.getXaPhuong());
                dto.setNgoNgach(diaChi.getDiaChiChiTiet());

                // Tạo chuỗi địa chỉ hoàn chỉnh
                String diaChiDayDu = "";
                if (diaChi.getDiaChiChiTiet() != null && !diaChi.getDiaChiChiTiet().trim().isEmpty()) {
                    diaChiDayDu += diaChi.getDiaChiChiTiet() + ", ";
                }
                diaChiDayDu += diaChi.getXaPhuong() + ", " + diaChi.getQuanHuyen() + ", " + diaChi.getThanhPho();
                dto.setDiaChi(diaChiDayDu);
            }

            // Lấy thông tin tài khoản
            if (nv.getTaiKhoan() != null) {
                dto.setTenTaiKhoan(nv.getTaiKhoan().getTenTaiKhoan());
                dto.setTrangThai(nv.getTaiKhoan().getTrangThai());
            }
            return dto;
        });
    }
} 