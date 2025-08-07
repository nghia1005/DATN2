import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    TextField, 
    Paper, 
    Alert, 
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface OrderLookupModalProps {
    open: boolean;
    onClose: () => void;
}

export default function OrderLookupModal({ open, onClose }: OrderLookupModalProps) {
    const [maDonHang, setMaDonHang] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [donHang, setDonHang] = useState<any>(null);
    const [lichSu, setLichSu] = useState<any[]>([]);

    const handleTraCuu = async () => {
        if (!maDonHang.trim()) {
            setError('Vui lòng nhập mã đơn hàng');
            return;
        }

        setLoading(true);
        setError('');
        setDonHang(null);
        setLichSu([]);

        try {
            // Tìm hóa đơn theo mã
            const response = await fetch(`http://localhost:8080/api/hoadon/ma/${maDonHang.trim()}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Không tìm thấy đơn hàng');
            }

            setDonHang(result.data);

            // Lấy lịch sử trạng thái
            try {
                const historyResponse = await fetch(`http://localhost:8080/lich-su-hoa-don/ma/${maDonHang.trim()}`);
                if (historyResponse.ok) {
                    const historyResult = await historyResponse.json();
                    setLichSu(historyResult.data || historyResult);
                }
            } catch (error) {
                console.log('Không lấy được lịch sử trạng thái:', error);
            }

        } catch (error: any) {
            setError(error.message || 'Không tìm thấy đơn hàng với mã này');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Chờ xác nhận': return '#ffc107';
            case 'Đã xác nhận': return '#1976d2';
            case 'Đang vận chuyển': return '#ff9800';
            case 'Giao hàng thành công': return '#4caf50';
            case 'Giao hàng thất bại': return '#e74c3c';
            case 'Đã hủy': return '#e74c3c';
            default: return '#757575';
        }
    };

    const handleClose = () => {
        setMaDonHang('');
        setError('');
        setDonHang(null);
        setLichSu([]);
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                bgcolor: '#f8f6ed', 
                borderBottom: '1px solid #e0c97a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img 
                        src="/logo-login.png" 
                        alt="SoleKing Store" 
                        style={{ width: 32, height: 32, borderRadius: 8 }} 
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#b59d3a' }}>
                        Tra cứu đơn hàng
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f8f6ed' }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    {/* Form tra cứu */}
                    <Paper sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        bgcolor: '#fff'
                    }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                            Nhập mã đơn hàng để kiểm tra trạng thái và thông tin chi tiết
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Mã đơn hàng"
                                value={maDonHang}
                                onChange={(e) => setMaDonHang(e.target.value)}
                                placeholder="VD: HD123456789"
                                variant="outlined"
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#b59d3a',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#8b7a2e',
                                        },
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleTraCuu}
                                disabled={loading}
                                sx={{
                                    bgcolor: '#b59d3a',
                                    px: 3,
                                    '&:hover': {
                                        bgcolor: '#8b7a2e',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={20} color="inherit" /> : 'Tra cứu'}
                            </Button>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Paper>

                    {/* Kết quả tra cứu */}
                    {donHang && (
                        <Paper sx={{ 
                            p: 3, 
                            mb: 3, 
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            bgcolor: '#fff'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 700, 
                                color: '#b59d3a', 
                                mb: 3 
                            }}>
                                Thông tin đơn hàng
                            </Typography>

                            <Box sx={{ display: 'grid', gap: 1.5, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Mã đơn hàng:</Typography>
                                    <Typography variant="body2">{donHang.maHoaDon}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Khách hàng:</Typography>
                                    <Typography variant="body2">{donHang.tenNguoiNhan || donHang.khachHang?.tenKhachHang || '-'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Số điện thoại:</Typography>
                                    <Typography variant="body2">{donHang.soDienThoai || donHang.khachHang?.soDienThoai || '-'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Địa chỉ nhận:</Typography>
                                    <Typography variant="body2" sx={{ maxWidth: '60%', textAlign: 'right' }}>
                                        {donHang.diaChiNhanHang || '-'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Tổng tiền:</Typography>
                                    <Typography variant="body2" fontWeight={700} color="#b59d3a">
                                        {donHang.tongTien?.toLocaleString('vi-VN') || '-'} VND
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Trạng thái:</Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: getStatusColor(donHang.trangThai),
                                        fontWeight: 700
                                    }}>
                                        {donHang.trangThai || '-'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>Ngày tạo:</Typography>
                                    <Typography variant="body2">
                                        {donHang.ngayTao ? new Date(donHang.ngayTao).toLocaleString('vi-VN') : '-'}
                                    </Typography>
                                </Box>
                                {donHang.ngayGiaoHang && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>Ngày giao hàng:</Typography>
                                        <Typography variant="body2">
                                            {new Date(donHang.ngayGiaoHang).toLocaleString('vi-VN')}
                                        </Typography>
                                    </Box>
                                )}
                                {donHang.ghiChu && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f6ed', borderRadius: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>Ghi chú:</Typography>
                                        <Typography variant="body2">{donHang.ghiChu}</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Lịch sử trạng thái */}
                            {lichSu.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 700, 
                                        color: '#b59d3a', 
                                        mb: 2 
                                    }}>
                                        Lịch sử trạng thái
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {lichSu.map((item, index) => (
                                            <Box key={index} sx={{ 
                                                p: 1.5, 
                                                bgcolor: '#f8f6ed', 
                                                borderRadius: 1,
                                                borderLeft: '3px solid #b59d3a'
                                            }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.ngayTao ? new Date(item.ngayTao).toLocaleString('vi-VN') : ''}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <span style={{ color: getStatusColor(item.trangThaiCu) }}>
                                                        {item.trangThaiCu}
                                                    </span>
                                                    {' → '}
                                                    <span style={{ color: getStatusColor(item.trangThaiMoi), fontWeight: 700 }}>
                                                        {item.trangThaiMoi}
                                                    </span>
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
} 