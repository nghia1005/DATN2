import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface NCBPaymentProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  balance: number;
}

export default function NCBPayment({ open, onClose, amount, onPaymentSuccess, onPaymentError }: NCBPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [error, setError] = useState<string>('');

  // Mock data cho demo - trong thực tế sẽ lấy từ API NCB
  useEffect(() => {
    const mockAccounts: BankAccount[] = [
      {
        accountNumber: '1234567890',
        accountName: 'NGUYEN VAN A',
        bankName: 'NCB',
        balance: 100000000
      },
      {
        accountNumber: '0987654321',
        accountName: 'TRAN THI B',
        bankName: 'NCB',
        balance: 100000000
      }
    ];
    setAccounts(mockAccounts);
  }, []);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedAccount('');
    }
  }, [open]);

                const handlePayment = async () => {
                if (!selectedAccount) {
                  setError('Vui lòng chọn tài khoản thanh toán');
                  return;
                }

                const account = accounts.find(acc => acc.accountNumber === selectedAccount);
                if (!account) {
                  setError('Tài khoản không hợp lệ');
                  return;
                }

                if (account.balance < amount) {
                  setError('Số dư không đủ để thanh toán');
                  return;
                }

                setLoading(true);
                setError('');

                try {
                  // Simulate API call to NCB
                  await new Promise(resolve => setTimeout(resolve, 2000));

                  // Trừ số dư tài khoản
                  setAccounts(prevAccounts => prevAccounts.map(acc => 
                    acc.accountNumber === selectedAccount
                      ? { ...acc, balance: acc.balance - amount }
                      : acc
                  ));

                  // Generate transaction ID
                  const transactionId = `NCB${Date.now()}`;

                  // Simulate successful payment
                  onPaymentSuccess(transactionId);
                  onClose();
                } catch (err: any) {
                  setError('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!');
                  onPaymentError(err.message);
                } finally {
                  setLoading(false);
                }
              };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Thanh toán qua NCB
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Số tiền thanh toán:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            {amount.toLocaleString('vi-VN')} VND
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Chọn tài khoản NCB</InputLabel>
          <Select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            label="Chọn tài khoản NCB"
          >
            {accounts.map((account) => (
              <MenuItem key={account.accountNumber} value={account.accountNumber}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {account.accountName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {account.accountNumber} - Số dư: {account.balance.toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}


      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={loading || !selectedAccount}
          sx={{ bgcolor: '#1976d2', color: 'white' }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Đang xử lý...
            </Box>
          ) : (
            'Thanh toán NCB'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 