"use client";
import React from 'react';

interface OnlineInvoiceDetailProps {
    invoice: {
        idHoaDon: number;
        maHoaDon: string;
        ngayTao: string;
        tenKhachHang?: string;
        tongTien: number;
        trangThai: string;
        loaiDon?: string;
        thanhTien?: number;
        phiShip?: number;
        tenNguoiNhan?: string;
        soDienThoai?: string;
        diaChiNhanHang?: string;
        ghiChu?: string;
        chiTiet?: {
            tenSanPham: string;
            soLuong: number;
            donGia: number;
            thanhTien: number;
            danhMuc?: string;
            thuongHieu?: string;
            mauSac?: string;
            kichCo?: string;
        }[];
    };
    onCloseAction: () => void;
}

export default function OnlineInvoiceDetail({ invoice, onCloseAction }: OnlineInvoiceDetailProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        return "#757575"; // Tất cả trạng thái đều có màu xám
    };

    return (
        <div className="invoice-detail-modal">
            <div className="modal-overlay" onClick={onCloseAction}></div>
            <div className="modal-content">
                <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #e0e0e0', paddingBottom: 12 }}>
                    <img src="/soleking-logo.png" alt="SoleKing Store Logo" style={{ width: 80, height: 80, objectFit: 'contain', background: '#fff', borderRadius: 8, border: '1px solid #eee' }} />
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, color: '#b8860b', fontFamily: 'inherit', fontWeight: 800, letterSpacing: 1 }}>SoleKing Store</h2>
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: 16 }}>Shop bán giày sneaker</div>
                        <div style={{ color: '#555', fontSize: 15 }}>Địa chỉ: 13 P. Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam</div>
                        <div style={{ color: '#555', fontSize: 15 }}>Điện thoại: 0365175821</div>
                    </div>
                    <button className="close-btn" onClick={onCloseAction}>×</button>
                </div>
                <h3 style={{ textAlign: 'center', margin: '18px 0 8px 0', color: '#2c3e50', fontWeight: 700, letterSpacing: 1 }}>HÓA ĐƠN BÁN HÀNG ONLINE</h3>

                {!invoice || !invoice.idHoaDon ? (
                    <div style={{color: 'red', padding: 24}}>Không có dữ liệu hóa đơn!</div>
                ) : (
                    <div className="modal-body">
                        <div className="invoice-info">
                            <div className="info-row">
                                <span className="label">Mã hóa đơn:</span>
                                <span className="value">{invoice.maHoaDon}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Ngày tạo:</span>
                                <span className="value">{invoice.ngayTao ? new Date(invoice.ngayTao).toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}) : ''}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Khách hàng:</span>
                                <span className="value">{invoice.tenKhachHang}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Loại hóa đơn:</span>
                                <span className="value">
                                    {invoice.loaiDon === 'pos' ? '🏪 Tại quầy' : '💻 Online'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="label">Trạng thái:</span>
                                <span className="value status" style={{ 
                                    backgroundColor: getStatusColor(invoice.trangThai),
                                    color: '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {invoice.trangThai}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="label">Tổng tiền:</span>
                                <span className="value amount">{formatCurrency(invoice.thanhTien || invoice.tongTien)}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Người đại diện:</span>
                                <span className="value">Nhóm SD-81</span>
                            </div>
                        </div>

                        {/* Thông tin giao hàng cho hóa đơn online */}
                        {invoice.diaChiNhanHang && (
                            <div className="shipping-info">
                                <h4>Thông tin giao hàng</h4>
                                <div className="info-row">
                                    <span className="label">Người nhận:</span>
                                    <span className="value">{invoice.tenNguoiNhan}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Số điện thoại:</span>
                                    <span className="value">{invoice.soDienThoai}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Địa chỉ giao hàng:</span>
                                    <span className="value">{invoice.diaChiNhanHang}</span>
                                </div>
                                {invoice.ghiChu && (
                                    <div className="info-row">
                                        <span className="label">Ghi chú:</span>
                                        <span className="value">{invoice.ghiChu}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="invoice-items">
                            <h4>Chi tiết sản phẩm</h4>
                            <div className="items-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>TÊN HÀNG</th>
                                            <th>Số Lượng</th>
                                            <th>Đơn Giá</th>
                                            <th>Thành Tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoice.chiTiet || []).map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ textAlign: 'center', fontWeight: 500 }}>{idx + 1}</td>
                                                <td>
                                                    <b>{item.tenSanPham}</b>
                                                    <div style={{ color: '#555', fontSize: 14 }}>
                                                        {item.danhMuc}, {item.thuongHieu}, Màu {item.mauSac}, Kích cỡ {item.kichCo}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{item.soLuong}</td>
                                                <td>{formatCurrency(item.donGia)}</td>
                                                <td>{formatCurrency(item.thanhTien)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tổng kết thanh toán */}
                        <div className="payment-summary">
                            <h4>Tổng kết thanh toán</h4>
                            <div className="info-row">
                                <span className="label">Tổng tiền sản phẩm:</span>
                                <span className="value">{formatCurrency(invoice.tongTien)}</span>
                            </div>
                            {invoice.phiShip && invoice.phiShip > 0 && (
                                <div className="info-row">
                                    <span className="label">Phí vận chuyển:</span>
                                    <span className="value">{formatCurrency(invoice.phiShip)}</span>
                                </div>
                            )}
                            <div className="info-row total-row">
                                <span className="label">Tổng cộng:</span>
                                <span className="value amount">{formatCurrency(invoice.thanhTien || invoice.tongTien)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCloseAction}>
                        Đóng
                    </button>
                    <button className="btn btn-primary">
                        🖨️ In hóa đơn
                    </button>
                    <button className="btn btn-success">
                        📥 Xuất PDF
                    </button>
                </div>
            </div>

            <style jsx>{`
                .invoice-detail-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                }

                .modal-content {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 1.4rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }

                .modal-body {
                    padding: 24px;
                }

                .invoice-info {
                    margin-bottom: 24px;
                }

                .shipping-info {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                }

                .shipping-info h4 {
                    margin: 0 0 16px 0;
                    color: #2c3e50;
                    font-size: 1.2rem;
                }

                .payment-summary {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                }

                .payment-summary h4 {
                    margin: 0 0 16px 0;
                    color: #2c3e50;
                    font-size: 1.2rem;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .total-row {
                    border-top: 2px solid #b59d3a;
                    padding-top: 12px;
                    margin-top: 8px;
                    font-weight: 700;
                }

                .label {
                    font-weight: 600;
                    color: #666;
                    min-width: 120px;
                }

                .value {
                    color: #2c3e50;
                    font-weight: 500;
                }

                .value.status {
                    color: #4caf50;
                    font-weight: 600;
                }

                .value.amount {
                    color: #b59d3a;
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .invoice-items h4 {
                    margin: 0 0 16px 0;
                    color: #2c3e50;
                    font-size: 1.2rem;
                }

                .items-table {
                    overflow-x: auto;
                }

                .items-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .items-table th,
                .items-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }

                .items-table th {
                    background: #f5f5f5;
                    font-weight: 600;
                    color: #333;
                    font-size: 0.9rem;
                }

                .items-table td {
                    font-size: 0.9rem;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 20px 24px;
                    border-top: 1px solid #e0e0e0;
                    background: #f9f9f9;
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

                .btn-secondary {
                    background: #757575;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #616161;
                }

                .btn-success {
                    background: #4caf50;
                    color: white;
                }

                .btn-success:hover {
                    background: #45a049;
                }
            `}</style>
        </div>
    );
} 