package org.example.duan.Service;

import lombok.RequiredArgsConstructor;
import org.example.duan.Repository.HoaDonRepository;
import org.example.duan.Repository.HoaDonChiTietRepository;
import org.example.duan.Repository.SanPhamRepository;
import org.example.duan.Repository.ChiTietSanPhamRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Query;

@Service
@RequiredArgsConstructor
public class ThongKeService {
    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final SanPhamRepository sanPhamRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    // Thống kê doanh thu theo khoảng thời gian
    public Map<String, Object> thongKeDoanhThu(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);
        var hoaDons = hoaDonRepository.findAll();
        BigDecimal tongDoanhThu = BigDecimal.ZERO;
        BigDecimal tongPhiShip = BigDecimal.ZERO;
        int soHoaDon = 0;
        for (var hd : hoaDons) {
            if (hd.getNgayTao() != null && !hd.getNgayTao().toInstant().isBefore(fromDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant()) && !hd.getNgayTao().toInstant().isAfter(toDate.atTime(23,59,59).atZone(java.time.ZoneId.systemDefault()).toInstant())) {
                if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                    tongDoanhThu = tongDoanhThu.add(hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO);
                    tongPhiShip = tongPhiShip.add(hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO);
                    soHoaDon++;
                }
            }
        }
        // Thêm thống kê doanh thu ngày, tuần, tháng dựa trên ngày toDate (ngày cuối cùng client truyền lên)
        BigDecimal doanhThuNgay = tinhDoanhThuTheoKhoang(hoaDons, toDate, toDate);
        LocalDate firstDayOfWeek = toDate.with(java.time.DayOfWeek.MONDAY);
        LocalDate lastDayOfWeek = toDate.with(java.time.DayOfWeek.SUNDAY);
        BigDecimal doanhThuTuan = tinhDoanhThuTheoKhoang(hoaDons, firstDayOfWeek, lastDayOfWeek);
        LocalDate firstDayOfMonth = toDate.withDayOfMonth(1);
        LocalDate lastDayOfMonth = toDate.withDayOfMonth(toDate.lengthOfMonth());
        BigDecimal doanhThuThang = tinhDoanhThuTheoKhoang(hoaDons, firstDayOfMonth, lastDayOfMonth);
        Map<String, Object> result = new HashMap<>();
        result.put("tongDoanhThu", tongDoanhThu.subtract(tongPhiShip));
        result.put("soHoaDon", soHoaDon);
        result.put("doanhThuNgay", doanhThuNgay);
        result.put("doanhThuTuan", doanhThuTuan);
        result.put("doanhThuThang", doanhThuThang);
        return result;
    }

    // Hàm phụ: tính doanh thu đã trừ phí ship trong khoảng ngày
    private BigDecimal tinhDoanhThuTheoKhoang(java.util.List<?> hoaDons, LocalDate from, LocalDate to) {
        BigDecimal tong = BigDecimal.ZERO;
        BigDecimal tongPhiShip = BigDecimal.ZERO;
        for (var obj : hoaDons) {
            var hd = (org.example.duan.Entity.HoaDon) obj;
            if (hd.getNgayTao() != null) {
                LocalDate ngay = hd.getNgayTao().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                if ((ngay.isEqual(from) || ngay.isAfter(from)) && (ngay.isEqual(to) || ngay.isBefore(to))) {
                    if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                        tong = tong.add(hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO);
                        tongPhiShip = tongPhiShip.add(hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO);
                    }
                }
            }
        }
        return tong.subtract(tongPhiShip);
    }


    // Thống kê tồn kho sản phẩm
    public List<Map<String, Object>> thongKeTonKho() {
        var chiTietList = chiTietSanPhamRepository.findAll();
        Map<Integer, Integer> sanPhamTonKho = new HashMap<>(); // idSanPham -> tổng tồn kho
        for (var ct : chiTietList) {
            if (ct.getSanPham() != null) {
                int idSanPham = ct.getSanPham().getIdSanPham();
                sanPhamTonKho.put(idSanPham, sanPhamTonKho.getOrDefault(idSanPham, 0) + (ct.getSoLuong() != null ? ct.getSoLuong() : 0));
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : sanPhamTonKho.entrySet()) {
            var sp = sanPhamRepository.findById(entry.getKey()).orElse(null);
            if (sp != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("idSanPham", sp.getIdSanPham());
                item.put("tenSanPham", sp.getTenSanPham());
                item.put("tonKho", entry.getValue());
                result.add(item);
            }
        }
        return result;
    }

    // Thống kê doanh thu từng ngày trong khoảng from - to
    public List<Map<String, Object>> thongKeDoanhThuTungNgay(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);
        var hoaDons = hoaDonRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            BigDecimal revenue = BigDecimal.ZERO;
            BigDecimal phiShip = BigDecimal.ZERO;
            int sold = 0;
            for (var hd : hoaDons) {
                if (hd.getNgayTao() != null) {
                    LocalDate ngay = hd.getNgayTao().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                    if (ngay.isEqual(date)) {
                        if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                            revenue = revenue.add(hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO);
                            phiShip = phiShip.add(hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO);
                            // Lấy danh sách chi tiết hóa đơn từ repository
                            java.util.List<org.example.duan.Entity.HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
                            for (var cthd : chiTietList) {
                                sold += cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                            }
                        }
                    }
                }
            }
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toString());
            item.put("revenue", revenue.subtract(phiShip));
            item.put("sold", sold); // Thêm trường số lượng bán
            result.add(item);
        }
        return result;
    }

    // Thống kê doanh thu từng tháng trong khoảng from - to
    public List<Map<String, Object>> thongKeDoanhThuTungThang(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);
        var hoaDons = hoaDonRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Tạo map để nhóm theo tháng
        Map<String, BigDecimal> monthlyRevenue = new HashMap<>();
        Map<String, BigDecimal> monthlyPhiShip = new HashMap<>();
        Map<String, Integer> monthlySold = new HashMap<>();
        
        for (var hd : hoaDons) {
            if (hd.getNgayTao() != null) {
                LocalDate ngay = hd.getNgayTao().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                if ((ngay.isEqual(fromDate) || ngay.isAfter(fromDate)) && (ngay.isEqual(toDate) || ngay.isBefore(toDate))) {
                    if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                        String monthKey = ngay.getYear() + "-" + String.format("%02d", ngay.getMonthValue());
                        BigDecimal revenue = hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO;
                        BigDecimal phiShip = hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO;
                        
                        monthlyRevenue.put(monthKey, monthlyRevenue.getOrDefault(monthKey, BigDecimal.ZERO).add(revenue));
                        monthlyPhiShip.put(monthKey, monthlyPhiShip.getOrDefault(monthKey, BigDecimal.ZERO).add(phiShip));
                        
                        // Tính số lượng bán
                        java.util.List<org.example.duan.Entity.HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
                        int sold = 0;
                        for (var cthd : chiTietList) {
                            sold += cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                        }
                        monthlySold.put(monthKey, monthlySold.getOrDefault(monthKey, 0) + sold);
                    }
                }
            }
        }
        
        // Tạo các tháng đã qua trong năm hiện tại (2025)
        int currentYear = 2025; // Năm hiện tại
        int currentMonth = java.time.LocalDate.now().getMonthValue(); // Tháng hiện tại
        
        for (int month = 1; month <= currentMonth; month++) {
            String monthKey = currentYear + "-" + String.format("%02d", month);
            Map<String, Object> item = new HashMap<>();
            item.put("date", monthKey);
            item.put("revenue", monthlyRevenue.getOrDefault(monthKey, BigDecimal.ZERO).subtract(monthlyPhiShip.getOrDefault(monthKey, BigDecimal.ZERO)));
            item.put("sold", monthlySold.getOrDefault(monthKey, 0));
            result.add(item);
        }
        
        // Sắp xếp theo thời gian
        result.sort((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()));
        return result;
    }

    // Thống kê doanh thu từng quý trong khoảng from - to
    public List<Map<String, Object>> thongKeDoanhThuTungQuy(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);
        var hoaDons = hoaDonRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Tạo map để nhóm theo quý
        Map<String, BigDecimal> quarterlyRevenue = new HashMap<>();
        Map<String, BigDecimal> quarterlyPhiShip = new HashMap<>();
        Map<String, Integer> quarterlySold = new HashMap<>();
        
        for (var hd : hoaDons) {
            if (hd.getNgayTao() != null) {
                LocalDate ngay = hd.getNgayTao().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                if ((ngay.isEqual(fromDate) || ngay.isAfter(fromDate)) && (ngay.isEqual(toDate) || ngay.isBefore(toDate))) {
                    if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                        int quarter = (ngay.getMonthValue() - 1) / 3 + 1;
                        String quarterKey = ngay.getYear() + "-Q" + quarter;
                        BigDecimal revenue = hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO;
                        BigDecimal phiShip = hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO;
                        
                        quarterlyRevenue.put(quarterKey, quarterlyRevenue.getOrDefault(quarterKey, BigDecimal.ZERO).add(revenue));
                        quarterlyPhiShip.put(quarterKey, quarterlyPhiShip.getOrDefault(quarterKey, BigDecimal.ZERO).add(phiShip));
                        
                        // Tính số lượng bán
                        java.util.List<org.example.duan.Entity.HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
                        int sold = 0;
                        for (var cthd : chiTietList) {
                            sold += cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                        }
                        quarterlySold.put(quarterKey, quarterlySold.getOrDefault(quarterKey, 0) + sold);
                    }
                }
            }
        }
        
        // Tạo tất cả các quý đã qua trong năm hiện tại (2025)
        int currentYear = 2025; // Năm hiện tại
        int currentMonth = java.time.LocalDate.now().getMonthValue(); // Tháng hiện tại
        int currentQuarter = (currentMonth - 1) / 3 + 1; // Quý hiện tại
        
        for (int quarter = 1; quarter <= currentQuarter; quarter++) {
            String quarterKey = currentYear + "-Q" + quarter;
            Map<String, Object> item = new HashMap<>();
            item.put("date", quarterKey);
            item.put("revenue", quarterlyRevenue.getOrDefault(quarterKey, BigDecimal.ZERO).subtract(quarterlyPhiShip.getOrDefault(quarterKey, BigDecimal.ZERO)));
            item.put("sold", quarterlySold.getOrDefault(quarterKey, 0));
            result.add(item);
        }
        
        // Sắp xếp theo thời gian
        result.sort((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()));
        return result;
    }

    // Thống kê doanh thu từng năm trong khoảng from - to
    public List<Map<String, Object>> thongKeDoanhThuTungNam(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);
        var hoaDons = hoaDonRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Tạo map để nhóm theo năm
        Map<String, BigDecimal> yearlyRevenue = new HashMap<>();
        Map<String, BigDecimal> yearlyPhiShip = new HashMap<>();
        Map<String, Integer> yearlySold = new HashMap<>();
        
        for (var hd : hoaDons) {
            if (hd.getNgayTao() != null) {
                LocalDate ngay = hd.getNgayTao().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                if ((ngay.isEqual(fromDate) || ngay.isAfter(fromDate)) && (ngay.isEqual(toDate) || ngay.isBefore(toDate))) {
                    if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                        String yearKey = String.valueOf(ngay.getYear());
                        BigDecimal revenue = hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO;
                        BigDecimal phiShip = hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO;
                        
                        yearlyRevenue.put(yearKey, yearlyRevenue.getOrDefault(yearKey, BigDecimal.ZERO).add(revenue));
                        yearlyPhiShip.put(yearKey, yearlyPhiShip.getOrDefault(yearKey, BigDecimal.ZERO).add(phiShip));
                        
                        // Tính số lượng bán
                        java.util.List<org.example.duan.Entity.HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
                        int sold = 0;
                        for (var cthd : chiTietList) {
                            sold += cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                        }
                        yearlySold.put(yearKey, yearlySold.getOrDefault(yearKey, 0) + sold);
                    }
                }
            }
        }
        
        // Tạo 3 năm gần nhất để so sánh (2023, 2024, 2025)
        int currentYear = 2025;
        
        for (int year = currentYear - 2; year <= currentYear; year++) {
            String yearKey = String.valueOf(year);
            Map<String, Object> item = new HashMap<>();
            item.put("date", yearKey);
            item.put("revenue", yearlyRevenue.getOrDefault(yearKey, BigDecimal.ZERO).subtract(yearlyPhiShip.getOrDefault(yearKey, BigDecimal.ZERO)));
            item.put("sold", yearlySold.getOrDefault(yearKey, 0));
            result.add(item);
        }

        // Sắp xếp theo thời gian
        result.sort((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()));
        return result;
    }

    public Map<String, Object> getSanPhamBanNhieuNhat() {
        List<Object[]> list = sanPhamRepository.findSanPhamBanNhieuNhat();
        Object[] row = list.isEmpty() ? null : list.get(0);
        if (row != null) {
            Map<String, Object> result = new HashMap<>();
            result.put("tenSanPham", row[0]);
            result.put("soLuongBan", row[1]);
            return result;
        }
        return null;
    }

    public Long getTongSoSanPhamDaBan() {
        Long total = sanPhamRepository.getTongSoSanPhamDaBan();
        return total != null ? total : 0L;
    }

    public List<Map<String, Object>> thongKeSoLuongBanTheoNgay(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);

        // Lấy dữ liệu gốc từ repository (chỉ những ngày có bán)
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoNgay(from, to);
        Map<String, Integer> soldMap = new HashMap<>();
        for (Object[] row : raw) {
            soldMap.put(row[0].toString(), ((Number)row[1]).intValue());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            String dateStr = date.toString();
            Map<String, Object> map = new HashMap<>();
            map.put("date", dateStr);
            map.put("sold", soldMap.getOrDefault(dateStr, 0));
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> thongKeSoLuongBanTheoThang(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoThang(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            map.put("sold", row[1]);
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> thongKeSoLuongBanTheoQuy(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoQuy(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            map.put("sold", row[1]);
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> thongKeSoLuongBanTheoNam(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoNam(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            map.put("sold", row[1]);
            result.add(map);
        }
        return result;
    }

    // Thống kê số lượng bán theo tháng và tốc độ tăng trưởng
    public List<Map<String, Object>> thongKeSoLuongBanTheoThangVaTangTruong(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoThang(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        Integer prev = null;
        for (Object[] row : raw) {
            Object dateObj = row[0];
            if (dateObj == null) continue;
            if (dateObj instanceof String) {
                String dateStr = ((String)dateObj).trim();
                if (dateStr.isEmpty() || dateStr.equalsIgnoreCase("null")) continue;
            }
            if (dateObj instanceof Number && ((Number)dateObj).intValue() == 0) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            int sold = ((Number)row[1]).intValue();
            map.put("sold", sold);
            if (prev != null && prev > 0) {
                double growth = ((double)(sold - prev) / prev) * 100.0;
                map.put("growth", growth);
            } else {
                map.put("growth", null);
            }
            prev = sold;
            result.add(map);
        }
        return result;
    }

    // Thống kê số lượng bán theo quý và tốc độ tăng trưởng
    public List<Map<String, Object>> thongKeSoLuongBanTheoQuyVaTangTruong(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoQuy(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        Integer prev = null;
        for (Object[] row : raw) {
            Object dateObj = row[0];
            if (dateObj == null) continue;
            if (dateObj instanceof String) {
                String dateStr = ((String)dateObj).trim();
                if (dateStr.isEmpty() || dateStr.equalsIgnoreCase("null")) continue;
            }
            if (dateObj instanceof Number && ((Number)dateObj).intValue() == 0) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            int sold = ((Number)row[1]).intValue();
            map.put("sold", sold);
            if (prev != null && prev > 0) {
                double growth = ((double)(sold - prev) / prev) * 100.0;
                map.put("growth", growth);
            } else {
                map.put("growth", null);
            }
            prev = sold;
            result.add(map);
        }
        return result;
    }

    // Thống kê số lượng bán theo năm và tốc độ tăng trưởng
    public List<Map<String, Object>> thongKeSoLuongBanTheoNamVaTangTruong(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoNam(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        Integer prev = null;
        for (Object[] row : raw) {
            Object dateObj = row[0];
            if (dateObj == null) continue;
            if (dateObj instanceof String) {
                String dateStr = ((String)dateObj).trim();
                if (dateStr.isEmpty() || dateStr.equalsIgnoreCase("null")) continue;
            }
            if (dateObj instanceof Number && ((Number)dateObj).intValue() == 0) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            int sold = ((Number)row[1]).intValue();
            map.put("sold", sold);
            if (prev != null && prev > 0) {
                double growth = ((double)(sold - prev) / prev) * 100.0;
                map.put("growth", growth);
            } else {
                map.put("growth", null);
            }
            prev = sold;
            result.add(map);
        }
        return result;
    }

    // Thống kê doanh thu từng tháng từ tháng 1 đến tháng hiện tại (hoặc tháng tiếp theo), các tháng không có dữ liệu sẽ có doanh thu = 0
    public List<Map<String, Object>> thongKeDoanhThuTungThangDayDu(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeDoanhThuTheoThang(from, to); // lấy từ repository
        Map<String, Object> monthMap = new HashMap<>();
        for (Object[] row : raw) {
            monthMap.put(row[0].toString(), row[1]);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int currentMonth = now.getMonthValue();
        // Nếu đã sang tháng mới, hiển thị cả tháng tiếp theo
        int maxMonth = currentMonth;
        if (now.getDayOfMonth() == 1) {
            maxMonth = currentMonth + 1;
        }
        for (int m = 1; m <= maxMonth; m++) {
            String monthKey = String.format("%d-%02d", year, m);
            Map<String, Object> item = new HashMap<>();
            item.put("date", monthKey);
            item.put("revenue", monthMap.getOrDefault(monthKey, BigDecimal.ZERO));
            result.add(item);
        }
        return result;
    }

    // Thống kê số lượng bán theo tháng từ tháng 1 đến tháng hiện tại (hoặc tháng tiếp theo), các tháng không có dữ liệu sẽ có sold = 0
    public List<Map<String, Object>> thongKeSoLuongBanTheoThangDayDu(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoThang(from, to);
        Map<String, Object> monthMap = new HashMap<>();
        for (Object[] row : raw) {
            monthMap.put(row[0].toString(), row[1]);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int currentMonth = now.getMonthValue();
        int maxMonth = currentMonth;
        if (now.getDayOfMonth() == 1) {
            maxMonth = currentMonth + 1;
        }
        for (int m = 1; m <= maxMonth; m++) {
            String monthKey = String.format("%d-%02d", year, m);
            Map<String, Object> item = new HashMap<>();
            item.put("date", monthKey);
            item.put("sold", monthMap.getOrDefault(monthKey, 0));
            result.add(item);
        }
        return result;
    }

    // Thống kê số lượng bán theo quý đủ cột (4 quý) của năm hiện tại
    public List<Map<String, Object>> thongKeSoLuongBanTheoQuyDayDu(String from, String to) {
        List<Object[]> raw = sanPhamRepository.thongKeSoLuongBanTheoQuy(from, to);
        Map<String, Object> quyMap = new HashMap<>();
        for (Object[] row : raw) {
            quyMap.put(row[0].toString(), row[1]);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int currentQuarter = (now.getMonthValue() - 1) / 3 + 1;
        int maxQuarter = currentQuarter;
        // Nếu là ngày đầu tiên của quý mới, hiển thị thêm quý tiếp theo
        if (now.getDayOfMonth() == 1 && (now.getMonthValue() - 1) % 3 == 0 && currentQuarter < 4) {
            maxQuarter = currentQuarter + 1;
        }
        for (int q = 1; q <= maxQuarter; q++) {
            String quyKey = year + "-Q" + q;
            Map<String, Object> item = new HashMap<>();
            item.put("date", quyKey);
            item.put("sold", quyMap.getOrDefault(quyKey, 0));
            result.add(item);
        }
        return result;
    }

    // Thống kê số lượng bán theo năm đủ cột từ 2023 đến năm hiện tại (nếu sang năm mới thì tự sinh thêm cột cho năm mới)
    public List<Map<String, Object>> thongKeSoLuongBanTheoNamDayDu(String from, String to) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(from, formatter);
        LocalDate toDate = LocalDate.parse(to, formatter);
        var hoaDons = hoaDonRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Tạo map để nhóm theo năm
        Map<String, BigDecimal> yearlyRevenue = new HashMap<>();
        Map<String, BigDecimal> yearlyPhiShip = new HashMap<>();
        Map<String, Integer> yearlySold = new HashMap<>();
        
        for (var hd : hoaDons) {
            if (hd.getNgayTao() != null) {
                LocalDate ngay = hd.getNgayTao().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                if ((ngay.isEqual(fromDate) || ngay.isAfter(fromDate)) && (ngay.isEqual(toDate) || ngay.isBefore(toDate))) {
                    if ("Giao hàng thành công".equalsIgnoreCase(hd.getTrangThai())) {
                        String yearKey = String.valueOf(ngay.getYear());
                        BigDecimal revenue = hd.getThanhTien() != null ? hd.getThanhTien() : BigDecimal.ZERO;
                        BigDecimal phiShip = hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO;
                        
                        yearlyRevenue.put(yearKey, yearlyRevenue.getOrDefault(yearKey, BigDecimal.ZERO).add(revenue));
                        yearlyPhiShip.put(yearKey, yearlyPhiShip.getOrDefault(yearKey, BigDecimal.ZERO).add(phiShip));
                        
                        // Tính số lượng bán
                        java.util.List<org.example.duan.Entity.HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.findByHoaDon_IdHoaDon(hd.getIdHoaDon());
                        int sold = 0;
                        for (var cthd : chiTietList) {
                            sold += cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                        }
                        yearlySold.put(yearKey, yearlySold.getOrDefault(yearKey, 0) + sold);
                    }
                }
            }
        }
        
        // Tạo các năm từ 2020 đến năm hiện tại
        int currentYear = java.time.LocalDate.now().getYear();
        for (int year = 2020; year <= currentYear; year++) {
            String yearKey = String.valueOf(year);
            Map<String, Object> item = new HashMap<>();
            item.put("date", yearKey);
            item.put("revenue", yearlyRevenue.getOrDefault(yearKey, BigDecimal.ZERO).subtract(yearlyPhiShip.getOrDefault(yearKey, BigDecimal.ZERO)));
            item.put("sold", yearlySold.getOrDefault(yearKey, 0));
            result.add(item);
        }
        
        // Sắp xếp theo thời gian
        result.sort((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()));
        return result;
    }

    // Method để kiểm tra trạng thái hóa đơn
    public Map<String, Object> kiemTraTrangThaiHoaDon() {
        var hoaDons = hoaDonRepository.findAll();
        Map<String, Integer> trangThaiCount = new HashMap<>();
        int totalHoaDon = 0;
        
        for (var hd : hoaDons) {
            totalHoaDon++;
            String trangThai = hd.getTrangThai();
            if (trangThai != null) {
                trangThaiCount.put(trangThai, trangThaiCount.getOrDefault(trangThai, 0) + 1);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalHoaDon", totalHoaDon);
        result.put("trangThaiCount", trangThaiCount);
        result.put("coGiaoHangThanhCong", trangThaiCount.containsKey("Giao hàng thành công"));
        result.put("soLuongGiaoHangThanhCong", trangThaiCount.getOrDefault("Giao hàng thành công", 0));
        
        return result;
    }
} 