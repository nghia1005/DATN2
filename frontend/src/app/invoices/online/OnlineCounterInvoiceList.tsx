import React, { useState, useEffect } from "react";
import axios from "axios";
import { ProductDetail } from '../../pos/types';
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
        "Đang vận chuyển": { next: "Giao hàng thành công", label: "✓", color: "#10b981" }
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
        note?: string;
    } | null>(null);
    const [confirmNote, setConfirmNote] = useState('');

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
        setConfirmNote('');
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
                                            <strong>Khách hàng:</strong> {selectedOrder.tenKhachHang || selectedOrder.tenNguoiNhan || 'Chưa có thông tin'}
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
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h4 style={{ 
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: '#333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        🛍️ Sản phẩm
                                    </h4>
                                    {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                        <button
                                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontWeight: 700, fontSize: 16, cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => setShowAddProductModal(true)}
                                            title="Mua thêm sản phẩm"
                                        >
                                            ➕
                                        </button>
                                    )}
                                </div>
                                <div style={{ marginBottom: 18 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>STT</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>TÊN HÀNG</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'center' }}>Số lượng</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>Đơn giá</th>
                                                <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'left' }}>Thành tiền</th>
                                                {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                                    <th style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5', textAlign: 'center' }}>Thao tác</th>
                                                )}
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
                                                    {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                                                            <button
                                                                style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                                                                title="Xóa sản phẩm khỏi hóa đơn"
                                                                onClick={() => {
                                                                    setDeletingProductId(item.idHoaDonChiTiet);
                                                                    setDeletingProduct(item);
                                                                    setDeleteQuantity('');
                                                                }}
                                                            >🗑️</button>
                                                        </td>
                                                    )}
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
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <h4 style={{ 
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: 600,
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            🚚 Thông tin giao hàng
                                        </h4>
                                        {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                            <button
                                                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px', fontWeight: 600, fontSize: 16, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => {
                                                    // Parse địa chỉ cũ nếu cần để điền vào các dropdown
                                                    let parsedTinhThanh = '';
                                                    let parsedQuanHuyen = '';
                                                    let parsedPhuongXa = '';
                                                    let parsedNgoNgach = '';
                                                    if (!selectedOrder.tinhThanh && selectedOrder.diaChiNhanHang) {
                                                        const addressParts = selectedOrder.diaChiNhanHang.split(',').map((s: string) => s.trim()).filter(Boolean);
                                                        if (addressParts.length >= 4) {
                                                            parsedNgoNgach = addressParts[0] || '';
                                                            parsedPhuongXa = addressParts[addressParts.length - 3] || '';
                                                            parsedQuanHuyen = addressParts[addressParts.length - 2] || '';
                                                            parsedTinhThanh = addressParts[addressParts.length - 1] || '';
                                                        } else if (addressParts.length === 3) {
                                                            parsedPhuongXa = addressParts[0] || '';
                                                            parsedQuanHuyen = addressParts[1] || '';
                                                            parsedTinhThanh = addressParts[2] || '';
                                                        }
                                                    }
                                                    setEditAddress({
                                                        tenNguoiNhan: selectedOrder.tenNguoiNhan || '',
                                                        soDienThoai: selectedOrder.soDienThoai || '',
                                                        diaChiNhanHang: selectedOrder.diaChiNhanHang || '',
                                                        tinhThanh: parsedTinhThanh,
                                                        quanHuyen: parsedQuanHuyen,
                                                        phuongXa: parsedPhuongXa,
                                                        ngoNgach: parsedNgoNgach
                                                    });
                                                    if (addressData.length === 0) {
                                                        fetch('/vn-address.json')
                                                            .then(res => res.json())
                                                            .then(data => {
                                                                const addressDataLoaded = data.results || data || [];
                                                                setAddressData(addressDataLoaded);
                                                                if (parsedTinhThanh) {
                                                                    const found = addressDataLoaded.find((d: any) => d.province_name === parsedTinhThanh);
                                                                    setFilteredDistricts(found ? found.districts : []);
                                                                    if (parsedQuanHuyen && found) {
                                                                        const foundDistrict = found.districts.find((d: any) => d.district_name === parsedQuanHuyen);
                                                                        setFilteredWards(foundDistrict ? foundDistrict.wards : []);
                                                                    }
                                                                }
                                                            });
                                                    } else {
                                                        if (parsedTinhThanh) {
                                                            const found = addressData.find((d: any) => d.province_name === parsedTinhThanh);
                                                            setFilteredDistricts(found ? found.districts : []);
                                                            if (parsedQuanHuyen && found) {
                                                                const foundDistrict = found.districts.find((d: any) => d.district_name === parsedQuanHuyen);
                                                                setFilteredWards(foundDistrict ? foundDistrict.wards : []);
                                                            }
                                                        }
                                                    }
                                                    setShowEditAddressModal(true);
                                                }}
                                                title="Sửa địa chỉ giao hàng"
                                            >✏️</button>
                                        )}
                                    </div>
                                    <div>
                                        <div><strong>Người nhận:</strong> {selectedOrder.tenNguoiNhan || 'Chưa có thông tin'}</div>
                                        <div><strong>Số điện thoại:</strong> {selectedOrder.soDienThoai || 'Chưa có thông tin'}</div>
                                        <div><strong>Địa chỉ:</strong> {selectedOrder.diaChiNhanHang || 'Chưa có thông tin'}</div>
                                        <div><strong>Phương thức thanh toán:</strong> {selectedOrder.phuongThucThanhToan || 'Chưa có thông tin'}</div>
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
            
            {/* Edit Address Modal */}
            {showEditAddressModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <h3 style={{ margin: 0, marginBottom: 16 }}>Sửa địa chỉ giao hàng</h3>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ marginBottom: 8 }}>
                                <label>Người nhận:</label>
                                <input type="text" value={editAddress.tenNguoiNhan} onChange={e => setEditAddress(a => ({ ...a, tenNguoiNhan: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>Số điện thoại:</label>
                                <input type="text" value={editAddress.soDienThoai} onChange={e => setEditAddress(a => ({ ...a, soDienThoai: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>Tỉnh/Thành phố:</label>
                                <select
                                    value={editAddress.tinhThanh || ''}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setEditAddress(a => ({ ...a, tinhThanh: value, quanHuyen: '', phuongXa: '' }));
                                        const found = addressData.find((d: any) => d.province_name === value);
                                        setFilteredDistricts(found ? found.districts : []);
                                        setFilteredWards([]);
                                    }}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                                >
                                    <option value="">Chọn Tỉnh/Thành phố</option>
                                    {addressData.map((t: any) => (
                                        <option key={t.province_id} value={t.province_name}>{t.province_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>Quận/Huyện:</label>
                                <select
                                    value={editAddress.quanHuyen || ''}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setEditAddress(a => ({ ...a, quanHuyen: value, phuongXa: '' }));
                                        const foundProvince = addressData.find((d: any) => d.province_name === (editAddress.tinhThanh || ''));
                                        const foundDistrict = foundProvince?.districts.find((d: any) => d.district_name === value);
                                        setFilteredWards(foundDistrict ? foundDistrict.wards : []);
                                    }}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                                    disabled={!editAddress.tinhThanh}
                                >
                                    <option value="">Chọn Quận/Huyện</option>
                                    {filteredDistricts.map((q: any) => (
                                        <option key={q.district_id} value={q.district_name}>{q.district_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>Phường/Xã:</label>
                                <select
                                    value={editAddress.phuongXa || ''}
                                    onChange={e => setEditAddress(a => ({ ...a, phuongXa: e.target.value }))}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                                    disabled={!editAddress.quanHuyen}
                                >
                                    <option value="">Chọn Phường/Xã</option>
                                    {filteredWards.map((p: any) => (
                                        <option key={p.ward_id} value={p.ward_name}>{p.ward_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>Ngõ ngách:</label>
                                <input type="text" value={editAddress.ngoNgach || ''} onChange={e => setEditAddress(a => ({ ...a, ngoNgach: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowEditAddressModal(false)} style={{ background: '#bbb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Hủy</button>
                            <button
                                onClick={async () => {
                                    if (!editAddress.tenNguoiNhan?.trim()) { toast.error('Vui lòng nhập tên người nhận!'); return; }
                                    if (!editAddress.soDienThoai?.trim() || !/^[0-9]{10,11}$/.test(editAddress.soDienThoai)) { toast.error('Số điện thoại phải có 10-11 chữ số!'); return; }
                                    if (!editAddress.tinhThanh || !editAddress.quanHuyen || !editAddress.phuongXa) { toast.error('Vui lòng chọn đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã!'); return; }
                                    try {
                                        const dataToSend = {
                                            ...selectedOrder,
                                            tenNguoiNhan: editAddress.tenNguoiNhan,
                                            soDienThoai: editAddress.soDienThoai,
                                            diaChiNhanHang: [
                                                editAddress.ngoNgach,
                                                editAddress.phuongXa,
                                                editAddress.quanHuyen,
                                                editAddress.tinhThanh
                                            ].filter(Boolean).join(', ')
                                        };
                                        await fetch(`http://localhost:8080/api/hoadon/${selectedOrder?.idHoaDon}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(dataToSend)
                                        });
                                        if (selectedOrder) {
                                            const resOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                            const orderData = await resOrder.json();
                                            const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${selectedOrder.idHoaDon}`);
                                            const chiTietList = await resDetails.json();
                                            setSelectedOrder({ ...orderData, chiTiet: chiTietList });
                                        }
                                        toast.success('Đã cập nhật địa chỉ giao hàng!');
                                    } catch (e) {
                                        toast.error('Cập nhật địa chỉ thất bại!');
                                    }
                                    setShowEditAddressModal(false);
                                }}
                                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                            >Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '95vw', maxWidth: 1400, height: '90vh', maxHeight: '800px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e0e0e0', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', borderRadius: '16px 16px 0 0' }}>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: 26, fontWeight: 700 }}>Chọn sản phẩm</h2>
                            <button onClick={() => setShowAddProductModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 28, cursor: 'pointer', color: '#fff', padding: 8, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e0e0e0', background: '#fafafa', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <select style={{ minWidth: 140, borderRadius: 8, padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', background: '#fff' }}>
                                <option value="">Thương hiệu</option>
                                {Array.from(new Set(productDetails.map(p => p.tenThuongHieu))).filter(Boolean).map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                            <select style={{ minWidth: 140, borderRadius: 8, padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', background: '#fff' }}>
                                <option value="">Danh mục</option>
                                {Array.from(new Set(productDetails.map(p => p.tenDanhMuc))).filter(Boolean).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select style={{ minWidth: 120, borderRadius: 8, padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', background: '#fff' }}>
                                <option value="">Màu sắc</option>
                                {Array.from(new Set(productDetails.map(p => p.tenMauSac))).filter(Boolean).map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                            <select style={{ minWidth: 120, borderRadius: 8, padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', background: '#fff' }}>
                                <option value="">Kích thước</option>
                                {Array.from(new Set(productDetails.map(p => p.tenKichCo))).filter(Boolean).map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <input type="text" placeholder="Tìm kiếm tên, mã..." style={{ flex: 1, minWidth: 200, borderRadius: 8, padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', background: '#fff' }} />
                        </div>
                        <div style={{ padding: '20px 24px', overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Mã</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Tên</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Thương hiệu</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Danh mục</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Màu</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Kích cỡ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Giá</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Tồn</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Thêm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productDetails.map((product) => (
                                        <tr key={product.idChiTietSanPham}>
                                            <td style={{ padding: '12px 8px', color: '#666' }}>{product.maSanPham}</td>
                                            <td style={{ padding: '12px 8px', fontWeight: 600 }}>{product.tenSanPham}</td>
                                            <td style={{ padding: '12px 8px', color: '#666' }}>{product.tenThuongHieu}</td>
                                            <td style={{ padding: '12px 8px', color: '#666' }}>{product.tenDanhMuc}</td>
                                            <td style={{ padding: '12px 8px', color: '#666' }}>{product.tenMauSac}</td>
                                            <td style={{ padding: '12px 8px', color: '#666' }}>{product.tenKichCo}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: '#e67e22', fontSize: '15px' }}>{product.gia?.toLocaleString()} ₫</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 500 }}>{product.soLuong}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                    <input type="number" min="1" max={product.soLuong} defaultValue="1" style={{ width: '60px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', fontSize: '13px', background: '#fff' }} id={`qty-${product.idChiTietSanPham}`} />
                                                    <button
                                                        onClick={async () => {
                                                            if (!selectedOrder) return;
                                                            const qtyInput = document.getElementById(`qty-${product.idChiTietSanPham}`) as HTMLInputElement;
                                                            const quantity = parseInt(qtyInput?.value || '1');
                                                            if (quantity < 1 || quantity > product.soLuong) { toast.error('Số lượng không hợp lệ!'); return; }
                                                            try {
                                                                const res = await fetch('http://localhost:8080/api/hoadonchitiet', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ idHoaDon: selectedOrder.idHoaDon, idChiTietSanPham: product.idChiTietSanPham, soLuong: quantity })
                                                                });
                                                                if (!res.ok) { toast.error('Không thể thêm sản phẩm vào hóa đơn!'); return; }
                                                                const resOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                                                const orderData = await resOrder.json();
                                                                const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${selectedOrder.idHoaDon}`);
                                                                const chiTietList = await resDetails.json();
                                                                setSelectedOrder({ ...orderData, chiTiet: chiTietList });
                                                                toast.success(`Đã thêm ${quantity} sản phẩm vào hóa đơn!`);
                                                                setShowAddProductModal(false);
                                                            } catch (e) {
                                                                toast.error('Không thể thêm sản phẩm vào hóa đơn!');
                                                            }
                                                        }}
                                                        disabled={product.soLuong === 0}
                                                        style={{ background: product.soLuong > 0 ? '#1976d2' : '#6c757d', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: product.soLuong > 0 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 'bold' }}
                                                        title={product.soLuong === 0 ? 'Hết hàng' : 'Thêm vào hóa đơn'}
                                                    >
                                                        {product.soLuong > 0 ? 'Thêm' : 'Hết hàng'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #e0e0e0', textAlign: 'center', background: '#fafafa', borderRadius: '0 0 16px 16px' }}>
                            <button onClick={() => setShowAddProductModal(false)} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Product Modal */}
            {deletingProductId !== null && deletingProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <h3 style={{ margin: 0, marginBottom: 16 }}>Xóa sản phẩm khỏi hóa đơn</h3>
                        <div style={{ marginBottom: 16 }}><strong>Sản phẩm:</strong> {deletingProduct.tenSanPham}</div>
                        <div style={{ marginBottom: 16 }}><strong>Số lượng hiện tại:</strong> {deletingProduct.soLuong}</div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Số lượng muốn xóa:</label>
                            <input type="number" min="1" max={deletingProduct.soLuong} value={deleteQuantity} onChange={(e) => setDeleteQuantity(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                            <button onClick={() => { setDeletingProductId(null); setDeletingProduct(null); setDeleteQuantity(''); }} style={{ background: '#bbb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Hủy</button>
                            <button
                                onClick={async () => {
                                    const quantity = parseInt(deleteQuantity) || 0;
                                    if (quantity <= 0 || quantity > deletingProduct.soLuong) { toast.error('Số lượng không hợp lệ!'); return; }
                                    try {
                                        if (quantity === deletingProduct.soLuong) {
                                            await fetch(`http://localhost:8080/api/hoadonchitiet/${deletingProductId}`, { method: 'DELETE' });
                                            // Không cập nhật tồn kho ở frontend; backend delete sẽ tự cộng lại tồn
                                        } else {
                                            const remainingQuantity = deletingProduct.soLuong - quantity;
                                            await fetch(`http://localhost:8080/api/hoadonchitiet/${deletingProductId}`, { method: 'DELETE' });
                                            if (remainingQuantity > 0) {
                                                await fetch('http://localhost:8080/api/hoadonchitiet', {
                                                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idHoaDon: selectedOrder?.idHoaDon, idChiTietSanPham: deletingProduct.idChiTietSanPham, soLuong: remainingQuantity })
                                                });
                                            }
                                            // Không cập nhật tồn kho ở frontend; backend delete sẽ tự cộng lại tồn
                                        }
                                        if (selectedOrder) {
                                            const resOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                            const orderData = await resOrder.json();
                                            const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${selectedOrder.idHoaDon}`);
                                            const chiTietList = await resDetails.json();
                                            if (chiTietList.length === 0) {
                                                try {
                                                    await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...orderData, trangThai: 'Đã hủy' }) });
                                                    const updatedResOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                                    const updatedOrderData = await updatedResOrder.json();
                                                    setSelectedOrder({ ...updatedOrderData, chiTiet: chiTietList });
                                                    const resAllOrders = await fetch('http://localhost:8080/api/hoadon');
                                                    const allOrdersData = await resAllOrders.json();
                                                    const ordersWithId = allOrdersData.map((order: any) => ({ ...order, id: order.idHoaDon }));
                                                    setOrders(sortOrdersByDate(ordersWithId));
                                                    toast.success('Đã xóa sản phẩm và tự động hủy hóa đơn!');
                                                } catch {
                                                    setSelectedOrder({ ...orderData, chiTiet: chiTietList });
                                                    toast.success('Đã xóa sản phẩm khỏi hóa đơn!');
                                                }
                                            } else {
                                                setSelectedOrder({ ...orderData, chiTiet: chiTietList });
                                                toast.success(`Đã xóa ${quantity} sản phẩm khỏi hóa đơn!`);
                                            }
                                        }
                                    } catch (e) {
                                        toast.error('Xóa sản phẩm thất bại!');
                                    }
                                    setDeletingProductId(null); setDeletingProduct(null); setDeleteQuantity('');
                                }}
                                style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                            >Xóa</button>
                        </div>
                    </div>
                </div>
            )}

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
                            marginBottom: '16px',
                            fontSize: '16px',
                            lineHeight: '1.5',
                            color: '#666',
                            textAlign: 'center',
                            whiteSpace: 'pre-line'
                        }}>
                            {confirmData.message}
                        </div>
                        
                        {/* Ghi chú */}
                        <div style={{
                            marginBottom: '24px'
                        }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#333',
                                textAlign: 'left'
                            }}>
                                Ghi chú:
                            </label>
                            <textarea
                                value={confirmNote}
                                onChange={(e) => setConfirmNote(e.target.value)}
                                placeholder="Nhập ghi chú..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                            />
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