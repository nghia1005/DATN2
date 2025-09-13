import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ProductImageCarousel from './ProductImageCarousel';
import VoucherSelector from './VoucherSelector';

interface ProductVariant {
  idChiTietSanPham: number;
  idSanPham: number;
  maSanPham: string;
  tenSanPham: string;
  tenThuongHieu: string;
  tenDanhMuc: string;
  duongDanHinhAnh?: string;
  moTa?: string;
  trangThai?: string;
  idMauSac?: number;
  tenMauSac?: string;
  idKichCo?: number;
  tenKichCo?: string;
  gia: number;
  soLuong?: number;
  idDanhMuc?: number;
  // Thêm field sale

}

interface OrderSummaryProps {
  checkoutItems: Array<{ product: ProductVariant; quantity: number }>;
  customerInfo: any;
  calcCheckout: (items: Array<{ product: ProductVariant; quantity: number }>, voucher: string) => { total: number; discount: number; ship: number; needPay: number };
  onPay: () => Promise<void>;
  onBack: () => void;
  customerFormError: string;
  setCustomerFormError: (v: string) => void;
  payment: string;
  setPayment: (v: string) => void;
  selectedVoucher: any;
  onVoucherChange: (voucher: any) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  checkoutItems,
  customerInfo,
  calcCheckout,
  onPay,
  onBack,
  customerFormError,
  setCustomerFormError,
  payment,
  setPayment,
  selectedVoucher,
  onVoucherChange
}) => {
  const { total, discount, ship, needPay } = calcCheckout(checkoutItems, customerInfo.voucher);
  

  // Đã bỏ các hàm xử lý MoMo - xử lý trực tiếp trong nút thanh toán
  return (
    <Box sx={{ flex: 1, bgcolor: '#faf8f2', borderRadius: 2, p: 3, minWidth: 320 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>ĐƠN ĐẶT HÀNG CỦA BẠN</Typography>
      
      <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 'none', border: '1px solid #eee' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 14 }}>SẢN PHẨM</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: 14 }}>SỐ LƯỢNG</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: 14 }}>ĐƠN GIÁ</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 14 }}>THÀNH TIỀN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkoutItems.map((item, idx) => (
              <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ProductImageCarousel
                      idChiTietSanPham={item.product.idChiTietSanPham}
                      defaultImage={item.product.duongDanHinhAnh}
                      alt={item.product.tenSanPham}
                      style={{ width: 50, height: 50, objectFit: 'contain', borderRadius: 6, border: '1px solid #eee', background: '#fafafa' }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
                        {item.product.tenSanPham}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ 
                          backgroundColor: '#f0f0f0', 
                          px: 1, 
                          py: 0.3, 
                          borderRadius: 1, 
                          fontSize: 11,
                          color: '#666'
                        }}>
                          {item.product.tenThuongHieu}
                        </Box>
                        <Box sx={{ 
                          backgroundColor: '#e3f2fd', 
                          px: 1, 
                          py: 0.3, 
                          borderRadius: 1, 
                          fontSize: 11,
                          color: '#1976d2'
                        }}>
                          {item.product.tenKichCo}
                        </Box>
                        <Box sx={{ 
                          backgroundColor: '#fff3e0', 
                          px: 1, 
                          py: 0.3, 
                          borderRadius: 1, 
                          fontSize: 11,
                          color: '#f57c00'
                        }}>
                          {item.product.tenMauSac}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.quantity}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.product.gia?.toLocaleString('vi-VN')} ₫
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                    {(item.product.gia * item.quantity).toLocaleString('vi-VN')} ₫
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Voucher Selector */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <VoucherSelector
          selectedVoucher={selectedVoucher}
          onVoucherChange={onVoucherChange}
          totalAmount={total}
        />
      </Box>
      
      {/* Tổng kết */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontSize: 16 }}>
        <span>Tổng tiền</span>
        <span style={{ color: '#d32f2f', fontWeight: 700 }}>{total.toLocaleString('vi-VN')} VND</span>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
        <span>Tiền giảm</span>
        <span style={{ color: '#d32f2f', fontWeight: 700 }}>-{discount.toLocaleString('vi-VN')} VND</span>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
        <span>Tiền ship</span>
        <span style={{ color: '#d32f2f', fontWeight: 700 }}>{ship.toLocaleString('vi-VN')} VND</span>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, fontSize: 18, fontWeight: 800 }}>
        <span>Tiền cần thanh toán</span>
        <span style={{ color: '#d32f2f', fontWeight: 800, fontSize: 20 }}>{needPay.toLocaleString('vi-VN')} VND</span>
      </Box>
      {/* Hiển thị lỗi validation */}
      {customerFormError && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
            ⚠️ {customerFormError}
          </Typography>
        </Box>
      )}

      {/* Phương thức thanh toán và nút thanh toán */}
      <Box sx={{ mt: 3 }}>
        <FormLabel>Phương thức thanh toán</FormLabel>
        <RadioGroup row value={payment} onChange={e => setPayment(e.target.value)} sx={{ mb: 2 }}>
          <FormControlLabel value="cod" control={<Radio />} label="Thanh toán khi nhận hàng" />
          <FormControlLabel value="momo" control={<Radio />} label="💳 Thanh toán MoMo" />
        </RadioGroup>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
        <Button
          type="button"
          variant="contained"
          sx={{ bgcolor: '#222', color: '#fff', fontWeight: 700, fontSize: 18, py: 1.5, minWidth: 160 }}
          onClick={async () => {
            if (payment === 'momo') {
              // Xử lý thanh toán MoMo trực tiếp
              try {
                const response = await fetch('http://localhost:8080/api/momo/create-shop', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    amount: needPay,
                    orderInfo: `Thanh toán đơn hàng - ${new Date().toLocaleString('vi-VN')}`,
                    returnUrl: 'http://localhost:3002/shop?momo_return=true'
                  }),
                });

                const result = await response.json();
                
                if (result.success) {
                  // Lưu orderId vào localStorage để xử lý khi return
                  localStorage.setItem('pendingMomoOrderId', result.data.orderId);
                  
                  // Lưu checkout data để tạo hóa đơn sau khi thanh toán thành công
                  const checkoutData = {
                    tenNguoiNhan: customerInfo.name,
                    soDienThoai: customerInfo.phone,
                    email: customerInfo.email,
                    diaChiNhanHang: `${customerInfo.address}, ${customerInfo.ward}, ${customerInfo.district}, ${customerInfo.city}`,
                    chiTiet: checkoutItems.map(item => ({
                      idChiTietSanPham: item.product.idChiTietSanPham,
                      soLuong: item.quantity,
                      donGia: item.product.gia,
                      thanhTien: item.product.gia * item.quantity
                    })),
                    tongTien: needPay,
                    loaiDon: 'Online',
                    phuongThucThanhToan: 'MOMO'
                  };
                  localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
                  
                  // Redirect to MoMo payment page
                  window.location.href = result.data.payUrl;
                } else {
                  setCustomerFormError(result.message || 'Không thể tạo giao dịch MoMo');
                }
              } catch (err) {
                setCustomerFormError('Lỗi kết nối đến MoMo');
              }
            } else {
              // Xử lý các phương thức thanh toán khác
              await onPay();
            }
          }}
          disabled={!!customerFormError}
        >
          {payment === 'momo' ? '💳 THANH TOÁN MOMO' : 'THANH TOÁN'}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button
          variant="outlined"
          sx={{ fontWeight: 700, color: '#b48a00', borderColor: '#b48a00', minWidth: 120 }}
          onClick={onBack}
        >
          ← Quay lại
        </Button>
      </Box>
      

      {/* Đã bỏ modal MoMo - xử lý trực tiếp trong nút thanh toán */}
    </Box>
  );
};

export default OrderSummary; 