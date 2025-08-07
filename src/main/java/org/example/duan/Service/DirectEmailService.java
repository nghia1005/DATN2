package org.example.duan.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

@Service
public class DirectEmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(DirectEmailService.class);
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${spring.mail.host:}")
    private String smtpHost;
    
    public void sendDirectEmail(String to, String subject, String content) {
        try {
            if (mailSender != null) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(content, true); // true = HTML
                
                mailSender.send(mimeMessage);
                logger.info("Direct email sent successfully to: {}", to);
            } else {
                logger.warn("JavaMailSender not configured. Email not sent to: {}", to);
                // Fallback: log thông tin email
                logger.info("=== EMAIL CONTENT (NOT SENT) ===");
                logger.info("To: {}", to);
                logger.info("Subject: {}", subject);
                logger.info("Content: {}", content);
                logger.info("================================");
            }
        } catch (Exception e) {
            logger.error("Error sending direct email to {}: {}", to, e.getMessage());
            // Fallback: log thông tin email khi có lỗi
            logger.info("=== EMAIL CONTENT (SEND FAILED) ===");
            logger.info("To: {}", to);
            logger.info("Subject: {}", subject);
            logger.info("Content: {}", content);
            logger.info("Error: {}", e.getMessage());
            logger.info("===================================");
        }
    }
    
    public void sendInvoiceConfirmationDirect(String to, String fullName, String maHoaDon) {
        String subject = "Xác nhận thanh toán đơn hàng tại SoleKing Store";
        
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
        
        sendDirectEmail(to, subject, htmlContent);
    }
    
    public void sendTestEmail(String to) {
        String subject = "Test Email từ SoleKing Store";
        String content = 
            "<div style='font-family:sans-serif;'>" +
            "<h2 style='color:#222;'>Test Email</h2>" +
            "<p style='color:#222;'>Đây là email test để kiểm tra cấu hình email.</p>" +
            "<p style='color:#222;'>Thời gian gửi: " + java.time.LocalDateTime.now().toString() + "</p>" +
            "<p style='color:#222;'>Nếu bạn nhận được email này, có nghĩa là cấu hình email đã hoạt động!</p>" +
            "</div>";
        
        sendDirectEmail(to, subject, content);
    }
} 