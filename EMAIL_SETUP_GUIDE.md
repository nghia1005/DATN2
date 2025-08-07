# Hướng dẫn khắc phục lỗi Email Service

## Vấn đề thường gặp

### 1. Lỗi xác thực Gmail
Gmail không cho phép sử dụng mật khẩu thường để gửi email từ ứng dụng. Bạn cần sử dụng **App Password**.

### 2. Cách tạo App Password cho Gmail

1. **Bật 2-Step Verification**:
   - Đăng nhập vào Google Account
   - Vào Security → 2-Step Verification
   - Bật 2-Step Verification nếu chưa bật

2. **Tạo App Password**:
   - Vào Security → App passwords
   - Chọn "Mail" và "Other (Custom name)"
   - Đặt tên: "SoleKing Store"
   - Copy mật khẩu 16 ký tự được tạo

3. **Cập nhật application.properties**:
   ```properties
   spring.mail.password=YOUR_APP_PASSWORD_HERE
   ```

### 3. Test Email Configuration

Sau khi cập nhật, restart server và test:

**Test cấu hình:**
```bash
GET http://localhost:8080/email/test
```

**Gửi email test:**
```bash
POST http://localhost:8080/email/send-test
Content-Type: application/json

{
  "to": "test@example.com",
  "username": "testuser",
  "password": "testpass",
  "fullName": "Test User"
}
```

### 4. Các lỗi khác có thể gặp

#### Lỗi SSL/TLS
- Đảm bảo đã thêm cấu hình SSL trong application.properties
- Kiểm tra firewall không chặn port 587

#### Lỗi timeout
- Tăng timeout trong application.properties
- Kiểm tra kết nối internet

#### Lỗi authentication
- Kiểm tra username email chính xác
- Đảm bảo sử dụng App Password, không phải mật khẩu thường

### 5. Debug

Kiểm tra log để debug:
```bash
# Tìm log email trong console
grep -i "email\|mail" logs/application.log
```

### 6. Fallback

Nếu email không hoạt động, thông tin tài khoản sẽ được log ra console thay vì gửi email.

## Cấu hình hiện tại

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=chinhtran.hh.bg@gmail.com
spring.mail.password=kygrzxkzitwirsoj
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
spring.mail.properties.mail.smtp.ssl.protocols=TLSv1.2
``` 