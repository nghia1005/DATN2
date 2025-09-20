'use client';
import React from 'react';

interface Props {
  onCheckoutAction: () => void;
}

export default function CheckoutButton({ onCheckoutAction }: Props) {
  return (
    <button
      onClick={onCheckoutAction}
      style={{
        background: '#1976d2',
        color: '#fff',
        padding: '8px 24px',
        border: 'none',
        borderRadius: 4,
        fontSize: 16,
      }}
    >
      Xác nhận thanh toán & In hóa đơn
    </button>
  );
} 