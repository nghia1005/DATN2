"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/component/Admin-Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import dynamic from "next/dynamic";
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import BieuDo from "@/component/BieuDo";
const RevenueBarChart = BieuDo;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Hàm format ngày dd/MM/yyyy
function formatDateStr(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
}

// Hàm format date cho biểu đồ theo đơn vị thời gian
function formatChartDate(dateStr: string, timeUnit: string) {
  if (timeUnit === 'day') {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN');
  } else if (timeUnit === 'month') {
    // Format: 2024-01 -> 1/2024 (chỉ số tháng và năm)
    const parts = dateStr.split('-');
    if (parts.length === 2) {
      const month = parseInt(parts[1]);
      const year = parts[0];
      return `${month}/${year}`;
    }
    return dateStr;
  } else if (timeUnit === 'quarter') {
    // Format: 2024-Q1 -> 1/2024 (chỉ số quý và năm)
    const parts = dateStr.split('-');
    if (parts.length === 2 && parts[1].startsWith('Q')) {
      const quarter = parts[1].substring(1);
      const year = parts[0];
      return `${quarter}/${year}`;
    }
    return dateStr;
  } else if (timeUnit === 'year') {
    // Format: 2024 -> 2024 (chỉ năm)
    return dateStr;
  }
  return dateStr;
}

export default function ThongKeDoanhThuPage() {
  const [activeMenu, setActiveMenu] = useState("statistics");
  const [activeSubMenu, setActiveSubMenu] = useState("revenue-statistics");
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    loading: true,
    error: null as string | null,
    doanhThuNgay: 0,
    doanhThuTuan: 0,
    doanhThuThang: 0
  });
  // Thêm state cho tổng doanh thu toàn hệ thống
  const [totalRevenueAll, setTotalRevenueAll] = useState(0);
  const [totalOrdersAll, setTotalOrdersAll] = useState(0);
  // State cho dữ liệu doanh thu
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [selectedLabel, setSelectedLabel] = useState('theo ngày');
  const [timeUnit, setTimeUnit] = useState<'day' | 'month' | 'quarter' | 'year'>('day');
  const [fromDate, setFromDate] = useState<Date>(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)); // 3 tuần trước
  const [toDate, setToDate] = useState<Date>(new Date()); // Hôm nay
  // Bỏ so sánh tăng trưởng

  // Xóa toàn bộ state STATUS_OPTIONS, status và dropdown lọc trạng thái
  // Trong fetchStats, bỏ truyền status vào API:
  const fetchStats = async () => {
    setStats(s => ({ ...s, loading: true, error: null }));
    try {
      // Sử dụng ngày từ bộ lọc nếu có, nếu không thì dùng logic mặc định
      let fromDateStr: string, toDateStr: string;

      if (fromDate && toDate) {
        fromDateStr = formatDate(fromDate);
        toDateStr = formatDate(toDate);
      } else {
        // Logic mặc định nếu không có bộ lọc
        const today = new Date();

        if (timeUnit === 'day') {
          // 3 tuần gần nhất cho ngày
          const threeWeeksAgo = new Date(today.getTime() - (21 * 24 * 60 * 60 * 1000));
          fromDateStr = formatDate(threeWeeksAgo);
          toDateStr = formatDate(today);
        } else if (timeUnit === 'month') {
          // Từ đầu năm đến cuối năm cho tháng (12 tháng đầy đủ)
          const yearStart = new Date(today.getFullYear(), 0, 1);
          const yearEnd = new Date(today.getFullYear(), 11, 31); // 31/12 của năm hiện tại
          fromDateStr = formatDate(yearStart);
          toDateStr = formatDate(yearEnd);
        } else if (timeUnit === 'quarter') {
          // Từ đầu quý đến hôm nay cho quý
          const currentQuarter = Math.floor(today.getMonth() / 3);
          const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
          fromDateStr = formatDate(quarterStart);
          toDateStr = formatDate(today);
        } else {
          // Từ đầu năm đến cuối năm cho năm (12 tháng đầy đủ)
          const yearStart = new Date(today.getFullYear(), 0, 1);
          const yearEnd = new Date(today.getFullYear(), 11, 31); // 31/12 của năm hiện tại
          fromDateStr = formatDate(yearStart);
          toDateStr = formatDate(yearEnd);
        }
      }

      const res1 = await fetch(`http://localhost:8080/api/thongke/doanh-thu?from=${fromDateStr}&to=${toDateStr}`, { cache: "no-store" });
      const data1 = await res1.json();

      // Gọi API doanh thu theo đơn vị thời gian
      let apiUrl = `http://localhost:8080/api/thongke/doanh-thu-ngay?from=${fromDateStr}&to=${toDateStr}`;
      if (timeUnit === 'month') {
        apiUrl = `http://localhost:8080/api/thongke/doanh-thu-thang?from=${fromDateStr}&to=${toDateStr}`;
      } else if (timeUnit === 'quarter') {
        apiUrl = `http://localhost:8080/api/thongke/doanh-thu-quy?from=${fromDateStr}&to=${toDateStr}`;
      } else if (timeUnit === 'year') {
        apiUrl = `http://localhost:8080/api/thongke/doanh-thu-nam?from=${fromDateStr}&to=${toDateStr}`;
      }

      const res3 = await fetch(apiUrl, { cache: "no-store" });
      const data3 = await res3.json();
      setRevenueByDay(Array.isArray(data3) ? data3 : []);
      setStats({
        revenue: data1.tongDoanhThu || 0,
        orders: data1.soHoaDon || 0,
        loading: false,
        error: null,
        doanhThuNgay: data1.doanhThuNgay || 0,
        doanhThuTuan: data1.doanhThuTuan || 0,
        doanhThuThang: data1.doanhThuThang || 0
      });

      // Bỏ tính toán so sánh tăng trưởng
    } catch (err: any) {
      console.error('Lỗi API:', err);
      setStats(s => ({ ...s, loading: false, error: "Lỗi khi lấy dữ liệu thống kê!" }));
      setRevenueByDay([]);
    }
  };

  useEffect(() => {
    // Gọi API lấy tổng doanh thu toàn hệ thống khi load trang
    const todayStr = formatDate(new Date());
    fetch(`http://localhost:8080/api/thongke/doanh-thu?from=2000-01-01&to=${todayStr}`)
        .then(res => res.json())
        .then(data => {
          setTotalRevenueAll(data.tongDoanhThu || 0);
          setTotalOrdersAll(data.soHoaDon || 0);
        })
        .catch(() => {
          setTotalRevenueAll(0);
          setTotalOrdersAll(0);
        });

    // Gọi API thống kê ban đầu
    fetchStats();
  }, []);

  // Gọi lại API khi thay đổi đơn vị thời gian hoặc bộ lọc ngày
  useEffect(() => {
    fetchStats();
  }, [timeUnit, fromDate, toDate]);

  // Hàm xóa lọc - reset về mặc định
  const clearFilter = () => {
    setTimeUnit('day');
    setSelectedLabel('theo ngày');
    setFromDate(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)); // 3 tuần trước
    setToDate(new Date()); // Hôm nay
    // Trong clearFilter, không cần setStatus
  };

  // Bỏ hàm tính toán so sánh tăng trưởng

  const CustomInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
      <input
          {...props}
          ref={ref}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #b59d3a",
            fontSize: 16,
            width: 150,
            background: "#fff",
            cursor: "pointer",
            textAlign: 'center'
          }}
          readOnly
      />
  ));

  // Tính tổng doanh thu trong khoảng lọc
  const totalRevenue = revenueByDay.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

  // Không còn gọi tính toán so sánh khi đổi ngày

  return (
      <AdminLayout activeMenu={activeMenu} activeSubMenu={activeSubMenu} pageTitle="Thống kê doanh thu">
        <div style={{ padding: 20, background: '#fffbe6', minHeight: '100vh' }}>


          {/* Bộ lọc thời gian */}
          <div style={{ marginBottom: 20, marginLeft: 8, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Đơn vị thời gian */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontWeight: 600, fontSize: '15px', color: '#6b4f1d', marginRight: 10 }}>Đơn vị thời gian:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'day', label: 'Ngày' },
                  { key: 'month', label: 'Tháng' },
                  { key: 'quarter', label: 'Quý' },
                  { key: 'year', label: 'Năm' }
                ].map((unit) => (
                    <button
                        key={unit.key}
                        type="button"
                        onClick={() => setTimeUnit(unit.key as 'day' | 'month' | 'quarter' | 'year')}
                        style={{
                          padding: '8px 16px',
                          background: timeUnit === unit.key ? '#b59d3a' : '#fff',
                          color: timeUnit === unit.key ? '#fff' : '#b59d3a',
                          border: '2px solid #b59d3a',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                    >
                      {unit.label}
                    </button>
                ))}
              </div>
            </div>

            {/* Bộ lọc ngày */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontWeight: 600, fontSize: '15px', color: '#6b4f1d' }}>Từ ngày:</label>
              <DatePicker
                  selected={fromDate}
                  onChange={(date) => {
                    setFromDate(date || new Date());
                  }}
                  customInput={<CustomInput />}
                  dateFormat="dd/MM/yyyy"
                  locale={vi}
                  maxDate={toDate || new Date()}
                  minDate={new Date(2000, 0, 1)}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
              />
              <label style={{ fontWeight: 600, fontSize: '15px', color: '#6b4f1d' }}>Đến ngày:</label>
              <DatePicker
                  selected={toDate}
                  onChange={(date) => {
                    setToDate(date || new Date());
                  }}
                  customInput={<CustomInput />}
                  dateFormat="dd/MM/yyyy"
                  locale={vi}
                  minDate={fromDate > new Date(2000, 0, 1) ? fromDate : new Date(2000, 0, 1)}
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
              />
              <button
                  onClick={clearFilter}
                  style={{
                    padding: '8px 16px',
                    background: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
              >
                <span style={{ fontSize: '16px' }}>×</span>
                Xóa lọc
              </button>
            </div>

            {/* Lọc trạng thái */}
            {/* Không có lọc trạng thái nữa */}
          </div>
          {stats.loading ? <div>Đang tải dữ liệu...</div> : stats.error ? <div style={{color:'red'}}>{stats.error}</div> : (
              !stats.loading && !stats.error && (
                  <>
                    {/* 2 box thống kê doanh thu */}
                    <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 2px 8px #b59d3a22', padding: 40, margin: '0 auto', maxWidth: 1500 }}>
                      <h2 style={{ color: '#b59d3a', fontWeight: 70, marginBottom: 24 }}>
                        {timeUnit === 'day' && 'Biểu đồ doanh thu theo ngày'}
                        {timeUnit === 'month' && 'Biểu đồ doanh thu theo tháng'}
                        {timeUnit === 'quarter' && 'Biểu đồ doanh thu theo quý'}
                        {timeUnit === 'year' && 'Biểu đồ doanh thu theo năm'}
                      </h2>
                      {/* Bỏ box so sánh tăng trưởng */}
                      <RevenueBarChart data={revenueByDay.map(item => ({ ...item, date: formatChartDate(item.date, timeUnit), sold: Number(item.sold ?? 0) }))} viewMode="revenue" timeUnit={timeUnit} />
                    </div>
                  </>
              )
          )}
        </div>
        <style jsx global>{`
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #b3d4fc !important;
          color: #222 !important;
        }
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range,
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #fff !important;
          color: #222 !important;
        }
      `}</style>
      </AdminLayout>
  );
} 