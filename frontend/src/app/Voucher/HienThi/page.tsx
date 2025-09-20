"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../component/Admin-Layout';
import { FaEye, FaEdit, FaPowerOff, FaTimes, FaSave, FaPlus } from 'react-icons/fa';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useRouter } from 'next/navigation';
import MuiDateTimeInput from '../../../component/MuiDateTimeInput';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

interface Voucher {
  idPhieuGiamGia: number;
  maPhieuGiamGia: string;
  tenPhieuGiamGia: string;
  kieuGiamGia: string;
  giaTriToiThieu: number;
  giaTriToiDa: number;
  soLuong: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  moTa: string;
  trangThai: string;
  phanTramGiamGia: number;
}

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

const apiUrl = 'http://localhost:8080/api/voucher';

const kieuGiamGiaHienThi = (ma: string) => {
  switch (ma) {
    case 'PERCENT':
      return 'Giảm theo phần trăm';
    case 'FIXED':
      return 'Giảm trực tiếp';
    case 'FREE_SHIP':
      return 'Free ship';
    default:
      return ma;
  }
};

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
}

function formatDateTime(dateStr: string | undefined) {
  if (!dateStr) return '';
  // Parse thủ công thành Date local giống như form sửa
  const match = dateStr.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/);
  if (!match) return dateStr;
  const d = new Date(
      Number(match[1]), // year
      Number(match[2]) - 1, // month (0-based)
      Number(match[3]), // day
      Number(match[4]), // hour
      Number(match[5]), // minute
      Number(match[6]) // second
  );
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

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

// Hàm xác định trạng thái hiển thị
function getVoucherStatus(v: Voucher) {
  if (v.trangThai === 'Tạm ngưng' || v.trangThai === 'Kết thúc sớm') return 'Kết thúc sớm';
  
  // Kiểm tra số lượng trước
  if (v.soLuong <= 0) return 'Hết voucher';
  
  const now = new Date();
  const start = new Date(v.ngayBatDau);
  const end = new Date(v.ngayKetThuc);
  if (now < start) return 'Sắp diễn ra';
  if (now > end) return 'Đã kết thúc';
  return 'Đang diễn ra';
}

const HienThiVoucherPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<string>('');
  const router = useRouter();
  
  // Modal sửa voucher
  const [editForm, setEditForm] = useState<FormType | null>(null);
  const [editFormErrors, setEditFormErrors] = useState<FormErrorsType>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Modal thêm voucher
  const [addForm, setAddForm] = useState<FormType>({
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
  const [addFormErrors, setAddFormErrors] = useState<FormErrorsType>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');

  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVouchers(data);
      } else {
        setVouchers([]);
        setError(`Dữ liệu không hợp lệ từ server: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      setVouchers([]);
      const errorMessage = e instanceof Error ? e.message : 'Lỗi không xác định';
      setError(`Lỗi khi tải danh sách phiếu giảm giá: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Toast tự động ẩn cho edit modal
  useEffect(() => {
    if (editSuccess) {
      const timer = setTimeout(() => setEditSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [editSuccess]);
  useEffect(() => {
    if (editError) {
      const timer = setTimeout(() => setEditError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [editError]);

  // Toast tự động ẩn cho add modal
  useEffect(() => {
    if (addSuccess) {
      const timer = setTimeout(() => setAddSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [addSuccess]);
  useEffect(() => {
    if (addError) {
      const timer = setTimeout(() => setAddError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [addError]);

  // Lọc, tìm kiếm
  const filteredVouchers = Array.isArray(vouchers) ? vouchers.filter(v => {
    const matchStatus = !filterStatus || v.trangThai === filterStatus;
    const matchType = !filterType || v.kieuGiamGia === filterType;
    const matchSearch =
        !search ||
        v.maPhieuGiamGia.toLowerCase().includes(search.toLowerCase()) ||
        v.tenPhieuGiamGia.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  }) : [];

  // Sắp xếp voucher mới nhất lên đầu (idPhieuGiamGia giảm dần)
  const sortedVouchers = filteredVouchers.slice().sort((a, b) => b.idPhieuGiamGia - a.idPhieuGiamGia);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType, search, Array.isArray(vouchers) ? vouchers.length : 0]);

  // Phân trang
  const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage);
  const paginatedVouchers = sortedVouchers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // Đổi trạng thái voucher
  const handleToggleStatus = async (voucher: Voucher) => {
    if (actionLoadingId) return;
    setActionLoadingId(voucher.idPhieuGiamGia);
    setActionMsg('');
    try {
      const res = await fetch(`${apiUrl}/doi-trang-thai/${voucher.idPhieuGiamGia}`, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Lỗi đổi trạng thái');
      }
      setActionMsg('Đổi trạng thái thành công!');
      // Nếu backend trả về trạng thái mới, dùng nó. Nếu không, tự chuyển đổi trạng thái
      let newStatus = '';
      try {
        const data = await res.json();
        if (data && data.trangThai) {
          newStatus = data.trangThai;
        }
      } catch {
        // Nếu không parse được JSON, fallback
      }
      setVouchers(prev =>
          prev.map(v =>
              v.idPhieuGiamGia === voucher.idPhieuGiamGia
                  ? { ...v, trangThai: newStatus || (v.trangThai === 'Đang diễn ra' ? 'Kết thúc sớm' : 'Đang diễn ra') }
                  : v
          )
      );
    } catch (e: any) {
      setActionMsg(e.message || 'Lỗi đổi trạng thái');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setActionMsg(''), 2500);
    }
  };

  // Mở modal sửa voucher
  const handleEditVoucher = async (voucher: Voucher) => {
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`${apiUrl}/${voucher.idPhieuGiamGia}`);
      if (!res.ok) throw new Error('Không tìm thấy phiếu giảm giá');
      const data = await res.json();
      setEditForm({
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
      setShowEditModal(true);
    } catch (e: any) {
      setEditError(e.message || 'Lỗi khi tải dữ liệu voucher');
    } finally {
      setEditLoading(false);
    }
  };

  // Xử lý input change cho form sửa
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Ngăn nhập số âm cho các trường số
    if (name === 'soLuong' || name === 'giaTriToiThieu' || name === 'giaTriToiDa' || name === 'phanTramGiamGia') {
      const numValue = parseFloat(value);
      if (value !== '' && (isNaN(numValue) || numValue < 0)) {
        return; // Không cập nhật nếu là số âm
      }
    }
    
    setEditForm((prev) => prev ? { ...prev, [name]: value } : prev);
    
    // Clear error khi user bắt đầu nhập
    if (editFormErrors[name as keyof FormType]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => prev ? { ...prev, [name]: value } : prev);
    
    // Clear error khi user chọn
    if (editFormErrors[name as keyof FormType]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate real-time cho từng field của form sửa
  const validateEditField = (name: keyof FormType, value: string) => {
    const errors: FormErrorsType = {};
    
    switch (name) {
      case 'maPhieuGiamGia':
        if (!value || !value.trim()) {
          errors.maPhieuGiamGia = 'Mã không được để trống';
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          errors.maPhieuGiamGia = 'Mã chỉ được chứa chữ và số, không có ký tự đặc biệt';
        } else if (value.length < 3) {
          errors.maPhieuGiamGia = 'Mã phải có ít nhất 3 ký tự';
        } else if (value.length > 20) {
          errors.maPhieuGiamGia = 'Mã không được quá 20 ký tự';
        }
        break;
        
      case 'tenPhieuGiamGia':
        if (!value || !value.trim()) {
          errors.tenPhieuGiamGia = 'Tên không được để trống';
        } else if (value.length < 5) {
          errors.tenPhieuGiamGia = 'Tên phải có ít nhất 5 ký tự';
        } else if (value.length > 100) {
          errors.tenPhieuGiamGia = 'Tên không quá 100 ký tự';
        }
        break;
        
      case 'kieuGiamGia':
        if (!value) {
          errors.kieuGiamGia = 'Vui lòng chọn kiểu';
        }
        break;
        
      case 'soLuong':
        if (!value || value.trim() === '') {
          errors.soLuong = 'Số lượng không được để trống';
        } else if (isNaN(Number(value))) {
          errors.soLuong = 'Số lượng phải là số';
        } else if (Number(value) <= 0) {
          errors.soLuong = 'Số lượng phải lớn hơn 0';
        } else if (Number(value) > 10000) {
          errors.soLuong = 'Số lượng không được quá 10,000';
        } else if (!Number.isInteger(Number(value))) {
          errors.soLuong = 'Số lượng phải là số nguyên';
        }
        break;
        
      case 'ngayBatDau':
        if (!value) {
          errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
        } else {
          const startDate = parseDate(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDate && startDate < today) {
            errors.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn hôm nay';
          }
        }
        break;
        
      case 'ngayKetThuc':
        if (!value) {
          errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
        } else if (editForm?.ngayBatDau && value) {
          const startDate = parseDate(editForm.ngayBatDau);
          const endDate = parseDate(value);
          if (startDate && endDate && startDate >= endDate) {
            errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
          } else if (startDate && endDate) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff < 1) {
              errors.ngayKetThuc = 'Thời gian voucher phải ít nhất 1 giờ';
            }
          }
        }
        break;
        
      case 'moTa':
        if (value && value.trim() !== '' && value.length > 500) {
          errors.moTa = 'Mô tả không được quá 500 ký tự';
        }
        break;
    }
    
    return errors[name] || '';
  };

  // Handle blur để validate cho form sửa
  const handleEditBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateEditField(name as keyof FormType, value);
    setEditFormErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validate form sửa
  const validateEditForm = () => {
    const errors: FormErrorsType = {};
    if (!editForm?.maPhieuGiamGia || !editForm.maPhieuGiamGia.trim()) errors.maPhieuGiamGia = 'Mã không được để trống';
    if (!editForm?.tenPhieuGiamGia || !editForm.tenPhieuGiamGia.trim()) errors.tenPhieuGiamGia = 'Tên không được để trống';
    if (!editForm?.kieuGiamGia) errors.kieuGiamGia = 'Vui lòng chọn kiểu';
    if (!editForm?.soLuong || isNaN(Number(editForm.soLuong)) || Number(editForm.soLuong) < 1) errors.soLuong = 'Số lượng phải lớn hơn 0';
    if (!editForm?.giaTriToiThieu || isNaN(Number(editForm.giaTriToiThieu)) || Number(editForm.giaTriToiThieu) < 0) errors.giaTriToiThieu = 'Giá trị tối thiểu phải >= 0';
    if (editForm) {
      if (editForm.kieuGiamGia === 'PERCENT') {
        if (editForm.giaTriToiDa === '' || editForm.giaTriToiDa === null || editForm.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị giảm tối đa không được để trống';
        else if (isNaN(Number(editForm.giaTriToiDa))) errors.giaTriToiDa = 'Giá trị giảm tối đa phải là số';
        else if (Number(editForm.giaTriToiDa) <= 0) errors.giaTriToiDa = 'Giá trị giảm tối đa phải lớn hơn 0';
      } else if (editForm.kieuGiamGia === 'FREE_SHIP') {
        if (editForm.giaTriToiDa === '' || editForm.giaTriToiDa === null || editForm.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị tối đa không được để trống';
        else if (isNaN(Number(editForm.giaTriToiDa))) errors.giaTriToiDa = 'Giá trị tối đa phải là số';
        else if (Number(editForm.giaTriToiDa) !== 0) errors.giaTriToiDa = 'Giá trị tối đa phải = 0';
        if (editForm.phanTramGiamGia === '' || editForm.phanTramGiamGia === null || editForm.phanTramGiamGia === undefined) errors.phanTramGiamGia = 'Phần trăm giảm không được để trống';
        else if (isNaN(Number(editForm.phanTramGiamGia))) errors.phanTramGiamGia = 'Phần trăm giảm phải là số';
        else if (Number(editForm.phanTramGiamGia) !== 0) errors.phanTramGiamGia = 'Phần trăm giảm phải = 0';
      } else if (editForm.kieuGiamGia === 'FIXED') {
        if (editForm.phanTramGiamGia === '' || editForm.phanTramGiamGia === null || editForm.phanTramGiamGia === undefined) errors.phanTramGiamGia = 'Phần trăm giảm không được để trống';
        else if (isNaN(Number(editForm.phanTramGiamGia))) errors.phanTramGiamGia = 'Phần trăm giảm phải là số';
        else if (Number(editForm.phanTramGiamGia) !== 0) errors.phanTramGiamGia = 'Phần trăm giảm phải = 0';
        if (editForm.giaTriToiDa === '' || editForm.giaTriToiDa === null || editForm.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị tối đa không được để trống';
        else if (isNaN(Number(editForm.giaTriToiDa)) || Number(editForm.giaTriToiDa) < 0) errors.giaTriToiDa = 'Giá trị tối đa phải >= 0';
      } else {
        if (editForm.giaTriToiDa === '' || editForm.giaTriToiDa === null || editForm.giaTriToiDa === undefined) errors.giaTriToiDa = 'Giá trị tối đa không được để trống';
        else if (isNaN(Number(editForm.giaTriToiDa)) || Number(editForm.giaTriToiDa) < 0) errors.giaTriToiDa = 'Giá trị tối đa phải >= 0';
      }
    }
    if (!editForm?.phanTramGiamGia || isNaN(Number(editForm.phanTramGiamGia)) || Number(editForm.phanTramGiamGia) < 0) errors.phanTramGiamGia = 'Phần trăm giảm phải >= 0';
    if (!editForm?.ngayBatDau) errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
    if (!editForm?.ngayKetThuc) errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
    if (editForm?.ngayBatDau && editForm?.ngayKetThuc && editForm.ngayBatDau > editForm.ngayKetThuc) errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
    return errors;
  };

  // Submit form sửa
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    
    const errors = validateEditForm();
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Hiển thị confirm dialog
    const kieuGiamGiaText = editForm?.kieuGiamGia === 'PERCENT' ? 'Giảm theo phần trăm' : 
                           editForm?.kieuGiamGia === 'FIXED' ? 'Giảm cố định' : 'Miễn phí ship';
    
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn cập nhật phiếu giảm giá "${editForm?.tenPhieuGiamGia}"?\n\n` +
      `Mã: ${editForm?.maPhieuGiamGia}\n` +
      `Kiểu: ${kieuGiamGiaText}\n` +
      `Số lượng: ${editForm?.soLuong}\n` +
      `Thời gian: ${editForm?.ngayBatDau} - ${editForm?.ngayKetThuc}`
    );
    
    if (!confirmed) {
      return;
    }
    
    setEditSaving(true);
    try {
      const selectedVoucherId = selectedVoucher?.idPhieuGiamGia;
      if (!selectedVoucherId) throw new Error('Không tìm thấy ID voucher');
      
      const res = await fetch(`${apiUrl}/${selectedVoucherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật phiếu giảm giá');
      setEditSuccess('Cập nhật phiếu giảm giá thành công');
      setShowEditModal(false);
      // Refresh danh sách voucher
      fetchVouchers();
    } catch (e: any) {
      setEditError(e.message || 'Lỗi khi cập nhật phiếu giảm giá');
    } finally {
      setEditSaving(false);
    }
  };

  // Đóng modal sửa
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditForm(null);
    setEditFormErrors({});
    setEditError('');
    setEditSuccess('');
  };

  // Xử lý input change cho form thêm
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Ngăn nhập số âm cho các trường số
    if (name === 'soLuong' || name === 'giaTriToiThieu' || name === 'giaTriToiDa' || name === 'phanTramGiamGia') {
      const numValue = parseFloat(value);
      if (value !== '' && (isNaN(numValue) || numValue < 0)) {
        return; // Không cập nhật nếu là số âm
      }
    }
    
    setAddForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error khi user bắt đầu nhập
    if (addFormErrors[name as keyof FormType]) {
      setAddFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error khi user chọn
    if (addFormErrors[name as keyof FormType]) {
      setAddFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate real-time cho từng field
  const validateField = (name: keyof FormType, value: string) => {
    const errors: FormErrorsType = {};
    
    switch (name) {
      case 'maPhieuGiamGia':
        if (!value || !value.trim()) {
          errors.maPhieuGiamGia = 'Mã không được để trống';
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          errors.maPhieuGiamGia = 'Mã chỉ được chứa chữ và số, không có ký tự đặc biệt';
        } else if (value.length < 3) {
          errors.maPhieuGiamGia = 'Mã phải có ít nhất 3 ký tự';
        } else if (value.length > 20) {
          errors.maPhieuGiamGia = 'Mã không được quá 20 ký tự';
        }
        break;
        
      case 'tenPhieuGiamGia':
        if (!value || !value.trim()) {
          errors.tenPhieuGiamGia = 'Tên không được để trống';
        } else if (value.length < 5) {
          errors.tenPhieuGiamGia = 'Tên phải có ít nhất 5 ký tự';
        } else if (value.length > 100) {
          errors.tenPhieuGiamGia = 'Tên không quá 100 ký tự';
        }
        break;
        
      case 'kieuGiamGia':
        if (!value) {
          errors.kieuGiamGia = 'Vui lòng chọn kiểu';
        }
        break;
        
      case 'soLuong':
        if (!value || value.trim() === '') {
          errors.soLuong = 'Số lượng không được để trống';
        } else if (isNaN(Number(value))) {
          errors.soLuong = 'Số lượng phải là số';
        } else if (Number(value) <= 0) {
          errors.soLuong = 'Số lượng phải lớn hơn 0';
        } else if (Number(value) > 10000) {
          errors.soLuong = 'Số lượng không được quá 10,000';
        } else if (!Number.isInteger(Number(value))) {
          errors.soLuong = 'Số lượng phải là số nguyên';
        }
        break;
        
      case 'ngayBatDau':
        if (!value) {
          errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
        } else {
          const startDate = parseDate(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDate && startDate < today) {
            errors.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn hôm nay';
          }
        }
        break;
        
      case 'ngayKetThuc':
        if (!value) {
          errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
        } else if (addForm.ngayBatDau && value) {
          const startDate = parseDate(addForm.ngayBatDau);
          const endDate = parseDate(value);
          if (startDate && endDate && startDate >= endDate) {
            errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
          } else if (startDate && endDate) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff < 1) {
              errors.ngayKetThuc = 'Thời gian voucher phải ít nhất 1 giờ';
            }
          }
        }
        break;
        
      case 'moTa':
        if (value && value.trim() !== '' && value.length > 500) {
          errors.moTa = 'Mô tả không được quá 500 ký tự';
        }
        break;
    }
    
    return errors[name] || '';
  };

  // Handle blur để validate
  const handleAddBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormType, value);
    setAddFormErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validate form thêm
  const validateAddForm = () => {
    const errors: FormErrorsType = {};
    
    // Validate thông tin cơ bản
    if (!addForm.maPhieuGiamGia || !addForm.maPhieuGiamGia.trim()) {
      errors.maPhieuGiamGia = 'Mã không được để trống';
    } else if (!/^[a-zA-Z0-9]+$/.test(addForm.maPhieuGiamGia)) {
      errors.maPhieuGiamGia = 'Mã chỉ được chứa chữ và số, không có ký tự đặc biệt';
    } else if (addForm.maPhieuGiamGia.length < 3) {
      errors.maPhieuGiamGia = 'Mã phải có ít nhất 3 ký tự';
    } else if (addForm.maPhieuGiamGia.length > 20) {
      errors.maPhieuGiamGia = 'Mã không được quá 20 ký tự';
    }
    
    if (!addForm.tenPhieuGiamGia || !addForm.tenPhieuGiamGia.trim()) {
      errors.tenPhieuGiamGia = 'Tên không được để trống';
    } else if (addForm.tenPhieuGiamGia.length < 5) {
      errors.tenPhieuGiamGia = 'Tên phải có ít nhất 5 ký tự';
    } else if (addForm.tenPhieuGiamGia.length > 100) {
      errors.tenPhieuGiamGia = 'Tên không quá 100 ký tự';
    }
    
    if (!addForm.kieuGiamGia) {
      errors.kieuGiamGia = 'Vui lòng chọn kiểu';
    }
    
    // Validate số lượng
    if (!addForm.soLuong || addForm.soLuong.trim() === '') {
      errors.soLuong = 'Số lượng không được để trống';
    } else if (isNaN(Number(addForm.soLuong))) {
      errors.soLuong = 'Số lượng phải là số';
    } else if (Number(addForm.soLuong) <= 0) {
      errors.soLuong = 'Số lượng phải lớn hơn 0';
    } else if (Number(addForm.soLuong) > 10000) {
      errors.soLuong = 'Số lượng không được quá 10,000';
    } else if (!Number.isInteger(Number(addForm.soLuong))) {
      errors.soLuong = 'Số lượng phải là số nguyên';
    }
    
    // Validate ngày tháng
    if (!addForm.ngayBatDau) {
      errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
    } else {
      const startDate = parseDate(addForm.ngayBatDau);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate && startDate < today) {
        errors.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn hôm nay';
      }
    }
    
    if (!addForm.ngayKetThuc) {
      errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
    } else if (addForm.ngayBatDau && addForm.ngayKetThuc) {
      const startDate = parseDate(addForm.ngayBatDau);
      const endDate = parseDate(addForm.ngayKetThuc);
      if (startDate && endDate && startDate >= endDate) {
        errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
      // Kiểm tra thời gian tối thiểu (ít nhất 1 giờ)
      if (startDate && endDate) {
        const timeDiff = endDate.getTime() - startDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        if (hoursDiff < 1) {
          errors.ngayKetThuc = 'Thời gian voucher phải ít nhất 1 giờ';
        }
      }
    }
    
    // Validate mô tả (nếu có)
    if (addForm.moTa && addForm.moTa.trim() !== '') {
      if (addForm.moTa.length > 500) {
        errors.moTa = 'Mô tả không được quá 500 ký tự';
      }
    }
    
    return errors;
  };

  // Submit form thêm
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    
    const errors = validateAddForm();
    setAddFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Hiển thị confirm dialog
    const kieuGiamGiaText = addForm.kieuGiamGia === 'PERCENT' ? 'Giảm theo phần trăm' : 
                           addForm.kieuGiamGia === 'FIXED' ? 'Giảm cố định' : 'Miễn phí ship';
    
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn tạo phiếu giảm giá "${addForm.tenPhieuGiamGia}"?\n\n` +
      `Mã: ${addForm.maPhieuGiamGia}\n` +
      `Kiểu: ${kieuGiamGiaText}\n` +
      `Số lượng: ${addForm.soLuong}\n` +
      `Thời gian: ${addForm.ngayBatDau} - ${addForm.ngayKetThuc}`
    );
    
    if (!confirmed) {
      return;
    }
    
    setAddSaving(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) {
        let backendError = 'Lỗi khi lưu phiếu giảm giá';
        try {
          const data = await res.json();
          if (data && typeof data === 'object' && data.message) {
            setAddFormErrors(prev => ({ ...prev, maPhieuGiamGia: data.message }));
            setAddSaving(false);
            return;
          }
        } catch {}
        setAddFormErrors(prev => ({ ...prev, maPhieuGiamGia: backendError }));
        setAddSaving(false);
        return;
      }
      setAddSuccess('Thêm phiếu giảm giá thành công');
      setShowAddModal(false);
      // Reset form
      setAddForm({
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
      setAddFormErrors({});
      // Refresh danh sách voucher
      fetchVouchers();
    } catch (e: any) {
      setAddError(e.message || 'Lỗi khi lưu phiếu giảm giá');
    } finally {
      setAddSaving(false);
    }
  };

  // Mở modal thêm voucher
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddForm({
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
    setAddFormErrors({});
    setAddError('');
    setAddSuccess('');
  };

  // Đóng modal thêm
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddForm({
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
    setAddFormErrors({});
    setAddError('');
    setAddSuccess('');
  };

  return (
      <AdminLayout activeMenu="promotions" onMenuChangeAction={() => {}} pageTitle="Quản lý phiếu giảm giá">
        <div style={{ padding: 20, background: '#fffbe6', minHeight: '100vh' }}>
          {error && <div style={{ color: 'red', marginBottom: 16, padding: '12px 16px', background: '#ffebee', borderRadius: 8, border: '1px solid #f44336' }}>{error}</div>}
          {loading && <div style={{ color: '#2980b9', marginBottom: 16, padding: '12px 16px', background: '#e3f2fd', borderRadius: 8, border: '1px solid #2196f3' }}>Đang tải dữ liệu...</div>}
          {actionMsg && <div style={{ position: 'fixed', top: 24, right: 24, background: '#2ecc40', color: '#fff', padding: '12px 24px', borderRadius: 8, zIndex: 2000, fontWeight: 600, boxShadow: '0 4px 12px rgba(46, 204, 64, 0.3)' }}>{actionMsg}</div>}
          
          {/* Bộ lọc và tìm kiếm */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 24, 
            marginBottom: 24, 
            boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
            border: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            <h3 style={{ color: '#6b4f1d', fontWeight: 700, marginBottom: 20, fontSize: '18px' }}>Bộ lọc và tìm kiếm</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: 1 }}>
              <div>
                <input
                    type="text"
                    placeholder="Tìm kiếm mã hoặc tên..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                      style={{ 
                        padding: '10px 16px', 
                        borderRadius: 8, 
                        border: '2px solid #e6d8b4', 
                        minWidth: 220,
                        fontSize: '14px',
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#b59d3a'}
                      onBlur={(e) => e.target.style.borderColor = '#e6d8b4'}
                />
              </div>
              <div>
                  <label style={{ fontWeight: 600, marginRight: 8, color: '#6b4f1d', fontSize: '14px' }}>Trạng thái:</label>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)} 
                    style={{ 
                      padding: '10px 16px', 
                      borderRadius: 8, 
                      border: '2px solid #e6d8b4',
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                  <option value="">Tất cả</option>
                  <option value="Sắp diễn ra">Sắp diễn ra</option>
                  <option value="Đang diễn ra">Đang diễn ra</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                </select>
              </div>
              <div>
                  <label style={{ fontWeight: 600, marginRight: 8, color: '#6b4f1d', fontSize: '14px' }}>Kiểu:</label>
                  <select 
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value)} 
                    style={{ 
                      padding: '10px 16px', 
                      borderRadius: 8, 
                      border: '2px solid #e6d8b4',
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                  <option value="">Tất cả</option>
                  <option value="PERCENT">Phần trăm</option>
                  <option value="FIXED">Giảm trực tiếp</option>
                  <option value="FREE_SHIP">Free ship</option>
                </select>
              </div>
              {(filterStatus || filterType || search) && (
                  <button
                      onClick={() => { setFilterStatus(''); setFilterType(''); setSearch(''); }}
                      style={{
                          background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                          borderRadius: 8,
                          padding: '10px 20px',
                        fontWeight: 600,
                          fontSize: '14px',
                        cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
                          transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                      }}
                      title="Xóa lọc và tìm kiếm"
                      type="button"
                  >
                      <span style={{ fontSize: '16px' }}>×</span>
                    Xóa lọc
                  </button>
              )}
            </div>
            <button
                onClick={handleOpenAddModal}
                style={{
                    background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: '#fff',
                  border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                  fontWeight: 600,
                    fontSize: '15px',
                  cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(181, 157, 58, 0.3)',
                    transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(181, 157, 58, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                  }}
              >
                <span style={{ fontSize: '18px' }}>+</span>
                Thêm phiếu giảm giá
            </button>
            </div>
          </div>
          {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '40px',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)'
              }}>
                <div style={{ color: '#b59d3a', fontSize: '16px', fontWeight: 600 }}>Đang tải dữ liệu...</div>
              </div>
          ) : (
              <div style={{ 
                background: '#fff', 
                borderRadius: 16, 
                padding: 24, 
                boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                border: '1px solid rgba(181, 157, 58, 0.1)',
                overflowX: 'auto',
                overflowY: 'hidden'
              }}>
                <h3 style={{ color: '#6b4f1d', fontWeight: 700, marginBottom: 20, fontSize: '18px' }}>
                  Danh sách phiếu giảm giá ({paginatedVouchers.length} / {sortedVouchers.length})
                </h3>
                <table
                    border={0}
                    cellPadding={8}
                    cellSpacing={0}
                    style={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: 12,
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                      fontSize: 14,
                      minWidth: '1050px'
                    }}
                >
                  <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #f9e7b4 0%, #e6d8b4 100%)' }}>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '45px'
                    }}>STT</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '80px'
                    }}>Mã</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '100px'
                    }}>Tên</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '90px'
                    }}>Kiểu</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '100px'
                    }}>Giá trị tối thiểu</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '100px'
                    }}>Giá trị tối đa</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '80px'
                    }}>Phần trăm giảm</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '60px'
                    }}>Số lượng</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '110px'
                    }}>Ngày bắt đầu</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '110px'
                    }}>Ngày kết thúc</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '80px'
                    }}>Trạng thái</th>
                    <th style={{ 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      padding: '16px 6px', 
                      borderBottom: "2px solid #b59d3a",
                      color: '#6b4f1d',
                      fontSize: '14px',
                      width: '95px'
                    }}>Hành động</th>
                  </tr>
                  </thead>
                  <tbody>
                  {paginatedVouchers.map((v, idx) => (
                      <tr key={v.idPhieuGiamGia} style={{ 
                        height: 60, 
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#6b4f1d' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#b59d3a' }}>{v.maPhieuGiamGia}</td>
                        <td style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: 180, fontWeight: 500 }}>{v.tenPhieuGiamGia}</td>
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 6px',
                            borderRadius: 6,
                            fontSize: '11px',
                            fontWeight: 600,
                            background: v.kieuGiamGia === 'PERCENT' ? '#e3f2fd' : v.kieuGiamGia === 'FIXED' ? '#fff3e0' : '#f3e5f5',
                            color: v.kieuGiamGia === 'PERCENT' ? '#1976d2' : v.kieuGiamGia === 'FIXED' ? '#f57c00' : '#7b1fa2',
                            border: v.kieuGiamGia === 'PERCENT' ? '1px solid #bbdefb' : v.kieuGiamGia === 'FIXED' ? '1px solid #ffe0b2' : '1px solid #e1bee7',
                            whiteSpace: 'nowrap',
                            minWidth: '70px',
                            textAlign: 'center'
                          }}>
                            {kieuGiamGiaHienThi(v.kieuGiamGia)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#2e7d32' }}>{v.giaTriToiThieu?.toLocaleString('vi-VN')} đ</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#d32f2f' }}>{v.giaTriToiDa?.toLocaleString('vi-VN')} đ</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#b59d3a', fontSize: '16px' }}>{v.phanTramGiamGia}%</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#6b4f1d' }}>{v.soLuong}</td>
                        <td style={{ textAlign: 'center', fontSize: '13px', color: '#666' }}>{formatDateTime(v.ngayBatDau)}</td>
                        <td style={{ textAlign: 'center', fontSize: '13px', color: '#666' }}>{formatDateTime(v.ngayKetThuc)}</td>
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: '12px',
                            fontWeight: 600,
                            background: getVoucherStatus(v) === 'Đang diễn ra' ? '#e8f5e8' : 
                                         getVoucherStatus(v) === 'Sắp diễn ra' ? '#fff3e0' : 
                                         getVoucherStatus(v) === 'Hết voucher' ? '#f5f5f5' :
                                         '#ffebee',
                            color: getVoucherStatus(v) === 'Đang diễn ra' ? '#2e7d32' : 
                                   getVoucherStatus(v) === 'Sắp diễn ra' ? '#f57c00' : 
                                   getVoucherStatus(v) === 'Hết voucher' ? '#666666' :
                                   '#d32f2f',
                            border: getVoucherStatus(v) === 'Đang diễn ra' ? '1px solid #c8e6c9' : 
                                    getVoucherStatus(v) === 'Sắp diễn ra' ? '1px solid #ffe0b2' : 
                                    getVoucherStatus(v) === 'Hết voucher' ? '1px solid #e0e0e0' :
                                    '1px solid #ffcdd2',
                            whiteSpace: 'nowrap',
                            minWidth: '70px',
                            textAlign: 'center'
                          }}>
                            {getVoucherStatus(v)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <button
                                style={{ 
                                  background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)", 
                                  color: "#fff", 
                                  border: "none", 
                                  borderRadius: 8, 
                                  padding: 8, 
                                  cursor: "pointer", 
                                  fontWeight: 600, 
                                  fontSize: 14, 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  justifyContent: "center",
                                  transition: 'all 0.2s',
                                  boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)'
                                }}
                                title="Xem chi tiết"
                                onClick={e => { e.stopPropagation(); setSelectedVoucher(v); setShowDetailModal(true); }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(52, 152, 219, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(52, 152, 219, 0.2)';
                                }}
                            >
                              <FaEye style={{ fontSize: 14 }} />
                            </button>
                            <button
                                style={{ 
                                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)", 
                                  color: "#fff", 
                                  border: "none", 
                                  borderRadius: 8, 
                                  padding: 8, 
                                  cursor: "pointer", 
                                  fontWeight: 600, 
                                  fontSize: 14, 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  justifyContent: "center",
                                  transition: 'all 0.2s',
                                  boxShadow: '0 2px 4px rgba(243, 156, 18, 0.2)'
                                }}
                                title="Sửa"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedVoucher(v);
                                  handleEditVoucher(v);
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(243, 156, 18, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(243, 156, 18, 0.2)';
                                }}
                            >
                              <FaEdit style={{ fontSize: 14 }} />
                            </button>
                            <button
                                style={{
                                  background: v.trangThai === 'Đang diễn ra' ? 'linear-gradient(135deg, #2ecc40 0%, #27ae60 100%)' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: 8,
                                  cursor: actionLoadingId === v.idPhieuGiamGia ? 'not-allowed' : 'pointer',
                                  fontWeight: 600,
                                  fontSize: 14,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: actionLoadingId === v.idPhieuGiamGia ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                  boxShadow: v.trangThai === 'Đang diễn ra' ? '0 2px 4px rgba(46, 204, 64, 0.2)' : '0 2px 4px rgba(231, 76, 60, 0.2)'
                                }}
                                title={v.trangThai === 'Đang diễn ra' ? 'Kết thúc sớm' : 'Bật lại nếu còn hạn'}
                                disabled={actionLoadingId === v.idPhieuGiamGia || v.trangThai === 'Đã kết thúc'}
                                onClick={e => { e.stopPropagation(); handleToggleStatus(v); }}
                                onMouseEnter={(e) => {
                                  if (actionLoadingId !== v.idPhieuGiamGia) {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = v.trangThai === 'Đang diễn ra' ? '0 4px 8px rgba(46, 204, 64, 0.3)' : '0 4px 8px rgba(231, 76, 60, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (actionLoadingId !== v.idPhieuGiamGia) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = v.trangThai === 'Đang diễn ra' ? '0 2px 4px rgba(46, 204, 64, 0.2)' : '0 2px 4px rgba(231, 76, 60, 0.2)';
                                  }
                                }}
                            >
                              {actionLoadingId === v.idPhieuGiamGia ? <span style={{ fontSize: 12 }}>...</span> : <FaPowerOff style={{ fontSize: 14 }} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
          {/* Phân trang */}
          {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                margin: '24px 0',
                padding: '20px',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                border: '1px solid rgba(181, 157, 58, 0.1)'
              }}>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      borderRadius: 12,
                      minWidth: 80,
                      color: currentPage === 1 ? '#999' : '#6b4f1d',
                      border: '2px solid #e6d8b4',
                      background: currentPage === 1 ? '#f5f5f5' : '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      margin: '0 4px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.6 : 1,
                      padding: '10px 20px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = '#b59d3a';
                        e.currentTarget.style.background = '#f9f9f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = '#e6d8b4';
                        e.currentTarget.style.background = '#fff';
                      }
                    }}
                >Trước</button>
                {Array.from({length: totalPages}, (_,i)=>(
                    <button
                        key={i}
                        onClick={()=>setCurrentPage(i+1)}
                        disabled={i+1===currentPage}
                        style={{
                          borderRadius: 12,
                          minWidth: 50,
                          color: i+1===currentPage ? '#fff' : '#6b4f1d',
                          border: '2px solid #e6d8b4',
                          background: i+1===currentPage ? 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)' : '#fff',
                          fontWeight: i+1===currentPage ? 700 : 600,
                          fontSize: 14,
                          margin: '0 4px',
                          cursor: i+1===currentPage ? 'default' : 'pointer',
                          opacity: 1,
                          padding: '10px 16px',
                          transition: 'all 0.2s',
                          boxShadow: i+1===currentPage ? '0 2px 8px rgba(181, 157, 58, 0.3)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (i+1 !== currentPage) {
                            e.currentTarget.style.borderColor = '#b59d3a';
                            e.currentTarget.style.background = '#f9f9f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (i+1 !== currentPage) {
                            e.currentTarget.style.borderColor = '#e6d8b4';
                            e.currentTarget.style.background = '#fff';
                          }
                        }}
                    >{i+1}</button>
                ))}
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      borderRadius: 12,
                      minWidth: 80,
                      color: currentPage === totalPages ? '#999' : '#6b4f1d',
                      border: '2px solid #e6d8b4',
                      background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      margin: '0 4px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.6 : 1,
                      padding: '10px 20px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = '#b59d3a';
                        e.currentTarget.style.background = '#f9f9f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = '#e6d8b4';
                        e.currentTarget.style.background = '#fff';
                      }
                    }}
                >Sau</button>
              </div>
          )}
          {/* Modal xem chi tiết voucher */}
          {showDetailModal && selectedVoucher && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.5)', zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{ 
                  background: '#fff', 
                  borderRadius: 16, 
                  padding: 24, 
                  minWidth: 480, 
                  maxWidth: 480, 
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', 
                  position: 'relative',
                  border: '1px solid rgba(181, 157, 58, 0.1)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setShowDetailModal(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <span style={{ fontSize: '16px', color: '#666', fontWeight: 'bold' }}>×</span>
                  </div>
                  
                  <h2 style={{ 
                    color: '#6b4f1d', 
                    fontWeight: 700, 
                    marginBottom: 20, 
                    fontSize: '20px',
                    textAlign: 'center',
                    borderBottom: '2px solid #e6d8b4',
                    paddingBottom: '10px'
                  }}>Chi tiết phiếu giảm giá</h2>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Mã:</span>
                      <span style={{ fontWeight: 700, color: '#b59d3a', fontSize: '14px' }}>{selectedVoucher.maPhieuGiamGia}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Tên:</span>
                      <span style={{ fontWeight: 500, color: '#333', maxWidth: '250px', textAlign: 'right', fontSize: '13px' }}>{selectedVoucher.tenPhieuGiamGia}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Kiểu:</span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '11px',
                        fontWeight: 600,
                        background: selectedVoucher.kieuGiamGia === 'PERCENT' ? '#e3f2fd' : selectedVoucher.kieuGiamGia === 'FIXED' ? '#fff3e0' : '#f3e5f5',
                        color: selectedVoucher.kieuGiamGia === 'PERCENT' ? '#1976d2' : selectedVoucher.kieuGiamGia === 'FIXED' ? '#f57c00' : '#7b1fa2'
                      }}>
                        {kieuGiamGiaHienThi(selectedVoucher.kieuGiamGia)}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Giá trị tối thiểu:</span>
                      <span style={{ fontWeight: 700, color: '#2e7d32', fontSize: '14px' }}>{selectedVoucher.giaTriToiThieu?.toLocaleString('vi-VN')} đ</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Giá trị tối đa:</span>
                      <span style={{ fontWeight: 700, color: '#d32f2f', fontSize: '14px' }}>{selectedVoucher.giaTriToiDa?.toLocaleString('vi-VN')} đ</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Phần trăm giảm:</span>
                      <span style={{ fontWeight: 700, color: '#b59d3a', fontSize: '16px' }}>{selectedVoucher.phanTramGiamGia}%</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Số lượng:</span>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '14px' }}>{selectedVoucher.soLuong}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Ngày bắt đầu:</span>
                      <span style={{ fontWeight: 500, color: '#666', fontSize: '12px' }}>{formatDateTime(selectedVoucher.ngayBatDau)}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Ngày kết thúc:</span>
                      <span style={{ fontWeight: 500, color: '#666', fontSize: '12px' }}>{formatDateTime(selectedVoucher.ngayKetThuc)}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f9f9f9',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#6b4f1d', fontSize: '13px' }}>Trạng thái:</span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '11px',
                        fontWeight: 600,
                        background: getVoucherStatus(selectedVoucher) === 'Đang diễn ra' ? '#e8f5e8' : 
                                     getVoucherStatus(selectedVoucher) === 'Sắp diễn ra' ? '#fff3e0' : 
                                     getVoucherStatus(selectedVoucher) === 'Hết voucher' ? '#f5f5f5' :
                                     '#ffebee',
                        color: getVoucherStatus(selectedVoucher) === 'Đang diễn ra' ? '#2e7d32' : 
                               getVoucherStatus(selectedVoucher) === 'Sắp diễn ra' ? '#f57c00' : 
                               getVoucherStatus(selectedVoucher) === 'Hết voucher' ? '#666666' :
                               '#d32f2f'
                      }}>
                        {getVoucherStatus(selectedVoucher)}
                      </span>
                    </div>
                    
                    {selectedVoucher.moTa && (
                      <div style={{ 
                        padding: '8px 12px',
                        background: '#f9f9f9',
                        borderRadius: 6,
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ fontWeight: 600, color: '#6b4f1d', marginBottom: '6px', fontSize: '13px' }}>Mô tả:</div>
                        <div style={{ color: '#666', lineHeight: '1.4', fontSize: '12px' }}>{selectedVoucher.moTa}</div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowDetailModal(false)} 
                    style={{ 
                      marginTop: 20, 
                      background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 8, 
                      padding: '10px 0', 
                      fontWeight: 600, 
                      fontSize: '14px', 
                      width: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(181, 157, 58, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(181, 157, 58, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
          )}

          {/* Toast thông báo cho edit modal */}
          {editSuccess && (
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
              {editSuccess}
            </div>
          )}
          {editError && (
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
              {editError}
            </div>
          )}

          {/* Toast thông báo cho add modal */}
          {addSuccess && (
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
              {addSuccess}
            </div>
          )}
          {addError && (
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
              {addError}
            </div>
          )}

          {/* Modal sửa voucher */}
          {showEditModal && editForm && (
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
                      onClick={handleCloseEditModal}
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
                  {editLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#b59d3a', fontSize: '16px', fontWeight: 600 }}>
                      Đang tải dữ liệu...
                    </div>
                  ) : (
                    <form onSubmit={handleEditSubmit}>
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
                      value={editForm.maPhieuGiamGia} 
                      onChange={handleEditInputChange} 
                      onBlur={handleEditBlur}
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: 8, 
                        border: editFormErrors.maPhieuGiamGia ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                        fontSize: '14px',
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = editFormErrors.maPhieuGiamGia ? '#e74c3c' : '#b59d3a'}
                    />
                              {editFormErrors.maPhieuGiamGia && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.maPhieuGiamGia}
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
                      value={editForm.tenPhieuGiamGia} 
                      onChange={handleEditInputChange} 
                      onBlur={handleEditBlur}
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: 8, 
                        border: editFormErrors.tenPhieuGiamGia ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                        fontSize: '14px',
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = editFormErrors.tenPhieuGiamGia ? '#e74c3c' : '#b59d3a'}
                    />
                              {editFormErrors.tenPhieuGiamGia && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.tenPhieuGiamGia}
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
                      value={editForm.kieuGiamGia}
                      onChange={handleEditSelectChange}
                      onBlur={handleEditBlur}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: 8, 
                        border: editFormErrors.kieuGiamGia ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
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
                              {editFormErrors.kieuGiamGia && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.kieuGiamGia}
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
                                min="0"
                                step="1000"
                                value={editForm.giaTriToiThieu} 
                                onChange={handleEditInputChange} 
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
                              {editFormErrors.giaTriToiThieu && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.giaTriToiThieu}
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
                                min="0"
                                step="1000"
                                value={editForm.giaTriToiDa} 
                                onChange={handleEditInputChange} 
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
                              {editFormErrors.giaTriToiDa && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.giaTriToiDa}
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
                                min="0"
                                max="100"
                                step="0.1"
                                value={editForm.phanTramGiamGia} 
                                onChange={handleEditInputChange} 
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
                              {editFormErrors.phanTramGiamGia && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.phanTramGiamGia}
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
                      min="0"
                      step="1"
                      value={editForm.soLuong} 
                      onChange={handleEditInputChange} 
                      onBlur={handleEditBlur}
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: 8, 
                        border: editFormErrors.soLuong ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                        fontSize: '14px',
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = editFormErrors.soLuong ? '#e74c3c' : '#b59d3a'}
                    />
                              {editFormErrors.soLuong && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.soLuong}
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
                        value={parseDate(editForm.ngayBatDau)}
                        onChange={date => {
                          const newValue = date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '';
                          setEditForm(prev => prev ? { ...prev, ngayBatDau: newValue } : prev);
                          // Validate sau khi thay đổi
                          setTimeout(() => {
                            const error = validateEditField('ngayBatDau', newValue);
                            setEditFormErrors(prev => ({ ...prev, ngayBatDau: error }));
                          }, 100);
                        }}
                      />
                              {editFormErrors.ngayBatDau && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.ngayBatDau}
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
                        value={parseDate(editForm.ngayKetThuc)}
                        onChange={date => {
                          const newValue = date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '';
                          setEditForm(prev => prev ? { ...prev, ngayKetThuc: newValue } : prev);
                          // Validate sau khi thay đổi
                          setTimeout(() => {
                            const error = validateEditField('ngayKetThuc', newValue);
                            setEditFormErrors(prev => ({ ...prev, ngayKetThuc: error }));
                          }, 100);
                        }}
                      />
                              {editFormErrors.ngayKetThuc && (
                                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                  {editFormErrors.ngayKetThuc}
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
                            value={editForm.moTa} 
                            onChange={handleEditInputChange} 
                            onBlur={handleEditBlur}
                            style={{ 
                              width: '100%', 
                              padding: '12px 16px', 
                              borderRadius: 8, 
                              border: editFormErrors.moTa ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                              fontSize: '14px',
                              background: '#fff',
                              transition: 'border-color 0.2s',
                              outline: 'none',
                              minHeight: 80,
                              resize: 'vertical'
                            }}
                            onFocus={(e) => e.target.style.borderColor = editFormErrors.moTa ? '#e74c3c' : '#b59d3a'}
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
                          onClick={handleCloseEditModal}
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
                          disabled={editSaving}
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
                            cursor: editSaving ? 'not-allowed' : 'pointer',
                            opacity: editSaving ? 0.6 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!editSaving) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(181, 157, 58, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!editSaving) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                            }
                          }}
                        >
                          <FaSave style={{ fontSize: 14 }} />
                          {editSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal thêm voucher */}
          {showAddModal && (
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
                      Thêm phiếu giảm giá mới
                    </h2>
                    <button
                      onClick={handleCloseAddModal}
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
                  <form onSubmit={handleAddSubmit}>
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
                                value={addForm.maPhieuGiamGia} 
                                onChange={handleAddInputChange} 
                                onBlur={handleAddBlur}
                                required 
                                style={{ 
                                  width: '100%', 
                                  padding: '12px 16px', 
                                  borderRadius: 8, 
                                  border: addFormErrors.maPhieuGiamGia ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                                  fontSize: '14px',
                                  background: '#fff',
                                  transition: 'border-color 0.2s',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = addFormErrors.maPhieuGiamGia ? '#e74c3c' : '#b59d3a'}
                              />
                            {addFormErrors.maPhieuGiamGia && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.maPhieuGiamGia}
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
                                value={addForm.tenPhieuGiamGia} 
                                onChange={handleAddInputChange} 
                                onBlur={handleAddBlur}
                                required 
                                style={{ 
                                  width: '100%', 
                                  padding: '12px 16px', 
                                  borderRadius: 8, 
                                  border: addFormErrors.tenPhieuGiamGia ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                                  fontSize: '14px',
                                  background: '#fff',
                                  transition: 'border-color 0.2s',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = addFormErrors.tenPhieuGiamGia ? '#e74c3c' : '#b59d3a'}
                              />
                            {addFormErrors.tenPhieuGiamGia && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.tenPhieuGiamGia}
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
                                value={addForm.kieuGiamGia}
                                onChange={handleAddSelectChange}
                                onBlur={handleAddBlur}
                                required
                                style={{ 
                                  width: '100%', 
                                  padding: '12px 16px', 
                                  borderRadius: 8, 
                                  border: addFormErrors.kieuGiamGia ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
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
                            {addFormErrors.kieuGiamGia && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.kieuGiamGia}
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
                              min="0"
                              step="1000"
                              value={addForm.giaTriToiThieu} 
                              onChange={handleAddInputChange} 
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
                            {addFormErrors.giaTriToiThieu && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.giaTriToiThieu}
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
                              min="0"
                              step="1000"
                              value={addForm.giaTriToiDa} 
                              onChange={handleAddInputChange} 
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
                            {addFormErrors.giaTriToiDa && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.giaTriToiDa}
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
                              min="0"
                              max="100"
                              step="0.1"
                              value={addForm.phanTramGiamGia} 
                              onChange={handleAddInputChange} 
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
                            {addFormErrors.phanTramGiamGia && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.phanTramGiamGia}
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
                                min="0"
                                step="1"
                                value={addForm.soLuong} 
                                onChange={handleAddInputChange} 
                                onBlur={handleAddBlur}
                                required 
                                style={{ 
                                  width: '100%', 
                                  padding: '12px 16px', 
                                  borderRadius: 8, 
                                  border: addFormErrors.soLuong ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                                  fontSize: '14px',
                                  background: '#fff',
                                  transition: 'border-color 0.2s',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = addFormErrors.soLuong ? '#e74c3c' : '#b59d3a'}
                              />
                            {addFormErrors.soLuong && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.soLuong}
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
                              value={parseDate(addForm.ngayBatDau)}
                              onChange={date => {
                                const newValue = date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '';
                                setAddForm(prev => ({ ...prev, ngayBatDau: newValue }));
                                // Validate sau khi thay đổi
                                setTimeout(() => {
                                  const error = validateField('ngayBatDau', newValue);
                                  setAddFormErrors(prev => ({ ...prev, ngayBatDau: error }));
                                }, 100);
                              }}
                            />
                            {addFormErrors.ngayBatDau && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.ngayBatDau}
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
                              value={parseDate(addForm.ngayKetThuc)}
                              onChange={date => {
                                const newValue = date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '';
                                setAddForm(prev => ({ ...prev, ngayKetThuc: newValue }));
                                // Validate sau khi thay đổi
                                setTimeout(() => {
                                  const error = validateField('ngayKetThuc', newValue);
                                  setAddFormErrors(prev => ({ ...prev, ngayKetThuc: error }));
                                }, 100);
                              }}
                              minDateTime={parseDate(addForm.ngayBatDau) || undefined}
                            />
                            {addFormErrors.ngayKetThuc && (
                              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                                {addFormErrors.ngayKetThuc}
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
                              value={addForm.moTa} 
                              onChange={handleAddInputChange} 
                              onBlur={handleAddBlur}
                              style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                borderRadius: 8, 
                                border: addFormErrors.moTa ? '2px solid #e74c3c' : '2px solid #e6d8b4', 
                                fontSize: '14px',
                                background: '#fff',
                                transition: 'border-color 0.2s',
                                outline: 'none',
                                minHeight: 80,
                                resize: 'vertical'
                              }}
                              onFocus={(e) => e.target.style.borderColor = addFormErrors.moTa ? '#e74c3c' : '#b59d3a'}
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
                        onClick={handleCloseAddModal}
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
                        disabled={addSaving}
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
                          cursor: addSaving ? 'not-allowed' : 'pointer',
                          opacity: addSaving ? 0.6 : 1,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!addSaving) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(181, 157, 58, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!addSaving) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                          }
                        }}
                      >
                        <FaPlus style={{ fontSize: 14 }} />
                        {addSaving ? 'Đang thêm...' : 'Thêm phiếu giảm giá'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
  );
};

export default HienThiVoucherPage;