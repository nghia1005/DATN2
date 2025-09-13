"use client";
import React, { useState, useEffect } from 'react';

interface DiaChiDTO {
  idDiaChi: number;
  idKhachHang: number;
  thanhPho: string;
  quanHuyen: string;
  xaPhuong: string;
  ngoNgach: string;
  ghiChu: string;
  macDinh: string;
}

interface KhachHangDTO {
  idKhachHang: number;
  maKhachHang: string;
  tenKhachHang: string;
  ngaySinh: string;
  gioiTinh: boolean;
  soDienThoai: string;
  email: string;
  trangThai: string;
  gioiTinhText: string;
  emailXacThucText: string;
  trangThaiText: string;
  soDiaChi: number;
  danhSachDiaChi: DiaChiDTO[];
}

interface CustomerSelectorProps {
  selectedCustomer: KhachHangDTO | null;
  onCustomerSelectAction: (customer: KhachHangDTO | null) => void;
  onAddressSelectAction: (address: DiaChiDTO | null) => void;
  selectedAddress: DiaChiDTO | null;
  isShipping: boolean;
}

export default function CustomerSelector({
  selectedCustomer,
  onCustomerSelectAction,
  onAddressSelectAction,
  selectedAddress,
  isShipping
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<KhachHangDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    tenKhachHang: '',
    soDienThoai: '',
    email: '',
    gioiTinh: true,
    maKhachHang: '',
    trangThai: 'Hoạt động'
  });
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load danh sách khách hàng
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/khach-hang/hien-thi");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: KhachHangDTO) => {
    onCustomerSelectAction(customer);
    // Tự động chọn địa chỉ mặc định nếu có
    if (customer.danhSachDiaChi && customer.danhSachDiaChi.length > 0) {
      const defaultAddress = customer.danhSachDiaChi.find(addr => addr.macDinh === "Có");
      onAddressSelectAction(defaultAddress || customer.danhSachDiaChi[0]);
    } else {
      onAddressSelectAction(null);
    }
    setShowCustomerModal(false);
  };

  const handleRemoveCustomer = () => {
    onCustomerSelectAction(null);
    onAddressSelectAction(null);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.tenKhachHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.soDienThoai.includes(searchTerm) ||
    customer.maKhachHang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm tạo khách hàng mới
  const handleCreateCustomer = async () => {
    if (!newCustomer.tenKhachHang.trim()) {
      alert('Tên khách hàng không được để trống!');
      return;
    }
    if (!/^[0-9]{10,11}$/.test(newCustomer.soDienThoai)) {
      alert('Số điện thoại phải có 10-11 số!');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newCustomer.email)) {
      alert('Email không đúng định dạng!');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('http://localhost:8080/khach-hang/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (response.ok) {
        const data = await response.json();
        let created = data.data || data;
        setCustomers(prev => [...prev, created]);
        onCustomerSelectAction(created);
        setShowCreateModal(false);
        setNewCustomer({ tenKhachHang: '', soDienThoai: '', email: '', gioiTinh: true, maKhachHang: '', trangThai: 'Hoạt động' });
        setSuccessMessage('Tạo khách hàng thành công!');
        setTimeout(() => setSuccessMessage(null), 2500);
      } else {
        alert('Tạo khách hàng thất bại!');
      }
    } catch (e) {
      alert('Lỗi khi tạo khách hàng!');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* Hiển thị khách hàng đã chọn */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 12 }}>
          <span style={{ 
            minWidth: 120, 
            fontWeight: 700, 
            fontSize: 16,
            color: '#6b4f1d'
          }}>
            Khách hàng:
          </span>
          {selectedCustomer ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                flex: 1, 
                padding: '16px 20px', 
                borderRadius: 12, 
                border: '2px solid #b59d3a', 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                fontSize: 14,
                boxShadow: '0 4px 16px rgba(181, 157, 58, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ 
                  fontWeight: 700, 
                  color: '#6b4f1d', 
                  fontSize: 16,
                  marginBottom: 4
                }}>
                  {selectedCustomer.tenKhachHang}
                </div>
                <div style={{ 
                  fontSize: 13, 
                  color: '#8a7a2a',
                  marginBottom: 2
                }}>
                  📞 {selectedCustomer.soDienThoai}
                </div>
                <div style={{ 
                  fontSize: 13, 
                  color: '#8a7a2a',
                  marginBottom: 4
                }}>
                  📧 {selectedCustomer.email}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: '#b59d3a',
                  fontWeight: 600
                }}>
                  Mã: {selectedCustomer.maKhachHang} • {selectedCustomer.soDiaChi} địa chỉ
                </div>
              </div>
              <button
                onClick={handleRemoveCustomer}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)',
                  color: '#c62828',
                  border: '2px solid #c62828',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(198, 40, 40, 0.2)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(198, 40, 40, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(198, 40, 40, 0.2)';
                }}
                title="Bỏ chọn khách hàng"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowCustomerModal(true)}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '2px dashed #b59d3a',
                  background: 'linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#8a7a2a',
                  fontSize: 16,
                  fontWeight: 600,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                  e.currentTarget.style.borderStyle = 'solid';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.1)';
                  e.currentTarget.style.borderStyle = 'dashed';
                }}
              >
                👤 Chọn khách hàng...
              </button>
              <button
                title="Tạo khách hàng mới"
                onClick={() => setShowCreateModal(true)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2px solid #b59d3a',
                  background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
                  color: '#b59d3a',
                  fontSize: 20,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 16px rgba(181, 157, 58, 0.15)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(181, 157, 58, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)';
                  e.currentTarget.style.color = '#b59d3a';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.15)';
                }}
              >
                ➕
              </button>
            </>
          )}
        </div>

        {/* Hiển thị địa chỉ giao hàng khi bật giao hàng */}
        {isShipping && selectedCustomer && (
          <div style={{ marginTop: 16 }}>
            <div style={{ 
              fontWeight: 700, 
              marginBottom: 12, 
              fontSize: 16,
              color: '#6b4f1d'
            }}>
              🚚 Địa chỉ giao hàng:
            </div>
            {selectedCustomer.danhSachDiaChi && selectedCustomer.danhSachDiaChi.length > 0 ? (
              <div>
                <select
                  value={selectedAddress?.idDiaChi || ''}
                  onChange={(e) => {
                    const addressId = parseInt(e.target.value);
                    const address = selectedCustomer.danhSachDiaChi.find(addr => addr.idDiaChi === addressId);
                    onAddressSelectAction(address || null);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '2px solid #b59d3a',
                    background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#6b4f1d',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)'
                  }}
                  onFocus={e => {
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={e => {
                    e.target.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <option value="">📍 Chọn địa chỉ giao hàng</option>
                  {selectedCustomer.danhSachDiaChi.map((address) => (
                    <option key={address.idDiaChi} value={address.idDiaChi}>
                      {address.ngoNgach}, {address.xaPhuong}, {address.quanHuyen}, {address.thanhPho}
                      {address.macDinh === "Có" ? " (Mặc định)" : ""}
                    </option>
                  ))}
                </select>
                
                {selectedAddress && (
                  <div style={{
                    marginTop: 12,
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    borderRadius: 12,
                    border: '2px solid #4caf50',
                    fontSize: 14,
                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.15)'
                  }}>
                    <div style={{ 
                      fontWeight: 700, 
                      marginBottom: 8,
                      color: '#2e7d32',
                      fontSize: 16
                    }}>
                      📍 Thông tin địa chỉ:
                    </div>
                    <div style={{ color: '#388e3c', marginBottom: 4 }}>
                      🏠 {selectedAddress.ngoNgach}
                    </div>
                    <div style={{ color: '#388e3c', marginBottom: 4 }}>
                      🏘️ {selectedAddress.xaPhuong}, {selectedAddress.quanHuyen}, {selectedAddress.thanhPho}
                    </div>
                    {selectedAddress.ghiChu && (
                      <div style={{ color: '#388e3c', fontStyle: 'italic' }}>
                        📝 Ghi chú: {selectedAddress.ghiChu}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                border: '2px solid #ffc107',
                borderRadius: 12,
                color: '#856404',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(255, 193, 7, 0.15)'
              }}>
                ⚠️ Khách hàng này chưa có địa chỉ giao hàng
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal chọn khách hàng */}
      {showCustomerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 700,
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(181, 157, 58, 0.25)',
            border: '2px solid rgba(181, 157, 58, 0.1)',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '2px solid rgba(181, 157, 58, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                👥 Chọn khách hàng
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: 700
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{ 
              padding: '24px 32px', 
              borderBottom: '2px solid rgba(181, 157, 58, 0.1)',
              background: 'rgba(181, 157, 58, 0.05)'
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm theo tên, số điện thoại hoặc mã khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 48px',
                    borderRadius: 12,
                    border: '2px solid rgba(181, 157, 58, 0.2)',
                    fontSize: 16,
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: '#fff'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#b59d3a';
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 20,
                  color: '#b59d3a'
                }}>
                  🔍
                </div>
              </div>
            </div>

            {/* Customer list */}
            <div style={{ 
              maxHeight: '500px', 
              overflowY: 'auto',
              padding: '24px 32px'
            }}>
              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 40px', 
                  color: '#8a7a2a',
                  fontSize: 18,
                  fontWeight: 600
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                  Đang tải danh sách khách hàng...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 40px', 
                  color: '#8a7a2a',
                  fontSize: 18,
                  fontWeight: 600
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Không có khách hàng nào'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.idKhachHang}
                      onClick={() => handleCustomerSelect(customer)}
                      style={{
                        padding: '20px 24px',
                        border: '2px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: 16,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: selectedCustomer?.idKhachHang === customer.idKhachHang 
                          ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' 
                          : 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
                        boxShadow: '0 4px 16px rgba(181, 157, 58, 0.1)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(181, 157, 58, 0.2)';
                        e.currentTarget.style.borderColor = '#b59d3a';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.1)';
                        e.currentTarget.style.borderColor = selectedCustomer?.idKhachHang === customer.idKhachHang 
                          ? '#b59d3a' 
                          : 'rgba(181, 157, 58, 0.2)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: 700, 
                            color: '#6b4f1d', 
                            marginBottom: 8,
                            fontSize: 18
                          }}>
                            👤 {customer.tenKhachHang}
                          </div>
                          <div style={{ 
                            fontSize: 14, 
                            color: '#8a7a2a', 
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <span>📞 {customer.soDienThoai}</span>
                          </div>
                          <div style={{ 
                            fontSize: 14, 
                            color: '#8a7a2a', 
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <span>📧 {customer.email}</span>
                          </div>
                          <div style={{ 
                            fontSize: 13, 
                            color: '#b59d3a',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <span>🏷️ Mã: {customer.maKhachHang}</span>
                            <span>📍 {customer.soDiaChi} địa chỉ</span>
                          </div>
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: customer.trangThai === 'Hoạt động' 
                            ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' 
                            : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                          color: customer.trangThai === 'Hoạt động' ? '#2e7d32' : '#f57c00',
                          border: `2px solid ${customer.trangThai === 'Hoạt động' ? '#4caf50' : '#ff9800'}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          {customer.trangThai === 'Hoạt động' ? '✅' : '⏸️'} {customer.trangThai}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo khách hàng mới */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
            borderRadius: 20,
            width: 420,
            padding: 32,
            boxShadow: '0 12px 48px rgba(181, 157, 58, 0.25)',
            border: '2px solid rgba(181, 157, 58, 0.1)',
            position: 'relative',
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflow: 'auto',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 20,
                fontSize: 24,
                background: 'rgba(181, 157, 58, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
                color: '#6b4f1d',
                fontWeight: 700,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(181, 157, 58, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(181, 157, 58, 0.1)';
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
            >✕</button>
            <h3 style={{ 
              margin: 0, 
              marginBottom: 24, 
              textAlign: 'center', 
              fontSize: 24, 
              fontWeight: 700,
              color: '#6b4f1d',
              letterSpacing: 0.5
            }}>➕ Tạo khách hàng mới</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCreateCustomer();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  marginBottom: 8, 
                  display: 'block', 
                  fontSize: 14, 
                  color: '#6b4f1d' 
                }}>👤 Tên khách hàng *</label>
                <input
                  type="text"
                  value={newCustomer.tenKhachHang}
                  onChange={e => setNewCustomer({ ...newCustomer, tenKhachHang: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 12, 
                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                    outline: 'none', 
                    fontSize: 14,
                    fontWeight: 500,
                    background: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#b59d3a';
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  marginBottom: 8, 
                  display: 'block', 
                  fontSize: 14, 
                  color: '#6b4f1d' 
                }}>📞 Số điện thoại *</label>
                <input
                  type="text"
                  value={newCustomer.soDienThoai}
                  onChange={e => setNewCustomer({ ...newCustomer, soDienThoai: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 12, 
                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                    outline: 'none', 
                    fontSize: 14,
                    fontWeight: 500,
                    background: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#b59d3a';
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  marginBottom: 8, 
                  display: 'block', 
                  fontSize: 14, 
                  color: '#6b4f1d' 
                }}>📧 Email *</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 12, 
                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                    outline: 'none', 
                    fontSize: 14,
                    fontWeight: 500,
                    background: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#b59d3a';
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  marginBottom: 8, 
                  display: 'block', 
                  fontSize: 14, 
                  color: '#6b4f1d' 
                }}>👥 Giới tính</label>
                <select
                  value={newCustomer.gioiTinh ? 'true' : 'false'}
                  onChange={e => setNewCustomer({ ...newCustomer, gioiTinh: e.target.value === 'true' })}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 12, 
                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                    outline: 'none', 
                    fontSize: 14,
                    fontWeight: 500,
                    background: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#b59d3a';
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <option value="true">👨 Nam</option>
                  <option value="false">👩 Nữ</option>
                </select>
              </div>
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  marginBottom: 8, 
                  display: 'block', 
                  fontSize: 14, 
                  color: '#6b4f1d' 
                }}>🏷️ Mã khách hàng (tùy chọn)</label>
                <input
                  type="text"
                  value={newCustomer.maKhachHang}
                  onChange={e => setNewCustomer({ ...newCustomer, maKhachHang: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 12, 
                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                    outline: 'none', 
                    fontSize: 14,
                    fontWeight: 500,
                    background: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#b59d3a';
                    e.target.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  background: creating 
                    ? 'rgba(181, 157, 58, 0.3)' 
                    : 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  marginTop: 8,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: creating 
                    ? 'none' 
                    : '0 4px 16px rgba(181, 157, 58, 0.3)'
                }}
                onMouseOver={e => {
                  if (!creating) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(181, 157, 58, 0.4)';
                  }
                }}
                onMouseOut={e => {
                  if (!creating) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(181, 157, 58, 0.3)';
                  }
                }}
              >
                {creating ? '⏳ Đang tạo...' : '✅ Tạo khách hàng'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
          fontWeight: 700,
          fontSize: 16,
          zIndex: 4000,
          border: '2px solid #4caf50',
          animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          ✅ {successMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 