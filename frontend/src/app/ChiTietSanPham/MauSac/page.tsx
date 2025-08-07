"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/component/Admin-Layout";
import { FaTimes, FaEdit, FaSave, FaPlus } from "react-icons/fa";

interface ChiTietSanPham {
  idChiTietSanPham: number;
  tenSanPham: string;
  maSanPham: string;
  idSanPham: number;
  idMauSac: number;
  tenMauSac: string;
  soLuong: number;
}
interface MauSac { idMauSac: number; mauSac: string; }

export default function MauSacPage() {
  const [chiTietList, setChiTietList] = useState<ChiTietSanPham[]>([]);
  const [sanPhamList, setSanPhamList] = useState<{ idSanPham: number; tenSanPham: string }[]>([]);
  const [mauSacList, setMauSacList] = useState<MauSac[]>([]);
  const [selectedSanPham, setSelectedSanPham] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<ChiTietSanPham | null>(null);
  const [newMauSac, setNewMauSac] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMauSacValue, setAddMauSacValue] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
    fetch("http://localhost:8080/mau-sac/hien-thi")
      .then((res) => res.json())
      .then(setMauSacList);
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

  let filteredChiTiet: ChiTietSanPham[] = chiTietList;
  if (selectedSanPham && selectedSanPham !== -1 && selectedSanPham !== ("all" as any)) {
    filteredChiTiet = chiTietList.filter((ct) => ct.idSanPham === selectedSanPham);
  }

  const handleEdit = (ct: ChiTietSanPham) => {
    setEditItem(ct);
    setNewMauSac(ct.idMauSac);
  };

  const handleSave = async () => {
    if (!editItem || !newMauSac) return;
    setSaving(true);
    const res = await fetch(`http://localhost:8080/chi-tiet-san-pham/sua/${editItem.idChiTietSanPham}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editItem, idMauSac: newMauSac }),
    });
    setSaving(false);
    if (res.ok) {
      setEditItem(null);
      fetchData();
    } else {
      alert("Cập nhật màu sắc thất bại!");
    }
  };

  return (
    <AdminLayout
      activeMenu="products"
      activeSubMenu="colors"
      pageTitle="Màu sắc sản phẩm"
    >
      <div style={{ padding: 24 }}>
        <h1>Màu sắc sản phẩm</h1>
        <div style={{ marginTop: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <label style={{ marginBottom: 0, marginRight: 8, fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>Chọn sản phẩm:</label>
          <select
            value={selectedSanPham === null ? "" : selectedSanPham === -1 ? "all" : selectedSanPham}
            onChange={(e) => {
              if (e.target.value === "all") setSelectedSanPham(-1);
              else if (e.target.value === "") setSelectedSanPham(null);
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
              padding: '8px 14px',
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
              height: 40,
            }}
            onClick={() => setSelectedSanPham(null)}
            title="Xóa lọc sản phẩm"
          >
            <FaTimes style={{ fontSize: 18, color: '#b59d3a' }} />
            Xóa lọc
          </button>
          </div>
          <button
            style={{
              padding: '8px 18px',
              background: '#b59d3a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #b59d3a22',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
            }}
            onClick={() => { setAddModalOpen(true); setAddMauSacValue(""); }}
            title="Thêm màu sắc"
          >
            <FaPlus style={{ fontSize: 18, color: '#fff' }} />
            Thêm màu sắc
          </button>
        </div>
        {loading && <div>Đang tải dữ liệu...</div>}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #b59d3a11', padding: 16, minHeight: 200 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr>
                <th style={{ padding: 10, textAlign: 'center', borderBottom: '2px solid', width: 60 }}>STT</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid' }}>Mã sản phẩm</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid' }}>Tên sản phẩm</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid' }}>Màu sắc</th>
                <th style={{ padding: 10, textAlign: 'center', borderBottom: '2px solid' }}>Số lượng</th>
                <th
                  style={{
                    height: 56,
                    textAlign: 'center',
                    borderBottom: '2px solid',
                  }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredChiTiet.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#b59d3a' }}>Không có dữ liệu màu sắc.</td>
                </tr>
              ) : (
                filteredChiTiet.map((ct, idx) => (
                  <tr key={ct.idChiTietSanPham}>
                    <td style={{ padding: 10, textAlign: 'center', fontWeight: 500, verticalAlign: 'middle' }}>{idx + 1}</td>
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>{ct.maSanPham}</td>
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>{ct.tenSanPham}</td>
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>{ct.tenMauSac}</td>
                    <td style={{ padding: 10, textAlign: 'center', verticalAlign: 'middle' }}>{ct.soLuong}</td>
                    <td
                      style={{
                        height: 56,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                      }}
                    >
                      <button
                        onClick={() => handleEdit(ct)}
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
                        title="Sửa màu sắc"
                        onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px #b59d3a33')}
                        onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px #b59d3a22')}
                      >
                        <FaEdit style={{ color: '#222', fontSize: 20 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Modal sửa màu sắc */}
        {editItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #b59d3a33', position: 'relative' }}>
              <button onClick={() => setEditItem(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b59d3a', cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 18, fontSize: 22 }}>Sửa màu sắc</h2>
              <div style={{ marginBottom: 18 }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Sản phẩm: <span>{editItem.tenSanPham}</span></div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Mã sản phẩm: <span>{editItem.maSanPham}</span></div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Màu sắc hiện tại: <span>{editItem.tenMauSac}</span></div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Chọn màu sắc mới:</label>
                <select
                  value={newMauSac ?? ''}
                  onChange={e => setNewMauSac(Number(e.target.value))}
                  style={{ padding: 8, minWidth: 180, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 16, color: '#222', outline: 'none', boxShadow: '0 2px 8px #eee' }}
                >
                  <option value="">-- Chọn màu sắc --</option>
                  {mauSacList.map(ms => (
                    <option key={ms.idMauSac} value={ms.idMauSac}>{ms.mauSac}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditItem(null)} style={{ background: '#fff', color: '#888', border: '1.5px solid #bbb', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <FaTimes style={{ fontSize: 18, color: '#888' }} /> Hủy
                </button>
                <button disabled={saving || !newMauSac} onClick={handleSave} style={{ background: '#b59d3a', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: saving || !newMauSac ? 'not-allowed' : 'pointer', opacity: saving || !newMauSac ? 0.6 : 1 }}>
                  <FaSave style={{ fontSize: 16, color: '#fff' }} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal thêm màu sắc mới */}
        {addModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #b59d3a33', position: 'relative' }}>
              <button onClick={() => setAddModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b59d3a', cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 18, fontSize: 22 }}>Thêm màu sắc mới</h2>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Tên màu sắc mới:</label>
                <input
                  type="text"
                  value={addMauSacValue}
                  onChange={e => setAddMauSacValue(e.target.value)}
                  style={{ padding: 8, minWidth: 180, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 16, color: '#222', outline: 'none', boxShadow: '0 2px 8px #eee' }}
                  maxLength={30}
                />
                {/* Lỗi: rỗng hoặc trùng tên */}
                {addMauSacValue && mauSacList.some(ms => ms.mauSac.trim().toLowerCase() === addMauSacValue.trim().toLowerCase()) && (
                  <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>Tên màu sắc đã tồn tại!</div>
                )}
                {addMauSacValue && addMauSacValue.trim().length === 0 && (
                  <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>Không được để trống tên màu sắc!</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setAddModalOpen(false)} style={{ background: '#fff', color: '#888', border: '1.5px solid #bbb', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <FaTimes style={{ fontSize: 18, color: '#888' }} /> Hủy
                </button>
                <button
                  disabled={
                    adding ||
                    !addMauSacValue.trim() ||
                    mauSacList.some(ms => ms.mauSac.trim().toLowerCase() === addMauSacValue.trim().toLowerCase())
                  }
                  onClick={async () => {
                    if (!addMauSacValue.trim() || mauSacList.some(ms => ms.mauSac.trim().toLowerCase() === addMauSacValue.trim().toLowerCase())) return;
                    setAdding(true);
                    const res = await fetch('http://localhost:8080/mau-sac/them', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mauSac: addMauSacValue.trim() }),
                    });
                    setAdding(false);
                    if (res.ok) {
                      setAddModalOpen(false);
                      // reload mauSacList
                      fetch('http://localhost:8080/mau-sac/hien-thi')
                        .then((res) => res.json())
                        .then(setMauSacList);
                    } else {
                      alert('Thêm màu sắc thất bại!');
                    }
                  }}
                  style={{ background: '#b59d3a', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: adding || !addMauSacValue.trim() || mauSacList.some(ms => ms.mauSac.trim().toLowerCase() === addMauSacValue.trim().toLowerCase()) ? 'not-allowed' : 'pointer', opacity: adding || !addMauSacValue.trim() || mauSacList.some(ms => ms.mauSac.trim().toLowerCase() === addMauSacValue.trim().toLowerCase()) ? 0.6 : 1 }}
                >
                  <FaSave style={{ fontSize: 16, color: '#fff' }} /> {adding ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 