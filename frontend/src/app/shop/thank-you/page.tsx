"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  IconButton,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  const invoiceCode = searchParams.get('invoiceCode');
  const email = searchParams.get('email');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('vi-VN'));
    
    // Clear cart after successful payment
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shop_cart');
      console.log('Cart cleared after successful payment');
    }
  }, []);

  const handleCopyInvoiceCode = async () => {
    if (invoiceCode) {
      try {
        await navigator.clipboard.writeText(invoiceCode);
        setCopied(true);
        toast.success('Đã sao chép mã đơn hàng!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Không thể sao chép mã đơn hàng');
      }
    }
  };

  const handleLookupOrder = () => {
    router.push('/shop?showOrderLookup=true');
  };

  const handleReturnToShop = () => {
    router.push('/shop');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success Banner */}
      <Alert 
        severity="success" 
        icon={<CheckCircleIcon />}
        sx={{ mb: 3, fontSize: 16 }}
      >
        Đặt hàng thành công
      </Alert>

      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: '#faf8f2' }}>
        {/* Thank You Message */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: '#d32f2f', 
            mb: 3,
            fontSize: { xs: '1.5rem', md: '2.125rem' }
          }}
        >
          Cảm ơn vì bạn đã đặt hàng
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: 18, 
            color: '#666', 
            mb: 4,
            lineHeight: 1.6
          }}
        >
          Đơn hàng của quý khách đã được thanh toán thành công và đang được xử lý. 
          SoleKing Store sẽ thông báo cho quý khách khi đơn hàng được giao.
        </Typography>

        {/* Order Details */}
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Thời gian tạo đơn: <span suppressHydrationWarning>{currentTime}</span>
          </Typography>
          {email && (
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              Email: {email}
            </Typography>
          )}
        </Box>

        {/* Order Code */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Mã đơn hàng của bạn:
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              mb: 2
            }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: '#fff3cd', 
                border: '2px solid #ffc107',
                borderRadius: 2,
                minWidth: 200
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#d32f2f',
                  fontFamily: 'monospace'
                }}
              >
                {invoiceCode || 'HD000000'}
              </Typography>
            </Paper>
            
            <IconButton 
              onClick={handleCopyInvoiceCode}
              sx={{ 
                bgcolor: copied ? '#4caf50' : '#f5f5f5',
                color: copied ? 'white' : '#666',
                '&:hover': {
                  bgcolor: copied ? '#45a049' : '#e0e0e0'
                }
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
            Vui lòng lưu lại mã này để tra cứu đơn hàng
          </Typography>
        </Box>

        {/* Tracking Instructions */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 4, 
            bgcolor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#495057' }}>
            📋 Hướng dẫn theo dõi đơn hàng:
          </Typography>
          
          <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: '#666' }}>
              Sử dụng mã đơn hàng trên để tra cứu trạng thái
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: '#666' }}>
              Đơn hàng sẽ được xử lý trong 1-2 ngày làm việc
            </Typography>
            <Typography component="li" variant="body2" sx={{ color: '#666' }}>
              Bạn sẽ nhận được thông báo qua email ({email || 'your-email@example.com'}) khi đơn hàng được giao
            </Typography>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/*<Button*/}
          {/*  variant="contained"*/}
          {/*  startIcon={<SearchIcon />}*/}
          {/*  onClick={handleLookupOrder}*/}
          {/*  sx={{*/}
          {/*    bgcolor: '#ffc107',*/}
          {/*    color: '#000',*/}
          {/*    fontWeight: 700,*/}
          {/*    px: 3,*/}
          {/*    py: 1.5,*/}
          {/*    '&:hover': {*/}
          {/*      bgcolor: '#e0a800'*/}
          {/*    }*/}
          {/*  }}*/}
          {/*>*/}
          {/*  TRA CỨU ĐƠN HÀNG*/}
          {/*</Button>*/}
          
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={handleReturnToShop}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              fontWeight: 700,
              px: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: '#333'
              }
            }}
          >
            QUAY LẠI MUA HÀNG
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
