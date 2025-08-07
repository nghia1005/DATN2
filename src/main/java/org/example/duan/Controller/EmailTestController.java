package org.example.duan.Controller;

import org.example.duan.Service.EmailThanhToan;
import org.example.duan.Service.DirectEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email-test")
public class EmailTestController {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailTestController.class);
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Autowired
    private EmailThanhToan emailThanhToan;
    
    @Autowired
    private DirectEmailService directEmailService;
    
    @GetMapping("/config")
    public ResponseEntity<?> checkEmailConfig() {
        Map<String, Object> response = new HashMap<>();
        
        if (mailSender == null) {
            response.put("status", "ERROR");
            response.put("message", "JavaMailSender không được cấu hình hoặc không khả dụng");
            response.put("details", "Kiểm tra cấu hình SMTP trong application.properties");
            return ResponseEntity.ok(response);
        }
        
        try {
            // Test kết nối SMTP bằng cách tạo message đơn giản
            var message = mailSender.createMimeMessage();
            response.put("status", "SUCCESS");
            response.put("message", "JavaMailSender đã được cấu hình");
            response.put("details", "Có thể tạo MimeMessage thành công");
            logger.info("Email configuration test: SUCCESS");
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Không thể kết nối SMTP");
            response.put("details", e.getMessage());
            logger.error("Email configuration test failed: {}", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/send-test")
    public ResponseEntity<?> sendTestEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("to");
        String testType = request.get("type");
        
        if (toEmail == null || toEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "ERROR",
                "message", "Email đích không được cung cấp"
            ));
        }
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if ("invoice".equals(testType)) {
                // Test gửi email xác nhận đơn hàng
                emailThanhToan.sendInvoiceConfirmation(toEmail, "Test User", "HD" + System.currentTimeMillis());
                response.put("status", "SUCCESS");
                response.put("message", "Email xác nhận đơn hàng đã được gửi");
                response.put("email", toEmail);
                response.put("type", "Invoice Confirmation");
                logger.info("Test invoice email sent successfully to: {}", toEmail);
            } else {
                // Test gửi email đơn giản
                var message = mailSender.createMimeMessage();
                var helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(toEmail);
                helper.setSubject("Test Email từ SoleKing Store");
                helper.setText("Đây là email test để kiểm tra cấu hình SMTP. Thời gian: " + java.time.LocalDateTime.now());
                
                mailSender.send(message);
                response.put("status", "SUCCESS");
                response.put("message", "Email test đã được gửi");
                response.put("email", toEmail);
                response.put("type", "Simple Test");
                logger.info("Test simple email sent successfully to: {}", toEmail);
            }
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Lỗi gửi email");
            response.put("details", e.getMessage());
            response.put("email", toEmail);
            logger.error("Test email failed for {}: {}", toEmail, e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/diagnose")
    public ResponseEntity<?> diagnoseEmailIssues() {
        Map<String, Object> response = new HashMap<>();
        
        // Kiểm tra cấu hình
        if (mailSender == null) {
            response.put("configStatus", "MISSING");
            response.put("configMessage", "JavaMailSender không được cấu hình");
        } else {
            try {
                // Test kết nối SMTP bằng cách tạo message đơn giản
                var message = mailSender.createMimeMessage();
                response.put("configStatus", "OK");
                response.put("configMessage", "JavaMailSender đã được cấu hình");
            } catch (Exception e) {
                response.put("configStatus", "ERROR");
                response.put("configMessage", "Lỗi kết nối SMTP: " + e.getMessage());
            }
        }
        
        // Các gợi ý khắc phục
        response.put("suggestions", new String[]{
            "1. Kiểm tra thư mục Spam/Junk trong email nhận",
            "2. Đảm bảo tài khoản Gmail gửi đã bật xác thực 2 bước",
            "3. Kiểm tra App Password có đúng không",
            "4. Thử với email khác để xác định vấn đề",
            "5. Kiểm tra firewall/antivirus có chặn kết nối SMTP không"
        });
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/send-direct")
    public ResponseEntity<?> sendDirectEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("to");
        String testType = request.get("type");
        
        if (toEmail == null || toEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "ERROR",
                "message", "Email đích không được cung cấp"
            ));
        }
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if ("invoice".equals(testType)) {
                // Test gửi email xác nhận đơn hàng trực tiếp
                directEmailService.sendInvoiceConfirmationDirect(toEmail, "Test User", "HD" + System.currentTimeMillis());
                response.put("status", "SUCCESS");
                response.put("message", "Email xác nhận đơn hàng đã được gửi trực tiếp");
                response.put("email", toEmail);
                response.put("type", "Direct Invoice Confirmation");
                logger.info("Direct invoice email sent successfully to: {}", toEmail);
            } else {
                // Test gửi email đơn giản trực tiếp
                directEmailService.sendTestEmail(toEmail);
                response.put("status", "SUCCESS");
                response.put("message", "Email test đã được gửi trực tiếp");
                response.put("email", toEmail);
                response.put("type", "Direct Simple Test");
                logger.info("Direct test email sent successfully to: {}", toEmail);
            }
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Lỗi gửi email trực tiếp");
            response.put("details", e.getMessage());
            response.put("email", toEmail);
            logger.error("Direct test email failed for {}: {}", toEmail, e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
} 