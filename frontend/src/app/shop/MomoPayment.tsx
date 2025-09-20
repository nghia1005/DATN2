import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';

interface MomoPaymentProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  checkoutData?: any; // Thêm checkout data
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function MomoPayment({ 
  open, 
  onClose, 
  amount, 
  checkoutData,
  onPaymentSuccess, 
  onPaymentError 
}: MomoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMomoTransaction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/momo/create-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          orderInfo: `Thanh toán đơn hàng - ${new Date().toLocaleString('vi-VN')}`,
          returnUrl: 'http://localhost:3002/shop?momo_return=true'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTransaction(result.data);
        // Lưu orderId vào localStorage để xử lý khi return
        console.log('💾 Saving pendingMomoOrderId to localStorage:', result.data.orderId);
        localStorage.setItem('pendingMomoOrderId', result.data.orderId);
        
        // Lưu checkout data để tạo hóa đơn sau khi thanh toán thành công
        if (checkoutData) {
          console.log('💾 Saving checkout data to localStorage:', checkoutData);
          localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        } else {
          console.log('⚠️ No checkout data provided');
        }
        
        // Verify data was saved
        console.log('🔍 Verification - pendingMomoOrderId saved:', localStorage.getItem('pendingMomoOrderId'));
        console.log('🔍 Verification - checkoutData saved:', localStorage.getItem('checkoutData'));
        // Redirect to MoMo payment page
        window.location.href = result.data.payUrl;
      } else {
        setError(result.message || 'Không thể tạo giao dịch MoMo');
        onPaymentError(result.message || 'Không thể tạo giao dịch MoMo');
      }
    } catch (err) {
      const errorMsg = 'Lỗi kết nối đến MoMo';
      setError(errorMsg);
      onPaymentError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTransaction(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#d82d8b',
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          💳 Thanh toán qua MoMo
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#d82d8b', mb: 1 }}>
            MoMo Payment
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
            Số tiền: {amount.toLocaleString('vi-VN')} VND
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất giao dịch.
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleCreateMomoTransaction}
            disabled={loading}
            sx={{
              bgcolor: '#d82d8b',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              py: 1.5,
              px: 4,
              '&:hover': {
                bgcolor: '#b71c5c'
              },
              '&:disabled': {
                bgcolor: '#ccc'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Tiếp tục thanh toán MoMo'
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
            💡 <strong>Lưu ý:</strong> Sau khi thanh toán thành công, bạn sẽ được chuyển về trang shop với thông báo thành công.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
