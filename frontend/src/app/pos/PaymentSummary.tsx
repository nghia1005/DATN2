'use client';
import React from 'react';
import { CartItem } from './CartList';
import { Voucher } from './VoucherSelector';
import QrSelector from './QrSelector';

interface Props {
  cart: CartItem[];
  voucher: Voucher | null;
  shipping: number;
  originalShipping?: number;
  paymentMethod?: string;
  selectedQR?: any;
  onSelectQR?: (qr: any) => void;
}

export default function PaymentSummary({ cart, voucher, shipping, originalShipping = 0, paymentMethod, selectedQR, onSelectQR }: Props) {
  const total = cart.reduce((sum, item) => sum + item.gia * item.qty, 0);
  
  // Helper tính toán giảm giá
  const calculateDiscount = (voucher: Voucher | null, total: number, shipping: number, originalShipping: number): number => {
    if (!voucher) return 0;
    if (voucher.kieuGiamGia === 'PERCENT') {
      const discountAmount = (total * voucher.phanTramGiamGia) / 100;
      return voucher.giaTriToiDa > 0 ? 
        Math.min(discountAmount, voucher.giaTriToiDa) : 
        discountAmount;
    } else if (voucher.kieuGiamGia === 'FIXED') {
      return voucher.giaTriToiDa;
    } else if (voucher.kieuGiamGia === 'FREE_SHIP') {
      return originalShipping;
    }
    return 0;
  };
  
  // Kiểm tra xem voucher FREE_SHIP có thực sự áp dụng được không
  const isFreeShip = voucher && voucher.kieuGiamGia === 'FREE_SHIP' && total >= voucher.giaTriToiThieu;
  const discount = !isFreeShip ? calculateDiscount(voucher, total, shipping, originalShipping) : 0;
  const displayedShipping = isFreeShip ? 0 : Number(shipping || 0);
  const final = total - discount + displayedShipping;

  return (
    <div style={{ 
      margin: '16px 0', 
      background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)', 
      padding: 20, 
      borderRadius: 12,
      border: '1px solid rgba(181, 157, 58, 0.2)',
      boxShadow: '0 4px 16px rgba(181, 157, 58, 0.08)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        background: 'linear-gradient(135deg, rgba(181, 157, 58, 0.05) 0%, transparent 100%)',
        borderRadius: '0 12px 0 60px',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid rgba(181, 157, 58, 0.1)'
        }}>
          <span style={{ color: '#6b4f1d', fontWeight: 600 }}>Tổng tiền:</span>
          <span style={{ color: '#b59d3a', fontWeight: 700, fontSize: 16 }}>{(total || 0).toLocaleString()}đ</span>
        </div>
        
        {discount > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            <span style={{ color: '#6b4f1d', fontWeight: 600 }}>Giảm giá:</span>
            <span style={{ color: '#4caf50', fontWeight: 700, fontSize: 16 }}>-{discount.toLocaleString()}đ</span>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid rgba(181, 157, 58, 0.1)'
        }}>
          <span style={{ color: '#6b4f1d', fontWeight: 600 }}>Phí ship:</span>
          <span style={{ color: '#b59d3a', fontWeight: 700, fontSize: 16 }}>{(displayedShipping || 0).toLocaleString()}đ</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0 0 0',
          marginTop: 8,
          borderTop: '2px solid rgba(181, 157, 58, 0.2)',
          background: 'linear-gradient(135deg, rgba(181, 157, 58, 0.05) 0%, transparent 100%)',
          borderRadius: 8,
          paddingLeft: 12,
          paddingRight: 12
        }}>
          <span style={{ color: '#6b4f1d', fontWeight: 700, fontSize: 18 }}>Thanh toán:</span>
          <span style={{ 
            color: '#8a7a2a', 
            fontWeight: 800, 
            fontSize: 20,
            textShadow: '0 1px 2px rgba(181, 157, 58, 0.1)'
          }}>{(final || 0).toLocaleString()}đ</span>
        </div>
      </div>
    </div>
  );
} 