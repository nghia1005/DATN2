import React, { useState, useEffect } from "react";

// Danh sách mã QR mẫu, bạn có thể sửa/thêm tùy ý
const qrOptions = [
  {
    id: "momo",
    name: "MoMo - TRẦN QUANG CHÍNH",
    account: "******821",
    bank: "MoMo",
    qrImage: "/qr/z6844317818741_12f0af2b40b71f953682480f2be86776.jpg",
    phoneNumber: "******821"
  },
  {
    id: "acb",
    name: "ACB - Nguyễn Văn Nghĩa",
    account: "123456789",
    bank: "ACB",
    qrImage: "/qr/acb.jpg",
  },
  {
    id: "vcb",
    name: "Vietcombank - Nguyễn Văn A",
    account: "0123456789",
    bank: "Vietcombank",
    qrImage: "/qr/acb.jpg",
  },
];

interface QrSelectorProps {
  amount: number; // Số tiền cần thanh toán
  onSelect?: (qr: typeof qrOptions[0]) => void;
  showOnlySelect?: boolean;
  triggerNode?: React.ReactNode; // Cho phép custom nút bấm
  autoOpen?: boolean;
}

const QrSelector: React.FC<QrSelectorProps> = ({ amount, onSelect, showOnlySelect, triggerNode, autoOpen = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<typeof qrOptions[0] | null>(null);
  const [dynamicQRUrl, setDynamicQRUrl] = useState<string>('');

  useEffect(() => {
    if (autoOpen) setShowModal(true);
  }, [autoOpen]);

  const handleSelect = (qr: typeof qrOptions[0]) => {
    setSelectedQR(qr);
    setShowModal(false);
    onSelect && onSelect(qr);
  };

  // Tạo QR code MoMo động
  const generateMoMoQR = (phoneNumber: string, amount: number) => {
    // Format số tiền theo chuẩn MoMo (không có dấu phẩy, chỉ số)
    const formattedAmount = Math.round(amount);
    // Tạo URL MoMo với thông tin thanh toán
    return `https://nhantien.momo.vn/${phoneNumber}/${formattedAmount}`;
  };

  // Tạo QR code động khi có số tiền
  useEffect(() => {
    if (selectedQR?.bank === "MoMo" && selectedQR.phoneNumber && amount > 0) {
      const momoUrl = generateMoMoQR(selectedQR.phoneNumber, amount);
      setDynamicQRUrl(momoUrl);
    }
  }, [selectedQR, amount]);

  return (
    <div style={{ display: 'inline' }}>
      {triggerNode ? (
        <span onClick={() => setShowModal(true)}>{triggerNode}</span>
      ) : (
        <button type="button" onClick={() => setShowModal(true)}>
          QR
        </button>
      )}
      {showModal && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Chọn mã QR</h3>
            <button onClick={() => setShowModal(false)}>Đóng</button>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {qrOptions.map((qr) => (
                <div
                  key={qr.id}
                  style={{
                    cursor: "pointer",
                    border: "1px solid #ccc",
                    padding: 12,
                    borderRadius: 8,
                    minWidth: 120,
                    textAlign: "center",
                    background: qr.bank === "MoMo" ? "#d4145a" : "#fff",
                    color: qr.bank === "MoMo" ? "#fff" : "#000"
                  }}
                  onClick={() => handleSelect(qr)}
                >
                  {qr.bank === "MoMo" ? (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>MoMo</div>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{qr.name}</div>
                      <div style={{ fontSize: 12 }}>SĐT: {qr.phoneNumber}</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Số tiền: {amount.toLocaleString()}đ</div>
                    </div>
                  ) : (
                    <>
                  <img src={qr.qrImage} alt={qr.name} width={100} />
                  <div>{qr.name}</div>
                  <div>
                    {qr.account} ({qr.bank})
                  </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nếu không phải chỉ chọn thì hiển thị QR lớn */}
      {!showOnlySelect && selectedQR && (
        <div style={{ 
          background: selectedQR.bank === "MoMo" ? "#d4145a" : "#f5f5f5", 
          borderRadius: 6, 
          padding: 12, 
          marginTop: 12, 
          fontSize: 16,
          color: selectedQR.bank === "MoMo" ? "#fff" : "#000"
        }}>
          <div style={{ fontWeight: 700 }}>
            {selectedQR.bank} - {selectedQR.name}
          </div>
          {selectedQR.bank === "MoMo" ? (
            <>
              <div>
                SĐT: <b>{selectedQR.phoneNumber}</b>
              </div>
              <div>
                Số tiền: <b>{amount.toLocaleString()}đ</b>
              </div>
              <div>
                Nội dung: Chuyển tiền thanh toán MoMo
              </div>
              <div style={{ marginTop: 12 }}>
                <a 
                  href={generateMoMoQR(selectedQR.phoneNumber!, amount)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    background: "#fff", 
                    color: "#d4145a", 
                    padding: "8px 16px", 
                    borderRadius: 4, 
                    textDecoration: "none", 
                    fontWeight: "bold",
                    display: "inline-block"
                  }}
                >
                  Mở MoMo App
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
                💡 Tip: Click "Mở MoMo App" để tự động điền số tiền {amount.toLocaleString()}đ
              </div>
            </>
          ) : (
            <>
          <div>
            STK: <b>{selectedQR.account}</b> ({selectedQR.bank})
          </div>
          <div>
            Số tiền: <b>{amount.toLocaleString()}đ</b>
          </div>
          <div>
            Nội dung: Chuyển tiền thanh toán QR CODE
          </div>
            </>
          )}
        </div>
      )}

      {/* CSS cho modal */}
      <style jsx>{`
        .modal-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          padding: 24px;
          border-radius: 8px;
          min-width: 300px;
        }
      `}</style>
    </div>
  );
};

export default QrSelector; 