import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ProductCard from './ProductCard';

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

interface ProductListProps {
  loading: boolean;
  uniqueProductVariants: ProductVariant[];
  setSelectedProduct: (p: ProductVariant | null) => void;
  setModalColor: (v: string) => void;
  setModalSize: (v: string) => void;
  setModalQuantity: (v: number) => void;
  setModalOpen: (v: boolean) => void;
}

export default function ProductList({ loading, uniqueProductVariants, setSelectedProduct, setModalColor, setModalSize, setModalQuantity, setModalOpen }: ProductListProps) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, color: "#b59d3a", mb: 3, textAlign: "center" }}>
        Danh sách sản phẩm
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(5, 1fr)'
            },
            gap: 3,
            justifyItems: "center",
            padding: { xs: 1, sm: 2 },
            '& > *': {
              width: '100%',
              maxWidth: '300px'
            }
          }}
        >
          {uniqueProductVariants.map((product) => (
            <ProductCard
              key={product.idChiTietSanPham}
              product={product}
              onSelect={(p) => {
                setSelectedProduct(p);
                setModalColor(p.tenMauSac || "");
                setModalSize(p.tenKichCo || "");
                setModalQuantity(1);
                setModalOpen(true);
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
} 