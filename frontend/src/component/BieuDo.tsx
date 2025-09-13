"use client";
import React from "react";
import { BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";

export default function BieuDo({ data, viewMode, timeUnit }: { data: any[], viewMode?: 'revenue' | 'sold', timeUnit?: 'day' | 'month' | 'quarter' | 'year' }) {
  // Kiểm tra dữ liệu
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '650px',
        fontSize: '18px',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  // Hàm giới hạn phần trăm tăng trưởng tối đa 100%
  const limitGrowthPercentage = (percentage: number) => {
    return Math.min(Math.abs(percentage), 100);
  };

  try {
    // Tính tổng doanh thu hoặc số lượng bán trong khoảng thời gian đã chọn
    const totalValue = data.reduce((sum, item) => {
      if (viewMode === 'sold') {
        return sum + (item.sold || 0);
      }
      return sum + (item.revenue || 0);
    }, 0);

    // Hàm định dạng số tiền
    const formatCurrency = (value: number) => value.toLocaleString("vi-VN") + "₫";

    // Hàm định dạng số lượng
    const formatQuantity = (value: number) => value.toLocaleString("vi-VN");

    // Hàm định dạng label cho data labels
    const formatLabel = (value: any) => {
      if (typeof value !== 'number') return '';
      if (viewMode === 'sold') {
        return formatQuantity(value);
      }
      return formatCurrency(value);
    };

    // Hàm xác định label cho tooltip
    const getTooltipLabel = () => {
      switch (timeUnit) {
        case 'day':
          return 'Ngày: ';
        case 'month':
          return 'Tháng: ';
        case 'quarter':
          return 'Quý: ';
        case 'year':
          return 'Năm: ';
        default:
          return 'Ngày: ';
      }
    };

    // Tạo các mốc ticks cho YAxis bắt đầu từ 5 triệu, cách nhau 5 triệu
    const maxRevenue = Math.max(...data.map(item => item.revenue || 0), 0);
    // Chia mức cố định cho trục Y
    let step = 1000000;
    if (maxRevenue < 10000000) step = 1000000;
    else if (maxRevenue < 50000000) step = 2000000;
    else if (maxRevenue < 100000000) step = 5000000;
    else step = 10000000;
    let ticks = [];
    for (let i = step; i <= maxRevenue + step; i += step) {
      ticks.push(i);
    }
    // Nếu số tick quá nhiều, tự động tăng step lên gấp đôi cho đến khi số tick <= 12
    while (ticks.length > 12) {
      step *= 2;
      ticks = [];
      for (let i = step; i <= maxRevenue + step; i += step) {
        ticks.push(i);
      }
    }

    // Lấy doanh thu ngày cuối cùng trong mảng data
    let lastRevenue = 0;
    let lastDate = '';
    if (data && data.length > 0) {
      lastRevenue = data[data.length - 1].revenue || 0;
      lastDate = data[data.length - 1].date || '';
    }

    return (
      <div style={{ width: "100%", height: 700 }}>
        {data && data.length > 0 ? (
          <div style={{ 
            border: '1px solid #e6d8b4', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 4px 20px rgba(181, 157, 58, 0.15)',
            background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)'
          }}>
            <div style={{ 
              marginBottom: '20px', 
              fontSize: '18px', 
              fontWeight: '600',
              textAlign: 'center',
              padding: '12px',
              background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              {viewMode === 'sold' ? `Tổng sản phẩm: ${formatQuantity(totalValue)}` : `Tổng doanh thu: ${formatCurrency(totalValue)}`}
            </div>
            <div style={{ width: "100%", height: 580, position: 'relative', overflow: 'hidden' }}>
              <BarChart
                width={1000}
                height={550}
                data={data}
                margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  angle={0}
                  textAnchor="middle"
                  height={40}
                  tick={{ fontSize: 14, fill: '#555' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#ddd' }}
                  tickLine={{ stroke: '#ddd' }}
                />
                {(!viewMode || viewMode === 'revenue') && (
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 14, fill: '#555' }}
                    tickFormatter={formatCurrency}
                    domain={[0, 'auto']}
                    tickMargin={15}
                    width={100}
                    ticks={ticks}
                    axisLine={{ stroke: '#ddd' }}
                    tickLine={{ stroke: '#ddd' }}
                  />
                )}
                {viewMode === 'sold' && (
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 14, fill: '#555' }}
                    tickFormatter={value => value.toString()}
                    domain={[0, 'auto']}
                    tickMargin={15}
                    width={100}
                    axisLine={{ stroke: '#ddd' }}
                    tickLine={{ stroke: '#ddd' }}
                  />
                )}
                <Tooltip
                  wrapperStyle={{ fontSize: 15 }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value: any, name: string, props: any) =>
                    name === 'Doanh thu' ? formatCurrency(value) : value
                  }
                  labelFormatter={(label: any) => `${getTooltipLabel()} ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 15, marginTop: '15px' }} />
                {(!viewMode || viewMode === 'revenue') && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="revenue" 
                    fill="url(#gradient)" 
                    name="Doanh thu" 
                    barSize={45}
                    radius={[6, 6, 0, 0]}
                  >
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b59d3a" />
                        <stop offset="100%" stopColor="#8a7a2a" />
                      </linearGradient>
                    </defs>
                    <LabelList 
                      dataKey="revenue" 
                      position="top" 
                      formatter={formatLabel}
                      style={{ fontSize: 13, fontWeight: 'bold', fill: '#2c3e50' }}
                      offset={10}
                    />
                  </Bar>
                )}
                {viewMode === 'sold' && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="sold" 
                    fill="url(#gradientSold)" 
                    name="Số lượng bán" 
                    barSize={45}
                    radius={[6, 6, 0, 0]}
                  >
                    <defs>
                      <linearGradient id="gradientSold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e6d8b4" />
                        <stop offset="100%" stopColor="#b59d3a" />
                      </linearGradient>
                    </defs>
                    <LabelList 
                      dataKey="sold" 
                      position="top" 
                      formatter={formatLabel}
                      style={{ fontSize: 13, fontWeight: 'bold', fill: '#2c3e50' }}
                      offset={10}
                    />
                  </Bar>
                )}
              </BarChart>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            fontSize: '18px',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}>
            Không có dữ liệu để hiển thị
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error rendering BieuDo:", error);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '650px',
        fontSize: '18px',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        Lỗi khi hiển thị biểu đồ. Vui lòng thử lại sau.
      </div>
    );
  }
} 