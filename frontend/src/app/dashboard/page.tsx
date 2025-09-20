"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import KhachHang from "../KhachHang/khachHang";
import AdminLayout from '../../component/Admin-Layout';
import StaffLayout from '../../component/Staff-Layout';
import NhanVienPage from "@/app/NhanVien/HienThi/page";
import dayjs from 'dayjs';
import styles from './dashboard.module.css';
import Link from "@mui/material/Link";

interface SanPhamDTO {
    idSanPham: number;
    maSanPham: string;
    tenSanPham: string;
    tenThuongHieu: string;
    tenDanhMuc: string;
    trangThai: string;
    moTa: string;
}

interface ThuongHieuDTO {
    idThuongHieu: number;
    tenThuongHieu: string;
}

interface DanhMucDTO {
    idDanhMuc: number;
    tenDanhMuc: string;
}

export default function Dashboard() {
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [productMenuOpen, setProductMenuOpen] = useState(false);
    const [activeProductSubMenu, setActiveProductSubMenu] = useState("product-details-list");
    const [invoiceMenuOpen, setInvoiceMenuOpen] = useState(false);
    const [activeInvoiceSubMenu, setActiveInvoiceSubMenu] = useState("pos-invoices");
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [globalMessage, setGlobalMessage] = useState<{type: 'success'|'error', text: string}|null>(null);
    const [searchTenSanPham, setSearchTenSanPham] = useState("");
    const [user, setUser] = useState<any>(null);
    const [totalRevenueAll, setTotalRevenueAll] = useState(0);
    const [totalOrdersAll, setTotalOrdersAll] = useState(0);
    const [bestSeller, setBestSeller] = useState<{ name: string, sold: number }>({ name: '', sold: 0 });
    const [totalProductsSold, setTotalProductsSold] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [monthRevenue, setMonthRevenue] = useState(0);
    const [yearRevenue, setYearRevenue] = useState(0);
    const [todayOrders, setTodayOrders] = useState(0);
    const [successOrders, setSuccessOrders] = useState(0);
    const [cancelledOrders, setCancelledOrders] = useState(0);
    const [deliveredSuccessOrders, setDeliveredSuccessOrders] = useState(0);
    const [deliveredFailedOrders, setDeliveredFailedOrders] = useState(0);
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    const menuItems = [
        {
            id: "dashboard",
            label: "Tổng quan",
            icon: "🏠",
            description: ""
        },
        {
            id: "pos",
            label: "Bán hàng tại quầy",
            icon: "💳",
            description: ""
        },
        {
            id: "products",
            label: "Quản lý sản phẩm",
            icon: "👟",
            description: "",
            children: [
                { id: "product-details-list", label: "Chi tiết sản phẩm" },
                { id: "images", label: "Hình ảnh" },
                { id: "sizes", label: "Kích thước" },
                { id: "colors", label: "Màu sắc" },
                { id: "brands", label: "Thương hiệu" },
                { id: "categories", label: "Danh mục" }
            ]
        },
        {
            id: "employees",
            label: "Quản lý nhân viên",
            icon: "👥",
            description: ""
        },
        {
            id: "customers",
            label: "Quản lý khách hàng",
            icon: "👤",
            description: ""
        },
        {
            id: "invoices",
            label: "Hóa đơn",
            icon: "🧾",
            description: "",
            children: [
                { id: "pos-invoices", label: "Hóa đơn tại quầy" },
                { id: "online-invoices", label: "Hóa đơn online" }
            ]
        },
        {
            id: "statistics",
            label: "Thống kê",
            icon: "📊",
            description: ""
        },
        {
            id: "promotions",
            label: "Khuyến mãi",
            icon: "🎉",
            description: ""
        }
    ];

    const renderProductSubContent = () => {
        switch (activeProductSubMenu) {
            case "images":
                return <div className="dashboard-content"><h2>Quản lý Hình ảnh</h2></div>;
            case "sizes":
                return <div className="dashboard-content"><h2>Quản lý Kích thước</h2></div>;
            case "colors":
                return <div className="dashboard-content"><h2>Quản lý Màu sắc</h2></div>;
            case "brands":
                return <div className="dashboard-content"><h2>Quản lý Thương hiệu</h2></div>;
            case "categories":
                return <div className="dashboard-content"><h2>Quản lý Danh mục</h2></div>;
            default:
                return null;
        }
    };

    // Đã tách hóa đơn ra route riêng, không render ở dashboard nữa
    const renderInvoiceSubContent = () => null;

    function handleLogout() {
        localStorage.removeItem('token');
        router.push('/login');
    }

    const renderSidebar = () => (
        <div style={{ width: 260, background: '#fffbe6', minHeight: '100vh', borderRight: '1px solid #eee', padding: '32px 0', borderRadius: 0 }}>
            {menuItems.map(item => (
                <React.Fragment key={item.id}>
                    <div
                        onClick={() => {
                            if (item.id === "products") {
                                setProductMenuOpen(v => !v);
                                setActiveMenu("products");
                            } else if (item.id === "invoices") {
                                // Click menu cha thì redirect đến trang chọn loại hóa đơn
                                router.push('/invoices');
                            } else {
                                setActiveMenu(item.id);
                            }
                        }}
                        style={{
                            padding: '14px 36px',
                            cursor: 'pointer',
                            background: activeMenu === item.id ? '#b59d3a22' : 'transparent',
                            color: activeMenu === item.id ? '#b59d3a' : '#6b4f1d',
                            fontWeight: activeMenu === item.id ? 700 : 500,
                            borderLeft: activeMenu === item.id ? '4px solid #b59d3a' : '4px solid transparent',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            userSelect: 'none'
                        }}
                    >
                        <span style={{fontSize: 20, marginRight: 16}}>{item.icon}</span>
                        {item.label}
                        {item.children && (
                            <span style={{marginLeft: 'auto', fontSize: 16}}>
                                {item.id === "products" ? (productMenuOpen ? '▼' : '▶') :
                                    item.id === "invoices" ? (invoiceMenuOpen ? '▼' : '▶') : ''}
                            </span>
                        )}
                    </div>
                    {item.children && (
                        item.id === "products" ? (productMenuOpen && activeMenu === "products") :
                            item.id === "invoices" ? (invoiceMenuOpen && activeMenu === "invoices") :
                                false
                    ) && (
                        (() => {
                            console.log('Rendering submenu for:', item.id, 'invoiceMenuOpen:', invoiceMenuOpen, 'activeMenu:', activeMenu);
                            return true;
                        })() &&
                        <div style={{marginLeft: 24, borderLeft: '2px solid #f3e9c7', background: '#fffbe6', borderRadius: 8}}>
                            {item.children.map(child => (
                                <div
                                    key={child.id}
                                    onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Click submenu:', child.id, child.label);
                                        
                                        if (item.id === "products") {
                                            setActiveProductSubMenu(child.id);
                                            setActiveMenu("products");
                                        } else if (item.id === "invoices") {
                                            setActiveInvoiceSubMenu(child.id);
                                            setActiveMenu("invoices");
                                            // Redirect đến trang invoices tương ứng
                                            if (child.id === "pos-invoices") {
                                                console.log('Redirecting to /invoices/ofline');
                                                setTimeout(() => {
                                                    window.location.href = '/invoices/ofline';
                                                }, 100);
                                            } else if (child.id === "online-invoices") {
                                                console.log('Redirecting to /invoices/online');
                                                setTimeout(() => {
                                                    window.location.href = '/invoices/online';
                                                }, 100);
                                            }
                                        }
                                    }}
                                    style={{
                                        padding: '10px 32px',
                                        cursor: 'pointer',
                                        background: (item.id === "products" ? activeProductSubMenu === child.id :
                                            item.id === "invoices" ? activeInvoiceSubMenu === child.id : false)
                                            ? '#b59d3a33' : 'transparent',
                                        color: (item.id === "products" ? activeProductSubMenu === child.id :
                                            item.id === "invoices" ? activeInvoiceSubMenu === child.id : false)
                                            ? '#b59d3a' : '#6b4f1d',
                                        fontWeight: (item.id === "products" ? activeProductSubMenu === child.id :
                                            item.id === "invoices" ? activeInvoiceSubMenu === child.id : false)
                                            ? 700 : 500,
                                        borderLeft: (item.id === "products" ? activeProductSubMenu === child.id :
                                            item.id === "invoices" ? activeInvoiceSubMenu === child.id : false)
                                            ? '4px solid #b59d3a' : '4px solid transparent',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        zIndex: 10
                                    }}
                                >
                                    {child.label}
                                </div>
                            ))}
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderContent = () => {
        if (activeMenu === "products") {
            return renderProductSubContent();
        }
        if (activeMenu === "invoices") {
            return renderInvoiceSubContent();
        }
        switch (activeMenu) {
            case "dashboard":
                return (
                    <div className={styles.dashboardHome}>
                        {/* Header Section */}
                        <div className={styles.headerSection}>
                            <div className={styles.welcomeSection}>
                                <img src="/logo-login.png" alt="Logo SoleKing" className={styles.logo} />
                                <div className={styles.welcomeText}>
                                    <h1 className={styles.welcomeTitle}>
                                        Chào mừng đến với <span className={styles.brand}>SoleKing Store</span>!
                                    </h1>
                                    <p className={styles.welcomeDesc}>
                                        Nâng tầm phong cách, khẳng định chất riêng trên từng bước chân
                                    </p>
                                </div>
                            </div>
                            <div className={styles.dateTime}>
                                <div className={styles.currentDate}>
                                    {currentDate}
                                </div>
                                <div className={styles.currentTime}>
                                    {currentTime}
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className={styles.statsGrid}>
                            <div className={`${styles.statCard} ${styles.revenueCard}`}>
                                <div className={styles.statIcon}>💰</div>
                                <div className={styles.statContent}>
                                    <div className={styles.statTitle}>Tổng Doanh Thu</div>
                                    <div className={styles.statValue}>{totalRevenueAll.toLocaleString()} đ</div>
                                    <div className={styles.statChange}>
                                        {totalRevenueAll > 0 ? '+12.5% so với tháng trước' : 'Chưa có doanh thu'}
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.ordersCard}`}>
                                <div className={styles.statIcon}>📦</div>
                                <div className={styles.statContent}>
                                    <div className={styles.statTitle}>Đơn Hàng Hôm Nay</div>
                                    <div className={styles.statValue}>{todayOrders}</div>
                                    <div className={styles.statChange}>
                                        {todayOrders > 0 ? '+8.2% so với hôm qua' : 'Chưa có đơn hàng hôm nay'}
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.productsCard}`}>
                                <div className={styles.statIcon}>👟</div>
                                <div className={styles.statContent}>
                                    <div className={styles.statTitle}>Sản Phẩm Đã Bán</div>
                                    <div className={styles.statValue}>{totalProductsSold}</div>
                                    <div className={styles.statChange}>
                                        {totalProductsSold > 0 ? '+15.3% so với tuần trước' : 'Chưa có sản phẩm bán'}
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.bestsellerCard}`}>
                                <div className={styles.statIcon}>🏆</div>
                                <div className={styles.statContent}>
                                    <div className={styles.statTitle}>Bán Chạy Nhất</div>
                                    <div className={styles.statValue}>{bestSeller.name}</div>
                                    <div className={styles.statChange}>
                                        {bestSeller.sold > 0 ? `Đã bán: ${bestSeller.sold} đôi` : 'Chưa có dữ liệu'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Overview */}
                        <div className={styles.revenueSection}>
                            <h2 className={styles.sectionTitle}>Tổng Quan Doanh Thu</h2>
                            <div className={styles.revenueGrid}>
                                <div className={styles.revenueCard}>
                                    <div className={styles.revenueIcon}>📅</div>
                                    <div className={styles.revenueInfo}>
                                        <div className={styles.revenueLabel}>Hôm Nay</div>
                                        <div className={styles.revenueAmount}>{todayRevenue.toLocaleString()} đ</div>
                                    </div>
                                </div>
                                <div className={styles.revenueCard}>
                                    <div className={styles.revenueIcon}>📊</div>
                                    <div className={styles.revenueInfo}>
                                        <div className={styles.revenueLabel}>Tháng Này</div>
                                        <div className={styles.revenueAmount}>{monthRevenue.toLocaleString()} đ</div>
                                    </div>
                                </div>
                                <div className={styles.revenueCard}>
                                    <div className={styles.revenueIcon}>📈</div>
                                    <div className={styles.revenueInfo}>
                                        <div className={styles.revenueLabel}>Năm Nay</div>
                                        <div className={styles.revenueAmount}>{yearRevenue.toLocaleString()} đ</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className={styles.orderSection}>
                            <h2 className={styles.sectionTitle}>Trạng Thái Đơn Hàng</h2>
                            <div className={styles.orderGrid}>
                                <div className={`${styles.orderCard} ${styles.successCard}`}>
                                    <div className={styles.orderIcon}>✅</div>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderLabel}>Giao Thành Công</div>
                                        <div className={styles.orderCount}>{deliveredSuccessOrders}</div>
                                    </div>
                                </div>
                                <div className={`${styles.orderCard} ${styles.pendingCard}`}>
                                    <div className={styles.orderIcon}>⏳</div>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderLabel}>Đang Xử Lý</div>
                                        <div className={styles.orderCount}>{successOrders}</div>
                                    </div>
                                </div>
                                <div className={`${styles.orderCard} ${styles.failedCard}`}>
                                    <div className={styles.orderIcon}>❌</div>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderLabel}>Giao Thất Bại</div>
                                        <div className={styles.orderCount}>{deliveredFailedOrders}</div>
                                    </div>
                                </div>
                                <div className={`${styles.orderCard} ${styles.cancelledCard}`}>
                                    <div className={styles.orderIcon}>🚫</div>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderLabel}>Đã Hủy</div>
                                        <div className={styles.orderCount}>{cancelledOrders}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Section */}
                        <div className={styles.supportSection}>
                            <div className={styles.supportCard}>
                                <h3 className={styles.supportTitle}>Hỗ Trợ Khách Hàng</h3>
                                <div className={styles.supportGrid}>
                                    <div className={styles.supportItem}>
                                        <div className={styles.supportIcon}>📞</div>
                                        <div>
                                            <div className={styles.supportLabel}>Hotline</div>
                                            <a>0365 175 821</a>
                                        </div>
                                    </div>
                                    <div className={styles.supportItem}>
                                        <div className={styles.supportIcon}>✉️</div>
                                        <div style={{ marginBottom: 8 }}>
                                            <b>Email:</b> <Link href="mailto:shopsolekingstore@gmail.com" sx={{ color: '#1976d2', fontWeight: 700 }}>shopsolekingstore@gmail.com</Link>
                                        </div>
                                    </div>
                                    <div className={styles.supportItem}>
                                         <div style={{ marginBottom: 8 }}>
                                            <Link href="https://zalo.me/g/eptuwo485" sx={{ color: '#0084ff', fontWeight: 700, mx: 1 }}>Zalo</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className={styles.footer}>
                            <div className={styles.footerContent}>
                                <div className={styles.footerText}>SoleKing Store Management System</div>
                                <div className={styles.footerText}>Phiên bản 1.0 - Hệ thống quản lý bán hàng</div>
                                <div className={styles.footerText}>© 2025 SoleKing Store. All rights reserved.</div>
                            </div>
                        </footer>
                    </div>
                );
            case "employees":
                return (
                    <div className="dashboard-content">
                        <NhanVienPage/>
                    </div>
                );
            case "customers":
                return (
                    <div className="dashboard-content">
                        {/*<KhachHang />*/}
                    </div>
                );
            case "statistics":
                return (
                    <div className="dashboard-content">
                        <h2>Thống kê báo cáo</h2>
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>Thống kê báo cáo</h3>
                        </div>
                    </div>
                );
            case "promotions":
                return null;
            default:
                return (
                    <div className="dashboard-content">
                        <h2>Chào mừng đến với SoleKingStore</h2>
                        <p>Vui lòng chọn menu từ sidebar để bắt đầu.</p>
                    </div>
                );
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        // --- Thống kê doanh thu ---
        const today = dayjs();
        const todayStr = today.format('YYYY-MM-DD');
        const firstDayOfMonth = today.startOf('month').format('YYYY-MM-DD');
        const firstDayOfYear = today.startOf('year').format('YYYY-MM-DD');
        // Doanh thu hôm nay
        fetch(`http://localhost:8080/api/thongke/doanh-thu?from=${todayStr}&to=${todayStr}`)
            .then(res => res.json())
            .then(data => {
                setTodayRevenue(data.tongDoanhThu || 0);
                setTodayOrders(data.soHoaDon || 0);
            })
            .catch(() => {
                setTodayRevenue(0);
                setTodayOrders(0);
            });
        // Doanh thu tháng này
        fetch(`http://localhost:8080/api/thongke/doanh-thu?from=${firstDayOfMonth}&to=${todayStr}`)
            .then(res => res.json())
            .then(data => setMonthRevenue(data.tongDoanhThu || 0))
            .catch(() => setMonthRevenue(0));
        // Doanh thu năm nay
        fetch(`http://localhost:8080/api/thongke/doanh-thu?from=${firstDayOfYear}&to=${todayStr}`)
            .then(res => res.json())
            .then(data => setYearRevenue(data.tongDoanhThu || 0))
            .catch(() => setYearRevenue(0));
        // Số đơn thành công, bị hủy
        fetch('http://localhost:8080/api/hoadon')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    let success = 0, cancelled = 0, deliveredSuccess = 0, deliveredFailed = 0;
                    data.forEach(hd => {
                        if (hd.trangThai && (hd.trangThai === 'Đã thanh toán' || hd.trangThai === 'Hoàn tất')) success++;
                        if (hd.trangThai && hd.trangThai === 'Đã hủy') cancelled++;
                        if (hd.trangThai && hd.trangThai === 'Giao hàng thành công') deliveredSuccess++;
                        if (hd.trangThai && hd.trangThai === 'Giao hàng thất bại') deliveredFailed++;
                    });
                    setSuccessOrders(success);
                    setCancelledOrders(cancelled);
                    setDeliveredSuccessOrders(deliveredSuccess);
                    setDeliveredFailedOrders(deliveredFailed);
                } else {
                    setSuccessOrders(0);
                    setCancelledOrders(0);
                    setDeliveredSuccessOrders(0);
                    setDeliveredFailedOrders(0);
                }
            })
            .catch(() => {
                setSuccessOrders(0);
                setCancelledOrders(0);
                setDeliveredSuccessOrders(0);
                setDeliveredFailedOrders(0);
            });
        // --- Thống kê tổng quan cũ ---
        fetch(`http://localhost:8080/api/thongke/doanh-thu?from=2000-01-01&to=${todayStr}`)
            .then(res => res.json())
            .then(data => {
                setTotalRevenueAll(data.tongDoanhThu || 0);
                setTotalOrdersAll(data.soHoaDon || 0);
            })
            .catch(() => {
                setTotalRevenueAll(0);
                setTotalOrdersAll(0);
            });
        // Gọi API lấy sản phẩm bán nhiều nhất toàn hệ thống
        fetch('http://localhost:8080/api/thongke/san-pham-ban-nhieu-nhat')
            .then(res => res.json())
            .then(data => {
                if (data && data.tenSanPham) {
                    setBestSeller({ name: data.tenSanPham, sold: data.soLuongBan });
                } else {
                    setBestSeller({ name: 'Không có dữ liệu', sold: 0 });
                }
            })
            .catch(() => setBestSeller({ name: 'Không có dữ liệu', sold: 0 }));
        fetch('http://localhost:8080/api/thongke/tong-so-san-pham-da-ban')
            .then(res => res.json())
            .then(data => setTotalProductsSold(data.tongSoSanPhamDaBan || 0))
            .catch(() => setTotalProductsSold(0));
    }, []);

    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDate(dayjs().format('dddd, DD/MM/YYYY'));
            setCurrentTime(dayjs().format('HH:mm:ss'));
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Get user role from localStorage
    const userRole = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').vaiTro : '';

    // Common layout props
    const layoutProps = {
        activeMenu,
        onMenuChangeAction: setActiveMenu,
        pageTitle: menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'
    };

    // Render content with appropriate layout based on user role
    const content = renderContent();
    
    if (userRole === 'NHAN_VIEN') {
        return <StaffLayout {...layoutProps}>{content}</StaffLayout>;
    }
    
    return <AdminLayout {...layoutProps}>{content}</AdminLayout>;
}