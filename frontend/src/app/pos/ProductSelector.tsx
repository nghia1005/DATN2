'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ProductDetail } from './types';

interface Props {
  onSelectAction: (product: ProductDetail, qty: number) => void;
  onCloseAction: () => void;
  products: ProductDetail[];
}

export default function ProductSelector({ onSelectAction, onCloseAction, products }: Props) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qtyMap, setQtyMap] = useState<{ [id: number]: string }>({});
  // Modal nhập số lượng
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductDetail | null>(null);
  const [modalQty, setModalQty] = useState('1');

  // Lấy danh sách filter duy nhất
  const brands = Array.from(new Set(products.map(p => p.tenThuongHieu))).filter(Boolean);
  const categories = Array.from(new Set(products.map(p => p.tenDanhMuc))).filter(Boolean);
  const colors = Array.from(new Set(products.map(p => p.tenMauSac))).filter(Boolean);
  const sizes = Array.from(new Set(products.map(p => p.tenKichCo))).filter(Boolean);

  // Lọc dữ liệu theo filter và tìm kiếm
  const filtered = products.filter(d =>
    d.trangThai === 'Đang bán' && d.soLuong > 0 &&
    (!brand || d.tenThuongHieu === brand) &&
    (!category || d.tenDanhMuc === category) &&
    (!color || d.tenMauSac === color) &&
    (!size || d.tenKichCo === size) &&
    (!search || d.tenSanPham.toLowerCase().includes(search.toLowerCase()) || d.maSanPham.toLowerCase().includes(search.toLowerCase()))
  )
  // Sắp xếp sản phẩm mới nhất lên đầu
  .sort((a, b) => b.idChiTietSanPham - a.idChiTietSanPham);

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product: ProductDetail) => {
    const qtyRaw = qtyMap[product.idChiTietSanPham];
    const qty = parseInt(qtyRaw || '1') || 1;
    if (!qtyRaw || qty < 1) {
      toast.error('Số lượng phải lớn hơn 0!');
      return;
    }
    if (qty > product.soLuong) {
      toast.error('Vượt quá số lượng cửa hàng!');
      return;
    }
    if (product.soLuong === 0) {
      toast.error('Sản phẩm này đã hết hàng!');
      return;
    }
    onSelectAction(product, qty);
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  // Thêm sản phẩm vào giỏ hàng qua modal
  const handleModalAdd = () => {
    if (!selectedProductForModal) return;
    const qty = parseInt(modalQty || '1') || 1;
    console.log('DEBUG: modalQty =', modalQty, ', parsed qty =', qty, ', product =', selectedProductForModal);
    if (qty < 1) {
      toast.error('Số lượng phải lớn hơn 0!');
      return;
    }
    if (qty > selectedProductForModal.soLuong) {
      toast.error('Vượt quá số lượng tồn kho!');
      return;
    }
    onSelectAction(selectedProductForModal, qty);
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    setSelectedProductForModal(null);
    setModalQty('1');
  };

  // Đặt lại filter và số lượng
  const handleReset = () => {
    setBrand('');
    setCategory('');
    setColor('');
    setSize('');
    setSearch('');
    setQtyMap({});
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '95vw',
        maxWidth: 1400,
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
          color: 'white',
          padding: '24px 32px',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              🛍️
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Chọn sản phẩm</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>Tìm kiếm và thêm sản phẩm vào giỏ hàng</p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 8,
              width: 40,
              height: 40,
              cursor: 'pointer',
              color: 'white',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px', maxHeight: 'calc(85vh - 120px)', overflow: 'auto' }}>
          {/* Filter Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            border: '1.5px solid #b59d3a'
          }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#6b4f1d' }}>🏷️</span>
                <select 
                  value={brand} 
                  onChange={e => setBrand(e.target.value)} 
                  style={{ 
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#6b4f1d' }}>📂</span>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  style={{ 
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#6b4f1d' }}>🎨</span>
                <select 
                  value={color} 
                  onChange={e => setColor(e.target.value)} 
                  style={{ 
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Tất cả màu</option>
                  {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#6b4f1d' }}>📏</span>
                <select 
                  value={size} 
                  onChange={e => setSize(e.target.value)} 
                  style={{ 
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Tất cả size</option>
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: 16, color: '#6b4f1d' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm hoặc mã..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              <button 
                onClick={handleReset} 
                style={{ 
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.2)';
                }}
              >
                🔄 Đặt lại
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid #b59d3a',
            boxShadow: '0 4px 16px rgba(181, 157, 58, 0.1)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
                    borderBottom: '2px solid #b59d3a'
                  }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>STT</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Mã SP</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Tên sản phẩm</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Danh mục</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Thương hiệu</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Màu sắc</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Kích thước</th>
                    <th style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Giá bán</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Số lượng</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, color: '#6b4f1d', fontSize: 14 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px', 
                        color: '#6b7280',
                        fontSize: 16
                      }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                        {search ? 'Không tìm thấy sản phẩm phù hợp với từ khóa tìm kiếm' : 'Chưa có sản phẩm nào trong hệ thống'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product, index) => (
                      <tr 
                        key={product.idChiTietSanPham} 
                        style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 12px', color: '#8a7a2a', fontSize: 14 }}>{index + 1}</td>
                        <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#1f2937', fontSize: 14 }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            color: '#1e40af',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            border: '1px solid #b59d3a'
                          }}>
                            {product.maSanPham}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', fontWeight: 500, color: '#6b4f1d', fontSize: 14 }}>
                          {product.tenSanPham}
                        </td>
                        <td style={{ padding: '16px 12px', color: '#6b7280', fontSize: 14 }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                            color: '#e65100',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            border: '1px solid #ff9800'
                          }}>
                            {product.tenDanhMuc}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', color: '#6b7280', fontSize: 14 }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                            color: '#2e7d32',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            border: '1px solid #4caf50'
                          }}>
                            {product.tenThuongHieu}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', color: '#6b7280', fontSize: 14 }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            color: '#7b1fa2',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            border: '1px solid #9c27b0'
                          }}>
                            {product.tenMauSac}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', color: '#6b7280', fontSize: 14 }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
                            color: '#6b4f1d',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            border: '1px solid #b59d3a'
                          }}>
                            {product.tenKichCo}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', color: '#b59d3a', fontSize: 16 }}>
                          {(product.trangThaiSale === 'Bật' || product.trangThaiSale === 'ACTIVE') && product.giaSale ? (
                            <div>
                              <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 14 }}>
                                {product.gia?.toLocaleString()} ₫
                              </div>
                              <div style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                                {product.giaSale?.toLocaleString()} ₫
                              </div>
                              <div style={{ color: '#e53e3e', fontSize: 12 }}>
                                -{product.phanTramGiamGia}%
                              </div>
                            </div>
                          ) : (
                            <div>{product.gia?.toLocaleString()} ₫</div>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span style={{
                            background: product.soLuong > 10 ? '#ecfdf5' : product.soLuong > 0 ? '#fef3c7' : '#fef2f2',
                            color: product.soLuong > 10 ? '#065f46' : product.soLuong > 0 ? '#92400e' : '#dc2626',
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {product.soLuong} {product.soLuong > 10 ? '✅' : product.soLuong > 0 ? '⚠️' : '❌'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setModalQty('1');
                            }}
                            disabled={product.soLuong === 0}
                            style={{
                              background: product.soLuong > 0 
                                ? 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)' 
                                : '#9ca3af',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 20px',
                              cursor: product.soLuong > 0 ? 'pointer' : 'not-allowed',
                              fontSize: 14,
                              fontWeight: 600,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: product.soLuong > 0 ? '0 2px 8px rgba(181, 157, 58, 0.2)' : 'none'
                            }}
                            onMouseOver={(e) => {
                              if (product.soLuong > 0) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                              }
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = product.soLuong > 0 ? '0 2px 8px rgba(181, 157, 58, 0.2)' : 'none';
                            }}
                            title={product.soLuong === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                          >
                            {product.soLuong > 0 ? '🛒 Thêm' : '❌ Hết hàng'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div style={{ 
            marginTop: 20,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
            borderRadius: 12,
            border: '1.5px solid #b59d3a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ color: '#6b4f1d', fontSize: 14 }}>
              📊 Hiển thị <strong>{filtered.length}</strong> sản phẩm
              {search && ` cho từ khóa "${search}"`}
            </div>
            <div style={{ color: '#6b4f1d', fontSize: 14 }}>
              💡 Nhấn "Thêm" để chọn số lượng và thêm vào giỏ hàng
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1.5px solid #b59d3a',
          background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ color: '#6b4f1d', fontSize: 14 }}>
            💡 Tip: Sử dụng bộ lọc để tìm sản phẩm nhanh hơn
          </div>
        </div>
      </div>

      {/* Quantity Modal */}
      {selectedProductForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 16, 
            padding: 32, 
            minWidth: 400, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <button 
              onClick={() => setSelectedProductForModal(null)} 
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 20, 
                background: '#f3f4f6',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#6b7280',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                margin: '0 auto 16px'
              }}>
                🛒
              </div>
              <h3 style={{ margin: 0, marginBottom: 8, color: '#6b4f1d', fontSize: 20, fontWeight: 600 }}>
                Thêm vào giỏ hàng
              </h3>
              <p style={{ margin: 0, color: '#8a7a2a', fontSize: 14 }}>
                {selectedProductForModal.tenSanPham}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                color: '#6b4f1d',
                fontSize: 14
              }}>
                Số lượng muốn thêm:
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={selectedProductForModal.soLuong}
                value={modalQty}
                onChange={e => {
                  let v = e.target.value.replace(/[^0-9]/g, '');
                  if (v && parseInt(v) > selectedProductForModal.soLuong) {
                    toast.error('Vượt quá số lượng tồn kho!');
                  }
                  setModalQty(v);
                }}
                onBlur={e => {
                  let v = e.target.value.replace(/[^0-9]/g, '');
                  let num = parseInt(v) || 1;
                  if (num < 1) num = 1;
                  if (num > selectedProductForModal.soLuong) num = selectedProductForModal.soLuong;
                  setModalQty(num.toString());
                  e.target.style.borderColor = '#d1d5db';
                }}
                style={{ 
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                autoFocus
              />
            </div>

            {modalQty && parseInt(modalQty) > selectedProductForModal.soLuong && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: 13, 
                marginBottom: 16,
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: 6,
                border: '1px solid #fecaca'
              }}>
                ⚠️ Vượt quá số lượng tồn kho!
              </div>
            )}

            <div style={{ 
              marginBottom: 24,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
              borderRadius: 8,
              border: '1.5px solid #b59d3a'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b4f1d', fontSize: 14 }}>📦 Số lượng còn:</span>
                <span style={{ 
                  color: '#6b4f1d', 
                  fontSize: 16, 
                  fontWeight: 600,
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid #b59d3a'
                }}>
                  {selectedProductForModal.soLuong}
                </span>
              </div>
            </div>

            <button
              onClick={handleModalAdd}
              disabled={(() => {
                const qty = parseInt(modalQty || '1') || 1;
                return !modalQty || qty < 1 || qty > selectedProductForModal.soLuong;
              })()}
              style={{
                background: (() => {
                  const qty = parseInt(modalQty || '1') || 1;
                  const isValid = modalQty && qty >= 1 && qty <= selectedProductForModal.soLuong;
                  return isValid 
                    ? 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)'
                    : '#9ca3af';
                })(),
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '16px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: (() => {
                  const qty = parseInt(modalQty || '1') || 1;
                  const isValid = modalQty && qty >= 1 && qty <= selectedProductForModal.soLuong;
                  return isValid ? 'pointer' : 'not-allowed';
                })(),
                width: '100%',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
                              onMouseOver={(e) => {
                  const qty = parseInt(modalQty || '1') || 1;
                  const isValid = modalQty && qty >= 1 && qty <= selectedProductForModal.soLuong;
                  if (isValid) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                  }
                }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✅ Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 