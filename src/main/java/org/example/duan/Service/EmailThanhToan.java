package org.example.duan.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailThanhToan {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceOne.class);
    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendInvoiceConfirmation(String to, String fullName, String maHoaDon) {
        try {
            if (mailSender != null) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(to);
                helper.setSubject("Xác nhận thanh toán đơn hàng tại SoleKing Store");

                String htmlContent =
                        "<div style='font-family:sans-serif;'>" +
                                "<div style='display:flex;align-items:center;gap:18px;margin-bottom:16px;'>" +
                                "  <img src='https://res.cloudinary.com/dqlemoknn/image/upload/v1751608918/logo-removebg-preview_ujpag6.png' alt='SoleKing Logo' style='width:100px;'/>" +
                                "  <span style='font-size:2rem;font-weight:700;color:#222;'>SoleKing Store</span>" +
                                "</div>" +
                                "<h2 style='color:#222;'>Xin chào " + fullName + ",</h2>" +
                                "<p style='color:#222;font-size:1.1rem;'>Cảm ơn bạn đã mua sắm tại <strong>SoleKing Store</strong>!</p>" +
                                "<p style='color:#222;'>Chúng tôi xác nhận rằng đơn hàng của bạn đã được thanh toán thành công.</p>" +
                                "<div style='margin-top:16px;margin-bottom:16px;padding:12px;background-color:#f5f5f5;border-radius:8px;color:#222;'>" +
                                "  <div style='font-weight:bold;font-size:1.1rem;'>Mã hóa đơn: " + maHoaDon + "</div>" +
                                "  <div>Thời gian thanh toán: " + java.time.LocalDateTime.now().toString() + "</div>" +
                                "</div>" +
                                "<p style='color:#222;'>Bạn có thể kiểm tra lại đơn hàng trong tài khoản của mình hoặc liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.</p>" +
                                "<p style='color:#222;'>Một lần nữa, cảm ơn bạn đã tin tưởng SoleKing Store!</p>" +
                                "<p style='color:#222;'>Trân trọng,<br/>Đội ngũ SoleKing Store</p>" +
                                "</div>";

                helper.setText(htmlContent, true); // HTML enabled
                mailSender.send(mimeMessage);

                logger.info("Invoice confirmation email sent successfully to: {}", to);
            } else {
                logger.info("=== XÁC NHẬN THANH TOÁN ===");
                logger.info("Email khách hàng: {}", to);
                logger.info("Tên khách hàng: {}", fullName);
                logger.info("Mã hóa đơn: {}", maHoaDon);
                logger.info("======================================");
            }
        } catch (Exception e) {
            logger.error("Error sending invoice confirmation email: {}", e.getMessage());
            logger.info("=== XÁC NHẬN THANH TOÁN (Gửi thất bại) ===");
            logger.info("Email khách hàng: {}", to);
            logger.info("Tên khách hàng: {}", fullName);
            logger.info("Mã hóa đơn: {}", maHoaDon);
            logger.info("=========================================");
        }
    }
}