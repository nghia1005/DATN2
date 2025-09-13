import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import ProductImageCarousel from './ProductImageCarousel';

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

interface CartProps {
  cart: Array<{ product: ProductVariant; quantity: number }>;
  selectedCartIndexes: number[];
  setSelectedCartIndexes: React.Dispatch<React.SetStateAction<number[]>>;
  setCart: React.Dispatch<React.SetStateAction<Array<{ product: ProductVariant; quantity: number }>>>;
  setShowCart: (v: boolean) => void;
  setShowWelcome: (v: boolean) => void;
  onCheckout?: () => void;
}

export default function Cart({ cart, selectedCartIndexes, setSelectedCartIndexes, setCart, setShowCart, setShowWelcome, onCheckout }: CartProps) {
  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, mb: 6, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #b59d3a22', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#b59d3a' }}>GIỎ HÀNG</Typography>
        <Button variant="text" sx={{ color: '#b48a00', fontWeight: 700, fontSize: 22 }} onClick={() => setShowCart(false)}>ĐÓNG</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box sx={{ flex: 2 }}>
          <Box sx={{ display: 'flex', fontWeight: 700, color: '#888', mb: 2, fontSize: 17, alignItems: 'center' }}>
            <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
              <Checkbox
                checked={selectedCartIndexes.length === cart.length && cart.length > 0}
                indeterminate={selectedCartIndexes.length > 0 && selectedCartIndexes.length < cart.length}
                onChange={e => {
                  if (e.target.checked) setSelectedCartIndexes(cart.map((_, idx) => idx));
                  else setSelectedCartIndexes([]);
                }}
              />
            </Box>
            <Box sx={{ flex: 3 }}>SẢN PHẨM</Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>SỐ LƯỢNG</Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>TỔNG TIỀN</Box>
          </Box>
          {cart.map((item, idx) => (
            <Box key={item.product.idChiTietSanPham} sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', py: 2 }}>
              <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                <Checkbox
                  checked={selectedCartIndexes.includes(idx)}
                  onChange={e => {
                    if (e.target.checked) setSelectedCartIndexes((prev: number[]) => [...prev, idx]);
                    else setSelectedCartIndexes((prev: number[]) => prev.filter((i: number) => i !== idx));
                  }}
                />
              </Box>
              <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ProductImageCarousel
                  idChiTietSanPham={item.product.idChiTietSanPham}
                  defaultImage={item.product.duongDanHinhAnh}
                  alt={item.product.tenSanPham}
                  style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 6, border: '1px solid #eee', background: '#fafafa', marginRight: 8 }}
                />
                <Box>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{item.product.tenSanPham}</div>
                  <div style={{ color: '#888', fontSize: 15 }}>
                    [{item.product.tenKichCo} + {item.product.tenMauSac}]
                  </div>
                  <div style={{ 
                    color: item.quantity > (item.product.soLuong ?? 0) ? '#d32f2f' : '#b48a00', 
                    fontWeight: 600, 
                    fontSize: 14 
                  }}>
                    Kho: {item.product.soLuong ?? 0}
                    {item.quantity > (item.product.soLuong ?? 0) && (
                      <span style={{ color: '#d32f2f', fontWeight: 700, marginLeft: 8 }}>
                        ⚠️ Không đủ hàng!
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#d32f2f', fontWeight: 700, fontSize: 16 }}>{item.product.gia?.toLocaleString('vi-VN')} VND</div>
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Button variant="outlined" size="small" sx={{ minWidth: 28, px: 0, fontWeight: 700, borderColor: '#b48a00', color: '#b48a00' }}
                  onClick={() => setCart((cart: Array<{ product: ProductVariant; quantity: number }>) => cart.map((c, i) => i === idx ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))}
                  disabled={item.quantity <= 1}
                >-</Button>
                <span style={{ width: 32, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>{item.quantity}</span>
                <Button variant="outlined" size="small" sx={{ minWidth: 28, px: 0, fontWeight: 700, borderColor: '#b48a00', color: '#b48a00' }}
                  onClick={() => setCart((cart: Array<{ product: ProductVariant; quantity: number }>) => cart.map((c, i) => i === idx ? { ...c, quantity: c.product.soLuong ? Math.min(c.product.soLuong, c.quantity + 1) : c.quantity + 1 } : c))}
                  disabled={item.product.soLuong ? item.quantity >= item.product.soLuong : false}
                >+</Button>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'right', fontWeight: 700, color: '#d32f2f', fontSize: 17 }}>
                {(item.product.gia ? item.product.gia * item.quantity : 0).toLocaleString('vi-VN')} VND
              </Box>
              <Button variant="text" color="error" sx={{ ml: 2, fontWeight: 700, fontSize: 22 }} onClick={() => {
                setCart((cart: Array<{ product: ProductVariant; quantity: number }>) => cart.filter((_, i) => i !== idx));
                setSelectedCartIndexes((selected: number[]) => selected.filter((i: number) => i !== idx).map((i: number) => i > idx ? i - 1 : i));
              }}>×</Button>
            </Box>
          ))}
          <Button variant="outlined" sx={{ mt: 3, fontWeight: 700, color: '#222', borderColor: '#b48a00' }} onClick={() => { setShowCart(false); setShowWelcome(false); }}>
            TIẾP TỤC MUA SẮM
          </Button>
        </Box>
        <Box sx={{ flex: 1, bgcolor: '#faf8f2', borderRadius: 2, p: 3, minWidth: 260 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#b59d3a', mb: 2 }}>TỔNG GIỎ HÀNG</Typography>
          
          {/* Thông báo cảnh báo về tình trạng tồn kho */}
          {cart.some(item => item.quantity > (item.product.soLuong ?? 0)) && (
            <Box sx={{ 
              bgcolor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: 2, 
              p: 2, 
              mb: 2,
              color: '#856404'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ⚠️ Cảnh báo: Một số sản phẩm vượt quá số lượng tồn kho!
              </Typography>
              <Typography variant="caption" sx={{ color: '#856404' }}>
                Vui lòng điều chỉnh số lượng hoặc xóa sản phẩm không có đủ hàng trước khi thanh toán.
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: 16 }}>
            <span>Tổng tiền</span>
            <span style={{ color: '#d32f2f', fontWeight: 700 }}>
              {cart.reduce((sum, item, idx) => selectedCartIndexes.includes(idx) ? sum + (item.product.gia || 0) * item.quantity : sum, 0).toLocaleString('vi-VN')} VND
            </span>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: 16 }}>
            <span>Tiền phải trả</span>
            <span style={{ color: '#d32f2f', fontWeight: 700 }}>
              {cart.reduce((sum, item, idx) => selectedCartIndexes.includes(idx) ? sum + (item.product.gia || 0) * item.quantity : sum, 0).toLocaleString('vi-VN')} VND
            </span>
          </Box>
          <Button
            variant="contained"
            sx={{ 
              width: '100%', 
              bgcolor: cart.some(item => item.quantity > (item.product.soLuong ?? 0)) ? '#ccc' : '#222', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 17, 
              mt: 2 
            }}
            disabled={selectedCartIndexes.length === 0 || cart.some(item => item.quantity > (item.product.soLuong ?? 0))}
            onClick={onCheckout}
          >
            {cart.some(item => item.quantity > (item.product.soLuong ?? 0)) ? 'KHÔNG THỂ THANH TOÁN' : 'THANH TOÁN'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 