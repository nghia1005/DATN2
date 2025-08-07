import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
  phanTramGiamGia?: number;
  trangThaiSale?: string;
}

interface ProductCardProps {
  product: ProductVariant;
  onSelect: (product: ProductVariant) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  // Tính giá sau giảm nếu có sale
  const calculateSalePrice = (originalPrice: number, discountPercent: number) => {
    return originalPrice - (originalPrice * discountPercent / 100);
  };

  // Kiểm tra sản phẩm có đang sale không
  const isOnSale = product.trangThaiSale === 'ACTIVE' && product.phanTramGiamGia && product.phanTramGiamGia > 0;

  return (
    <Box
      sx={{
        border: '1px solid #f0e3b6',
        borderRadius: 3,
        bgcolor: '#fffbe6',
        p: 2,
        mb: 2,
        boxShadow: '0 2px 8px #b59d3a11',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 16px #b59d3a22' },
      }}
      onClick={() => onSelect(product)}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Badge Sale */}
        {isOnSale && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              zIndex: 3,
              background: '#e53935',
              color: '#fff',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            -{product.phanTramGiamGia}%
          </Box>
        )}
        
        <div onClick={e => e.stopPropagation()}>
          <ProductImageCarousel
            idChiTietSanPham={product.idChiTietSanPham}
            defaultImage={product.duongDanHinhAnh}
            alt={product.tenSanPham}
            style={{ width: 140, height: 110, objectFit: 'contain', borderRadius: 8, background: '#fff', marginBottom: 12, border: '1px solid #eee' }}
          />
        </div>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#b59d3a', mb: 1, textAlign: 'center' }}>
        {product.tenSanPham}
      </Typography>
      <Typography variant="body2" sx={{ color: '#888', mb: 1, textAlign: 'center' }}>
        {product.tenThuongHieu} | {product.tenMauSac} | Size: {product.tenKichCo}
      </Typography>
      {/* Hiển thị số lượng còn trong kho */}
      <Typography variant="body2" sx={{ color: '#b48a00', fontWeight: 600, mb: 1, textAlign: 'center' }}>
        Kho: {product.soLuong ?? 0}
      </Typography>
      {/* Hiển thị giá */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        {isOnSale ? (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                textDecoration: 'line-through', 
                color: '#999', 
                fontSize: '14px',
                mb: 0.5
              }}
            >
              {product.gia ? product.gia.toLocaleString('vi-VN') + '₫' : ''}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#e53935', 
                fontWeight: 700, 
                fontSize: '16px'
              }}
            >
              {calculateSalePrice(product.gia, product.phanTramGiamGia || 0).toLocaleString('vi-VN') + '₫'}
            </Typography>
          </>
        ) : (
          <Typography variant="body1" sx={{ color: '#e53935', fontWeight: 700 }}>
            {product.gia ? product.gia.toLocaleString('vi-VN') + '₫' : ''}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        sx={{ bgcolor: '#b59d3a', color: '#fff', fontWeight: 700, px: 3, fontSize: 15, mt: 1 }}
        onClick={e => {
          e.stopPropagation();
          onSelect(product);
        }}
      >
        Xem chi tiết
      </Button>
    </Box>
  );
};

export default ProductCard; 