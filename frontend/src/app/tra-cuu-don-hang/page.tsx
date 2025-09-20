"use client";
import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Paper, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../shop/Header';

export default function TraCuuDonHangPage() {
    const [maDonHang, setMaDonHang] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [donHang, setDonHang] = useState<any>(null);
    const [lichSu, setLichSu] = useState<any[]>([]);
    const router = useRouter();
    const [userName, setUserName] = useState<string>('');
    const [isClient, setIsClient] = useState<boolean>(false);

    // Tự động điền mã đơn hàng từ localStorage khi component mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastOrderCode = localStorage.getItem('lastOrderCode');
            if (lastOrderCode) {
                setMaDonHang(lastOrderCode);
                // Xóa khỏi localStorage sau khi đã sử dụng
                localStorage.removeItem('lastOrderCode');
            }
        }
    }, []);

    // Lấy tên người dùng từ localStorage để hiển thị trên header
    React.useEffect(() => {
        setIsClient(true);
        try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const userObj = JSON.parse(userJson);
                if (userObj && (userObj.tenNhanVien || userObj.tenKhachHang || userObj.username)) {
                    setUserName(userObj.tenNhanVien || userObj.tenKhachHang || userObj.username);
                }
            }
        } catch {
            // ignore
        }
    }, []);

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

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: '#f8f6ed', 
            py: 0,
            px: 0
        }}>
            <Header
              userName={userName}
              showWelcome={false}
              setShowWelcome={() => {}}
              setShowCart={() => {}}
              setShowCheckout={() => {}}
              setShowThankYou={() => {}}
              showCart={false}
              showCheckout={false}
              showThankYou={false}
              cart={[]}
              router={router}
              handleLogout={() => { localStorage.removeItem('user'); router.push('/login'); }}
              search={''}
              setSearch={() => {}}
              isClient={isClient}
              showOrderLookupModal={false}
              activeLookup={true}
              onOpenOrderLookup={() => {}}
            />
            <Box sx={{ 
                maxWidth: 800, 
                mx: 'auto',
                textAlign: 'center'
            }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <img 
                        src="/logo-login.png" 
                        alt="SoleKing Store" 
                        style={{ 
                            width: 64, 
                            height: 64, 
                            borderRadius: 16, 
                            marginBottom: 16 
                        }} 
                    />
                    <Typography variant="h4" sx={{ 
                        fontWeight: 800, 
                        color: '#b59d3a', 
                        mb: 1 
                    }}>
                        Tra cứu đơn hàng
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        Nhập mã đơn hàng để kiểm tra trạng thái và thông tin chi tiết
                    </Typography>
                </Box>

                {/* Form tra cứu */}
                <Paper sx={{ 
                    p: 4, 
                    mb: 3, 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                            fullWidth
                            label="Mã đơn hàng"
                            value={maDonHang}
                            onChange={(e) => setMaDonHang(e.target.value)}
                            placeholder="VD: HD123456789"
                            variant="outlined"
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
                                px: 4,
                                '&:hover': {
                                    bgcolor: '#8b7a2e',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Tra cứu'}
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
                        p: 4, 
                        mb: 3, 
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: '#b59d3a', 
                            mb: 3 
                        }}>
                            Thông tin đơn hàng
                        </Typography>

                        <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Mã đơn hàng:</Typography>
                                <Typography>{donHang.maHoaDon}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Khách hàng:</Typography>
                                <Typography>{donHang.tenNguoiNhan || donHang.khachHang?.tenKhachHang || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Số điện thoại:</Typography>
                                <Typography>{donHang.soDienThoai || donHang.khachHang?.soDienThoai || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Địa chỉ nhận:</Typography>
                                <Typography>{donHang.diaChiNhanHang || '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Tổng tiền:</Typography>
                                <Typography fontWeight={700} color="#b59d3a">
                                    {donHang.tongTien?.toLocaleString('vi-VN') || '-'} VND
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Trạng thái:</Typography>
                                <Typography sx={{ 
                                    color: getStatusColor(donHang.trangThai),
                                    fontWeight: 700
                                }}>
                                    {donHang.trangThai || '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                <Typography fontWeight={600}>Ngày tạo:</Typography>
                                <Typography>
                                    {donHang.ngayTao ? new Date(donHang.ngayTao).toLocaleString('vi-VN') : '-'}
                                </Typography>
                            </Box>
                            {donHang.ngayGiaoHang && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                    <Typography fontWeight={600}>Ngày giao hàng:</Typography>
                                    <Typography>
                                        {new Date(donHang.ngayGiaoHang).toLocaleString('vi-VN')}
                                    </Typography>
                                </Box>
                            )}
                            {donHang.ghiChu && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f6ed', borderRadius: 2 }}>
                                    <Typography fontWeight={600}>Ghi chú:</Typography>
                                    <Typography>{donHang.ghiChu}</Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Lịch sử trạng thái */}
                        {lichSu.length > 0 && (
                            <Box sx={{ mt: 4 }}>
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
                                            p: 2, 
                                            bgcolor: '#f8f6ed', 
                                            borderRadius: 2,
                                            borderLeft: '4px solid #b59d3a'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.ngayTao ? new Date(item.ngayTao).toLocaleString('vi-VN') : ''}
                                            </Typography>
                                            <Typography>
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

                {/* Nút quay lại */}
                <Button
                    variant="outlined"
                    onClick={() => router.push('/shop')}
                    sx={{
                        borderColor: '#b59d3a',
                        color: '#b59d3a',
                        '&:hover': {
                            borderColor: '#8b7a2e',
                            bgcolor: '#fffbe6'
                        }
                    }}
                >
                    Quay lại mua hàng
                </Button>
            </Box>
        </Box>
    );
} 