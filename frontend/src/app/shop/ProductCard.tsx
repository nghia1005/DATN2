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

}

interface ProductCardProps {
  product: ProductVariant;
  onSelect: (product: ProductVariant) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  // Tính giá sau giảm nếu có sale




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
        <Typography variant="body1" sx={{ color: '#e53935', fontWeight: 700 }}>
          {product.gia ? product.gia.toLocaleString('vi-VN') + '₫' : ''}
        </Typography>
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