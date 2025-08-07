package org.example.duan.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailServiceOne {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceOne.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendAccountInfo(String to, String username, String password, String fullName) {
        try {
            if (mailSender != null) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(to);
                helper.setSubject("Thông tin tài khoản SoleKing Store");

                String htmlContent =
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);'>" +
                    
                    // Header với logo và tên thương hiệu
                    "<div style='text-align: center; margin-bottom: 30px;'>" +
                    "  <img src='https://res.cloudinary.com/dqlemoknn/image/upload/v1751608918/logo-removebg-preview_ujpag6.png' alt='SoleKing Logo' style='width: 120px; height: auto; margin-bottom: 15px;'/>" +
                    "  <h1 style='color: #cbb86c; font-size: 2.5rem; font-weight: 700; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);'>SoleKing Store</h1>" +
                    "  <p style='color: #666; font-size: 1.1rem; margin: 5px 0 0 0; font-style: italic;'>Nơi phong cách gặp gỡ chất lượng</p>" +
                    "</div>" +
                    
                    // Banner chào mừng
                    "<div style='background: linear-gradient(135deg, #cbb86c 0%, #a08a2a 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;'>" +
                    "  <h2 style='margin: 0 0 10px 0; font-size: 1.8rem;'>🎉 Chào mừng " + fullName + "! 🎉</h2>" +
                    "  <p style='margin: 0; font-size: 1.2rem; font-weight: 600;'>Bạn đã chính thức trở thành thành viên của SoleKing Store!</p>" +
                    "</div>" +
                    
                    // Nội dung chính
                    "<div style='background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #cbb86c;'>" +
                    "  <h3 style='color: #333; margin-top: 0; font-size: 1.4rem;'>🌟 Cảm ơn bạn đã tin tưởng chúng tôi!</h3>" +
                    "  <p style='color: #555; line-height: 1.6; font-size: 1.1rem;'>Chúng tôi rất vinh dự được đồng hành cùng bạn trên hành trình khám phá những sản phẩm thời trang đẳng cấp và dịch vụ tận tâm nhất. Tại SoleKing Store, mỗi sản phẩm đều được chọn lọc kỹ lưỡng để mang đến cho bạn trải nghiệm mua sắm tuyệt vời.</p>" +
                    "  <p style='color: #555; line-height: 1.6; font-size: 1.1rem;'>Với tư cách là khách hàng thân thiết, bạn sẽ được hưởng nhiều ưu đãi đặc biệt, chương trình khuyến mãi hấp dẫn và dịch vụ chăm sóc khách hàng tận tâm.</p>" +
                    "</div>" +
                    
                    // Thông tin tài khoản
                    "<div style='background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #cbb86c;'>" +
                    "  <h3 style='color: #333; margin-top: 0; font-size: 1.4rem; text-align: center;'>🔐 Thông tin đăng nhập của bạn</h3>" +
                    "  <div style='background: white; padding: 20px; border-radius: 8px; margin: 15px 0;'>" +
                    "    <div style='margin-bottom: 15px;'>" +
                    "      <span style='font-weight: bold; color: #333; font-size: 1.1rem;'>📧 Tên đăng nhập:</span>" +
                    "      <div style='background: #e3f2fd; padding: 10px; border-radius: 6px; margin-top: 5px; font-family: monospace; font-size: 1.1rem; color: #1976d2;'>" + username + "</div>" +
                    "    </div>" +
                    "    <div style='margin-bottom: 15px;'>" +
                    "      <span style='font-weight: bold; color: #333; font-size: 1.1rem;'>🔑 Mật khẩu:</span>" +
                    "      <div style='background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 5px; font-family: monospace; font-size: 1.1rem; color: #f57c00;'>" + password + "</div>" +
                    "    </div>" +
                    "  </div>" +
                    "</div>" +
                    
                    // Call to action
                    "<div style='text-align: center; margin-bottom: 25px;'>" +
                    "  <a href='http://localhost:3000/login' style='background: linear-gradient(135deg, #cbb86c 0%, #a08a2a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 1.2rem; display: inline-block; box-shadow: 0 4px 15px rgba(203, 184, 108, 0.3); transition: all 0.3s ease;'>🚀 Đăng nhập ngay</a>" +
                    "</div>" 
                    +
                    // Footer
                    "<div style='text-align: center; color: #666; font-size: 1rem;'>" +
                    "  <p style='margin-bottom: 10px;'>📞 Hotline: 0365175821 | 📧 Email: shopsolekingstore@gmail.com</p>" +
                    "  <p style='margin-bottom: 15px;'>🌐 Website: <a href='http://localhost:3000/shop' style='color: #cbb86c; text-decoration: none;'>www.solekingstore.com</a></p>" +
                    "  <div style='border-top: 1px solid #ddd; padding-top: 15px;'>" +
                    "    <p style='margin: 0; font-weight: bold; color: #333;'>Trân trọng!</p>" +
                    "    <p style='margin: 5px 0 0 0; color: #cbb86c; font-weight: bold; font-size: 1.1rem;'>Đội ngũ SoleKing Store</p>" +
                    "  </div>" +
                    "</div>" +
                    "</div>";

                helper.setText(htmlContent, true); // true = isHtml

                mailSender.send(mimeMessage);
                logger.info("Email sent successfully to: {}", to);
            } else {
                // Log thông tin tài khoản khi chưa cấu hình email
                logger.info("=== THÔNG TIN TÀI KHOẢN MỚI ===");
                logger.info("Email: {}", to);
                logger.info("Tên nhân viên: {}", fullName);
                logger.info("Tên đăng nhập: {}", username);
                logger.info("Mật khẩu: {}", password);
                logger.info("================================");
            }
        } catch (Exception e) {
            logger.error("Error sending email: {}", e.getMessage());
            // Log thông tin tài khoản khi có lỗi gửi email
            logger.info("=== THÔNG TIN TÀI KHOẢN MỚI (Gửi email thất bại) ===");
            logger.info("Email: {}", to);
            logger.info("Tên nhân viên: {}", fullName);
            logger.info("Tên đăng nhập: {}", username);
            logger.info("Mật khẩu: {}", password);
            logger.info("================================");
        }
    }
}

