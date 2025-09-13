# Sửa lỗi DatePicker không hiển thị

## Vấn đề
DatePicker trong form đăng ký không hiển thị form chọn ngày tháng năm khi click vào input field.

## Nguyên nhân có thể
1. Lỗi import CSS của react-datepicker
2. Xung đột HMR (Hot Module Replacement)
3. Thiếu CSS cơ bản cho DatePicker
4. Cấu hình DatePicker không đúng

## Các thay đổi đã thực hiện

### 1. **Sửa cách import DatePicker**
- Loại bỏ import CSS trực tiếp: `import "react-datepicker/dist/react-datepicker.css"`
- Loại bỏ dynamic import gây lỗi TypeScript
- Giữ lại import thông thường: `import DatePicker from "react-datepicker"`

### 2. **Thêm CSS cơ bản vào globals.css**
- Thêm toàn bộ CSS cần thiết cho react-datepicker vào `frontend/src/app/globals.css`
- Bao gồm:
  - `.react-datepicker` - Container chính
  - `.react-datepicker-popper` - Popper positioning
  - `.react-datepicker__header` - Header với gradient
  - `.react-datepicker__day` - Các ngày trong tháng
  - `.react-datepicker__navigation` - Nút điều hướng
  - `.react-datepicker__input-container` - Input container

### 3. **Đơn giản hóa cấu hình DatePicker**
- Loại bỏ `customInput` phức tạp
- Sử dụng cấu hình cơ bản:
  ```jsx
  <DatePicker
      selected={dateOfBirth}
      onChange={date => setDateOfBirth(date)}
      dateFormat="dd/MM/yyyy"
      placeholderText="Chọn ngày sinh"
      showMonthDropdown
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      minDate={new Date(1900, 0, 1)}
      maxDate={new Date()}
      locale="vi"
      openToDate={new Date(1990, 0, 1)}
      isClearable={false}
  />
  ```

### 4. **Loại bỏ CSS inline**
- Xóa toàn bộ CSS inline từ component
- Sử dụng CSS từ globals.css để tránh xung đột

## CSS đã thêm vào globals.css

```css
/* React DatePicker Base Styles */
.react-datepicker {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  display: inline-block;
  color: #000;
  border: 2px solid #b59d3a;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(181, 157, 58, 0.2);
  background: white;
  z-index: 9999 !important;
  font-size: 0.8rem;
}

.react-datepicker-popper {
  z-index: 9999 !important;
  position: absolute;
}

.react-datepicker__header {
  background: linear-gradient(135deg, #b59d3a 0%, #8b7355 100%);
  border-bottom: 2px solid #b59d3a;
  border-radius: 10px 10px 0 0;
  color: white;
  text-align: center;
  padding: 8px 0;
}

/* ... và nhiều CSS khác */
```

## Kết quả mong đợi
- DatePicker sẽ hiển thị đúng khi click vào input field
- Calendar có theme màu vàng nâu phù hợp với design system
- Không còn lỗi HMR hoặc import CSS
- DatePicker hoạt động ổn định trên tất cả các trình duyệt

## Cách test
1. Truy cập trang đăng ký: `/register`
2. Click vào field "Ngày sinh *"
3. Calendar sẽ hiển thị với theme màu vàng nâu
4. Có thể chọn tháng/năm từ dropdown
5. Có thể chọn ngày từ calendar grid 