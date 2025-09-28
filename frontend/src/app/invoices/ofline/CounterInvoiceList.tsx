import React, {useState, useEffect} from "react";
import axios from "axios";
import CartList from "../../pos/CartList";
import ProductSelector from "../../pos/ProductSelector";
import {ProductDetail} from '../../pos/types';
import {v4 as uuidv4} from "uuid";
import MuiDateTimeInput from '../../../component/MuiDateTimeInput';
import {toast} from 'react-toastify';
import Select from 'react-select';

// 1. Thêm trạng thái 'Chờ xác nhận' và 'Đã hủy' vào danh sách trạng thái
const STATUS_OPTIONS = [
    {label: "📄 Tất cả", value: "ALL", color: "#6b7280"},
    {label: "⏰ Chờ xác nhận", value: "Chờ xác nhận", color: "#f59e0b"},
    {label: "✓ Đã xác nhận", value: "Đã xác nhận", color: "#3b82f6"},
    {label: "✅ Đã thanh toán", value: "Đã thanh toán", color: "#10b981"},
    {label: "🚛 Đang vận chuyển", value: "Đang vận chuyển", color: "#f97316"},
    {label: "✅ Giao hàng thành công", value: "Giao hàng thành công", color: "#10b981"},
    {label: "❌ Giao hàng thất bại", value: "Giao hàng thất bại", color: "#ef4444"},
    {label: "❌ Đã hủy", value: "Đã hủy", color: "#6b7280"},
];

// 2. Sửa màu trạng thái - mỗi trạng thái có màu riêng
const getStatusColor = (status: string) => {
    switch (status) {
        case "Chờ xác nhận":
            return "#f59e0b"; // Màu cam
        case "Đã xác nhận":
            return "#3b82f6"; // Màu xanh dương
        case "Đã thanh toán":
            return "#10b981"; // Màu xanh lá (thành công)
        case "Đang vận chuyển":
            return "#f97316"; // Màu cam đậm
        case "Giao hàng thành công":
            return "#10b981"; // Màu xanh lá
        case "Giao hàng thất bại":
            return "#ef4444"; // Màu đỏ
        case "Đã hủy":
            return "#6b7280"; // Màu xám
        default:
            return "#6b7280"; // Màu xám mặc định
    }
};

// Hàm chuyển đổi trạng thái thành icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case "Chờ xác nhận":
            return "⏰";
        case "Đã xác nhận":
            return "✓";
        case "Đã thanh toán":
            return "💳"; // Icon thẻ thanh toán cho MoMo
        case "Đang vận chuyển":
            return "Đang vận chuyển";
        case "Giao hàng thành công":
            return "Thành công"; // Icon party cho thành công
        case "Giao hàng thất bại":
            return "Thất bại";
        case "Đã hủy":
            return "❌";
        default:
            return "❓";
    }
};

const getFilterButtonColor = (status: string) => {
    return "#1976d2"; // Tất cả đều màu xanh dương
};

// 3. Sửa logic chuyển trạng thái (thêm Chờ xác nhận)
const statusTransitions: Record<string, { next: string, label: string, color: string }> = {
    "Chờ xác nhận": {next: "Đã xác nhận", label: "✓", color: "#3b82f6"},
    "Đã xác nhận": {next: "Đang vận chuyển", label: "🚛", color: "#3b82f6"},
    "Đang vận chuyển": {next: "Giao hàng thành công", label: "✓", color: "#10b981"},
    // Nếu muốn cho phép chuyển sang thất bại hoặc hủy, có thể thêm nút riêng hoặc thêm dòng dưới:
    // "Đang vận chuyển": { next: "Giao hàng thất bại", label: "✗", color: "#ef4444" },
    // "Đang vận chuyển": { next: "Đã hủy", label: "✗", color: "#6b7280" },
};

const CounterInvoiceList = () => {
    const [isClient, setIsClient] = useState(false);
    const [activeStatus, setActiveStatus] = useState("ALL");

    // Debug: Log STATUS_OPTIONS
    console.log('STATUS_OPTIONS:', STATUS_OPTIONS);
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
    // XÓA: const [quickDate, setQuickDate] = useState('today');
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

    // Helper function để sắp xếp đơn hàng theo ngày tạo giảm dần
    const sortOrdersByDate = (ordersList: any[]) => {
        return ordersList.sort((a: any, b: any) => {
            const dateA = a.ngayTao ? new Date(a.ngayTao).getTime() : 0;
            const dateB = b.ngayTao ? new Date(b.ngayTao).getTime() : 0;
            return dateB - dateA;
        });
    };

    // Helper function để hiển thị confirm modal
    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmData({title, message, onConfirm});
        setConfirmNote('');
        setShowConfirmModal(true);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Add error interceptor for debugging
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                console.error('API Error:', error);
                return Promise.reject(error);
            }
        );
        
        return () => {
            // Cleanup interceptor on unmount
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        console.log('Fetching orders from API...');
        axios.get("http://localhost:8080/api/hoadon")
            .then(res => {
                console.log('✅ API success - Raw data:', res.data);
                
                // Kiểm tra dữ liệu trả về
                if (!Array.isArray(res.data)) {
                    console.error('Dữ liệu trả về không phải là mảng:', res.data);
                    return;
                }
                
                // Log tất cả các giá trị loaiDon có trong dữ liệu
                const allLoaiDon = [...new Set(res.data.map((order: any) => order.loaiDon))];
                console.log('Tất cả các giá trị loaiDon trong dữ liệu:', allLoaiDon);
                
                const ordersWithId = res.data.map((order: any) => ({
                    ...order,
                    id: order.idHoaDon || order.id,
                    // Đảm bảo loaiDon luôn có giá trị
                    loaiDon: order.loaiDon || "Tại quầy"
                }));
                
                console.log('✅ Processed orders:', ordersWithId);
                
                // Lọc và log các đơn hàng có loaiDon chứa "tại quầy" (không phân biệt hoa thường)
                const counterOrders = ordersWithId.filter((order: any) => {
                    const loaiDon = String(order.loaiDon || '').toLowerCase();
                    return loaiDon.includes('tại quầy');
                });
                console.log('Các đơn hàng tại quầy:', counterOrders);
                
                setOrders(sortOrdersByDate(ordersWithId));
            })
            .catch(err => {
                console.error('❌ API failed:', err);
                console.log('Using sample data instead...');
                // Thêm dữ liệu mẫu để test scrollbar - chỉ hóa đơn tại cửa hàng
                const sampleOrders = [
                    {
                        idHoaDon: 1,
                        maHoaDon: "HD001",
                        ngayTao: "2024-01-15T10:30:00",
                        trangThai: "Giao hàng thành công",
                        tenKhachHang: "Nguyễn Văn A",
                        thanhTien: 2250000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 2,
                        maHoaDon: "HD002",
                        ngayTao: "2024-01-14T15:45:00",
                        trangThai: "Đã xác nhận",
                        tenKhachHang: "Trần Thị B",
                        thanhTien: 1890000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 3,
                        maHoaDon: "HD003",
                        ngayTao: "2024-01-13T09:20:00",
                        trangThai: "Đang vận chuyển",
                        tenKhachHang: "Lê Văn C",
                        thanhTien: 3200000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 4,
                        maHoaDon: "HD004",
                        ngayTao: "2024-01-12T14:15:00",
                        trangThai: "Chờ xác nhận",
                        tenKhachHang: "Phạm Thị D",
                        thanhTien: 1560000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 5,
                        maHoaDon: "HD005",
                        ngayTao: "2024-01-11T11:30:00",
                        trangThai: "Giao hàng thành công",
                        tenKhachHang: "Hoàng Văn E",
                        thanhTien: 2780000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 6,
                        maHoaDon: "HD006",
                        ngayTao: "2024-01-10T16:45:00",
                        trangThai: "Đã xác nhận",
                        tenKhachHang: "Vũ Thị F",
                        thanhTien: 1950000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 7,
                        maHoaDon: "HD007",
                        ngayTao: "2024-01-09T13:20:00",
                        trangThai: "Đang vận chuyển",
                        tenKhachHang: "Đỗ Văn G",
                        thanhTien: 2450000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 8,
                        maHoaDon: "HD008",
                        ngayTao: "2024-01-08T08:55:00",
                        trangThai: "Chờ xác nhận",
                        tenKhachHang: "Ngô Thị H",
                        thanhTien: 1670000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 9,
                        maHoaDon: "HD009",
                        ngayTao: "2024-01-07T10:30:00",
                        trangThai: "Giao hàng thất bại",
                        tenKhachHang: "Lý Văn I",
                        thanhTien: 890000,
                        loaiDon: "Tại quầy"
                    },
                    {
                        idHoaDon: 10,
                        maHoaDon: "HD010",
                        ngayTao: "2024-01-06T16:20:00",
                        trangThai: "Đã hủy",
                        tenKhachHang: "Trịnh Thị K",
                        thanhTien: 1200000,
                        loaiDon: "Tại quầy"
                    }
                ];
                setOrders(sortOrdersByDate(sampleOrders));
            });
    }, []);

    // Lấy tất cả đơn hàng
    const allOrders = [...orders];
    console.log('Tất cả đơn hàng từ API:', allOrders);
    
    // Lọc đơn hàng tại quầy
    const storeOrders = allOrders.filter(order => {
        const loaiDon = String(order.loaiDon || '').trim().toLowerCase();
        const trangThai = String(order.trangThai || '').trim().toLowerCase();
        const maHoaDon = String(order.maHoaDon || '').toLowerCase();
        
        // Điều kiện lọc đơn hàng tại quầy
        const isCounterSale = 
            // Kiểm tra loại đơn
            loaiDon.includes('tại quầy') || 
            loaiDon.includes('tai quay') ||
            loaiDon === '' ||
            order.loaiDon === null ||
            // Kiểm tra trạng thái
            trangThai.includes('thành công') ||
            trangThai.includes('thanh cong') ||
            // Kiểm tra mã hóa đơn
            maHoaDon.includes('hd') ||
            // Kiểm tra thông tin giao hàng
            !order.diaChiNhanHang ||
            order.diaChiNhanHang === '';
        
        // Log thông tin đơn hàng để debug
        console.log('Kiểm tra đơn hàng:', {
            id: order.idHoaDon || order.id,
            maHoaDon: order.maHoaDon,
            loaiDon: order.loaiDon,
            trangThai: order.trangThai,
            diaChiNhanHang: order.diaChiNhanHang,
            isCounterSale: isCounterSale
        });
        
        return isCounterSale;
    });
    
    // Cập nhật trạng thái hiển thị cho đơn hàng tại quầy
    const processedOrders = storeOrders.map(order => {
        // Xác định trạng thái hiển thị
        let trangThaiHienThi = order.trangThai;
        
        // Nếu là đơn tại quầy và có trạng thái "Giao hàng thành công" thì hiển thị là "Đã thanh toán"
        if (order.trangThai === 'Giao hàng thành công') {
            trangThaiHienThi = 'Đã thanh toán';
        }
        
        return {
            ...order,
            trangThaiHienThi: trangThaiHienThi
        };
    });
    
    console.log('Số lượng đơn hàng tại quầy:', processedOrders.length);
    
    // Lọc theo trạng thái
    let filteredOrders = activeStatus === "ALL"
        ? processedOrders
        : processedOrders.filter(order => {
            // Nếu đang lọc "Đã thanh toán" thì kiểm tra cả trạng thái gốc và trạng thái hiển thị
            if (activeStatus === 'Đã thanh toán') {
                return order.trangThaiHienThi === 'Đã thanh toán' || 
                       order.trangThai === 'Giao hàng thành công';
            }
            return order.trangThai === activeStatus;
        });
    
    console.log('Số lượng đơn hàng sau khi lọc trạng thái:', filteredOrders.length);

    // Debug: Log filtering info
    console.log('Active status:', activeStatus);
    console.log('Store orders count:', storeOrders.length);
    console.log('Filtered orders count:', filteredOrders.length);
    console.log('Available statuses:', [...new Set(storeOrders.map(order => order.trangThai))]);
    console.log('Filtered orders:', filteredOrders);

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

    // Lấy danh sách sản phẩm khi mở modal
    useEffect(() => {
        if (showAddProductModal) {
            fetch('/api/chi-tiet-san-pham/hien-thi')
                .then(res => res.json())
                .then(data => setProductDetails(data))
                .catch(() => setProductDetails([]));
        }
    }, [showAddProductModal]);

    // Khi chọn hóa đơn, lấy chi tiết
    const handleSelectOrder = async (code: string, orderFromList: any) => {
        console.log('=== Bắt đầu xử lý chọn hóa đơn ===');
        console.log('Mã hóa đơn được chọn:', code);
        console.log('Dữ liệu hóa đơn đầy đủ:', orderFromList);

        // Thử lấy ID hóa đơn từ nhiều trường khác nhau
        const id = orderFromList.idHoaDon || orderFromList.id;
        console.log('ID hóa đơn được xác định:', id);

        if (!id) {
            console.error('Không tìm thấy ID hóa đơn trong dữ liệu');
            toast.error('Không tìm thấy thông tin hóa đơn!');
            setSelectedOrder(null);
            setLoadingDetail(false);
            return;
        }

        setSelectedOrderCode(code);
        setLoadingDetail(true);

        try {
            // Luôn gọi API để lấy chi tiết hóa đơn mới nhất
            console.log('Gọi API để lấy chi tiết hóa đơn mới nhất');

            // Gọi song song cả 2 API
            const [resOrder, resDetails] = await Promise.all([
                fetch(`http://localhost:8080/api/hoadon/${id}`).then(res => res.json()),
                fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${id}`).then(res => res.json())
            ]);

            console.log('Dữ liệu từ API hóa đơn:', resOrder);
            console.log('Dữ liệu từ API chi tiết hóa đơn:', resDetails);

            // Kết hợp dữ liệu từ orderFromList và dữ liệu mới từ API
            const updatedOrder = {
                ...orderFromList,
                ...resOrder,
                chiTiet: Array.isArray(resDetails) ? resDetails : []
            };

            console.log('Dữ liệu hóa đơn sau khi cập nhật:', updatedOrder);

            // Lưu vào state
            setSelectedOrder(updatedOrder);

        } catch (e) {
            console.error('Lỗi khi lấy thông tin hóa đơn:', e);

            // Nếu có lỗi, thử sử dụng dữ liệu có sẵn
            if (orderFromList) {
                console.log('Sử dụng dữ liệu hóa đơn có sẵn do lỗi API');
                setSelectedOrder({
                    ...orderFromList,
                    chiTiet: orderFromList.chiTiet || []
                });
            } else {
                setSelectedOrder(null);
                toast.error('Không tìm thấy thông tin hóa đơn!');
            }
        } finally {
            setLoadingDetail(false);
        }
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
                await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon || selectedOrder.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        idHoaDon: selectedOrder.idHoaDon || selectedOrder.id,
                        trangThai: 'Chờ xác nhận'
                    })
                });
                toast.success('Đã xác nhận đơn hàng!');
                // Chuyển filter sang Chờ đóng gói
                setActiveStatus('Chờ xác nhận');
                // Ẩn chi tiết hóa đơn
                setSelectedOrder(null);
                // Reload danh sách hóa đơn
                axios.get('http://localhost:8080/api/hoadon')
                    .then(res => {
                        const ordersWithId = res.data.map((order: any) => ({...order, id: order.idHoaDon}));
                        setOrders(sortOrdersByDate(ordersWithId));
                    })
                    .catch(() => setOrders([]));
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
                confirmMessage = `Bạn có chắc chắn muốn xác nhận đơn hàng ${selectedOrder.maHoaDon || selectedOrder.id}?`;
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
                const {chiTiet, ...orderToSend} = selectedOrder;
                await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon || selectedOrder.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        ...orderToSend,
                        trangThai: newStatus
                    })
                });

                // Hiển thị thông báo phù hợp với trạng thái
                if (newStatus === 'Đã hủy' || newStatus === 'Giao hàng thất bại') {
                    toast.success(`Đã cập nhật trạng thái thành "${newStatus}" và hoàn trả số lượng sản phẩm về kho!`);
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
                        const ordersWithId = res.data.map((order: any) => ({...order, id: order.idHoaDon}));
                        setOrders(sortOrdersByDate(ordersWithId));
                    })
                    .catch(() => setOrders([]));
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

    // Mapping trạng thái hiện tại sang trạng thái tiếp theo và label nút
    const statusTransitions: Record<string, { next: string, label: string, color: string }> = {
        "Đã xác nhận": {next: "Đang vận chuyển", label: "🚚", color: "#1976d2"},
        "Đang vận chuyển": {next: "Giao hàng thành công", label: "✓", color: "#10b981"},
        // Nếu muốn cho phép chuyển sang thất bại, có thể thêm nút riêng hoặc thêm dòng dưới:
        // "Đang vận chuyển": { next: "Giao hàng thất bại", label: "✗", color: "#ef4444" },
        // "Giao hàng thành công": { next: "", label: "", color: "#4caf50" },
        // "Giao hàng thất bại": { next: "", label: "", color: "#e74c3c" },
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

    return (
        <>
            <div style={{
                background: "#f8f4e8",
                minHeight: "100vh",
                padding: "24px",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>
                <style jsx>{`
                    /* Animation cho confirm modal */
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: scale(0.8) translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    /* Custom scrollbar cho cột trái - thanh cuộn dọc rõ ràng */
                    .left-column::-webkit-scrollbar {
                        width: 24px !important;
                        display: block !important;
                    }

                    .left-column::-webkit-scrollbar-track {
                        background: #d0d0d0 !important;
                        border-radius: 12px !important;
                        margin: 8px 0 !important;
                        border: 1px solid #c0c0c0 !important;
                    }

                    .left-column::-webkit-scrollbar-thumb {
                        background: #888888 !important;
                        border-radius: 12px !important;
                        border: 2px solid #d0d0d0 !important;
                        min-height: 60px !important;
                    }

                    .left-column::-webkit-scrollbar-thumb:hover {
                        background: #666666 !important;
                    }

                    .left-column::-webkit-scrollbar-thumb:active {
                        background: #444444 !important;
                    }

                    .left-column::-webkit-scrollbar-corner {
                        background: #d0d0d0 !important;
                    }

                    /* Custom scrollbar cho cột phải */
                    .right-column::-webkit-scrollbar {
                        width: 20px;
                    }

                    .right-column::-webkit-scrollbar-track {
                        background: #e8e8e8;
                        border-radius: 10px;
                        margin: 6px 0;
                    }

                    .right-column::-webkit-scrollbar-thumb {
                        background: #b8b8b8;
                        border-radius: 10px;
                        border: 3px solid #e8e8e8;
                        min-height: 50px;
                    }

                    .right-column::-webkit-scrollbar-thumb:hover {
                        background: #9a9a9a;
                    }

                    .right-column::-webkit-scrollbar-thumb:active {
                        background: #7a7a7a;
                    }

                    /* Firefox scrollbar */
                    .left-column, .right-column {
                        scrollbar-width: auto;
                        scrollbar-color: #c0c0c0 #f0f0f0;
                    }

                    /* Thanh kéo giữa hai cột */
                    .resize-handle {
                        transition: all 0.2s ease;
                    }

                    .resize-handle:hover {
                        background-color: rgba(208, 208, 208, 0.9) !important;
                        transform: scaleX(1.2);
                    }

                    .resize-handle:active {
                        background-color: rgba(176, 176, 176, 0.9) !important;
                    }

                    /* Hiệu ứng khi đang kéo */
                    .resize-handle.resizing {
                        background-color: rgba(0, 123, 255, 0.8) !important;
                        transform: scaleX(1.3);
                    }

                    /* Ẩn text selection khi kéo */
                    .resize-handle * {
                        user-select: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    }
                `}</style>
                {showSuccessBanner && (
                    <div style={{
                        position: 'fixed',
                        top: 32,
                        right: 32,
                        left: 'auto',
                        transform: 'none',
                        background: '#2ecc40',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                        padding: '10px 24px',
                        borderRadius: 8,
                        zIndex: 9999,
                        boxShadow: '0 4px 16px #b2f7c1',
                        minWidth: 220,
                        textAlign: 'center',
                        maxWidth: 320
                    }}>
                        Đổi trạng thái thành công!
                    </div>
                )}
                {showEditAddressSuccess && (
                    <div style={{
                        position: 'fixed',
                        top: 80,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1976d2',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                        padding: '10px 28px',
                        borderRadius: 8,
                        zIndex: 9999,
                        boxShadow: '0 4px 16px #b2f7c1',
                        minWidth: 220,
                        textAlign: 'center',
                        maxWidth: 320
                    }}>
                        Đã cập nhật địa chỉ giao hàng!
                    </div>
                )}
                {showEditAddressModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: 8,
                            padding: 32,
                            minWidth: 340,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}>
                            <h3 style={{margin: 0, marginBottom: 16}}>Sửa địa chỉ giao hàng</h3>
                            <div style={{marginBottom: 12}}>
                                <div style={{marginBottom: 8}}>
                                    <label>Người nhận:</label>
                                    <input type="text" value={editAddress.tenNguoiNhan}
                                           onChange={e => setEditAddress(a => ({...a, tenNguoiNhan: e.target.value}))}
                                           style={{
                                               width: '100%',
                                               padding: 8,
                                               borderRadius: 4,
                                               border: '1px solid #ccc'
                                           }}/>
                                </div>
                                <div style={{marginBottom: 8}}>
                                    <label>Số điện thoại:</label>
                                    <input type="text" value={editAddress.soDienThoai}
                                           onChange={e => setEditAddress(a => ({...a, soDienThoai: e.target.value}))}
                                           style={{
                                               width: '100%',
                                               padding: 8,
                                               borderRadius: 4,
                                               border: '1px solid #ccc'
                                           }}/>
                                </div>
                                <div style={{marginBottom: 8}}>
                                    <label>Tỉnh/Thành phố:</label>
                                    <select
                                        value={editAddress.tinhThanh || ''}
                                        onChange={e => {
                                            const value = e.target.value;
                                            setEditAddress(a => ({
                                                ...a,
                                                tinhThanh: value,
                                                quanHuyen: '',
                                                phuongXa: ''
                                            }));
                                            const found = addressData.find((d: any) => d.province_name === value);
                                            setFilteredDistricts(found ? found.districts : []);
                                            setFilteredWards([]);
                                        }}
                                        style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}}
                                    >
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {addressData.map((t: any) => (
                                            <option key={t.province_id}
                                                    value={t.province_name}>{t.province_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{marginBottom: 8}}>
                                    <label>Quận/Huyện:</label>
                                    <select
                                        value={editAddress.quanHuyen || ''}
                                        onChange={e => {
                                            const value = e.target.value;
                                            setEditAddress(a => ({...a, quanHuyen: value, phuongXa: ''}));
                                            const foundProvince = addressData.find((d: any) => d.province_name === (editAddress.tinhThanh || ''));
                                            const foundDistrict = foundProvince?.districts.find((d: any) => d.district_name === value);
                                            setFilteredWards(foundDistrict ? foundDistrict.wards : []);
                                        }}
                                        style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}}
                                        disabled={!editAddress.tinhThanh}
                                    >
                                        <option value="">Chọn Quận/Huyện</option>
                                        {filteredDistricts.map((q: any) => (
                                            <option key={q.district_id}
                                                    value={q.district_name}>{q.district_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{marginBottom: 8}}>
                                    <label>Phường/Xã:</label>
                                    <select
                                        value={editAddress.phuongXa || ''}
                                        onChange={e => setEditAddress(a => ({...a, phuongXa: e.target.value}))}
                                        style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}}
                                        disabled={!editAddress.quanHuyen}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        {filteredWards.map((p: any) => (
                                            <option key={p.ward_id} value={p.ward_name}>{p.ward_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{marginBottom: 8}}>
                                    <label>Ngõ ngách:</label>
                                    <input type="text" value={editAddress.ngoNgach || ''}
                                           onChange={e => setEditAddress(a => ({...a, ngoNgach: e.target.value}))}
                                           style={{
                                               width: '100%',
                                               padding: 8,
                                               borderRadius: 4,
                                               border: '1px solid #ccc'
                                           }}/>
                                </div>
                            </div>
                            <div style={{display: 'flex', gap: 16, justifyContent: 'flex-end'}}>
                                <button onClick={() => setShowEditAddressModal(false)} style={{
                                    background: '#bbb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '8px 20px',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: 'pointer'
                                }}>Hủy
                                </button>
                                <button
                                    onClick={async () => {
                                        // Validate
                                        if (!editAddress.tenNguoiNhan?.trim()) {
                                            toast.error('Vui lòng nhập tên người nhận!');
                                            return;
                                        }
                                        if (!editAddress.soDienThoai?.trim() || !/^[0-9]{10,11}$/.test(editAddress.soDienThoai)) {
                                            toast.error('Số điện thoại phải có 10-11 chữ số!');
                                            return;
                                        }
                                        if (!editAddress.tinhThanh || !editAddress.quanHuyen || !editAddress.phuongXa) {
                                            toast.error('Vui lòng chọn đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã!');
                                            return;
                                        }
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
                                                // Xóa các trường địa chỉ chi tiết vì backend không cần lưu chúng
                                                // tinhThanh: editAddress.tinhThanh,
                                                // quanHuyen: editAddress.quanHuyen,
                                                // phuongXa: editAddress.phuongXa,
                                                // ngoNgach: editAddress.ngoNgach || ''
                                            };
                                            await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`, {
                                                method: 'PUT',
                                                headers: {'Content-Type': 'application/json'},
                                                body: JSON.stringify(dataToSend)
                                            });
                                            // Reload lại chi tiết hóa đơn
                                            const resOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                            const orderData = await resOrder.json();
                                            const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${selectedOrder.idHoaDon}`);
                                            const chiTietList = await resDetails.json();
                                            setSelectedOrder({...orderData, chiTiet: chiTietList});
                                            toast.success('Đã cập nhật địa chỉ giao hàng!');
                                            setShowEditAddressSuccess(true);
                                            setTimeout(() => setShowEditAddressSuccess(false), 2000);
                                            // Fetch lại danh sách hóa đơn để đồng bộ ngoài bảng
                                            axios.get('http://localhost:8080/api/hoadon')
                                                .then(res => {
                                                    const ordersWithId = res.data.map((order: any) => ({
                                                        ...order,
                                                        id: order.idHoaDon
                                                    }));
                                                    setOrders(sortOrdersByDate(ordersWithId));
                                                })
                                                .catch(() => setOrders([]));
                                        } catch (e) {
                                            toast.error('Cập nhật địa chỉ thất bại!');
                                        }
                                        setShowEditAddressModal(false);
                                    }}
                                    style={{
                                        background: '#1976d2',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '8px 20px',
                                        fontWeight: 700,
                                        fontSize: 15,
                                        cursor: 'pointer'
                                    }}
                                >Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Bộ lọc được sắp xếp đẹp và cân đối */}
                <div style={{
                    background: 'linear-gradient(135deg, #faf8f0 0%, #f5f2e6 100%)',
                    padding: '24px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(181, 157, 58, 0.1)',
                    border: '1px solid #e8e0c0'
                }}>
                    {/* Hàng 1: Tìm kiếm và Lọc trạng thái */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center',
                        marginBottom: '20px',
                        flexWrap: 'wrap'
                    }}>
                        {/* Tìm kiếm */}
                        <div style={{flex: '1', minWidth: '250px'}}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: '#b59d3a',
                                fontSize: '14px'
                            }}>
                                🔍 Tìm kiếm
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập mã hóa đơn hoặc tên khách hàng..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    background: 'white'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#b59d3a';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(181, 157, 58, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#ddd';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Lọc trạng thái */}
                        <div style={{minWidth: '200px', position: 'relative', zIndex: 1000}}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: '#b59d3a',
                                fontSize: '14px'
                            }}>
                                📊 Trạng thái
                            </label>
                            <select
                                value={activeStatus}
                                onChange={(e) => {
                                    console.log('Selected value:', e.target.value);
                                    setActiveStatus(e.target.value);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    zIndex: 1001,
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#b59d3a';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(181, 157, 58, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#ddd';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value} style={{color: option.color}}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nút xóa lọc */}
                        <div style={{alignSelf: 'flex-end'}}>
                            <button
                                onClick={() => {
                                    setSearchText("");
                                    setMinAmount("");
                                    setMaxAmount("");
                                    setDateFrom("");
                                    setDateTo("");
                                    setSelectedMonth(null);
                                    setSelectedYear(null);
                                    setActiveStatus("ALL");
                                }}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(181, 157, 58, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #a0852e 0%, #8b6f1f 100%)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.3)';
                                }}
                            >
                                🗑️ Xóa lọc
                            </button>
                        </div>
                    </div>

                    {/* Hàng 2: Lọc theo ngày */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {/* Lọc theo ngày từ */}
                        <div style={{flex: '1', minWidth: '200px'}}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: '#b59d3a',
                                fontSize: '14px'
                            }}>
                                📅 Từ ngày
                            </label>
                            {isClient && (
                                <MuiDateTimeInput
                                    value={dateFrom ? new Date(dateFrom) : null}
                                    onChange={date => setDateFrom(date ? date.toISOString() : '')}
                                    maxDateTime={dateTo ? new Date(dateTo) : undefined}
                                />
                            )}
                        </div>

                        {/* Lọc theo ngày đến */}
                        <div style={{flex: '1', minWidth: '200px'}}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: '#b59d3a',
                                fontSize: '14px'
                            }}>
                                📅 Đến ngày
                            </label>
                            {isClient && (
                                <MuiDateTimeInput
                                    value={dateTo ? new Date(dateTo) : null}
                                    onChange={date => setDateTo(date ? date.toISOString() : '')}
                                    minDateTime={dateFrom ? new Date(dateFrom) : undefined}
                                />
                            )}
                        </div>

                    </div>
                </div>

                {/* 3. Khối nội dung 2 cột */}
                <div style={{
                    display: 'flex',
                    gap: '0px',
                    alignItems: 'stretch',
                    height: 'calc(100vh - 280px)',
                    position: 'relative',
                    minHeight: '500px',
                    background: 'linear-gradient(135deg, #faf8f0 0%, #f5f2e6 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(181, 157, 58, 0.1)',
                    border: '1px solid #e8e0c0'
                }}>
                    {/* Cột trái: Bảng hóa đơn */}
                    <div
                        className="left-column"
                        style={{
                            flex: '1',
                            minWidth: '320px',
                            maxWidth: '500px',
                            background: 'linear-gradient(135deg, #faf8f0 0%, #f5f2e6 100%)',
                            borderRadius: '16px 0 0 16px',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(181, 157, 58, 0.1)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            height: '100%',
                            border: '1px solid #e8e0c0'
                        }}
                    >
                        <div style={{
                            fontWeight: 700,
                            marginBottom: 24,
                            fontSize: '20px',
                            color: '#b59d3a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            📄 Bảng hóa đơn
                        </div>
                        {filteredOrders.map(order => (
                            <div
                                key={order.code || order.maHoaDon || order.id}
                                style={{
                                    cursor: "pointer",
                                    background: selectedOrderCode === (order.code || order.maHoaDon || order.id)
                                        ? "linear-gradient(135deg, #faf8f0 0%, #f5f2e6 100%)"
                                        : "white",
                                    border: selectedOrderCode === (order.code || order.maHoaDon || order.id)
                                        ? "1px solid #b59d3a"
                                        : "1px solid #e8e0c0",
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.1)",
                                    padding: 16,
                                    minWidth: 220,
                                    maxWidth: 320,
                                    transition: "all 0.3s ease"
                                }}
                                onClick={() => handleSelectOrder(order.code || order.maHoaDon || order.id, order)}
                                onMouseEnter={(e) => {
                                    if (selectedOrderCode !== (order.code || order.maHoaDon || order.id)) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedOrderCode !== (order.code || order.maHoaDon || order.id)) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.1)';
                                    }
                                }}
                            >
                                <div style={{display: "flex", alignItems: "flex-start", marginBottom: 8}}>
                                    <span style={{
                                        border: "none",
                                        borderRadius: 12,
                                        background: `linear-gradient(135deg, ${getStatusColor(order.trangThai)} 0%, ${getStatusColor(order.trangThai)}dd 100%)`,
                                        color: "#fff",
                                        padding: "8px 16px",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        minWidth: 80,
                                        textAlign: "center",
                                        boxShadow: `0 4px 12px ${getStatusColor(order.trangThai)}40`,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                  {getStatusIcon(order.trangThai)}
                </span>
                                    <span style={{
                                        marginLeft: "auto",
                                        fontWeight: 600,
                                        fontSize: 15,
                                        lineHeight: 1.2,
                                        color: '#b59d3a'
                                    }}>Mã hóa đơn: <b style={{
                                        fontSize: 18,
                                        color: '#333'
                                    }}>{order.code || order.maHoaDon || order.id}</b></span>
                                </div>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    marginBottom: 2
                                }}>
                                    <span
                                        style={{color: "#b59d3a"}}>{order.ngayTao ? new Date(order.ngayTao).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    }) : ""}</span>
                                    <span style={{color: "#222", fontWeight: 500}}>{order.tenNhanVien || ""}</span>
                                </div>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    alignItems: "center"
                                }}>
                                    <span style={{color: "#b59d3a", fontWeight: 500}}>{order.tenKhachHang || ""}</span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: "#b59d3a",
                                        fontSize: 16
                                    }}>{Number(order.thanhTien || order.tongTien || 0).toLocaleString()} đ</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Cột phải: Chi tiết hóa đơn/chọn hóa đơn */}
                    {/* Thanh kéo giữa hai cột */}
                    <div
                        className="resize-handle"
                        style={{
                            width: '12px',
                            background: 'linear-gradient(135deg, #e8e0c0 0%, #d4c8a8 100%)',
                            cursor: 'col-resize',
                            position: 'relative',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(181, 157, 58, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #a0852e 0%, #8b6f1f 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.2)';
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            const resizeHandle = e.currentTarget;
                            const startX = e.clientX;
                            const leftColumn = e.currentTarget.previousElementSibling as HTMLElement;
                            const rightColumn = e.currentTarget.nextElementSibling as HTMLElement;
                            const leftInitialWidth = leftColumn.offsetWidth;

                            // Thêm class để hiển thị hiệu ứng đang kéo
                            resizeHandle.classList.add('resizing');

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX;
                                const newLeftWidth = Math.max(280, Math.min(600, leftInitialWidth + deltaX));
                                leftColumn.style.flex = 'none';
                                leftColumn.style.width = newLeftWidth + 'px';
                            };

                            const handleMouseUp = () => {
                                // Xóa class hiệu ứng
                                resizeHandle.classList.remove('resizing');
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    >
                        <div style={{
                            width: '4px',
                            height: '60px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '2px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                width: '2px',
                                height: '8px',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '1px'
                            }}></div>
                            <div style={{
                                width: '2px',
                                height: '8px',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '1px'
                            }}></div>
                            <div style={{
                                width: '2px',
                                height: '8px',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '1px'
                            }}></div>
                        </div>
                    </div>

                    <div
                        className="right-column"
                        style={{
                            flex: '2',
                            minWidth: '400px',
                            background: 'linear-gradient(135deg, #faf8f0 0%, #f5f2e6 100%)',
                            borderRadius: '0 16px 16px 0',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(181, 157, 58, 0.1)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            height: '100%',
                            border: '1px solid #e8e0c0'
                        }}
                    >
                        {loadingDetail ? (
                            <div style={{
                                fontSize: 16,
                                color: '#666',
                                marginTop: 40,
                                textAlign: 'center'
                            }}>
                                ⏰ Đang tải chi tiết hóa đơn...
                            </div>
                        ) : selectedOrder && (selectedOrder.chiTiet || []).length > 0 ? (
                            <div style={{
                                background: 'linear-gradient(135deg, #faf8f0 0%, #f5f2e6 100%)',
                                borderRadius: 24,
                                boxShadow: '0 8px 32px rgba(181, 157, 58, 0.15)',
                                padding: 32,
                                minWidth: 380,
                                maxWidth: 600,
                                border: '1px solid #e8e0c0'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
                                    {/* Trạng thái badge */}
                                    <span style={{
                                        borderRadius: 12,
                                        background: `linear-gradient(135deg, ${getStatusColor(selectedOrder.trangThai)} 0%, ${getStatusColor(selectedOrder.trangThai)}dd 100%)`,
                                        color: "#fff",
                                        padding: '7px 18px',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        marginRight: 16,
                                        minWidth: 90,
                                        textAlign: 'center',
                                        boxShadow: `0 4px 12px ${getStatusColor(selectedOrder.trangThai)}40`
                                    }}>
                  {getStatusIcon(selectedOrder.trangThai)}
                                        {/*</span>*/}
                                        {/*                    /!* Lịch sử (placeholder) *!/*/}
                                        {/*                    <span*/}
                                        {/*                        style={{*/}
                                        {/*                            color: '#b59d3a',*/}
                                        {/*                            fontSize: 15,*/}
                                        {/*                            marginRight: 12,*/}
                                        {/*                            cursor: 'not-allowed',*/}
                                        {/*                            opacity: 0.7*/}
                                        {/*                        }}*/}
                                        {/*                        title='Chức năng đang phát triển'*/}
                                        {/*                    >*/}
                                        {/*  Lịch sử <span style={{fontSize: 18}}>⟳</span>*/}
                </span>
                                    <span style={{marginLeft: 'auto', fontWeight: 600, fontSize: 18, color: '#b59d3a'}}>
                  Hóa đơn <b style={{color: '#333'}}>#{selectedOrder.maHoaDon}</b>
                </span>
                                </div>
                                <div style={{color: '#b59d3a', fontSize: 15, marginBottom: 8}}>Thời gian: <b
                                    style={{color: '#333'}}>{selectedOrder.ngayTao ? new Date(selectedOrder.ngayTao).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }) : ''}</b></div>
                                <div style={{marginBottom: 8}}>
                                    <b style={{color: '#b59d3a'}}>Khách hàng:</b> <span
                                    style={{color: '#333'}}>{selectedOrder?.tenKhachHang || 'Khách lẻ'}</span>
                                </div>
                                {/* Tiêu đề và nút mua thêm */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8
                                }}>
                                    <h4 style={{margin: 0, color: '#b59d3a'}}>Chi tiết sản phẩm</h4>
                                    {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                        <button
                                            style={{
                                                background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '10px',
                                                fontWeight: 700,
                                                fontSize: 18,
                                                cursor: 'pointer',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(181, 157, 58, 0.3)'
                                            }}
                                            onClick={() => setShowAddProductModal(true)}
                                            title="Mua thêm sản phẩm"
                                        >
                                            ➕
                                        </button>
                                    )}
                                </div>
                                {/* Bảng sản phẩm */}
                                <div style={{marginBottom: 18}}>
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead>
                                        <tr>
                                            <th style={{
                                                padding: '8px 12px',
                                                borderBottom: '1px solid #e8e0c0',
                                                background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>STT
                                            </th>
                                            <th style={{
                                                padding: '8px 12px',
                                                borderBottom: '1px solid #e8e0c0',
                                                background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>TÊN HÀNG
                                            </th>
                                            <th style={{
                                                padding: '8px 12px',
                                                borderBottom: '1px solid #e8e0c0',
                                                background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>Số lượng
                                            </th>
                                            <th style={{
                                                padding: '8px 12px',
                                                borderBottom: '1px solid #e8e0c0',
                                                background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>Đơn giá
                                            </th>
                                            <th style={{
                                                padding: '8px 12px',
                                                borderBottom: '1px solid #e8e0c0',
                                                background: 'linear-gradient(135deg, #b59d3a 0%, #a0852e 100%)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>Thành tiền
                                            </th>
                                            {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                                <th style={{
                                                    padding: '8px 12px',
                                                    borderBottom: '1px solid #e0e0e0',
                                                    background: '#f5f5f5',
                                                    textAlign: 'center'
                                                }}>Thao tác</th>
                                            )}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {(selectedOrder.chiTiet || []).map((sp: any, idx: number) => (
                                            <tr key={idx}>
                                                <td style={{
                                                    textAlign: 'center',
                                                    fontWeight: 500,
                                                    padding: '8px 12px',
                                                    borderBottom: '1px solid #e0e0e0'
                                                }}>{idx + 1}</td>
                                                <td style={{padding: '8px 12px', borderBottom: '1px solid #e0e0e0'}}>
                                                    <b>{sp.tenSanPham}</b>
                                                    <div style={{color: '#555', fontSize: 14}}>
                                                        {sp.danhMuc}, {sp.thuongHieu}, Màu {sp.mauSac}, Kích
                                                        cỡ {sp.kichCo}
                                                    </div>
                                                </td>
                                                <td style={{
                                                    textAlign: 'center',
                                                    padding: '8px 12px',
                                                    borderBottom: '1px solid #e0e0e0'
                                                }}>{sp.soLuong}</td>
                                                <td style={{
                                                    padding: '8px 12px',
                                                    borderBottom: '1px solid #e0e0e0'
                                                }}>{Number(sp.donGia || 0).toLocaleString()} đ
                                                </td>
                                                <td style={{
                                                    padding: '8px 12px',
                                                    borderBottom: '1px solid #e0e0e0'
                                                }}>{Number(sp.thanhTien || 0).toLocaleString()} đ
                                                </td>
                                                {/* Nút Xóa */}
                                                {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                                    <td style={{
                                                        padding: '8px 12px',
                                                        borderBottom: '1px solid #e0e0e0',
                                                        textAlign: 'center'
                                                    }}>
                                                        <button
                                                            style={{
                                                                background: '#e74c3c',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 6,
                                                                padding: '6px 12px',
                                                                fontWeight: 700,
                                                                fontSize: 15,
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Xóa sản phẩm khỏi hóa đơn"
                                                            onClick={() => {
                                                                console.log('Click xóa:', sp.idHoaDonChiTiet);
                                                                setDeletingProductId(sp.idHoaDonChiTiet);
                                                                setDeletingProduct(sp);
                                                                setDeleteQuantity('');
                                                            }}
                                                        >🗑️
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Thông tin giao hàng & tổng tiền */}
                                <div style={{display: 'flex', gap: 32, marginBottom: 8}}>
                                    <div style={{flex: 1}}>
                                        <div style={{
                                            color: '#888',
                                            fontWeight: 500,
                                            marginBottom: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            Thông tin giao hàng:
                                            {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận') && (
                                                <button
                                                    style={{
                                                        background: '#1976d2',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        padding: '6px',
                                                        fontWeight: 600,
                                                        fontSize: 16,
                                                        cursor: 'pointer',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onClick={() => {
                                                        console.log('Selected order address data:', {
                                                            tinhThanh: selectedOrder.tinhThanh,
                                                            quanHuyen: selectedOrder.quanHuyen,
                                                            phuongXa: selectedOrder.phuongXa,
                                                            ngoNgach: selectedOrder.ngoNgach,
                                                            diaChiNhanHang: selectedOrder.diaChiNhanHang
                                                        });

                                                        // Parse địa chỉ từ field cũ diaChiNhanHang
                                                        let parsedTinhThanh = '';
                                                        let parsedQuanHuyen = '';
                                                        let parsedPhuongXa = '';
                                                        let parsedNgoNgach = '';

                                                        if (!selectedOrder.tinhThanh && selectedOrder.diaChiNhanHang) {
                                                            // Loại bỏ dấu phẩy đầu và khoảng trắng thừa
                                                            const addressParts = selectedOrder.diaChiNhanHang.split(',').map((s: string) => s.trim()).filter(Boolean);
                                                            if (addressParts.length >= 4) {
                                                                // Có ngõ ngách
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

                                                        // Đảm bảo dữ liệu địa chỉ đã được load
                                                        if (addressData.length === 0) {
                                                            fetch('/vn-address.json')
                                                                .then(res => res.json())
                                                                .then(data => {
                                                                    const addressDataLoaded = data.results || data || [];
                                                                    setAddressData(addressDataLoaded);

                                                                    // Sau khi load xong, set lại filteredDistricts và filteredWards
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
                                                            // Nếu đã có dữ liệu, set lại filteredDistricts và filteredWards ngay
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
                                        <div style={{fontSize: 15}}>Người
                                            nhận: <b>{selectedOrder.tenNguoiNhan || ''}</b></div>
                                        <div style={{fontSize: 15}}>Số điện
                                            thoại: <b>{selectedOrder.soDienThoai || ''}</b></div>
                                        <div style={{fontSize: 15}}>Địa chỉ giao hàng: <b>
                                            {selectedOrder.diaChiNhanHang || ''}
                                        </b></div>
                                        {selectedOrder.ghiChu &&
                                            <div style={{fontSize: 15}}>Ghi chú: <b>{selectedOrder.ghiChu}</b></div>}
                                    </div>
                                    <div style={{minWidth: 160}}>
                                        <div style={{color: '#888', fontWeight: 500, marginBottom: 4}}>Tổng kết:</div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 15}}>
                                            <span><b>Tổng tiền:</b></span>
                                            <span style={{
                                                color: '#e67e22',
                                                fontWeight: 700
                                            }}><b>{Number(selectedOrder.tongTien || 0).toLocaleString()} đ</b></span>
                                        </div>
                                        {Number(selectedOrder.giamGia || 0) > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: 15
                                            }}>
                                                <span><b>Giảm giá:</b></span>
                                                <span style={{
                                                    color: '#e74c3c',
                                                    fontWeight: 700
                                                }}><b>- {Number(selectedOrder.giamGia || 0).toLocaleString()} đ</b></span>
                                            </div>
                                        )}
                                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 15}}>
                                            <span><b>Phí vận chuyển:</b></span>
                                            <span style={{
                                                color: '#2980b9',
                                                fontWeight: 700
                                            }}><b>{Number(selectedOrder.phiShip || 0).toLocaleString()} đ</b></span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 15,
                                            marginTop: 4
                                        }}>
                                            <span><b>Thanh toán:</b></span>
                                            <span style={{
                                                color: selectedOrder.phuongThucThanhToan === 'MOMO' ? '#d82d8b' :
                                                    selectedOrder.phuongThucThanhToan === 'Tiền mặt' ? '#27ae60' :
                                                        selectedOrder.phuongThucThanhToan === 'Chuyển khoản' ? '#3498db' : '#666',
                                                fontWeight: 700
                                            }}>
                                              <b>
                                                {selectedOrder.phuongThucThanhToan === 'MOMO' ? '💳 MoMo' :
                                                    selectedOrder.phuongThucThanhToan === 'Tiền mặt' ? '💰 Tiền mặt' :
                                                        selectedOrder.phuongThucThanhToan === 'Chuyển khoản' ? '🏦 Chuyển khoản' :
                                                            selectedOrder.phuongThucThanhToan || 'Chưa xác định'}
                                              </b>
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 17,
                                            marginTop: 6,
                                            fontWeight: 700
                                        }}>
                                            <span><b>Tổng cộng:</b></span>
                                            <span
                                                style={{color: '#e67e22'}}><b>{Number(selectedOrder.thanhTien || selectedOrder.tongTien || 0).toLocaleString()} đ</b></span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{color: '#222', fontSize: 16, marginTop: 10, fontWeight: 700}}>
                                    Thanh
                                    toán: {Number(selectedOrder.thanhTien || selectedOrder.tongTien || 0).toLocaleString()} đ
                                </div>
                                {/* Nút chuyển trạng thái duy nhất */}
                                <div style={{marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                                    {selectedOrder?.trangThai === 'Đang vận chuyển' ? (
                                        <React.Fragment>
                                            <button
                                                style={{
                                                    background: '#10b981',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '10px 28px',
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleChangeStatus('Giao hàng thành công')}
                                            >✓
                                            </button>
                                            <button
                                                style={{
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '10px 28px',
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleChangeStatus('Giao hàng thất bại')}
                                            >✗
                                            </button>
                                        </React.Fragment>
                                    ) : (
                                        selectedOrder?.trangThai !== "Giao hàng thành công" && statusTransitions[selectedOrder?.trangThai] && (
                                            <button
                                                style={{
                                                    background: statusTransitions[selectedOrder.trangThai].color,
                                                    color: ["#4caf50"].includes(statusTransitions[selectedOrder.trangThai].color) ? "#222" : "#fff",
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '10px 28px',
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleChangeStatus(statusTransitions[selectedOrder.trangThai].next)}
                                            >
                                                {statusTransitions[selectedOrder.trangThai].label}
                                            </button>
                                        )
                                    )}
                                    {/* Nút xác nhận đơn hàng khi trạng thái là Chờ xác nhận */}
                                    {selectedOrder?.trangThai === 'Chờ xác nhận' && (
                                        <button
                                            style={{
                                                background: '#3b82f6',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '10px 28px',
                                                fontWeight: 700,
                                                fontSize: 16,
                                                cursor: 'pointer',
                                                marginRight: '10px'
                                            }}
                                            onClick={() => handleChangeStatus('Đã xác nhận')}
                                        >
                                            ✓
                                        </button>
                                    )}
                                    {/* Nút xuất PDF cho hóa đơn Chờ xác nhận và Đã xác nhận */}
                                    {(selectedOrder?.trangThai === 'Chờ xác nhận' || selectedOrder?.trangThai === 'Đã xác nhận') && (
                                        <button
                                            style={{
                                                background: '#6c757d',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '10px 28px',
                                                fontWeight: 700,
                                                fontSize: 16,
                                                cursor: 'pointer',
                                                marginRight: '10px'
                                            }}
                                            onClick={() => handleExportPDF()}
                                        >
                                            📄
                                        </button>
                                    )}

                                    {/* Nút chuyển sang Đã hủy chỉ khi trạng thái là Đã xác nhận, Chờ xác nhận hoặc Đang vận chuyển */}
                                    {(selectedOrder?.trangThai === 'Đã xác nhận' || selectedOrder?.trangThai === 'Chờ xác nhận' || selectedOrder?.trangThai === 'Đang vận chuyển') && (
                                        <button
                                            style={{
                                                background: '#6b7280',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '10px 28px',
                                                fontWeight: 700,
                                                fontSize: 16,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleChangeStatus('Đã hủy')}
                                        >
                                            ✗
                                        </button>
                                    )}
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
                                    opacity: 0.6,
                                    color: '#9c9c9c'
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
                                    opacity: 0.7,
                                    color: '#666'
                                }}>
                                    Chọn một hóa đơn từ danh sách bên trái để xem chi tiết
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Modal chọn sản phẩm đặt ngoài cùng, không bị bọc bởi layout */}
                {showAddProductModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: 16,
                            width: '95vw',
                            maxWidth: 1400,
                            height: '90vh',
                            maxHeight: '800px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px 24px',
                                borderBottom: '1px solid #e0e0e0',
                                background: 'linear-gradient(135deg, #b59d3a 0%, #8b7a2e 100%)',
                                borderRadius: '16px 16px 0 0'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    color: '#fff',
                                    fontSize: 26,
                                    fontWeight: 700,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}>Chọn sản phẩm</h2>
                                <button
                                    onClick={() => setShowAddProductModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        fontSize: 28,
                                        cursor: 'pointer',
                                        color: '#fff',
                                        padding: 8,
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Filter */}
                            <div style={{
                                display: 'flex',
                                gap: 12,
                                padding: '20px 24px',
                                borderBottom: '1px solid #e0e0e0',
                                flexWrap: 'wrap',
                                background: '#fafafa'
                            }}>
                                <select
                                    style={{
                                        minWidth: 140,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        background: '#fff',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                    onChange={(e) => {
                                        // Filter logic here
                                    }}
                                >
                                    <option value="">Thương hiệu</option>
                                    {Array.from(new Set(productDetails.map(p => p.tenThuongHieu))).filter(Boolean).map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                                <select
                                    style={{
                                        minWidth: 140,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        background: '#fff',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                    onChange={(e) => {
                                        // Filter logic here
                                    }}
                                >
                                    <option value="">Danh mục</option>
                                    {Array.from(new Set(productDetails.map(p => p.tenDanhMuc))).filter(Boolean).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <select
                                    style={{
                                        minWidth: 120,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        background: '#fff',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                    onChange={(e) => {
                                        // Filter logic here
                                    }}
                                >
                                    <option value="">Màu sắc</option>
                                    {Array.from(new Set(productDetails.map(p => p.tenMauSac))).filter(Boolean).map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                                <select
                                    style={{
                                        minWidth: 120,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        background: '#fff',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                    onChange={(e) => {
                                        // Filter logic here
                                    }}
                                >
                                    <option value="">Kích thước</option>
                                    {Array.from(new Set(productDetails.map(p => p.tenKichCo))).filter(Boolean).map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên, mã..."
                                    style={{
                                        flex: 1,
                                        minWidth: 200,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        background: '#fff',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                />
                                <button
                                    style={{
                                        borderRadius: 8,
                                        padding: '10px 16px',
                                        background: '#6c757d',
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        color: '#fff',
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                                >
                                    Đặt lại
                                </button>
                            </div>

                            {/* Products Table */}
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '0 24px'
                            }}>
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                    <tr style={{background: 'linear-gradient(135deg, #b59d3a 0%, #8b7a2e 100%)'}}>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>STT
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Mã
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Tên sản phẩm
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Danh mục
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Thương hiệu
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Màu sắc
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Kích thước
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'right',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Giá
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Số Lượng
                                        </th>
                                        <th style={{
                                            padding: '12px 8px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #8b7a2e',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '14px'
                                        }}>Thao tác
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {productDetails
                                        .filter(p => p.trangThai === 'Đang bán' && p.soLuong > 0)
                                        .sort((a, b) => b.idChiTietSanPham - a.idChiTietSanPham)
                                        .map((product, index) => (
                                            <tr key={product.idChiTietSanPham} style={{
                                                borderBottom: '1px solid #e0e0e0',
                                                transition: 'all 0.2s ease'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <td style={{padding: '12px 8px', fontWeight: 500}}>{index + 1}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    fontWeight: 'bold',
                                                    color: '#b59d3a'
                                                }}>{product.maSanPham}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    fontWeight: 600,
                                                    color: '#2c3e50'
                                                }}>{product.tenSanPham}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    color: '#666'
                                                }}>{product.tenDanhMuc}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    color: '#666'
                                                }}>{product.tenThuongHieu}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    color: '#666'
                                                }}>{product.tenMauSac}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    color: '#666'
                                                }}>{product.tenKichCo}</td>
                                                <td style={{
                                                    padding: '12px 8px',
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    color: '#e67e22',
                                                    fontSize: '15px'
                                                }}>
                                                    {product.gia?.toLocaleString()} ₫
                                                </td>
                                                <td style={{padding: '12px 8px', textAlign: 'center', fontWeight: 500}}>
                                                    {product.soLuong}
                                                </td>
                                                <td style={{padding: '12px 8px', textAlign: 'center'}}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={product.soLuong}
                                                            defaultValue="1"
                                                            style={{
                                                                width: '60px',
                                                                padding: '6px 8px',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '6px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                background: '#fff',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                                            onFocus={(e) => e.currentTarget.style.borderColor = '#b59d3a'}
                                                            onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                                            id={`qty-${product.idChiTietSanPham}`}
                                                        />
                                                        <button
                                                            onClick={async () => {
                                                                if (!selectedOrder) return;
                                                                const qtyInput = document.getElementById(`qty-${product.idChiTietSanPham}`) as HTMLInputElement;
                                                                const quantity = parseInt(qtyInput?.value || '1');

                                                                if (quantity < 1 || quantity > product.soLuong) {
                                                                    toast.error('Số lượng không hợp lệ!');
                                                                    return;
                                                                }

                                                                try {
                                                                    const res = await fetch('http://localhost:8080/api/hoadonchitiet', {
                                                                        method: 'POST',
                                                                        headers: {'Content-Type': 'application/json'},
                                                                        body: JSON.stringify({
                                                                            idHoaDon: selectedOrder.idHoaDon,
                                                                            idChiTietSanPham: product.idChiTietSanPham,
                                                                            soLuong: quantity
                                                                        })
                                                                    });
                                                                    if (!res.ok) {
                                                                        toast.error('Không thể thêm sản phẩm vào hóa đơn!');
                                                                        return;
                                                                    }
                                                                    // Sau khi thêm, reload lại chi tiết hóa đơn
                                                                    const resOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                                                    const orderData = await resOrder.json();
                                                                    const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${selectedOrder.idHoaDon}`);
                                                                    const chiTietList = await resDetails.json();
                                                                    setSelectedOrder({
                                                                        ...orderData,
                                                                        chiTiet: chiTietList
                                                                    });
                                                                    toast.success(`Đã thêm ${quantity} sản phẩm vào hóa đơn!`);
                                                                    setShowAddProductModal(false);
                                                                } catch (e) {
                                                                    toast.error('Không thể thêm sản phẩm vào hóa đơn!');
                                                                }
                                                            }}
                                                            disabled={product.soLuong === 0}
                                                            style={{
                                                                background: product.soLuong > 0 ? '#b59d3a' : '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: 8,
                                                                padding: '8px 16px',
                                                                cursor: product.soLuong > 0 ? 'pointer' : 'not-allowed',
                                                                fontSize: 13,
                                                                fontWeight: 'bold',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (product.soLuong > 0) {
                                                                    e.currentTarget.style.background = '#8b7a2e';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (product.soLuong > 0) {
                                                                    e.currentTarget.style.background = '#b59d3a';
                                                                }
                                                            }}
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

                            {/* Footer */}
                            <div style={{
                                padding: '20px 24px',
                                borderTop: '1px solid #e0e0e0',
                                textAlign: 'center',
                                background: '#fafafa',
                                borderRadius: '0 0 16px 16px'
                            }}>
                                <button
                                    onClick={() => setShowAddProductModal(false)}
                                    style={{
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {deletingProductId !== null && deletingProduct && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: 8,
                            padding: 32,
                            minWidth: 400,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}>
                            <h3 style={{margin: 0, marginBottom: 16}}>Xóa sản phẩm khỏi hóa đơn</h3>
                            <div style={{marginBottom: 16}}>
                                <strong>Sản phẩm:</strong> {deletingProduct.tenSanPham}
                            </div>
                            <div style={{marginBottom: 16}}>
                                <strong>Số lượng hiện tại:</strong> {deletingProduct.soLuong}
                            </div>
                            <div style={{marginBottom: 24}}>
                                <label style={{display: 'block', marginBottom: 8, fontWeight: 600}}>
                                    Số lượng muốn xóa:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={deletingProduct.soLuong}
                                    value={deleteQuantity}
                                    onChange={(e) => setDeleteQuantity(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{display: 'flex', gap: 16, justifyContent: 'flex-end'}}>
                                <button
                                    onClick={() => {
                                        setDeletingProductId(null);
                                        setDeletingProduct(null);
                                        setDeleteQuantity('');
                                    }}
                                    style={{
                                        background: '#bbb',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '8px 20px',
                                        fontWeight: 600,
                                        fontSize: 15,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={async () => {
                                        const quantity = parseInt(deleteQuantity) || 0;
                                        if (quantity <= 0 || quantity > deletingProduct.soLuong) {
                                            toast.error('Số lượng không hợp lệ!');
                                            return;
                                        }

                                        try {
                                            if (quantity === deletingProduct.soLuong) {
                                                // Xóa toàn bộ sản phẩm
                                                await fetch(`http://localhost:8080/api/hoadonchitiet/${deletingProductId}`, {method: 'DELETE'});

                                                // Trả lại toàn bộ số lượng vào kho
                                                try {
                                                    await fetch(`http://localhost:8080/chi-tiet-san-pham/cap-nhat/${deletingProduct.idChiTietSanPham}`, {
                                                        method: 'PUT',
                                                        headers: {'Content-Type': 'application/json'},
                                                        body: JSON.stringify({
                                                            ...deletingProduct,
                                                            soLuong: deletingProduct.soLuong + quantity
                                                        })
                                                    });
                                                } catch (stockError) {
                                                    console.error('Lỗi khi cập nhật số lượng kho:', stockError);
                                                }
                                            } else {
                                                // Xóa một phần: tạo chi tiết mới với số lượng còn lại
                                                const remainingQuantity = deletingProduct.soLuong - quantity;

                                                // Xóa chi tiết cũ
                                                await fetch(`http://localhost:8080/api/hoadonchitiet/${deletingProductId}`, {method: 'DELETE'});

                                                // Tạo chi tiết mới với số lượng còn lại
                                                if (remainingQuantity > 0) {
                                                    await fetch('http://localhost:8080/api/hoadonchitiet', {
                                                        method: 'POST',
                                                        headers: {'Content-Type': 'application/json'},
                                                        body: JSON.stringify({
                                                            idHoaDon: selectedOrder.idHoaDon,
                                                            idChiTietSanPham: deletingProduct.idChiTietSanPham,
                                                            soLuong: remainingQuantity
                                                        })
                                                    });
                                                }

                                                // Trả lại số lượng vào kho
                                                try {
                                                    await fetch(`http://localhost:8080/chi-tiet-san-pham/cap-nhat/${deletingProduct.idChiTietSanPham}`, {
                                                        method: 'PUT',
                                                        headers: {'Content-Type': 'application/json'},
                                                        body: JSON.stringify({
                                                            ...deletingProduct,
                                                            soLuong: deletingProduct.soLuong + quantity
                                                        })
                                                    });
                                                } catch (stockError) {
                                                    console.error('Lỗi khi cập nhật số lượng kho:', stockError);
                                                }
                                            }

                                            if (selectedOrder) {
                                                const resOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                                const orderData = await resOrder.json();
                                                const resDetails = await fetch(`http://localhost:8080/api/hoadonchitiet?idHoaDon=${selectedOrder.idHoaDon}`);
                                                const chiTietList = await resDetails.json();

                                                // Kiểm tra xem còn sản phẩm nào không
                                                if (chiTietList.length === 0) {
                                                    // Nếu không còn sản phẩm nào, tự động chuyển trạng thái sang "Đã hủy"
                                                    try {
                                                        await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`, {
                                                            method: 'PUT',
                                                            headers: {'Content-Type': 'application/json'},
                                                            body: JSON.stringify({
                                                                ...orderData,
                                                                trangThai: 'Đã hủy'
                                                            })
                                                        });

                                                        // Cập nhật lại thông tin hóa đơn với trạng thái mới
                                                        const updatedResOrder = await fetch(`http://localhost:8080/api/hoadon/${selectedOrder.idHoaDon}`);
                                                        const updatedOrderData = await updatedResOrder.json();
                                                        setSelectedOrder({...updatedOrderData, chiTiet: chiTietList});

                                                        // Cập nhật danh sách hóa đơn
                                                        const resAllOrders = await fetch("http://localhost:8080/api/hoadon");
                                                        const allOrdersData = await resAllOrders.json();
                                                        const ordersWithId = allOrdersData.map((order: any) => ({
                                                            ...order,
                                                            id: order.idHoaDon
                                                        }));
                                                        setOrders(sortOrdersByDate(ordersWithId));

                                                        toast.success('Đã xóa sản phẩm và tự động hủy hóa đơn!');
                                                    } catch (statusError) {
                                                        console.error('Lỗi khi cập nhật trạng thái:', statusError);
                                                        setSelectedOrder({...orderData, chiTiet: chiTietList});
                                                        toast.success('Đã xóa sản phẩm khỏi hóa đơn!');
                                                    }
                                                } else {
                                                    setSelectedOrder({...orderData, chiTiet: chiTietList});
                                                    toast.success(`Đã xóa ${quantity} sản phẩm khỏi hóa đơn!`);
                                                }
                                            }
                                        } catch (e) {
                                            toast.error('Xóa sản phẩm thất bại!');
                                        }
                                        setDeletingProductId(null);
                                        setDeletingProduct(null);
                                        setDeleteQuantity('');
                                    }}
                                    style={{
                                        background: '#e74c3c',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '8px 20px',
                                        fontWeight: 700,
                                        fontSize: 15,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Xóa
                                </button>
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
                                    {/*Ghi chú:*/}
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
                                        e.currentTarget.style.background = '#5a6268';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#6c757d';
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
                                        e.currentTarget.style.background = '#c82333';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#dc3545';
                                    }}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CounterInvoiceList;