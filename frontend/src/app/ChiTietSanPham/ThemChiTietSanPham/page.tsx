"use client";
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes } from 'react-icons/fa';
import AdminLayout from "@/component/Admin-Layout";

export default function ThemChiTietSanPhamPage() {
  // --- State và logic copy từ modal cũ ---
  const [addMode, setAddMode] = useState<'new' | 'select' | null>('select');
  const [products, setProducts] = useState<any[]>([]);
  const [danhMucs, setDanhMucs] = useState<any[]>([]);
  const [thuongHieus, setThuongHieus] = useState<any[]>([]);
  const [mauSacs, setMauSacs] = useState<any[]>([]);
  const [kichCos, setKichCos] = useState<any[]>([]);

  const [addIdSanPham, setAddIdSanPham] = useState('');
  const [addMaSanPham, setAddMaSanPham] = useState('');
  const [addTenSanPham, setAddTenSanPham] = useState('');
  const [addMoTa, setAddMoTa] = useState('');
  const [addIdDanhMuc, setAddIdDanhMuc] = useState('');
  const [addIdThuongHieu, setAddIdThuongHieu] = useState('');
  const [addTrangThai, setAddTrangThai] = useState('');
  const [addMultiMauSac, setAddMultiMauSac] = useState<string[]>([]);
  const [addMultiKichCo, setAddMultiKichCo] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  // Error state
  const [maSanPhamError, setMaSanPhamError] = useState('');
  const [tenSanPhamError, setTenSanPhamError] = useState('');
  const [danhMucError, setDanhMucError] = useState('');
  const [thuongHieuError, setThuongHieuError] = useState('');
  const [trangThaiError, setTrangThaiError] = useState('');
  const [mauSacError, setMauSacError] = useState('');
  const [kichCoError, setKichCoError] = useState('');
  const [variantError, setVariantError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog state
  const [openAddDialog, setOpenAddDialog] = useState<{type: string, open: boolean}>({type: '', open: false});
  const [newValue, setNewValue] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Thêm state lưu lỗi cho từng biến thể
  const [variantErrors, setVariantErrors] = useState<{[key: string]: string}>({});
  const [showVariantErrors, setShowVariantErrors] = useState(false);

  // State cho modal thuộc tính chung
  const [openCommonAttrModal, setOpenCommonAttrModal] = useState(false);
  const [commonSoLuong, setCommonSoLuong] = useState('');
  const [commonGia, setCommonGia] = useState('');
  const [commonError, setCommonError] = useState('');

  // State để lưu chi tiết sản phẩm hiện có
  const [existingVariants, setExistingVariants] = useState<any[]>([]);
  const [isCheckingVariants, setIsCheckingVariants] = useState(false);

  // State cho modal confirm thêm sản phẩm
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  // State cho việc quản lý nhiều ảnh
  const [multipleImages, setMultipleImages] = useState<{[key: string]: File[]}>({});

  // Hàm test thêm ảnh phụ
  const testAddImage = async () => {
    try {
      // Test với dữ liệu thực tế từ database
      const testPayload = {
        idChiTietSanPham: 14, // ID từ bảng ChiTietSanPham
        idHinhAnh: 74, // ID từ bảng HinhAnh
        thuTu: 1,
        laAnhChinh: true
      };
      
      console.log('Testing add image with payload:', testPayload);
      
      const response = await fetch('http://localhost:8080/chi-tiet-san-pham-hinh-anh/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      console.log('Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test success:', data);
        alert('Test thành công! Kiểm tra database.');
      } else {
        const error = await response.text();
        console.error('Test failed:', error);
        alert('Test thất bại: ' + error);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('Test lỗi: ' + error);
    }
  };

  // Fetch dữ liệu động từ backend khi mount
  useEffect(() => {
    fetch('http://localhost:8080/danh-muc/hien-thi')
        .then(res => res.json())
        .then(data => setDanhMucs(data));
    fetch('http://localhost:8080/thuong-hieu/hien-thi')
        .then(res => res.json())
        .then(data => setThuongHieus(data));
    fetch('http://localhost:8080/mau-sac/hien-thi')
        .then(res => res.json())
        .then(data => setMauSacs(data));
    fetch('http://localhost:8080/kich-co/hien-thi')
        .then(res => res.json())
        .then(data => setKichCos(data));
    fetch('http://localhost:8080/san-pham/hien-thi')
        .then(res => res.json())
        .then(data => setProducts(data));
  }, []);

  // Hàm mở modal confirm thêm sản phẩm
  const handleOpenConfirmModal = () => {
    setShowVariantErrors(true);
    if (variants.length === 0) {
      setSnackbar({ open: true, message: 'Bạn phải tạo ít nhất 1 biến thể!', severity: 'error' });
      return;
    }
    // Kiểm tra từng biến thể
    const errors: {[key: string]: string} = {};
    variants.forEach((v) => {
      let err = '';
      if (!v.soLuong || isNaN(Number(v.soLuong))) err += 'Chưa nhập số lượng. ';
      else if (Number(v.soLuong) < 0) err += 'Số lượng phải >= 0. ';
      if (!v.gia || isNaN(Number(v.gia))) err += 'Chưa nhập giá. ';
      else if (Number(v.gia) <= 0) err += 'Giá phải > 0. ';
      if (!v.hinhAnh) err += 'Chọn ảnh.';
      if (err) errors[v.idMauSac + '-' + v.idKichCo] = err;
    });
    setVariantErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setOpenConfirmModal(true);
  };

  // Hàm thêm chi tiết sản phẩm
  const handleAddAll = async () => {
    let idSanPham = addIdSanPham;
    // Nếu đang tạo mới sản phẩm cha
    if (!idSanPham) {
      const res = await fetch('http://localhost:8080/san-pham/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maSanPham: addMaSanPham,
          tenSanPham: addTenSanPham,
          moTa: addMoTa,
          idDanhMuc: addIdDanhMuc,
          idThuongHieu: addIdThuongHieu,
          trangThai: addTrangThai
        })
      });
      const data = await res.json();
      if (!res.ok || !data.idSanPham) {
        setSnackbar({ open: true, message: data.message || 'Lỗi tạo sản phẩm!', severity: 'error' });
        return;
      }
      idSanPham = String(data.idSanPham);
    }
    // Tạo các biến thể
    for (const v of variants) {
      // Tạo chi tiết sản phẩm trước (không có ảnh)
      const res = await fetch('http://localhost:8080/chi-tiet-san-pham/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idSanPham,
          idMauSac: v.idMauSac,
          idKichCo: v.idKichCo,
          soLuong: v.soLuong,
          gia: v.gia,
          trangThai: Number(v.soLuong) === 0 ? 'Ngừng bán' : 'Đang bán'
        })
      });
      
      let chiTietData;
      if (!res.ok) {
        try {
          chiTietData = await res.json();
        } catch {
          chiTietData = await res.text();
        }
        setSnackbar({ open: true, message: (chiTietData && chiTietData.message) ? chiTietData.message : (typeof chiTietData === 'string' ? chiTietData : 'Lỗi khi thêm chi tiết sản phẩm!'), severity: 'error' });
        return; // Dừng thêm tiếp nếu có lỗi
      } else {
        chiTietData = await res.json();
      }
      
      // Lưu tất cả ảnh (chính + phụ) vào bảng ChiTietSanPhamHinhAnh
      const variantKey = `${v.idMauSac}-${v.idKichCo}`;
      const additionalImages = multipleImages[variantKey] || [];
      const idChiTietSanPham = chiTietData.idChiTietSanPham;
      
      console.log('Lưu ảnh cho biến thể:', idChiTietSanPham);
      console.log('Ảnh chính:', v.hinhAnh ? 'Có' : 'Không');
      console.log('Ảnh phụ:', additionalImages.length);
      
      // Tạo danh sách tất cả ảnh cần lưu
      const allImages = [];
      
      // Upload và thêm ảnh chính (nếu có)
      if (v.hinhAnh) {
        const formData = new FormData();
        formData.append('file', v.hinhAnh);
        const uploadRes = await fetch('http://localhost:8080/hinh-anh/upload', { 
          method: 'POST', 
          body: formData 
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const idHinhAnhChinh = uploadData.idHinhAnh;
          
          allImages.push({
            idHinhAnh: parseInt(idHinhAnhChinh),
            thuTu: 1,
            laAnhChinh: true
          });
        } else {
          console.warn('Không thể upload ảnh chính:', v.hinhAnh.name);
        }
      }
      
      // Thêm ảnh phụ
      for (let i = 0; i < additionalImages.length; i++) {
        const imageFile = additionalImages[i];
        
        // Upload ảnh phụ
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        
        const uploadRes = await fetch('http://localhost:8080/hinh-anh/upload', {
          method: 'POST',
          body: uploadFormData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const idHinhAnhPhu = uploadData.idHinhAnh;
          
          allImages.push({
            idHinhAnh: parseInt(idHinhAnhPhu),
            thuTu: allImages.length + 1,
            laAnhChinh: false
          });
        } else {
          console.warn('Không thể upload ảnh phụ:', imageFile.name);
        }
      }
      
      // Lưu tất cả ảnh vào database
      for (const imageInfo of allImages) {
        const imagePayload = {
          idChiTietSanPham: parseInt(idChiTietSanPham),
          idHinhAnh: imageInfo.idHinhAnh,
          thuTu: imageInfo.thuTu,
          laAnhChinh: imageInfo.laAnhChinh
        };
        
        console.log('Gửi payload lưu ảnh:', imagePayload);
        
        const imageRes = await fetch('http://localhost:8080/chi-tiet-san-pham-hinh-anh/them', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imagePayload)
        });
        
        if (imageRes.ok) {
          const imageResData = await imageRes.json();
          console.log('Lưu ảnh thành công:', imageInfo.laAnhChinh ? 'Ảnh chính' : 'Ảnh phụ', imageResData);
        } else {
          let errorData;
          try {
            errorData = await imageRes.json();
          } catch (e) {
            errorData = await imageRes.text();
          }
          console.error('Không thể lưu ảnh:', imageInfo.laAnhChinh ? 'Ảnh chính' : 'Ảnh phụ', errorData);
          console.error('Response status:', imageRes.status);
          console.error('Response status text:', imageRes.statusText);
          console.error('Payload gửi:', imagePayload);
        }
      }
    }
    setSnackbar({ open: true, message: 'Thêm sản phẩm và biến thể thành công!', severity: 'success' });
    // Reset form nếu cần
    setTimeout(() => {
      router.push('/ChiTietSanPham?reload=' + Date.now());
    }, 1000);
    
    setOpenConfirmModal(false);
  };

  // Hàm thêm sản phẩm cha
  const handleCreateProduct = async () => {
    let hasError = false;
    if (!addIdDanhMuc || addIdDanhMuc === '') {
      setDanhMucError('Vui lòng chọn danh mục!');
      hasError = true;
    }
    if (!addIdThuongHieu || addIdThuongHieu === '') {
      setThuongHieuError('Vui lòng chọn thương hiệu!');
      hasError = true;
    }
    if (!addTrangThai || addTrangThai === '') {
      setTrangThaiError('Vui lòng chọn trạng thái!');
      hasError = true;
    }
    if (!addMaSanPham) {
      setMaSanPhamError('Vui lòng nhập mã sản phẩm!');
      hasError = true;
    }
    if (!addTenSanPham) {
      setTenSanPhamError('Vui lòng nhập tên sản phẩm!');
      hasError = true;
    }
    if (hasError) return;

    try {
      const res = await fetch('http://localhost:8080/san-pham/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maSanPham: addMaSanPham,
          tenSanPham: addTenSanPham,
          moTa: addMoTa,
          idDanhMuc: addIdDanhMuc,
          idThuongHieu: addIdThuongHieu,
          trangThai: addTrangThai
        })
      });
      const data = await res.json();
      if (!res.ok || !data.idSanPham) {
        // Nếu lỗi là trùng mã sản phẩm
        if (
            (data.message && data.message.toLowerCase().includes('duplicate')) ||
            (data.message && data.message.toLowerCase().includes('tồn tại')) ||
            (data.message && data.message.toLowerCase().includes('trùng'))
        ) {
          setMaSanPhamError('Mã sản phẩm đã tồn tại!');
          return; // KHÔNG show snackbar nữa
        }
        setSnackbar({ open: true, message: data.message || 'Lỗi tạo sản phẩm!', severity: 'error' });
        return;
      }
      // Fetch lại danh sách sản phẩm và auto chọn sản phẩm vừa tạo
      const res2 = await fetch('http://localhost:8080/san-pham/hien-thi');
      const productsData = await res2.json();
      setProducts(productsData);
      setAddIdSanPham(String(data.idSanPham));
      setAddMode('select');
      setSnackbar({ open: true, message: 'Tạo sản phẩm thành công!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi tạo sản phẩm!', severity: 'error' });
    }
  };

  // Validate mã sản phẩm khi nhập
  const checkMaSanPhamTrung = async (ma: string) => {
    if (!ma) return;
    try {
      const res = await fetch(`http://localhost:8080/san-pham/kiem-tra-ma?ma=${encodeURIComponent(ma)}`);
      const data = await res.json();
      if (data.trung) setMaSanPhamError('Mã sản phẩm đã tồn tại!');
      else setMaSanPhamError('');
    } catch {
      setMaSanPhamError('Không kiểm tra được mã!');
    }
  };

  // Kiểm tra biến thể hiện có của sản phẩm
  const checkExistingVariants = async (idSanPham: string) => {
    if (!idSanPham) return;
    setIsCheckingVariants(true);
    try {
      // Thử endpoint chính
      let res = await fetch(`http://localhost:8080/chi-tiet-san-pham/hien-thi-theo-san-pham?idSanPham=${idSanPham}`);
      
      // Nếu endpoint không tồn tại, thử endpoint khác
      if (!res.ok) {
        res = await fetch(`http://localhost:8080/chi-tiet-san-pham/hien-thi`);
      }
      
      if (res.ok) {
        const data = await res.json();
        // Lọc theo idSanPham nếu cần
        const filteredData = Array.isArray(data) ? data.filter(item => String(item.idSanPham) === String(idSanPham)) : [];
        setExistingVariants(filteredData);
        console.log('Biến thể hiện có:', filteredData);
      } else {
        console.warn('Không thể fetch biến thể, endpoint không tồn tại');
        // Fallback: sử dụng dữ liệu mẫu để test
        const mockData = [
          { idMauSac: 1, idKichCo: 1, idSanPham: idSanPham },
          { idMauSac: 2, idKichCo: 2, idSanPham: idSanPham }
        ];
        setExistingVariants(mockData);
        console.log('Sử dụng dữ liệu mẫu để test:', mockData);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra biến thể:', error);
      setExistingVariants([]);
    } finally {
      setIsCheckingVariants(false);
    }
  };

  // Hàm mở dialog
  const handleOpenAddDialog = (type: string) => {
    setOpenAddDialog({type, open: true});
    setNewValue('');
    setAddError('');
  };
  const handleCloseAddDialog = () => {
    setOpenAddDialog({type: '', open: false});
    setNewValue('');
    setAddError('');
  };
  // Hàm thêm mới
  const handleAddNew = async () => {
    if (!newValue.trim()) {
      setAddError('Vui lòng nhập tên!');
      return;
    }
    setAddLoading(true);
    let url = '', body = {};
    if (openAddDialog.type === 'danhmuc') {
      url = 'http://localhost:8080/danh-muc/them';
      body = { tenDanhMuc: newValue };
    } else if (openAddDialog.type === 'thuonghieu') {
      url = 'http://localhost:8080/thuong-hieu/them';
      body = { tenThuongHieu: newValue };
    } else if (openAddDialog.type === 'mausac') {
      url = 'http://localhost:8080/mau-sac/them';
      body = { mauSac: newValue };
    } else if (openAddDialog.type === 'kichco') {
      url = 'http://localhost:8080/kich-co/them';
      body = { kichCo: newValue };
    } else if (openAddDialog.type === 'trangthai') {
      url = 'http://localhost:8080/trang-thai/them'; // Thêm trạng thái
      body = { tenTrangThai: newValue };
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Lỗi khi thêm mới!');
      // Reload lại danh sách
      if (openAddDialog.type === 'danhmuc') {
        const res = await fetch('http://localhost:8080/danh-muc/hien-thi');
        setDanhMucs(await res.json());
      } else if (openAddDialog.type === 'thuonghieu') {
        const res = await fetch('http://localhost:8080/thuong-hieu/hien-thi');
        setThuongHieus(await res.json());
      } else if (openAddDialog.type === 'mausac') {
        const res = await fetch('http://localhost:8080/mau-sac/hien-thi');
        setMauSacs(await res.json());
      } else if (openAddDialog.type === 'kichco') {
        const res = await fetch('http://localhost:8080/kich-co/hien-thi');
        setKichCos(await res.json());
      } else if (openAddDialog.type === 'trangthai') {
        const res = await fetch('http://localhost:8080/trang-thai/hien-thi');
        setDanhMucs(await res.json()); // Danh mục cũng là trạng thái
      }
      setSnackbar({ open: true, message: 'Thêm mới thành công!', severity: 'success' });
      handleCloseAddDialog();
    } catch (e) {
      setAddError('Lỗi khi thêm mới!');
    } finally {
      setAddLoading(false);
    }
  };

  // Thêm hàm kiểm tra biến thể hợp lệ
  const isAllVariantsValid = variants.length > 0 && variants.every(v => v.soLuong && v.gia && v.hinhAnh);

  // Tự động sinh biến thể khi đủ thông tin
  useEffect(() => {
    // Kiểm tra đủ thông tin sản phẩm, màu sắc, kích cỡ
    const valid =
        addMaSanPham.trim() &&
        addTenSanPham.trim() &&
        addIdDanhMuc &&
        addIdThuongHieu &&
        addTrangThai &&
        addMultiMauSac.length > 0 &&
        addMultiKichCo.length > 0;
    if (valid) {
      // Kiểm tra trùng lặp với biến thể hiện có
      const newVariants = [];
      const duplicateVariants = [];
      
      for (const mauSacId of addMultiMauSac) {
        for (const kichCoId of addMultiKichCo) {
          // Kiểm tra xem biến thể này đã tồn tại chưa
          const isDuplicate = Array.isArray(existingVariants) && existingVariants.some(existing => 
            String(existing.idMauSac) === String(mauSacId) && 
            String(existing.idKichCo) === String(kichCoId)
          );
          
          console.log(`Kiểm tra biến thể: ${mauSacId}-${kichCoId}, isDuplicate:`, isDuplicate);
          
          if (isDuplicate) {
            const mauSacName = mauSacs.find(ms => String(ms.idMauSac) === String(mauSacId))?.mauSac || mauSacId;
            const kichCoName = kichCos.find(kc => String(kc.idKichCo) === String(kichCoId))?.kichCo || kichCoId;
            duplicateVariants.push(`${mauSacName} - ${kichCoName}`);
          } else {
            newVariants.push({
              idMauSac: mauSacId,
              idKichCo: kichCoId,
              soLuong: '',
              gia: '',
              hinhAnh: null,
              previewImg: ''
            });
            // Khởi tạo mảng ảnh phụ cho biến thể mới
            const variantKey = `${mauSacId}-${kichCoId}`;
            setMultipleImages(prev => ({...prev, [variantKey]: []}));
          }
        }
      }
      
      if (duplicateVariants.length > 0) {
        setVariantError(`Biến thể đã tồn tại: ${duplicateVariants.join(', ')}`);
        // Vẫn tạo những biến thể mới (không trùng lặp)
        if (newVariants.length > 0) {
          setVariants(newVariants);
          setShowVariants(true);
        } else {
          setVariants([]);
          setShowVariants(false);
        }
      } else {
        setVariants(newVariants);
        setShowVariants(true);
        setVariantError('');
      }
    } else {
      setVariants([]);
      setShowVariants(false);
    }
  }, [addMaSanPham, addTenSanPham, addIdDanhMuc, addIdThuongHieu, addTrangThai, addMultiMauSac, addMultiKichCo, existingVariants, mauSacs, kichCos]);

  // --- Giao diện như modal cũ nhưng là trang riêng ---
  const router = useRouter();
  // CustomBannerAlert: Banner lớn, căn giữa trên cùng, không icon, không Alert MUI
  function CustomBannerAlert({ open, message, severity, onClose }: { open: boolean, message: string, severity: 'success' | 'error', onClose: () => void }) {
    if (!open) return null;
    return (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 32,
          left: 'auto',
          transform: 'none',
          zIndex: 1300,
          background: severity === 'success' ? '#22c55e' : '#ef4444',
          color: '#fff',
          padding: '10px 22px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 16,
          minWidth: 220,
          maxWidth: '60vw',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10,
          boxShadow: 'none',
          border: 'none'
        }}>
          <span style={{flex:1}}>{message}</span>
          <button onClick={onClose} style={{
            background:'none',
            border:'none',
            color:'#fff',
            fontSize:20,
            fontWeight:900,
            cursor:'pointer',
            marginLeft:8
          }}>×</button>
        </div>
    );
  }
  // Tự động ẩn banner sau 4s
  React.useEffect(() => {
    if (snackbar.open) {
      const t = setTimeout(() => setSnackbar(s => ({...s, open: false})), 4000);
      return () => clearTimeout(t);
    }
  }, [snackbar.open]);

  const numberInputNoSpinnerSx = {
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '& input[type=number]': {
      MozAppearance: 'textfield',
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#bdbdbd',
      },
    },
    '& label.Mui-focused': {
      color: '#757575',
    },
  };
  return (
    <AdminLayout pageTitle="Thêm chi tiết sản phẩm">
      <Box sx={{
        maxWidth: 100,
        mx: 'auto',
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.3) 0%, rgba(249, 231, 180, 0.3) 100%)',
        minHeight: '100vh',
        p: 3
      }}>
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 4,
          alignItems: 'stretch',
          justifyContent: 'center',
          mb: 3
        }}>
          {/* Cột trái: Thông tin sản phẩm cha */}
          <Paper sx={{
            flex: '0 0 420px',
            minWidth: 320,
            maxWidth: 450,
            p: 4,
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)',
            bgcolor: 'white',
            mb: { xs: 3, lg: 0 },
            alignSelf: 'stretch',
            minHeight: 580,
            border: '1px solid rgba(181, 157, 58, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)'
            }
          }} elevation={0}>
              {/* Header Section */}
              <Box sx={{
                mb: 4,
                p: 3,
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
                borderRadius: 16,
                border: '1px solid rgba(181, 157, 58, 0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#6b4f1d', 
                  fontWeight: 700, 
                  mb: 0.1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}>
                  Thông tin sản phẩm
                </Typography>

              </Box>

              {/* Mode Selection Buttons */}
              <Box sx={{
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2, 
                mb: 4
              }}>
                <Button
                    variant="contained"
                    sx={{
                      flex: 1,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      borderRadius: 12,
                      height: 48,
                      background: addMode === 'new' ? 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)' : 'white',
                      color: addMode === 'new' ? 'white' : '#b59d3a',
                      border: `2px solid #b59d3a`,
                      boxShadow: addMode === 'new' ? '0 4px 15px rgba(181, 157, 58, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      textTransform: 'none',
                      '&:hover': {
                        background: addMode === 'new' ? 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)' : 'rgba(181, 157, 58, 0.05)',
                        transform: 'translateY(-1px)',
                        boxShadow: addMode === 'new' ? '0 6px 20px rgba(181, 157, 58, 0.4)' : '0 2px 8px rgba(181, 157, 58, 0.1)'
                      }
                    }}
                    onClick={() => {
                      setAddMode('new');
                      setAddIdSanPham('');
                      setAddMaSanPham('');
                      setAddTenSanPham('');
                      setAddMoTa('');
                      setAddIdDanhMuc('');
                      setAddIdThuongHieu('');
                      setAddTrangThai('');
                    }}
                >
                  Tạo mới sản phẩm
                </Button>
                <Button
                    variant="contained"
                    sx={{
                      flex: 1,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      borderRadius: 12,
                      height: 48,
                      background: addMode === 'select' ? 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)' : 'white',
                      color: addMode === 'select' ? 'white' : '#b59d3a',
                      border: `2px solid #b59d3a`,
                      boxShadow: addMode === 'select' ? '0 4px 15px rgba(181, 157, 58, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      textTransform: 'none',
                      '&:hover': {
                        background: addMode === 'select' ? 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)' : 'rgba(181, 157, 58, 0.05)',
                        transform: 'translateY(-1px)',
                        boxShadow: addMode === 'select' ? '0 6px 20px rgba(181, 157, 58, 0.4)' : '0 2px 8px rgba(181, 157, 58, 0.1)'
                      }
                    }}
                    onClick={() => {
                      setAddMode('select');
                      setAddIdSanPham(products[0]?.idSanPham ? String(products[0].idSanPham) : '');
                      const selected = products[0];
                      if (selected) {
                        setAddMaSanPham(selected.maSanPham || '');
                        setAddTenSanPham(selected.tenSanPham || '');
                        setAddMoTa(selected.moTa || '');
                        setAddIdDanhMuc(selected.idDanhMuc ? String(selected.idDanhMuc) : '');
                        setAddIdThuongHieu(selected.idThuongHieu ? String(selected.idThuongHieu) : '');
                        setAddTrangThai(selected.trangThai || '');
                        // Kiểm tra biến thể hiện có
                        checkExistingVariants(String(selected.idSanPham));
                      }
                    }}
                >
                   Chọn sản phẩm có sẵn
                </Button>
              </Box>
              {addMode === 'select' && (
                  <FormControl fullWidth size="small" sx={{mb:2}}>
                    <InputLabel>Id sản phẩm</InputLabel>
                    <Select
                        value={addIdSanPham || ''}
                        label="Id sản phẩm"
                        onChange={e => {
                          const id = e.target.value;
                          setAddIdSanPham(id);
                          const selected = products.find(p => String(p.idSanPham) === String(id));
                          if (selected) {
                            setAddMaSanPham(selected.maSanPham || '');
                            setAddTenSanPham(selected.tenSanPham || '');
                            setAddMoTa(selected.moTa || '');
                            setAddIdDanhMuc(selected.idDanhMuc ? String(selected.idDanhMuc) : '');
                            setAddIdThuongHieu(selected.idThuongHieu ? String(selected.idThuongHieu) : '');
                            setAddTrangThai(selected.trangThai || '');
                            // Kiểm tra biến thể hiện có
                            checkExistingVariants(id);
                          }
                        }}
                    >
                      <MenuItem value="">---</MenuItem>
                      {products.map(p => (
                          <MenuItem key={p.idSanPham} value={String(p.idSanPham)}>{p.idSanPham}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              )}
              <TextField label="Mã sản phẩm" fullWidth size="small" sx={{mb:2}} value={addMaSanPham}
                         onChange={e => {
                           setMaSanPhamError('');
                           setAddMaSanPham(e.target.value);
                           checkMaSanPhamTrung(e.target.value);
                         }}
                         InputProps={{ readOnly: addMode === 'select' }}
                         error={!!maSanPhamError}
                         helperText={maSanPhamError}
              />
              <TextField label="Tên sản phẩm" fullWidth size="small" sx={{mb:2}} value={addTenSanPham} onChange={e => { setTenSanPhamError(''); setAddTenSanPham(e.target.value); }} InputProps={{ readOnly: addMode === 'select' }} error={!!tenSanPhamError} helperText={tenSanPhamError} />
              <TextField label="Mô tả" fullWidth size="small" multiline minRows={3} sx={{mb:2}} value={addMoTa} onChange={e=>setAddMoTa(e.target.value)} InputProps={{ readOnly: addMode === 'select' }} />
              {/* Danh mục */}
              <FormControl fullWidth size="small" sx={{mb:2}} error={!!danhMucError}>
                <InputLabel>Danh mục</InputLabel>
                <Box sx={{display:'flex', alignItems:'center'}}>
                  <Select
                      value={addIdDanhMuc}
                      label="Danh mục"
                      onChange={e => {
                        const value = String(e.target.value);
                        setAddIdDanhMuc(value);
                        if (value !== '') setDanhMucError('');
                      }}
                      renderValue={selected => selected ? (danhMucs.find(dm => String(dm.idDanhMuc) === selected)?.tenDanhMuc || 'Danh mục') : 'Danh mục'}
                      sx={{
                        flex: 1,
                        '& .Mui-disabled': {
                          color: '#000 !important',
                          WebkitTextFillColor: '#000 !important'
                        }
                      }}
                      disabled={addMode === 'select'}
                  >
                    <MenuItem value="">---</MenuItem>
                    {danhMucs.map(dm => (
                        <MenuItem key={dm.idDanhMuc} value={String(dm.idDanhMuc)}>{dm.tenDanhMuc}</MenuItem>
                    ))}
                  </Select>
                  {addMode !== 'select' && (
                    <IconButton size="small" sx={{ml:1}} onClick={()=>handleOpenAddDialog('danhmuc')}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {danhMucError && <Typography color="error" fontSize={13} mt={0.5}>{danhMucError}</Typography>}
              </FormControl>
              {/* Thương hiệu */}
              <FormControl fullWidth size="small" sx={{mb:2}} error={!!thuongHieuError}>
                <InputLabel>Thương hiệu</InputLabel>
                <Box sx={{display:'flex', alignItems:'center'}}>
                  <Select
                      value={addIdThuongHieu}
                      label="Thương hiệu"
                      onChange={e => {
                        const value = String(e.target.value);
                        setAddIdThuongHieu(value);
                        if (value !== '') setThuongHieuError('');
                      }}
                      renderValue={selected => selected ? (thuongHieus.find(th => String(th.idThuongHieu) === selected)?.tenThuongHieu || 'Thương hiệu') : 'Thương hiệu'}
                      sx={{
                        flex: 1,
                        '& .Mui-disabled': {
                          color: '#000 !important',
                          WebkitTextFillColor: '#000 !important'
                        }
                      }}
                      disabled={addMode === 'select'}
                  >
                    <MenuItem value="">---</MenuItem>
                    {thuongHieus.map(th => (
                        <MenuItem key={th.idThuongHieu} value={String(th.idThuongHieu)}>{th.tenThuongHieu}</MenuItem>
                    ))}
                  </Select>
                  {addMode !== 'select' && (
                    <IconButton size="small" sx={{ml:1}} onClick={()=>handleOpenAddDialog('thuonghieu')}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {thuongHieuError && <Typography color="error" fontSize={13} mt={0.5}>{thuongHieuError}</Typography>}
              </FormControl>
              <FormControl fullWidth size="small" sx={{mb:2}} error={!!trangThaiError}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                    value={addTrangThai}
                    label="Trạng thái"
                    onChange={e => {
                      const value = String(e.target.value);
                      setAddTrangThai(value);
                      if (value !== '') setTrangThaiError('');
                    }}
                    renderValue={selected => selected ? selected : 'Trạng thái'}
                    sx={{
                      '& .Mui-disabled': {
                        color: '#000 !important',
                        WebkitTextFillColor: '#000 !important'
                      }
                    }}
                    disabled={addMode === 'select'}
                >
                  <MenuItem value="">---</MenuItem>
                  <MenuItem value="Đang bán">Đang bán</MenuItem>
                  <MenuItem value="Ngừng bán">Ngừng bán</MenuItem>
                </Select>
                {trangThaiError && <Typography color="error" fontSize={13} mt={0.5}>{trangThaiError}</Typography>}
              </FormControl>
              {addMode === 'new' && (
                  <Button
                      variant="contained"
                      style={{
                        background: '#b59d3a',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                        borderRadius: 10,
                        height: 44,
                        boxShadow: '0 2px 8px #b59d3a22',
                        padding: '0 24px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        marginTop: 0,
                      }}
                      fullWidth
                      onClick={handleCreateProduct}
                  >
                    + Thêm sản phẩm
                  </Button>
              )}
            </Paper>
            {/* Cột phải: Chọn màu/kích cỡ và bảng biến thể */}
            <Paper sx={{
              flex: 1,
              minWidth: 500,
              maxWidth: 1200,
              p: 4,
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)',
              bgcolor: 'white',
              alignSelf: 'stretch',
              minHeight: 580,
              border: '1px solid rgba(181, 157, 58, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)'
              }
            }} elevation={0}>
              {/* Header Section */}
              <Box sx={{
                mb: 4,
                p: 3,
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
                borderRadius: 16,
                border: '1px solid rgba(181, 157, 58, 0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#6b4f1d', 
                  fontWeight: 700, 
                  mb: 0.1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}>
                  Tạo biến thể sản phẩm
                </Typography>
              </Box>
              {/* Selection Controls */}
              <Box sx={{
                mb: 4,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 2,
                flexWrap: 'nowrap',
                '& > *': {
                  flex: '0 0 auto',
                  marginBottom: 0
                },
                '& .MuiFormControl-root': {
                  marginBottom: 0
                }
              }}>
                {/* Màu sắc */}
                <FormControl size="medium" sx={{ minWidth: 200 }} error={!!mauSacError}>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#6b4f1d', 
                    fontWeight: 600, 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Select
                        multiple
                        displayEmpty
                        value={addMultiMauSac}
                        onChange={e=>setAddMultiMauSac(typeof e.target.value==='string'?e.target.value.split(','):e.target.value as string[])}
                        renderValue={selected => selected.length ? mauSacs.filter(ms => selected.includes(String(ms.idMauSac))).map(ms=>ms.mauSac).join(', ') : 'Chọn màu sắc'}
                        sx={{
                          flex: 1,
                          borderRadius: 12,
                          background: 'rgba(255, 251, 230, 0.5)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(181, 157, 58, 0.3)',
                            borderWidth: 2
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#b59d3a'
                          }
                        }}
                    >
                      {mauSacs.map(ms=>(<MenuItem key={ms.idMauSac} value={String(ms.idMauSac)}>{ms.mauSac}</MenuItem>))}
                    </Select>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        background: 'rgba(181, 157, 58, 0.1)',
                        borderRadius: 8,
                        '&:hover': {
                          background: 'rgba(181, 157, 58, 0.2)'
                        }
                      }} 
                      onClick={()=>handleOpenAddDialog('mausac')}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {mauSacError && <Typography color="error" fontSize={13} mt={0.5}>{mauSacError}</Typography>}
                </FormControl>

                {/* Kích cỡ */}
                <FormControl size="medium" sx={{ minWidth: 200 }} error={!!kichCoError}>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#6b4f1d', 
                    fontWeight: 600, 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Select
                        multiple
                        displayEmpty
                        value={addMultiKichCo}
                        onChange={e=>setAddMultiKichCo(typeof e.target.value==='string'?e.target.value.split(','):e.target.value as string[])}
                        renderValue={selected => selected.length ? kichCos.filter(kc => selected.includes(String(kc.idKichCo))).map(kc=>kc.kichCo).join(', ') : 'Chọn kích cỡ'}
                        sx={{
                          flex: 1,
                          borderRadius: 12,
                          background: 'rgba(255, 251, 230, 0.5)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(181, 157, 58, 0.3)',
                            borderWidth: 2
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#b59d3a'
                          }
                        }}
                    >
                      {kichCos.map(kc=>(<MenuItem key={kc.idKichCo} value={String(kc.idKichCo)}>{kc.kichCo}</MenuItem>))}
                    </Select>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        background: 'rgba(181, 157, 58, 0.1)',
                        borderRadius: 8,
                        '&:hover': {
                          background: 'rgba(181, 157, 58, 0.2)'
                        }
                      }} 
                      onClick={()=>handleOpenAddDialog('kichco')}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {kichCoError && <Typography color="error" fontSize={13} mt={0.5}>{kichCoError}</Typography>}
                </FormControl>

                {/* Nút Thêm thuộc tính chung */}
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', ml: 1 }}>
                  <Button
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        borderRadius: 12,
                        px: 3,
                        py: 1.5,
                        height: '56px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 15px rgba(181, 157, 58, 0.3)',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 20px rgba(181, 157, 58, 0.4)'
                        },
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => {
                        setCommonSoLuong('');
                        setCommonGia('');
                        setCommonError('');
                        setOpenCommonAttrModal(true);
                      }}
                  >
                    Thêm thuộc tính chung
                  </Button>
                </Box>
              </Box>
              {isCheckingVariants && (
                <Typography color="info" sx={{mb:1, fontStyle: 'italic'}}>
                  Đang kiểm tra biến thể hiện có...
                </Typography>
              )}
              {Array.isArray(existingVariants) && existingVariants.length > 0 && (
                <Box sx={{mb:2, p:2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd'}}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{mb:1}}>
                    Biến thể hiện có của sản phẩm này:
                  </Typography>
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                    {existingVariants.map((variant, idx) => {
                      const mauSacName = mauSacs.find(ms => String(ms.idMauSac) === String(variant.idMauSac))?.mauSac || variant.idMauSac;
                      const kichCoName = kichCos.find(kc => String(kc.idKichCo) === String(variant.idKichCo))?.kichCo || variant.idKichCo;
                      return (
                        <Chip 
                          key={idx}
                          label={`${mauSacName} - ${kichCoName}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
              {variantError && <Typography color="error" sx={{mb:1}}>{variantError}</Typography>}
              {/* Bảng nhập từng biến thể */}
              {showVariants && (
                  <TableContainer component={Paper} sx={{ mt: 0, maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 90 }}>Màu sắc</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 90 }}>Kích cỡ</TableCell>
                          <TableCell>Số lượng</TableCell>
                          <TableCell>Giá</TableCell>
                          <TableCell>Ảnh</TableCell>
                          <TableCell align="center" sx={{ width: 48 }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {variants.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" style={{ color: '#888', fontStyle: 'italic' }}>
                                    Hãy chọn màu sắc và kích cỡ để tạo biến thể
                                  </TableCell>
                                </TableRow>
                            ) :
                            variants.map((v, idx) => (
                                <React.Fragment key={v.idMauSac + '-' + v.idKichCo}>
                                  <TableRow>
                                    <TableCell>{mauSacs.find(ms => String(ms.idMauSac) === v.idMauSac)?.mauSac || v.idMauSac}</TableCell>
                                    <TableCell>{kichCos.find(kc => String(kc.idKichCo) === v.idKichCo)?.kichCo || v.idKichCo}</TableCell>
                                    <TableCell>
                                      <TextField
                                          value={v.soLuong}
                                          onChange={e => {
                                            const newVariants = [...variants];
                                            newVariants[idx].soLuong = e.target.value;
                                            setVariants(newVariants);
                                            setVariantErrors(prev => ({...prev, [v.idMauSac + '-' + v.idKichCo]: ''}));
                                          }}
                                          type="number"
                                          size="small"
                                          label={undefined}
                                          placeholder=""
                                          error={showVariantErrors && (!v.soLuong || isNaN(Number(v.soLuong)) || Number(v.soLuong) < 0)}
                                          helperText={
                                            showVariantErrors && (!v.soLuong || isNaN(Number(v.soLuong))) ? 'Chưa nhập số lượng'
                                                : (showVariantErrors && Number(v.soLuong) < 0 ? 'Số lượng phải >= 0' : '')
                                          }
                                          inputProps={{
                                            min: 1,
                                            step: 1,
                                          }}
                                          sx={numberInputNoSpinnerSx}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                          value={v.gia}
                                          onChange={e => {
                                            const newVariants = [...variants];
                                            newVariants[idx].gia = e.target.value;
                                            setVariants(newVariants);
                                            setVariantErrors(prev => ({...prev, [v.idMauSac + '-' + v.idKichCo]: ''}));
                                          }}
                                          type="number"
                                          size="small"
                                          label={undefined}
                                          placeholder=""
                                          error={showVariantErrors && (!v.gia || isNaN(Number(v.gia)) || Number(v.gia) <= 0)}
                                          helperText={
                                            showVariantErrors && (!v.gia || isNaN(Number(v.gia))) ? 'Chưa nhập giá'
                                                : (showVariantErrors && Number(v.gia) <= 0 ? 'Giá phải > 0' : '')
                                          }
                                          inputProps={{
                                            min: 1,
                                            step: 1,
                                          }}
                                          sx={numberInputNoSpinnerSx}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {/* Ảnh chính */}
                                        <div>
                                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 1, display: 'block' }}>
                                            Ảnh chính:
                                          </Typography>
                                          <input
                                              type="file"
                                              accept="image/*"
                                              style={{ color: 'transparent', width: 110 }}
                                              onChange={e => {
                                                const file = e.target.files?.[0] || null;
                                                const newVariants = [...variants];
                                                newVariants[idx].hinhAnh = file;
                                                newVariants[idx].previewImg = file ? URL.createObjectURL(file) : '';
                                                setVariants(newVariants);
                                                setVariantErrors(prev => ({...prev, [v.idMauSac + '-' + v.idKichCo]: ''}));
                                              }}
                                          />
                                          {v.previewImg && <img src={v.previewImg} alt="preview" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', marginTop: 4 }} />}
                                        </div>
                                        
                                        {/* Ảnh phụ */}
                                        <div>
                                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 1, display: 'block' }}>
                                            Ảnh phụ (có thể chọn nhiều):
                                          </Typography>
                                          <input
                                              type="file"
                                              accept="image/*"
                                              multiple
                                              style={{ 
                                                color: 'transparent', 
                                                width: 110,
                                                cursor: 'pointer'
                                              }}
                                              onChange={e => {
                                                const files = Array.from(e.target.files || []);
                                                const variantKey = `${v.idMauSac}-${v.idKichCo}`;
                                                console.log(`Đã chọn ${files.length} ảnh cho biến thể ${variantKey}:`, files);
                                                // Thêm ảnh mới vào danh sách hiện có thay vì thay thế
                                                setMultipleImages(prev => {
                                                  const currentImages = prev[variantKey] || [];
                                                  const newImages = [...currentImages, ...files];
                                                  console.log('Tổng số ảnh sau khi thêm:', newImages.length);
                                                  return {...prev, [variantKey]: newImages};
                                                });
                                                // Reset input để có thể chọn lại cùng file
                                                e.target.value = '';
                                              }}
                                          />
                                          {(() => {
                                            const variantKey = `${v.idMauSac}-${v.idKichCo}`;
                                            const additionalImages = multipleImages[variantKey] || [];
                                            return (
                                              <div>
                                                {additionalImages.length > 0 && (
                                                  <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600, display: 'block', mb: 1 }}>
                                                    Đã chọn {additionalImages.length} ảnh phụ
                                                  </Typography>
                                                )}
                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                                  {additionalImages.map((file, imgIdx) => (
                                                    <div key={imgIdx} style={{ position: 'relative' }}>
                                                      <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`preview-${imgIdx}`} 
                                                        style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} 
                                                      />
                                                      <button
                                                        onClick={() => {
                                                          const newImages = additionalImages.filter((_, i) => i !== imgIdx);
                                                          setMultipleImages(prev => ({...prev, [variantKey]: newImages}));
                                                        }}
                                                        style={{
                                                          position: 'absolute',
                                                          top: -5,
                                                          right: -5,
                                                          background: '#e74c3c',
                                                          color: 'white',
                                                          border: 'none',
                                                          borderRadius: '50%',
                                                          width: 16,
                                                          height: 16,
                                                          fontSize: 10,
                                                          cursor: 'pointer',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center'
                                                        }}
                                                      >
                                                        ×
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>
                                                {additionalImages.length > 0 && (
                                                  <button
                                                    onClick={() => {
                                                      setMultipleImages(prev => ({...prev, [variantKey]: []}));
                                                    }}
                                                    style={{
                                                      background: '#ff9800',
                                                      color: 'white',
                                                      border: 'none',
                                                      borderRadius: 4,
                                                      padding: '4px 8px',
                                                      fontSize: 10,
                                                      cursor: 'pointer',
                                                      marginTop: 4
                                                    }}
                                                  >
                                                    Xóa tất cả ảnh phụ
                                                  </button>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                      {showVariantErrors && !v.hinhAnh && <Typography color="error" fontSize={13} mt={0.5}>Chọn ảnh chính</Typography>}
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton size="small" onClick={() => {
                                        const newVariants = variants.filter((_, i) => i !== idx);
                                        setVariants(newVariants);
                                      }}>
                                        <FaTimes style={{ color: '#888' }} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                            ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
              )}
            </Paper>
          </Box>
          {/* Action Buttons */}
          <Box sx={{
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4, 
            gap: 3, 
            maxWidth: 1120, 
            mx: 'auto',
            p: 3,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(181, 157, 58, 0.1)',
            border: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            <Button
                variant="outlined"
                size="large"
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 12,
                  minWidth: 140,
                  height: 52,
                  color: '#8a7a2a',
                  borderColor: 'rgba(181, 157, 58, 0.4)',
                  borderWidth: 2,
                  background: 'white',
                  '&:hover': { 
                    borderColor: '#b59d3a', 
                    background: 'rgba(181, 157, 58, 0.05)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(181, 157, 58, 0.2)'
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => router.push('/ChiTietSanPham')}
            >
              ❌ Hủy
            </Button>

            <Button
                variant="contained"
                size="large"
                startIcon={<FaPlus style={{fontSize: 20, marginRight: 4}} />}
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 12,
                  minWidth: 160,
                  height: 52,
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(181, 157, 58, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(181, 157, 58, 0.4)'
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'all 0.3s ease'
                }}
                onClick={handleOpenConfirmModal}
            >
              Thêm sản phẩm
            </Button>
          </Box>
          {/* Banner thông báo lớn */}
          <CustomBannerAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={()=>setSnackbar({...snackbar, open:false})} />
        </Box>
        {/* Dialog thêm mới */}
        <Dialog open={openAddDialog.open} onClose={handleCloseAddDialog}>
          <DialogTitle>Thêm mới {openAddDialog.type === 'danhmuc' ? 'danh mục' : openAddDialog.type === 'thuonghieu' ? 'thương hiệu' : openAddDialog.type === 'mausac' ? 'màu sắc' : 'kích cỡ'}</DialogTitle>
          <DialogContent>
            <TextField
                autoFocus
                fullWidth
                label=""
                value={newValue}
                onChange={e=>setNewValue(e.target.value)}
                error={!!addError}
                helperText={addError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#bdbdbd',
                    },
                  },
                  '& label.Mui-focused': {
                    color: '#757575',
                  },
                }}
            />
          </DialogContent>
          <DialogActions>
            <Button
                onClick={handleCloseAddDialog}
                sx={{ color: '#888', fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
                onClick={handleAddNew}
                disabled={addLoading}
                variant="contained"
                sx={{ background: '#b59d3a', color: '#fff', fontWeight: 700, '&:hover': { background: '#a88c2a' } }}
            >
              Thêm
            </Button>
          </DialogActions>
        </Dialog>
        {/* Modal nhập thuộc tính chung */}
        <Dialog open={openCommonAttrModal} onClose={() => setOpenCommonAttrModal(false)}>
          <DialogTitle>Nhập số lượng và giá cho tất cả biến thể</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                  label="Số lượng"
                  type="number"
                  value={commonSoLuong}
                  onChange={e => setCommonSoLuong(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={numberInputNoSpinnerSx}
              />
              <TextField
                  label="Giá"
                  type="number"
                  value={commonGia}
                  onChange={e => setCommonGia(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={numberInputNoSpinnerSx}
              />
              {commonError && <Typography color="error">{commonError}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
                onClick={() => setOpenCommonAttrModal(false)}
                sx={{ color: '#888', fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
                variant="contained"
                sx={{ background: '#b59d3a', color: '#fff', fontWeight: 700, '&:hover': { background: '#a88c2a' } }}
                onClick={() => {
                  if (!commonSoLuong || isNaN(Number(commonSoLuong)) || Number(commonSoLuong) < 0) {
                    setCommonError('Số lượng phải >= 0');
                    return;
                  }
                  if (!commonGia || isNaN(Number(commonGia)) || Number(commonGia) <= 0) {
                    setCommonError('Giá phải > 0');
                    return;
                  }
                  // Cập nhật cho tất cả biến thể
                  const newVariants = variants.map(v => ({
                    ...v,
                    soLuong: commonSoLuong,
                    gia: commonGia
                  }));
                  setVariants(newVariants);
                  setOpenCommonAttrModal(false);
                }}
            >
              Thêm
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Modal confirm thêm sản phẩm */}
        <Dialog 
          open={openConfirmModal} 
          onClose={() => setOpenConfirmModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxWidth: 400,
              mx: 'auto',
              my: 0,
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 600,
              maxHeight: '90vh',
              overflowY: 'auto'
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            fontWeight: 700, 
            fontSize: 18,
            color: '#b59d3a',
            py: 1.5,
            px: 3
          }}>
            Xác nhận
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', px: 3, py: 1 }}>
            <Typography>
              Bạn có muốn thêm sản phẩm và biến thể này không?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sẽ tạo {variants.length} biến thể cho sản phẩm "{addTenSanPham}"
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', py: 2, px: 3 }}>
            <Button
              onClick={() => setOpenConfirmModal(false)}
              sx={{
                color: '#666',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                border: '1px solid #ddd',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddAll}
              variant="contained"
              sx={{
                background: '#b59d3a',
                color: '#fff',
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  background: '#a88c2a'
                }
              }}
            >
              Đồng ý
            </Button>
          </DialogActions>
        </Dialog>
     </AdminLayout>
  );
}