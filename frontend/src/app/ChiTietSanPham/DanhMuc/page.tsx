"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/component/Admin-Layout";
import { FaTimes, FaEdit, FaSave, FaPlus } from "react-icons/fa";

interface ChiTietSanPham {
  idChiTietSanPham: number;
  tenSanPham: string;
  maSanPham: string;
  idSanPham: number;
  tenDanhMuc: string;
  idDanhMuc?: number;
  soLuong: number;
}
interface DanhMuc { idDanhMuc: number; tenDanhMuc: string; }

export default function DanhMucPage() {
  const [chiTietList, setChiTietList] = useState<ChiTietSanPham[]>([]);
  const [sanPhamList, setSanPhamList] = useState<{ idSanPham: number; tenSanPham: string }[]>([]);
  const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);
  const [selectedSanPham, setSelectedSanPham] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<ChiTietSanPham | null>(null);
  const [newDanhMuc, setNewDanhMuc] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [sanPhamInfo, setSanPhamInfo] = useState<any>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addDanhMucValue, setAddDanhMucValue] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch chi tiết sản phẩm
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
    // Fetch danh mục
    fetch("http://localhost:8080/san-pham/danh-muc")
      .then((res) => res.json())
      .then(setDanhMucList);
  }, []);

  let filteredChiTiet: ChiTietSanPham[] = chiTietList;
  if (selectedSanPham && selectedSanPham !== -1 && selectedSanPham !== ("all" as any)) {
    filteredChiTiet = chiTietList.filter((ct) => ct.idSanPham === selectedSanPham);
  }

  const handleEdit = async (ct: ChiTietSanPham) => {
    setEditItem(ct);
    // Lấy idDanhMuc hiện tại từ danh sách danh mục
    const found = danhMucList.find(dm => dm.tenDanhMuc === ct.tenDanhMuc);
    setNewDanhMuc(found ? found.idDanhMuc : null);
    // Fetch thông tin sản phẩm để lấy đủ dữ liệu khi update
    try {
      const res = await fetch(`http://localhost:8080/san-pham/chi-tiet/${ct.idSanPham}`);
      if (res.ok) {
        const sanPhamData = await res.json();
        setSanPhamInfo(sanPhamData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    }
  };

  const handleSave = async () => {
    if (!editItem || !sanPhamInfo || newDanhMuc === null || newDanhMuc === undefined) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:8080/san-pham/sua/${editItem.idSanPham}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idSanPham: sanPhamInfo.idSanPham,
          maSanPham: sanPhamInfo.maSanPham,
          tenSanPham: sanPhamInfo.tenSanPham,
          idThuongHieu: sanPhamInfo.idThuongHieu,
          idDanhMuc: newDanhMuc,
          trangThai: sanPhamInfo.trangThai,
          moTa: sanPhamInfo.moTa || ""
        }),
      });
      if (res.ok) {
        setEditItem(null);
        setNewDanhMuc(null);
        setSanPhamInfo(null);
        // Refresh lại dữ liệu
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
      } else {
        const errorData = await res.text();
        console.error("Lỗi API:", errorData);
        alert("Cập nhật danh mục thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối! Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      activeMenu="products"
      activeSubMenu="categories"
      pageTitle="Danh mục sản phẩm"
    >
      <div style={{ padding: 24 }}>
        <h1>Danh mục sản phẩm</h1>
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
            onClick={() => { setAddModalOpen(true); setAddDanhMucValue(""); }}
            title="Thêm danh mục"
          >
            <FaPlus style={{ fontSize: 18, color: '#fff' }} />
            Thêm danh mục
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
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid' }}>Danh mục</th>
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#b59d3a' }}>Không có dữ liệu danh mục.</td>
                </tr>
              ) : (
                filteredChiTiet.map((ct, idx) => (
                  <tr key={ct.idChiTietSanPham}>
                    <td style={{ padding: 10, textAlign: 'center', fontWeight: 500, verticalAlign: 'middle' }}>{idx + 1}</td>
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>{ct.maSanPham}</td>
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>{ct.tenSanPham}</td>
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>{ct.tenDanhMuc}</td>
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
                        title="Sửa danh mục"
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
        {/* Modal sửa danh mục */}
        {editItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #b59d3a33', position: 'relative' }}>
              <button onClick={() => setEditItem(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b59d3a', cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 18, fontSize: 22 }}>Sửa danh mục</h2>
              <div style={{ marginBottom: 18 }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Sản phẩm: <span>{editItem.tenSanPham}</span></div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Mã sản phẩm: <span>{editItem.maSanPham}</span></div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Danh mục hiện tại: <span>{editItem.tenDanhMuc}</span></div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Chọn danh mục mới:</label>
                <select
                  value={newDanhMuc ?? ''}
                  onChange={e => setNewDanhMuc(Number(e.target.value))}
                  style={{ padding: 8, minWidth: 180, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 16, color: '#222', outline: 'none', boxShadow: '0 2px 8px #eee' }}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {danhMucList.map(dm => (
                    <option key={dm.idDanhMuc} value={dm.idDanhMuc}>{dm.tenDanhMuc}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditItem(null)} style={{ background: '#fff', color: '#888', border: '1.5px solid #bbb', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <FaTimes style={{ fontSize: 18, color: '#888' }} /> Hủy
                </button>
                <button disabled={saving || !sanPhamInfo || newDanhMuc === null || newDanhMuc === undefined} onClick={handleSave} style={{ background: '#b59d3a', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !sanPhamInfo || newDanhMuc === null || newDanhMuc === undefined ? 0.6 : 1 }}>
                  <FaSave style={{ fontSize: 16, color: '#fff' }} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal thêm danh mục mới */}
        {addModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #b59d3a33', position: 'relative' }}>
              <button onClick={() => setAddModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b59d3a', cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 18, fontSize: 22 }}>Thêm danh mục mới</h2>
              <div style={{ marginBottom: 18 }}>
                <input
                  type="text"
                  value={addDanhMucValue}
                  onChange={e => setAddDanhMucValue(e.target.value)}
                  style={{ padding: 8, minWidth: 180, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 16, color: '#222', outline: 'none', boxShadow: '0 2px 8px #eee' }}
                  maxLength={40}
                />
                {/* Lỗi: rỗng hoặc trùng tên */}
                {addDanhMucValue && danhMucList.some(dm => dm.tenDanhMuc.trim().toLowerCase() === addDanhMucValue.trim().toLowerCase()) && (
                  <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>Tên danh mục đã tồn tại!</div>
                )}
                {addDanhMucValue && addDanhMucValue.trim().length === 0 && (
                  <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>Không được để trống tên danh mục!</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setAddModalOpen(false)} style={{ background: '#fff', color: '#888', border: '1.5px solid #bbb', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <FaTimes style={{ fontSize: 18, color: '#888' }} /> Hủy
                </button>
                <button
                  disabled={
                    adding ||
                    !addDanhMucValue.trim() ||
                    danhMucList.some(dm => dm.tenDanhMuc.trim().toLowerCase() === addDanhMucValue.trim().toLowerCase())
                  }
                  onClick={async () => {
                    if (!addDanhMucValue.trim() || danhMucList.some(dm => dm.tenDanhMuc.trim().toLowerCase() === addDanhMucValue.trim().toLowerCase())) return;
                    setAdding(true);
                    const res = await fetch('http://localhost:8080/danh-muc/them', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tenDanhMuc: addDanhMucValue.trim() }),
                    });
                    setAdding(false);
                    if (res.ok) {
                      setAddModalOpen(false);
                      // reload danhMucList
                      fetch('http://localhost:8080/san-pham/danh-muc')
                        .then((res) => res.json())
                        .then(setDanhMucList);
                    } else {
                      alert('Thêm danh mục thất bại!');
                    }
                  }}
                  style={{ background: '#b59d3a', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: adding || !addDanhMucValue.trim() || danhMucList.some(dm => dm.tenDanhMuc.trim().toLowerCase() === addDanhMucValue.trim().toLowerCase()) ? 'not-allowed' : 'pointer', opacity: adding || !addDanhMucValue.trim() || danhMucList.some(dm => dm.tenDanhMuc.trim().toLowerCase() === addDanhMucValue.trim().toLowerCase()) ? 0.6 : 1 }}
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