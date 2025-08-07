"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaBars } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useEffect } from "react";

const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: "🏠" },
    { id: "pos", label: "Bán hàng tại quầy", icon: "💳" },
    {
        id: "products",
        label: "Quản lý sản phẩm",
        icon: "👟",
        children: [
            { id: "product-details-list", label: "Chi tiết sản phẩm", route: "/ChiTietSanPham" },
            { id: "images", label: "Hình ảnh", route: "/ChiTietSanPham/HinhAnh" },
            { id: "sizes", label: "Kích thước", route: "/ChiTietSanPham/KichThuoc" },
            { id: "colors", label: "Màu sắc", route: "/ChiTietSanPham/MauSac" },
            { id: "brands", label: "Thương hiệu", route: "/ChiTietSanPham/ThuongHieu" },
            { id: "categories", label: "Danh mục", route: "/ChiTietSanPham/DanhMuc" }
        ]
    },
    { id: "employees", label: "Quản lý nhân viên", icon: "👤" },
    { id: "customers", label: "Quản lý khách hàng", icon: "👥" },
    {
        id: "invoices",
        label: "Hóa đơn",
        icon: "📄",
        children: [
            { id: "invoices-counter", label: "Hóa đơn tại quầy", route: "/invoices/ofline" },
            { id: "invoices-online", label: "Hóa đơn online", route: "/invoices/online" }
        ]
    },
    {
        id: "statistics",
        label: "Thống kê",
        icon: "📊",
        children: [
            { id: "revenue-statistics", label: "Doanh thu", route: "/ThongKe/DoanhThu" },
            { id: "product-statistics", label: "Sản phẩm", route: "/ThongKe/SanPham" }
        ]
    },
    { id: "promotions", label: "Khuyến mãi", icon: "🎉" }
];

interface AdminLayoutProps {
    children: React.ReactNode;
    activeMenu?: string;
    onMenuChangeAction?: (menuId: string) => void;
    pageTitle?: string;
    activeSubMenu?: string;
}

export default function AdminLayout({ children, pageTitle, activeMenu: propActiveMenu, activeSubMenu: propActiveSubMenu }: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [productMenuOpen, setProductMenuOpen] = useState(false);
    const [statisticsMenuOpen, setStatisticsMenuOpen] = useState(false);
    const [invoicesMenuOpen, setInvoicesMenuOpen] = useState(false);
    const [user, setUser] = useState<{
        tenTaiKhoan?: string;
        tenNhanVien?: string;
        tenKhachHang?: string;
        vaiTro?: string;
    } | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Kiểm tra quyền truy cập: chỉ cho phép NHAN_VIEN hoặc QUAN_TRI_VIEN
    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("user");
            if (userData) {
                const u = JSON.parse(userData);
                setUser(u);
                if (!u.vaiTro || (u.vaiTro !== "NHAN_VIEN" && u.vaiTro !== "QUAN_TRI_VIEN")) {
                    if (u.vaiTro === "KHACH_HANG") {
                        alert("Bạn không có quyền truy cập trang này!");
                        router.push("/shop");
                    } else {
                        alert("Bạn không có quyền truy cập trang này!");
                        router.push("/login");
                    }
                }
            } else {
                router.push("/login");
            }
        }
    }, [router]);

    // Xác định menu đang active dựa vào pathname
    const getActiveMenu = () => {
        if (pathname.startsWith("/invoices")) return "invoices";
        if (pathname.startsWith("/dashboard")) return "dashboard";
        if (pathname.startsWith("/pos")) return "pos";
        if (pathname.startsWith("/NhanVien")) return "employees";
        if (pathname.startsWith("/KhachHang")) return "customers";
        if (pathname.startsWith("/ThongKe")) return "statistics";
        if (pathname.startsWith("/ChiTietSanPham")) return "products";
        if (pathname.startsWith("/Voucher")) return "promotions";
        // ... các case khác nếu cần
        return "dashboard";
    };

    // Xác định submenu đang active
    const getActiveSubMenu = () => {
        if (pathname === "/invoices/ofline") return "invoices-counter";
        if (pathname === "/invoices/online") return "invoices-online";
        if (pathname.startsWith("/ThongKe/DoanhThu")) return "revenue-statistics";
        if (pathname.startsWith("/ThongKe/SanPham")) return "product-statistics";
        if (pathname.startsWith("/ChiTietSanPham/HinhAnh")) return "images";
        if (pathname.startsWith("/ChiTietSanPham/KichThuoc")) return "sizes";
        if (pathname.startsWith("/ChiTietSanPham/MauSac")) return "colors";
        if (pathname.startsWith("/ChiTietSanPham/ThuongHieu")) return "brands";
        if (pathname.startsWith("/ChiTietSanPham/DanhMuc")) return "categories";
        return null;
    };
    const autoActiveMenu = getActiveMenu();
    const autoActiveSubMenu = getActiveSubMenu();
    const activeMenu = propActiveMenu || autoActiveMenu;
    const activeSubMenu = propActiveSubMenu || autoActiveSubMenu;

    // Tự động mở menu con khi vào trang con
    useEffect(() => {
        if (pathname.startsWith("/ThongKe/DoanhThu") || pathname.startsWith("/ThongKe/SanPham")) {
            setStatisticsMenuOpen(true);
        } else if (pathname === "/ThongKe/DoanhThu") {
            // Nếu vào trang chính Thống kê thì đóng menu con
            setStatisticsMenuOpen(false);
        }
        if (pathname.startsWith("/ChiTietSanPham")) {
            setProductMenuOpen(true);
        }
        if (pathname.startsWith("/invoices")) {
            setInvoicesMenuOpen(true);
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleMenuClick = (menuId: string) => {
        if (menuId === "dashboard") {
            router.push("/dashboard");
        } else if (menuId === "pos") {
            router.push("/pos");
        } else if (menuId === "employees") {
            router.push("/NhanVien/HienThi");
        } else if (menuId === "customers") {
            router.push("/KhachHang");
        } else if (menuId === "statistics") {
            setStatisticsMenuOpen(open => !open);
            // Nếu đang ở menu khác thì chuyển route sang /ThongKe/DoanhThu
            if (activeMenu !== "statistics") {
                router.push("/ThongKe/DoanhThu");
            }
            return;
        } else if (menuId === "products") {
            setProductMenuOpen(open => !open);
            // Nếu đang ở menu khác thì chuyển route sang /ChiTietSanPham
            if (activeMenu !== "products") {
                router.push("/ChiTietSanPham");
            }
            return;
        } else if (menuId === "invoices") {
            setInvoicesMenuOpen(open => !open);
            // Nếu đang ở menu khác thì chuyển route sang /invoices
            if (activeMenu !== "invoices") {
                router.push("/invoices");
            }
            return;
        } else if (menuId === "promotions") {
            router.push("/Voucher/HienThi");
            return;
        }
    };

    // Menu con chỉ mở nếu productMenuOpen true
    const shouldOpenProductMenu = productMenuOpen;
    const shouldOpenStatisticsMenu = statisticsMenuOpen;
    const shouldOpenInvoicesMenu = invoicesMenuOpen;

    return (
        <div style={{ height: "100vh", width: "100vw", background: "#fffbe6", display: "flex", overflow: "hidden", overflowX: "hidden" }}>
            {/* Sidebar */}
            <nav
                style={{
                    width: collapsed ? 70 : 300,
                    minWidth: collapsed ? 70 : 300,
                    maxWidth: collapsed ? 70 : 300,
                    background: "linear-gradient(180deg, #fffbe6 0%, #f9e7b4 50%, #fffbe6 100%)",
                    color: "#6b4f1d",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.3s cubic-bezier(.4,2,.6,1)",
                    boxShadow: "4px 0 20px rgba(181, 157, 58, 0.15)",
                    borderRight: "1px solid #e6d8b4",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(circle at 20% 80%, rgba(181, 157, 58, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(181, 157, 58, 0.03) 0%, transparent 50%)",
                    pointerEvents: "none"
                }} />
                <div
                    style={{
                        padding: collapsed ? "12px 8px 12px 8px" : "20px 20px 15px 20px",
                        borderBottom: "2px solid #e6d8b4",
                        display: "flex",
                        alignItems: "center",
                        minHeight: 70,
                        background: "linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)",
                        position: "relative",
                        zIndex: 1
                    }}
                >
                    <img
                        src="/logo-login.png"
                        alt="Logo"
                        style={{
                            width: collapsed ? 42 : 54,
                            height: collapsed ? 42 : 54,
                            objectFit: "contain",
                            borderRadius: 14,
                            background: "linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)",
                            boxShadow: "0 6px 16px rgba(181, 157, 58, 0.25), 0 2px 4px rgba(0,0,0,0.1)",
                            marginRight: collapsed ? 0 : 14,
                            border: "3px solid #b59d3a",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        }}
                    />
                    {!collapsed && (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ 
                                fontWeight: 800, 
                                fontSize: 20, 
                                color: "#b59d3a", 
                                letterSpacing: 0.8,
                                textShadow: "0 1px 2px rgba(181, 157, 58, 0.3)"
                            }}>SoleKing</span>
                            <span style={{ 
                                fontWeight: 700, 
                                fontSize: 15, 
                                color: "#8a7a2a", 
                                letterSpacing: 0.5,
                                marginTop: -2
                            }}>Store</span>
                        </div>
                    )}
                    <button
                        aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
                        onClick={() => setCollapsed((c) => !c)}
                        style={{
                            marginLeft: "auto",
                            background: "rgba(181, 157, 58, 0.1)",
                            border: "1px solid rgba(181, 157, 58, 0.2)",
                            cursor: "pointer",
                            color: "#b59d3a",
                            fontSize: 18,
                            padding: 8,
                            borderRadius: 8,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 4px rgba(181, 157, 58, 0.1)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(181, 157, 58, 0.15)";
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(181, 157, 58, 0.1)";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        <FaBars />
                    </button>
                </div>
                <nav 
                    className="allow-vertical-scroll"
                    style={{ 
                        flex: 1, 
                        padding: collapsed ? "8px 0" : "16px 0", 
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div style={{ flex: 1, overflowY: "visible", overflowX: "hidden", paddingRight: "4px" }}>
                        {menuItems.map((item) => (
                            <React.Fragment key={item.id}>
                            <button
                                style={{
                                    width: "100%",
                                    padding: collapsed ? "10px 0" : "12px 20px",
                                    background: activeMenu === item.id ? "linear-gradient(135deg, #fff 0%, #f9e7b4 100%)" : "none",
                                    border: "none",
                                    color: activeMenu === item.id ? "#b59d3a" : "#6b4f1d",
                                    textAlign: collapsed ? "center" : "left",
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: collapsed ? 0 : 12,
                                    fontSize: "0.95rem",
                                    borderLeft: activeMenu === item.id ? "4px solid #b59d3a" : "4px solid transparent",
                                    borderRadius: collapsed ? 10 : "0 12px 12px 0",
                                    position: "relative",
                                    fontWeight: activeMenu === item.id ? 700 : 600,
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    margin: "0 10px 6px 10px",
                                    boxShadow: activeMenu === item.id ? "0 4px 12px rgba(181, 157, 58, 0.2)" : "none",
                                    borderTop: activeMenu === item.id ? "1px solid rgba(181, 157, 58, 0.1)" : "none",
                                    borderBottom: activeMenu === item.id ? "1px solid rgba(181, 157, 58, 0.1)" : "none"
                                }}
                                onClick={() => handleMenuClick(item.id)}
                                onMouseEnter={(e) => {
                                    if (activeMenu !== item.id) {
                                        e.currentTarget.style.background = "rgba(181, 157, 58, 0.05)";
                                        e.currentTarget.style.transform = "translateX(4px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeMenu !== item.id) {
                                        e.currentTarget.style.background = "none";
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }
                                }}
                            >
                                <span style={{ 
                                    fontSize: 20, 
                                    filter: activeMenu === item.id ? "drop-shadow(0 1px 2px rgba(181, 157, 58, 0.3))" : "none"
                                }}>{item.icon}</span>
                                {!collapsed && <span style={{
                                    textShadow: activeMenu === item.id ? "0 1px 2px rgba(181, 157, 58, 0.2)" : "none"
                                }}>{item.label}</span>}
                                {item.children && !collapsed && (
                                    <span style={{ 
                                        marginLeft: "auto", 
                                        fontSize: 14, 
                                        color: "#8a7a2a",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}>
                                        {(item.id === "products" && shouldOpenProductMenu) || (item.id === "statistics" && shouldOpenStatisticsMenu) || (item.id === "invoices" && shouldOpenInvoicesMenu) ? "▼" : "▶"}
                                    </span>
                                )}
                            </button>
                            {item.children && ((item.id === "products" && shouldOpenProductMenu) || (item.id === "statistics" && shouldOpenStatisticsMenu) || (item.id === "invoices" && shouldOpenInvoicesMenu)) && !collapsed && (
                                <div style={{
                                    marginLeft: 28,
                                    marginRight: 10,
                                    borderLeft: "2px solid #e6d8b4",
                                    background: "linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)",
                                    borderRadius: "14px",   
                                    boxShadow: "0 3px 12px rgba(181, 157, 58, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                                    overflow: "hidden",
                                    marginTop: "4px",
                                    marginBottom: "8px",
                                    border: "1px solid rgba(181, 157, 58, 0.1)"
                                }}>
                                    {item.children.map((child) => (
                                        <button
                                            key={child.id}
                                            style={{
                                                padding: "10px 32px",
                                                cursor: "pointer",
                                                background: (activeSubMenu ? activeSubMenu === child.id : activeMenu === child.id) ? "linear-gradient(135deg, #b59d3a70 0%, #b59d3a50 100%)" : "transparent",
                                                color: (activeSubMenu ? activeSubMenu === child.id : activeMenu === child.id) ? "#b59d3a" : "#6b4f1d",
                                                fontWeight: (activeSubMenu ? activeSubMenu === child.id : activeMenu === child.id) ? 700 : 500,
                                                borderLeft: (activeSubMenu ? activeSubMenu === child.id : activeMenu === child.id) ? "4px solid #b59d3a" : "4px solid transparent",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                width: "100%",
                                                textAlign: "left",
                                                fontSize: "0.9rem",
                                                borderBottom: "1px solid rgba(181, 157, 58, 0.05)"
                                            }}
                                            onClick={() => {
                                                if (child.route && child.route !== "#") {
                                                    router.push(child.route);
                                                }
                                                // Không cần gọi onMenuChangeAction nữa
                                            }}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    </div>
                </nav>
                <div style={{ 
                    padding: collapsed ? 12 : 18, 
                    borderTop: "2px solid #e6d8b4", 
                    background: "linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)",
                    position: "relative",
                    zIndex: 1
                }}>
                    <button
                        style={{
                            width: "100%",
                            padding: collapsed ? 12 : 14,
                            background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                            border: "none",
                            color: "white",
                            borderRadius: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: collapsed ? 0 : 12,
                            justifyContent: "center",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            fontWeight: 600,
                            fontSize: collapsed ? 16 : "1rem",
                            boxShadow: "0 4px 12px rgba(181, 157, 58, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                        }}
                        onClick={handleLogout}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(181, 157, 58, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                        }}
                    >
                        <FiLogOut style={{ fontSize: 20 }} />
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </nav>
            
            {/* Main content */}
            <div style={{ 
                flex: 1, 
                overflow: "hidden", 
                display: "flex", 
                flexDirection: "column",
                minWidth: 0,
                maxWidth: collapsed ? "calc(100vw - 70px)" : "calc(100vw - 300px)",
                background: "linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)"
            }}>
                {/* Header */}
                <header style={{
                    background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                    padding: collapsed ? "20px 16px" : "20px 20px 15px 20px",
                    borderBottom: "2px solid rgba(181, 157, 58, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 4px 20px rgba(181, 157, 58, 0.08)",
                    flexShrink: 0,
                    position: "relative",
                    minHeight: 70
                }}>
                    <h1 style={{ 
                        margin: 0, 
                        color: "#6b4f1d", 
                        fontSize: "2rem",
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                        textShadow: "0 2px 4px rgba(181, 157, 58, 0.1)"
                    }}>
                        {pageTitle || menuItems.find(item => item.id === activeMenu)?.label || "Quản lý"}
                    </h1>
                    {/* Hiển thị tài khoản đăng nhập */}
                    {user && (
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12,
                            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(249, 231, 180, 0.8) 100%)",
                            padding: "12px 16px",
                            borderRadius: "16px",
                            border: "1px solid rgba(181, 157, 58, 0.1)",
                            boxShadow: "0 4px 12px rgba(181, 157, 58, 0.1)"
                        }}>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #f9e7b4 0%, #b59d3a 100%)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 18,
                                border: "2px solid #b59d3a",
                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.2)"
                            }}>
                                {(user.tenTaiKhoan ? user.tenTaiKhoan.charAt(0).toUpperCase() : (user.tenNhanVien ? user.tenNhanVien.charAt(0).toUpperCase() : (user.tenKhachHang ? user.tenKhachHang.charAt(0).toUpperCase() : "U")))}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ 
                                    fontWeight: 600, 
                                    color: "#6b4f1d",
                                    fontSize: "0.95rem"
                                }}>
                                    {user.tenNhanVien || user.tenTaiKhoan || user.tenKhachHang || "Tài khoản"}
                                </span>
                                {user.vaiTro && (
                                    <span style={{ 
                                        fontWeight: 500, 
                                        color: "#8a7a2a", 
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.3px"
                                    }}>
                                        {user.vaiTro === "NHAN_VIEN" ? "Nhân viên" : user.vaiTro === "QUAN_TRI_VIEN" ? "Quản trị viên" : user.vaiTro}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </header>
                
                {/* Content area */}
                <div style={{ 
                    padding: 40, 
                    flex: 1, 
                    overflowY: "auto", 
                    overflowX: "hidden",
                    minHeight: 0,
                    background: "transparent"
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

