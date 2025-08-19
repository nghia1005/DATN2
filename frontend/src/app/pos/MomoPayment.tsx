'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface MomoTransaction {
  idMomoTransaction: number;
  orderId: string;
  amount: number;
  qrCodeUrl?: string;
  trangThai: string;
  ngayTao: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (transactionData: any) => void;
  onError: (error: string) => void;
}

export default function MomoPayment({ isOpen, onClose, amount, onSuccess, onError }: Props) {
  const [transaction, setTransaction] = useState<MomoTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút countdown

  // Tạo giao dịch MoMo
  const createMomoTransaction = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          loaiGiaoDich: 'Tại quầy'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTransaction(result.data);
        // Bắt đầu kiểm tra trạng thái
        startStatusChecking(result.data.orderId);
        toast.success('Tạo mã QR MoMo thành công!');
      } else {
        throw new Error(result.message || 'Không thể tạo giao dịch MoMo');
      }
    } catch (error: any) {
      console.error('Error creating MoMo transaction:', error);
      onError(error.message || 'Lỗi tạo giao dịch MoMo');
      toast.error('Lỗi tạo giao dịch MoMo');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra trạng thái giao dịch
  const checkTransactionStatus = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/momo/check-status/${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        const status = result.status;
        
        if (status === 'Thành công') {
          setChecking(false);
          onSuccess(result.data);
          toast.success('Thanh toán MoMo thành công!');
          onClose();
        } else if (status === 'Thất bại' || status === 'Đã hủy') {
          setChecking(false);
          onError('Giao dịch thất bại hoặc bị hủy');
          toast.error('Giao dịch MoMo thất bại');
        }
        // Nếu vẫn đang chờ thì tiếp tục kiểm tra
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  // Bắt đầu kiểm tra trạng thái định kỳ
  const startStatusChecking = (orderId: string) => {
    setChecking(true);
    
    const interval = setInterval(() => {
      checkTransactionStatus(orderId);
    }, 3000); // Kiểm tra mỗi 3 giây

    // Dừng kiểm tra sau 5 phút
    setTimeout(() => {
      clearInterval(interval);
      setChecking(false);
      if (transaction?.trangThai === 'Chờ thanh toán') {
        onError('Hết thời gian chờ thanh toán');
        toast.error('Hết thời gian chờ thanh toán MoMo');
      }
    }, 300000); // 5 phút

    return interval;
  };

  // Countdown timer
  useEffect(() => {
    if (checking && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checking, countdown]);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTransaction(null);
      setCountdown(300);
      setChecking(false);
      setLoading(false);
    }
  }, [isOpen]);

  // Auto tạo giao dịch khi mở modal
  useEffect(() => {
    if (isOpen && !transaction && !loading) {
      createMomoTransaction();
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = async () => {
    if (transaction && checking) {
      try {
        await fetch(`http://localhost:8080/api/momo/transactions/${transaction.orderId}/cancel`, {
          method: 'PUT'
        });
        toast.info('Đã hủy giao dịch MoMo');
      } catch (error) {
        console.error('Error canceling transaction:', error);
      }
    }
    setChecking(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        maxWidth: 500,
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <h2 style={{ 
          color: '#d82d8b', 
          marginBottom: 24,
          fontSize: 24,
          fontWeight: 'bold'
        }}>
          💳 Thanh toán MoMo
        </h2>

        {loading && (
          <div>
            <div style={{ fontSize: 16, marginBottom: 16 }}>
              Đang tạo mã QR...
            </div>
            <div style={{
              width: 40,
              height: 40,
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #d82d8b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        )}

        {transaction && (
          <div>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: 20,
              borderRadius: 12,
              marginBottom: 20
            }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Số tiền: </strong>
                <span style={{ color: '#d82d8b', fontSize: 20, fontWeight: 'bold' }}>
                  {amount.toLocaleString()}đ
                </span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Mã đơn hàng: </strong>
                <span style={{ fontFamily: 'monospace' }}>{transaction.orderId}</span>
              </div>
              <div>
                <strong>Trạng thái: </strong>
                <span style={{ 
                  color: transaction.trangThai === 'Thành công' ? '#28a745' : 
                        transaction.trangThai === 'Thất bại' ? '#dc3545' : '#ffc107'
                }}>
                  {transaction.trangThai}
                </span>
              </div>
            </div>

            {(transaction.payUrl || transaction.qrCodeUrl) ? (
              <div style={{ marginBottom: 20 }}>
                {/* QR Code nếu có */}
                {transaction.qrCodeUrl && (
                  <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 'bold' }}>
                      Quét mã QR bằng app MoMo:
                    </div>
                    <img 
                      src={transaction.qrCodeUrl} 
                      alt="MoMo QR Code"
                      style={{ 
                        width: 200, 
                        height: 200, 
                        border: '2px solid #d82d8b',
                        borderRadius: 12,
                        backgroundColor: 'white',
                        padding: 8
                      }}
                    />
                  </div>
                )}

                {/* Hoặc link thanh toán */}
                {transaction.payUrl && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 'bold' }}>
                      {transaction.qrCodeUrl ? 'Hoặc click để mở trang thanh toán:' : 'Click để chuyển đến trang thanh toán MoMo:'}
                    </div>
                    <button
                      onClick={() => {
                        window.open(transaction.payUrl, '_blank', 'width=500,height=700');
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#d82d8b',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        margin: '0 auto'
                      }}
                    >
                      🔗 Mở trang thanh toán
                    </button>
                  </div>
                )}

                <div style={{ 
                  marginTop: 16, 
                  fontSize: 14, 
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  💡 Sau khi thanh toán xong, hệ thống sẽ tự động cập nhật trạng thái
                </div>
              </div>
            ) : (
              <div style={{
                padding: 40,
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                marginBottom: 20
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <div style={{ fontSize: 16, color: '#666' }}>
                  Đang tạo liên kết thanh toán MoMo...
                </div>
              </div>
            )}

            {checking && (
              <div style={{
                backgroundColor: '#e7f3ff',
                padding: 16,
                borderRadius: 8,
                marginBottom: 20
              }}>
                <div style={{ marginBottom: 8 }}>
                  ⏱️ Đang chờ thanh toán...
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>
                  Thời gian còn lại: {formatTime(countdown)}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            {checking ? 'Hủy thanh toán' : 'Đóng'}
          </button>
          
          {transaction && !checking && transaction.trangThai === 'Chờ thanh toán' && (
            <>
              <button
                onClick={() => startStatusChecking(transaction.orderId)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#d82d8b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                Kiểm tra lại
              </button>
              
              {/* Nút test cho developer */}
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`http://localhost:8080/api/momo/test-success/${transaction.orderId}`, {
                      method: 'POST'
                    });
                    const result = await response.json();
                    if (result.success) {
                      onSuccess(result.data);
                      toast.success('Test thanh toán thành công!');
                      onClose();
                    }
                  } catch (error) {
                    console.error('Error testing payment:', error);
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                🧪 Test Thành Công
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
