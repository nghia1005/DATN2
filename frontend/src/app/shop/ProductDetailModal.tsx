import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
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

interface Color { idMauSac: number; mauSac: string; }
interface Size { idKichCo: number; kichCo: string; }

interface ProductDetailModalProps {
    open: boolean;
    onClose: () => void;
    product: ProductVariant | null;
    colors: Color[];
    sizes: Size[];
    modalColor: string;
    setModalColor: (v: string) => void;
    modalSize: string;
    setModalSize: (v: string) => void;
    modalQuantity: number;
    setModalQuantity: (v: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    open,
    onClose,
    product,
    colors,
    sizes,
    modalColor,
    setModalColor,
    modalSize,
    setModalSize,
    modalQuantity,
    setModalQuantity,
    onAddToCart,
    onBuyNow
}) => {
    if (!product) return null;

    // Tính giá sau giảm nếu có sale
    const calculateSalePrice = (originalPrice: number, discountPercent: number) => {
        return originalPrice - (originalPrice * discountPercent / 100);
    };

    // Kiểm tra sản phẩm có đang sale không
    const isOnSale = product.trangThaiSale === 'ACTIVE' && product.phanTramGiamGia && product.phanTramGiamGia > 0;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, color: '#b59d3a', fontSize: 28, textAlign: 'center', pb: 0 }}>
                {product.tenSanPham}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 16, top: 16, color: '#b59d3a' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', gap: 4, pt: 2, pb: 3 }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ProductImageCarousel
                        idChiTietSanPham={product.idChiTietSanPham}
                        defaultImage={product.duongDanHinhAnh}
                        alt={product.tenSanPham}
                        style={{ maxWidth: 320, maxHeight: 240, objectFit: 'contain', border: '2px solid #ffe066', borderRadius: 12, background: '#fffbe6' }}
                    />
                </Box>
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Hiển thị giá */}
                    <Box sx={{ mb: 2 }}>
                        {isOnSale ? (
                            <>
                                <div style={{ 
                                    color: "#999", 
                                    fontWeight: 400, 
                                    fontSize: 18, 
                                    textDecoration: 'line-through',
                                    marginBottom: 4
                                }}>
                                    {product.gia ? product.gia.toLocaleString("vi-VN") + "₫" : ""}
                                </div>
                                <div style={{ 
                                    color: "#e53935", 
                                    fontWeight: 700, 
                                    fontSize: 26,
                                    marginBottom: 4
                                }}>
                                    {calculateSalePrice(product.gia, product.phanTramGiamGia || 0).toLocaleString("vi-VN") + "₫"}
                                </div>
                                <div style={{ 
                                    color: "#2ecc40", 
                                    fontWeight: 600, 
                                    fontSize: 14
                                }}>
                                    Tiết kiệm: {(product.gia * (product.phanTramGiamGia || 0) / 100).toLocaleString("vi-VN") + "₫"}
                                </div>
                            </>
                        ) : (
                            <div style={{ color: "#e53935", fontWeight: 700, fontSize: 26, marginBottom: 8 }}>
                                {product.gia ? product.gia.toLocaleString("vi-VN") + "₫" : ""}
                            </div>
                        )}
                    </Box>
                    <div style={{ color: '#aaa', fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
                        Còn {product.soLuong ?? 0} sản phẩm trong kho
                    </div>
                    <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>
                        {product.moTa || `Mẫu giày phổ biến đến từ ${product.tenThuongHieu || ''}`}
                    </div>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Màu sắc</InputLabel>
                        <Select
                            value={modalColor}
                            label="Màu sắc"
                            onChange={(e: SelectChangeEvent<string>) => setModalColor(e.target.value)}
                        >
                            <MenuItem value="">-- Chọn màu --</MenuItem>
                            {Array.isArray(colors) && colors.map(c => (
                                <MenuItem key={c.idMauSac} value={c.mauSac}>{c.mauSac}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Kích cỡ</InputLabel>
                        <Select
                            value={modalSize}
                            label="Kích cỡ"
                            onChange={e => setModalSize(e.target.value as string)}
                        >
                            <MenuItem value="">-- Chọn kích cỡ --</MenuItem>
                            {Array.isArray(sizes) && sizes.map(s => (
                                <MenuItem key={s.idKichCo} value={s.kichCo}>{s.kichCo}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <div style={{ fontWeight: 600, color: '#b48a00', marginBottom: 4, fontSize: 16 }}>
                            Số lượng
                        </div>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 32, px: 0, fontWeight: 700, borderColor: '#b48a00', color: '#b48a00' }}
                                onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                disabled={modalQuantity <= 1}
                            >
                                -
                            </Button>
                            <input
                                type="number"
                                min={1}
                                max={product.soLuong || 1}
                                value={modalQuantity}
                                onChange={e => {
                                    let v = Number(e.target.value);
                                    if (isNaN(v)) v = 1;
                                    if (v < 1) v = 1;
                                    if (product.soLuong && v > product.soLuong) v = product.soLuong;
                                    setModalQuantity(v);
                                }}
                                style={{ width: 60, padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, textAlign: 'center' }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 32, px: 0, fontWeight: 700, borderColor: '#b48a00', color: '#b48a00' }}
                                onClick={() => setModalQuantity(product.soLuong ? Math.min(product.soLuong, modalQuantity + 1) : modalQuantity + 1)}
                                disabled={product.soLuong ? modalQuantity >= product.soLuong : false}
                            >
                                +
                            </Button>
                        </Box>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" sx={{ bgcolor: '#b48a00', color: '#fff', fontWeight: 700, px: 4, fontSize: 16 }} onClick={onAddToCart}>
                            Thêm vào giỏ
                        </Button>
                        <Button variant="contained" sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, px: 4, fontSize: 16 }}
                                onClick={onBuyNow}
                        >
                            Mua ngay
                        </Button>
                        <Button variant="outlined" sx={{ color: '#b48a00', borderColor: '#b48a00', fontWeight: 700, px: 4, fontSize: 16 }} onClick={onClose}>
                            Đóng
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailModal; 