"use client";
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Switch, Chip } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FaEye, FaEdit, FaPowerOff, FaSave, FaTimes, FaPlus, FaSearch, FaFilter, FaTimesCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';

// Định nghĩa các kiểu dữ liệu (có thể cần chỉnh lại cho đúng backend)
interface ProductDetail {
  idChiTietSanPham: number;
  maSanPham: string;
  tenSanPham: string;
  tenThuongHieu: string;
  tenDanhMuc: string;
  tenMauSac: string;
  tenKichCo: string;
  duongDanHinhAnh: string;
  gia: number | null;
  soLuong: number | null;
  trangThai: string;
  moTa: string;
  idSanPham?: number;
  idMauSac?: number;
  idKichCo?: number;
  idHinhAnh?: number;
  idThuongHieu?: number;
  idDanhMuc?: number;
  // Thêm mảng hình ảnh cho nhiều ảnh
  hinhAnhList?: ChiTietSanPhamHinhAnh[];

}

interface ChiTietSanPhamHinhAnh {
  idChiTietSanPhamHinhAnh: number;
  idChiTietSanPham: number;
  idHinhAnh: number;
  tenHinhAnh: string;
  urlHinhAnh: string;
  thuTu: number;
  laAnhChinh: boolean;
}

interface ProductDetailTableProps {
  userRole?: string;
}

export default function ProductDetailTable({ userRole = 'NHAN_VIEN' }: ProductDetailTableProps) {
  // State cho filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // State cho data
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(0);

  // State cho modal chi tiết
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState<{
    bienThe: ProductDetail[];
    maSanPham: string;
    tenSanPham: string;
    tenThuongHieu: string;
    tenDanhMuc: string;
    moTa: string;
    tongSoLuong: number;
    trangThai: string;
  } | null>(null);

  // State cho modal sửa
  const [editDetail, setEditDetail] = useState<ProductDetail|null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState("");

  // State cho các select
  const [products, setProducts] = useState<any[]>([]);
  const [kichCos, setKichCos] = useState<any[]>([]);
  const [mauSacs, setMauSacs] = useState<any[]>([]);
  const [danhMucs, setDanhMucs] = useState<any[]>([]);
  const [thuongHieus, setThuongHieus] = useState<any[]>([]);

  // State cho filter select unique
  const uniqueCategories = Array.from(new Set(details.map(d => d.tenDanhMuc)));
  const uniqueColors = Array.from(new Set(details.map(d => d.tenMauSac)));
  const uniqueSizes = Array.from(new Set(details.map(d => d.tenKichCo)));
  const uniqueStatus = Array.from(new Set(details.map(d => d.trangThai)));

  // State cho modal thêm nhanh
  const [openAddDanhMuc, setOpenAddDanhMuc] = useState(false);
  const [addDanhMucError, setAddDanhMucError] = useState("");
  const [addDanhMucSuccess, setAddDanhMucSuccess] = useState("");
  const [addDanhMucLoading, setAddDanhMucLoading] = useState(false);
  const [tenDanhMucMoi, setTenDanhMucMoi] = useState("");
  const [addIdDanhMuc, setAddIdDanhMuc] = useState('');

  const [openAddThuongHieu, setOpenAddThuongHieu] = useState(false);
  const [addThuongHieuError, setAddThuongHieuError] = useState("");
  const [addThuongHieuSuccess, setAddThuongHieuSuccess] = useState("");
  const [addThuongHieuLoading, setAddThuongHieuLoading] = useState(false);
  const [tenThuongHieuMoi, setTenThuongHieuMoi] = useState("");

  const [openAddMauSac, setOpenAddMauSac] = useState(false);
  const [addMauSacError, setAddMauSacError] = useState("");
  const [addMauSacLoading, setAddMauSacLoading] = useState(false);
  const [tenMauSacMoi, setTenMauSacMoi] = useState("");

  const [openAddKichCo, setOpenAddKichCo] = useState(false);
  const [addKichCoError, setAddKichCoError] = useState("");
  const [addKichCoLoading, setAddKichCoLoading] = useState(false);
  const [tenKichCoMoi, setTenKichCoMoi] = useState("");

  // State cho biến thể
  const [variants, setVariants] = useState<any[]>([]);
  const [addVariantSuccess, setAddVariantSuccess] = useState("");
  const [genVariantError, setGenVariantError] = useState("");
  const [genVariantSuccess, setGenVariantSuccess] = useState("");
  const [setAddVariantError] = useState<any>(()=>()=>{}); // placeholder





  // State cho các hàm xử lý
  const [addMauSacSuccess, setAddMauSacSuccess] = useState('');
  const [addKichCoSuccess, setAddKichCoSuccess] = useState('');



  // Upload ảnh, chọn ảnh, preview ảnh cho modal sửa/thêm sản phẩm
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadImgError, setUploadImgError] = useState('');
  const handleUploadImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImg(true);
    setUploadImgError('');
    try {
      const res = await fetch('http://localhost:8080/hinh-anh/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      console.log('Upload response:', data);
      if (!res.ok || !(data.fileUrl || data.fileName)) throw new Error(data.message || 'Lỗi upload ảnh!');
      const url = data.fileUrl.startsWith('http')
          ? data.fileUrl
          : `http://localhost:8080${data.fileUrl}`;
      setPreviewImg(url);
      if (data.idHinhAnh) setEditForm((f: any) => ({...f, idHinhAnh: data.idHinhAnh}));
    } catch (err: any) {
      setUploadImgError(err.message || 'Lỗi upload ảnh!');
    } finally {
      setUploadingImg(false);
    }
  };

  // Validate nâng cao, kiểm tra mã trùng (gọi API kiểm tra mã sản phẩm)
  const [maSanPhamCheck, setMaSanPhamCheck] = useState('');
  const [maSanPhamError, setMaSanPhamError] = useState('');
  const [tenSanPhamError, setTenSanPhamError] = useState('');
  const [moTaError, setMoTaError] = useState('');
  const [danhMucError, setDanhMucError] = useState('');
  const [thuongHieuError, setThuongHieuError] = useState('');
  const [trangThaiError, setTrangThaiError] = useState('');
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

  // Hoàn thiện logic sinh biến thể (hiển thị, xóa, cập nhật biến thể)
  const handleRemoveVariant = (idx: number) => {
    setVariants(vs => vs.filter((_, i) => i !== idx));
  };

  // Hàm lọc bỏ sản phẩm cha có tổng số lượng = 0
  const filterOutZeroQuantityProducts = (data: ProductDetail[]) => {
    // Group theo mã sản phẩm để tính tổng số lượng
    const productGroups = new Map<string, ProductDetail[]>();
    data.forEach(detail => {
      if (!productGroups.has(detail.maSanPham)) {
        productGroups.set(detail.maSanPham, []);
      }
      productGroups.get(detail.maSanPham)!.push(detail);
    });

    // Lọc bỏ các sản phẩm cha có tổng số lượng = 0
    const productsWithZeroTotal = Array.from(productGroups.entries())
        .filter(([maSanPham, variants]) => {
          const totalQuantity = variants.reduce((sum, v) => sum + (Number(v.soLuong) || 0), 0);
          return totalQuantity === 0;
        });

    console.log('Sản phẩm cha có tổng số lượng = 0 (sẽ bị ẩn):', productsWithZeroTotal.map(([ma, _]) => ma));

    // Trả về dữ liệu đã lọc bỏ sản phẩm hết hàng
    const filteredData = data.filter(detail => {
      const totalQuantity = productGroups.get(detail.maSanPham)?.reduce((sum, v) => sum + (Number(v.soLuong) || 0), 0) || 0;
      return totalQuantity > 0; // Chỉ giữ lại sản phẩm có số lượng > 0
    });

    return filteredData;
  };

  // Fetch data (giả lập, bạn cần chỉnh lại endpoint cho đúng)
  useEffect(() => {
    setPageLoading(true);
    fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi')
        .then(res => res.json())
        .then(async (data) => {
          console.log('Raw data from backend:', data);
          // Sắp xếp giảm dần theo idChiTietSanPham (mới nhất lên đầu)
          data.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);

          // Lọc bỏ sản phẩm cha có tổng số lượng = 0
          const filteredData = filterOutZeroQuantityProducts(data);

          setDetails(filteredData);
        })
        .finally(() => setPageLoading(false));
  }, []);

  // Filter logic
  const filteredDetails = details.filter(detail => {
    const search = searchTerm.trim().toLowerCase();
    // Xác định trạng thái hiển thị thực tế - tự động cập nhật dựa trên số lượng
    const trangThaiHienThi = Number(detail.soLuong) === 0 ? 'Ngừng bán' : detail.trangThai;
    return (
        (!search ||
            detail.maSanPham?.toLowerCase().includes(search) ||
            detail.tenSanPham?.toLowerCase().includes(search) ||
            detail.moTa?.toLowerCase().includes(search)
        ) &&
        (!filterBrand || detail.tenThuongHieu === filterBrand) &&
        (!filterCategory || detail.tenDanhMuc === filterCategory) &&
        (!filterColor || detail.tenMauSac === filterColor) &&
        (!filterSize || detail.tenKichCo === filterSize) &&
        (!filterStatus || trangThaiHienThi === filterStatus)
    );
  });

  // Use the single pageSize variable
  const pageSize = 10;
  const pagedDetails = filteredDetails.slice(page * pageSize, (page + 1) * pageSize);

  // Khi đổi filter/search thì về trang đầu
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterBrand, filterCategory, filterColor, filterSize, filterStatus]);

  // Các hàm xử lý (placeholder, bạn cần hoàn thiện thêm)
  const handleToggleStatus = async (detail: ProductDetail) => {
    try {
      const res = await fetch(`http://localhost:8080/chi-tiet-san-pham/doi-trang-thai/${detail.idChiTietSanPham}`, {
        method: 'PUT'
      });
      const data = await res.text(); // API trả về chuỗi
      if (!res.ok) throw new Error(data || 'Lỗi đổi trạng thái!');
      setSnackbar({ open: true, message: 'Đổi trạng thái thành công!', severity: 'success' });
      // Cập nhật lại trạng thái trong bảng
      setDetails(prev => prev.map(d =>
          d.idChiTietSanPham === detail.idChiTietSanPham
              ? { ...d, trangThai: d.trangThai === 'Đang bán' ? 'Ngừng bán' : 'Đang bán' }
              : d
      ));
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Lỗi đổi trạng thái!', severity: 'error' });
    }
  };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // ...
  };
  const handleGenVariant = () => {
    const variants = [];
    for (const mau of addMultiMauSac) {
      for (const kc of addMultiKichCo) {
        variants.push({ idMauSac: mau, idKichCo: kc });
      }
    }
    setAddVariants(variants);
  };
  const validateVariant = () => {
    // ...
    return "";
  };

  // Validate form khi sửa/thêm sản phẩm
  const validateEditForm = () => {
    if (!editForm.maSanPham || editForm.maSanPham.length < 3 || editForm.maSanPham.length > 20) {
      return 'Mã sản phẩm phải từ 3-20 ký tự';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(editForm.maSanPham)) {
      return 'Mã sản phẩm không chứa ký tự đặc biệt';
    }
    if (!editForm.tenSanPham || editForm.tenSanPham.length < 3 || editForm.tenSanPham.length > 50) {
      return 'Tên sản phẩm phải từ 3-50 ký tự';
    }
    if (!editForm.idSanPham) {
      return 'Thiếu thông tin sản phẩm cha';
    }
    // ...các validate khác nếu cần...
    return '';
  };

  // Quick add (thêm nhanh danh mục, thương hiệu, màu sắc, kích cỡ)
  // Modal thêm nhanh danh mục
  const handleAddDanhMuc = async () => {
    if (!tenDanhMucMoi.trim()) {
      setAddDanhMucError('Vui lòng nhập tên danh mục!');
      return;
    }
    setAddDanhMucError('');
    try {
      const res = await fetch('http://localhost:8080/danh-muc/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDanhMuc: tenDanhMucMoi })
      });
      const data = await res.json();
      if (!res.ok || !data.idDanhMuc) throw new Error(data.message || 'Lỗi thêm danh mục!');
      setAddDanhMucSuccess('Thêm danh mục thành công!');
      setTimeout(()=>setAddDanhMucSuccess(''), 2000);
      setOpenAddDanhMuc(false);
      setTenDanhMucMoi('');
      // Fetch lại danh mục và auto chọn
      const res2 = await fetch('http://localhost:8080/danh-muc/hien-thi');
      const danhMucData = await res2.json();
      setDanhMucs(danhMucData);
      setAddIdDanhMuc(String(data.idDanhMuc));
    } catch (err) {
      setAddDanhMucError((err as Error).message || 'Lỗi thêm danh mục!');
    }
  };

  // Quick add thương hiệu
  const handleAddThuongHieu = async () => {
    if (!tenThuongHieuMoi.trim()) {
      setAddThuongHieuError('Vui lòng nhập tên thương hiệu!');
      return;
    }
    setAddThuongHieuError('');
    try {
      const res = await fetch('http://localhost:8080/thuong-hieu/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenThuongHieu: tenThuongHieuMoi })
      });
      const data = await res.json();
      if (!res.ok || !data.idThuongHieu) throw new Error(data.message || 'Lỗi thêm thương hiệu!');
      setAddThuongHieuSuccess('Thêm thương hiệu thành công!');
      setTimeout(()=>setAddThuongHieuSuccess(''), 2000);
      setOpenAddThuongHieu(false);
      setTenThuongHieuMoi('');
      // Fetch lại thương hiệu và auto chọn
      const res2 = await fetch('http://localhost:8080/thuong-hieu/hien-thi');
      const thuongHieuData = await res2.json();
      setThuongHieus(thuongHieuData);
      setAddIdThuongHieu(String(data.idThuongHieu));
    } catch (err) {
      setAddThuongHieuError((err as Error).message || 'Lỗi thêm thương hiệu!');
    }
  };

  // Quick add màu sắc
  const handleAddMauSac = async () => {
    if (!tenMauSacMoi.trim()) {
      setAddMauSacError('Vui lòng nhập tên màu sắc!');
      return;
    }
    setAddMauSacError('');
    try {
      const res = await fetch('http://localhost:8080/mau-sac/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mauSac: tenMauSacMoi })
      });
      const data = await res.json();
      if (!res.ok || !data.idMauSac) throw new Error(data.message || 'Lỗi thêm màu sắc!');
      setAddMauSacSuccess('Thêm màu sắc thành công!');
      setTimeout(()=>setAddMauSacSuccess(''), 2000);
      setOpenAddMauSac(false);
      setTenMauSacMoi('');
      // Fetch lại màu sắc và auto chọn
      const res2 = await fetch('http://localhost:8080/mau-sac/hien-thi');
      const mauSacData = await res2.json();
      setMauSacs(mauSacData);
      setAddIdMauSac(String(data.idMauSac));
      setAddMultiMauSac(prev => prev.includes(String(data.idMauSac)) ? prev : [...prev, String(data.idMauSac)]);
    } catch (err) {
      setAddMauSacError((err as Error).message || 'Lỗi thêm màu sắc!');
    }
  };

  // Quick add kích cỡ
  const handleAddKichCo = async () => {
    if (!tenKichCoMoi.trim()) {
      setAddKichCoError('Vui lòng nhập tên kích cỡ!');
      return;
    }
    setAddKichCoError('');
    try {
      const res = await fetch('http://localhost:8080/kich-co/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kichCo: tenKichCoMoi })
      });
      const data = await res.json();
      if (!res.ok || !data.idKichCo) throw new Error(data.message || 'Lỗi thêm kích cỡ!');
      setAddKichCoSuccess('Thêm kích cỡ thành công!');
      setTimeout(()=>setAddKichCoSuccess(''), 2000);
      setOpenAddKichCo(false);
      setTenKichCoMoi('');
      // Fetch lại kích cỡ và auto chọn
      const res2 = await fetch('http://localhost:8080/kich-co/hien-thi');
      const kichCoData = await res2.json();
      setKichCos(kichCoData);
      setAddIdKichCo(String(data.idKichCo));
      setAddMultiKichCo(prev => prev.includes(String(data.idKichCo)) ? prev : [...prev, String(data.idKichCo)]);
    } catch (err) {
      setAddKichCoError((err as Error).message || 'Lỗi thêm kích cỡ!');
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'new' | 'select' | null>(null);

  // State cho form thêm mới chi tiết sản phẩm
  const [addIdSanPham, setAddIdSanPham] = useState('');
  const [addMaSanPham, setAddMaSanPham] = useState('');
  const [addTenSanPham, setAddTenSanPham] = useState('');
  const [addMoTa, setAddMoTa] = useState('');
  const [addIdThuongHieu, setAddIdThuongHieu] = useState('');
  const [addIdMauSac, setAddIdMauSac] = useState('');
  const [addIdKichCo, setAddIdKichCo] = useState('');
  const [addGia, setAddGia] = useState('');
  const [addSoLuong, setAddSoLuong] = useState('');
  const [addPreviewImg, setAddPreviewImg] = useState('');
  const [addMultiMauSac, setAddMultiMauSac] = useState<string[]>([]);
  const [addMultiKichCo, setAddMultiKichCo] = useState<string[]>([]);
  const [addVariants, setAddVariants] = useState<any[]>([]);



  // Thêm state cho trường trạng thái nếu chưa có
  const [addTrangThai, setAddTrangThai] = useState('');
  // Thêm state lỗi cho số lượng và giá
  const [addSoLuongError, setAddSoLuongError] = useState('');
  const [addGiaError, setAddGiaError] = useState('');

  // State cho snackbar thông báo
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Thêm state cho form thêm mới:
  const [addIdHinhAnh, setAddIdHinhAnh] = useState('');

  // Hàm upload ảnh cho form thêm mới:
  const handleUploadImgAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImg(true);
    setUploadImgError('');
    try {
      const res = await fetch('http://localhost:8080/hinh-anh/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      console.log('Upload response:', data);
      if (!res.ok || !(data.fileUrl || data.fileName)) throw new Error(data.message || 'Lỗi upload ảnh!');
      // Sử dụng đúng đường dẫn trả về từ backend
      const addUrl = data.fileUrl.startsWith('http')
          ? data.fileUrl
          : `http://localhost:8080${data.fileUrl}`;
      setAddPreviewImg(addUrl);
      if (data.idHinhAnh) setAddIdHinhAnh(String(data.idHinhAnh));
    } catch (err: any) {
      setUploadImgError(err.message || 'Lỗi upload ảnh!');
    } finally {
      setUploadingImg(false);
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

  // Thêm mới sản phẩm cha
  const handleCreateNewProduct = async () => {
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
      if (!res.ok || !data.idSanPham) throw new Error(data.message || 'Lỗi thêm sản phẩm!');
      // Fetch lại danh sách sản phẩm và auto chọn
      const res2 = await fetch('http://localhost:8080/san-pham/hien-thi');
      const productsData = await res2.json();
      setProducts(productsData);
      setAddIdSanPham(String(data.idSanPham));
      setSnackbar({ open: true, message: 'Thêm sản phẩm thành công!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: (err as Error).message || 'Lỗi thêm sản phẩm!', severity: 'error' });
    }
  };

  // Reset form thêm mới sản phẩm
  const handleResetAddForm = () => {
    setAddIdSanPham('');
    setAddMaSanPham('');
    setAddTenSanPham('');
    setAddMoTa('');
    setAddIdDanhMuc('');
    setAddIdThuongHieu('');
    setAddTrangThai('');
    setAddIdMauSac('');
    setAddIdKichCo('');
    setAddGia('');
    setAddSoLuong('');
    setAddPreviewImg('');
    setAddMultiMauSac([]);
    setAddMultiKichCo([]);
    setAddVariants([]);
    setAddIdHinhAnh('');

  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Reset lại lựa chọn màu sắc, kích cỡ và danh sách biến thể
  const handleResetMauSacKichCo = () => {
    setAddMultiMauSac([]);
    setAddMultiKichCo([]);
    setAddVariants([]);
  };

  // Validate toàn bộ form thêm chi tiết sản phẩm
  const validateAddForm = () => {
    if (!addIdSanPham) return 'Vui lòng chọn sản phẩm cha hoặc tạo mới!';
    if (!addMaSanPham || addMaSanPham.length < 3 || addMaSanPham.length > 20) return 'Mã sản phẩm phải từ 3-20 ký tự!';
    if (!/^[a-zA-Z0-9-]+$/.test(addMaSanPham)) return 'Mã sản phẩm không chứa ký tự đặc biệt!';
    if (!addTenSanPham || addTenSanPham.length < 3 || addTenSanPham.length > 50) return 'Tên sản phẩm phải từ 3-50 ký tự!';
    if (!addIdDanhMuc) return 'Vui lòng chọn danh mục!';
    if (!addIdThuongHieu) return 'Vui lòng chọn thương hiệu!';
    if (!addTrangThai) return 'Vui lòng chọn trạng thái!';
    if (addMultiMauSac.length === 0) return 'Vui lòng chọn ít nhất 1 màu sắc!';
    if (addMultiKichCo.length === 0) return 'Vui lòng chọn ít nhất 1 kích cỡ!';
    if (addGia === '' || Number(addGia) <= 0) {
      if (!addGiaError) setAddGiaError('Giá phải lớn hơn 0');
      return 'Giá phải lớn hơn 0!';
    }
    if (addSoLuong === '' || Number(addSoLuong) <= 0) {
      if (!addSoLuongError) setAddSoLuongError('Số lượng phải lớn hơn 0');
      return 'Số lượng phải lớn hơn 0!';
    }
    return '';
  };

  const handleSaveEdit = async () => {
    try {
      setEditLoading(true);

      // Validate form trước khi lưu
      const validationError = validateEditForm();
      if (validationError) {
        setSnackbar({ open: true, message: validationError, severity: 'error' });
        return;
      }

      // Nếu có thay đổi mô tả, cần cập nhật sản phẩm cha trước
      if (editForm.moTa !== editDetail?.moTa) {
        const sanPhamUpdateData = {
          maSanPham: editForm.maSanPham,
          tenSanPham: editForm.tenSanPham,
          moTa: editForm.moTa,
          idDanhMuc: editForm.idDanhMuc,
          idThuongHieu: editForm.idThuongHieu,
          trangThai: editForm.trangThai
        };

        const sanPhamRes = await fetch(`http://localhost:8080/san-pham/sua/${editForm.idSanPham}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanPhamUpdateData)
        });

        if (!sanPhamRes.ok) {
          const sanPhamError = await sanPhamRes.json();
          setSnackbar({ open: true, message: sanPhamError.message || 'Lỗi khi cập nhật sản phẩm!', severity: 'error' });
          return;
        }
      }

      // Nếu số lượng = 0 thì trạng thái = 'Ngừng bán'
      let trangThaiUpdate = Number(editForm.soLuong) === 0 ? 'Ngừng bán' : editForm.trangThai;
      const chiTietUpdateData = {
        idSanPham: editForm.idSanPham,
        idMauSac: editForm.idMauSac,
        idKichCo: editForm.idKichCo,
        soLuong: editForm.soLuong,
        gia: editForm.gia,
        trangThai: trangThaiUpdate,
        idHinhAnh: editForm.idHinhAnh
      };

      const res = await fetch(`http://localhost:8080/chi-tiet-san-pham/sua/${editForm.idChiTietSanPham}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chiTietUpdateData)
      });

      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: 'Lưu thành công!', severity: 'success' });

        // Cập nhật lại toàn bộ danh sách để đảm bảo hiển thị đúng
        // Đặc biệt quan trọng khi sửa mô tả vì mô tả thuộc về sản phẩm cha
        const refreshRes = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
        const refreshData = await refreshRes.json();
        refreshData.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);

        // Lọc bỏ sản phẩm cha có tổng số lượng = 0
        const filteredData = filterOutZeroQuantityProducts(refreshData);
        setDetails(filteredData);

        setEditDetail(null);
      } else {
        setSnackbar({ open: true, message: data.message || 'Lỗi khi lưu!', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi lưu!', severity: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddAll = async () => {
    // Validate form trước khi thêm
    const validationError = validateAddForm();
    if (validationError) {
      setSnackbar({ open: true, message: validationError, severity: 'error' });
      return;
    }

    // CHẶN nếu chưa có biến thể
    if (!variants || variants.length === 0) {
      setSnackbar({ open: true, message: 'Vui lòng tạo ít nhất một biến thể!', severity: 'error' });
      return;
    }

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
          // Nếu có ảnh đại diện, thêm trường idHinhAnh
        })
      });
      const data = await res.json();
      if (!res.ok || !data.idSanPham) {
        setSnackbar({ open: true, message: data.message || 'Lỗi tạo sản phẩm!', severity: 'error' });
        return;
      }
      idSanPham = String(data.idSanPham);
    }

    // Tạo các biến thể với giá và số lượng từ form
    for (const [idx, v] of variants.entries()) {
      // ... upload ảnh biến thể nếu có ...
      let trangThaiVariant = Number(addSoLuong) === 0 ? 'Ngừng bán' : 'Đang bán';
      const res = await fetch('http://localhost:8080/chi-tiet-san-pham/them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idSanPham,
          idMauSac: v.idMauSac,
          idKichCo: v.idKichCo,
          soLuong: addSoLuong, // Sử dụng số lượng từ form
          gia: addGia, // Sử dụng giá từ form
          // idHinhAnh: ...,
          trangThai: trangThaiVariant
        })
      });
      if (!res.ok) {
        const msg = await res.text();
        setSnackbar({ open: true, message: msg, severity: 'error' });
        return;
      }
    }
    setSnackbar({ open: true, message: 'Thêm sản phẩm và biến thể thành công!', severity: 'success' });
    // Reset form
    setShowAddForm(false);
    handleResetAddForm();
    // Refresh danh sách
    const refreshRes = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
    const refreshData = await refreshRes.json();
    refreshData.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);

    // Lọc bỏ sản phẩm cha có tổng số lượng = 0
    const filteredData = filterOutZeroQuantityProducts(refreshData);
    setDetails(filteredData);
  };
  // 2. Add state for error and for controlling when to show the variant table
  const [variantTableVisible, setVariantTableVisible] = useState(false);
  const [variantError, setVariantError] = useState('');

  // 1. Thêm state lỗi cho màu sắc và kích cỡ
  const [mauSacError, setMauSacError] = useState('');
  const [kichCoError, setKichCoError] = useState('');

  // Đặt ngay trước return hoặc trước JSX Box ảnh đại diện sản phẩm cha:
  const selectedProduct = products.find(p => String(p.idSanPham) === String(addIdSanPham));
  let imgUrl = '';
  if (addPreviewImg) {
    imgUrl = addPreviewImg;
  } else if (selectedProduct?.duongDanHinhAnh) {
    if (selectedProduct.duongDanHinhAnh.startsWith('http')) {
      imgUrl = selectedProduct.duongDanHinhAnh;
    } else {
      imgUrl = `http://localhost:8080/${selectedProduct.duongDanHinhAnh.replace(/^\/+/, '')}`;
    }
  }
  console.log('selectedProduct:', selectedProduct);
  console.log('imgUrl:', imgUrl);

  const router = useRouter();

  // Thêm hàm tiện ích lấy file ảnh theo màu sắc
  const getImageForColor = (colorId: string, variantsList: any[] = variants) => {
    const found = variantsList.find(v => v.idMauSac === colorId && v.hinhAnh);
    return found ? found.hinhAnh : null;
  };

  // Thêm hàm tiện ích lấy previewImg và file theo màu sắc
  const getPreviewImgForColor = (colorId: string) => {
    const found = variants.find(v => v.idMauSac === colorId && v.previewImg);
    return found ? found.previewImg : '';
  };
  const getFileForColor = (colorId: string) => {
    const found = variants.find(v => v.idMauSac === colorId && v.hinhAnh);
    return found ? found.hinhAnh : null;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Thêm state cho lỗi từng dòng biến thể
  const [variantErrors, setVariantErrors] = useState<{ soLuong?: string; gia?: string }[]>([]);

  const validateAllVariants = () => {
    // Chỉ cần kiểm tra có biến thể nào được tạo không
    return variants.length > 0;
  };

  // Group các biến thể thành danh sách sản phẩm cha duy nhất
  const groupedProducts = React.useMemo(() => {
    const map = new Map();
    filteredDetails.forEach(detail => {
      if (!map.has(detail.maSanPham)) {
        map.set(detail.maSanPham, {
          maSanPham: detail.maSanPham,
          tenSanPham: detail.tenSanPham,
          tenThuongHieu: detail.tenThuongHieu,
          tenDanhMuc: detail.tenDanhMuc,
          moTa: detail.moTa,
          tongSoLuong: 0,
          trangThai: detail.trangThai,
          idSanPham: detail.idSanPham,
          hasDangBan: false
        });
      }
      const group = map.get(detail.maSanPham);
      group.tongSoLuong += Number(detail.soLuong) || 0;
      if (detail.trangThai === 'Đang bán') group.hasDangBan = true;
    });
    // Sau khi group xong, set trạng thái đúng
    const result = Array.from(map.values()).map(g => {
      if (g.tongSoLuong === 0) {
        g.trangThai = 'Ngừng bán';
      } else if (g.hasDangBan) {
        g.trangThai = 'Đang bán';
      }
      delete g.hasDangBan;
      return g;
    });
    return result;
  }, [filteredDetails]);

  // Phân trang trên danh sách sản phẩm cha đã group
  const pagedProducts = groupedProducts.slice(page * pageSize, (page + 1) * pageSize);

  // Render bảng dùng pagedProducts
  <tbody>
  {pagedProducts.map((prod, idx) => (
      <tr key={(prod.idSanPham ?? prod.maSanPham) + '-' + idx} style={{ color: '#222' }}>
        <td style={{padding:'6px 8px', textAlign:'center'}}>{page * pageSize + idx + 1}</td>
        <td style={{padding:'6px 8px'}}>{prod.maSanPham}</td>
        <td style={{padding:'6px 8px'}}>{prod.tenSanPham}</td>
        <td style={{padding:'6px 8px'}}>{prod.tenThuongHieu}</td>
        <td style={{padding:'6px 8px'}}>{prod.tenDanhMuc}</td>
        <td style={{padding:'6px 8px', textAlign:'center'}}>{prod.tongSoLuong}</td>
        <td style={{padding:'6px 8px', textAlign:'center'}}>
          {prod.trangThai === 'Đang bán' && (
              <span style={{
                background: '#d4f5e9',
                color: '#178a5c',
                fontWeight: 700,
                borderRadius: 16,
                padding: '2px 16px',
                fontSize: 15,
                display: 'inline-block',
                boxShadow: '0 1px 2px #0001',
                border: '1px solid #b2e5d3'
              }}>
              Đang bán
            </span>
          )}
          {prod.trangThai === 'Ngừng bán' && (
              <span style={{
                background: '#ffeaea',
                color: '#d43c2e',
                fontWeight: 700,
                borderRadius: 16,
                padding: '2px 16px',
                fontSize: 15,
                display: 'inline-block',
                boxShadow: '0 1px 2px #0001',
                border: '1px solid #f5bdbd'
              }}>
              Ngừng bán
            </span>
          )}
          {prod.trangThai === 'Hết hàng' && (
              <span style={{
                background: '#f2f2f2',
                color: '#888',
                fontWeight: 700,
                borderRadius: 16,
                padding: '2px 16px',
                fontSize: 15,
                display: 'inline-block',
                boxShadow: '0 1px 2px #0001',
                border: '1px solid #e0e0e0'
              }}>
              Hết hàng
            </span>
          )}
        </td>
        <td style={{padding:'6px 8px', textAlign:'center'}}>
          <button
              style={{
                background: prod.trangThai === 'Đang bán' ? '#2ecc40' : '#e67e22',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: 6,
                cursor: prod.tongSoLuong === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 4,
                opacity: prod.tongSoLuong === 0 ? 0.5 : 1
              }}
              title={prod.trangThai === 'Đang bán' ? 'Ngừng bán' : 'Đang bán'}
              disabled={prod.tongSoLuong === 0}
              onClick={() => handleToggleProductStatus(prod.maSanPham, prod.trangThai)}
          >
            <FaPowerOff style={{ fontSize: 18 }} />
          </button>
          <button
              style={{
                background: "#3498db",
                color: "black",
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Xem chi tiết"
              onClick={async () => {
                // Fetch lại dữ liệu mới nhất từ backend
                const res = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
                const data: ProductDetail[] = await res.json();
                data.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);
                const filtered = data.filter((d: ProductDetail) => d.maSanPham === prod.maSanPham);
                if (filtered.length > 0) {
                  setDetailData({
                    maSanPham: filtered[0].maSanPham,
                    tenSanPham: filtered[0].tenSanPham,
                    tenThuongHieu: filtered[0].tenThuongHieu,
                    tenDanhMuc: filtered[0].tenDanhMuc,
                    moTa: filtered[0].moTa,
                    tongSoLuong: filtered.reduce((sum: number, v: ProductDetail) => sum + (v.soLuong || 0), 0),
                    trangThai: filtered[0].trangThai,
                    bienThe: filtered,
                  });
                  setOpenDetail(true);
                }
              }}
          >
            <FaEye style={{ fontSize: 15 }} />
          </button>
        </td>
      </tr>
  ))}
  </tbody>

  // State cho modal sửa biến thể
  const [editVariant, setEditVariant] = useState<ProductDetail | null>(null);
  const [openEditVariantModal, setOpenEditVariantModal] = useState(false);
  const [editVariantForm, setEditVariantForm] = useState<any>(null);
  const [editVariantPreviewImg, setEditVariantPreviewImg] = useState<string>('');

  // Thêm state cho lỗi số lượng và giá khi sửa biến thể
  const [editVariantSoLuongError, setEditVariantSoLuongError] = useState('');
  const [editVariantGiaError, setEditVariantGiaError] = useState('');

  // State cho quản lý ảnh trong modal sửa biến thể
  const [editVariantImages, setEditVariantImages] = useState<ChiTietSanPhamHinhAnh[]>([]);
  const [editVariantOriginalImages, setEditVariantOriginalImages] = useState<ChiTietSanPhamHinhAnh[]>([]);
  const [editVariantImageLoading, setEditVariantImageLoading] = useState(false);
  const [editVariantImageError, setEditVariantImageError] = useState('');
  const [editVariantImageSuccess, setEditVariantImageSuccess] = useState('');
  const [editVariantHasImageChanges, setEditVariantHasImageChanges] = useState(false);

  // State cho modal confirm thay đổi trạng thái
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<{maSanPham: string, currentStatus: string} | null>(null);

  // Hàm upload ảnh cho modal sửa biến thể
  const handleEditVariantUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editVariantForm) return;

    setEditVariantImageLoading(true);
    setEditVariantImageError("");

    try {
      let uploadedCount = 0;
      let newImages: ChiTietSanPhamHinhAnh[] = [];

      // Upload từng file một
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Kiểm tra giới hạn số lượng ảnh
        if (editVariantImages.length + uploadedCount >= 10) {
          setEditVariantImageError(`Chỉ có thể upload tối đa 10 ảnh. Đã upload ${uploadedCount} ảnh thành công.`);
          break;
        }

        // Upload file lên server
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('http://localhost:8080/hinh-anh/upload', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Lỗi upload ảnh');
        }

        // Tạo object ảnh mới (chưa lưu vào database)
        const newImage: ChiTietSanPhamHinhAnh = {
          idChiTietSanPhamHinhAnh: -(uploadedCount + 1), // ID tạm thời âm
          idChiTietSanPham: editVariantForm.idChiTietSanPham,
          idHinhAnh: uploadData.idHinhAnh,
          tenHinhAnh: file.name,
          urlHinhAnh: uploadData.fileName || uploadData.fileUrl,
          thuTu: editVariantImages.length + uploadedCount + 1,
          laAnhChinh: editVariantImages.length + uploadedCount === 0 // Ảnh đầu tiên sẽ là ảnh chính
        };

        newImages.push(newImage);
        uploadedCount++;
      }

      // Cập nhật state local
      const updatedImages = [...editVariantImages, ...newImages];
      setEditVariantImages(updatedImages);
      setEditVariantHasImageChanges(true);
      console.log('Edit variant upload completed - hasImageChanges set to true, new images:', newImages);

      if (uploadedCount > 0) {
        setEditVariantImageSuccess(`Upload thành công ${uploadedCount} ảnh!`);
        setTimeout(() => setEditVariantImageSuccess(""), 3000);
      }

    } catch (error) {
      setEditVariantImageError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setEditVariantImageLoading(false);
    }
  };

  // Hàm xóa ảnh cho modal sửa biến thể
  const handleEditVariantDeleteImage = async (imageId: number) => {
    if (!editVariantForm) return;

    try {
      const response = await fetch(`http://localhost:8080/chi-tiet-san-pham-hinh-anh/xoa/${imageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xóa hình ảnh');
      }

      // Cập nhật danh sách hình ảnh
      const refreshResponse = await fetch(`http://localhost:8080/chi-tiet-san-pham-hinh-anh/${editVariantForm.idChiTietSanPham}`);
      const refreshData = await refreshResponse.json();
      if (refreshData.success) {
        const updatedImages = refreshData.data || [];
        setEditVariantImages(updatedImages);
        setEditVariantHasImageChanges(true);
      }

      setEditVariantImageSuccess('Xóa hình ảnh thành công!');
      setTimeout(() => setEditVariantImageSuccess(""), 3000);

    } catch (error) {
      setEditVariantImageError('Lỗi khi xóa hình ảnh');
    }
  };

  // Hàm đặt ảnh chính cho modal sửa biến thể
  const handleEditVariantSetMainImage = async (imageId: number) => {
    if (!editVariantForm) return;

    try {
      const updatedImages = editVariantImages.map((img: ChiTietSanPhamHinhAnh) => ({
        ...img,
        laAnhChinh: img.idChiTietSanPhamHinhAnh === imageId
      }));

      // Chỉ cập nhật state local, không gửi lên server ngay
      setEditVariantImages(updatedImages);
      setEditVariantHasImageChanges(true);
      setEditVariantImageSuccess('Đã đặt ảnh chính!');
      setTimeout(() => setEditVariantImageSuccess(""), 3000);

    } catch (error) {
      setEditVariantImageError('Lỗi khi đặt ảnh chính');
    }
  };

  // Hàm mở modal sửa biến thể
  const handleEditVariant = async (variant: ProductDetail) => {
    console.log('Opening edit variant with data:', variant);
    setEditVariant(variant);
    setEditVariantForm({
      ...variant,
      gia: Number(variant.gia) || 0, // Đảm bảo giá không bị null và là number
      soLuong: Number(variant.soLuong) || 0, // Đảm bảo số lượng không bị null và là number
      trangThai: variant.trangThai, // Giữ nguyên trạng thái hiện tại

    });
    setEditVariantPreviewImg(variant.duongDanHinhAnh ? `http://localhost:8080/images/${variant.duongDanHinhAnh.replace(/^.*[\\/]/, '')}` : '');

    // Load danh sách ảnh của biến thể
    try {
      console.log('Loading images for variant:', variant.idChiTietSanPham);
      console.log('Variant full data:', variant);

      // Test endpoint trực tiếp
      const response = await fetch(`http://localhost:8080/chi-tiet-san-pham-hinh-anh/${variant.idChiTietSanPham}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        setEditVariantImages([]);
        setEditVariantOriginalImages([]);
        setEditVariantHasImageChanges(false);
        return;
      }

      const data = await response.json();
      console.log('Response from image API:', data);

      if (data.success && data.data) {
        const images = data.data || [];
        console.log('Found images:', images);
        console.log('Images structure:', images.map((img: any) => ({
          id: img.idChiTietSanPhamHinhAnh,
          url: img.urlHinhAnh,
          ten: img.tenHinhAnh,
          laAnhChinh: img.laAnhChinh
        })));
        setEditVariantImages(images);
        setEditVariantOriginalImages([...images]);
        setEditVariantHasImageChanges(false);
      } else {
        console.log('No images found or API error:', data.message);
        console.log('Full API response:', data);
        setEditVariantImages([]);
        setEditVariantOriginalImages([]);
        setEditVariantHasImageChanges(false);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hình ảnh:', error);
      setEditVariantImages([]);
      setEditVariantOriginalImages([]);
      setEditVariantHasImageChanges(false);
    }

    setOpenEditVariantModal(true);
  };
  // Hàm lưu biến thể (cho phép sửa số lượng và hình ảnh)
  const handleSaveEditVariant = async () => {
    if (!editVariantForm) return;
    // Validate số lượng
    let hasError = false;
    const soLuong = Number(editVariantForm.soLuong);
    if (editVariantForm.soLuong === '' || isNaN(soLuong) || soLuong < 0) {
      setEditVariantSoLuongError('Số lượng phải là số >= 0');
      hasError = true;
    } else {
      setEditVariantSoLuongError('');
    }
    if (hasError) return;

    // Tự động cập nhật trạng thái dựa trên số lượng
    const newTrangThai = soLuong === 0 ? 'Ngừng bán' : 'Đang bán';

    try {
      // Gửi đầy đủ thông tin cần thiết lên server
      const payload = {
        soLuong: soLuong,
        trangThai: newTrangThai,
        idSanPham: editVariantForm.idSanPham,
        idMauSac: editVariantForm.idMauSac,
        idKichCo: editVariantForm.idKichCo,
        gia: Number(editVariantForm.gia) || 0,
        // Thêm idHinhAnh nếu có ảnh mới
        ...(editVariantForm.idHinhAnh && { idHinhAnh: editVariantForm.idHinhAnh })
      };

      console.log('Sending payload to server:', payload);

      const response = await fetch(`http://localhost:8080/chi-tiet-san-pham/sua/${editVariantForm.idChiTietSanPham}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setEditVariantSoLuongError('Lỗi khi lưu biến thể!');
        return;
      }



      // Lưu thay đổi ảnh nếu có
      if (editVariantHasImageChanges) {
        // Tách ảnh mới và ảnh cũ
        const newImages = editVariantImages.filter(img => img.idChiTietSanPhamHinhAnh < 0);
        const existingImages = editVariantImages.filter(img => img.idChiTietSanPhamHinhAnh > 0);

        // Thêm ảnh mới vào database
        for (const newImage of newImages) {
          const imageData = {
            idChiTietSanPham: newImage.idChiTietSanPham,
            idHinhAnh: newImage.idHinhAnh,
            thuTu: newImage.thuTu,
            laAnhChinh: newImage.laAnhChinh
          };

          const addResponse = await fetch('http://localhost:8080/chi-tiet-san-pham-hinh-anh/them', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imageData)
          });

          if (!addResponse.ok) {
            throw new Error('Lỗi khi thêm ảnh mới');
          }
        }

        // Cập nhật thứ tự và ảnh chính cho ảnh cũ
        if (existingImages.length > 0) {
          const updateResponse = await fetch('http://localhost:8080/chi-tiet-san-pham-hinh-anh/cap-nhat-thu-tu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(existingImages)
          });

          if (!updateResponse.ok) {
            throw new Error('Lỗi khi cập nhật ảnh cũ');
          }
        }
      }

      // Cập nhật giao diện - Refresh toàn bộ dữ liệu để đảm bảo đồng bộ
      try {
        const refreshRes = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
        const refreshData = await refreshRes.json();
        refreshData.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);

        // Lọc bỏ sản phẩm cha có tổng số lượng = 0
        const filteredData = filterOutZeroQuantityProducts(refreshData);
        setDetails(filteredData);

        // Cập nhật lại detailData nếu đang xem chi tiết sản phẩm
        if (detailData) {
          const prod = refreshData.filter((d: ProductDetail) => d.maSanPham === detailData.maSanPham);
          setDetailData({ ...detailData, bienThe: prod });
        }

        // Refresh danh sách ảnh trong modal nếu có thay đổi ảnh
        if (editVariantHasImageChanges && editVariantForm) {
          try {
            const imagesRes = await fetch(`http://localhost:8080/chi-tiet-san-pham-hinh-anh/${editVariantForm.idChiTietSanPham}`);
            if (imagesRes.ok) {
              const imagesData = await imagesRes.json();
              if (imagesData.success && imagesData.data) {
                setEditVariantImages(imagesData.data);
                // Cập nhật lại ảnh preview nếu có ảnh chính
                const anhChinh = imagesData.data.find((img: any) => img.laAnhChinh);
                if (anhChinh) {
                  setEditVariantPreviewImg(`http://localhost:8080/hinh-anh/view/${anhChinh.urlHinhAnh}`);
                }
              }
            }
          } catch (error) {
            console.error('Lỗi khi refresh danh sách ảnh:', error);
          }
        }
      } catch (error) {
        console.error('Lỗi khi refresh dữ liệu:', error);
      }

      const successMessage = editVariantForm.idHinhAnh || editVariantHasImageChanges
          ? 'Cập nhật số lượng và hình ảnh thành công!'
          : 'Cập nhật số lượng thành công!';

      setSnackbar({ open: true, message: successMessage, severity: 'success' });

      // Đóng modal và reset state
      setOpenEditVariantModal(false);
      setEditVariant(null);
      setEditVariantPreviewImg('');
      setEditVariantHasImageChanges(false);
      setEditVariantImages([]);
      setEditVariantOriginalImages([]);
    } catch (err) {
      setEditVariantSoLuongError('Lỗi khi lưu biến thể!');
    }
  };
  // Sửa handleEditVariantImg để upload ảnh và lấy idHinhAnh
  const handleEditVariantImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEditVariantPreviewImg(preview);
    // Upload ảnh lên backend
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8080/hinh-anh/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.idHinhAnh) {
        setEditVariantForm((f:any) => ({
          ...f,
          idHinhAnh: data.idHinhAnh,
          newImageFile: file
        }));
      } else {
        alert('Lỗi upload ảnh!');
      }
    } catch (err) {
      alert('Lỗi upload ảnh!');
    }
  };

  // Hàm mở modal confirm thay đổi trạng thái
  const handleOpenConfirmModal = (maSanPham: string, currentStatus: string) => {
    setConfirmData({ maSanPham, currentStatus });
    setOpenConfirmModal(true);
  };

  // Thêm hàm đổi trạng thái cho toàn bộ biến thể của sản phẩm cha
  const handleToggleProductStatus = async (maSanPham: string, currentStatus: string) => {
    try {
      // Lấy danh sách biến thể của sản phẩm cha này
      const res = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
      const allDetails = await res.json();
      const variants = allDetails.filter((d: ProductDetail) => d.maSanPham === maSanPham);
      // Xác định trạng thái mới
      const newStatus = currentStatus === 'Đang bán' ? 'Ngừng bán' : 'Đang bán';
      // Đổi trạng thái từng biến thể (chỉ đổi nếu số lượng > 0)
      for (const v of variants) {
        if (Number(v.soLuong) > 0) {
          await fetch(`http://localhost:8080/chi-tiet-san-pham/doi-trang-thai/${v.idChiTietSanPham}`, {
            method: 'PUT'
          });
        }
      }
      // Sau khi đổi, fetch lại danh sách và lọc bỏ sản phẩm hết hàng
      const refreshRes = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
      const refreshData = await refreshRes.json();
      refreshData.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);

      // Lọc bỏ sản phẩm cha có tổng số lượng = 0
      const filteredData = filterOutZeroQuantityProducts(refreshData);
      setDetails(filteredData);

      setSnackbar({ open: true, message: 'Đổi trạng thái sản phẩm thành công!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi đổi trạng thái sản phẩm!', severity: 'error' });
    } finally {
      setOpenConfirmModal(false);
      setConfirmData(null);
    }
  };

  const actionButtonStyle = {
    width: 32,
    height: 32,
    borderRadius: 8,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    fontWeight: 600,
    fontSize: 15,
    marginRight: 4
  };

  return (
      <>
        <style jsx>{`
          .product-row:hover {
            background: rgba(181, 157, 58, 0.05) !important;
          }
          .status-active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-weight: 600;
            border-radius: 20px;
            padding: 6px 16px;
            font-size: 12px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-inactive {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            font-weight: 600;
            border-radius: 20px;
            padding: 6px 16px;
            font-size: 12px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        `}</style>

        {/* Main Content Container */}
        <div style={{
          background: 'transparent',
          minHeight: '100%',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}>
          {/* Search and Filter Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 231, 180, 0.9) 100%)',
            borderRadius: 16,
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(181, 157, 58, 0.1)',
            border: '1px solid rgba(181, 157, 58, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                flex: 1,
                minWidth: 0
              }}>
                {/* Search Input */}
                <div style={{
                  position: 'relative',
                  minWidth: '280px',
                  flex: 1
                }}>
                  <FaSearch style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8a7a2a',
                    fontSize: '16px',
                    zIndex: 1
                  }} />
                  <TextField
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      size="small"
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          background: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                          '& fieldset': {
                            border: '1px solid rgba(181, 157, 58, 0.2)',
                            borderRadius: '12px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#b59d3a'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#b59d3a',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputBase-input': {
                          paddingLeft: '40px',
                          fontSize: '14px'
                        }
                      }}
                  />
                </div>

                {/* Filter Dropdowns */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <FormControl size="small" sx={{
                    minWidth: '160px',
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                      '& fieldset': {
                        border: '1px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: '10px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#b59d3a'
                      }
                    }
                  }}>
                    <Select
                        value={filterBrand}
                        onChange={e => setFilterBrand(e.target.value)}
                        displayEmpty
                        sx={{
                          fontSize: '14px',
                          '& .MuiSelect-select': {
                            padding: '8px 12px'
                          }
                        }}
                    >
                      <MenuItem value="" sx={{ fontSize: '14px' }}>
                        <FaFilter style={{ marginRight: '8px', fontSize: '12px' }} />
                        Thương hiệu
                      </MenuItem>
                      {thuongHieus.map(th => (
                          <MenuItem key={th.idThuongHieu} value={th.tenThuongHieu} sx={{ fontSize: '14px' }}>
                            {th.tenThuongHieu}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{
                    minWidth: '140px',
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                      '& fieldset': {
                        border: '1px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: '10px'
                      }
                    }
                  }}>
                    <Select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        displayEmpty
                        sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value="" sx={{ fontSize: '14px' }}>
                        <FaFilter style={{ marginRight: '8px', fontSize: '12px' }} />
                        Danh mục
                      </MenuItem>
                      {danhMucs.map(dm => (
                          <MenuItem key={dm.idDanhMuc} value={dm.tenDanhMuc} sx={{ fontSize: '14px' }}>
                            {dm.tenDanhMuc}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{
                    minWidth: '120px',
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                      '& fieldset': {
                        border: '1px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: '10px'
                      }
                    }
                  }}>
                    <Select
                        value={filterColor}
                        onChange={e => setFilterColor(e.target.value)}
                        displayEmpty
                        sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value="" sx={{ fontSize: '14px' }}>
                        <FaFilter style={{ marginRight: '8px', fontSize: '12px' }} />
                        Màu sắc
                      </MenuItem>
                      {mauSacs.map(ms => (
                          <MenuItem key={ms.idMauSac} value={ms.mauSac} sx={{ fontSize: '14px' }}>
                            {ms.mauSac}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{
                    minWidth: '120px',
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                      '& fieldset': {
                        border: '1px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: '10px'
                      }
                    }
                  }}>
                    <Select
                        value={filterSize}
                        onChange={e => setFilterSize(e.target.value)}
                        displayEmpty
                        sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value="" sx={{ fontSize: '14px' }}>
                        <FaFilter style={{ marginRight: '8px', fontSize: '12px' }} />
                        Kích cỡ
                      </MenuItem>
                      {kichCos.map(kc => (
                          <MenuItem key={kc.idKichCo} value={kc.kichCo} sx={{ fontSize: '14px' }}>
                            {kc.kichCo}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{
                    minWidth: '120px',
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                      '& fieldset': {
                        border: '1px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: '10px'
                      }
                    }
                  }}>
                    <Select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        displayEmpty
                        sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value="" sx={{ fontSize: '14px' }}>
                        <FaFilter style={{ marginRight: '8px', fontSize: '12px' }} />
                        Trạng thái
                      </MenuItem>
                      <MenuItem value="Đang bán" sx={{ fontSize: '14px' }}>Đang bán</MenuItem>
                      <MenuItem value="Ngừng bán" sx={{ fontSize: '14px' }}>Ngừng bán</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Clear Filters Button */}
                  {(searchTerm || filterBrand || filterCategory || filterColor || filterSize || filterStatus) && (
                      <Button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterBrand('');
                            setFilterCategory('');
                            setFilterColor('');
                            setFilterSize('');
                            setFilterStatus('');
                            setPage(0);
                          }}
                          variant="outlined"
                          sx={{
                            borderRadius: '10px',
                            borderColor: 'rgba(181, 157, 58, 0.3)',
                            color: '#8a7a2a',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '8px 16px',
                            '&:hover': {
                              borderColor: '#b59d3a',
                              color: '#b59d3a',
                              background: 'rgba(181, 157, 58, 0.05)'
                            }
                          }}
                          startIcon={<FaTimesCircle />}
                      >
                        Xóa lọc
                      </Button>
                  )}
                </div>
              </div>

              {/* Add Product Button */}
              <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '15px',
                    borderRadius: '12px',
                    height: '44px',
                    minWidth: '200px',
                    padding: '0 24px',
                    boxShadow: '0 4px 15px rgba(181, 157, 58, 0.3)',
                    textTransform: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(181, 157, 58, 0.4)'
                    }
                  }}
                  onClick={() => {
                    window.location.href = '/ChiTietSanPham/ThemChiTietSanPham';
                  }}
              >
                <FaPlus style={{ fontSize: '16px' }} />
                Thêm sản phẩm mới
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(181, 157, 58, 0.1)',
            overflow: 'hidden',
            border: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(181, 157, 58, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#6b4f1d'
                }}>
                  Danh sách sản phẩm ({groupedProducts.length})
                </h3>
                {pageLoading && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#8a7a2a',
                      fontSize: '14px'
                    }}>
                      <CircularProgress size={16} />
                      Đang tải...
                    </div>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                lineHeight: 1.5
              }}>
                <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.6) 0%, rgba(249, 231, 180, 0.6) 100%)'
                }}>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>STT</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Mã sản phẩm</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Tên sản phẩm</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Thương hiệu</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Danh mục</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Tổng số lượng</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Trạng thái</th>
                  <th style={{
                    padding: '16px 12px',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#6b4f1d',
                    borderBottom: '2px solid rgba(181, 157, 58, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {pagedProducts.map((prod, idx) => (
                    <tr
                        key={(prod.idSanPham ?? prod.maSanPham) + '-' + idx}
                        className="product-row"
                        style={{
                          color: '#6b4f1d',
                          transition: 'all 0.2s ease'
                        }}
                    >
                      <td style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#8a7a2a'
                      }}>{page * pageSize + idx + 1}</td>
                      <td style={{
                        padding: '16px 12px',
                        fontWeight: 600,
                        color: '#6b4f1d'
                      }}>{prod.maSanPham}</td>
                      <td style={{
                        padding: '16px 12px',
                        fontWeight: 500,
                        color: '#6b4f1d'
                      }}>{prod.tenSanPham}</td>
                      <td style={{
                        padding: '16px 12px',
                        color: '#8a7a2a'
                      }}>{prod.tenThuongHieu}</td>
                      <td style={{
                        padding: '16px 12px',
                        color: '#8a7a2a'
                      }}>{prod.tenDanhMuc}</td>
                      <td style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: prod.tongSoLuong > 0 ? '#059669' : '#dc2626'
                      }}>
                        {prod.tongSoLuong && prod.tongSoLuong >= 0 ? prod.tongSoLuong : 0}
                      </td>
                      <td style={{
                        padding: '16px 12px',
                        textAlign: 'center'
                      }}>
                        {prod.trangThai === 'Đang bán' && (
                            <span className="status-active">
                          Đang bán
                        </span>
                        )}
                        {prod.trangThai === 'Ngừng bán' && (
                            <span className="status-inactive">
                          Ngừng bán
                        </span>
                        )}
                      </td>
                      <td style={{
                        padding: '16px 12px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          {/* View Details Button */}
                          <button
                              style={{
                                background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(181, 157, 58, 0.3)',
                                transition: 'all 0.2s ease',
                                width: '36px',
                                height: '36px'
                              }}
                              title="Xem chi tiết"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.3)';
                              }}
                              onClick={async () => {
                                const res = await fetch('http://localhost:8080/chi-tiet-san-pham/hien-thi');
                                const data: ProductDetail[] = await res.json();
                                data.sort((a: ProductDetail, b: ProductDetail) => b.idChiTietSanPham - a.idChiTietSanPham);
                                const filtered = data.filter((d: ProductDetail) => d.maSanPham === prod.maSanPham);
                                if (filtered.length > 0) {
                                  setDetailData({
                                    maSanPham: filtered[0].maSanPham,
                                    tenSanPham: filtered[0].tenSanPham,
                                    tenThuongHieu: filtered[0].tenThuongHieu,
                                    tenDanhMuc: filtered[0].tenDanhMuc,
                                    moTa: filtered[0].moTa,
                                    tongSoLuong: filtered.reduce((sum: number, v: ProductDetail) => sum + (Number(v.soLuong) || 0), 0),
                                    trangThai: filtered[0].trangThai,
                                    bienThe: filtered,
                                  });
                                  setOpenDetail(true);
                                }
                              }}
                          >
                            <FaEye style={{ fontSize: '14px' }} />
                          </button>

                          {/* Toggle Status Button */}
                          <button
                              style={{
                                background: prod.trangThai === 'Đang bán'
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: prod.tongSoLuong === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: prod.trangThai === 'Đang bán'
                                    ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                                    : '0 2px 8px rgba(245, 158, 11, 0.3)',
                                transition: 'all 0.2s ease',
                                opacity: prod.tongSoLuong === 0 ? 0.5 : 1,
                                width: '36px',
                                height: '36px'
                              }}
                              title={prod.trangThai === 'Đang bán' ? 'Ngừng bán' : 'Đang bán'}
                              disabled={prod.tongSoLuong === 0}
                              onMouseEnter={(e) => {
                                if (prod.tongSoLuong > 0) {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = prod.trangThai === 'Đang bán'
                                      ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                                      : '0 4px 12px rgba(245, 158, 11, 0.4)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = prod.trangThai === 'Đang bán'
                                    ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                                    : '0 2px 8px rgba(245, 158, 11, 0.3)';
                              }}
                              onClick={() => handleOpenConfirmModal(prod.maSanPham, prod.trangThai)}
                          >
                            <FaPowerOff style={{ fontSize: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {pagedProducts.length === 0 && !pageLoading && (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#8a7a2a'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    opacity: 0.5
                  }}>📦</div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#6b4f1d'
                  }}>
                    Không tìm thấy sản phẩm
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#8a7a2a'
                  }}>
                    Thử thay đổi bộ lọc hoặc tìm kiếm để xem kết quả khác
                  </p>
                </div>
            )}
          </div>

          {/* Pagination */}
          {groupedProducts.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '32px',
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                border: '1px solid rgba(181, 157, 58, 0.1)'
              }}>
                <Button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    variant="outlined"
                    sx={{
                      borderRadius: '8px',
                      borderColor: 'rgba(181, 157, 58, 0.3)',
                      color: '#8a7a2a',
                      fontWeight: 600,
                      minWidth: '80px',
                      '&:hover': {
                        borderColor: '#b59d3a',
                        color: '#b59d3a',
                        background: 'rgba(181, 157, 58, 0.05)'
                      },
                      '&:disabled': {
                        borderColor: 'rgba(181, 157, 58, 0.1)',
                        color: 'rgba(181, 157, 58, 0.3)'
                      }
                    }}
                >
                  Trước
                </Button>

                {Array.from({ length: Math.max(1, Math.ceil(groupedProducts.length / pageSize)) }, (_, i) => (
                    <Button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        disabled={i === page}
                        variant={i === page ? 'contained' : 'outlined'}
                        sx={{
                          borderRadius: '8px',
                          minWidth: '40px',
                          fontWeight: 700,
                          fontSize: '14px',
                          ...(i === page ? {
                            background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(181, 157, 58, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)'
                            }
                          } : {
                            borderColor: 'rgba(181, 157, 58, 0.3)',
                            color: '#8a7a2a',
                            '&:hover': {
                              borderColor: '#b59d3a',
                              color: '#b59d3a',
                              background: 'rgba(181, 157, 58, 0.05)'
                            }
                          })
                        }}
                    >
                      {i + 1}
                    </Button>
                ))}

                <Button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === Math.max(1, Math.ceil(groupedProducts.length / pageSize)) - 1}
                    variant="outlined"
                    sx={{
                      borderRadius: '8px',
                      borderColor: 'rgba(181, 157, 58, 0.3)',
                      color: '#8a7a2a',
                      fontWeight: 600,
                      minWidth: '80px',
                      '&:hover': {
                        borderColor: '#b59d3a',
                        color: '#b59d3a',
                        background: 'rgba(181, 157, 58, 0.05)'
                      },
                      '&:disabled': {
                        borderColor: 'rgba(181, 157, 58, 0.1)',
                        color: 'rgba(181, 157, 58, 0.3)'
                      }
                    }}
                >
                  Sau
                </Button>
              </div>
          )}
        </div>

        {/* Modal chi tiết biến thể */}
        <Dialog
            open={openDetail}
            onClose={() => setOpenDetail(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: 24,
                minWidth: 1000,
                maxWidth: 1400,
                background: 'white',
                boxShadow: '0 20px 60px rgba(181, 157, 58, 0.25)',
                overflow: 'hidden'
              }
            }}
        >
          <DialogTitle sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.8rem',
            color: 'white',
            background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
            py: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}>
            ✨ Danh sách biến thể của sản phẩm
          </DialogTitle>
          <DialogContent sx={{
            p: 4,
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.3) 0%, rgba(249, 231, 180, 0.3) 100%)'
          }}>
            {detailData && (
                <Box sx={{
                  background: 'white',
                  borderRadius: 16,
                  p: 4,
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(181, 157, 58, 0.1)',
                  border: '1px solid rgba(181, 157, 58, 0.1)'
                }}>
                  {/* Header thông tin sản phẩm */}
                  <Box sx={{
                    mb: 3,
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
                    borderRadius: 12,
                    border: '1px solid rgba(181, 157, 58, 0.2)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h5" sx={{
                      color: '#6b4f1d',
                      fontWeight: 700,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      📦 {detailData.tenSanPham}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#8a7a2a', fontWeight: 500, mb: 2 }}>
                      Mã: {detailData.maSanPham} • Thương hiệu: {detailData.tenThuongHieu} • Danh mục: {detailData.tenDanhMuc}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b4f1d', fontStyle: 'italic' }}>
                      {detailData.moTa}
                    </Typography>
                  </Box>

                  {/* Thống kê tổng quan */}
                  <Box sx={{
                    display: 'flex',
                    gap: 3,
                    mb: 3,
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      borderRadius: 12,
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      textAlign: 'center',
                      minWidth: 120
                    }}>
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                        {detailData.tongSoLuong}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b4f1d', fontWeight: 600 }}>
                        Tổng số lượng
                      </Typography>
                    </Box>
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(181, 157, 58, 0.1) 0%, rgba(138, 122, 42, 0.1) 100%)',
                      borderRadius: 12,
                      border: '1px solid rgba(181, 157, 58, 0.2)',
                      textAlign: 'center',
                      minWidth: 120
                    }}>
                      <Typography variant="h6" sx={{ color: '#b59d3a', fontWeight: 700 }}>
                        {Array.isArray(detailData?.bienThe) ? detailData.bienThe.length : 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b4f1d', fontWeight: 600 }}>
                        Biến thể
                      </Typography>
                    </Box>
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      borderRadius: 12,
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      textAlign: 'center',
                      minWidth: 120
                    }}>
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                        {detailData.trangThai}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b4f1d', fontWeight: 600 }}>
                        Trạng thái
                      </Typography>
                    </Box>
                  </Box>
                </Box>
            )}

            {/* Bảng biến thể */}
            {detailData && (
                <Box sx={{
                  background: 'white',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(181, 157, 58, 0.1)',
                  border: '1px solid rgba(181, 157, 58, 0.1)'
                }}>
                  <Box sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
                    borderBottom: '1px solid rgba(181, 157, 58, 0.2)'
                  }}>
                    <Typography variant="h6" sx={{
                      color: '#6b4f1d',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      🎨 Chi tiết các biến thể
                    </Typography>
                  </Box>

                  <Box sx={{ overflow: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      background: 'white',
                      fontSize: 15,
                      lineHeight: 1.4
                    }}>
                      <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.9) 0%, rgba(249, 231, 180, 0.9) 100%)'
                      }}>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>STT</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "left",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Màu sắc</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "left",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Kích cỡ</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Số lượng</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Trạng thái</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Giá</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Ảnh</th>
                        <th style={{
                          padding: '16px 12px',
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.95rem",
                          borderBottom: "2px solid rgba(181, 157, 58, 0.3)",
                          color: '#6b4f1d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Thao tác</th>
                      </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(detailData?.bienThe) && detailData.bienThe.map((v: ProductDetail, idx: number) => (
                          <tr
                              key={v.idChiTietSanPham}
                              className="variant-row"
                              style={{
                                borderBottom: '1px solid rgba(181, 157, 58, 0.1)',
                                transition: 'all 0.2s ease'
                              }}
                          >
                            <td style={{
                              padding: '16px 12px',
                              textAlign: 'center',
                              color: '#8a7a2a',
                              fontWeight: 600,
                              fontSize: '1.1rem'
                            }}>
                              {idx + 1}
                            </td>
                            <td style={{
                              padding: '16px 12px',
                              color: '#6b4f1d',
                              fontWeight: 500
                            }}>
                              {v.tenMauSac}
                            </td>
                            <td style={{
                              padding: '16px 12px',
                              color: '#6b4f1d',
                              fontWeight: 500
                            }}>
                              {v.tenKichCo}
                            </td>
                            <td style={{
                              padding: '16px 12px',
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              color: v.soLuong && v.soLuong > 0 ? '#059669' : '#dc2626'
                            }}>
                              {v.soLuong && v.soLuong >= 0 ? v.soLuong : 0}
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                              {v.trangThai === 'Đang bán' ? (
                                  <span className="status-active">ĐANG BÁN</span>
                              ) : (
                                  <span className="status-inactive">NGỪNG BÁN</span>
                              )}
                            </td>
                            <td style={{
                              padding: '16px 12px',
                              textAlign: 'right',
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              color: '#6b4f1d'
                            }}>
                              {v.gia && v.gia > 0 ? `${v.gia.toLocaleString('vi-VN')}đ` : '0đ'}
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                              {v.duongDanHinhAnh ? (
                                  <img
                                      src={
                                        v.duongDanHinhAnh.startsWith('http')
                                            ? v.duongDanHinhAnh
                                            : `http://localhost:8080/images/${v.duongDanHinhAnh.replace(/^.*[\\/]/, '')}`
                                      }
                                      alt="Ảnh"
                                      style={{
                                        width: 56,
                                        height: 56,
                                        objectFit: 'contain',
                                        borderRadius: 8,
                                        border: '2px solid rgba(181, 157, 58, 0.2)',
                                        background: 'white',
                                        boxShadow: '0 2px 8px rgba(181, 157, 58, 0.15)'
                                      }}
                                  />
                              ) : (
                                  <Box sx={{
                                    width: 56,
                                    height: 56,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(181, 157, 58, 0.1)',
                                    borderRadius: 8,
                                    border: '2px dashed rgba(181, 157, 58, 0.3)'
                                  }}>
                              <span style={{
                                color: '#8a7a2a',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}>
                                Không có ảnh
                              </span>
                                  </Box>
                              )}
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                {/* Nút Sửa biến thể */}
                                <button
                                    style={{
                                      background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 8,
                                      padding: 8,
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: 16,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 4px 12px rgba(181, 157, 58, 0.3)',
                                      transition: 'all 0.3s ease',
                                      minWidth: 40,
                                      height: 40
                                    }}
                                    title="Sửa biến thể"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(181, 157, 58, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                                    }}
                                    onClick={() => handleEditVariant(v)}
                                >
                                  <FaEdit style={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            justifyContent: 'center',
            pb: 4,
            px: 4,
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
            gap: 2
          }}>
            <Button
                onClick={() => setOpenDetail(false)}
                sx={{
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 12,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minWidth: 120,
                  boxShadow: '0 8px 20px rgba(181, 157, 58, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(181, 157, 58, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
            >
              ❌ Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal sửa sản phẩm */}
        <Dialog
            open={!!editDetail}
            onClose={() => setEditDetail(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: 16,
                background: 'white',
                boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)'
              }
            }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
            color: '#6b4f1d',
            fontWeight: 700,
            borderBottom: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            Sửa chi tiết sản phẩm
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {editForm && (
                <Box component="form" sx={{ mt: 2 }}>
                  <TextField
                      label="Mã SP"
                      value={editForm.maSanPham}
                      onChange={e => setEditForm((f: any) => ({ ...f, maSanPham: e.target.value }))}
                      fullWidth
                      sx={{ mb: 2 }}
                      onBlur={e => checkMaSanPhamTrung(e.target.value)}
                      error={!!maSanPhamError}
                      helperText={maSanPhamError}
                  />
                  <TextField
                      label="Tên SP"
                      value={editForm.tenSanPham}
                      onChange={e => setEditForm((f: any) => ({ ...f, tenSanPham: e.target.value }))}
                      fullWidth
                      sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Thương hiệu</InputLabel>
                    <Select
                        value={editForm.idThuongHieu || ''}
                        label="Thương hiệu"
                        onChange={e => setEditForm((f: any) => ({ ...f, idThuongHieu: e.target.value }))}
                    >
                      <MenuItem value="">---</MenuItem>
                      {thuongHieus.map(th => (
                          <MenuItem key={th.idThuongHieu} value={String(th.idThuongHieu)}>
                            {th.tenThuongHieu}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                        value={editForm.idDanhMuc || ''}
                        label="Danh mục"
                        onChange={e => setEditForm((f: any) => ({ ...f, idDanhMuc: e.target.value }))}
                    >
                      <MenuItem value="">---</MenuItem>
                      {danhMucs.map(dm => (
                          <MenuItem key={dm.idDanhMuc} value={String(dm.idDanhMuc)}>
                            {dm.tenDanhMuc}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Màu sắc</InputLabel>
                    <Select
                        value={editForm.idMauSac || ''}
                        label="Màu sắc"
                        onChange={e => setEditForm((f: any) => ({ ...f, idMauSac: e.target.value }))}
                    >
                      <MenuItem value="">---</MenuItem>
                      {mauSacs.map(ms => (
                          <MenuItem key={ms.idMauSac} value={String(ms.idMauSac)}>
                            {ms.mauSac}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Kích cỡ</InputLabel>
                    <Select
                        value={editForm.idKichCo || ''}
                        label="Kích cỡ"
                        onChange={e => setEditForm((f: any) => ({ ...f, idKichCo: e.target.value }))}
                    >
                      <MenuItem value="">---</MenuItem>
                      {kichCos.map(kc => (
                          <MenuItem key={kc.idKichCo} value={String(kc.idKichCo)}>
                            {kc.kichCo}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                      label="Giá"
                      value={editForm.gia}
                      onChange={e => setEditForm((f: any) => ({ ...f, gia: e.target.value }))}
                      fullWidth
                      sx={{ mb: 2 }}
                      type="number"
                  />
                  <TextField
                      label="Số lượng"
                      value={editForm.soLuong}
                      onChange={e => setEditForm((f: any) => ({ ...f, soLuong: e.target.value }))}
                      fullWidth
                      sx={{ mb: 2 }}
                      type="number"
                  />
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={editForm.trangThai || ''}
                        label="Trạng thái"
                        onChange={e => setEditForm((f: any) => ({ ...f, trangThai: e.target.value }))}
                    >
                      <MenuItem value="">---</MenuItem>
                      <MenuItem value="Đang bán">Đang bán</MenuItem>
                      <MenuItem value="Ngừng bán">Ngừng bán</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                      label="Mô tả"
                      value={editForm.moTa}
                      onChange={e => setEditForm((f: any) => ({ ...f, moTa: e.target.value }))}
                      fullWidth
                      sx={{ mb: 2 }}
                      multiline
                      minRows={2}
                  />
                  {/* Upload ảnh */}
                  <Box sx={{ mb: 2 }}>
                    <input type="file" accept="image/*" onChange={handleUploadImg} />
                    {uploadingImg && <CircularProgress size={18} sx={{ ml: 2 }} />}
                    {uploadImgError && <Alert severity="error">{uploadImgError}</Alert>}
                    {previewImg ? (
                        <img
                            src={previewImg}
                            alt="Preview"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'contain',
                              borderRadius: 6,
                              border: '1px solid rgba(181, 157, 58, 0.2)',
                              background: '#fafafa',
                              marginTop: 8
                            }}
                        />
                    ) : (
                        editForm?.duongDanHinhAnh && (
                            <img
                                src={`http://localhost:8080/images/${editForm.duongDanHinhAnh.replace(/^.*[\\/]/, '')}`}
                                alt="Ảnh hiện tại"
                                style={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'contain',
                                  borderRadius: 6,
                                  border: '1px solid rgba(181, 157, 58, 0.2)',
                                  background: '#fafafa',
                                  marginTop: 8,
                                  marginRight: 8
                                }}
                            />
                        )
                    )}
                  </Box>
                </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            justifyContent: 'center',
            pb: 3,
            px: 3,
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.5) 0%, rgba(249, 231, 180, 0.5) 100%)'
          }}>
            <Button
                onClick={() => setEditDetail(null)}
                disabled={editLoading}
                sx={{
                  color: '#8a7a2a',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(181, 157, 58, 0.3)',
                  '&:hover': {
                    borderColor: '#b59d3a',
                    color: '#b59d3a',
                    backgroundColor: 'rgba(181, 157, 58, 0.05)'
                  }
                }}
            >
              Hủy
            </Button>
            <Button
                variant="contained"
                onClick={handleSaveEdit}
                disabled={editLoading}
                sx={{
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)'
                  }
                }}
            >
              {editLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal sửa biến thể */}
        <Dialog
            open={openEditVariantModal}
            onClose={() => setOpenEditVariantModal(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: 24,
                background: 'white',
                boxShadow: '0 20px 60px rgba(181, 157, 58, 0.25)',
                overflow: 'hidden'
              }
            }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}>
            ✨ Chỉnh sửa biến thể sản phẩm
          </DialogTitle>
          <DialogContent sx={{
            p: 4,
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.3) 0%, rgba(249, 231, 180, 0.3) 100%)',
            minHeight: '500px'
          }}>
            {editVariantForm && (
                <Box sx={{
                  width: '100%',
                  background: 'white',
                  borderRadius: 16,
                  p: 4,
                  boxShadow: '0 8px 32px rgba(181, 157, 58, 0.1)',
                  border: '1px solid rgba(181, 157, 58, 0.1)'
                }}>
                  {/* Header thông tin */}
                  <Box sx={{
                    mb: 4,
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
                    borderRadius: 12,
                    border: '1px solid rgba(181, 157, 58, 0.2)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" sx={{
                      color: '#6b4f1d',
                      fontWeight: 700,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      🎨 {mauSacs.find(ms => String(ms.idMauSac) === String(editVariantForm.idMauSac))?.mauSac || 'Màu sắc'}
                      <span style={{ color: '#8a7a2a' }}>•</span>
                      📏 {kichCos.find(kc => String(kc.idKichCo) === String(editVariantForm.idKichCo))?.kichCo || 'Kích cỡ'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8a7a2a', fontWeight: 500 }}>
                      Chỉnh sửa số lượng và hình ảnh biến thể sản phẩm
                    </Typography>
                  </Box>

                  {/* Form fields */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Row 1: Màu sắc và Số lượng */}
                    <Box sx={{
                      display: 'flex',
                      gap: 3,
                      flexDirection: { xs: 'column', md: 'row' }
                    }}>
                      <FormControl fullWidth sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle1" sx={{
                          color: '#6b4f1d',
                          fontWeight: 700,
                          mb: 1,
                          fontSize: '1rem'
                        }}>
                          🎨 Màu sắc
                        </Typography>
                        <Select
                            value={editVariantForm.idMauSac || ''}
                            disabled
                            sx={{
                              borderRadius: 12,
                              background: 'rgba(255, 251, 230, 0.5)',
                              height: '56px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(181, 157, 58, 0.3)',
                                borderWidth: 2
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#b59d3a'
                              },
                              '& .Mui-disabled': {
                                color: '#6b4f1d !important',
                                WebkitTextFillColor: '#6b4f1d !important',
                                background: 'rgba(255, 251, 230, 0.8)'
                              }
                            }}
                        >
                          <MenuItem value="">---</MenuItem>
                          {mauSacs.map(ms => (
                              <MenuItem key={ms.idMauSac} value={String(ms.idMauSac)}>
                                {ms.mauSac}
                              </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Typography variant="subtitle1" sx={{
                          color: '#6b4f1d',
                          fontWeight: 700,
                          mb: 1,
                          fontSize: '1rem'
                        }}>
                          📦 Số lượng
                        </Typography>
                        <TextField
                            type="number"
                            value={editVariantForm.soLuong || 0}
                            onChange={e => {
                              setEditVariantForm((f: any) => ({ ...f, soLuong: e.target.value }));
                              setEditVariantSoLuongError('');
                            }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 12,
                                background: 'rgba(255, 251, 230, 0.5)',
                                height: '56px',
                                '& fieldset': {
                                  borderColor: 'rgba(181, 157, 58, 0.3)',
                                  borderWidth: 2
                                },
                                '&:hover fieldset': {
                                  borderColor: '#b59d3a'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#b59d3a'
                                }
                              }
                            }}
                            error={!!editVariantSoLuongError}
                            helperText={editVariantSoLuongError}
                        />
                      </Box>
                    </Box>

                    {/* Row 2: Kích cỡ và Giá */}
                    <Box sx={{
                      display: 'flex',
                      gap: 3,
                      flexDirection: { xs: 'column', md: 'row' }
                    }}>
                      <FormControl fullWidth sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle1" sx={{
                          color: '#6b4f1d',
                          fontWeight: 700,
                          mb: 1,
                          fontSize: '1rem'
                        }}>
                          📏 Kích cỡ
                        </Typography>
                        <Select
                            value={editVariantForm.idKichCo || ''}
                            disabled
                            sx={{
                              borderRadius: 12,
                              background: 'rgba(255, 251, 230, 0.5)',
                              height: '56px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(181, 157, 58, 0.3)',
                                borderWidth: 2
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#b59d3a'
                              },
                              '& .Mui-disabled': {
                                color: '#6b4f1d !important',
                                WebkitTextFillColor: '#6b4f1d !important',
                                background: 'rgba(255, 251, 230, 0.8)'
                              }
                            }}
                        >
                          <MenuItem value="">---</MenuItem>
                          {kichCos.map(kc => (
                              <MenuItem key={kc.idKichCo} value={String(kc.idKichCo)}>
                                {kc.kichCo}
                              </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Typography variant="subtitle1" sx={{
                          color: '#6b4f1d',
                          fontWeight: 700,
                          mb: 1,
                          fontSize: '1rem'
                        }}>
                          💰 Giá (VNĐ)
                        </Typography>
                        <TextField
                            type="number"
                            value={editVariantForm.gia || 0}
                            disabled
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 12,
                                background: 'rgba(255, 251, 230, 0.5)',
                                height: '56px',
                                '& fieldset': {
                                  borderColor: 'rgba(181, 157, 58, 0.3)',
                                  borderWidth: 2
                                },
                                '&:hover fieldset': {
                                  borderColor: '#b59d3a'
                                }
                              },
                              '& .Mui-disabled': {
                                color: '#6b4f1d !important',
                                WebkitTextFillColor: '#6b4f1d !important',
                                background: 'rgba(255, 251, 230, 0.8)'
                              }
                            }}
                        />
                      </Box>
                    </Box>

                    {/* Quản lý Sale */}
                    <Box sx={{
                      mt: 2,
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(255, 192, 203, 0.6) 0%, rgba(255, 105, 180, 0.6) 100%)',
                      borderRadius: 12,
                      border: '1px solid rgba(255, 105, 180, 0.2)'
                    }}>

                    </Box>

                    {/* Quản lý nhiều ảnh */}
                    <Box sx={{
                      mt: 2,
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.6) 0%, rgba(249, 231, 180, 0.6) 100%)',
                      borderRadius: 12,
                      border: '1px solid rgba(181, 157, 58, 0.2)'
                    }}>
                      <Typography variant="h6" sx={{
                        color: '#6b4f1d',
                        fontWeight: 700,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}>
                        📸 Quản lý hình ảnh ({editVariantImages.length}/10)
                        {editVariantHasImageChanges && (
                            <Typography variant="caption" sx={{
                              color: '#f59e0b',
                              fontWeight: 600,
                              ml: 2,
                              px: 2,
                              py: 0.5,
                              borderRadius: 8,
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                              ⚠️ Có thay đổi
                            </Typography>
                        )}
                      </Typography>

                      {/* Thông báo lỗi/thành công */}
                      {editVariantImageError && (
                          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {editVariantImageError}
                          </Alert>
                      )}
                      {editVariantImageSuccess && (
                          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            {editVariantImageSuccess}
                          </Alert>
                      )}

                      {/* Upload ảnh mới */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{
                          color: '#8a7a2a',
                          fontWeight: 600,
                          mb: 2
                        }}>
                          📁 Thêm ảnh mới (có thể chọn nhiều)
                        </Typography>
                        <Box sx={{
                          p: 3,
                          background: 'white',
                          borderRadius: 12,
                          border: '2px dashed rgba(181, 157, 58, 0.3)',
                          textAlign: 'center'
                        }}>
                          <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleEditVariantUploadImage}
                              style={{ display: 'none' }}
                              id="edit-variant-image-upload"
                              disabled={editVariantImageLoading || editVariantImages.length >= 10}
                          />
                          <label htmlFor="edit-variant-image-upload">
                            <Button
                                component="span"
                                variant="outlined"
                                disabled={editVariantImageLoading || editVariantImages.length >= 10}
                                sx={{
                                  borderColor: '#b59d3a',
                                  color: '#b59d3a',
                                  fontWeight: 600,
                                  px: 4,
                                  py: 2,
                                  borderRadius: 12,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  '&:hover': {
                                    borderColor: '#8a7a2a',
                                    color: '#8a7a2a',
                                    backgroundColor: 'rgba(181, 157, 58, 0.08)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(181, 157, 58, 0.2)'
                                  },
                                  '&:disabled': {
                                    borderColor: '#9ca3af',
                                    color: '#9ca3af',
                                    cursor: 'not-allowed'
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                            >
                              {editVariantImageLoading ? (
                                  <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: '#b59d3a' }} />
                                    Đang upload...
                                  </>
                              ) : editVariantImages.length >= 10 ? (
                                  'Đã đạt giới hạn 10 ảnh'
                              ) : (
                                  '📁 Chọn ảnh (có thể chọn nhiều)'
                              )}
                            </Button>
                          </label>
                          <Typography variant="caption" sx={{
                            display: 'block',
                            mt: 2,
                            color: '#8a7a2a',
                            fontWeight: 500
                          }}>
                            {editVariantImages.length}ảnh đã sử dụng
                          </Typography>
                        </Box>
                      </Box>

                      {/* Danh sách ảnh hiện tại */}
                      <Box>
                        <Typography variant="subtitle2" sx={{
                          color: '#8a7a2a',
                          fontWeight: 600,
                          mb: 2
                        }}>
                          📸 Ảnh hiện tại ({editVariantImages.length})
                        </Typography>
                        {editVariantImages.length === 0 ? (
                            <Box sx={{
                              p: 4,
                              textAlign: 'center',
                              background: 'rgba(156, 163, 175, 0.1)',
                              borderRadius: 12,
                              border: '2px dashed rgba(156, 163, 175, 0.3)'
                            }}>
                              <Typography variant="h4" sx={{ mb: 2, color: '#9ca3af' }}>
                                📷
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                Chưa có ảnh nào
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>
                                Hãy thêm ảnh đầu tiên cho sản phẩm này
                              </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                              {editVariantImages.map((image, index) => (
                                  <Box key={image.idChiTietSanPhamHinhAnh} sx={{
                                    background: 'white',
                                    borderRadius: 8,
                                    p: 2,
                                    border: '1px solid rgba(181, 157, 58, 0.2)',
                                    boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}>
                                    {/* Ảnh chính badge */}
                                    {image.laAnhChinh && (
                                        <Box sx={{
                                          position: 'absolute',
                                          top: 8,
                                          left: 8,
                                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                          color: 'white',
                                          px: 1.5,
                                          py: 0.3,
                                          borderRadius: 6,
                                          fontSize: '0.6rem',
                                          fontWeight: 700,
                                          zIndex: 1
                                        }}>
                                          Ảnh chính
                                        </Box>
                                    )}

                                    {/* Thứ tự */}
                                    <Box sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      background: 'rgba(0, 0, 0, 0.7)',
                                      color: 'white',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      zIndex: 1
                                    }}>
                                      {image.thuTu}
                                    </Box>

                                    {/* Ảnh */}
                                    <Box sx={{
                                      width: '100%',
                                      height: 100,
                                      borderRadius: 6,
                                      overflow: 'hidden',
                                      mb: 1,
                                      background: '#f3f4f6',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <img
                                          src={`http://localhost:8080/hinh-anh/view/${image.urlHinhAnh || image.tenHinhAnh}`}
                                          alt={`Ảnh ${image.thuTu}`}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                          onError={(e) => {
                                            console.error('Lỗi load ảnh:', image.urlHinhAnh || image.tenHinhAnh);
                                            e.currentTarget.style.display = 'none';
                                          }}
                                      />
                                    </Box>

                                    {/* Thông tin ảnh */}
                                    <Typography variant="caption" sx={{
                                      color: '#374151',
                                      fontWeight: 500,
                                      mb: 1,
                                      textAlign: 'center',
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {image.tenHinhAnh}
                                    </Typography>

                                    {/* Các nút hành động */}
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                      {!image.laAnhChinh && (
                                          <Button
                                              size="small"
                                              variant="outlined"
                                              onClick={() => handleEditVariantSetMainImage(image.idChiTietSanPhamHinhAnh)}
                                              sx={{
                                                borderColor: '#10b981',
                                                color: '#10b981',
                                                fontSize: '0.6rem',
                                                py: 0.3,
                                                px: 1,
                                                minWidth: 'auto',
                                                '&:hover': {
                                                  borderColor: '#059669',
                                                  color: '#059669',
                                                  backgroundColor: 'rgba(16, 185, 129, 0.08)'
                                                }
                                              }}
                                          >
                                            Chính
                                          </Button>
                                      )}

                                      <Button
                                          size="small"
                                          variant="outlined"
                                          color="error"
                                          onClick={() => handleEditVariantDeleteImage(image.idChiTietSanPhamHinhAnh)}
                                          sx={{
                                            fontSize: '0.6rem',
                                            py: 0.3,
                                            px: 1,
                                            minWidth: 'auto',
                                            '&:hover': {
                                              backgroundColor: 'rgba(239, 68, 68, 0.08)'
                                            }
                                          }}
                                      >
                                        Xóa
                                      </Button>
                                    </Box>
                                  </Box>
                              ))}
                            </Box>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" sx={{
                      color: '#8a7a2a',
                      fontWeight: 600,
                      mb: 2
                    }}>
                      Thay đổi ảnh:
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditVariantImg}
                        style={{ display: 'none' }}
                        id="edit-variant-image-upload"
                    />
                    <label htmlFor="edit-variant-image-upload">
                      <Button
                          component="span"
                          variant="outlined"
                          sx={{
                            borderColor: '#b59d3a',
                            color: '#b59d3a',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: 12,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: '#8a7a2a',
                              color: '#8a7a2a',
                              backgroundColor: 'rgba(181, 157, 58, 0.08)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(181, 157, 58, 0.2)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                      >
                        📁 Chọn ảnh mới
                      </Button>
                    </label>
                    {editVariantForm.newImageFile && (
                        <Typography variant="caption" sx={{
                          display: 'block',
                          mt: 1,
                          color: '#2ecc40',
                          fontWeight: 500
                        }}>
                          ✅ Đã chọn: {editVariantForm.newImageFile.name}
                        </Typography>
                    )}
                  </Box>
                </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            justifyContent: 'center',
            pb: 4,
            px: 4,
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
            gap: 2
          }}>
            <Button
                onClick={() => setOpenEditVariantModal(false)}
                sx={{
                  color: '#8a7a2a',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 12,
                  border: '2px solid rgba(181, 157, 58, 0.4)',
                  fontSize: '1rem',
                  textTransform: 'none',
                  minWidth: 120,
                  '&:hover': {
                    borderColor: '#b59d3a',
                    color: '#b59d3a',
                    backgroundColor: 'rgba(181, 157, 58, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(181, 157, 58, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
            >
              ❌ Hủy
            </Button>
            <Button
                variant="contained"
                onClick={handleSaveEditVariant}
                sx={{
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 12,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minWidth: 120,
                  boxShadow: '0 8px 20px rgba(181, 157, 58, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(181, 157, 58, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
            >
              💾 Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal confirm thay đổi trạng thái */}
        <Dialog
            open={openConfirmModal}
            onClose={() => {
              setOpenConfirmModal(false);
              setConfirmData(null);
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: 16,
                background: 'white',
                boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)'
              }
            }}
        >
          <DialogTitle sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 20,
            color: '#b59d3a',
            pb: 1,
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)',
            borderBottom: '1px solid rgba(181, 157, 58, 0.1)'
          }}>
            Xác nhận
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography sx={{ color: '#6b4f1d' }}>
              Bạn có muốn thay đổi trạng thái sản phẩm này không?
            </Typography>
            {confirmData && (
                <Typography variant="body2" sx={{ mt: 1, color: '#8a7a2a' }}>
                  Từ "{confirmData.currentStatus}" sang "{confirmData.currentStatus === 'Đang bán' ? 'Ngừng bán' : 'Đang bán'}"
                </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
            <Button
                onClick={() => {
                  setOpenConfirmModal(false);
                  setConfirmData(null);
                }}
                sx={{
                  color: '#8a7a2a',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(181, 157, 58, 0.3)',
                  '&:hover': {
                    borderColor: '#b59d3a',
                    color: '#b59d3a',
                    backgroundColor: 'rgba(181, 157, 58, 0.05)'
                  }
                }}
            >
              Hủy
            </Button>
            <Button
                onClick={() => {
                  if (confirmData) {
                    handleToggleProductStatus(confirmData.maSanPham, confirmData.currentStatus);
                  }
                }}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a88c2a 0%, #7a6a1a 100%)'
                  }
                }}
            >
              Đồng ý
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar thông báo */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{
                width: '100%',
                background: snackbar.severity === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: 600
              }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>

      </>
  );
} 