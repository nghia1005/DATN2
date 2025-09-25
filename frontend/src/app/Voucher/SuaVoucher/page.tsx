"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../../component/Admin-Layout';
import { FaTimes, FaPlus, FaSave } from 'react-icons/fa';
import MuiDateTimeInput from '../../../component/MuiDateTimeInput';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const apiUrl = 'http://localhost:8080/api/voucher';

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

// Modal Component
const EditVoucherModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  formErrors,
  handleInputChange,
  handleSelectChange,
  handleSubmit,
  saving,
  parseDate
}: {
  isOpen: boolean;
  onClose: () => void;
  form: FormType | null;
  setForm: React.Dispatch<React.SetStateAction<FormType | null>>;
  formErrors: FormErrorsType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  parseDate: (dateStr: string | undefined) => Date | null;
}) => {
  if (!isOpen || !form) return null;

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '1000px',
        overflow: 'auto',
        position: 'relative',
        border: '1px solid rgba(181, 157, 58, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px 0 32px',
          borderBottom: '2px solid #e6d8b4',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              color: '#6b4f1d',
              fontWeight: 700,
              fontSize: '24px',
              margin: 0
            }}>
              Sửa phiếu giảm giá
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#666',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
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
                    <div
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '2px solid #e6d8b4',
                        fontSize: '14px',
                        background: '#f5f5f5',
                        color: '#666',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {form.maPhieuGiamGia}
                    </div>
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
                      onChange={date => setForm(prev => prev ? { ...prev, ngayBatDau: date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '' } : prev)}
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
                      onChange={date => setForm(prev => prev ? { ...prev, ngayKetThuc: date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '' } : prev)}
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
                onClick={onClose}
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
                <FaSave style={{ fontSize: 14 }} />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SuaVoucherPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [form, setForm] = useState<FormType | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${apiUrl}/${id}`)
      .then(res => res.json())
      .then(data => {
        // Không chuyển đổi kieuGiamGia nữa, giữ nguyên giá trị từ backend
        setForm({
          maPhieuGiamGia: data.maPhieuGiamGia || '',
          tenPhieuGiamGia: data.tenPhieuGiamGia || '',
          kieuGiamGia: data.kieuGiamGia || '',
          giaTriToiThieu: String(data.giaTriToiThieu ?? ''),
          giaTriToiDa: String(data.giaTriToiDa ?? ''),
          phanTramGiamGia: String(data.phanTramGiamGia ?? ''),
          soLuong: String(data.soLuong ?? ''),
          ngayBatDau: data.ngayBatDau || '',
          ngayKetThuc: data.ngayKetThuc || '',
          moTa: data.moTa || '',
        });
        setIsModalOpen(true);
      })
      .catch(() => setError('Không tìm thấy phiếu giảm giá'))
      .finally(() => setLoading(false));
  }, [id]);

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
    setForm((prev) => prev ? { ...prev, [name]: value } : prev);
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  const validateForm = () => {
    const errors: FormErrorsType = {};
    if (!form?.maPhieuGiamGia || !form.maPhieuGiamGia.trim()) errors.maPhieuGiamGia = 'Mã không được để trống';
    if (!form?.tenPhieuGiamGia || !form.tenPhieuGiamGia.trim()) errors.tenPhieuGiamGia = 'Tên không được để trống';
    if (!form?.kieuGiamGia) errors.kieuGiamGia = 'Vui lòng chọn kiểu';
    if (!form?.soLuong || isNaN(Number(form.soLuong)) || Number(form.soLuong) < 1) errors.soLuong = 'Số lượng phải lớn hơn 0';
    if (!form?.giaTriToiThieu || isNaN(Number(form.giaTriToiThieu)) || Number(form.giaTriToiThieu) < 0) errors.giaTriToiThieu = 'Giá trị tối thiểu phải >= 0';
    if (form) {
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
    }
    if (!form?.phanTramGiamGia || isNaN(Number(form.phanTramGiamGia)) || Number(form.phanTramGiamGia) < 0) errors.phanTramGiamGia = 'Phần trăm giảm phải >= 0';
    if (!form?.ngayBatDau) errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
    if (!form?.ngayKetThuc) errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
    if (form?.ngayBatDau && form?.ngayKetThuc && form.ngayBatDau > form.ngayKetThuc) errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
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
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật phiếu giảm giá');
      setSuccess('Cập nhật phiếu giảm giá thành công');
      setIsModalOpen(false);
      setTimeout(() => {
        router.push('/Voucher/HienThi');
      }, 1500);
    } catch (e) {
      setError('Lỗi khi cập nhật phiếu giảm giá');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/Voucher/HienThi');
  };

  if (loading) return <div style={{ padding: 32 }}>Đang tải dữ liệu...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;

  return (
    <AdminLayout activeMenu="promotions" onMenuChangeAction={() => {}} pageTitle="Sửa phiếu giảm giá">
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

        {/* Modal */}
        <EditVoucherModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleSubmit={handleSubmit}
          saving={saving}
          parseDate={parseDate}
        />
      </div>
    </AdminLayout>
  );
};

export default SuaVoucherPage;