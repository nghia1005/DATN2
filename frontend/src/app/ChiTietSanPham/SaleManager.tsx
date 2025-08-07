import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import ProductImageCarousel from '../shop/ProductImageCarousel';

interface ProductVariant {
  idChiTietSanPham: number;
  tenSanPham: string;
  tenThuongHieu: string;
  tenMauSac: string;
  tenKichCo: string;
  duongDanHinhAnh?: string;
  gia: number;
  phanTramGiamGia: number;
  trangThaiSale: string;
  trangThai: string;
  soLuong: number;
}

export default function SaleManager() {
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
      if (response.ok) {
        const data = await response.json();
        // Chỉ hiển thị sản phẩm có trangThai = 'Đang bán'
        const activeProducts = data.filter((product: ProductVariant) => 
          product.trangThai === 'Đang bán'
        );
        setProducts(activeProducts || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Lỗi khi tải danh sách sản phẩm' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaleToggle = async (productId: number, isActive: boolean) => {
    setSaving(prev => ({ ...prev, [productId]: true }));
    try {
      const product = products.find(p => p.idChiTietSanPham === productId);
      if (!product) return;

      const response = await fetch(`http://localhost:8080/chi-tiet-san-pham/set-sale/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          phanTramGiamGia: product.phanTramGiamGia.toString(),
          trangThaiSale: isActive ? 'ACTIVE' : 'INACTIVE'
        })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.idChiTietSanPham === productId 
            ? { ...p, trangThaiSale: isActive ? 'ACTIVE' : 'INACTIVE' }
            : p
        ));
        setMessage({ type: 'success', text: 'Cập nhật trạng thái sale thành công' });
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật trạng thái sale' });
      }
    } catch (error) {
      console.error('Error updating sale status:', error);
      setMessage({ type: 'error', text: 'Lỗi khi cập nhật trạng thái sale' });
    } finally {
      setSaving(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleDiscountChange = async (productId: number, discount: number) => {
    setSaving(prev => ({ ...prev, [productId]: true }));
    try {
      const product = products.find(p => p.idChiTietSanPham === productId);
      if (!product) return;

      const response = await fetch(`http://localhost:8080/chi-tiet-san-pham/set-sale/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          phanTramGiamGia: discount.toString(),
          trangThaiSale: product.trangThaiSale
        })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.idChiTietSanPham === productId 
            ? { ...p, phanTramGiamGia: discount }
            : p
        ));
        setMessage({ type: 'success', text: 'Cập nhật phần trăm giảm giá thành công' });
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật phần trăm giảm giá' });
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      setMessage({ type: 'error', text: 'Lỗi khi cập nhật phần trăm giảm giá' });
    } finally {
      setSaving(prev => ({ ...prev, [productId]: false }));
    }
  };

  const calculateSalePrice = (originalPrice: number, discountPercent: number) => {
    return originalPrice - (originalPrice * discountPercent / 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#b59d3a' }}>
        Quản lý Sale Sản phẩm
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>Sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thông tin</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giá gốc</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giảm giá (%)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giá sau giảm</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái Sale</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.idChiTietSanPham} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ProductImageCarousel
                      idChiTietSanPham={product.idChiTietSanPham}
                      defaultImage={product.duongDanHinhAnh}
                      alt={product.tenSanPham}
                      style={{ 
                        width: 60, 
                        height: 60, 
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.tenSanPham}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {product.tenThuongHieu}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {product.tenMauSac} | Size: {product.tenKichCo}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Kho: {product.soLuong}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.gia.toLocaleString('vi-VN')}₫
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={product.phanTramGiamGia || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0 && value <= 100) {
                        handleDiscountChange(product.idChiTietSanPham, value);
                      }
                    }}
                    disabled={saving[product.idChiTietSanPham]}
                    sx={{ width: 80 }}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700,
                      color: product.phanTramGiamGia > 0 ? '#e53935' : 'inherit'
                    }}
                  >
                    {calculateSalePrice(product.gia, product.phanTramGiamGia).toLocaleString('vi-VN')}₫
                  </Typography>
                  {product.phanTramGiamGia > 0 && (
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>
                      Tiết kiệm: {(product.gia * product.phanTramGiamGia / 100).toLocaleString('vi-VN')}₫
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={product.trangThaiSale === 'ACTIVE'}
                      onChange={(e) => handleSaleToggle(product.idChiTietSanPham, e.target.checked)}
                      disabled={saving[product.idChiTietSanPham]}
                    />
                    <Chip
                      label={product.trangThaiSale === 'ACTIVE' ? 'Đang Sale' : 'Không Sale'}
                      color={product.trangThaiSale === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {saving[product.idChiTietSanPham] && (
                    <CircularProgress size={20} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, color: '#b59d3a' }}>
          Hướng dẫn sử dụng:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Giảm giá (%):</strong> Nhập số từ 0-100 để set phần trăm giảm giá
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Trạng thái Sale:</strong> Bật/tắt để hiển thị sản phẩm trong phần Sale
        </Typography>
        <Typography variant="body2">
          • <strong>Lưu ý:</strong> Chỉ sản phẩm có trạng thái "Đang Sale" mới hiển thị ở trang chủ
        </Typography>
      </Box>
    </Box>
  );
} 