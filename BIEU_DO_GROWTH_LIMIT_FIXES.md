# Sửa lỗi giới hạn tối đa tăng và giảm chỉ 100% ở biểu đồ

## Tổng quan
Đã sửa logic tính toán phần trăm tăng trưởng trong các biểu đồ thống kê để giới hạn tối đa tăng và giảm chỉ 100%.

## Các file đã sửa

### 1. frontend/src/component/BieuDo.tsx
- Thêm hàm `limitGrowthPercentage()` để giới hạn phần trăm tăng trưởng tối đa 100%

### 2. frontend/src/app/ThongKe/DoanhThu/page.tsx
- Sửa logic tính toán `growthPercentage` trong hàm `calculateGrowth()`:
  - Thêm `Math.min(Math.abs(growthPercentage), 100)` để giới hạn tối đa 100%
  - Sửa logic hiển thị phần trăm âm cho trường hợp giảm
  - Sửa logic hiển thị từ "Tăng mới" thành "100.0%" cho trường hợp tăng từ 0
  - Chuẩn hóa hiển thị "-100.0%" cho trường hợp giảm xuống 0

### 3. frontend/src/app/ThongKe/SanPham/page.tsx
- Sửa logic tính toán `growthPercentage` trong hàm `calculateGrowth()`:
  - Thêm `Math.min(Math.abs(growthPercentage), 100)` để giới hạn tối đa 100%
- Sửa logic tính toán `growth` trong badge tăng trưởng:
  - Thêm `Math.min(Math.abs(growth), 100)` để giới hạn tối đa 100%
  - Sửa logic hiển thị phần trăm âm cho trường hợp giảm

## Các thay đổi chính

### Logic tính toán phần trăm tăng trưởng
```javascript
// Trước
growthPercentage = ((currentValue - previousValue) / previousValue) * 100;

// Sau
growthPercentage = ((currentValue - previousValue) / previousValue) * 100;
growthPercentage = Math.min(Math.abs(growthPercentage), 100);
```

### Logic hiển thị phần trăm
```javascript
// Trước
{`${growthPercentage.toFixed(1)}%`}

// Sau
{`${isGrowth ? growthPercentage.toFixed(1) : '-' + growthPercentage.toFixed(1)}%`}
```

## Kết quả
- Phần trăm tăng trưởng bây giờ được giới hạn tối đa ở 100%
- Hiển thị đúng dấu âm cho trường hợp giảm
- Tính nhất quán trong tất cả các biểu đồ thống kê
- Dễ đọc và hiểu hơn cho người dùng 