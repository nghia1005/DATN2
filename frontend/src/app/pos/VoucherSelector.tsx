'use client';
import React from 'react';

export interface Voucher {
  idPhieuGiamGia: number;
  maPhieuGiamGia: string;
  tenPhieuGiamGia: string;
  kieuGiamGia: string;
  giaTriToiThieu: number;
  giaTriToiDa: number;
  soLuong: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  moTa: string;
  trangThai: string;
  phanTramGiamGia: number;
}

interface Props {
  vouchers: Voucher[];
  onSelectAction: (voucher: Voucher) => void;
  onCloseAction: () => void;
  allowFreeShip?: boolean;
}

export default function VoucherSelector({ vouchers, onSelectAction, onCloseAction, allowFreeShip = false }: Props) {
  // Lọc các voucher còn số lượng > 0, trạng thái ĐANG DIỄN RA và (nếu không cho phép thì không phải kiểu FREE_SHIP)
  const selectableVouchers = vouchers.filter(v => v.soLuong > 0 && v.trangThai === 'Đang diễn ra' && (allowFreeShip || v.kieuGiamGia !== 'FREE_SHIP'));
  
  // Helper hiển thị thông tin giảm giá
  const getDiscountInfo = (voucher: Voucher) => {
    if (voucher.kieuGiamGia === 'PERCENT') {
      return `${voucher.phanTramGiamGia}% (tối đa ${voucher.giaTriToiDa.toLocaleString()}đ)`;
    } else if (voucher.kieuGiamGia === 'FREE_SHIP') {
      return 'Miễn phí vận chuyển';
    } else if (voucher.kieuGiamGia === 'FIXED') {
      return `${voucher.giaTriToiDa.toLocaleString()}đ`;
    }
    return '';
  };
  
  return (
    <div style={{ background: '#eee', padding: 16, margin: '8px 0', borderRadius: 8 }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Chọn mã giảm giá</h4>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {selectableVouchers.length === 0 ? (
          <div style={{ color: 'gray', textAlign: 'center', padding: '20px' }}>
            Không còn mã giảm giá nào khả dụng
          </div>
        ) : (
          selectableVouchers.map(v => (
            <div key={v.idPhieuGiamGia} style={{ 
              background: 'white', 
              padding: '12px', 
              margin: '8px 0', 
              borderRadius: 6, 
              border: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                  {v.maPhieuGiamGia}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {v.tenPhieuGiamGia}
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  Giảm: <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{getDiscountInfo(v)}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Đơn hàng tối thiểu: {v.giaTriToiThieu.toLocaleString()}đ
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: 2 }}>
                  <b>Trạng thái:</b> {v.trangThai}
                </div>
              </div>
              <button 
                onClick={() => onSelectAction(v)} 
                style={{ 
                  background: '#3498db', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#2980b9'}
                onMouseOut={(e) => e.currentTarget.style.background = '#3498db'}
              >
                Chọn
              </button>
            </div>
          ))
        )}
      </div>
      <button 
        onClick={onCloseAction} 
        style={{ 
          background: '#95a5a6', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: 4, 
          cursor: 'pointer',
          marginTop: '12px',
          width: '100%'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#7f8c8d'}
        onMouseOut={(e) => e.currentTarget.style.background = '#95a5a6'}
      >
        Đóng
      </button>
    </div>
  );
} 