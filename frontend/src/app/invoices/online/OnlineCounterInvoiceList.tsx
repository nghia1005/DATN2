import React, { useState, useEffect } from "react";
import axios from "axios";
import CartList from "../../pos/CartList";
import ProductSelector from "../../pos/ProductSelector";
import { ProductDetail } from '../../pos/types';
import { v4 as uuidv4 } from "uuid";
import MuiDateTimeInput from '../../../component/MuiDateTimeInput';
import { toast } from 'react-toastify';

// 1. Thêm trạng thái 'Chờ xác nhận' và 'Đã hủy' vào danh sách trạng thái
const STATUS_OPTIONS = [
    { label: "📄 Tất cả", value: "ALL", color: "#6b7280" },
    { label: "⏰ Chờ xác nhận", value: "Chờ xác nhận", color: "#f59e0b" },
    { label: "✓ Đã xác nhận", value: "Đã xác nhận", color: "#3b82f6" },
    { label: "🚛 Đang vận chuyển", value: "Đang vận chuyển", color: "#f97316" },
    { label: "✓ Giao hàng thành công", value: "Giao hàng thành công", color: "#10b981" },
    { label: "✗ Giao hàng thất bại", value: "Giao hàng thất bại", color: "#ef4444" },
    { label: "✗ Đã hủy", value: "Đã hủy", color: "#6b7280" },
];

// 2. Sửa màu trạng thái - mỗi trạng thái có màu riêng
const getStatusColor = (status: string) => {
    switch (status) {
        case "Chờ xác nhận": return "#f59e0b"; // Màu cam
        case "Đã xác nhận": return "#3b82f6"; // Màu xanh dương
        case "Đang vận chuyển": return "#f97316"; // Màu cam đậm
        case "Giao hàng thành công": return "#10b981"; // Màu xanh lá
        case "Giao hàng thất bại": return "#ef4444"; // Màu đỏ
        case "Đã hủy": return "#6b7280"; // Màu xám
        default: return "#6b7280"; // Màu xám mặc định
    }
};

// Hàm chuyển đổi trạng thái thành icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case "Chờ xác nhận": return "⏰";
        case "Đã xác nhận": return "✓";
        case "Đang vận chuyển": return "🚛";
        case "Giao hàng thành công": return "✓";
        case "Giao hàng thất bại": return "✗";
        case "Đã hủy": return "✗";
        default: return "?";
    }
};

const getFilterButtonColor = (status: string) => {
    return "#1976d2"; // Tất cả đều màu xanh dương
};

    // Mapping trạng thái hiện tại sang trạng thái tiếp theo và label nút
    const statusTransitions: Record<string, { next: string, label: string, color: string }> = {
        "Đã xác nhận": { next: "Đang vận chuyển", label: "🚚", color: "#1976d2" },
        "Đang vận chuyển": { next: "Giao hàng thành công", label: "✓", color: "#10b981" },
        // Nếu muốn cho phép chuyển sang thất bại, có thể thêm nút riêng hoặc thêm dòng dưới:
        // "Đang vận chuyển": { next: "Giao hàng thất bại", label: "✗", color: "#ef4444" },
        // "Giao hàng thành công": { next: "", label: "", color: "#4caf50" },
        // "Giao hàng thất bại": { next: "", label: "", color: "#e74c3c" },
    };

const OnlineCounterInvoiceList = () => {
    const [isClient, setIsClient] = useState(false);
    const [activeStatus, setActiveStatus] = useState("ALL");
    
    const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sortNewest, setSortNewest] = useState(true); // Mặc định sắp xếp mới nhất lên đầu
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
    const [selectedYear, setSelectedYear] = useState<Date | null>(null);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
    const [deleteQuantity, setDeleteQuantity] = useState('');
    const [showEditAddressModal, setShowEditAddressModal] = useState(false);
    const [editAddress, setEditAddress] = useState({
      tenNguoiNhan: '',
      soDienThoai: '',
      diaChiNhanHang: '',
      tinhThanh: '',
      quanHuyen: '',
      phuongXa: '',
      ngoNgach: ''
    });
    const [showEditAddressSuccess, setShowEditAddressSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmData, setConfirmData] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    // Thêm các state quản lý địa chỉ động
    const [addressData, setAddressData] = useState<any[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
    const [filteredWards, setFilteredWards] = useState<any[]>([]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        axios.get("http://localhost:8080/api/hoadon")
            .then(res => {
                if (!Array.isArray(res.data)) {
                    setOrders([]);
                    return;
                }
                
                const ordersWithId = res.data.map((order: any) => ({
                    ...order,
                    id: order.idHoaDon
                }));
                
                // Lọc chỉ hóa đơn online
                const onlineOrders = ordersWithId.filter((order: any) => order.loaiDon === 'Online');
                
                setOrders(sortOrdersByDate(onlineOrders ?? []));
            })
            .catch((error) => {
                setOrders([]);
            });
    }, []);

    // Lấy danh sách sản phẩm khi mở modal
    useEffect(() => {
      if (showAddProductModal) {
        fetch('/api/chi-tiet-san-pham/hien-thi')
          .then(res => res.json())
          .then(data => setProductDetails(data))
          .catch(() => setProductDetails([]));
      }
    }, [showAddProductModal]);

    const sortOrdersByDate = (ordersList: any[]) => {
        return [...ordersList].sort((a, b) => {
            const dateA = new Date(a.ngayTao).getTime();
            const dateB = new Date(b.ngayTao).getTime();
            return sortNewest ? dateB - dateA : dateA - dateB;
        });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmData({ title, message, onConfirm });
        setShowConfirmModal(true);
    };

    // Khi chọn hóa đơn, lấy chi tiết
    const handleSelectOrder = async (code: string, orderFromList: any) => {
        setSelectedOrderCode(code);
        setLoadingDetail(true);

        let id = orderFromList.idHoaDon;
        if (!id || isNaN(Number(id))) {
            toast.error('Không tìm thấy ID số của hóa đơn!');
            setSelectedOrder(null);
            setLoadingDetail(false);
            return;
        }
        try {
            const resOrder = await fetch(`http://localhost:8080/api/hoadon/${id}`);
            if (!resOrder.ok) throw new Error('Không tìm thấy hóa đơn!');
            const orderData = await resOrder.json();
            const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${id}`);
            const chiTietList = await resDetails.json();
            setSelectedOrder({ ...orderData, chiTiet: chiTietList });
        } catch (e) {
            setSelectedOrder(null);
            toast.error('Không tìm thấy hóa đơn!');
        }
        setLoadingDetail(false);
    };

    // Hàm lấy hóa đơn chờ lên POS
    const handleBringToPOS = async (order: any) => {
        // Hiển thị confirm modal
        const confirmMessage = `Bạn có chắc chắn muốn đưa đơn hàng ${order.maHoaDon} về POS để xử lý?`;
        showConfirm('Đưa về POS', confirmMessage, async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/hoadon/ma/${order.maHoaDon}`);
                const orderData = res.data;
                // Lưu vào localStorage để POS lấy lại
                localStorage.setItem('pendingOrderToPOS', JSON.stringify(orderData));
                // Chuyển hướng sang POS
                window.location.href = '/dashboard/pos';
            } catch (e) {
                toast.error('Không lấy được chi tiết hóa đơn!');
            }
        });
    };

    // Hàm xác nhận đơn hàng (chuyển sang Chờ xác nhận)
    const handleConfirmOrder = async () => {
        if (!selectedOrder) return;
        
        // Hiển thị confirm modal
        const confirmMessage = `Bạn có chắc chắn muốn xác nhận đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id}?`;
        showConfirm('Xác nhận đơn hàng', confirmMessage, async () => {
            try {
                console.log('=== DEBUG: Bắt đầu xác nhận đơn hàng ===');
                console.log('Order ID:', selectedOrder.idHoaDon || selectedOrder.id);
                console.log('Current status:', selectedOrder.trangThai);
                console.log('New status: Đã xác nhận');
                
                console.log('=== DEBUG: Making API call to update status ===');
                console.log('URL:', `http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon || selectedOrder.id}`);
                console.log('Method: PUT');
                console.log('Headers:', { 'Content-Type': 'application/json' });
                console.log('Body:', JSON.stringify({
                    idHoaDon: selectedOrder.idHoaDon || selectedOrder.id,
                    trangThai: 'Đã xác nhận'
                }));
                
                const response = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon || selectedOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idHoaDon: selectedOrder.idHoaDon || selectedOrder.id,
                        trangThai: 'Đã xác nhận'
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
                }
                
                const responseData = await response.json();
                toast.success('Đã xác nhận đơn hàng!');
                // Chuyển filter sang Đã xác nhận
                setActiveStatus('Đã xác nhận');
                // Ẩn chi tiết hóa đơn
                setSelectedOrder(null);
                // Reload danh sách hóa đơn
                axios.get('http://localhost:8080/api/hoadon')
                    .then(res => {
                        const ordersWithId = res.data.map((order: any) => ({ ...order, id: order.idHoaDon }));
                        // Lọc chỉ hóa đơn online
                        const onlineOrders = ordersWithId.filter((order: any) => order.loaiDon === 'Online');
                        setOrders(sortOrdersByDate(onlineOrders));
                    })
                    .catch((error) => {
                        setOrders([]);
                    });
            } catch (e) {
                toast.error('Xác nhận đơn hàng thất bại!');
            }
        });
    };

    // Hàm đổi trạng thái tổng quát
    const handleChangeStatus = async (newStatus: string) => {
        if (!selectedOrder) return;
        
        // Tạo message confirm phù hợp với từng trạng thái
        let confirmMessage = '';
        let confirmTitle = '';
        
        switch (newStatus) {
            case 'Đã xác nhận':
                confirmTitle = 'Xác nhận đơn hàng';
                confirmMessage = `Bạn có chắc chắn muốn xác nhận đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id}?\n\n⚠️ Lưu ý: Số lượng sản phẩm sẽ được trừ khỏi kho khi xác nhận đơn hàng.`;
                break;
            case 'Đang vận chuyển':
                confirmTitle = 'Bắt đầu vận chuyển';
                confirmMessage = `Bạn có chắc chắn muốn chuyển đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id} sang trạng thái "Đang vận chuyển"?`;
                break;
            case 'Giao hàng thành công':
                confirmTitle = 'Xác nhận giao hàng thành công';
                confirmMessage = `Bạn có chắc chắn muốn xác nhận đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id} đã được giao thành công?`;
                break;
            case 'Giao hàng thất bại':
                confirmTitle = 'Xác nhận giao hàng thất bại';
                confirmMessage = `Bạn có chắc chắn muốn xác nhận đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id} giao hàng thất bại?\n\nSố lượng sản phẩm sẽ được hoàn trả về kho.`;
                break;
            case 'Đã hủy':
                confirmTitle = 'Xác nhận hủy đơn hàng';
                confirmMessage = `Bạn có chắc chắn muốn hủy đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id}?\n\nSố lượng sản phẩm sẽ được hoàn trả về kho.`;
                break;
            default:
                confirmMessage = `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id} thành "${newStatus}"?`;
        }
        
        // Hiển thị confirm modal
        showConfirm(confirmTitle, confirmMessage, async () => {
            try {
                // Loại bỏ trường chiTiet nếu có
                const { chiTiet, ...orderToSend } = selectedOrder;
                
                const response = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon || selectedOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...orderToSend,
                        trangThai: newStatus
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
                }
                
                const responseData = await response.json();
                
                // Hiển thị thông báo phù hợp với trạng thái
                if (newStatus === 'Đã hủy' || newStatus === 'Giao hàng thất bại') {
                    toast.success(`Đã cập nhật trạng thái thành "${newStatus}" và hoàn trả số lượng sản phẩm về kho!`);
                } else if (newStatus === 'Đã xác nhận') {
                    toast.success(`Đã cập nhật trạng thái thành "${newStatus}" và trừ số lượng sản phẩm khỏi kho!`);
                } else {
                    toast.success(`Đã cập nhật trạng thái thành "${newStatus}"!`);
                }
                
                setShowSuccessBanner(true);
                setTimeout(() => setShowSuccessBanner(false), 2000);
                setActiveStatus(newStatus);
                setSelectedOrder(null);
                // Reload danh sách hóa đơn
                axios.get('http://localhost:8080/api/hoadon')
                    .then(res => {
                        const ordersWithId = res.data.map((order: any) => ({ ...order, id: order.idHoaDon }));
                        // Lọc chỉ hóa đơn online
                        const onlineOrders = ordersWithId.filter((order: any) => order.loaiDon === 'Online');
                        setOrders(sortOrdersByDate(onlineOrders));
                    })
                    .catch((error) => {
                        setOrders([]);
                    });
            } catch (e) {
                toast.error('Cập nhật trạng thái thất bại!');
            }
        });
    };

    const handleExportPDF = async () => {
        if (!selectedOrder) return;
        
        // Hiển thị confirm modal
        const confirmMessage = `Bạn có chắc chắn muốn xuất PDF cho đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id}?\n\nTrang xuất PDF sẽ được mở trong tab mới.`;
        showConfirm('Xuất PDF', confirmMessage, async () => {
            try {
                // Lưu dữ liệu hóa đơn vào localStorage để trang XuatHoaDon có thể đọc
                localStorage.setItem('lastOrderForPrint', JSON.stringify({
                    order: selectedOrder,
                    maHoaDon: selectedOrder.maHoaDon || selectedOrder.id
                }));
                
                // Mở trang XuatHoaDon trong tab mới
                const popup = window.open('/XuatHoaDon', '_blank');
                if (!popup) {
                    console.log('Popup bị chặn, chuyển hướng trực tiếp...');
                    window.location.href = '/XuatHoaDon';
                } else {
                    console.log('Đã mở trang XuatHoaDon thành công');
                }
                
                toast.success('Đang mở trang xuất PDF...');
            } catch (e) {
                toast.error('Xuất PDF thất bại!');
            }
        });
    };

    // Thêm useEffect fetch dữ liệu địa chỉ khi mở modal
    useEffect(() => {
      if (showEditAddressModal && addressData.length === 0) {
        fetch('/vn-address.json')
          .then(res => res.json())
          .then(data => setAddressData(data.results || data || []));
      }
      // Khi mở modal, nếu đã có địa chỉ cũ thì set lại filteredDistricts, filteredWards
      if (showEditAddressModal && editAddress.tinhThanh) {
        const found = addressData.find((d: any) => d.province_name === editAddress.tinhThanh);
        setFilteredDistricts(found ? found.districts : []);
        const foundDistrict = found?.districts.find((d: any) => d.district_name === editAddress.quanHuyen);
        setFilteredWards(foundDistrict ? foundDistrict.wards : []);
      }
      // eslint-disable-next-line
    }, [showEditAddressModal]);

    // Lọc theo trạng thái
    let filteredOrders = activeStatus === "ALL"
        ? orders
        : orders.filter(order => order.trangThai === activeStatus);

    // Lọc theo tìm kiếm
    if (searchText.trim()) {
        filteredOrders = filteredOrders.filter(order =>
            (order.maHoaDon || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (order.tenKhachHang || '').toLowerCase().includes(searchText.toLowerCase())
        );
    }

    // Lọc theo khoảng tiền
    if (minAmount) filteredOrders = filteredOrders.filter(order => Number(order.tongTien) >= Number(minAmount));
    if (maxAmount) filteredOrders = filteredOrders.filter(order => Number(order.tongTien) <= Number(maxAmount));

    // Lọc theo ngày tạo
    if (dateFrom) filteredOrders = filteredOrders.filter(order => new Date(order.ngayTao) >= new Date(dateFrom));
    if (dateTo) filteredOrders = filteredOrders.filter(order => new Date(order.ngayTao) <= new Date(dateTo));

    // Lọc theo tháng/năm
    if (selectedMonth) filteredOrders = filteredOrders.filter(order => new Date(order.ngayTao).getMonth() === selectedMonth.getMonth());
    if (selectedYear) filteredOrders = filteredOrders.filter(order => new Date(order.ngayTao).getFullYear() === selectedYear.getFullYear());

    // Sắp xếp mới nhất
    if (sortNewest) {
        filteredOrders = filteredOrders.sort((a, b) => {
            const dateA = a.ngayTao ? new Date(a.ngayTao).getTime() : 0;
            const dateB = b.ngayTao ? new Date(b.ngayTao).getTime() : 0;
            return dateB - dateA;
        });
    }

    return (
        <div style={{ 
            padding: 24, 
            background: "#f8f4e8", 
            minHeight: '100vh',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h1 style={{ 
                    margin: 0, 
                    color: '#333', 
                    fontSize: 28,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    🛒 Quản lý hóa đơn online
                </h1>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm hóa đơn..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        minWidth: 200,
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        background: 'white'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#007bff';
                        e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                
                <label style={{ fontWeight: 500 }}>Từ</label>
                <div style={{ minWidth: 170 }}>
                    {isClient && (
                        <MuiDateTimeInput
                            value={dateFrom ? new Date(dateFrom) : null}
                            onChange={(date: Date | null) => setDateFrom(date ? date.toISOString() : '')}
                            maxDateTime={dateTo ? new Date(dateTo) : undefined}
                        />
                    )}
                </div>
                
                <label style={{ fontWeight: 500 }}>Đến</label>
                <div style={{ minWidth: 170 }}>
                    {isClient && (
                        <MuiDateTimeInput
                            value={dateTo ? new Date(dateTo) : null}
                            onChange={(date: Date | null) => setDateTo(date ? date.toISOString() : '')}
                            minDateTime={dateFrom ? new Date(dateFrom) : undefined}
                        />
                    )}
                </div>
                
                <div style={{ minWidth: 200 }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>Lọc trạng thái</label>
                    <select
                        value={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            background: 'white',
                            color: '#333',
                            fontWeight: '500',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '160px'
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.borderColor = '#adb5bd';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.borderColor = '#ddd';
                        }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value} style={{ color: option.color }}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button
                    onClick={() => {
                        setSearchText("");
                        setDateFrom("");
                        setDateTo("");
                        setActiveStatus("ALL");
                    }}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        color: '#666',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#f8f9fa';
                        (e.currentTarget as HTMLElement).style.borderColor = '#adb5bd';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'white';
                        (e.currentTarget as HTMLElement).style.borderColor = '#ddd';
                    }}
                >
                    🗑️ Xóa lọc
                </button>
            </div>

            {/* Content */}
            <div style={{
                display: 'flex',
                gap: 24,
                height: 'calc(100vh - 200px)',
                position: 'relative'
            }}>
                {/* Left Column - Order List */}
                <div 
                    style={{
                        flex: '1',
                        minWidth: '320px',
                        maxWidth: '500px',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                        maxHeight: 'calc(100vh - 250px)'
                    }}
                >
                    <div style={{ 
                        fontWeight: 700, 
                        marginBottom: 24,
                        fontSize: '20px',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        📋 Bảng hóa đơn online
                    </div>
                    
                    {filteredOrders.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: 40, 
                            color: '#666',
                            fontSize: '16px'
                        }}>
                            📭 Không có hóa đơn online nào
                            <br />
                            <small style={{ fontSize: '12px', color: '#999' }}>
                                Trạng thái: {activeStatus} | Tổng: {orders.length} hóa đơn
                            </small>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div
                                key={order.idHoaDon}
                                style={{
                                    cursor: "pointer",
                                    background: selectedOrder?.idHoaDon === order.idHoaDon 
                                        ? "#fff3cd" 
                                        : "#f8f9fa",
                                    border: selectedOrder?.idHoaDon === order.idHoaDon
                                        ? "1px solid #e0e0e0"
                                        : "1px solid #e9ecef",
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    padding: 16,
                                    minWidth: 220,
                                    maxWidth: 320,
                                    transition: "all 0.3s ease"
                                }}
                                onClick={() => handleSelectOrder(order.maHoaDon, order)}
                                onMouseEnter={(e) => {
                                    if (selectedOrder?.idHoaDon !== order.idHoaDon) {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedOrder?.idHoaDon !== order.idHoaDon) {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                                    }
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 8 }}>
                                    <span style={{
                                        border: "none",
                                        borderRadius: 12,
                                        background: getStatusColor(order.trangThai),
                                        color: "#fff",
                                        padding: "8px 16px",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        minWidth: 80,
                                        textAlign: "center",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        {getStatusIcon(order.trangThai)}
                                    </span>
                                    <span style={{ marginLeft: "auto", fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
                                        Mã hóa đơn: <b style={{fontSize: 18}}>{order.maHoaDon}</b>
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                                    <span style={{ color: "#666" }}>
                                        {order.ngayTao ? new Date(order.ngayTao).toLocaleString('vi-VN', {
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit', 
                                            hour12: false
                                        }) : ""}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
                                    <span style={{ color: "#222", fontWeight: 500 }}>{order.tenKhachHang || ""}</span>
                                    <span style={{ fontWeight: 700, color: "#e67e22", fontSize: 16 }}>
                                        {Number(order.thanhTien || order.tongTien || 0).toLocaleString()} đ
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Column - Order Details */}
                <div 
                    style={{
                        flex: '2',
                        minWidth: '400px',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                        maxHeight: 'calc(100vh - 250px)'
                    }}
                >
                    {loadingDetail ? (
                        <div style={{ 
                            fontSize: 16, 
                            color: '#666', 
                            marginTop: 40, 
                            textAlign: 'center' 
                        }}>
                            ⏳ Đang tải chi tiết hóa đơn...
                        </div>
                    ) : selectedOrder && (selectedOrder.chiTiet || []).length > 0 ? (
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: 24 
                            }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    📋 Chi tiết hóa đơn online
                                </h3>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    Trạng thái: {selectedOrder.trangThai}
                                </div>
                                {selectedOrder.trangThai === 'Chờ xác nhận' && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleChangeStatus('Đã xác nhận')}
                                            style={{
                                                background: 'rgba(40, 167, 69, 0.1)',
                                                color: '#28a745',
                                                border: '2px solid #28a745',
                                                borderRadius: 12,
                                                padding: '12px 24px',
                                                fontWeight: 600,
                                                fontSize: 15,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = '#28a745';
                                                (e.currentTarget as HTMLElement).style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(40, 167, 69, 0.1)';
                                                (e.currentTarget as HTMLElement).style.color = '#28a745';
                                            }}
                                        >
                                            ✅ Xác nhận
                                        </button>
                                        <button
                                            onClick={() => handleChangeStatus('Đã hủy')}
                                            style={{
                                                background: 'rgba(231, 76, 60, 0.1)',
                                                color: '#e74c3c',
                                                border: '2px solid #e74c3c',
                                                borderRadius: 12,
                                                padding: '12px 24px',
                                                fontWeight: 600,
                                                fontSize: 15,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = '#e74c3c';
                                                (e.currentTarget as HTMLElement).style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(231, 76, 60, 0.1)';
                                                (e.currentTarget as HTMLElement).style.color = '#e74c3c';
                                            }}
                                        >
                                            ❌ Hủy
                                        </button>
                                    </div>
                                )}
                                {selectedOrder.trangThai === 'Đã xác nhận' && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleChangeStatus('Đang vận chuyển')}
                                            style={{
                                                background: 'rgba(255, 152, 0, 0.1)',
                                                color: '#ff9800',
                                                border: '2px solid #ff9800',
                                                borderRadius: 12,
                                                padding: '12px 24px',
                                                fontWeight: 600,
                                                fontSize: 15,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = '#ff9800';
                                                (e.currentTarget as HTMLElement).style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 152, 0, 0.1)';
                                                (e.currentTarget as HTMLElement).style.color = '#ff9800';
                                            }}
                                        >
                                            🚚 Bắt đầu vận chuyển
                                        </button>
                                                                                    <button
                                                onClick={() => handleChangeStatus('Đã hủy')}
                                                style={{
                                                    background: 'rgba(231, 76, 60, 0.1)',
                                                    color: '#e74c3c',
                                                    border: '2px solid #e74c3c',
                                                    borderRadius: 12,
                                                    padding: '12px 24px',
                                                    fontWeight: 600,
                                                    fontSize: 15,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    (e.currentTarget as HTMLElement).style.background = '#e74c3c';
                                                    (e.currentTarget as HTMLElement).style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLElement).style.background = 'rgba(231, 76, 60, 0.1)';
                                                    (e.currentTarget as HTMLElement).style.color = '#e74c3c';
                                                }}
                                            >
                                                ❌
                                            </button>
                                    </div>
                                )}
                                {selectedOrder.trangThai === 'Đang vận chuyển' && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleChangeStatus('Giao hàng thành công')}
                                            style={{
                                                background: 'rgba(76, 175, 80, 0.1)',
                                                color: '#4caf50',
                                                border: '2px solid #4caf50',
                                                borderRadius: 12,
                                                padding: '12px 24px',
                                                fontWeight: 600,
                                                fontSize: 15,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = '#4caf50';
                                                (e.currentTarget as HTMLElement).style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(76, 175, 80, 0.1)';
                                                (e.currentTarget as HTMLElement).style.color = '#4caf50';
                                            }}
                                        >
                                            🎉 Giao hàng thành công
                                        </button>
                                        <button
                                            onClick={() => handleChangeStatus('Giao hàng thất bại')}
                                            style={{
                                                background: 'rgba(231, 76, 60, 0.1)',
                                                color: '#e74c3c',
                                                border: '2px solid #e74c3c',
                                                borderRadius: 12,
                                                padding: '12px 24px',
                                                fontWeight: 600,
                                                fontSize: 15,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = '#e74c3c';
                                                (e.currentTarget as HTMLElement).style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(231, 76, 60, 0.1)';
                                                (e.currentTarget as HTMLElement).style.color = '#e74c3c';
                                            }}
                                        >
                                            ❌ Giao hàng thất bại
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Order Info */}
                            <div style={{ 
                                background: 'rgba(248, 249, 250, 0.8)', 
                                padding: 20, 
                                borderRadius: 16, 
                                marginBottom: 20,
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Mã hóa đơn:</strong> {selectedOrder.maHoaDon || 'N/A'}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Ngày tạo:</strong> {selectedOrder.ngayTao ? new Date(selectedOrder.ngayTao).toLocaleString('vi-VN') : 'N/A'}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Khách hàng:</strong> {selectedOrder.tenKhachHang}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Trạng thái:</strong> {getStatusIcon(selectedOrder.trangThai)} {selectedOrder.trangThai}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Loại hóa đơn:</strong> {selectedOrder.loaiDon}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Tổng tiền:</strong> {Number(selectedOrder.thanhTien || selectedOrder.tongTien || 0).toLocaleString()} đ
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ 
                                    margin: '0 0 16px 0',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🛍️ Sản phẩm
                                </h4>
                                <div style={{ marginBottom: 18 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>STT</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>TÊN HÀNG</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'center' }}>Số lượng</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>Đơn giá</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.chiTiet.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td style={{ textAlign: 'center', fontWeight: 500, padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>{index + 1}</td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.tenSanPham}</div>
                                                        <div style={{ color: '#666', fontSize: 12 }}>
                                                            {item.tenDanhMuc}, {item.tenThuongHieu}, Màu {item.tenMauSac}, Kích cỡ {item.tenKichCo}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>{item.soLuong}</td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>{Number(item.donGia).toLocaleString()} đ</td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>{Number(item.thanhTien).toLocaleString()} đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            {selectedOrder.diaChiNhanHang && (
                                <div style={{ 
                                    background: 'rgba(248, 249, 250, 0.8)', 
                                    padding: 20, 
                                    borderRadius: 16, 
                                    marginBottom: 20,
                                    border: '1px solid rgba(0,0,0,0.1)'
                                }}>
                                    <h4 style={{ 
                                        margin: '0 0 16px 0',
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: '#333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        🚚 Thông tin giao hàng
                                    </h4>
                                    <div>
                                        <div><strong>Người nhận:</strong> {selectedOrder.tenNguoiNhan}</div>
                                        <div><strong>Số điện thoại:</strong> {selectedOrder.soDienThoai}</div>
                                        <div><strong>Địa chỉ:</strong> {selectedOrder.diaChiNhanHang}</div>
                                        {selectedOrder.ghiChu && <div><strong>Ghi chú:</strong> {selectedOrder.ghiChu}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Payment Summary */}
                            <div style={{ 
                                background: 'rgba(248, 249, 250, 0.8)', 
                                padding: 20, 
                                borderRadius: 16,
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}>
                                <h4 style={{ 
                                    margin: '0 0 16px 0',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    💰 Tổng kết thanh toán
                                </h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tổng tiền sản phẩm:</span>
                                    <span>{Number(selectedOrder.tongTien || 0).toLocaleString()} đ</span>
                                </div>
                                {selectedOrder.phiShip > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span>Phí vận chuyển:</span>
                                        <span>{Number(selectedOrder.phiShip).toLocaleString()} đ</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, borderTop: '1px solid #ddd', paddingTop: 8 }}>
                                    <span>Tổng cộng:</span>
                                    <span style={{ color: '#e67e22' }}>
                                        {Number(selectedOrder.thanhTien || selectedOrder.tongTien || 0).toLocaleString()} đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px',
                            color: '#666',
                            textAlign: 'center'
                        }}>
                            <div style={{ 
                                fontSize: '64px', 
                                marginBottom: '16px',
                                opacity: 0.6
                            }}>
                                📄
                            </div>
                            <div style={{ 
                                fontSize: '24px', 
                                fontWeight: 700, 
                                marginBottom: '8px',
                                color: '#333'
                            }}>
                                Chọn hóa đơn
                            </div>
                            <div style={{ 
                                fontSize: '14px', 
                                opacity: 0.6
                            }}>
                                Chọn một hóa đơn từ danh sách bên trái để xem chi tiết
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Custom Confirm Modal */}
            {showConfirmModal && confirmData && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '32px',
                        minWidth: '400px',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        position: 'relative',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        {/* Icon */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '8px'
                            }}>
                                ⚠️
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#333',
                            textAlign: 'center'
                        }}>
                            {confirmData.title}
                        </h3>
                        
                        {/* Message */}
                        <div style={{
                            marginBottom: '24px',
                            fontSize: '16px',
                            lineHeight: '1.5',
                            color: '#666',
                            textAlign: 'center',
                            whiteSpace: 'pre-line'
                        }}>
                            {confirmData.message}
                        </div>
                        
                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                style={{
                                    background: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minWidth: '100px'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = '#5a6268';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = '#6c757d';
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    confirmData.onConfirm();
                                }}
                                style={{
                                    background: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minWidth: '100px'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = '#c82333';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = '#dc3545';
                                }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineCounterInvoiceList; 