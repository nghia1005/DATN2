"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/component/Admin-Layout";
import { FaTimes, FaEdit, FaPlus } from "react-icons/fa";
import { FaSave } from "react-icons/fa";

interface ChiTietSanPham {
  idChiTietSanPham: number;
  tenSanPham: string;
  maSanPham: string;
  idSanPham: number;
  idKichCo: number;
  tenKichCo: string;
  soLuong: number;
}
interface KichCo { idKichCo: number; kichCo: string; }

export default function KichThuocPage() {
  const [chiTietList, setChiTietList] = useState<ChiTietSanPham[]>([]);
  const [sanPhamList, setSanPhamList] = useState<{ idSanPham: number; tenSanPham: string }[]>([]);
  const [kichCoList, setKichCoList] = useState<KichCo[]>([]);
  const [selectedSanPham, setSelectedSanPham] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<ChiTietSanPham | null>(null);
  const [newKichCo, setNewKichCo] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addKichCoValue, setAddKichCoValue] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
    fetch("http://localhost:8080/kich-co/hien-thi")
      .then((res) => res.json())
      .then(setKichCoList);
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
    setNewKichCo(ct.idKichCo);
  };

  const handleSave = async () => {
    if (!editItem || !newKichCo) return;
    setSaving(true);
    const res = await fetch(`http://localhost:8080/chi-tiet-san-pham/sua/${editItem.idChiTietSanPham}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editItem, idKichCo: newKichCo }),
    });
    setSaving(false);
    if (res.ok) {
      setEditItem(null);
      fetchData();
    } else {
      alert("Cập nhật kích thước thất bại!");
    }
  };

  return (
    <AdminLayout
      activeMenu="products"
      activeSubMenu="sizes"
      pageTitle="Kích thước sản phẩm"
    >
      <div style={{ padding: 24 }}>
        <h1>Kích thước sản phẩm</h1>
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
            onClick={() => { setAddModalOpen(true); setAddKichCoValue(""); }}
            title="Thêm kích thước"
          >
            <FaPlus style={{ fontSize: 18, color: '#fff' }} />
            Thêm kích thước
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
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid' }}>Kích thước</th>
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#b59d3a' }}>Không có dữ liệu kích thước.</td>
                </tr>
              ) : (
                filteredChiTiet.map((ct, idx) => (
                  <tr key={ct.idChiTietSanPham}>
                    <td style={{ padding: 10, textAlign: 'center', fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ padding: 10 }}>{ct.maSanPham}</td>
                    <td style={{ padding: 10 }}>{ct.tenSanPham}</td>
                    <td style={{ padding: 10 }}>{ct.tenKichCo}</td>
                    <td style={{ padding: 10, textAlign: 'center', verticalAlign: 'middle' }}>{ct.soLuong}</td>
                    <td
                      style={{
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s',
                          boxShadow: '0 2px 8px #b59d3a22',
                        }}
                        title="Sửa kích thước"
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
        {/* Modal sửa kích thước */}
        {editItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #b59d3a33', position: 'relative' }}>
              <button onClick={() => setEditItem(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b59d3a', cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 18, fontSize: 22 }}>Sửa kích thước</h2>
              <div style={{ marginBottom: 18 }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Sản phẩm: <span>{editItem.tenSanPham}</span></div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Mã sản phẩm: <span>{editItem.maSanPham}</span></div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Kích thước hiện tại: <span>{editItem.tenKichCo}</span></div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Chọn kích thước mới:</label>
                <select
                  value={newKichCo ?? ''}
                  onChange={e => setNewKichCo(Number(e.target.value))}
                  style={{ padding: 8, minWidth: 180, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 16, color: '#222', outline: 'none', boxShadow: '0 2px 8px #eee' }}
                >
                  <option value="">-- Chọn kích thước --</option>
                  {kichCoList.map(kc => (
                    <option key={kc.idKichCo} value={kc.idKichCo}>{kc.kichCo}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditItem(null)} style={{ background: '#fff', color: '#888', border: '1.5px solid #bbb', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <FaTimes style={{ fontSize: 18, color: '#888' }} /> Hủy
                </button>
                <button disabled={saving || !newKichCo} onClick={handleSave} style={{ background: '#b59d3a', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: saving || !newKichCo ? 'not-allowed' : 'pointer', opacity: saving || !newKichCo ? 0.6 : 1 }}>
                  <FaSave style={{ fontSize: 16, color: '#fff' }} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal thêm kích thước mới */}
        {addModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #b59d3a33', position: 'relative' }}>
              <button onClick={() => setAddModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b59d3a', cursor: 'pointer' }}><FaTimes /></button>
              <h2 style={{ marginBottom: 18, fontSize: 22 }}>Thêm kích thước mới</h2>
              <div style={{ marginBottom: 18 }}>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={addKichCoValue}
                  onChange={e => {
                    // Chỉ cho phép số nguyên dương
                    const val = e.target.value;
                    if (val === "" || (/^\d+$/.test(val) && Number(val) > 0)) {
                      setAddKichCoValue(val);
                    }
                  }}
                  style={{
                    padding: 8,
                    minWidth: 180,
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    background: '#fff',
                    fontSize: 16,
                    color: '#222',
                    outline: 'none',
                    boxShadow: '0 2px 8px #eee',
                    MozAppearance: 'textfield',
                  }}
                  // Ẩn spinner trên Chrome, Safari, Edge
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="no-spinner"
                />
                {/* Hiển thị lỗi nếu nhập số lẻ, số âm, hoặc 0 */}
                {addKichCoValue && (!/^\d+$/.test(addKichCoValue) || Number(addKichCoValue) <= 0) && (
                  <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>Chỉ nhập số nguyên dương!</div>
                )}
                {addKichCoValue && Number(addKichCoValue) > 0 && !Number.isInteger(Number(addKichCoValue)) && (
                  <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>Không cho phép số lẻ!</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setAddModalOpen(false)} style={{ background: '#fff', color: '#888', border: '1.5px solid #bbb', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <FaTimes style={{ fontSize: 18, color: '#888' }} /> Hủy
                </button>
                <button
                  disabled={
                    adding ||
                    !addKichCoValue.trim() ||
                    !/^\d+$/.test(addKichCoValue) ||
                    Number(addKichCoValue) <= 0 ||
                    !Number.isInteger(Number(addKichCoValue))
                  }
                  onClick={async () => {
                    if (!/^\d+$/.test(addKichCoValue) || Number(addKichCoValue) <= 0 || !Number.isInteger(Number(addKichCoValue))) return;
                    setAdding(true);
                    const res = await fetch('http://localhost:8080/kich-co/them', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ kichCo: addKichCoValue.trim() }),
                    });
                    setAdding(false);
                    if (res.ok) {
                      setAddModalOpen(false);
                      // reload kichCoList
                      fetch('http://localhost:8080/kich-co/hien-thi')
                        .then((res) => res.json())
                        .then(setKichCoList);
                    } else {
                      alert('Thêm kích thước thất bại!');
                    }
                  }}
                  style={{ background: '#b59d3a', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: adding || !addKichCoValue.trim() || !/^\d+$/.test(addKichCoValue) || Number(addKichCoValue) <= 0 || !Number.isInteger(Number(addKichCoValue)) ? 'not-allowed' : 'pointer', opacity: adding || !addKichCoValue.trim() || !/^\d+$/.test(addKichCoValue) || Number(addKichCoValue) <= 0 || !Number.isInteger(Number(addKichCoValue)) ? 0.6 : 1 }}
                >
                  <FaSave style={{ fontSize: 16, color: '#fff' }} /> {adding ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Ẩn spinner cho input[type=number] */}
        <style>{`
          input.no-spinner::-webkit-outer-spin-button,
          input.no-spinner::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input.no-spinner[type=number] {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
} 