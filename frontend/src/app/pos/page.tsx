'use client';
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import CartList, { CartItem } from "./CartList";
import ProductSelector from "./ProductSelector";
import CustomerSelector from "./CustomerSelector";
import VoucherSelector, { Voucher } from "./VoucherSelector";
import PaymentSummary from "./PaymentSummary";
import InvoicePreview from "./InvoicePreview";

import AdminLayout from '../../component/Admin-Layout';
import { ProductDetail } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddressSelector from './AddressSelector';
import styles from './pos.module.css';

// Types
type Product = { id: number; name: string; price: number; soLuong: number; };

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

// Xóa interface ProductDetail trong file này


function POSPageInner() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{id: string}|null>(null);
  const [showPendingConfirm, setShowPendingConfirm] = useState<boolean>(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<{id: string}|null>(null);
  // Notes for confirm dialogs
  const [deleteNote, setDeleteNote] = useState('');
  const [pendingNote, setPendingNote] = useState('');
  const [restoreNote, setRestoreNote] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showVoucherSelector, setShowVoucherSelector] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [customers, setCustomers] = useState<KhachHangDTO[]>([]);
  const [lastOrderForPrint, setLastOrderForPrint] = useState<{order: any, maHoaDon: string} | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [orderForExport, setOrderForExport] = useState<any | null>(null);
  const [showCreateAddressModal, setShowCreateAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    address: '',
    note: '',
    macDinh: false
  });
  // Thêm ref mới cho xuất PDF ngoài giao diện chính
  const invoiceExportRef = useRef<HTMLDivElement>(null);
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);
  // 1. Thêm state cho hóa đơn chờ
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  // Thêm state cho hóa đơn tại quầy đã hoàn thành
  const [showCompletedInvoices, setShowCompletedInvoices] = useState(false);
  const [completedInvoices, setCompletedInvoices] = useState<any[]>([]);
  // 1. Thêm state orderCounter
  const [orderCounter, setOrderCounter] = useState(1);
  const [addressSuccessMessage, setAddressSuccessMessage] = useState<string | null>(null);
  // Bỏ trạng thái giao hàng trên POS
  const [addressData, setAddressData] = useState<any>(null);
  useEffect(() => {
    fetch('/vn-address.json')
      .then(res => res.json())
      .then(data => setAddressData(data));
  }, []);

  function getProvinceNameByIdOrName(val: string) {
    if (!addressData) return val;
    const province = (addressData.results || []).find((p: any) => p.province_id === val || p.code === val || p.province_name === val || p.name === val);
    return province?.province_name || province?.name || val;
  }
  function getDistrictNameByIdOrName(provinceIdOrName: string, val: string) {
    if (!addressData) return val;
    const province = (addressData.results || []).find((p: any) => p.province_id === provinceIdOrName || p.code === provinceIdOrName || p.province_name === provinceIdOrName || p.name === provinceIdOrName);
    const district = province?.districts?.find((d: any) => d.district_id === val || d.code === val || d.district_name === val || d.name === val);
    return district?.district_name || district?.name || val;
  }
  function getWardNameByIdOrName(provinceIdOrName: string, districtIdOrName: string, val: string) {
    if (!addressData) return val;
    const province = (addressData.results || []).find((p: any) => p.province_id === provinceIdOrName || p.code === provinceIdOrName || p.province_name === provinceIdOrName || p.name === provinceIdOrName);
    const district = province?.districts?.find((d: any) => d.district_id === districtIdOrName || d.code === districtIdOrName || d.district_name === districtIdOrName || d.name === districtIdOrName);
    const ward = district?.wards?.find((w: any) => w.ward_id === val || w.code === val || w.ward_name === val || w.name === val);
    return ward?.ward_name || ward?.name || val;
  }

  // Hàm tạo hóa đơn mới (đưa lên trước phần render)
  const createNewOrder = () => {
    const newOrder = {
      id: uuidv4(),
      orderNumber: orderCounter,
      status: 'draft',
      cart: [],
      selectedProduct: null,
      selectedVoucher: null,
      isShipping: false, // Cho phép bật/tắt giao hàng
      selectedCustomer: null,
      selectedAddress: null,
      shippingInfo: {
        name: "",
        phone: "",
        city: "",
        district: "",
        ward: "",
        address: "",
        note: "",
      },
      appliedVoucher: null,
      printInvoice: true,
      paymentMethod: null,
      productQty: 1,
    };
    setOrders([...orders, newOrder]);
    setActiveOrderId(newOrder.id);
    setOrderCounter(orderCounter + 1);
  };

  // Helper lấy hóa đơn đang active
  const activeOrder = orders.find(o => o.id === activeOrderId);

  // Helper tính toán giảm giá
  const calculateDiscount = (voucher: Voucher | null, total: number): number => {
    if (!voucher) return 0;
    if (voucher.kieuGiamGia === 'PERCENT') {
      const discountAmount = (total * voucher.phanTramGiamGia) / 100;
      return voucher.giaTriToiDa > 0 ? 
        Math.min(discountAmount, voucher.giaTriToiDa) : 
        discountAmount;
    } else if (voucher.kieuGiamGia === 'FIXED') {
      return voucher.giaTriToiDa;
    }
    return 0;
  };

  // Log cart để debug số lượng
  if (activeOrder) {
    console.log('DEBUG: CartList cart =', activeOrder.cart);
  }

  useEffect(() => {
    // Lấy chi tiết sản phẩm
    fetch("/api/chi-tiet-san-pham/hien-thi")
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => setProductDetails(data))
      .catch(() => {
        setProductDetails([]);
      });
    // Lấy sản phẩm
    fetch("/api/products")
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => {
        setProducts(data);
        if (data.length > 0 && activeOrder?.selectedProduct === null) {
          updateActiveOrder({ selectedProduct: data[0].id });
        }
      })
      .catch(err => {
        toast.error("Không lấy được dữ liệu sản phẩm!");
        setProducts([]);
      });
    // Lấy voucher
    fetch("http://localhost:8080/api/voucher")
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => {
        setVouchers(data);
        if (data.length > 0 && activeOrder?.selectedVoucher === null) {
          updateActiveOrder({ selectedVoucher: data[0].maPhieuGiamGia });
        }
      })
      .catch(err => {
        toast.error("Không lấy được dữ liệu voucher!");
        setVouchers([]);
      });
    // Lấy danh sách khách hàng
    fetch("http://localhost:8080/khach-hang/hien-thi")
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => {
        setCustomers(data);
        // Sau khi setCustomers, kiểm tra localStorage
        const pendingOrderStr = localStorage.getItem('pendingOrderToPOS');
        if (pendingOrderStr) {
          setPendingOrder(JSON.parse(pendingOrderStr));
          localStorage.removeItem('pendingOrderToPOS');
        }
      })
      .catch(err => {
        console.error("Không lấy được dữ liệu khách hàng:", err);
        setCustomers([]);
      });
  }, []);

  // Khi customers và pendingOrder đã có, tạo hóa đơn nháp từ pendingOrder
  useEffect(() => {
    if (pendingOrder && customers.length > 0 && productDetails.length > 0 && vouchers.length > 0) {
      const newDraftOrder = {
        id: uuidv4(),
        cart: (pendingOrder.chiTiet || []).map((item: any) => {
          const prod: ProductDetail | undefined = productDetails.find(p => p.idChiTietSanPham === item.idChiTietSanPham);
          return {
            idChiTietSanPham: item.idChiTietSanPham,
            maSanPham: prod?.maSanPham || item.maSanPham,
            tenSanPham: prod?.tenSanPham || item.tenSanPham,
            tenThuongHieu: prod?.tenThuongHieu || item.tenThuongHieu,
            tenDanhMuc: prod?.tenDanhMuc || item.tenDanhMuc,
            tenMauSac: prod?.tenMauSac || item.tenMauSac,
            tenKichCo: prod?.tenKichCo || item.tenKichCo,
            gia: prod?.gia || item.donGia || item.gia,
            qty: item.soLuong || item.qty,
            soLuong: prod?.soLuong || item.soLuong || item.qty,
          };
        }),
        selectedProduct: null,
        selectedVoucher: pendingOrder.idPhieuGiamGia || null,
        isShipping: !!pendingOrder.diaChiNhanHang,
        selectedCustomer: customers.find(c => c.idKhachHang === pendingOrder.idKhachHang) || null,
        selectedAddress: null,
        shippingInfo: {
          name: pendingOrder.tenNguoiNhan || '',
          phone: pendingOrder.soDienThoai || '',
          city: '',
          district: '',
          ward: '',
          address: pendingOrder.diaChiNhanHang || '',
          note: pendingOrder.ghiChu || '',
        },
        appliedVoucher: (pendingOrder.idPhieuGiamGia && vouchers.find(v => v.idPhieuGiamGia === pendingOrder.idPhieuGiamGia)) || null,
        printInvoice: true,
        paymentMethod: null,
        productQty: 1,
      };
      setOrders(prev => [...prev, newDraftOrder]);
      setActiveOrderId(newDraftOrder.id);
      setPendingOrder(null);
    }
  }, [pendingOrder, customers, productDetails, vouchers]);


  // Xử lý khi quay về từ trang MoMo
  useEffect(() => {
    const checkMomoPaymentReturn = async () => {
      // Kiểm tra nếu có tham số cancel từ MoMo
      const urlParams = new URLSearchParams(window.location.search);
      const isCancelled = urlParams.get('cancel') === 'true';

      const pendingPayment = localStorage.getItem('pendingMomoPayment');

      if (isCancelled && pendingPayment) {
        // Xử lý khi người dùng hủy thanh toán
        localStorage.removeItem('pendingMomoPayment');
        toast.info('Bạn đã hủy thanh toán qua MoMo');
        return;
      }

      if (pendingPayment) {
        try {
          const paymentData = JSON.parse(pendingPayment);
          const { momoOrderId, orderDetails } = paymentData;

          // Xóa dữ liệu tạm thời
          localStorage.removeItem('pendingMomoPayment');

          // Kiểm tra trạng thái giao dịch
          const statusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
          const statusResult = await statusResponse.json();

          console.log('MoMo status check result:', statusResult);

          if (statusResult.success && statusResult.data) {
            const transactionStatus = statusResult.data.trangThai || statusResult.status;

            if (transactionStatus === 'Thành công') {
              // Thanh toán thành công
              toast.success('💳 Thanh toán MoMo thành công!');

              // Khôi phục order và tạo hóa đơn
              await handleMomoReturnSuccess(statusResult.data, orderDetails);
            } else if (transactionStatus === 'Thất bại') {
              // Thanh toán thất bại
              toast.error('❌ Thanh toán MoMo thất bại!');

              // Khôi phục order về trạng thái ban đầu
              const restoredOrder = {
                ...orderDetails,
                id: uuidv4(), // Tạo ID mới
                paymentMethod: null, // Reset phương thức thanh toán
                paymentCompleted: false
              };
              setOrders(prev => [...prev, restoredOrder]);
              setActiveOrderId(restoredOrder.id);
            } else if (transactionStatus === 'Chờ thanh toán') {
              toast.info('⏳ Đang xử lý thanh toán MoMo...');

              try {
                // Tự động trigger test thành công
                const testResponse = await fetch(`http://localhost:8080/api/momo/test-success/${momoOrderId}`, {
                  method: 'POST'
                });
                const testResult = await testResponse.json();

                if (testResult.success) {
                  // Check lại status sau khi test
                  const newStatusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
                  const newStatusResult = await newStatusResponse.json();

                  if (newStatusResult.success && newStatusResult.data?.trangThai === 'Thành công') {
                    toast.success('💳 Thanh toán MoMo thành công! Đang tạo hóa đơn...');
                    await handleMomoReturnSuccess(newStatusResult.data, orderDetails);
                    return; // Thoát khỏi function
                  }
                }
              } catch (error) {
                console.error('Auto test error:', error);
              }

              // Nếu auto test không thành công, hiển thị nút test thủ công
              toast.info(
                <div>
                  <div>Giao dịch đang chờ xử lý</div>
                  <button
                    style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={async () => {
                      try {
                        const testResponse = await fetch(`http://localhost:8080/api/momo/test-success/${momoOrderId}`, {
                          method: 'POST'
                        });
                        const testResult = await testResponse.json();
                        if (testResult.success) {
                          // Thay vì reload, check lại status ngay lập tức
                          const newStatusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
                          const newStatusResult = await newStatusResponse.json();

                          if (newStatusResult.success && newStatusResult.data?.trangThai === 'Thành công') {
                            toast.success('💳 Test thành công! Đang tạo hóa đơn...');
                            await handleMomoReturnSuccess(newStatusResult.data, orderDetails);
                          }
                        }
                      } catch (error) {
                        console.error('Test error:', error);
                        toast.error('Lỗi khi test thanh toán!');
                      }
                    }}
                  >
                    🧪 Test Thành Công
                  </button>
                </div>,
                { autoClose: false }
              );

              // Khôi phục order và thêm nút kiểm tra lại
              const restoredOrder = {
                ...orderDetails,
                id: uuidv4(),
                paymentMethod: 'MOMO',
                pendingMomoOrderId: momoOrderId // Thêm để có thể check lại
              };
              setOrders(prev => [...prev, restoredOrder]);
              setActiveOrderId(restoredOrder.id);
            } else {
              // Trạng thái khác
              toast.warning(`⚠️ Trạng thái giao dịch: ${transactionStatus}`);

              // Khôi phục order
              const restoredOrder = {
                ...orderDetails,
                id: uuidv4(),
                paymentMethod: 'MOMO'
              };
              setOrders(prev => [...prev, restoredOrder]);
              setActiveOrderId(restoredOrder.id);
            }
          } else {
            // Không tìm thấy giao dịch hoặc lỗi API
            toast.error('❌ Không thể kiểm tra trạng thái giao dịch!');

            // Khôi phục order
            const restoredOrder = {
              ...orderDetails,
              id: uuidv4(),
              paymentMethod: 'MOMO'
            };
            setOrders(prev => [...prev, restoredOrder]);
            setActiveOrderId(restoredOrder.id);
          }
        } catch (error) {
          console.error('Error checking MoMo payment status:', error);
          toast.error('Có lỗi xảy ra khi kiểm tra thanh toán!');
        }
      }
    };

    // Chỉ chạy một lần khi component mount
    checkMomoPaymentReturn();
  }, []);

  function calculateShippingFee(address: DiaChiDTO): number {
    const fullAddress = `${address.ngoNgach}, ${address.xaPhuong}, ${address.quanHuyen}, ${address.thanhPho}`.toLowerCase();
    if (fullAddress.includes('hà nội')) return 30000;
    if (fullAddress.includes('hcm') || fullAddress.includes('hồ chí minh')) return 0;
    return 35000;
  }

  useEffect(() => {
    if (activeOrder && activeOrder.selectedAddress) {
      const fee = calculateShippingFee(activeOrder.selectedAddress);
      updateActiveOrder({
        shippingFee: fee
      });
    }
    // eslint-disable-next-line
  }, [activeOrder?.selectedAddress]);

  // Hàm chuyển đổi hóa đơn
  const switchOrder = (id: string) => setActiveOrderId(id);

  // Hàm xóa hóa đơn nháp
  const removeOrder = (id: string) => {
    const idx = orders.findIndex(o => o.id === id);
    const newOrders = orders.filter(o => o.id !== id);
    setOrders(newOrders);
    if (activeOrderId === id && newOrders.length > 0) {
      setActiveOrderId(newOrders[Math.max(0, idx - 1)].id);
    }
  };

  // Hàm cập nhật trường trong hóa đơn nháp đang active
  const updateActiveOrder = (patch: Partial<any>) => {
    setOrders(prev =>
      prev.map(o => o.id === activeOrderId ? { ...o, ...patch } : o)
    );
  };

  // Hàm thêm sản phẩm vào giỏ
  const addToCart = (product: ProductDetail, qty: number) => {
    if (!product) return;
    if (qty < 1) {
      toast.error('Số lượng sản phẩm phải lớn hơn 0!');
      return;
    }
    const exist = activeOrder.cart.find((item: CartItem) => item.idChiTietSanPham === product.idChiTietSanPham);
    const currentQty = exist ? exist.qty : 0;
    if (currentQty + qty > product.soLuong) {
      toast.error('Tổng số lượng vượt quá số lượng của cửa !');
      return;
    }
    let newCart;
    if (exist) {
      newCart = activeOrder.cart.map((i: CartItem) =>
        i.idChiTietSanPham === product.idChiTietSanPham
          ? { ...i, qty: i.qty + qty, soLuong: product.soLuong }
          : i
      );
    } else {
      // Sử dụng giá sale nếu sản phẩm đang được bật sale
      const giaBan = ((product.trangThaiSale === 'Bật' || product.trangThaiSale === 'ACTIVE') && product.giaSale) ? product.giaSale : product.gia;
      newCart = [...activeOrder.cart, {
        ...product,
        gia: giaBan,
        qty,
        soLuong: product.soLuong,
        phanTramGiamGia: product.phanTramGiamGia,
        trangThaiSale: product.trangThaiSale,
        giaSale: product.giaSale
      }];
    }
    // Trừ tồn kho
    setProductDetails(prev => prev.map(p =>
      p.idChiTietSanPham === product.idChiTietSanPham
        ? { ...p, soLuong: p.soLuong - qty }
        : p
    ));
    updateActiveOrder({ cart: newCart });
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const removeFromCart = (id: number) => {
    const item = activeOrder.cart.find((item: CartItem) => item.idChiTietSanPham === id);
    if (item) {
      setProductDetails(prev => prev.map(p =>
        p.idChiTietSanPham === id
          ? { ...p, soLuong: p.soLuong + item.qty }
          : p
      ));
    }
    updateActiveOrder({ cart: activeOrder && activeOrder.cart.filter((item: CartItem) => item.idChiTietSanPham !== id) });
  };


  // Hàm chọn khách hàng
  const handleSelectCustomer = (customer: KhachHangDTO | null) => {
    if (!customer) {
      updateActiveOrder({ selectedCustomer: null, selectedAddress: null, shippingFee: 0 });
      return;
    }
    // Tìm địa chỉ mặc định hoặc địa chỉ đầu tiên
    const defaultAddr = customer.danhSachDiaChi?.find((addr: any) => addr.macDinh === 'Có') || customer.danhSachDiaChi?.[0] || null;
    updateActiveOrder({
      selectedCustomer: customer,
      selectedAddress: defaultAddr,
    });
    if (defaultAddr) {
      // Gọi luôn handleSelectAddress để cập nhật shippingInfo đầy đủ
      setTimeout(() => handleSelectAddress(defaultAddr), 0);
    }
  };

  // Hàm chọn địa chỉ giao hàng
  const normalize = (str: string) => (str || '').toLowerCase().trim();
  const handleSelectAddress = (address: DiaChiDTO | null) => {
    if (address && addressData) {
      // Map tên sang id/code, normalize tên
      const province = (addressData.results || []).find((p: any) => normalize(p.province_name) === normalize(address.thanhPho) || normalize(p.name) === normalize(address.thanhPho));
      const cityId = province?.province_id?.toString() || province?.code?.toString() || '';
      const district = province?.districts?.find((d: any) => normalize(d.district_name) === normalize(address.quanHuyen) || normalize(d.name) === normalize(address.quanHuyen));
      const districtId = district?.district_id?.toString() || district?.code?.toString() || '';
      const ward = district?.wards?.find((w: any) => normalize(w.ward_name) === normalize(address.xaPhuong) || normalize(w.name) === normalize(address.xaPhuong));
      const wardId = ward?.ward_id?.toString() || ward?.code?.toString() || '';
      console.log('Chọn địa chỉ:', address);
      console.log('Map tên sang id:', { cityId, districtId, wardId });
      updateActiveOrder({
        selectedAddress: address,
        shippingInfo: {
          ...activeOrder.shippingInfo,
          name: activeOrder.selectedCustomer?.tenKhachHang || "",
          phone: activeOrder.selectedCustomer?.soDienThoai || "",
          city: cityId,
          district: districtId,
          ward: wardId,
          address: address.ngoNgach,
          note: address.ghiChu || ""
        }
      });
    } else {
      updateActiveOrder({ selectedAddress: null });
    }
  };

  // Sửa hàm handleSelectVoucher để nhận object voucher thay vì mã
  const handleSelectVoucher = (voucher: Voucher | null) => {
    if (!voucher) {
      updateActiveOrder({
        appliedVoucher: null,
        selectedVoucher: null,
        idPhieuGiamGia: null
      });
      return;
    }
    // Kiểm tra điều kiện áp dụng
    const now = new Date();
    const start = new Date(voucher.ngayBatDau);
    const end = new Date(voucher.ngayKetThuc);
    if (now < start || now > end) {
      toast.error("Voucher chưa đến ngày áp dụng hoặc đã hết hạn!");
      return;
    }
    if (voucher.soLuong <= 0) {
      toast.error("Voucher đã hết lượt sử dụng!");
      return;
    }
    if (voucher.trangThai !== 'Đang diễn ra') {
      toast.error("Voucher không còn hoạt động!");
      return;
    }
    // Kiểm tra giá trị tối thiểu đơn hàng nếu cần
    const total = activeOrder?.cart?.reduce((sum: number, item: CartItem) => sum + item.gia * item.qty, 0) || 0;
    if (total < voucher.giaTriToiThieu) {
      toast.error(`Đơn hàng phải từ ${voucher.giaTriToiThieu.toLocaleString()}đ mới được áp dụng voucher này!`);
      return;
    }
    updateActiveOrder({
      appliedVoucher: voucher,
      selectedVoucher: voucher.maPhieuGiamGia,
      idPhieuGiamGia: voucher.idPhieuGiamGia
    });
  };

  // Hàm xử lý thanh toán MoMo trực tiếp (redirect)
  const handleMomoDirectPayment = async () => {
    if (!activeOrder) {
      toast.error('Vui lòng tạo đơn hàng trước khi thanh toán');
      return;
    }

    // Kiểm tra xem có sản phẩm nào trong giỏ hàng không
    if (!activeOrder.cart || activeOrder.cart.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    try {
      setLoading(true);

      const amount = activeOrder.cart.reduce((sum: number, item: CartItem) => sum + item.gia * item.qty, 0) - (activeOrder.appliedVoucher?.giaTriToiDa || 0) + (activeOrder.shippingFee || 0);

      // Tạo URL hiện tại với tham số cancel=true
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('cancel', 'true');

      // Tạo giao dịch MoMo
      const response = await fetch('http://localhost:8080/api/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          loaiGiaoDich: 'Tại quầy',
          cancelUrl: currentUrl.toString() // Thêm URL hủy thanh toán
        })
      });

      const result = await response.json();

      if (result.success && result.data.payUrl) {
        // Lưu thông tin order và transaction vào localStorage để xử lý khi quay về
        const orderData = {
          orderId: activeOrder.id,
          momoOrderId: result.data.orderId,
          orderDetails: activeOrder
        };
        localStorage.setItem('pendingMomoPayment', JSON.stringify(orderData));

        // Redirect trực tiếp đến trang MoMo
        window.location.href = result.data.payUrl;
      } else {
        throw new Error(result.message || 'Không thể tạo giao dịch MoMo');
      }
    } catch (error: any) {
      console.error('Error creating MoMo payment:', error);
      toast.error('Lỗi tạo thanh toán MoMo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi quay về từ MoMo thành công
  const handleMomoReturnSuccess = async (transactionData: any, orderDetails: any) => {
    try {
      setLoading(true);

      const finalTotal = orderDetails.cart.reduce((sum: any, item: any) => sum + item.gia * item.qty, 0) - (orderDetails.appliedVoucher?.giaTriToiDa || 0) + (orderDetails.shippingFee || 0);

      // Cập nhật paymentMethod trong order state
      const updatedOrder = {
        ...orderDetails,
        paymentMethod: 'MOMO' // Đảm bảo paymentMethod được đặt là 'MOMO'
      };
      updateActiveOrder(updatedOrder);

      // Chuẩn bị dữ liệu hóa đơn
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const idNhanVien = user?.idNhanVien || '';
      const tenNhanVien = user?.tenNhanVien || '';

      const invoiceData = {
        idKhachHang: updatedOrder.selectedCustomer?.idKhachHang || null,
        idNhanVien: idNhanVien,
        tongTien: updatedOrder.cart.reduce((sum: any, item: any) => sum + item.gia * item.qty, 0),
        giamGia: updatedOrder.appliedVoucher?.giaTriToiDa || 0,
        phiShip: updatedOrder.shippingFee || 0,
        thanhTien: finalTotal,
        tenNguoiNhan: updatedOrder.isShipping ? updatedOrder.shippingInfo.name : "Khách lẻ",
        soDienThoai: updatedOrder.isShipping ? updatedOrder.shippingInfo.phone : "",
        email: updatedOrder.isShipping ? updatedOrder.shippingInfo.email : "",
        diaChiNhanHang: updatedOrder.isShipping ? `${updatedOrder.shippingInfo.address}, ${updatedOrder.shippingInfo.ward}, ${updatedOrder.shippingInfo.district}, ${updatedOrder.shippingInfo.city}` : "",
        ghiChu: updatedOrder.isShipping ? updatedOrder.shippingInfo.note : '',
        trangThai: "Giao hàng thành công",
        idPhieuGiamGia: updatedOrder.appliedVoucher?.idPhieuGiamGia || null,
        loaiDon: updatedOrder.isShipping ? "Tại quầy" : "Online",
        phuongThucThanhToan: 'MOMO',
        chiTiet: (() => {
          console.log('🛒 MoMo cart before mapping:', updatedOrder.cart);
          const mapped = updatedOrder.cart.map((item: any) => ({
            idChiTietSanPham: item.idChiTietSanPham,
            soLuong: item.qty,
            donGia: item.gia,
            thanhTien: item.gia * item.qty
          }));
          console.log('📋 MoMo mapped chiTiet:', mapped);
          return mapped;
        })(),
        thanhToan: {
          soTienThanhToan: finalTotal,
          phuongThucThanhToan: 'MOMO',
          ghiChu: `MoMo Transaction ID: ${transactionData.transId || transactionData.idMomoTransaction || 'N/A'}`,
          trangThai: 'Đã thanh toán'
        }
      };

      // Gọi API tạo hóa đơn
      const response = await fetch('http://localhost:8080/api/hoadon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Invoice created successfully after MoMo return:', result);

      // Liên kết hóa đơn với giao dịch MoMo
      if (transactionData.orderId && (result.data?.idHoaDon || result.idHoaDon)) {
        try {
          const linkResponse = await fetch(`http://localhost:8080/api/momo/link-invoice/${transactionData.orderId}/${result.data?.idHoaDon || result.idHoaDon}`, {
            method: 'POST'
          });
          if (linkResponse.ok) {
            console.log('✅ Đã link hóa đơn với MoMo transaction');
          }
        } catch (linkError) {
          console.error('Error linking invoice to MoMo transaction:', linkError);
        }
      }

      toast.success(`🎉 Tạo hóa đơn thành công! Mã: ${result.data?.maHoaDon || result.maHoaDon}`);

      // Đợi một chút để đảm bảo database đã commit
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cập nhật lại danh sách sản phẩm để cập nhật tồn kho
      try {
        const productResponse = await fetch("/api/chi-tiet-san-pham/hien-thi");
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProductDetails(productData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }

      // Cập nhật danh sách hóa đơn nếu modal đang mở
      if (showCompletedInvoices) {
        await fetchCompletedInvoices();
      }

      // Xóa order khỏi danh sách sau khi tạo hóa đơn thành công
      setOrders(prev => prev.filter(o => o.id !== orderDetails.id));

      // Reset active order
      const remainingOrders = orders.filter(o => o.id !== orderDetails.id);
      if (remainingOrders.length > 0) {
        setActiveOrderId(remainingOrders[0].id);
      } else {
        setActiveOrderId("");
      }

    } catch (error: any) {
      console.error('Error creating invoice after MoMo return:', error);
      toast.error(`Lỗi tạo hóa đơn: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách hóa đơn tại quầy
  const fetchCompletedInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/hoadon");
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      // Lọc chỉ lấy hóa đơn tại quầy
      const posInvoices = data.filter((invoice: any) =>
        invoice.loaiDon === 'Tại quầy' ||
        (invoice.phuongThucThanhToan && invoice.phuongThucThanhToan.includes('MOMO'))
      );

      setCompletedInvoices(posInvoices);
      console.log('Completed POS invoices:', posInvoices);
    } catch (error) {
      console.error('Error fetching completed invoices:', error);
      toast.error('Không thể lấy danh sách hóa đơn!');
      setCompletedInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi thanh toán MoMo thành công
  const handleMomoPaymentSuccess = async (transactionData: any) => {
    if (!activeOrder) return;
    
    try {
      setLoading(true);
      
      // Cập nhật order với thông tin MoMo
      const updatedOrder = {
        ...activeOrder,
        momoTransaction: transactionData,
        paymentCompleted: true
      };
      
      // Tạo hóa đơn tự động
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const idNhanVien = user?.idNhanVien || '';
      const tenNhanVien = user?.tenNhanVien || '';
      
      const finalTotal = updatedOrder.cart.reduce((sum: any, item: any) => sum + item.gia * item.qty, 0) - (updatedOrder.appliedVoucher?.giaTriToiDa || 0) + (updatedOrder.shippingFee || 0);
      
      // Chuẩn bị dữ liệu hóa đơn
      const invoiceData = {
        idKhachHang: updatedOrder.selectedCustomer?.idKhachHang || null,
        idNhanVien: idNhanVien,
        tongTien: updatedOrder.cart.reduce((sum: any, item: any) => sum + item.gia * item.qty, 0),
        giamGia: updatedOrder.appliedVoucher?.giaTriToiDa || 0,
        phiShip: updatedOrder.shippingFee || 0,
        thanhTien: finalTotal,
        tenNguoiNhan: updatedOrder.isShipping ? updatedOrder.shippingInfo.name : "Khách lẻ",
        soDienThoai: updatedOrder.isShipping ? updatedOrder.shippingInfo.phone : "",
        email: updatedOrder.isShipping ? updatedOrder.shippingInfo.email : "",
        diaChiNhanHang: updatedOrder.isShipping ? `${updatedOrder.shippingInfo.address}, ${updatedOrder.shippingInfo.ward}, ${updatedOrder.shippingInfo.district}, ${updatedOrder.shippingInfo.city}` : "",
        ghiChu: updatedOrder.isShipping ? updatedOrder.shippingInfo.note : '',
        trangThai: "Giao hàng thành công", // Đã thanh toán MoMo thành công
        idPhieuGiamGia: updatedOrder.appliedVoucher?.idPhieuGiamGia || null,
        loaiDon: updatedOrder.isShipping ? "Tại quầy" : "Online",
        phuongThucThanhToan: 'MOMO', // Thêm field chính
        chiTiet: (() => {
          console.log('🛒 MoMo success cart before mapping:', updatedOrder.cart);
          const mapped = updatedOrder.cart.map((item: any) => ({
            idChiTietSanPham: item.idChiTietSanPham,
            soLuong: item.qty,
            donGia: item.gia,
            thanhTien: item.gia * item.qty
          }));
          console.log('📋 MoMo success mapped chiTiet:', mapped);
          return mapped;
        })(),
        thanhToan: {
          soTienThanhToan: finalTotal,
          phuongThucThanhToan: 'MOMO',
          ghiChu: `MoMo Transaction ID: ${transactionData.transId || transactionData.idMomoTransaction}`,
          trangThai: 'Đã thanh toán'
        }
      };

      console.log('Creating invoice after MoMo payment:', invoiceData);

      // Gọi API tạo hóa đơn
      const response = await fetch('http://localhost:8080/api/hoadon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Invoice created successfully:', result);

      // Liên kết hóa đơn với giao dịch MoMo
      if (transactionData.orderId && (result.data?.idHoaDon || result.idHoaDon)) {
        try {
          await fetch(`http://localhost:8080/api/momo/link-invoice/${transactionData.orderId}/${result.data?.idHoaDon || result.idHoaDon}`, {
            method: 'POST'
          });
          console.log('Linked invoice to MoMo transaction');
        } catch (linkError) {
          console.error('Error linking invoice to MoMo transaction:', linkError);
        }
      }

      // Lưu thông tin để in hóa đơn
      const invoiceDataForPrint = {
        ...updatedOrder,
        maHoaDon: result.data?.maHoaDon || result.maHoaDon,
        idHoaDon: result.data?.idHoaDon || result.idHoaDon,
        cart: updatedOrder.cart.map((item: any) => {
          const prod = productDetails.find((p: ProductDetail) => p.idChiTietSanPham === item.idChiTietSanPham);
          return {
            ...item,
            tenSanPham: prod?.tenSanPham || item.tenSanPham,
            tenMauSac: prod?.tenMauSac || item.tenMauSac,
            tenKichCo: prod?.tenKichCo || item.tenKichCo,
            gia: prod?.gia || item.gia,
          };
        }),
        idNhanVien: idNhanVien,
        tenNhanVien: tenNhanVien,
        idKhachHang: updatedOrder.selectedCustomer?.idKhachHang || '',
        tenKhachHang: updatedOrder.selectedCustomer?.tenKhachHang || 'Khách lẻ',
        ngayTao: new Date().toISOString(),
        phuongThucThanhToan: 'MOMO'
      };

      setLastOrderForPrint({
        order: invoiceDataForPrint,
        maHoaDon: result.data?.maHoaDon || result.maHoaDon
      });

      // Xóa order khỏi danh sách
      setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
      
      // Reset active order
      if (orders.length > 1) {
        const remainingOrders = orders.filter(o => o.id !== updatedOrder.id);
        setActiveOrderId(remainingOrders[0]?.id || "");
      } else {
        setActiveOrderId("");
      }

      toast.success(`Tạo hóa đơn thành công! Mã: ${result.data?.maHoaDon || result.maHoaDon}`);
      
      // Hỏi có muốn in hóa đơn không
      setShowExportConfirm(true);

    } catch (error: any) {
      console.error('Error creating invoice after MoMo payment:', error);
      toast.error(`Lỗi tạo hóa đơn: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hoàn thành hóa đơn
  const handleDone = async (shouldExportPDF: boolean = true) => {
    if (!activeOrder) return;
    if (activeOrder.cart.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    if (!activeOrder.paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    if (activeOrder.isShipping && !activeOrder.selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng cho đơn giao hàng!");
      return;
    }
    setLoading(true);
    try {
      // Tính toán tổng tiền sản phẩm gốc (không trừ giảm giá)
      const total = activeOrder.cart.reduce((sum: number, item: CartItem) => sum + item.gia * item.qty, 0);
      const discount = calculateDiscount(activeOrder.appliedVoucher, total);
      const shippingFee = activeOrder.shippingFee || 0;
      const finalTotal = total - discount + shippingFee;

      // Lấy thông tin nhân viên đăng nhập từ localStorage
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
      const idNhanVien = user.idNhanVien || 1; // fallback nếu chưa đăng nhập
      const tenNhanVien = user.tenNhanVien || '';

      // Trước khi tạo orderData, đảm bảo shippingInfo luôn đầy đủ
      let shippingInfo = activeOrder.shippingInfo;
      if (
        activeOrder.isShipping &&
        activeOrder.selectedAddress &&
        (
          !shippingInfo.address ||
          !shippingInfo.city ||
          !shippingInfo.district ||
          !shippingInfo.ward
        )
      ) {
        shippingInfo = {
          ...shippingInfo,
          name: activeOrder.selectedCustomer?.tenKhachHang || "",
          phone: activeOrder.selectedCustomer?.soDienThoai || "",
          city: activeOrder.selectedAddress.thanhPho,
          district: activeOrder.selectedAddress.quanHuyen,
          ward: activeOrder.selectedAddress.xaPhuong,
          address: activeOrder.selectedAddress.ngoNgach,
          note: activeOrder.selectedAddress.ghiChu || ""
        };
      }

      // Tạo hóa đơn
      const orderData = {
        idKhachHang: activeOrder.selectedCustomer?.idKhachHang || null,
        tenKhachHang: (() => {
          if (activeOrder.selectedCustomer) {
            return activeOrder.selectedCustomer.tenKhachHang;
          } else {
            return "Khách lẻ";
          }
        })(),
        idNhanVien: idNhanVien,
        idPhieuGiamGia: activeOrder.idPhieuGiamGia || (activeOrder.appliedVoucher ? activeOrder.appliedVoucher.idPhieuGiamGia : null),
        kieuGiamGia: activeOrder.appliedVoucher?.kieuGiamGia, // thêm dòng này nếu backend cần
        loaiDon: 'Tại quầy', // Sửa để match với filter
        tongTien: total, // <-- Đảm bảo là tổng tiền gốc, không trừ giảm giá
        phiShip: shippingFee,
        tenNguoiNhan: activeOrder.isShipping ? shippingInfo.name : null,
        soDienThoai: (() => {
          if (activeOrder.isShipping) {
            return shippingInfo.phone;
          } else {
            // TH1: Có chọn khách hàng thì lấy số điện thoại
            if (activeOrder.selectedCustomer) {
              return activeOrder.selectedCustomer.soDienThoai;
            }
            // TH2: Không chọn khách hàng thì để null
            return null;
          }
        })(),
        email: (() => {
          if (activeOrder.isShipping) {
            return activeOrder.selectedCustomer?.email;
          } else {
            // TH1: Có chọn khách hàng thì lấy email
            if (activeOrder.selectedCustomer) {
              return activeOrder.selectedCustomer.email;
            }
            // TH2: Không chọn khách hàng thì để null
            return null;
          }
        })(),
        diaChiNhanHang: (() => {
          if (activeOrder.isShipping) {
            return `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`;
          } else {
            // TH1: Có chọn khách hàng và địa chỉ thì lấy địa chỉ
            if (activeOrder.selectedCustomer && activeOrder.selectedAddress) {
              return `${activeOrder.selectedAddress.ngoNgach}, ${activeOrder.selectedAddress.xaPhuong}, ${activeOrder.selectedAddress.quanHuyen}, ${activeOrder.selectedAddress.thanhPho}`;
            }
            // TH2: Không chọn khách hàng hoặc địa chỉ thì để null
            return null;
          }
        })(),
        ghiChu: shippingInfo.note || '',
        trangThai: (() => {
          // Logic xác định trạng thái hóa đơn
          if (activeOrder.isShipping) {
            // TH1: Có giao hàng + Tiền mặt = Chờ xác nhận
            if (activeOrder.paymentMethod === 'TIEN_MAT') {
              return 'Chờ xác nhận';
            }
            // Mặc định cho các phương thức khác
            return 'Chờ xác nhận';
          } else {
            // Không giao hàng = Giao hàng thành công
            return 'Giao hàng thành công';
          }
        })(),
        chiTiet: (() => {
          console.log('🛒 Cart before mapping:', activeOrder.cart);
          const mapped = activeOrder.cart.map((item: CartItem) => ({
            idChiTietSanPham: item.idChiTietSanPham,
            soLuong: item.qty,
            donGia: item.gia,
            thanhTien: item.gia * item.qty
          }));
          console.log('📋 Mapped chiTiet:', mapped);
          return mapped;
        })(),
        phuongThucThanhToan: (() => {
          if (activeOrder.paymentMethod === 'TIEN_MAT') return 'Tiền mặt';
          if (activeOrder.paymentMethod === 'MOMO') return 'MOMO';
          return activeOrder.paymentMethod;
        })(),
        thanhToan: {
          soTienThanhToan: finalTotal,
          phuongThucThanhToan: (() => {
            if (activeOrder.paymentMethod === 'TIEN_MAT') return 'Tiền mặt';
            if (activeOrder.paymentMethod === 'MOMO') return 'MOMO';
            return activeOrder.paymentMethod;
          })(),
          ghiChu: '',
          trangThai: (() => {
            // Logic xác định trạng thái thanh toán
            if (activeOrder.isShipping) {
              // TH1: Có giao hàng + Tiền mặt = Chờ xác nhận
              if (activeOrder.paymentMethod === 'TIEN_MAT') {
                return 'Chờ xác nhận';
              }
              // Mặc định cho các phương thức khác
              return 'Chờ xác nhận';
            } else {
              // Không giao hàng = Giao hàng thành công
              return 'Giao hàng thành công';
            }
          })()
        }
      };

      const response = await fetch('http://localhost:8080/api/hoadon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Lỗi tạo hóa đơn');
      }

      const result = await response.json();
      const maHoaDon = result.data?.maHoaDon || result.maHoaDon || "---";
      // Xóa hóa đơn nháp
      setOrders(prev => prev.filter(o => o.id !== activeOrderId));
      if (orders.length > 1) {
        setActiveOrderId(orders[0].id);
      } else {
        setActiveOrderId("");
      }

      // Xác định trạng thái để hiển thị thông báo
      const trangThai = (() => {
        if (activeOrder.isShipping) {
          if (activeOrder.paymentMethod === 'TIEN_MAT') {
            return 'Chờ xác nhận';
          }
          return 'Chờ xác nhận';
        } else {
          return 'Giao hàng thành công';
        }
      })();
      
      // Hiển thị thông báo với trạng thái
      if (trangThai === 'Chờ xác nhận') {
        toast.success(`Hóa đơn ${maHoaDon} đã được tạo với trạng thái "Chờ xác nhận"!`);
      } else if (trangThai === 'Giao hàng thành công') {
        toast.success(`Hóa đơn ${maHoaDon} đã được tạo với trạng thái "Giao hàng thành công"!`);
      } else {
        toast.success(`Hóa đơn ${maHoaDon} đã được tạo với trạng thái "Đã xác nhận"!`);
      }

      // Lưu thông tin để in
      setLastOrderForPrint({
        order: {
          ...activeOrder,
          ...result,
          chiTiet: activeOrder.cart.map((item: CartItem) => {
            const prod = productDetails.find(p => p.idChiTietSanPham === item.idChiTietSanPham);
            return {
              ...item,
              tenSanPham: prod?.tenSanPham || '',
              tenThuongHieu: prod?.tenThuongHieu || '',
              tenDanhMuc: prod?.tenDanhMuc || '',
              tenMauSac: prod?.tenMauSac || '',
              tenKichCo: prod?.tenKichCo || '',
              maSanPham: prod?.maSanPham || '',
              gia: prod?.gia || item.gia,
            };
          }),
          shippingInfo: activeOrder.shippingInfo,
          appliedVoucher: activeOrder.appliedVoucher,
          shippingFee: activeOrder.shippingFee,
          idNhanVien: idNhanVien,
          tenNhanVien: tenNhanVien,
          idKhachHang: activeOrder.selectedCustomer?.idKhachHang || '',
          tenKhachHang: (() => {
            if (activeOrder.selectedCustomer) {
              return activeOrder.selectedCustomer.tenKhachHang;
            } else {
              return "Khách lẻ";
            }
          })(),
          soDienThoaiKhachHang: activeOrder.selectedCustomer?.soDienThoai || '',
          ngayTao: new Date().toISOString(),
          giamGia: discount,
          thanhTien: finalTotal,
        },
        maHoaDon: maHoaDon
      });
      // Tự động mở hóa đơn toàn màn hình
      localStorage.setItem('lastOrderForPrint', JSON.stringify({
        order: {
          ...activeOrder,
          ...result,
          chiTiet: activeOrder.cart.map((item: CartItem) => {
            const prod = productDetails.find(p => p.idChiTietSanPham === item.idChiTietSanPham);
            return {
              ...item,
              tenSanPham: prod?.tenSanPham || '',
              tenThuongHieu: prod?.tenThuongHieu || '',
              tenDanhMuc: prod?.tenDanhMuc || '',
              tenMauSac: prod?.tenMauSac || '',
              tenKichCo: prod?.tenKichCo || '',
              maSanPham: prod?.maSanPham || '',
              gia: prod?.gia || item.gia,
            };
          }),
          shippingInfo: activeOrder.shippingInfo,
          appliedVoucher: activeOrder.appliedVoucher,
          shippingFee: activeOrder.shippingFee,
          idNhanVien: idNhanVien,
          tenNhanVien: tenNhanVien,
          idKhachHang: activeOrder.selectedCustomer?.idKhachHang || '',
          tenKhachHang: (() => {
            if (activeOrder.selectedCustomer) {
              return activeOrder.selectedCustomer.tenKhachHang;
            } else {
              return "Khách lẻ";
            }
          })(),
          soDienThoaiKhachHang: activeOrder.selectedCustomer?.soDienThoai || '',
          ngayTao: new Date().toISOString(),
          giamGia: discount,
          thanhTien: finalTotal,
        },
        maHoaDon: maHoaDon
      }));
      
      // Chỉ xuất PDF nếu shouldExportPDF = true
      if (shouldExportPDF) {
      console.log('Đang mở trang XuatHoaDon...');
      // Thử mở popup trước, nếu bị chặn thì chuyển hướng
      const popup = window.open('/XuatHoaDon', '_blank');
      if (!popup) {
        console.log('Popup bị chặn, chuyển hướng trực tiếp...');
        window.location.href = '/XuatHoaDon';
      } else {
        console.log('Đã mở trang XuatHoaDon thành công');
        }
      }
      setLastOrderForPrint(null);

      setDone(true);
    } catch (error) {
      console.error('Lỗi tạo hóa đơn:', error);
      toast.error('Có lỗi xảy ra khi tạo hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị confirm dialog cho chuyển hóa đơn chờ
  const showPendingConfirmDialog = () => {
    if (!activeOrder) return;
    if (activeOrder.cart.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    setPendingNote('');
    setShowPendingConfirm(true);
  };

  // Hàm đẩy hóa đơn nháp xuống chờ xác nhận
  const handlePushToPending = async () => {
    if (!activeOrder) return;
    setLoading(true);
    try {
      // Tính toán tổng tiền
      const total = activeOrder.cart.reduce((sum: number, item: CartItem) => sum + item.gia * item.qty, 0);
      const discount = calculateDiscount(activeOrder.appliedVoucher, total);
      const shippingFee = activeOrder.shippingFee || 0;
      const finalTotal = total - discount + shippingFee;

      // Lấy thông tin nhân viên đăng nhập từ localStorage
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
      const idNhanVien = user.idNhanVien || 1; // fallback nếu chưa đăng nhập
      const tenNhanVien = user.tenNhanVien || '';

      // Trước khi tạo orderData:
      let kieuGiamGiaBackend = activeOrder.appliedVoucher?.kieuGiamGia;

      // Tạo hóa đơn với trạng thái 'Chờ xác nhận'
      const orderData = {
        idKhachHang: activeOrder.selectedCustomer?.idKhachHang || null,
        idNhanVien: idNhanVien,
        idPhieuGiamGia: activeOrder.idPhieuGiamGia || (activeOrder.appliedVoucher ? activeOrder.appliedVoucher.idPhieuGiamGia : null),
        kieuGiamGia: kieuGiamGiaBackend, // thêm dòng này nếu backend cần
        loaiDon: 'Tại cửa hàng',
        tongTien: total,
        phiShip: shippingFee,
        tenNguoiNhan: activeOrder.isShipping ? activeOrder.shippingInfo.name : null,
        soDienThoai: activeOrder.isShipping ? activeOrder.shippingInfo.phone : null,
        email: activeOrder.isShipping ? activeOrder.selectedCustomer?.email : null,
        diaChiNhanHang: activeOrder.isShipping
          ? `${activeOrder.shippingInfo.address}, ${activeOrder.shippingInfo.ward}, ${activeOrder.shippingInfo.district}, ${activeOrder.shippingInfo.city}`
          : null,
        ghiChu: activeOrder.shippingInfo.note || '',
        trangThai: 'Chờ xác nhận',
        chiTiet: activeOrder.cart.map((item: CartItem) => ({
          idChiTietSanPham: item.idChiTietSanPham,
          soLuong: item.qty,
          donGia: item.gia,
          thanhTien: item.gia * item.qty
        })),
        thanhToan: {
          soTienThanhToan: finalTotal,
          phuongThucThanhToan: activeOrder.paymentMethod,
          ghiChu: '',
          trangThai: 'Chờ xác nhận'
        }
      };

      const response = await fetch('http://localhost:8080/api/hoadon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Lỗi tạo hóa đơn');
      }

      const result = await response.json();
      const maHoaDon = result.data?.maHoaDon || result.maHoaDon || "---";
      // Xóa hóa đơn nháp
      setOrders(prev => prev.filter(o => o.id !== activeOrderId));
      if (orders.length > 1) {
        setActiveOrderId(orders[0].id);
      } else {
        setActiveOrderId("");
      }
      toast.success(`Hóa đơn ${maHoaDon} đã được đẩy xuống chờ xác nhận!`);
      setShowPendingConfirm(false);
    } catch (error) {
      console.error('Lỗi đẩy hóa đơn:', error);
      toast.error('Có lỗi xảy ra khi đẩy hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  // Hàm hủy confirm chuyển hóa đơn chờ
  const cancelPendingConfirm = () => {
    setShowPendingConfirm(false);
  };

  // Hàm hiển thị confirm dialog cho lấy lại hóa đơn chờ
  const showRestoreConfirmDialog = (orderId: string) => {
    setRestoreNote('');
    setShowRestoreConfirm({ id: orderId });
  };

  // Hàm xác nhận lấy lại hóa đơn chờ
  const confirmRestoreOrder = () => {
    if (showRestoreConfirm) {
      restorePendingOrder(showRestoreConfirm.id);
      setShowRestoreConfirm(null);
      setShowPendingOrders(false);
    }
  };

  // Hàm hủy confirm lấy lại hóa đơn chờ
  const cancelRestoreConfirm = () => {
    setShowRestoreConfirm(null);
  };

  // Hàm xóa hóa đơn
  const handleDeleteOrder = (id: string) => {
    setDeleteNote('');
    setShowDeleteConfirm({ id });
  };

  const confirmDeleteOrder = () => {
    if (showDeleteConfirm) {
      removeOrder(showDeleteConfirm.id);
    setShowDeleteConfirm(null);
    }
  };

  const cancelDeleteOrder = () => setShowDeleteConfirm(null);

  const reloadSelectedCustomerAddresses = async (customerId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/khach-hang/chi-tiet/${customerId}`);
      if (response.ok) {
        const customerData = await response.json();
        // Lấy địa chỉ mặc định hoặc địa chỉ cuối cùng (mới nhất)
        const defaultAddr = customerData.danhSachDiaChi?.find((addr: any) => addr.macDinh === 'Có')
          || customerData.danhSachDiaChi?.[customerData.danhSachDiaChi.length - 1]
          || null;
        updateActiveOrder({ selectedCustomer: customerData, selectedAddress: defaultAddr });
        // Đồng bộ shippingInfo nếu có địa chỉ
        if (defaultAddr && addressData) {
          // Map tên sang id/code
          const province = (addressData.results || []).find((p: any) => p.province_name === defaultAddr.thanhPho || p.name === defaultAddr.thanhPho);
          const cityId = province?.province_id || province?.code || '';
          const district = province?.districts?.find((d: any) => d.district_name === defaultAddr.quanHuyen || d.name === defaultAddr.quanHuyen);
          const districtId = district?.district_id || district?.code || '';
          const ward = district?.wards?.find((w: any) => w.ward_name === defaultAddr.xaPhuong || w.name === defaultAddr.xaPhuong);
          const wardId = ward?.ward_id || ward?.code || '';
          updateActiveOrder({
            selectedCustomer: customerData,
            selectedAddress: defaultAddr,
            shippingInfo: {
              ...activeOrder.shippingInfo,
              name: customerData.tenKhachHang || '',
              phone: customerData.soDienThoai || '',
              city: cityId,
              district: districtId,
              ward: wardId,
              address: defaultAddr.ngoNgach,
              note: defaultAddr.ghiChu || ''
            }
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải lại thông tin khách hàng:', error);
    }
  };

  const handleCreateAddress = async () => {
    if (!activeOrder?.selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng trước!');
      return;
    }
    // Logic tạo địa chỉ mới
    toast.info('Tính năng tạo địa chỉ mới đang được phát triển');
  };

  const handleDeleteAddress = async (idDiaChi: number) => {
    try {
      const response = await fetch(`http://localhost:8080/dia-chi/xoa/${idDiaChi}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Xóa địa chỉ thành công!');
        await reloadSelectedCustomerAddresses(activeOrder.selectedCustomer.idKhachHang);
      } else {
        toast.error('Lỗi khi xóa địa chỉ!');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa địa chỉ!');
      }
  };

  const handleRemoveCustomer = () => {
    updateActiveOrder({ selectedCustomer: null, selectedAddress: null, shippingFee: 0 });
  };

  // 2. Thêm hàm hiển thị confirm dialog cho đưa hóa đơn vào chờ
  const showMoveToPendingConfirm = () => {
    if (!activeOrder) return;
    setPendingNote('');
    setShowPendingConfirm(true);
  };

  // Hàm đưa hóa đơn vào chờ
  const moveToPendingOrders = () => {
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'pending' } : o));
    toast.success("Đã đưa hóa đơn vào danh sách chờ!");
    setShowPendingConfirm(false);
    setTimeout(() => {
      const drafts = orders.filter(o => o.status === 'draft' && o.id !== activeOrder.id);
      if (drafts.length > 0) setActiveOrderId(drafts[0].id);
      else createNewOrder();
    }, 0);
  };

  // 3. Thêm hàm lấy lại hóa đơn chờ
  const restorePendingOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'draft' } : o));
    setActiveOrderId(orderId);
    toast.success("Đã lấy hóa đơn từ danh sách chờ!");
  };

  // Helper lấy danh sách hóa đơn không trùng id giữa hai mảng
  function getUniqueOrders(primary: any[], secondary: any[]): any[] {
    return primary.filter((order: any) => !secondary.some((o: any) => o.id === order.id));
  }

  // 1. Thêm state cho modal xác nhận hoàn thành
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  // 2. Thêm state cho modal xác nhận xuất PDF
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [doneNote, setDoneNote] = useState('');
  const [exportNote, setExportNote] = useState('');

  return (
    <div>
      {/* Toàn bộ giao diện POS */}
    <div className={styles.posContainer}>
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <button className={styles.createOrderButton} onClick={createNewOrder}>+</button>
          <div className={styles.createOrderText}>Tạo hóa đơn mới</div>
        </div>
      ) : (
          <>
            {/* Tabs hóa đơn */}
            <div className={styles.tabsContainer}>
              <div className={styles.tabsWrapper}>
              {orders.filter((order: any) => order.status === 'draft').map((order: any) => (
                  <div key={order.id} className={`${styles.tab} ${order.id === activeOrderId ? styles.active : ''}`} onClick={() => setActiveOrderId(order.id)}>
                    Hóa đơn {order.orderNumber}
                    <span className={styles.tabClose} onClick={e => { e.stopPropagation(); handleDeleteOrder(order.id); }}>×</span>
                </div>
              ))}
                <button className={styles.actionButton} onClick={createNewOrder}>+</button>
                {activeOrder && (
                  <button className={`${styles.actionButton} ${styles.pendingButton}`} onClick={showMoveToPendingConfirm} title="Đưa hóa đơn này vào chờ">
                    ⏸
                  </button>
                )}
                {/* Nút xem hóa đơn chờ */}
                <div style={{ position: 'relative' }}>
                  <button className={`${styles.actionButton} ${styles.pendingOrdersButton}`} title="Xem hóa đơn chờ" onClick={() => setShowPendingOrders(true)}>
                    🕒
                  </button>
                </div>
                {/* Nút xem hóa đơn tại quầy */}
                <div style={{ position: 'relative' }}>
                  <button className={`${styles.actionButton} ${styles.completedInvoicesButton}`} title="Xem hóa đơn tại quầy" onClick={() => {
                    setShowCompletedInvoices(true);
                    fetchCompletedInvoices();
                  }}>
                    🧾
                  </button>
                  {/* Modal danh sách hóa đơn chờ */}
                  {showPendingOrders && (
                    <>
                      {/* Background overlay */}
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998
                      }} onClick={() => setShowPendingOrders(false)} />
                                            {/* Modal content */}
                      <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
                        border: '1px solid rgba(181, 157, 58, 0.2)',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)',
                        zIndex: 9999,
                        minWidth: 300,
                        maxWidth: 400
                      }}>
                        {/* Close button */}
                          <button 
                          onClick={() => setShowPendingOrders(false)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'none',
                            border: 'none',
                            fontSize: 20,
                            fontWeight: 700,
                            color: '#6b4f1d',
                            cursor: 'pointer',
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(181, 157, 58, 0.1)';
                            e.currentTarget.style.color = '#b59d3a';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#6b4f1d';
                          }}
                        >
                          ×
                        </button>
                      <div style={{
                        padding: '16px',
                        fontWeight: 700,
                        borderBottom: '1px solid rgba(181, 157, 58, 0.1)',
                        color: '#6b4f1d',
                        fontSize: 16,
                        textAlign: 'center'
                      }}>
                        Hóa đơn chờ
                      </div>
                      {(() => {
                        const pendingOrders = orders.filter((order: any) => order.status === 'pending');
                        console.log('=== DEBUG MODAL HÓA ĐƠN CHỜ ===');
                        console.log('Modal opened, orders:', orders);
                        console.log('Pending orders:', pendingOrders);
                        console.log('Orders status:', orders.map(o => ({ id: o.id, status: o.status, orderNumber: o.orderNumber })));
                        console.log('Active order:', activeOrder);
                        console.log('================================');
                        
                        if (pendingOrders.length === 0) {
                          return (
                            <div style={{
                              padding: '20px 16px',
                              textAlign: 'center',
                              color: '#8a7a2a',
                              fontSize: 14
                            }}>
                              Không có hóa đơn chờ
                              <br />
                              <small style={{ fontSize: 12, color: '#b59d3a' }}>
                                (Tổng: {orders.length} hóa đơn)
                              </small>
                              <br />
                              <button 
                                onClick={() => {
                                  console.log('Clicking test button...');
                                  if (activeOrder) {
                                    console.log('Active order found:', activeOrder);
                                    setOrders(prev => {
                                      const newOrders = prev.map(o => o.id === activeOrder.id ? { ...o, status: 'pending' } : o);
                                      console.log('New orders after update:', newOrders);
                                      return newOrders;
                                    });
                                    toast.success("Đã tạo hóa đơn chờ test!");
                                  } else {
                                    console.log('No active order found');
                                    toast.error("Không có hóa đơn đang chọn!");
                                  }
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '8px 16px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  marginTop: 8,
                                  transition: 'all 0.2s'
                                }}
                              >
                                Tạo hóa đơn chờ test
                              </button>
                              <br />
                              <button 
                                onClick={() => {
                                  console.log('Clicking create pending from any order...');
                                  if (orders.length > 0) {
                                    const firstOrder = orders[0];
                                    console.log('First order:', firstOrder);
                                    setOrders(prev => {
                                      const newOrders = prev.map(o => o.id === firstOrder.id ? { ...o, status: 'pending' } : o);
                                      console.log('New orders after update:', newOrders);
                                      return newOrders;
                                    });
                                    toast.success("Đã tạo hóa đơn chờ từ hóa đơn đầu tiên!");
                                  } else {
                                    console.log('No orders found');
                                    toast.error("Không có hóa đơn nào!");
                                  }
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '8px 16px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  marginTop: 8,
                                  transition: 'all 0.2s'
                                }}
                              >
                                Tạo từ hóa đơn đầu tiên
                              </button>
                            </div>
                          );
                        }
                        
                        return pendingOrders.map((order: any) => (
                          <div key={order.id} style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(181, 157, 58, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#6b4f1d'
                          }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>Hóa đơn {order.orderNumber}</span>
                            <button 
                              onClick={() => showRestoreConfirmDialog(order.id)}
                              style={{
                                background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: 12,
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.3)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                          >
                            Lấy lại
                          </button>
                        </div>
                        ));
                      })()}
                      <div style={{ 
                        padding: '12px 16px', 
                        textAlign: 'right',
                        borderTop: '1px solid rgba(181, 157, 58, 0.1)'
                      }}>
                        <button 
                          onClick={() => setShowPendingOrders(false)}
                          style={{
                            background: '#fff',
                            color: '#6b4f1d',
                            border: '1px solid rgba(181, 157, 58, 0.3)',
                            borderRadius: 6,
                            padding: '6px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 13,
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(181, 157, 58, 0.1)';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = '#fff';
                          }}
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                    </>
                  )}

                  {/* Modal danh sách hóa đơn tại quầy */}
                  {showCompletedInvoices && (
                    <>
                      {/* Background overlay */}
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998
                      }} onClick={() => setShowCompletedInvoices(false)}></div>
                      
                      {/* Modal content */}
                      <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'linear-gradient(135deg, #f5f1e8 0%, #efe9d8 100%)',
                        border: '2px solid #d4c5a0',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        zIndex: 9999,
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '80%',
                        overflow: 'hidden',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {/* Header */}
                        <div style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid rgba(181, 157, 58, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'linear-gradient(90deg, #b59d3a 0%, #a08934 100%)',
                          color: 'white'
                        }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: 16,
                            textAlign: 'center'
                          }}>
                            🧾 Hóa đơn tại quầy
                          </div>
                          <button
                            onClick={() => setShowCompletedInvoices(false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              fontSize: 20,
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>

                        {/* Content */}
                        <div style={{
                          maxHeight: '500px',
                          overflowY: 'auto',
                          padding: '0'
                        }}>
                          {loading ? (
                            <div style={{
                              padding: '40px 20px',
                              textAlign: 'center',
                              color: '#8a7a2a'
                            }}>
                              ⏳ Đang tải...
                            </div>
                          ) : completedInvoices.length === 0 ? (
                            <div style={{
                              padding: '40px 20px',
                              textAlign: 'center',
                              color: '#8a7a2a',
                              fontSize: 14
                            }}>
                              Chưa có hóa đơn tại quầy nào
                              <br />
                              <small style={{ fontSize: 12, color: '#b59d3a' }}>
                                Các hóa đơn đã hoàn thành sẽ hiển thị ở đây
                              </small>
                            </div>
                          ) : (
                            completedInvoices.map((invoice: any) => (
                              <div key={invoice.idHoaDon} style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid rgba(181, 157, 58, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                color: '#6b4f1d'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <div style={{
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: '#8a6e23'
                                  }}>
                                    {invoice.maHoaDon}
                                  </div>
                                  <div style={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: invoice.phuongThucThanhToan === 'MOMO' ? '#d82d8b' : '#2d8a3e'
                                  }}>
                                    {invoice.phuongThucThanhToan === 'MOMO' ? '💳 MoMo' : '💰 Tiền mặt'}
                                  </div>
                                </div>
                                
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 13,
                                  color: '#9d8654'
                                }}>
                                  <span>Khách: {invoice.tenKhachHang || 'Khách lẻ'}</span>
                                  <span>Tổng: {(invoice.thanhTien || 0).toLocaleString()}đ</span>
                                </div>
                                
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                  color: '#b59d3a'
                                }}>
                                  <span>Trạng thái: {invoice.trangThai}</span>
                                  <span>{new Date(invoice.ngayTao).toLocaleString('vi-VN')}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        <div style={{
                          padding: '12px 20px',
                          borderTop: '1px solid rgba(181, 157, 58, 0.1)',
                          background: '#faf8f4',
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          <button
                            onClick={() => setShowCompletedInvoices(false)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#8a6e23',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 13,
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }} />
            </div>
            {/* Nút chọn sản phẩm và bảng giỏ hàng */}
            <div style={{ marginBottom: 24 }}>
              <button className={styles.productSelectorButton}
                onClick={() => setShowProductSelector(true)}>
                + Chọn sản phẩm
              </button>
              <div className={styles.cartContainer}>
                <div className={styles.cartTitle}>Giỏ hàng</div>
                {activeOrder && (
                  <CartList
                    cart={activeOrder?.cart || []}
                    products={productDetails.map(p => ({ id: p.idChiTietSanPham, soLuong: p.soLuong }))}
                    onRemoveAction={removeFromCart}
                    onQtyChange={(id, qty) => {
                      const prod = productDetails.find(p => p.idChiTietSanPham === id);
                      const cartItem = activeOrder?.cart?.find((item: CartItem) => item.idChiTietSanPham === id);
                      if (!prod || !cartItem) return;
                      let validQty = qty;
                      if (qty > prod.soLuong + cartItem.qty) {
                        validQty = prod.soLuong + cartItem.qty;
                        toast.error('Số lượng vượt quá cửa àng!');
                      }
                      setProductDetails(prev => prev.map(p =>
                        p.idChiTietSanPham === id
                          ? { ...p, soLuong: p.soLuong + cartItem.qty - validQty }
                          : p
                      ));
                      updateActiveOrder({
                        cart: (activeOrder?.cart || []).map((item: CartItem) =>
                          item.idChiTietSanPham === id ? { ...item, qty: validQty } : item
                        )
                      });
                    }}
                  />
                )}
              </div>
            </div>
            {/* Hai cột giao hàng và thanh toán */}
            <div className={styles.mainLayout}>
              {/* Cột trái: Thông tin giao hàng */}
              <div className={styles.shippingColumn}>
                {/* Checkbox giao hàng */}
                <div className={styles.shippingCheckbox}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!activeOrder?.isShipping}
                      onChange={e => updateActiveOrder({ isShipping: e.target.checked })}
                    />
                    Giao hàng
                  </label>
                </div>
                {/* Chỉ hiển thị form địa chỉ khi isShipping === true */}
                {activeOrder?.isShipping && (
                  <>
                    {activeOrder?.selectedCustomer && (
                      <div className={styles.customerCard}>
                        <div className={styles.customerInfo}>
                          <span className={styles.customerName}>
                            {activeOrder.selectedCustomer.tenKhachHang} ({activeOrder.selectedCustomer.maKhachHang})
                          </span>
                          <div className={styles.customerDetails}>
                            {activeOrder.selectedCustomer.soDienThoai} • {activeOrder.selectedCustomer.email}
                          </div>
                        </div>
                        <button onClick={handleRemoveCustomer} className={styles.removeCustomerButton}>×</button>
                      </div>
                    )}
                    {/* Địa chỉ giao hàng */}
                    {activeOrder?.selectedAddress && (
                      <div className={styles.addressCard}>
                        <div className={styles.addressTitle}>
                          <span role="img" aria-label="location">📍</span> {activeOrder.selectedAddress.ngoNgach}
                        </div>
                        <div className={styles.addressText}>
                          <span role="img" aria-label="city">🏡</span> {activeOrder.selectedAddress.quanHuyen}, {activeOrder.selectedAddress.thanhPho}
                        </div>
                        <div className={styles.addressText}>
                          <span role="img" aria-label="note">📝</span> Ghi chú: {activeOrder.selectedAddress.ghiChu}
                        </div>
                      </div>
                    )}
                    {/* Form nhập địa chỉ giao hàng */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Họ tên</label>
                        <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }} value={activeOrder?.shippingInfo?.name ?? ''} placeholder="Họ tên"
                          onChange={e => updateActiveOrder({ shippingInfo: { ...activeOrder.shippingInfo, name: e.target.value } })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Số điện thoại</label>
                        <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }} value={activeOrder?.shippingInfo?.phone ?? ''} placeholder="Số điện thoại"
                          onChange={e => updateActiveOrder({ shippingInfo: { ...activeOrder.shippingInfo, phone: e.target.value } })} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      {(() => { console.log('shippingInfo:', activeOrder?.shippingInfo); return null; })()}
                      <AddressSelector
                        key={
                          (activeOrder?.shippingInfo?.city || '') +
                          '-' +
                          (activeOrder?.shippingInfo?.district || '') +
                          '-' +
                          (activeOrder?.shippingInfo?.ward || '')
                        }
                        value={{
                          city: activeOrder?.shippingInfo?.city || '',
                          district: activeOrder?.shippingInfo?.district || '',
                          ward: activeOrder?.shippingInfo?.ward || '',
                        }}
                        onChange={(val) => {
                          console.log('AddressSelector onChange:', val);
                          updateActiveOrder({ shippingInfo: { ...activeOrder.shippingInfo, ...val } })
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Địa chỉ cụ thể</label>
                      <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }} value={activeOrder?.shippingInfo?.address ?? ''} placeholder="Địa chỉ cụ thể"
                        onChange={e => updateActiveOrder({ shippingInfo: { ...activeOrder.shippingInfo, address: e.target.value } })} />
                    </div>
                    {/* Bỏ Trạng thái giao hàng trên POS */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Ghi chú cho người vận chuyển</label>
                      <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15 }} value={activeOrder?.shippingInfo?.note ?? ''} placeholder="Ghi chú cho người vận chuyển"
                        onChange={e => updateActiveOrder({ shippingInfo: { ...activeOrder.shippingInfo, note: e.target.value } })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
                      <button 
                        title="Tự động điền thông tin khách hàng"
                        style={{ 
                          width: 50, 
                          height: 50, 
                          background: '#fff', 
                          color: '#4caf50', 
                          border: '1px solid #4caf50', 
                          borderRadius: '50%', 
                          fontSize: 24, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.background = '#fff';
                        }}
                        onClick={() => {
                          if (!activeOrder?.selectedCustomer) return;
                          const defaultAddr = activeOrder.selectedCustomer.danhSachDiaChi?.find((addr: DiaChiDTO) => addr.macDinh === 'Có') || activeOrder.selectedCustomer.danhSachDiaChi?.[0];
                          updateActiveOrder({
                            shippingInfo: {
                              ...activeOrder.shippingInfo,
                              name: activeOrder.selectedCustomer.tenKhachHang || '',
                              phone: activeOrder.selectedCustomer.soDienThoai || '',
                              city: defaultAddr?.thanhPho || '',
                              district: defaultAddr?.quanHuyen || '',
                              ward: defaultAddr?.xaPhuong || '',
                              address: defaultAddr?.ngoNgach || '',
                              note: defaultAddr?.ghiChu || ''
                            }
                          });
                        }}
                      >
                        🔄
                      </button>
                      <button 
                        title="Tạo địa chỉ mới"
                        style={{ 
                          width: 50, 
                          height: 50, 
                          background: '#fff', 
                          color: '#2196f3', 
                          border: '1px solid #2196f3', 
                          borderRadius: '50%', 
                          fontSize: 24, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.background = 'rgba(33, 150, 243, 0.1)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.background = '#fff';
                        }}
                        onClick={() => {
                          setNewAddress({
                            name: activeOrder?.selectedCustomer?.tenKhachHang || '',
                            phone: activeOrder?.selectedCustomer?.soDienThoai || '',
                            city: '',
                            district: '',
                            ward: '',
                            address: '',
                            note: '',
                            macDinh: false
                          });
                          setShowCreateAddressModal(true);
                        }}
                      >
                        ➕
                      </button>
                    </div>
                    {/* Danh sách địa chỉ */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Danh sách địa chỉ:</div>
                      <div style={{ fontSize: 15, color: '#333' }}>
                        {activeOrder?.selectedCustomer?.danhSachDiaChi?.map((addr: DiaChiDTO, idx: number) => (
                          <div key={addr.idDiaChi} style={{ marginBottom: 4, padding: '4px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span role="img" aria-label="location">📍</span> {addr.ngoNgach}, {addr.xaPhuong}, {addr.quanHuyen}, {addr.thanhPho} {addr.macDinh === 'Có' && <b>(Mặc định)</b>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* Cột phải: Thông tin thanh toán */}
              <div className={styles.paymentColumn}>
                {/* Chọn khách hàng */}
                <div style={{ marginBottom: 16 }}>
              <CustomerSelector
                    selectedCustomer={activeOrder?.selectedCustomer}
                onCustomerSelectAction={handleSelectCustomer}
                onAddressSelectAction={handleSelectAddress}
                    selectedAddress={activeOrder?.selectedAddress}
                    isShipping={activeOrder?.isShipping}
                  />
                  {/* Combobox chọn phiếu giảm giá */}
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontWeight: 600 }}>Chọn phiếu giảm giá:</label>
                    <select
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb', marginTop: 4 }}
                      value={activeOrder?.appliedVoucher?.maPhieuGiamGia || ''}
                      onChange={e => {
                        const code = e.target.value;
                        const voucher = vouchers.find(v => v.maPhieuGiamGia === code) || null;
                        handleSelectVoucher(voucher);
                        // Kiểm tra điều kiện áp dụng voucher FREE_SHIP
                        if (voucher && voucher.kieuGiamGia === 'FREE_SHIP') {
                          const total = activeOrder?.cart?.reduce((sum: number, item: CartItem) => sum + item.gia * item.qty, 0) || 0;
                          if (total >= voucher.giaTriToiThieu) {
                            // Chỉ set phí ship về 0 khi voucher thực sự áp dụng được
                          updateActiveOrder({ shippingFee: 0 });
                          } else {
                            // Nếu không áp dụng được, giữ nguyên phí ship
                            if (activeOrder?.selectedAddress) {
                              const fee = calculateShippingFee(activeOrder.selectedAddress);
                              updateActiveOrder({ shippingFee: fee });
                            }
                          }
                        } else if (activeOrder?.selectedAddress) {
                          const fee = calculateShippingFee(activeOrder.selectedAddress);
                          updateActiveOrder({ shippingFee: fee });
                        }
                      }}
                    >
                      <option value=''>-- Không áp dụng --</option>
                      {vouchers
                        .filter(v => v.soLuong > 0 && v.trangThai === 'Đang diễn ra')
                        .sort((a, b) => {
                          // Ưu tiên giảm giá cao nhất (theo giá trị tối đa hoặc phần trăm), sau đó đến số lượng còn lại nhiều nhất
                          const aDiscount = a.kieuGiamGia === 'PERCENT' ? (a.phanTramGiamGia * 1000000 + a.giaTriToiDa) : a.giaTriToiDa;
                          const bDiscount = b.kieuGiamGia === 'PERCENT' ? (b.phanTramGiamGia * 1000000 + b.giaTriToiDa) : b.giaTriToiDa;
                          if (bDiscount !== aDiscount) return bDiscount - aDiscount;
                          return b.soLuong - a.soLuong;
                        })
                        .map(v => (
                          <option key={v.maPhieuGiamGia} value={v.maPhieuGiamGia}>
                            {v.tenPhieuGiamGia} ({v.maPhieuGiamGia})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                {/* Địa chỉ giao hàng chỉ hiện khi đã chọn khách hàng và có địa chỉ */}
                
                {/* Nếu đã chọn khách hàng nhưng không có địa chỉ thì báo */}
                {activeOrder?.selectedCustomer && (!activeOrder.selectedCustomer.danhSachDiaChi || activeOrder.selectedCustomer.danhSachDiaChi.length === 0) && (
                  <div style={{ color: '#e57373', marginBottom: 8 }}>Khách hàng chưa có địa chỉ giao hàng.</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <label style={{ fontWeight: 600 }}>Giao hàng:</label>
                  <input type="checkbox" checked={!!activeOrder?.isShipping} style={{ width: 20, height: 20 }}
                    onChange={e => updateActiveOrder({ isShipping: e.target.checked })} />
                  <span style={{ marginLeft: 8, color: '#1976d2', fontWeight: 600 }}></span>
                </div>
                {activeOrder && (
                  <PaymentSummary
                    cart={activeOrder.cart}
                    voucher={activeOrder.appliedVoucher}
                    shipping={activeOrder.shippingFee || 0}
                    originalShipping={activeOrder.originalShippingFee || 0}
                    paymentMethod={activeOrder.paymentMethod}
                  />
                )}
                {activeOrder && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <button
                      className={`${styles.selectButton} ${activeOrder.paymentMethod === 'TIEN_MAT' ? styles.active : ''}`}
                      style={{ flex: 1, minWidth: '100px' }}
                      onClick={() => updateActiveOrder({ paymentMethod: 'TIEN_MAT' })}
                    >
                      💵 Tiền mặt
                    </button>
                    <button
                      className={`${styles.selectButton} ${activeOrder.paymentMethod === 'MOMO' ? styles.active : ''}`}
                      style={{ flex: 1, minWidth: '100px', backgroundColor: activeOrder.paymentMethod === 'MOMO' ? '#d82d8b' : '', color: activeOrder.paymentMethod === 'MOMO' ? 'white' : '' }}
                      onClick={() => updateActiveOrder({ paymentMethod: 'MOMO' })}
                    >
                      💳 MoMo
                    </button>
                  </div>
                )}
                {/* Hiển thị nút thanh toán MoMo nếu chọn phương thức MoMo */}
                {activeOrder.paymentMethod === 'MOMO' && (
                  <div style={{ marginBottom: 16 }}>
                    {/* Nút thanh toán MoMo chính */}
                    <button
                      onClick={() => handleMomoDirectPayment()}
                      style={{
                        width: '100%',
                        padding: '16px',
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
                        marginBottom: 8
                      }}
                      disabled={loading}
                    >
                      {loading ? '⏳ Đang xử lý...' : `💳 Thanh toán MoMo (${(activeOrder.cart.reduce((sum: number, item: CartItem) => sum + item.gia * item.qty, 0) - (activeOrder.appliedVoucher?.giaTriToiDa || 0) + (activeOrder.shippingFee || 0)).toLocaleString()}đ)`}
                    </button>
                    
                    {/* Nút kiểm tra lại nếu có giao dịch pending */}
                    {(activeOrder as any).pendingMomoOrderId && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={async () => {
                            const momoOrderId = (activeOrder as any).pendingMomoOrderId;
                            try {
                              setLoading(true);
                              const statusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
                              const statusResult = await statusResponse.json();
                              
                              if (statusResult.success && statusResult.data) {
                                const transactionStatus = statusResult.data.trangThai;
                                if (transactionStatus === 'Thành công') {
                                  toast.success('💳 Thanh toán MoMo thành công!');
                                  await handleMomoReturnSuccess(statusResult.data, activeOrder);
                                } else if (transactionStatus === 'Thất bại') {
                                  toast.error('❌ Thanh toán MoMo thất bại!');
                                  updateActiveOrder({ pendingMomoOrderId: null, paymentMethod: null });
                                } else {
                                  toast.info(`⏳ Trạng thái: ${transactionStatus}`);
                                }
                              } else {
                                toast.error('❌ Không thể kiểm tra trạng thái!');
                              }
                            } catch (error) {
                              console.error('Error checking status:', error);
                              toast.error('Lỗi kiểm tra trạng thái!');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                          disabled={loading}
                        >
                          🔄 Kiểm tra lại
                        </button>
                        
                        {/* Nút kiểm tra lại trạng thái MoMo */}
                        <button
                          onClick={async () => {
                            const momoOrderId = (activeOrder as any).pendingMomoOrderId;
                            try {
                              setLoading(true);
                              const statusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
                              const statusResult = await statusResponse.json();
                              console.log('Kiểm tra lại MoMo status:', statusResult);
                              
                              if (statusResult.success && statusResult.data?.trangThai === 'Thành công') {
                                toast.success('💳 Thanh toán MoMo thành công! Đang tạo hóa đơn...');
                                await handleMomoReturnSuccess(statusResult.data, activeOrder);
                              } else {
                                toast.info(`Trạng thái hiện tại: ${statusResult.data?.trangThai || statusResult.status}`);
                              }
                            } catch (error) {
                              console.error('Check status error:', error);
                              toast.error('Lỗi kiểm tra trạng thái!');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                          disabled={loading}
                        >
                          🔍 Kiểm tra MoMo
                        </button>
                        
                        {/* Nút test thành công cho dev */}
                        <button
                          onClick={async () => {
                            const momoOrderId = (activeOrder as any).pendingMomoOrderId;
                            try {
                              setLoading(true);
                              const testResponse = await fetch(`http://localhost:8080/api/momo/test-success/${momoOrderId}`, {
                                method: 'POST'
                              });
                              const testResult = await testResponse.json();
                              if (testResult.success) {
                                toast.success('🧪 Test thành công!');
                                await handleMomoReturnSuccess(testResult.data, activeOrder);
                              } else {
                                toast.error('❌ Test thất bại!');
                              }
                            } catch (error) {
                              console.error('Test error:', error);
                              toast.error('Lỗi test!');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                          disabled={loading}
                        >
                          🧪 Test OK
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Nút xác nhận hoàn thành và xuất PDF ngoài giao diện chính */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => {
                      if (activeOrder.paymentMethod === 'MOMO') {
                        toast.error("Vui lòng thanh toán MoMo trước khi hoàn thành!");
                        return;
                      }
                      setShowDoneConfirm(true);
                    }}
                    className={styles.selectButton}
                    style={{ flex: 1 }}
                  >
                    Xác nhận hoàn thành
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal chọn sản phẩm */}
      {showProductSelector && (
        <ProductSelector
          products={productDetails}
          onSelectAction={(product, qty) => {
            addToCart(product, qty);
            setShowProductSelector(false);
          }}
          onCloseAction={() => setShowProductSelector(false)}
        />
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
                <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: 400,
            textAlign: 'center'
                }}>
            <h3>Xác nhận xóa</h3>
            <p style={{ marginBottom: 12 }}>Bạn có chắc chắn muốn xóa hóa đơn này?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <button onClick={confirmDeleteOrder} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}>Xóa</button>
              <button onClick={cancelDeleteOrder} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}>Hủy</button>
                  </div>
                  </div>
                  </div>
      )}

      {/* Modal xác nhận chuyển hóa đơn chờ */}
      {showPendingConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
            padding: 24,
            borderRadius: 16,
            maxWidth: 450,
            textAlign: 'center',
            border: '1px solid rgba(181, 157, 58, 0.1)',
            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 20, 
              fontWeight: 700,
              color: '#6b4f1d'
            }}>Xác nhận đưa hóa đơn vào chờ</h3>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: 16,
              color: '#6b4f1d',
              lineHeight: 1.5
            }}>
              Bạn có chắc chắn muốn đưa hóa đơn này vào danh sách chờ?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={moveToPendingOrders}
                disabled={loading}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button 
                onClick={cancelPendingConfirm}
                disabled={loading}
                style={{ 
                  padding: '12px 24px', 
                  background: '#fff', 
                  color: '#6b4f1d', 
                  border: '1px solid rgba(181, 157, 58, 0.3)', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận lấy lại hóa đơn chờ */}
      {showRestoreConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
            padding: 24,
            borderRadius: 16,
            maxWidth: 450,
            textAlign: 'center',
            border: '1px solid rgba(181, 157, 58, 0.1)',
            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 20, 
              fontWeight: 700,
              color: '#6b4f1d'
            }}>Xác nhận lấy lại hóa đơn</h3>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: 16,
              color: '#6b4f1d',
              lineHeight: 1.5
            }}>
              Bạn có chắc chắn muốn lấy lại hóa đơn này từ danh sách chờ?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={confirmRestoreOrder}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)'
                }}
              >
                Xác nhận
              </button>
              <button 
                onClick={cancelRestoreConfirm}
                style={{ 
                  padding: '12px 24px', 
                  background: '#fff', 
                  color: '#6b4f1d', 
                  border: '1px solid rgba(181, 157, 58, 0.3)', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Hủy
              </button>
                  </div>
                  </div>
                  </div>
      )}



      {/* Modal in hóa đơn */}
      {lastOrderForPrint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            width: 'auto',
            minWidth: 820,
            boxSizing: 'border-box',
            overflow: 'visible',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            </div>
            <div ref={invoiceRef}>
              <InvoicePreview order={lastOrderForPrint.order} maHoaDon={lastOrderForPrint.maHoaDon} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <button
                  onClick={() => {
                  // Logic in hóa đơn
                  window.print();
                }}
                style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
              >
                🖨️ In hóa đơn
              </button>
              <button
                onClick={async () => {
                  console.log('invoiceRef.current:', invoiceRef.current);
                  if (invoiceRef.current) {
                    const html2pdf = (await import('html2pdf.js')).default;
                    html2pdf().from(invoiceRef.current).save('hoa-don.pdf');
                  }
                }}
                style={{ padding: '8px 16px', background: '#43a047', color: 'white', border: 'none', borderRadius: 4 }}
              >
                📄 Xuất hóa đơn PDF
              </button>
              <button
                onClick={() => {
                  if (lastOrderForPrint) {
                    localStorage.setItem('lastOrderForPrint', JSON.stringify(lastOrderForPrint));
                    window.open('/XuatHoaDon', '_blank');
                  }
                }}
                style={{ padding: '8px 16px', background: '#ff9800', color: 'white', border: 'none', borderRadius: 4 }}
              >
                Mở hóa đơn toàn màn hình
              </button>
              <button 
                onClick={() => setLastOrderForPrint(null)}
                style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
                >
                Đóng
                </button>
              </div>
                </div>
            </div>
      )}

      {showCreateAddressModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', 
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)', 
            borderRadius: 16, 
            padding: 24, 
            minWidth: 450, 
            maxWidth: 500, 
            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)',
            border: '1px solid rgba(181, 157, 58, 0.1)',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              marginBottom: 20, 
              fontWeight: 700, 
              fontSize: 20, 
              textAlign: 'center', 
              letterSpacing: 0.5,
              color: '#6b4f1d'
            }}>Tạo địa chỉ mới</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={e => { e.preventDefault(); }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 14, color: '#6b4f1d' }}>Họ tên</label>
                  <input style={{ 
                    width: '100%', 
                    padding: 10, 
                    borderRadius: 8, 
                    border: '1px solid rgba(181, 157, 58, 0.2)', 
                    fontSize: 14,
                    background: '#fff',
                    transition: 'all 0.2s'
                  }} 
                  value={newAddress.name} 
                  onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#b59d3a'}
                  onBlur={e => e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)'}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 14, color: '#6b4f1d' }}>Số điện thoại</label>
                  <input style={{ 
                    width: '100%', 
                    padding: 10, 
                    borderRadius: 8, 
                    border: '1px solid rgba(181, 157, 58, 0.2)', 
                    fontSize: 14,
                    background: '#fff',
                    transition: 'all 0.2s'
                  }} 
                  value={newAddress.phone} 
                  onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#b59d3a'}
                  onBlur={e => e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 14, color: '#6b4f1d' }}>Địa chỉ</label>
                <AddressSelector
                  value={{
                    city: newAddress.city,
                    district: newAddress.district,
                    ward: newAddress.ward,
                  }}
                  onChange={(val) => setNewAddress({ ...newAddress, ...val })}
                />
              </div>
              <div>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 14, color: '#6b4f1d' }}>Địa chỉ cụ thể</label>
                <input style={{ 
                  width: '100%', 
                  padding: 10, 
                  borderRadius: 8, 
                  border: '1px solid rgba(181, 157, 58, 0.2)', 
                  fontSize: 14,
                  background: '#fff',
                  transition: 'all 0.2s'
                }} 
                value={newAddress.address} 
                onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#b59d3a'}
                onBlur={e => e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)'}
                />
              </div>
              {/* Bỏ Trạng thái giao hàng trong modal thêm địa chỉ */}
              <div>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 14, color: '#6b4f1d' }}>Ghi chú</label>
                <input style={{ 
                  width: '100%', 
                  padding: 10, 
                  borderRadius: 8, 
                  border: '1px solid rgba(181, 157, 58, 0.2)', 
                  fontSize: 14,
                  background: '#fff',
                  transition: 'all 0.2s'
                }} 
                value={newAddress.note} 
                onChange={e => setNewAddress({ ...newAddress, note: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#b59d3a'}
                onBlur={e => e.target.style.borderColor = 'rgba(181, 157, 58, 0.2)'}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input type="checkbox" 
                  checked={newAddress.macDinh} 
                  onChange={e => setNewAddress({ ...newAddress, macDinh: e.target.checked })} 
                  style={{ 
                    width: 16, 
                    height: 16, 
                    accentColor: '#b59d3a', 
                    borderRadius: 3, 
                    marginRight: 6 
                  }} 
                />
                <label style={{ 
                  fontWeight: 600, 
                  userSelect: 'none', 
                  fontSize: 14,
                  color: '#6b4f1d',
                  cursor: 'pointer'
                }}>Đặt làm mặc định</label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '12px 0', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.2)';
                }}
                  onClick={async () => {
                    if (!activeOrder?.selectedCustomer) return;
                    const diaChiMoi = {
                      thanhPho: getProvinceNameByIdOrName(newAddress.city),
                      quanHuyen: getDistrictNameByIdOrName(newAddress.city, newAddress.district),
                      xaPhuong: getWardNameByIdOrName(newAddress.city, newAddress.district, newAddress.ward),
                      ngoNgach: newAddress.address,
                      ghiChu: newAddress.note,
                      macDinh: newAddress.macDinh ? 'Có' : 'Không',
                    };
                    try {
                      const response = await fetch(`http://localhost:8080/khach-hang/${activeOrder.selectedCustomer.idKhachHang}/dia-chi`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(diaChiMoi),
                      });
                      if (response.ok) {
                        await reloadSelectedCustomerAddresses(activeOrder.selectedCustomer.idKhachHang);
                        setShowCreateAddressModal(false);
                        setNewAddress({ name: '', phone: '', city: '', district: '', ward: '', address: '', note: '', macDinh: false });
                        setAddressSuccessMessage('Tạo địa chỉ mới thành công!');
                        setTimeout(() => setAddressSuccessMessage(null), 2500);
                      } else {
                        alert('Lưu địa chỉ thất bại!');
                      }
                    } catch (error) {
                      alert('Có lỗi khi lưu địa chỉ!');
                    }
                  }}
                >
                  Lưu
                </button>
                <button type="button" style={{ 
                  flex: 1, 
                  background: '#fff', 
                  color: '#6b4f1d', 
                  border: '1px solid rgba(181, 157, 58, 0.3)', 
                  borderRadius: 8, 
                  padding: '12px 0', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(181, 157, 58, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                  onClick={() => setShowCreateAddressModal(false)}
                >Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addressSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#4caf50',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontWeight: 600,
          fontSize: 16,
          zIndex: 4000
        }}>
          {addressSuccessMessage}
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Modal xác nhận hoàn thành */}
      {showDoneConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
            padding: 24,
            borderRadius: 16,
            maxWidth: 450,
            textAlign: 'center',
            border: '1px solid rgba(181, 157, 58, 0.1)',
            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 20, 
              fontWeight: 700,
              color: '#6b4f1d'
            }}>Xác nhận hoàn thành</h3>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: 16,
              color: '#6b4f1d',
              lineHeight: 1.5
            }}>
              Bạn có muốn xác nhận hoàn thành không?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => { setShowDoneConfirm(false); setShowExportConfirm(true); }}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)'
                }}
              >
                Xác nhận
              </button>
              <button 
                onClick={() => setShowDoneConfirm(false)}
                style={{ 
                  padding: '12px 24px', 
                  background: '#fff', 
                  color: '#6b4f1d', 
                  border: '1px solid rgba(181, 157, 58, 0.3)', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xuất PDF */}
      {showExportConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #fffbe6 100%)',
            padding: 24,
            borderRadius: 16,
            maxWidth: 450,
            textAlign: 'center',
            border: '1px solid rgba(181, 157, 58, 0.1)',
            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 20, 
              fontWeight: 700,
              color: '#6b4f1d'
            }}>Xuất hóa đơn PDF</h3>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: 16,
              color: '#6b4f1d',
              lineHeight: 1.5
            }}>
              Bạn có muốn xuất hóa đơn PDF không?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                              <button 
                onClick={() => { 
                  setShowExportConfirm(false); 
                  handleDone(true); 
                }}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(181, 157, 58, 0.2)'
                }}
              >
                Có, xuất PDF
              </button>
              <button 
                onClick={() => { 
                  setShowExportConfirm(false); 
                  handleDone(false); 
                }}
                style={{ 
                  padding: '12px 24px', 
                  background: '#fff', 
                  color: '#6b4f1d', 
                  border: '1px solid rgba(181, 157, 58, 0.3)', 
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Không, chỉ xác nhận
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default function POSPage() {
  const [activeMenu, setActiveMenu] = React.useState('pos');
  return (
    <AdminLayout activeMenu="pos" onMenuChangeAction={setActiveMenu} pageTitle="Bán hàng tại quầy">
      <POSPageInner />
    </AdminLayout>
  );
}