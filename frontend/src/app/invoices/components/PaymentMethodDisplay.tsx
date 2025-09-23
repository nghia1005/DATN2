import React from 'react';

interface PaymentMethodDisplayProps {
  method: string;
  size?: 'small' | 'medium' | 'large';
}

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({ method, size = 'medium' }) => {
  const getPaymentInfo = (method: string) => {
    const normalizedMethod = String(method || '').toUpperCase();
    
    if (normalizedMethod.includes('MOMO')) {
      return { text: '💳 MOMO', color: '#d82d8b' };
    }
    
    if (normalizedMethod.includes('TIEN_MAT') || normalizedMethod.includes('TIỀN MẶT')) {
      return { text: '💰 Tiền mặt', color: '#27ae60' };
    }
    
    if (normalizedMethod.includes('CHUYEN_KHOAN') || normalizedMethod.includes('CHUYỂN KHOẢN')) {
      return { text: '🏦 Chuyển khoản', color: '#3498db' };
    }
    
    return { text: method || 'Chưa xác định', color: '#666' };
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

export default PaymentMethodDisplay;
