package org.example.duan.config;

import org.example.duan.Entity.TaiKhoan;
import org.example.duan.Entity.VaiTro;
import org.example.duan.Entity.PhieuGiamGia;
import org.example.duan.Repository.TaiKhoanRepository;
import org.example.duan.Repository.VaiTroRepository;
import org.example.duan.Repository.PhieuGiamGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Component
@DependsOn("entityManagerFactory")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private PhieuGiamGiaRepository phieuGiamGiaRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Khởi tạo vai trò cơ bản nếu chưa có
            if (vaiTroRepository.count() == 0) {
                VaiTro admin = new VaiTro();
                admin.setTenVaiTro("Admin");
                vaiTroRepository.save(admin);

                VaiTro user = new VaiTro();
                user.setTenVaiTro("User");
                vaiTroRepository.save(user);

                System.out.println(" Đã khởi tạo vai trò thành công!");
            }

//            // Khởi tạo tài khoản admin mẫu nếu chưa có
//            if (taiKhoanRepository.count() == 0) {
//                VaiTro adminRole = vaiTroRepository.findById(1).orElse(null);
//                if (adminRole != null) {
//                    TaiKhoan adminAccount = new TaiKhoan();
//                    adminAccount.setTenTaiKhoan("admin");
//                    adminAccount.setMatKhau("admin123");
//                    adminAccount.setVaiTro(adminRole);
//                    adminAccount.setTrangThai("Hoạt động");
//                    taiKhoanRepository.save(adminAccount);
//
//                    System.out.println("✅ Đã khởi tạo tài khoản admin thành công!");
//                    System.out.println("📝 Thông tin đăng nhập:");
//                    System.out.println("   - Username: admin");
//                    System.out.println("   - Password: admin123");
//                }
//            }

            // Khởi tạo phiếu giảm giá mẫu nếu chưa có
            if (phieuGiamGiaRepository.count() == 0) {
                // Phiếu giảm giá 1
                PhieuGiamGia voucher1 = new PhieuGiamGia();
                voucher1.setMaPhieuGiamGia("VOUCHER001");
                voucher1.setTenPhieuGiamGia("Giảm giá 10% cho đơn hàng đầu tiên");
                voucher1.setKieuGiamGia("PHAN_TRAM");
                voucher1.setGiaTriToiThieu(new BigDecimal("100000"));
                voucher1.setGiaTriToiDa(new BigDecimal("50000"));
                voucher1.setSoLuong(100);
                voucher1.setNgayBatDau(LocalDateTime.now());
                voucher1.setNgayKetThuc(LocalDateTime.now().plusDays(30)); // 30 ngày
                voucher1.setMoTa("Giảm giá 10% cho đơn hàng đầu tiên của khách hàng mới");
                voucher1.setTrangThai("Hoạt động");
                voucher1.setPhanTramGiamGia(new BigDecimal("10"));
                phieuGiamGiaRepository.save(voucher1);

                // Phiếu giảm giá 2
                PhieuGiamGia voucher2 = new PhieuGiamGia();
                voucher2.setMaPhieuGiamGia("VOUCHER002");
                voucher2.setTenPhieuGiamGia("Giảm trực tiếp 50,000đ");
                voucher2.setKieuGiamGia("GIAM_TRUC_TIEP");
                voucher2.setGiaTriToiThieu(new BigDecimal("200000"));
                voucher2.setGiaTriToiDa(new BigDecimal("50000"));
                voucher2.setSoLuong(50);
                voucher2.setNgayBatDau(LocalDateTime.now());
                voucher2.setNgayKetThuc(LocalDateTime.now().plusDays(15)); // 15 ngày
                voucher2.setMoTa("Giảm trực tiếp 50,000đ cho đơn hàng từ 200,000đ");
                voucher2.setTrangThai("Hoạt động");
                voucher2.setPhanTramGiamGia(new BigDecimal("0"));
                phieuGiamGiaRepository.save(voucher2);

                // Phiếu giảm giá 3
                PhieuGiamGia voucher3 = new PhieuGiamGia();
                voucher3.setMaPhieuGiamGia("FREESHIP001");
                voucher3.setTenPhieuGiamGia("Miễn phí vận chuyển");
                voucher3.setKieuGiamGia("FREE_SHIP");
                voucher3.setGiaTriToiThieu(new BigDecimal("300000"));
                voucher3.setGiaTriToiDa(new BigDecimal("30000"));
                voucher3.setSoLuong(200);
                voucher3.setNgayBatDau(LocalDateTime.now());
                voucher3.setNgayKetThuc(LocalDateTime.now().plusDays(7)); // 7 ngày
                voucher3.setMoTa("Miễn phí vận chuyển cho đơn hàng từ 300,000đ");
                voucher3.setTrangThai("Hoạt động");
                voucher3.setPhanTramGiamGia(new BigDecimal("0"));
                phieuGiamGiaRepository.save(voucher3);

                System.out.println("✅ Đã khởi tạo phiếu giảm giá mẫu thành công!");
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khởi tạo dữ liệu: " + e.getMessage());
        }
    }
} 