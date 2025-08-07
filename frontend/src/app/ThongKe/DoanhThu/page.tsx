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
  const [growthData, setGrowthData] = useState({
    currentRevenue: 0,
    previousRevenue: 0,
    growthPercentage: 0,
    isGrowth: true
  });

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
      
      // Tính toán tăng trưởng sau khi có dữ liệu
      calculateGrowth(fromDateStr, toDateStr);
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

  // Hàm tính toán tăng trưởng
  const calculateGrowth = async (currentFromDate: string, currentToDate: string) => {
    try {
      // Tính khoảng thời gian trước đó - so sánh với cùng ngày tháng trước
      const currentFrom = new Date(currentFromDate);
      const currentTo = new Date(currentToDate);
      
      // Tính cùng ngày tháng trước
      const previousFrom = new Date(currentFrom.getFullYear(), currentFrom.getMonth() - 1, currentFrom.getDate());
      const previousTo = new Date(currentTo.getFullYear(), currentTo.getMonth() - 1, currentTo.getDate());
      
      const previousFromStr = formatDate(previousFrom);
      const previousToStr = formatDate(previousTo);
      
      // Gọi API cho khoảng thời gian hiện tại và trước đó
      const res1 = await fetch(`http://localhost:8080/api/thongke/doanh-thu-ngay?from=${currentFromDate}&to=${currentToDate}`, { cache: "no-store" });
      const data1 = await res1.json();
      
      const res2 = await fetch(`http://localhost:8080/api/thongke/doanh-thu-ngay?from=${previousFromStr}&to=${previousToStr}`, { cache: "no-store" });
      const data2 = await res2.json();
      
      // So sánh từng ngày cụ thể thay vì tổng
      let currentRevenue = 0;
      let previousRevenue = 0;
      
      if (Array.isArray(data1) && Array.isArray(data2)) {
        // Tìm ngày cuối cùng có dữ liệu trong kỳ hiện tại
        const lastCurrentDay = data1[data1.length - 1];
        if (lastCurrentDay) {
          currentRevenue = Number(lastCurrentDay.revenue ?? 0);
          
          // Tìm ngày tương ứng trong kỳ trước đó
          const lastCurrentDate = new Date(lastCurrentDay.date);
          const correspondingPrevDate = new Date(lastCurrentDate);
          correspondingPrevDate.setMonth(correspondingPrevDate.getMonth() - 1);
          const correspondingPrevDateStr = formatDate(correspondingPrevDate);
          
          // Tìm dữ liệu của ngày tương ứng trong kỳ trước
          const correspondingPrevDay = data2.find(item => item.date === correspondingPrevDateStr);
          if (correspondingPrevDay) {
            previousRevenue = Number(correspondingPrevDay.revenue ?? 0);
          }
        }
      }
      
      // Tính toán phần trăm tăng trưởng
      let growthPercentage = 0;
      let isGrowth = true;
      
      if (previousRevenue > 0) {
        growthPercentage = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        isGrowth = currentRevenue >= previousRevenue;
        // Giới hạn tối đa tăng và giảm chỉ 100%
        growthPercentage = Math.min(Math.abs(growthPercentage), 100);
      } else if (currentRevenue > 0 && previousRevenue === 0) {
        // Nếu trước đó = 0 và hiện tại > 0, hiển thị "Tăng mới"
        growthPercentage = 100; // Giới hạn tối đa 100%
        isGrowth = true;
      } else if (currentRevenue === 0 && previousRevenue === 0) {
        // Cả hai đều = 0
        growthPercentage = 0;
        isGrowth = true;
      } else if (currentRevenue === 0 && previousRevenue > 0) {
        // Hiện tại = 0, trước đó > 0
        growthPercentage = 100;
        isGrowth = false;
      }
      
      setGrowthData({
        currentRevenue,
        previousRevenue,
        growthPercentage: growthPercentage,
        isGrowth
      });
    } catch (error) {
      console.error('Lỗi tính toán tăng trưởng:', error);
      setGrowthData({
        currentRevenue: 0,
        previousRevenue: 0,
        growthPercentage: 0,
        isGrowth: true
      });
    }
  };

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

  useEffect(() => {
    if (fromDate && toDate && stats.revenue !== undefined) {
      const fromDateStr = formatDate(fromDate);
      const toDateStr = formatDate(toDate);
      calculateGrowth(fromDateStr, toDateStr);
    }
  }, [fromDate, toDate, stats.revenue]);

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
                {/* Box tăng trưởng */}
                <div style={{
                      background: '#fff',
                      borderRadius: 10,
                      boxShadow: growthData.isGrowth ? '0 2px 8px #b59d3a22' : '0 2px 8px #e74c3c22',
                      padding: '6px 14px',
                      fontSize: 14,
                      fontWeight: 700,
                      color: growthData.isGrowth ? '#388e3c' : '#e74c3c',
                      marginBottom: 12,
                      display: 'inline-block',
                      border: growthData.isGrowth ? '2px solid #4caf50' : '2px solid #e74c3c'
                    }}>
                  {(() => {
                    if (growthData.currentRevenue === 0 && growthData.previousRevenue === 0) {
                      return "Không có dữ liệu để so sánh";
                    } else if (growthData.currentRevenue > 0 && growthData.previousRevenue === 0) {
                      return (
                        <>
                          <span style={{ color: '#4caf50' }}>↗ 100.0%</span>
                          <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                            so với cùng ngày tháng trước
                          </span>
                        </>
                      );
                    } else if (growthData.currentRevenue === 0 && growthData.previousRevenue > 0) {
                      return (
                        <>
                          <span style={{ color: '#e74c3c' }}>↘ -100.0%</span>
                          <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                            so với cùng ngày tháng trước
                          </span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <span>
                            {growthData.isGrowth ? '↗' : '↘'} {growthData.isGrowth ? growthData.growthPercentage.toFixed(1) : '-' + growthData.growthPercentage.toFixed(1)}%
                          </span>
                          <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                            so với cùng ngày tháng trước
                          </span>
                        </>
                      );
                    }
                  })()}
                </div>
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