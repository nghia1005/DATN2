"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaPowerOff, FaSearch, FaSyncAlt, FaChevronLeft, FaChevronRight, FaTimes, FaEyeSlash } from "react-icons/fa";
import AdminLayout from "../../../component/Admin-Layout";
// import ThemNhanVien from "./ThemNhanVien";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// CSS for loading animation
const loadingStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes modalSlideIn {
    0% { 
      opacity: 0; 
      transform: scale(0.9) translateY(-20px); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
`;


export default function NhanVienPage() {
    const [activeMenu, setActiveMenu] = useState("employees");
    const [nhanViens, setNhanViens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [filterVaiTro, setFilterVaiTro] = useState("");
    const [filterTrangThai, setFilterTrangThai] = useState("");
    const [filterGioiTinh, setFilterGioiTinh] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailNhanVien, setDetailNhanVien] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [confirmToggleId, setConfirmToggleId] = useState<number | null>(null);
    const [confirmNote, setConfirmNote] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const searchParams = useSearchParams();

    // Hàm format ngày theo định dạng Việt Nam
    const formatDateToVietnamese = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString;
        }
    };

    useEffect(() => {
        const pageParam = searchParams.get("page");
        if (pageParam) {
            setCurrentPage(Number(pageParam) - 1);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchNhanViens();
    }, [currentPage, filterTrangThai, filterGioiTinh]);

    const fetchNhanViens = () => {
        setLoading(true);
        let url = `http://localhost:8080/nhan-vien/phan-trang?page=${currentPage}&size=${itemsPerPage}`;
        if (filterTrangThai) {
            url += `&trangThai=${encodeURIComponent(filterTrangThai)}`;
        }
        if (filterGioiTinh) {
            url += `&gioiTinh=${filterGioiTinh}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setNhanViens(data.data.content || []);
                setTotalElements(data.data.totalElements || 0);
                setTotalPages(data.data.totalPages || 1);
                setLoading(false);
            });
    };

    const handleSearch = () => {
        if (!searchValue.trim()) {
            fetchNhanViens();
            return;
        }
        setLoading(true);
        fetch(`http://localhost:8080/nhan-vien/tim-kiem?keyword=${encodeURIComponent(searchValue)}`)
            .then(res => res.json())
            .then(data => {
                setNhanViens(data.data || []);
                setNhanViens(data.data.sort((a: any, b: any) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()));
                setLoading(false);
            });
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Filter and paginate data
    const filteredNhanViens = nhanViens.filter(nv => {
        const matchVaiTro = filterVaiTro ? String(nv.idVaiTro) === filterVaiTro : true;
        const matchTrangThai = filterTrangThai ? nv.trangThai === filterTrangThai : true;
        const matchGioiTinh = filterGioiTinh ? nv.gioiTinh === filterGioiTinh : true;
        return matchVaiTro && matchTrangThai && matchGioiTinh;
    });

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleRequestToggle = (id: number) => {
        setConfirmToggleId(id);
        setConfirmNote('');
    };
    const handleConfirmToggle = async () => {
        if (confirmToggleId == null) return;
        setToggleLoadingId(confirmToggleId);
        setConfirmToggleId(null);
        try {
            const res = await fetch(`http://localhost:8080/nhan-vien/doi-trang-thai/${confirmToggleId}`, { method: "PUT" });
            const data = await res.json();
            if (data.success) showToast('success', 'Đổi trạng thái thành công!');
            else showToast('error', data.message || 'Đổi trạng thái thất bại!');
            fetchNhanViens();
        } catch {
            showToast('error', 'Không thể kết nối server!');
        }
        setToggleLoadingId(null);
    };

    const handleShowDetail = async (id: number) => {
        setDetailLoading(true);
        setShowDetailModal(true);
        try {
            const res = await fetch(`http://localhost:8080/nhan-vien/chi-tiet/${id}`);
            const data = await res.json();
            setDetailNhanVien(data.data || null);
        } catch {
            setDetailNhanVien(null);
        }
        setDetailLoading(false);
    };

    const handleToggleTrangThai = async (id: number) => {
        setToggleLoadingId(id);
        try {
            await fetch(`http://localhost:8080/nhan-vien/doi-trang-thai/${id}`, { method: "PUT" });
            fetchNhanViens();
        } catch {}
        setToggleLoadingId(null);
    };

    return (
        <>
            <style>{loadingStyles}</style>
        <AdminLayout 
            activeMenu={activeMenu} 
            onMenuChangeAction={setActiveMenu}
            pageTitle="Quản lý nhân viên"
        >
            <div style={{ padding: 24 }}>

                {/* Modern Search & Filter Section */}
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: 32,
                    marginBottom: 32,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                            {/* Hàng 1: Search và Tìm kiếm */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1 1 350px', minWidth: 250 }}>
                            <input
                                type="text"
                                    placeholder="Tìm kiếm nhân viên theo tên, mã, email..."
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 40px',
                                        borderRadius: 12,
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        fontSize: 14,
                                        background: '#f8fafc',
                                        color: '#1e293b',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.08)'
                                    }}
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.2)';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                        e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.08)';
                                        e.target.style.background = '#f8fafc';
                                    }}
                                />
                                <FaSearch style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#667eea',
                                    fontSize: 16
                                }} />
                            </div>
                            
                            <button
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 12,
                                    padding: '12px 20px',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                                    minWidth: 'fit-content',
                                    whiteSpace: 'nowrap'
                                }}
                                onClick={handleSearch}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
                                }}
                            >
                                <FaSearch style={{ fontSize: 16 }} />
                                Tìm kiếm
                            </button>
                            </div>
                            
                            {/* Hàng 2: Filters và Làm mới */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <select 
                                value={filterTrangThai} 
                                onChange={e => setFilterTrangThai(e.target.value)} 
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    background: '#f8fafc',
                                    color: '#1e293b',
                                    fontSize: 14,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.08)',
                                    minWidth: 140
                                }}
                            >
                                <option value="">📊 Tất cả trạng thái</option>
                                <option value="Hoạt động">✅ Hoạt động</option>
                                <option value="Ngừng hoạt động">❌ Ngừng hoạt động</option>
                            </select>
                            
                            <select
                                value={filterGioiTinh}
                                onChange={e => setFilterGioiTinh(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    background: '#f8fafc',
                                    color: 'rgba(30, 41, 59, 0.8)',
                                    fontSize: 14,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.08)',
                                    minWidth: 140
                                }}
                            >
                                <option value="">👥 Tất cả giới tính</option>
                                <option value="true">👨 Nam</option>
                                <option value="false">👩 Nữ</option>
                            </select>
                            
                            <button
                                style={{
                                    background: '#fff',
                                    color: '#667eea',
                                    border: '2px solid rgba(102, 126, 234, 0.3)',
                                    borderRadius: 12,
                                    padding: '12px 20px',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.1)',
                                    minWidth: 'fit-content',
                                    whiteSpace: 'nowrap'
                                }}
                                onClick={() => { setSearchValue(""); fetchNhanViens(); }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = '#667eea';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FaSyncAlt style={{ fontSize: 16 }} />
                                Làm mới
                            </button>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Link href="/NhanVien/ThemNhanVien">
                                <button
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 12,
                                        padding: '10px 14px',
                                        height: '42px',
                                        fontWeight: 700,
                                        fontSize: 15,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                                                                            whiteSpace: 'nowrap',
                                    textTransform: 'none',
                                    flexShrink: 0
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
                                    }}
                                >
                                    <span style={{ fontSize: 18, fontWeight: 800 }}>+</span>
                                     Thêm nhân viên
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Modern Table Section */}
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(181, 157, 58, 0.08)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Table Header Decoration */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #b59d3a 100%)'
                    }} />
                    
                {loading ? (
                        <div style={{
                            padding: 80,
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '1.2rem',
                            fontWeight: 600
                        }}>
                            <div style={{
                                width: 50,
                                height: 50,
                                border: '4px solid #f1f5f9',
                                borderTop: '4px solid #667eea',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 24px'
                            }} />
                            <div style={{ marginBottom: 8 }}>🔄 Đang tải dữ liệu nhân viên...</div>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Vui lòng chờ trong giây lát</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            background: "#fff",
                                minWidth: 1000,
                                fontSize: "0.8rem"
                        }}>
                            <thead>
                            <tr style={{
                                background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)',
                                color: '#fff',
                                position: 'relative'
                            }}>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>#</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Mã NV</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "left", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Tên nhân viên</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Giới tính</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Ngày sinh</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Số điện thoại</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Email</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Trạng thái</th>
                                <th style={{
                                    padding: "8px 4px", 
                                    fontWeight: 700, 
                                    textAlign: "center", 
                                    fontSize: "0.8rem", 
                                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                                    color: '#fff'
                                }}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {nhanViens.map((nv, idx) => (
                                <tr key={nv.idNhanVien} style={{
                                    background: idx % 2 === 0 ? "#fff" : "rgba(102, 126, 234, 0.02)",
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)';
                                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
                                    e.currentTarget.style.borderRadius = '12px';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "rgba(102, 126, 234, 0.02)";
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderRadius = '0';
                                }}>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#374151", 
                                        padding: "8px 4px", 
                                        fontWeight: 700,
                                        fontSize: "0.8rem"
                                    }}>
                                        {currentPage * itemsPerPage + idx + 1}
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#1f2937", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        {nv.maNhanVien}
                                    </td>
                                    <td style={{ 
                                        textAlign: "left", 
                                        color: "#1f2937", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937', marginBottom: 2 }}>
                                                {nv.tenNhanVien}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#1f2937", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        {nv.gioiTinh === true ? 'Nam' : 'Nữ'}
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#374151", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        {formatDateToVietnamese(nv.ngaySinh)}
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#1f2937", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        {nv.soDienThoai}
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#1f2937", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        {nv.email}
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#1f2937", 
                                        padding: "12px 8px", 
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        {nv.trangThai === "Hoạt động" ? (
                                            <span style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: '#fff',
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                display: 'inline-block',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                            }}>
                                                Hoạt động
                                            </span>
                                        ) : nv.trangThai === "Ngừng hoạt động" ? (
                                            <span style={{
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                color: '#fff',
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                display: 'inline-block',
                                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                            }}>
                                                Ngừng hoạt động
                                            </span>
                                        ) : (
                                            nv.trangThai || ""
                                        )}
                                    </td>
                                    <td style={{ 
                                        textAlign: "center", 
                                        color: "#1f2937", 
                                        padding: "12px 8px",
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <button
                                                    style={{ 
                                                        background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                                                        color: "#fff", 
                                                        border: 'none', 
                                                        borderRadius: 8, 
                                                        padding: 8, 
                                                        cursor: "pointer", 
                                                        fontWeight: 600, 
                                                        fontSize: 12, 
                                                        display: "inline-flex", 
                                                        alignItems: "center", 
                                                        justifyContent: "center",
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 8px rgba(181, 157, 58, 0.3)'
                                                    }}
                                                title="Xem chi tiết"
                                                onClick={() => handleShowDetail(nv.idNhanVien)}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.3)';
                                                    }}
                                                >
                                                    <FaEye style={{ fontSize: 12 }} />
                                            </button>
                                            <Link href={`/NhanVien/SuaNhanVien?id=${nv.idNhanVien}`}>
                                                <button
                                                    style={{ 
                                                        background: 'linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)', 
                                                        color: "#fff", 
                                                        border: 'none', 
                                                        borderRadius: 8, 
                                                        padding: 8, 
                                                        cursor: "pointer", 
                                                        fontWeight: 600, 
                                                        fontSize: 12, 
                                                        display: "inline-flex", 
                                                        alignItems: "center", 
                                                        justifyContent: "center",
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 8px rgba(181, 157, 58, 0.3)'
                                                    }}
                                                    title="Chỉnh sửa"
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 157, 58, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 157, 58, 0.3)';
                                                    }}
                                                >
                                                    <FaEdit style={{ fontSize: 12 }} />
                                                </button>
                                            </Link>
                                            <button
                                                style={{ 
                                                    background: nv.trangThai === "Hoạt động" 
                                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                                    color: "#fff", 
                                                    border: 'none', 
                                                    borderRadius: 8, 
                                                    padding: 8, 
                                                    cursor: "pointer", 
                                                    fontWeight: 600, 
                                                    fontSize: 12, 
                                                    display: "inline-flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "center",
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: nv.trangThai === "Hoạt động" 
                                                        ? '0 2px 8px rgba(239, 68, 68, 0.3)' 
                                                        : '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                }}
                                                title={nv.trangThai === "Hoạt động" ? "Ngừng hoạt động" : "Kích hoạt"}
                                                onClick={() => handleRequestToggle(nv.idNhanVien)}
                                                disabled={toggleLoadingId === nv.idNhanVien}
                                                onMouseOver={(e) => {
                                                    if (toggleLoadingId !== nv.idNhanVien) {
                                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                                        e.currentTarget.style.boxShadow = nv.trangThai === "Hoạt động" 
                                                            ? '0 4px 12px rgba(239, 68, 68, 0.4)' 
                                                            : '0 4px 12px rgba(16, 185, 129, 0.4)';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (toggleLoadingId !== nv.idNhanVien) {
                                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                        e.currentTarget.style.boxShadow = nv.trangThai === "Hoạt động" 
                                                            ? '0 2px 8px rgba(239, 68, 68, 0.3)' 
                                                            : '0 2px 8px rgba(16, 185, 129, 0.3)';
                                                    }
                                                }}
                                            >
                                                {toggleLoadingId === nv.idNhanVien ? (
                                                    <div style={{
                                                        width: 12,
                                                        height: 12,
                                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                                        borderTop: '2px solid #fff',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }} />
                                                ) : (
                                                    <FaPowerOff style={{ fontSize: 12 }} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 32px", background: "#fffbe6cc", marginTop: "20px", borderRadius: "10px", gap: "10px", boxShadow: "0 2px 8px #bcdffb33" }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    style={{
                                        minWidth: 70,
                                        height: 38,
                                        borderRadius: 20,
                                        border: "1.5px solid #e3f1fb",
                                        background: "#fff",
                                        color: "#222",
                                        fontWeight: 400,
                                        fontSize: 12,
                                        margin: "0 6px",
                                        outline: "none",
                                        cursor: currentPage === 0 ? "not-allowed" : "pointer",
                                        opacity: currentPage === 0 ? 0.6 : 0.85,
                                        boxShadow: "0 1px 4px #bcdffb22"
                                    }}
                                >
                                    TRƯỚC
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        style={{
                                            minWidth: 38,
                                            height: 38,
                                            borderRadius: 20,
                                            border: i === currentPage ? "none" : "1.5px solid #e3f1fb",
                                            background: i === currentPage ? "#e5e2daaa" : "#fff",
                                            color: "#222",
                                            fontWeight: i === currentPage ? 700 : 600,
                                            fontSize: 12,
                                            margin: "0 6px",
                                            outline: "none",
                                            cursor: "pointer",
                                            opacity: i === currentPage ? 0.92 : 0.85,
                                            boxShadow: i === currentPage ? "0 1px 4px #bcdffb22" : undefined
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    style={{
                                        minWidth: 70,
                                        height: 38,
                                        borderRadius: 20,
                                        border: "1.5px solid #e3f1fb",
                                        background: "#fff",
                                        color: "#222",
                                        fontWeight: 400,
                                        fontSize: 12,
                                        margin: "0 6px",
                                        outline: "none",
                                        cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
                                        opacity: currentPage === totalPages - 1 ? 0.6 : 0.85,
                                        boxShadow: "0 1px 4px #bcdffb22"
                                    }}
                                >
                                    SAU
                                </button>
                            </div>
                        )}
                        </div>
                )}
            </div>
            {/* Modal xem chi tiết nhân viên */}
            {showDetailModal && (
                <div style={{ 
                    position: "fixed", 
                    top: 0, 
                    left: 0, 
                    width: "100vw", 
                    height: "100vh", 
                    background: "rgba(0, 0, 0, 0.6)", 
                    zIndex: 1000, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    backdropFilter: "blur(4px)"
                }}>
                    <div style={{ 
                        background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)", 
                        padding: 40, 
                        borderRadius: 24, 
                        minWidth: 480, 
                        maxWidth: 600,
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(102, 126, 234, 0.1)", 
                        position: "relative",
                        border: "1px solid rgba(102, 126, 234, 0.1)",
                        animation: "modalSlideIn 0.3s ease-out"
                    }}>
                        {/* Header với gradient */}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 6,
                            background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #b59d3a 100%)",
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24
                        }} />
                        
                        <button 
                            type="button" 
                            onClick={() => setShowDetailModal(false)} 
                            style={{ 
                                position: "absolute", 
                                top: 20, 
                                right: 20, 
                                background: "rgba(102, 126, 234, 0.1)", 
                                border: "none", 
                                fontSize: 18, 
                                cursor: "pointer", 
                                color: "#667eea",
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)";
                                e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <FaTimes />
                        </button>
                        
                        <div style={{ marginBottom: 32, textAlign: "center" }}>
                            <div style={{
                                width: 60,
                                height: 60,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
                            }}>
                                <span style={{ fontSize: 24, color: "#fff", fontWeight: 700 }}>👤</span>
                            </div>
                            <h3 style={{ 
                                margin: 0, 
                                color: "#1e293b", 
                                fontWeight: 800, 
                                fontSize: 24,
                                background: "linear-gradient(135deg, #667eea 0%, #b59d3a 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}>
                                Chi tiết nhân viên
                            </h3>
                        </div>
                        
                        {detailLoading ? (
                            <div style={{ 
                                textAlign: 'center', 
                                color: '#64748b', 
                                padding: 40,
                                fontSize: 16
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    border: '3px solid #f1f5f9',
                                    borderTop: '3px solid #667eea',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 16px'
                                }} />
                                <div style={{ fontWeight: 600 }}>🔄 Đang tải thông tin...</div>
                            </div>
                        ) : detailNhanVien ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: 20,
                                background: "#f8fafc",
                                padding: 24,
                                borderRadius: 16,
                                border: "1px solid rgba(102, 126, 234, 0.1)"
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 16 
                                }}>
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🆔 Mã nhân viên</div>
                                        <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{detailNhanVien.maNhanVien}</div>
                                    </div>
                                    
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>👤 Họ tên</div>
                                        <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{detailNhanVien.tenNhanVien}</div>
                                    </div>
                                    
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🔑 Tên đăng nhập</div>
                                        <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{detailNhanVien.tenTaiKhoan}</div>
                                    </div>
                                    
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>📧 Email</div>
                                        <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{detailNhanVien.email}</div>
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 16 
                                }}>
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>📱 Số điện thoại</div>
                                        <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{detailNhanVien.soDienThoai}</div>
                                    </div>
                                    
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🎂 Ngày sinh</div>
                                        <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{formatDateToVietnamese(detailNhanVien.ngaySinh)}</div>
                                    </div>
                                    
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>👥 Giới tính</div>
                                        <div style={{ 
                                            color: '#1e293b', 
                                            fontSize: 16, 
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            {detailNhanVien.gioiTinh === true ? (
                                                <>
                                                    <span style={{ fontSize: 18 }}>👨</span>
                                                    Nam
                                                </>
                                            ) : detailNhanVien.gioiTinh === false ? (
                                                <>
                                                    <span style={{ fontSize: 18 }}>👩</span>
                                                    Nữ
                                                </>
                                            ) : ""}
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: "16px 20px", 
                                        borderRadius: 12, 
                                        border: "1px solid rgba(102, 126, 234, 0.1)",
                                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                    }}>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>📊 Trạng thái</div>
                                        <div style={{ 
                                            color: detailNhanVien.trangThai === 'Hoạt động' ? '#10b981' : '#ef4444', 
                                            fontSize: 16, 
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <span style={{ fontSize: 18 }}>
                                                {detailNhanVien.trangThai === 'Hoạt động' ? '✅' : '❌'}
                                            </span>
                                            {detailNhanVien.trangThai}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Địa chỉ - chiếm full width */}
                                <div style={{ 
                                    gridColumn: '1 / -1',
                                    background: "#fff", 
                                    padding: "20px 24px", 
                                    borderRadius: 12, 
                                    border: "1px solid rgba(102, 126, 234, 0.1)",
                                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.05)"
                                }}>
                                    <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📍 Địa chỉ</div>
                                    <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
                                        {detailNhanVien.thanhPho && detailNhanVien.quanHuyen && detailNhanVien.xaPhuong 
                                        ? `${detailNhanVien.ngoNgach ? detailNhanVien.ngoNgach + ', ' : ''}${detailNhanVien.xaPhuong}, ${detailNhanVien.quanHuyen}, ${detailNhanVien.thanhPho}`
                                        : detailNhanVien.diaChi || 'Chưa có thông tin địa chỉ'
                                        }
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ 
                                color: '#ef4444', 
                                textAlign: 'center', 
                                padding: 40,
                                background: "#fef2f2",
                                borderRadius: 16,
                                border: "1px solid rgba(239, 68, 68, 0.2)"
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Không tìm thấy thông tin</div>
                                <div style={{ fontSize: 14, color: '#64748b' }}>Vui lòng thử lại sau</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Toast/thông báo */}
            {toast && (
                <div style={{ position: 'fixed', top: 30, right: 30, zIndex: 2000, background: toast.type === 'success' ? '#2ecc40' : '#e74c3c', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, boxShadow: '0 2px 12px #0002', minWidth: 220, textAlign: 'center' }}>
                    {toast.message}
                </div>
            )}
            {/* Modal xác nhận đổi trạng thái */}
            {confirmToggleId !== null && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#0008", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", padding: 32, borderRadius: 12, minWidth: 340, boxShadow: "0 4px 24px #0002", position: "relative" }}>
                        <h3 style={{ color: "#b59d3a", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Xác nhận</h3>
                        <div style={{ color: '#333', fontSize: 16, marginBottom: 16 }}>Bạn có muốn thay đổi trạng thái tài khoản này không?</div>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirmToggleId(null)} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: '#eee', color: '#333', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleConfirmToggle} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: '#b59d3a', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Đồng ý</button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
        </>
    );
} 