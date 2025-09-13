import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

interface ThankYouModalProps {
  showThankYou: boolean;
  setShowThankYou: (v: boolean) => void;
  setShowWelcome: (v: boolean) => void;
  invoiceCode?: string;
  customerEmail?: string;
}

export default function ThankYouModal({ showThankYou, setShowThankYou, setShowWelcome, invoiceCode, customerEmail }: ThankYouModalProps) {
  const handleCopyInvoiceCode = () => {
    if (invoiceCode) {
      navigator.clipboard.writeText(invoiceCode);
      toast.success('Đã copy mã đơn hàng vào clipboard!');
    }
  };

  if (!showThankYou) return null;
  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: 6, pb: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4, bgcolor: '#fff', borderRadius: 4, p: 4, boxShadow: 2, maxWidth: 700, position: 'relative' }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          bgcolor: '#b59d3a',
          color: '#fff',
          px: 3,
          py: 1,
          borderRadius: 2,
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          🎉 Đặt hàng thành công!
        </Box>
        <img src="/logo-login.png" alt="logo" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 16, boxShadow: '0 2px 12px #b59d3a22' }} />
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#b59d3a', mb: 1, letterSpacing: 1 }}>
          Cảm ơn vì bạn đã đặt hàng
        </Typography>
        <Typography variant="h6" sx={{ color: '#888', fontWeight: 500, mb: 2 }}>
          Đơn hàng của quý khách đã được thanh toán thành công và đang được xử lý. SoleKing Store sẽ thông báo cho quý khách khi đơn hàng được giao.
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2, fontStyle: 'italic' }}>
          Thời gian tạo đơn: {new Date().toLocaleString('vi-VN')}
        </Typography>
        {customerEmail && (
          <Typography variant="body2" sx={{ color: '#666', mb: 2, fontStyle: 'italic' }}>
            Email: {customerEmail}
          </Typography>
        )}
        <Box sx={{ 
          bgcolor: '#f8f9fa', 
          p: 2, 
          borderRadius: 2, 
          border: '1px solid #e9ecef',
          mb: 2,
          textAlign: 'left'
        }}>
          <Typography variant="body2" sx={{ color: '#495057', fontWeight: 600, mb: 1 }}>
            📋 Hướng dẫn theo dõi đơn hàng:
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.9rem', lineHeight: 1.5 }}>
            • Sử dụng mã đơn hàng trên để tra cứu trạng thái<br/>
            • Đơn hàng sẽ được xử lý trong 1-2 ngày làm việc<br/>
            • Bạn sẽ nhận được thông báo qua email {customerEmail ? `(${customerEmail})` : ''} khi đơn hàng được giao
          </Typography>
        </Box>
        {invoiceCode && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
              Mã đơn hàng của bạn:
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Typography variant="h4" sx={{ 
                color: '#b59d3a', 
                fontWeight: 900, 
                bgcolor: '#fffbe6', 
                p: 3, 
                pr: 6, // Thêm padding bên phải để chỗ cho nút copy
                borderRadius: 3, 
                border: '3px solid #f0e3b6',
                letterSpacing: 2,
                fontFamily: 'monospace',
                fontSize: '1.5rem'
              }}>
                {invoiceCode}
              </Typography>
              <IconButton
                onClick={handleCopyInvoiceCode}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#b59d3a',
                  '&:hover': {
                    backgroundColor: '#f0e3b6',
                  }
                }}
                title="Copy mã đơn hàng"
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ color: '#888', mt: 1, fontStyle: 'italic' }}>
              Vui lòng lưu lại mã này để tra cứu đơn hàng
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            sx={{ 
              borderColor: '#b59d3a', 
              color: '#b59d3a', 
              fontWeight: 600, 
              fontSize: 14,
              '&:hover': {
                borderColor: '#8b7a2e',
                backgroundColor: '#fffbe6'
              }
            }} 
            onClick={() => {
              // Chuyển hướng đến trang tra cứu đơn hàng
              if (typeof window !== 'undefined') {
                // Lưu mã đơn hàng vào localStorage để trang tra cứu có thể sử dụng
                localStorage.setItem('lastOrderCode', invoiceCode ?? '');
                // Chuyển đến trang tra cứu đơn hàng
                window.location.href = '/tra-cuu-don-hang';
              }
            }}
          >
            Tra cứu đơn hàng
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#222', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 16,
              '&:hover': {
                bgcolor: '#333'
              }
            }} 
            onClick={() => {
              setShowThankYou(false);
              setShowWelcome(true);
            }}
          >
            Quay lại mua hàng
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 