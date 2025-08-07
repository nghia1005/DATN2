import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

interface Voucher {
  idPhieuGiamGia: number;
  maPhieuGiamGia: string;
  tenPhieuGiamGia: string;
  kieuGiamGia: string;
  giaTriToiThieu: number;
  giaTriToiDa: number;
  phanTramGiamGia: number;
  soLuong: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  moTa: string;
  trangThai: string;
}

interface VoucherSelectorProps {
  selectedVoucher: Voucher | null;
  onVoucherChange: (voucher: Voucher | null) => void;
  totalAmount: number;
}

export default function VoucherSelector({ selectedVoucher, onVoucherChange, totalAmount }: VoucherSelectorProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load vouchers từ backend
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        console.log('Fetching vouchers from:', 'http://localhost:8080/api/voucher');
        const response = await fetch('http://localhost:8080/api/voucher');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Không thể tải danh sách voucher`);
        }
        
        const data = await response.json();
        console.log('Raw voucher data:', data);
        
        // Lọc chỉ những voucher đang hoạt động
        const activeVouchers = data.filter((v: Voucher) => {
          const isActive = v.trangThai === 'Hoạt động' || v.trangThai === 'Đang diễn ra';
          const hasQuantity = v.soLuong > 0;
          const notExpired = new Date(v.ngayKetThuc) > new Date();
          
          console.log(`Voucher ${v.maPhieuGiamGia}:`, {
            trangThai: v.trangThai,
            soLuong: v.soLuong,
            ngayKetThuc: v.ngayKetThuc,
            isActive,
            hasQuantity,
            notExpired
          });
          
          return isActive && hasQuantity && notExpired;
        });
        
        console.log('Active vouchers:', activeVouchers);
        setVouchers(activeVouchers);
      } catch (err: any) {
        console.error('Error fetching vouchers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleVoucherChange = (event: any) => {
    const voucherId = event.target.value;
    if (voucherId === '') {
      onVoucherChange(null);
      return;
    }
    
    const voucher = vouchers.find(v => v.idPhieuGiamGia === voucherId);
    if (voucher) {
      // Kiểm tra điều kiện áp dụng voucher
      if (totalAmount < voucher.giaTriToiThieu) {
        setError(`Đơn hàng tối thiểu ${voucher.giaTriToiThieu.toLocaleString('vi-VN')}đ để áp dụng voucher này`);
        return;
      }
      setError('');
      onVoucherChange(voucher);
    }
  };

  const getVoucherDescription = (voucher: Voucher) => {
    if (voucher.kieuGiamGia === 'PERCENT') {
      return `Giảm ${voucher.phanTramGiamGia}% (tối đa ${voucher.giaTriToiDa.toLocaleString('vi-VN')}đ)`;
    } else if (voucher.kieuGiamGia === 'FIXED') {
      return `Giảm ${voucher.giaTriToiDa.toLocaleString('vi-VN')}đ`;
    } else if (voucher.kieuGiamGia === 'FREE_SHIP') {
      return 'Miễn phí vận chuyển';
    }
    return voucher.moTa;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Phiếu giảm giá
      </Typography>
      
      <FormControl fullWidth size="small">
        <InputLabel>Chọn phiếu giảm giá</InputLabel>
        <Select
          value={selectedVoucher?.idPhieuGiamGia || ''}
          onChange={handleVoucherChange}
          label="Chọn phiếu giảm giá"
          displayEmpty
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
          renderValue={(value) => {
            if (!value) {
              return <span style={{ color: '#999' }}>Chọn phiếu giảm giá</span>;
            }
            const voucher = vouchers.find(v => v.idPhieuGiamGia === value);
            return voucher ? `${voucher.maPhieuGiamGia} - ${voucher.tenPhieuGiamGia}` : '';
          }}
        >
          <MenuItem value="">
            <em>Không sử dụng voucher</em>
          </MenuItem>
          {vouchers.map((voucher) => (
            <MenuItem key={voucher.idPhieuGiamGia} value={voucher.idPhieuGiamGia} sx={{ py: 1.5, minHeight: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: 0.5 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: '1.2' }}>
                  {voucher.maPhieuGiamGia} - {voucher.tenPhieuGiamGia}
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.2' }}>
                  {getVoucherDescription(voucher)}
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.2' }}>
                  Đơn tối thiểu: {voucher.giaTriToiThieu.toLocaleString('vi-VN')}đ
                </div>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedVoucher && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`${selectedVoucher.maPhieuGiamGia} - ${getVoucherDescription(selectedVoucher)}`}
            color="primary"
            variant="outlined"
            onDelete={() => onVoucherChange(null)}
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
} 