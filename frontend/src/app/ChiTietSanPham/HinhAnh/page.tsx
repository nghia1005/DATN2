"use client";

import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "@/component/Admin-Layout";
import { FaSearch, FaSyncAlt, FaTimes, FaEdit } from "react-icons/fa";
import { FaTh, FaTable } from "react-icons/fa";

interface ChiTietSanPham {
  idChiTietSanPham: number;
  tenSanPham: string;
  maSanPham: string;
  duongDanHinhAnh: string | null;
  idSanPham: number;
  idHinhAnh: number | null;
  soLuong: number;
}

export default function HinhAnhPage() {
  const [chiTietList, setChiTietList] = useState<ChiTietSanPham[]>([]);
  const [sanPhamList, setSanPhamList] = useState<{ idSanPham: number; tenSanPham: string }[]>([]);
  const [selectedSanPham, setSelectedSanPham] = useState<number>(-1); // Mặc định là -1 (tất cả)
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  // Removed searchTerm and appliedSearch state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch("http://localhost:8080/chi-tiet-san-pham/hien-thi")
      .then((res) => res.json())
      .then((data) => {
        setChiTietList(data);
        const sanPhams = Array.from(
          new Map(data.map((ct: ChiTietSanPham) => [ct.idSanPham, { idSanPham: ct.idSanPham, tenSanPham: ct.tenSanPham }])).values()
        ) as { idSanPham: number; tenSanPham: string }[];
        setSanPhamList(sanPhams);
      })
      .finally(() => setLoading(false));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, ct: ChiTietSanPham) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Upload ảnh lên backend
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("http://localhost:8080/hinh-anh/upload", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.idHinhAnh) {
      alert("Upload ảnh thất bại!");
      return;
    }
    // Gọi API cập nhật chi tiết sản phẩm với idHinhAnh mới
    const updateRes = await fetch(`http://localhost:8080/chi-tiet-san-pham/sua/${ct.idChiTietSanPham}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ct,
        idHinhAnh: uploadData.idHinhAnh,
        duongDanHinhAnh: uploadData.fileUrl, // optional, backend sẽ tự lấy từ idHinhAnh
      }),
    });
    if (updateRes.ok) {
      fetchData();
    } else {
      alert("Cập nhật chi tiết sản phẩm thất bại!");
    }
  };

  // Lọc chi tiết sản phẩm: chỉ lọc theo sản phẩm, không còn lọc theo từ khóa
  let filteredChiTiet: ChiTietSanPham[] = chiTietList;
  if (selectedSanPham && selectedSanPham !== -1 && selectedSanPham !== ("all" as any)) {
    filteredChiTiet = chiTietList.filter((ct) => ct.idSanPham === selectedSanPham);
  }

  return (
    <AdminLayout
      activeMenu="products"
      activeSubMenu="images"
      pageTitle="Hình ảnh sản phẩm"
    >
      <div style={{ padding: 24 }}>
        <h1>Danh sách hình ảnh sản phẩm</h1>
        <div style={{ marginTop: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <label style={{ marginBottom: 0, marginRight: 8, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Chọn sản phẩm:</label>
          <select
            value={selectedSanPham === -1 ? "all" : selectedSanPham}
            onChange={(e) => {
              if (e.target.value === "all") setSelectedSanPham(-1);
              else setSelectedSanPham(Number(e.target.value));
            }}
            style={{ padding: 8, minWidth: 220, borderRadius: 8, border: '1.5px solid #b59d3a55', background: '#fff', fontSize: 16, color: '#222', outline: 'none', boxShadow: '0 2px 8px #b59d3a11', marginRight: 12 }}
          >
            <option value="">-- Chọn sản phẩm --</option>
            <option value="all">Tất cả sản phẩm</option>
            {sanPhamList.map((sp) => (
              <option key={sp.idSanPham} value={sp.idSanPham}>
                {sp.tenSanPham}
              </option>
            ))}
          </select>
          <button
            style={{
              padding: '8px 14px', // giảm padding
              background: '#fff',
              color: '#b59d3a',
              border: '1.5px solid #b59d3a55',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #b59d3a11',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 40, // giảm chiều cao
            }}
            onClick={() => setSelectedSanPham(-1)} // Luôn set về -1 khi xóa lọc
            title="Xóa lọc sản phẩm"
          >
            <FaTimes style={{ fontSize: 18, color: '#b59d3a' }} />
            Xóa lọc
          </button>
        </div>
        {/* Nút chuyển đổi chế độ xem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontWeight: 500 }}>Chế độ xem:</span>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? '#b59d3a' : '#fff',
              color: viewMode === 'grid' ? '#fff' : '#b59d3a',
              border: '1.5px solid #b59d3a',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
            }}
            title="Xem dạng lưới"
          >
            <FaTh /> Lưới
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? '#b59d3a' : '#fff',
              color: viewMode === 'table' ? '#fff' : '#b59d3a',
              border: '1.5px solid #b59d3a',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
            }}
            title="Xem dạng bảng"
          >
            <FaTable /> Bảng
          </button>
        </div>
        {loading && <div>Đang tải dữ liệu...</div>}
        {/* Luôn render danh sách khi không loading */}
        {!loading && (
          viewMode === 'grid' ? (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 24 }}>
              {filteredChiTiet.map((ct) => (
                <div
                  key={ct.idChiTietSanPham}
                  style={{
                    textAlign: "center",
                    width: 170,
                    minHeight: 210,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px #b59d3a11",
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  {ct.duongDanHinhAnh ? (
                    (() => {
                      const fileName = ct.duongDanHinhAnh?.split("/").pop();
                      return (
                        <>
                          <img
                            src={`http://localhost:8080/hinh-anh/view/${fileName}`}
                            alt={ct.tenSanPham}
                            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                          />
                          <br />
                          <button
                            style={{ marginTop: 8, padding: "4px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #b59d3a", background: "#fffbe6", color: "#b59d3a", cursor: "pointer" }}
                            onClick={() => fileInputRefs.current[ct.idChiTietSanPham]?.click()}
                          >
                            Sửa ảnh
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            ref={el => { fileInputRefs.current[ct.idChiTietSanPham] = el; }}
                            onChange={e => handleFileChange(e, ct)}
                          />
                        </>
                      );
                    })()
                  ) : (
                    <></>
                  )}
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      minHeight: 36,
                      maxWidth: 150,
                      overflow: "hidden",
                      wordBreak: "break-word",
                      textAlign: "center",
                    }}
                    title={`${ct.maSanPham} (${ct.tenSanPham})`}
                  >
                    {ct.maSanPham} ({ct.tenSanPham})
                  </div>
                </div>
              ))}
              {filteredChiTiet.length === 0 && <div>Không có chi tiết sản phẩm nào.</div>}
            </div>
          ) : (
            <div style={{ marginTop: 24, overflowX: 'auto' }}>
              <div style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 12px #b59d3a22',
                padding: 16,
                maxWidth: '100%',
                overflow: 'hidden',
              }}>
                <table style={{
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  width: '100%',
                  minWidth: 700,
                  background: 'transparent',
                  tableLayout: 'fixed',
                }}>
                  <thead>
                    <tr>
                        <th style={{ padding: '10px 8px', borderBottom: '1.5px solid', fontWeight: 700, width: 60, textAlign: 'center' }}>STT</th>
                        <th style={{ padding: '10px 8px', borderBottom: '1.5px solid', fontWeight: 700, width: 100, textAlign: 'center' }}>Mã SP</th>
                        <th style={{ padding: '10px 8px', borderBottom: '1.5px solid', fontWeight: 700, width: 260, textAlign: 'left' }}>Tên sản phẩm</th>
                        <th style={{ padding: '10px 8px', borderBottom: '1.5px solid', fontWeight: 700, width: 90, textAlign: 'center' }}>Ảnh</th>
                        <th style={{ padding: '10px 8px', borderBottom: '1.5px solid', fontWeight: 700, width: 90, textAlign: 'center' }}>Số lượng</th>
                        <th style={{ height: 56, padding: '10px 8px', borderBottom: '1.5px solid', fontWeight: 700, width: 110, textAlign: 'center', verticalAlign: 'middle' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChiTiet.map((ct, idx) => (
                      <tr key={ct.idChiTietSanPham} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>{ct.maSanPham}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'left', verticalAlign: 'middle' }}>{ct.tenSanPham}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                          {ct.duongDanHinhAnh ? (
                            (() => {
                              const fileName = ct.duongDanHinhAnh?.split("/").pop();
                              return (
                                <img
                                  src={`http://localhost:8080/hinh-anh/view/${fileName}`}
                                  alt={ct.tenSanPham}
                                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                                />
                              );
                            })()
                          ) : (
                            <span style={{ color: '#aaa' }}>Không có ảnh</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>{ct.soLuong}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <button
                            style={{
                              background: '#FFD600',
                              border: 'none',
                              borderRadius: 8,
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'box-shadow 0.2s',
                              boxShadow: '0 2px 8px #b59d3a22',
                            }}
                            title="Sửa ảnh"
                            onClick={() => fileInputRefs.current[ct.idChiTietSanPham]?.click()}
                            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px #b59d3a33')}
                            onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px #b59d3a22')}
                          >
                            <FaEdit style={{ color: '#222', fontSize: 20 }} />
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            ref={el => { fileInputRefs.current[ct.idChiTietSanPham] = el; }}
                            onChange={e => handleFileChange(e, ct)}
                          />
                        </td>
                      </tr>
                    ))}
                    {filteredChiTiet.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: 24, color: '#888', textAlign: 'center', fontStyle: 'italic' }}>Không có dữ liệu hình ảnh.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
} 