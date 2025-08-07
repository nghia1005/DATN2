import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import ProductImageCarousel from './ProductImageCarousel';

interface SaleProduct {
  idChiTietSanPham: number;
  tenSanPham: string;
  tenThuongHieu: string;
  tenMauSac: string;
  tenKichCo: string;
  duongDanHinhAnh?: string;
  gia: number;
  phanTramGiamGia: number;
  trangThaiSale: string;
  soLuong: number;
}

interface SaleProductListProps {
  onProductSelect?: (product: SaleProduct) => void;
}

export default function SaleProductList({ onProductSelect }: SaleProductListProps) {
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/chi-tiet-san-pham/sale');
      if (response.ok) {
        const data = await response.json();
        console.log('Raw sale data from API:', data);
        
        // Chỉ lấy sản phẩm có trangThaiSale = 'ACTIVE'
        const activeSaleProducts = data.filter((product: SaleProduct) => {
          console.log('Checking product:', product.tenSanPham, 'trangThaiSale:', product.trangThaiSale, 'phanTramGiamGia:', product.phanTramGiamGia);
          return product.trangThaiSale === 'ACTIVE' && product.phanTramGiamGia > 0;
        });
        
        console.log('Filtered active sale products:', activeSaleProducts);
        setSaleProducts(activeSaleProducts || []);
      }
    } catch (error) {
      console.error('Error fetching sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính giá sau giảm
  const calculateSalePrice = (originalPrice: number, discountPercent: number) => {
    return originalPrice - (originalPrice * discountPercent / 100);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Đang tải sản phẩm sale...</Typography>
      </Box>
    );
  }

  // Nếu không có sản phẩm sale, không hiển thị gì
  if (saleProducts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 700, 
        color: '#b59d3a',
        textAlign: 'center'
      }}>
        🎯 Sản phẩm đang Sale
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3
      }}>
        {saleProducts.map((product) => (
          <Card
            key={product.idChiTietSanPham}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {/* Badge Sale */}
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                zIndex: 3,
                background: '#e53935',
                color: '#fff',
                borderRadius: '50%',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              -{product.phanTramGiamGia}%
            </Box>

            {/* Product Image */}
            <Box sx={{ position: 'relative', height: 200 }}>
              <ProductImageCarousel
                idChiTietSanPham={product.idChiTietSanPham}
                defaultImage={product.duongDanHinhAnh}
                alt={product.tenSanPham}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8
                }}
              />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '16px' }}>
                {product.tenSanPham}
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                {product.tenThuongHieu} | {product.tenMauSac} | Size: {product.tenKichCo}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'line-through',
                    color: '#999',
                    fontSize: '14px'
                  }}
                >
                  {product.gia.toLocaleString('vi-VN')}₫
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#e53935',
                    fontWeight: 700,
                    fontSize: '18px'
                  }}
                >
                  {calculateSalePrice(product.gia, product.phanTramGiamGia).toLocaleString('vi-VN')}₫
                </Typography>
              </Box>

              <Chip
                label={`Tiết kiệm ${(product.gia * product.phanTramGiamGia / 100).toLocaleString('vi-VN')}₫`}
                color="success"
                size="small"
                sx={{ fontSize: '12px', mb: 2 }}
              />
              
              {/* Nút XEM CHI TIẾT */}
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#b59d3a',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#a88c2a'
                  }
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (onProductSelect) {
                    onProductSelect(product);
                  }
                }}
              >
                XEM CHI TIẾT
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
} 