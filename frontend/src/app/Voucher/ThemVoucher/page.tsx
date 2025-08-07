"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../component/Admin-Layout';
import { useRouter } from 'next/navigation';
import { FaTimes, FaPlus } from 'react-icons/fa';
import MuiDateTimeInput from '../../../component/MuiDateTimeInput';
import dayjs from 'dayjs';

const apiUrl = 'http://localhost:8080/api/voucher';

const parseDate = (dateStr: string | undefined) => {
  if (!dateStr) return null;
  // Parse thủ công thành Date local
  const match = dateStr.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/);
  if (!match) return null;
  return new Date(
      Number(match[1]), // year
      Number(match[2]) - 1, // month (0-based)
      Number(match[3]), // day
      Number(match[4]), // hour
      Number(match[5]), // minute
      Number(match[6]) // second
  );
};

type FormType = {
  maPhieuGiamGia: string;
  tenPhieuGiamGia: string;
  kieuGiamGia: string;
  giaTriToiThieu: string;
  giaTriToiDa: string;
  phanTramGiamGia: string;
  soLuong: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  moTa: string;
};

type FormErrorsType = Partial<Record<keyof FormType, string>>;

const ThemVoucherPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormType>({
    maPhieuGiamGia: '',
    tenPhieuGiamGia: '',
    kieuGiamGia: '',
    giaTriToiThieu: '',
    giaTriToiDa: '',
    phanTramGiamGia: '',
    soLuong: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    moTa: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Toast tự động ẩn
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: FormErrorsType = {};
    if (!form.maPhieuGiamGia || !form.maPhieuGiamGia.trim()) errors.maPhieuGiamGia = 'Mã không được để trống';
    else if (!/^[a-zA-Z0-9]+$/.test(form.maPhieuGiamGia)) errors.maPhieuGiamGia = 'Mã chỉ được chứa chữ và số, không có ký tự đặc biệt';
    if (!form.tenPhieuGiamGia || !form.tenPhieuGiamGia.trim()) errors.tenPhieuGiamGia = 'Tên không được để trống';
    else if (form.tenPhieuGiamGia.length > 100) errors.tenPhieuGiamGia = 'Tên không quá 100 ký tự';
    if (!form.kieuGiamGia) errors.kieuGiamGia = 'Vui lòng chọn kiểu';
    if (!form.soLuong || isNaN(Number(form.soLuong)) || Number(form.soLuong) < 1) errors.soLuong = 'Số lượng phải lớn hơn 0';
    if (!form.giaTriToiThieu || isNaN(Number(form.giaTriToiThieu)) || Number(form.giaTriToiThieu) < 0) errors.giaTriToiThieu = 'Giá trị tối thiểu phải >= 0';
    if (form.kieuGiamGia === 'PERCENT') {
      if (form.giaTriToiDa === '' || form.giaTriToiDa === null || form.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị giảm tối đa không được để trống';
      else if (isNaN(Number(form.giaTriToiDa))) errors.giaTriToiDa = 'Giá trị giảm tối đa phải là số';
      else if (Number(form.giaTriToiDa) <= 0) errors.giaTriToiDa = 'Giá trị giảm tối đa phải lớn hơn 0';
    } else if (form.kieuGiamGia === 'FREE_SHIP') {
      if (form.giaTriToiDa === '' || form.giaTriToiDa === null || form.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị tối đa không được để trống';
      else if (isNaN(Number(form.giaTriToiDa))) errors.giaTriToiDa = 'Giá trị tối đa phải là số';
      else if (Number(form.giaTriToiDa) !== 0) errors.giaTriToiDa = 'Giá trị tối đa phải = 0';
      if (form.phanTramGiamGia === '' || form.phanTramGiamGia === null || form.phanTramGiamGia === undefined) errors.phanTramGiamGia = 'Phần trăm giảm không được để trống';
      else if (isNaN(Number(form.phanTramGiamGia))) errors.phanTramGiamGia = 'Phần trăm giảm phải là số';
      else if (Number(form.phanTramGiamGia) !== 0) errors.phanTramGiamGia = 'Phần trăm giảm phải = 0';
    } else if (form.kieuGiamGia === 'FIXED') {
      if (form.phanTramGiamGia === '' || form.phanTramGiamGia === null || form.phanTramGiamGia === undefined) errors.phanTramGiamGia = 'Phần trăm giảm không được để trống';
      else if (isNaN(Number(form.phanTramGiamGia))) errors.phanTramGiamGia = 'Phần trăm giảm phải là số';
      else if (Number(form.phanTramGiamGia) !== 0) errors.phanTramGiamGia = 'Phần trăm giảm phải = 0';
      if (form.giaTriToiDa === '' || form.giaTriToiDa === null || form.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị tối đa không được để trống';
      else if (isNaN(Number(form.giaTriToiDa)) || Number(form.giaTriToiDa) < 0) errors.giaTriToiDa = 'Giá trị tối đa phải >= 0';
    } else {
      if (form.giaTriToiDa === '' || form.giaTriToiDa === null || form.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị tối đa không được để trống';
      else if (isNaN(Number(form.giaTriToiDa)) || Number(form.giaTriToiDa) < 0) errors.giaTriToiDa = 'Giá trị tối đa phải >= 0';
    }
    if (!form.phanTramGiamGia || isNaN(Number(form.phanTramGiamGia)) || Number(form.phanTramGiamGia) < 0) errors.phanTramGiamGia = 'Phần trăm giảm phải >= 0';
    if (!form.ngayBatDau) errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
    else {
      const startDate = parseDate(form.ngayBatDau);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate && startDate < today) errors.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn hôm nay';
    }
    if (!form.ngayKetThuc) errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
    if (form.ngayBatDau && form.ngayKetThuc) {
      const startDate = parseDate(form.ngayBatDau);
      const endDate = parseDate(form.ngayKetThuc);
      if (startDate && endDate && startDate >= endDate) errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let backendError = 'Lỗi khi lưu phiếu giảm giá';
        try {
          const data = await res.json();
          if (data && typeof data === 'object' && data.message) {
            setFormErrors(prev => ({ ...prev, maPhieuGiamGia: data.message }));
            setSaving(false);
            return;
          }
        } catch {}
        setFormErrors(prev => ({ ...prev, maPhieuGiamGia: backendError }));
        setSaving(false);
        return;
      }
      setSuccess('Thêm phiếu giảm giá thành công');
      setTimeout(() => {
        router.push('/Voucher/HienThi');
      }, 800);
    } catch (e) {
      setError('Lỗi khi lưu phiếu giảm giá');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/Voucher/HienThi');
  };

  return (
      <AdminLayout activeMenu="promotions" onMenuChangeAction={() => {}} pageTitle="Thêm phiếu giảm giá">
        <div style={{ padding: 20, background: '#fffbe6', minHeight: '100vh' }}>
          {/* Toast thông báo góc phải */}
          {success && (
              <div style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 2000,
                background: '#2ecc40',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(46, 204, 64, 0.3)',
                minWidth: 220,
                textAlign: 'center'
              }}>
                {success}
              </div>
          )}
          {error && (
              <div style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 2000,
                background: '#e74c3c',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
                minWidth: 220,
                textAlign: 'center'
              }}>
                {error}
              </div>
          )}
          
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
            padding: 32,
            maxWidth: 1200,
            margin: '0 auto',
            border: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            <h2 style={{ 
              color: '#6b4f1d', 
              fontWeight: 700, 
              marginBottom: 24, 
              fontSize: '24px',
              textAlign: 'center',
              borderBottom: '2px solid #e6d8b4',
              paddingBottom: '12px'
            }}>Thêm phiếu giảm giá mới</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Thông tin cơ bản */}
                <div style={{ 
                  background: '#f9f9f9', 
                  borderRadius: 12, 
                  padding: 24,
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ 
                    color: '#6b4f1d', 
                    fontWeight: 600, 
                    marginBottom: 20, 
                    fontSize: '18px'
                  }}>Thông tin cơ bản</h3>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Mã giảm giá:
                      </label>
                      <input 
                        name="maPhieuGiamGia" 
                        value={form.maPhieuGiamGia} 
                        onChange={handleInputChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 8, 
                          border: '2px solid #e6d8b4', 
                          fontSize: '14px',
                          background: '#fff',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                      />
                      {formErrors.maPhieuGiamGia && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.maPhieuGiamGia}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Tên giảm giá:
                      </label>
                      <input 
                        name="tenPhieuGiamGia" 
                        value={form.tenPhieuGiamGia} 
                        onChange={handleInputChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 8, 
                          border: '2px solid #e6d8b4', 
                          fontSize: '14px',
                          background: '#fff',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                      />
                      {formErrors.tenPhieuGiamGia && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.tenPhieuGiamGia}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Kiểu giảm giá:
                      </label>
                      <select
                          name="kieuGiamGia"
                          value={form.kieuGiamGia}
                          onChange={handleSelectChange}
                          required
                          style={{ 
                            width: '100%', 
                            padding: '12px 16px', 
                            borderRadius: 8, 
                            border: '2px solid #e6d8b4', 
                            fontSize: '14px',
                            background: '#fff',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                      >
                        <option value="">-- Chọn kiểu --</option>
                        <option value="PERCENT">Phần trăm</option>
                        <option value="FIXED">Giảm trực tiếp</option>
                        <option value="FREE_SHIP">Free ship</option>
                      </select>
                      {formErrors.kieuGiamGia && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.kieuGiamGia}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin giá trị */}
                <div style={{ 
                  background: '#f9f9f9', 
                  borderRadius: 12, 
                  padding: 24,
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ 
                    color: '#6b4f1d', 
                    fontWeight: 600, 
                    marginBottom: 20, 
                    fontSize: '18px'
                  }}>Thông tin giá trị</h3>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Giá trị tối thiểu của đơn hàng:
                      </label>
                      <input 
                        name="giaTriToiThieu" 
                        type="number" 
                        value={form.giaTriToiThieu} 
                        onChange={handleInputChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 8, 
                          border: '2px solid #e6d8b4', 
                          fontSize: '14px',
                          background: '#fff',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                      />
                      {formErrors.giaTriToiThieu && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.giaTriToiThieu}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Giá trị giảm tối đa của đơn hàng:
                      </label>
                      <input 
                        name="giaTriToiDa" 
                        type="number" 
                        value={form.giaTriToiDa} 
                        onChange={handleInputChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 8, 
                          border: '2px solid #e6d8b4', 
                          fontSize: '14px',
                          background: '#fff',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                      />
                      {formErrors.giaTriToiDa && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.giaTriToiDa}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Phần trăm giảm:
                      </label>
                      <input 
                        name="phanTramGiamGia" 
                        type="number" 
                        value={form.phanTramGiamGia} 
                        onChange={handleInputChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 8, 
                          border: '2px solid #e6d8b4', 
                          fontSize: '14px',
                          background: '#fff',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                      />
                      {formErrors.phanTramGiamGia && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.phanTramGiamGia}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin thời gian và số lượng */}
                <div style={{ 
                  background: '#f9f9f9', 
                  borderRadius: 12, 
                  padding: 24,
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ 
                    color: '#6b4f1d', 
                    fontWeight: 600, 
                    marginBottom: 20, 
                    fontSize: '18px'
                  }}>Thông tin thời gian và số lượng</h3>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Số lượng:
                      </label>
                      <input 
                        name="soLuong" 
                        type="number" 
                        value={form.soLuong} 
                        onChange={handleInputChange} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 8, 
                          border: '2px solid #e6d8b4', 
                          fontSize: '14px',
                          background: '#fff',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                        onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                      />
                      {formErrors.soLuong && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.soLuong}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Ngày bắt đầu:
                      </label>
                      <MuiDateTimeInput
                          value={parseDate(form.ngayBatDau)}
                          onChange={date => setForm(prev => ({ ...prev, ngayBatDau: date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '' }))}
                      />
                      {formErrors.ngayBatDau && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.ngayBatDau}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#6b4f1d', 
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Ngày kết thúc:
                      </label>
                      <MuiDateTimeInput
                          value={parseDate(form.ngayKetThuc)}
                          onChange={date => setForm(prev => ({ ...prev, ngayKetThuc: date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '' }))}
                          minDateTime={parseDate(form.ngayBatDau) || undefined}
                      />
                      {formErrors.ngayKetThuc && (
                        <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.ngayKetThuc}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mô tả */}
                <div style={{ 
                  background: '#f9f9f9', 
                  borderRadius: 12, 
                  padding: 24,
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ 
                    color: '#6b4f1d', 
                    fontWeight: 600, 
                    marginBottom: 20, 
                    fontSize: '18px'
                  }}>Mô tả</h3>
                  <div>
                    <label style={{ 
                      fontWeight: 600, 
                      color: '#6b4f1d', 
                      fontSize: '14px',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Mô tả:
                    </label>
                    <textarea 
                      name="moTa" 
                      value={form.moTa} 
                      onChange={handleInputChange} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: 8, 
                        border: '2px solid #e6d8b4', 
                        fontSize: '14px',
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        outline: 'none',
                        minHeight: 80,
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                      onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: 16, 
                marginTop: 32, 
                justifyContent: 'center',
                paddingTop: 24,
                borderTop: '2px solid #e6d8b4'
              }}>
                <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      background: '#fff',
                      color: '#666',
                      border: '2px solid #e0e0e0',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#b59d3a';
                      e.currentTarget.style.color = '#b59d3a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.color = '#666';
                    }}
                >
                  <FaTimes style={{ fontSize: 14 }} />
                  Hủy
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 32px',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(181, 157, 58, 0.3)',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(181, 157, 58, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                      }
                    }}
                >
                  <FaPlus style={{ fontSize: 14 }} />
                  {saving ? 'Đang thêm...' : 'Thêm phiếu giảm giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
  );
};

export default ThemVoucherPage;