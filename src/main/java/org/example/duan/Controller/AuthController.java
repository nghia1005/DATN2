package org.example.duan.Controller;

import org.example.duan.DTO.ApiResponse;
import org.example.duan.Entity.TaiKhoan;
import org.example.duan.Entity.NhanVien;
import org.example.duan.Entity.VaiTro;
import org.example.duan.Repository.TaiKhoanRepository;
import org.example.duan.Repository.NhanVienRepository;
import org.example.duan.Repository.VaiTroRepository;
import org.example.duan.Service.EmailService;
import org.example.duan.Service.EmailServiceOne;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.duan.Repository.KhachHangRepository;
import org.example.duan.Entity.KhachHang;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailServiceOne emailServiceOne;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody TaiKhoan loginRequest) {
        TaiKhoan tk = taiKhoanRepository.findByTenTaiKhoan(loginRequest.getTenTaiKhoan());
        if (tk == null) {
            return ResponseEntity.ok(ApiResponse.error("Tài khoản không tồn tại!"));
        }
        // So sánh mật khẩu - xử lý cả trường hợp đã mã hóa và chưa mã hóa
        boolean passwordMatch = false;

        // Thử so sánh với mật khẩu đã mã hóa trước
        if (passwordEncoder.matches(loginRequest.getMatKhau(), tk.getMatKhau())) {
            passwordMatch = true;
        } else {
            // Nếu không khớp, thử so sánh trực tiếp (cho tài khoản cũ chưa mã hóa)
            if (loginRequest.getMatKhau().equals(tk.getMatKhau())) {
                passwordMatch = true;
                // Tự động mã hóa mật khẩu cũ và cập nhật
                tk.setMatKhau(passwordEncoder.encode(loginRequest.getMatKhau()));
                taiKhoanRepository.save(tk);
            }
        }

        if (!passwordMatch) {
            return ResponseEntity.ok(ApiResponse.error("Mật khẩu không đúng!"));
        }
        if (!"Hoạt động".equalsIgnoreCase(tk.getTrangThai())) {
            return ResponseEntity.ok(ApiResponse.error("Tài khoản đã bị khóa hoặc chưa kích hoạt!"));
        }
        
        // Kiểm tra trạng thái của KhachHang nếu là khách hàng
        Optional<KhachHang> khOpt = khachHangRepository.findByTaiKhoan(tk);
        if (khOpt.isPresent()) {
            KhachHang kh = khOpt.get();
            if (!"Hoạt động".equalsIgnoreCase(kh.getTrangThai())) {
                return ResponseEntity.ok(ApiResponse.error("Tài khoản khách hàng đã bị khóa hoặc ngừng hoạt động!"));
            }
        }
        
        // Chuẩn bị thông tin trả về
        String vaiTro = tk.getVaiTro() != null ? tk.getVaiTro().getTenVaiTro() : "";
        String tenNhanVien = null;
        String tenKhachHang = null;
        NhanVien nv = nhanVienRepository.findByTaiKhoan(tk);
        Map<String, Object> userInfo = new java.util.HashMap<>();
        userInfo.put("tenTaiKhoan", tk.getTenTaiKhoan());
        userInfo.put("vaiTro", vaiTro);
        if (nv != null) {
            tenNhanVien = nv.getTenNhanVien();
            userInfo.put("tenNhanVien", tenNhanVien);
            userInfo.put("idNhanVien", nv.getIdNhanVien());
        } else {
            // Sử dụng khOpt đã tìm ở trên
            if (khOpt.isPresent()) {
                KhachHang kh = khOpt.get();
                tenKhachHang = kh.getTenKhachHang();
                userInfo.put("tenKhachHang", tenKhachHang);
                userInfo.put("idKhachHang", kh.getIdKhachHang());
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", userInfo));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(@RequestBody Map<String, String> req) {
        String tenTaiKhoan = req.get("tenTaiKhoan");
        String matKhauCu = req.get("matKhauCu");
        String matKhauMoi = req.get("matKhauMoi");
        TaiKhoan tk = taiKhoanRepository.findByTenTaiKhoan(tenTaiKhoan);
        if (tk == null) {
            return ResponseEntity.ok(ApiResponse.error("Tài khoản không tồn tại!"));
        }
        // So sánh mật khẩu cũ - xử lý cả trường hợp đã mã hóa và chưa mã hóa
        boolean oldPasswordMatch = false;

        // Thử so sánh với mật khẩu đã mã hóa trước
        if (passwordEncoder.matches(matKhauCu, tk.getMatKhau())) {
            oldPasswordMatch = true;
        } else {
            // Nếu không khớp, thử so sánh trực tiếp (cho tài khoản cũ chưa mã hóa)
            if (matKhauCu.equals(tk.getMatKhau())) {
                oldPasswordMatch = true;
            }
        }

        if (!oldPasswordMatch) {
            return ResponseEntity.ok(ApiResponse.error("Mật khẩu cũ không đúng!"));
        }
        if (!"Hoạt động".equalsIgnoreCase(tk.getTrangThai())) {
            return ResponseEntity.ok(ApiResponse.error("Tài khoản đã bị khóa hoặc chưa kích hoạt!"));
        }
        // Mã hóa mật khẩu mới trước khi lưu
        tk.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoanRepository.save(tk);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody Map<String, String> req) {
        String tenTaiKhoan = req.get("tenTaiKhoan");
        String email = req.get("email");
        String matKhauMoi = req.get("matKhauMoi");
        TaiKhoan tk = taiKhoanRepository.findByTenTaiKhoan(tenTaiKhoan);
        if (tk == null) {
            return ResponseEntity.ok(ApiResponse.error("Tài khoản không tồn tại!"));
        }
        NhanVien nv = nhanVienRepository.findByTaiKhoan(tk);
        if (nv == null || nv.getEmail() == null || !nv.getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.ok(ApiResponse.error("Email không đúng!"));
        }
        // Mã hóa mật khẩu mới trước khi lưu
        tk.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoanRepository.save(tk);
        return ResponseEntity.ok(ApiResponse.success(null, "Đặt lại mật khẩu thành công!"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<?>> refreshToken(@RequestBody Map<String, String> req) {
        String refreshToken = req.get("refreshToken");
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Refresh token không hợp lệ!"));
        }

        // Sinh accessToken mới (giả lập)
        String newAccessToken = "access-token-mock-" + System.currentTimeMillis();
        return ResponseEntity.ok(ApiResponse.success(newAccessToken, "Làm mới token thành công!"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody Map<String, String> req) {
        String tenTaiKhoan = req.get("tenTaiKhoan");
        String matKhau = req.get("matKhau");
        String email = req.get("email");
        String soDienThoai = req.get("soDienThoai");
        String tenNhanVien = req.get("tenNhanVien");
        if (taiKhoanRepository.existsByTenTaiKhoan(tenTaiKhoan)) {
            return ResponseEntity.ok(ApiResponse.error("Tên tài khoản đã tồn tại!"));
        }
        if (nhanVienRepository.existsByEmail(email)) {
            return ResponseEntity.ok(ApiResponse.error("Email đã được sử dụng!"));
        }
        if (nhanVienRepository.existsBySoDienThoai(soDienThoai)) {
            return ResponseEntity.ok(ApiResponse.error("Số điện thoại đã được sử dụng!"));
        }
        VaiTro vaiTro = vaiTroRepository.findById(2).orElse(null);
        if (vaiTro == null) {
            return ResponseEntity.ok(ApiResponse.error("Không tìm thấy vai trò mặc định!"));
        }

        TaiKhoan tk = new TaiKhoan();
        tk.setTenTaiKhoan(tenTaiKhoan);
        tk.setMatKhau(matKhau);
        tk.setTrangThai("Hoạt động");
        tk.setVaiTro(vaiTro);
        taiKhoanRepository.save(tk);
        // Tạo nhân viên mới

        NhanVien nv = new NhanVien();
        nv.setTaiKhoan(tk);
        nv.setTenNhanVien(tenNhanVien);
        nv.setEmail(email);
        nv.setSoDienThoai(soDienThoai);
        nv.setMaNhanVien("NV" + System.currentTimeMillis());
        nv.setGioiTinh(true);
        nhanVienRepository.save(nv);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản thành công!", null));
    }

    @PostMapping("/register-with-email")
    public ResponseEntity<ApiResponse<?>> registerWithEmail(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String soDienThoai = req.get("soDienThoai");
        String tenNhanVien = req.get("tenNhanVien");
        String gioiTinh = req.get("gioiTinh");
        String ngaySinh = req.get("ngaySinh");

        if (nhanVienRepository.existsByEmail(email)) {
            return ResponseEntity.ok(ApiResponse.error("Email đã được sử dụng!"));
        }
        if (nhanVienRepository.existsBySoDienThoai(soDienThoai)) {
            return ResponseEntity.ok(ApiResponse.error("Số điện thoại đã được sử dụng!"));
        }

        VaiTro vaiTro = vaiTroRepository.findById(2).orElse(null);
        if (vaiTro == null) {
            return ResponseEntity.ok(ApiResponse.error("Không tìm thấy vai trò mặc định!"));
        }

        // Tạo tên đăng nhập và mật khẩu tự động
        String tenTaiKhoan = "user" + System.currentTimeMillis();
        String matKhau = generateRandomPassword();

        TaiKhoan tk = new TaiKhoan();
        tk.setTenTaiKhoan(tenTaiKhoan);
        tk.setMatKhau(matKhau);
        tk.setTrangThai("Hoạt động");
        tk.setVaiTro(vaiTro);
        taiKhoanRepository.save(tk);

        NhanVien nv = new NhanVien();
        nv.setTaiKhoan(tk);
        nv.setTenNhanVien(tenNhanVien);
        nv.setEmail(email);
        nv.setSoDienThoai(soDienThoai);
        nv.setMaNhanVien("NV" + System.currentTimeMillis());
        nv.setGioiTinh("true".equals(gioiTinh));
        if (ngaySinh != null && !ngaySinh.isEmpty()) {
            nv.setNgaySinh(LocalDate.parse(ngaySinh));
        }
        nhanVienRepository.save(nv);

        // Gửi email thông tin tài khoản
        try {
            emailService.sendAccountInfo(email, tenTaiKhoan, matKhau, tenNhanVien);

            // Tạo response data với thông tin tài khoản
            Map<String, String> accountInfo = new HashMap<>();
            accountInfo.put("tenTaiKhoan", tenTaiKhoan);
            accountInfo.put("matKhau", matKhau);
            accountInfo.put("email", email);

            return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản thành công! Thông tin đăng nhập đã được gửi qua email.", accountInfo));
        } catch (Exception e) {
            // Log lỗi nhưng không fail request
            System.err.println("Lỗi gửi email: " + e.getMessage());

            // Trả về thông tin tài khoản trong response khi gửi email thất bại
            Map<String, String> accountInfo = new HashMap<>();
            accountInfo.put("tenTaiKhoan", tenTaiKhoan);
            accountInfo.put("matKhau", matKhau);
            accountInfo.put("email", email);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản thành công! Thông tin đăng nhập: " + tenTaiKhoan + " / " + matKhau, accountInfo));
        }
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return sb.toString();
    }

    private String generateCustomerCode() {
        // Lấy số lượng khách hàng hiện tại để tạo mã tiếp theo
        long customerCount = khachHangRepository.count();
        // Tạo mã dạng KH001, KH002, KH003...
        return String.format("KH%03d", customerCount + 1);
    }

    @PostMapping("/register-customer")
    public ResponseEntity<ApiResponse<?>> registerCustomer(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String soDienThoai = req.get("soDienThoai");
        String tenKhachHang = req.get("tenKhachHang");
        String gioiTinh = req.get("gioiTinh");
        String ngaySinh = req.get("ngaySinh");

        // Validation: Kiểm tra trống
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Email không được để trống!"));
        }
        if (soDienThoai == null || soDienThoai.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Số điện thoại không được để trống!"));
        }
        if (tenKhachHang == null || tenKhachHang.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Tên khách hàng không được để trống!"));
        }
        if (gioiTinh == null || gioiTinh.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Vui lòng chọn giới tính!"));
        }
        if (ngaySinh == null || ngaySinh.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Vui lòng chọn ngày sinh!"));
        }

        // Validation: Format email
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (!email.matches(emailRegex)) {
            return ResponseEntity.ok(ApiResponse.error("Email không đúng định dạng!"));
        }

        // Validation: Format số điện thoại (bắt đầu bằng 0 và có 10 số)
        String phoneRegex = "^0[0-9]{9}$";
        if (!soDienThoai.matches(phoneRegex)) {
            return ResponseEntity.ok(ApiResponse.error("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số!"));
        }

        // Validation: Kiểm tra tuổi (phải đủ 16 tuổi)
        try {
            LocalDate birthDate = LocalDate.parse(ngaySinh);
            LocalDate today = LocalDate.now();
            int age = today.getYear() - birthDate.getYear();
            if (birthDate.plusYears(age).isAfter(today)) {
                age--;
            }
            if (age < 16) {
                return ResponseEntity.ok(ApiResponse.error("Bạn phải đủ 16 tuổi để đăng ký tài khoản!"));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Ngày sinh không hợp lệ!"));
        }

        // Validation: Kiểm tra email đã tồn tại trong tài khoản chưa
        if (taiKhoanRepository.existsByTenTaiKhoan(email)) {
            return ResponseEntity.ok(ApiResponse.error("Email đã được sử dụng để đăng ký tài khoản!"));
        }

        // Validation: Kiểm tra email đã tồn tại trong khách hàng chưa
        if (khachHangRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.ok(ApiResponse.error("Email đã được sử dụng!"));
        }

        // Validation: Kiểm tra số điện thoại đã tồn tại chưa
        List<KhachHang> khachHangList = khachHangRepository.findBySoDienThoaiContaining(soDienThoai);
        if (!khachHangList.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Số điện thoại đã được sử dụng!"));
        }

        // Tìm vai trò KHACH_HANG (ID = 3 thường là khách hàng)
        VaiTro vaiTro = vaiTroRepository.findById(3).orElse(null);
        if (vaiTro == null) {
            return ResponseEntity.ok(ApiResponse.error("Không tìm thấy vai trò khách hàng!"));
        }

        // Sử dụng email làm username và tạo mật khẩu tự động
        String tenTaiKhoan = email;
        String matKhau = generateRandomPassword();

        // Tạo tài khoản với mật khẩu được mã hóa
        TaiKhoan tk = new TaiKhoan();
        tk.setTenTaiKhoan(tenTaiKhoan);
        tk.setMatKhau(passwordEncoder.encode(matKhau)); // Mã hóa mật khẩu
        tk.setTrangThai("Hoạt động");
        tk.setVaiTro(vaiTro);
        
        // Lưu tài khoản và lấy ID đã được generate
        tk = taiKhoanRepository.save(tk);
        
        // Debug: In ra ID tài khoản để kiểm tra
        System.out.println("=== DEBUG TÀI KHOẢN ===");
        System.out.println("ID Tài khoản: " + tk.getIdTaiKhoan());
        System.out.println("Tên tài khoản: " + tk.getTenTaiKhoan());
        System.out.println("=========================");

        // Tạo khách hàng
        KhachHang kh = new KhachHang();
        kh.setTaiKhoan(tk); // Gán tài khoản đã có ID
        kh.setTenKhachHang(tenKhachHang);
        kh.setEmail(email);
        kh.setSoDienThoai(soDienThoai);
        kh.setGioiTinh("NAM".equals(gioiTinh));
        kh.setNgaySinh(java.sql.Date.valueOf(LocalDate.parse(ngaySinh)));
        kh.setMaKhachHang(generateCustomerCode());
        kh.setTrangThai("Hoạt động"); // Set trạng thái mặc định
        
        // Lưu khách hàng
        kh = khachHangRepository.save(kh);
        
        // Debug: In ra thông tin khách hàng để kiểm tra
        System.out.println("=== DEBUG KHÁCH HÀNG ===");
        System.out.println("ID Khách hàng: " + kh.getIdKhachHang());
        System.out.println("ID Tài khoản trong KH: " + (kh.getTaiKhoan() != null ? kh.getTaiKhoan().getIdTaiKhoan() : "NULL"));
        System.out.println("==========================");

        // Gửi email thông tin tài khoản bằng EmailServiceOne (dành cho khách hàng)
        try {
            emailServiceOne.sendAccountInfo(email, tenTaiKhoan, matKhau, tenKhachHang);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản thành công! Vui lòng kiểm tra email để lấy thông tin đăng nhập.", null));
        } catch (Exception e) {
            // Log lỗi chi tiết hơn
            System.err.println("=== LỖI GỬI EMAIL ===");
            System.err.println("Email: " + email);
            System.err.println("Tên đăng nhập: " + tenTaiKhoan);
            System.err.println("Mật khẩu: " + matKhau);
            System.err.println("Lỗi: " + e.getMessage());
            System.err.println("Stack trace: ");
            e.printStackTrace();
            System.err.println("=====================");

            // Trả về thông tin tài khoản trong response khi gửi email thất bại
            Map<String, String> accountInfo = new HashMap<>();
            accountInfo.put("tenTaiKhoan", tenTaiKhoan);
            accountInfo.put("matKhau", matKhau);
            accountInfo.put("email", email);

            return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản thành công! Thông tin đăng nhập: " + tenTaiKhoan + " / " + matKhau, accountInfo));
        }
    }
}
