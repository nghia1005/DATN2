import React from "react";
import QRCode from "react-qr-code";

// Hàm chuyển tiếng Việt có dấu sang không dấu
function removeVietnameseTones(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

interface InvoicePreviewProps {
  order: any;
  maHoaDon: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ order, maHoaDon }) => {
  if (!order) return null;
  const tongTienSanPham = (order.chiTiet || []).reduce((sum: number, item: any) => sum + (item.gia || item.donGia) * (item.qty || item.soLuong), 0);
  const tongTien = order.tongTien ?? tongTienSanPham;
  const giamGia = order.giamGia ?? 0;
  const phiVanChuyen = order.phiShip ?? 0;
  const thanhToan = order.thanhTien ?? (tongTien - giamGia + phiVanChuyen);
  // QR code là link hóa đơn dùng IP LAN
  const qrLink = `http://192.168.1.219:3002/hoa-don/${maHoaDon}`;
  return (
    <div
      style={{
        width: 800,
        background: "#fff",
        color: "#222",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: 15,
        padding: 40,
        lineHeight: 1.7,
        margin: '32px auto',
        boxSizing: "border-box",
        border: '1.5px solid #e0e0e0',
        borderRadius: 18,
        boxShadow: '0 8px 32px #b59d3a22',
        minHeight: 600,
        maxWidth: '98vw',
      }}
    >
      {/* Header: Logo + Shop info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <div style={{ flex: 1, textAlign: 'left', fontSize: 16 }}>
          <div style={{ fontWeight: 500, color: '#333' }}>Shop bán giày sneaker SoleKing Store</div>
          <div style={{ color: '#555' }}>
            Địa chỉ: 13 P. Trịnh Văn Bô, Xuân Phương,<br/>
            Nam Từ Liêm, Hà Nội, Việt Nam
          </div>
          <div style={{ color: '#555' }}>Số điện thoại: 0365175821</div>
        </div>
        <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <img src="/logo-login.png" alt="SoleKing Store Logo" style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: 0 }} />
          <div style={{ fontWeight: 800, fontSize: 24, color: '#b8860b', letterSpacing: 1, fontFamily: 'inherit', marginTop: 4 }}>SoleKing Store</div>
        </div>
      </div>
      {/* Tiêu đề hóa đơn và số hóa đơn trên cùng một hàng, HÓA ĐƠN ở giữa */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '18px 0 0 0',
        width: '100%',
        marginBottom: 20
      }}>
        <div style={{ flex: 1 }}></div>
        <div style={{
          flex: 1,
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: 1,
          lineHeight: '40px',
          color: '#222',
          textAlign: 'center'
        }}>
          HÓA ĐƠN
        </div>
        <div style={{
          flex: 1,
          fontSize: 16,
          textAlign: 'right'
        }}>
          Số: <b>{maHoaDon || "..."}</b>
        </div>
      </div>
      {/* Thông tin khách hàng và nhân viên đối diện nhau */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, marginBottom: 12, fontSize: 16 }}>
        {/* Thông tin khách hàng bên trái */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="user">👤</span>
            Khách hàng: <b>{order.tenKhachHang || order.shippingInfo?.name || ''}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="phone">📞</span>
            SĐT: <b>{order.soDienThoaiKhachHang || order.shippingInfo?.phone || ''}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="address">🏠</span>
            Địa chỉ: <b>{order.shippingInfo?.address || ''}</b>
          </div>
        </div>
        {/* Thông tin nhân viên bên phải */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="staff" style={{ minWidth: 28, textAlign: 'center' }}>🧑‍💼</span>
            Nhân viên: <b>{typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}').tenNhanVien || ''}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="date" style={{ minWidth: 28, textAlign: 'center' }}>🗓️</span>
            Ngày mua: <b>{(() => {
              const now = new Date();
              const date = now.toLocaleDateString('vi-VN');
              const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
              return `${date} lúc ${time}`;
            })()}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="place" style={{ minWidth: 28, textAlign: 'center' }}>🏬</span>
            Nơi mua: <b>Tại cửa hàng</b>
          </div>
        </div>
      </div>
      {/* Bảng sản phẩm */}
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '18px 0 12px 0', fontSize: 15, background: '#faf9f6', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #b59d3a11' }}>
        <thead style={{ background: '#f5e9c6' }}>
          <tr>
            <th style={{ border: '1px solid #d1c7a1', padding: 8, width: 40 }}>STT</th>
            <th style={{ border: '1px solid #d1c7a1', padding: 8 }}>TÊN HÀNG</th>
            <th style={{ border: '1px solid #d1c7a1', padding: 8, width: 80 }}>Số Lượng</th>
            <th style={{ border: '1px solid #d1c7a1', padding: 8, width: 120 }}>Đơn Giá</th>
            <th style={{ border: '1px solid #d1c7a1', padding: 8, width: 130 }}>Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
          {(order.chiTiet || []).map((item: any, idx: number) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f6f1' }}>
              <td style={{ border: '1px solid #e0e0e0', padding: 8, textAlign: 'center', fontWeight: 500 }}>{idx + 1}</td>
              <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                <b>{item.tenSanPham}</b>
                <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                  {item.tenDanhMuc ? `${item.tenDanhMuc}` : ''}
                  {item.tenThuongHieu ? `, ${item.tenThuongHieu}` : ''}
                  {item.tenMauSac ? `, Màu ${item.tenMauSac}` : ''}
                  {item.tenKichCo ? `, Kích cỡ ${item.tenKichCo}` : ''}
                </div>
              </td>
              <td style={{ border: '1px solid #e0e0e0', padding: 8, textAlign: 'center' }}>{item.qty || item.soLuong}</td>
              <td style={{ border: '1px solid #e0e0e0', padding: 8, textAlign: 'right' }}>{(item.gia || item.donGia)?.toLocaleString()}đ</td>
              <td style={{ border: '1px solid #e0e0e0', padding: 8, textAlign: 'right', fontWeight: 500 }}>{((item.gia || item.donGia) * (item.qty || item.soLuong))?.toLocaleString()}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Tổng tiền sản phẩm */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, fontSize: 16 }}>
        <div style={{ minWidth: 120, textAlign: 'right' }}>Tổng tiền sản phẩm:</div>
        <div style={{ minWidth: 120, textAlign: 'right', fontWeight: 600 }}>{tongTienSanPham?.toLocaleString()}đ</div>
      </div>
      {/* Phí ship, giảm giá voucher và tổng cộng */}
      {order.giamGia > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, fontSize: 16 }}>
          <div style={{ minWidth: 120, textAlign: 'right' }}>Giảm giá:</div>
          <div style={{ minWidth: 120, textAlign: 'right', color: '#e74c3c', fontWeight: 600 }}>- {order.giamGia?.toLocaleString()}đ</div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, margin: '10px 0 0 0', fontSize: 16 }}>
        <div style={{ minWidth: 120, textAlign: 'right' }}>Phí ship:</div>
        <div style={{ minWidth: 120, textAlign: 'right', fontWeight: 600 }}>{order.phiShip?.toLocaleString() || '0'}đ</div>
      </div>
      {/* Tổng cộng */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', margin: '8px 0 18px 0' }}>
        <div style={{
          minWidth: 120,
          textAlign: 'right',
          fontSize: 22,
          fontWeight: 900,
          color: '#b8860b',
          letterSpacing: 1
        }}>
          TỔNG CỘNG:
        </div>
        <div style={{
          minWidth: 120,
          textAlign: 'right',
          fontSize: 22,
          fontWeight: 900,
          color: '#b8860b',
          letterSpacing: 1
        }}>
          {thanhToan?.toLocaleString() || '0'}đ
        </div>
      </div>
      {/* Ngày tháng, chữ ký, cảm ơn */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 36 }}>
        {/* Đã xóa dòng ngày tháng năm ở đây */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontStyle: 'italic', color: '#b8860b', fontWeight: 800, fontSize: 22, margin: '18px 0 2px 0', letterSpacing: 1 }}>
            Thank you! ❤️
          </div>
          <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>
            Nhóm SD-81
          </div>
        </div>
      </div>
      {/* Thông tin hỗ trợ cuối hóa đơn */}
      <div style={{
        marginTop: 32,
        paddingTop: 16,
        borderTop: '1px dashed #d1c7a1',
        textAlign: 'center',
        color: '#6b4f1d',
        fontSize: 15,
        lineHeight: 1.7
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Hỗ trợ khách hàng:</div>
        <div>📞 Hotline: <b>0365 175 821</b></div>
        <div>🌐 Fanpage: <a href="https://facebook.com/solekingstore" target="_blank" rel="noopener" style={{ color: '#b8860b', textDecoration: 'underline' }}>facebook.com/solekingstore</a></div>
        <div>✉️ Email: <a href="mailto:support@solekingstore.vn" style={{ color: '#b8860b', textDecoration: 'underline' }}>support@solekingstore.vn</a></div>
        <div>🏠 Địa chỉ: 13 P. Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội</div>
      </div>
    </div>
  );
};

export default InvoicePreview; 