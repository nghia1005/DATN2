import React from 'react';

interface PaymentMethodBadgeProps {
  method: string;
  size?: 'small' | 'medium' | 'large';
}

const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method, size = 'medium' }) => {
  const getPaymentInfo = (method: string) => {
    const normalizedMethod = method?.toUpperCase() || 'TIEN_MAT';
    
    switch(normalizedMethod) {
      case 'MOMO':
        return { text: '💳 MOMO', color: '#d82d8b' };
      case 'TIEN_MAT':
      case 'TIỀN MẶT':
        return { text: '💰 Tiền mặt', color: '#27ae60' };
      case 'CHUYEN_KHOAN':
      case 'CHUYỂN KHOẢN':
        return { text: '🏦 Chuyển khoản', color: '#3498db' };
      default:
        return { text: method || 'Chưa xác định', color: '#666' };
    }
  };

  const sizeStyles = {
    small: { fontSize: '11px', padding: '2px 6px' },
    medium: { fontSize: '12px', padding: '3px 8px' },
    large: { fontSize: '14px', padding: '4px 10px' }
  };

  const paymentInfo = getPaymentInfo(method);

  return (
    <span 
      style={{
        backgroundColor: `${paymentInfo.color}15`,
        color: paymentInfo.color,
        borderRadius: '4px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        ...sizeStyles[size]
      }}
    >
      {paymentInfo.text}
    </span>
  );
};

export default PaymentMethodBadge;
