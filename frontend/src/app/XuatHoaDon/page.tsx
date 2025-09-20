'use client';
import { useEffect, useState } from 'react';
import InvoicePreview from '../pos/InvoicePreview';

export default function XuatHoaDonPage() {
  const [order, setOrder] = useState<any>(null);
  const [maHoaDon, setMaHoaDon] = useState<string>('');

  useEffect(() => {
    // Lấy dữ liệu hóa đơn từ localStorage
    const data = localStorage.getItem('lastOrderForPrint');
    if (data) {
      const parsed = JSON.parse(data);
      setOrder(parsed.order);
      setMaHoaDon(parsed.maHoaDon);
    }
  }, []);

  if (!order) return <div style={{textAlign:'center',marginTop:80,fontSize:20}}>Không có dữ liệu hóa đơn!</div>;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div id="invoice-preview">
        <InvoicePreview order={order} maHoaDon={maHoaDon} />
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '32px 0 0 0' }}>
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
        >
          🖨️ In hóa đơn
        </button>
        <button
          onClick={async () => {
            const invoiceDiv = document.querySelector('#invoice-preview');
            if (invoiceDiv) {
              const html2pdf = (await import('html2pdf.js')).default;
              html2pdf().from(invoiceDiv).save('hoa-don.pdf');
            }
          }}
          style={{ padding: '8px 16px', background: '#43a047', color: 'white', border: 'none', borderRadius: 4 }}
        >
          📄 Xuất hóa đơn PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
} 