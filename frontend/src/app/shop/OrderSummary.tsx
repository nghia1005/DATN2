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
import QrSelector from '../pos/QrSelector';
import ProductImageCarousel from './ProductImageCarousel';
import VoucherSelector from './VoucherSelector';
import NCBPayment from './NCBPayment';

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
  showQRSelector: boolean;
  selectedQR: any;
  setShowQRSelector: (v: boolean) => void;
  setSelectedQR: (v: any) => void;
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
  showQRSelector,
  selectedQR,
  setShowQRSelector,
  setSelectedQR,
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
  const [showNCBPayment, setShowNCBPayment] = useState(false);

  const handlePaymentMethodChange = (method: string) => {
    setPayment(method);
    if (method === 'bank') {
      setShowNCBPayment(true);
    }
    // Bỏ logic mở modal MoMo - chỉ cần chọn radio
  };

  const handleNCBPaymentSuccess = async (transactionId: string) => {
    // Xử lý thanh toán thành công
    console.log('NCB Payment successful:', transactionId);
    
    // Gọi onPay để tạo hóa đơn và trừ số lượng sản phẩm
    try {
      await onPay();
    } catch (error) {
      console.error('Error creating invoice after NCB payment:', error);
      setCustomerFormError('Thanh toán thành công nhưng có lỗi khi tạo hóa đơn. Vui lòng liên hệ hỗ trợ!');
    }
  };

  const handleNCBPaymentError = (error: string) => {
    console.error('NCB Payment error:', error);
    setCustomerFormError('Thanh toán thất bại: ' + error);
  };

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
      {/* Phương thức thanh toán và nút thanh toán */}
      <Box sx={{ mt: 3 }}>
        <FormLabel>Phương thức thanh toán</FormLabel>
        <RadioGroup row value={payment} onChange={e => handlePaymentMethodChange(e.target.value)} sx={{ mb: 2 }}>
          <FormControlLabel value="cod" control={<Radio />} label="Thanh toán khi nhận hàng" />
          <FormControlLabel value="bank" control={<Radio />} label="Chuyển khoản NCB" />
          <FormControlLabel value="momo" control={<Radio />} label="💳 Thanh toán MoMo" />
        </RadioGroup>
      </Box>
      {/* QR Selector modal */}
      {showQRSelector && (
        <>
          {/* Chỉ hiện QrSelector khi chưa chọn QR */}
          {!selectedQR && (
            <QrSelector
              amount={needPay}
              autoOpen={true}
              onSelect={qr => { setSelectedQR(qr); }}
            />
          )}
          {/* Khi đã chọn QR, chỉ hiện thông tin QR lớn */}
          {selectedQR && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <div style={{ background: '#f5f5f5', borderRadius: 6, padding: 12, marginTop: 12, fontSize: 16 }}>
                <div style={{ fontWeight: 700 }}>
                  {selectedQR.bank} - {selectedQR.name}
                </div>
                <div>
                  STK: <b>{selectedQR.account}</b> ({selectedQR.bank})
                </div>
                <div>
                  Số tiền: <b>{needPay.toLocaleString()}đ</b>
                </div>
                <div>
                  Nội dung: Chuyển tiền thanh toán QR CODE
                </div>
                <img src={selectedQR.qrImage} alt={selectedQR.name} width={180} style={{ marginTop: 12, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
            </Box>
          )}
        </>
      )}
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

      {/* NCB Payment Dialog */}
      <NCBPayment
        open={showNCBPayment}
        onClose={() => setShowNCBPayment(false)}
        amount={needPay}
        onPaymentSuccess={handleNCBPaymentSuccess}
        onPaymentError={handleNCBPaymentError}
      />

      {/* Đã bỏ modal MoMo - xử lý trực tiếp trong nút thanh toán */}
    </Box>
  );
};

export default OrderSummary; 