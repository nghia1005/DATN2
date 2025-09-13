"use client";
import React, { useState, useEffect } from 'react';
import OnlineInvoiceDetail from './OnlineInvoiceDetail';

interface Invoice {
    id: string;
    maHoaDon: string;
    ngayTao: string;
    khachHang: string;
    tongTien: number;
    trangThai: string;
    loaiHoaDon: 'pos' | 'online';
    thanhTien?: number;
    giamGia?: number;
    phiShip?: number;
    items?: {
        tenSanPham: string;
        soLuong: number;
        donGia: number;
        thanhTien: number;
    }[];
}

export default function OnlineInvoice() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8080/api/hoadon')
            .then(res => res.json())
      .then(data => {
                // Lọc chỉ hóa đơn online
                const onlineInvoices = data.filter((invoice: any) => invoice.loaiDon === 'Online');
                
                // Sắp xếp theo ngày tạo giảm dần (mới nhất lên đầu)
                const sortedData = onlineInvoices.sort((a: any, b: any) => {
                    const dateA = a.ngayTao ? new Date(a.ngayTao).getTime() : 0;
                    const dateB = b.ngayTao ? new Date(b.ngayTao).getTime() : 0;
                    return dateB - dateA;
                });
                setInvoices(sortedData);
                setLoading(false);
            })
            .catch(error => {
      console.error('Lỗi khi tải danh sách hóa đơn:', error);
      // Thêm dữ liệu mẫu để test với trạng thái "Chờ xác nhận"
      const sampleInvoices = [
        {
          idHoaDon: 1,
          maHoaDon: "HD001",
          ngayTao: "2024-01-15T10:30:00",
          trangThai: "Giao hàng thành công",
          tenKhachHang: "Nguyễn Văn A",
          thanhTien: 2250000,
          loaiDon: "Online"
        },
        {
          idHoaDon: 2,
          maHoaDon: "HD002",
          ngayTao: "2024-01-14T15:45:00",
          trangThai: "Đã xác nhận",
          tenKhachHang: "Trần Thị B",
          thanhTien: 1890000,
          loaiDon: "Online"
        },
        {
          idHoaDon: 3,
          maHoaDon: "HD003",
          ngayTao: "2024-01-13T09:20:00",
          trangThai: "Chờ xác nhận",
          tenKhachHang: "Lê Văn C",
          thanhTien: 3200000,
          loaiDon: "Online"
        },
        {
          idHoaDon: 4,
          maHoaDon: "HD004",
          ngayTao: "2024-01-12T14:15:00",
          trangThai: "Đang vận chuyển",
          tenKhachHang: "Phạm Thị D",
          thanhTien: 1560000,
          loaiDon: "Online"
        },
        {
          idHoaDon: 5,
          maHoaDon: "HD005",
          ngayTao: "2024-01-11T11:30:00",
          trangThai: "Chờ xác nhận",
          tenKhachHang: "Hoàng Văn E",
          thanhTien: 2780000,
          loaiDon: "Online"
        }
      ];
      setInvoices(sampleInvoices);
      setLoading(false);
            });
    }, []);

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = (invoice.maHoaDon || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.tenKhachHang || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || invoice.trangThai === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        return '#757575'; // Tất cả trạng thái đều có màu xám
    };

    const handleViewInvoice = (invoice: any) => {
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedInvoice(null);
    };

    const handlePrintInvoice = (invoice: Invoice) => {
        console.log('In hóa đơn:', invoice);
        // TODO: Implement print invoice
    };

    const handleExportInvoice = (invoice: Invoice) => {
        console.log('Xuất hóa đơn:', invoice);
        // TODO: Implement export invoice
    };

    return (
        <div className="invoice-management" style={{
            padding: '24px',
          background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0'
        }}>
            <div className="invoice-header">
                <h2 style={{ 
                    margin: 0, 
                    color: '#b59d3a', 
                    fontSize: '28px', 
                    fontWeight: '700',
                    textShadow: '0 1px 2px rgba(181, 157, 58, 0.1)'
                }}>
                    Hóa đơn online
                </h2>
                <div className="header-actions">
                    <button className="btn btn-primary" style={{
                        background: 'linear-gradient(135deg, #b59d3a 0%, #8b7a2e 100%)',
                        color: 'white',
                border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)'
              }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                        <span>➕</span>
                        Tạo hóa đơn mới
            </button>
                </div>
          </div>

            <div className="invoice-filters" style={{
            display: 'flex',
                gap: '20px',
                marginBottom: '24px',
                alignItems: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
            }}>
                <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                        placeholder="Tìm kiếm theo mã hóa đơn hoặc khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 40px 12px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: '#fff',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                    <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#b59d3a',
                        fontSize: '16px'
                    }}>🔍</span>
                  </div>

                <div className="filter-group">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                            padding: '12px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '180px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang vận chuyển">Đang vận chuyển</option>
                        <option value="Giao hàng thành công">Giao hàng thành công</option>
                        <option value="Giao hàng thất bại">Giao hàng thất bại</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>
              </div>

            <div className="invoice-content">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>Không có hóa đơn nào</h3>
                        <p>Chưa có hóa đơn online nào được tạo hoặc không tìm thấy hóa đơn phù hợp.</p>
                    </div>
                ) : (
                    <div className="invoice-table" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #b59d3a 0%, #8b7a2e 100%)' }}>
                                <th style={{ 
                                    padding: '16px 12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #8b7a2e', 
                                    fontWeight: '700', 
                                    color: '#fff', 
                                    fontSize: '14px' 
                                }}>Mã hóa đơn</th>
                                <th style={{ 
                                    padding: '16px 12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #8b7a2e', 
                                    fontWeight: '700', 
                                    color: '#fff', 
                                    fontSize: '14px' 
                                }}>Ngày tạo</th>
                                <th style={{ 
                                    padding: '16px 12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #8b7a2e', 
                                    fontWeight: '700', 
                                    color: '#fff', 
                                    fontSize: '14px' 
                                }}>Khách hàng</th>
                                <th style={{ 
                                    padding: '16px 12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #8b7a2e', 
                                    fontWeight: '700', 
                                    color: '#fff', 
                                    fontSize: '14px' 
                                }}>Tổng tiền</th>
                                <th style={{ 
                                    padding: '16px 12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #8b7a2e', 
                                    fontWeight: '700', 
                                    color: '#fff', 
                                    fontSize: '14px' 
                                }}>Trạng thái</th>
                                <th style={{ 
                                    padding: '16px 12px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid #8b7a2e', 
                                    fontWeight: '700', 
                                    color: '#fff', 
                                    fontSize: '14px' 
                                }}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredInvoices.map((invoice, index) => (
                                <tr key={invoice.idHoaDon || invoice.id} style={{
                                    borderBottom: '1px solid #e0e0e0',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                    <td style={{ padding: '16px 12px' }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: '#b59d3a',
                                            fontSize: '15px'
                                        }}>{invoice.maHoaDon}</span>
                                    </td>
                                    <td style={{ padding: '16px 12px', color: '#666' }}>
                                        {new Date(invoice.ngayTao).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '16px 12px', fontWeight: '500', color: '#2c3e50' }}>
                                        {invoice.tenKhachHang}
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: '#e67e22',
                                            fontSize: '15px'
                                        }}>{formatCurrency(invoice.thanhTien || invoice.tongTien)}</span>
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                            <span
                                                style={{ 
                                                    backgroundColor: getStatusColor(invoice.trangThai),
                                                    color: '#fff',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {invoice.trangThai}
                                            </span>
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                                                onClick={() => handleViewInvoice(invoice)}
                                                title="Xem chi tiết"
                    style={{
                                                    background: '#2196f3',
                      color: 'white',
                      border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#1976d2'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#2196f3'}
                                            >
                                                👁️
                  </button>
                <button
                                                onClick={() => handlePrintInvoice(invoice)}
                                                title="In hóa đơn"
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                                            >
                                                🖨️
                </button>
                <button
                                                onClick={() => handleExportInvoice(invoice)}
                                                title="Xuất hóa đơn"
                  style={{
                                                    background: '#b59d3a',
                    color: 'white',
                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#8b7a2e'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#b59d3a'}
                                            >
                                                📥
                </button>
              </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
            </div>
                )}
        </div>

            {showDetailModal && selectedInvoice && (
                <OnlineInvoiceDetail
                    invoice={selectedInvoice}
                    onCloseAction={handleCloseDetailModal}
                />
            )}

            <style jsx>{`
                .invoice-management {
                    padding: 24px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .invoice-header h2 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 1.8rem;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #b59d3a;
                    color: white;
                }

                .btn-primary:hover {
                    background: #8b7a2e;
                }

                .btn-sm {
                    padding: 4px 8px;
                    font-size: 0.8rem;
                }

                .btn-info {
                    background: #2196f3;
                    color: white;
                }

                .btn-secondary {
                    background: #757575;
                    color: white;
                }

                .btn-success {
                    background: #4caf50;
                    color: white;
                }

                .invoice-filters {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    align-items: center;
                }

                .search-box {
                    position: relative;
                    flex: 1;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 40px 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.9rem;
                }

                .search-icon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
                }

                .filter-select {
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    background: white;
                }

                .invoice-table {
                    overflow-x: auto;
                }

                .invoice-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .invoice-table th,
                .invoice-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }

                .invoice-table th {
                    background: #f5f5f5;
                    font-weight: 600;
                    color: #333;
                }

                .invoice-code {
                    font-weight: 600;
                    color: #b59d3a;
                }

                .amount {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .action-buttons {
                    display: flex;
                    gap: 4px;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                .spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #b59d3a;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    margin: 0 0 8px 0;
                    color: #333;
                }

                .empty-state p {
                    margin: 0;
                    color: #666;
                }
            `}</style>
    </div>
  );
}