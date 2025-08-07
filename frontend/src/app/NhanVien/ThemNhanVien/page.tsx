"use client";
import React, { useState } from "react";
import AdminLayout from "../../../component/Admin-Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import { FaSave, FaTimes } from "react-icons/fa";
import { useEffect } from 'react';

registerLocale("vi", vi);

export default function ThemNhanVienPage() {
    const [addForm, setAddForm] = useState({
        tenNhanVien: "",
        email: "",
        soDienThoai: "",
        gioiTinh: "Nam",
        ngaySinh: "",
        diaChi: "",
        trangThai: "Hoạt động"
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState({
        tenNhanVien: "",
        email: "",
        soDienThoai: "",
        ngaySinh: "",
        diaChi: "",
        chung: ""
    });
    const [successToast, setSuccessToast] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [validatedFormData, setValidatedFormData] = useState<any>(null);
    const [addressData, setAddressData] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<any>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
    const [selectedWard, setSelectedWard] = useState<any>(null);
    const [ngoNgach, setNgoNgach] = useState("");

    useEffect(() => {
        fetch('/vn-address.json')
            .then(res => res.json())
            .then(data => {
                // Nếu có key 'results' thì lấy ra mảng bên trong
                const arr = Array.isArray(data.results) ? data.results : [];
                setAddressData(arr);
            })
            .catch(() => setAddressData([]));
    }, []);

    // Lấy danh sách tỉnh/thành
    const provinces = addressData;
    // Lấy danh sách quận/huyện theo tỉnh đã chọn
    const districts = selectedProvince ? selectedProvince.districts : [];
    // Lấy danh sách xã/phường theo quận/huyện đã chọn
    const wards = selectedDistrict ? selectedDistrict.wards : [];

    const handleAddNhanVien = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError({
            tenNhanVien: "",
            email: "",
            soDienThoai: "",
            ngaySinh: "",
            diaChi: "",
            chung: ""
        });
        let hasError = false;
        let newError = {
            tenNhanVien: "",
            email: "",
            soDienThoai: "",
            ngaySinh: "",
            diaChi: "",
            chung: ""
        };

        // Validate họ tên
        if (!addForm.tenNhanVien.trim()) {
            newError.tenNhanVien = "Họ và tên không được để trống";
            hasError = true;
        } else if (addForm.tenNhanVien.startsWith(' ')) {
            newError.tenNhanVien = "Họ và tên không được bắt đầu bằng dấu cách";
            hasError = true;
        } else if (addForm.tenNhanVien.endsWith(' ')) {
            newError.tenNhanVien = "Họ và tên không được kết thúc bằng dấu cách";
            hasError = true;
        } else if (/\s{2,}/.test(addForm.tenNhanVien)) {
            newError.tenNhanVien = "Họ và tên không được có nhiều dấu cách liên tiếp";
            hasError = true;
        } else if (addForm.tenNhanVien.length < 5) {
            newError.tenNhanVien = "Họ và tên phải có ít nhất 5 ký tự";
            hasError = true;
        } else if (addForm.tenNhanVien.length > 50) {
            newError.tenNhanVien = "Họ và tên không được quá 50 ký tự";
            hasError = true;
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(addForm.tenNhanVien)) {
            newError.tenNhanVien = "Họ và tên chỉ được chứa chữ cái và dấu cách";
            hasError = true;
        }

        // Validate email
        console.log('Email validation:', addForm.email, 'length:', addForm.email.length);
        console.log('Email char codes:', Array.from(addForm.email).map(c => c.charCodeAt(0)));
        console.log('startsWith space:', addForm.email.startsWith(' '), 'endsWith space:', addForm.email.endsWith(' '));
        console.log('includes space:', addForm.email.includes(' '), 'includes double space:', addForm.email.includes('  '));
        console.log('trimmed length:', addForm.email.trim().length);

        if (!addForm.email.trim()) {
            newError.email = "Email không được để trống";
            hasError = true;
        } else if (addForm.email.startsWith(' ')) {
            newError.email = "Email không được bắt đầu bằng dấu cách";
            hasError = true;
        } else if (addForm.email.endsWith(' ')) {
            newError.email = "Email không được kết thúc bằng dấu cách";
            hasError = true;
        } else if (addForm.email.includes('  ')) {
            newError.email = "Email không được có nhiều dấu cách liên tiếp";
            hasError = true;
        } else if (addForm.email.includes(' ') && !addForm.email.startsWith(' ') && !addForm.email.endsWith(' ')) {
            newError.email = "Email không được có dấu cách ở giữa";
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
            newError.email = "Email không đúng định dạng (ví dụ: example@domain.com)";
            hasError = true;
        } else if (addForm.email.length > 100) {
            console.log('Email length check:', addForm.email.length, '> 100:', addForm.email.length > 100);
            newError.email = "Email không được quá 100 ký tự";
            hasError = true;
        }

        // Validate số điện thoại
        if (!addForm.soDienThoai.trim()) {
            newError.soDienThoai = "Số điện thoại không được để trống";
            hasError = true;
        } else if (addForm.soDienThoai.startsWith(' ')) {
            newError.soDienThoai = "Số điện thoại không được bắt đầu bằng dấu cách";
            hasError = true;
        } else if (addForm.soDienThoai.endsWith(' ')) {
            newError.soDienThoai = "Số điện thoại không được kết thúc bằng dấu cách";
            hasError = true;
        } else if (addForm.soDienThoai.includes('  ')) {
            newError.soDienThoai = "Số điện thoại không được có nhiều dấu cách liên tiếp";
            hasError = true;
        } else if (addForm.soDienThoai.includes(' ')) {
            newError.soDienThoai = "Số điện thoại không được có dấu cách ở giữa";
            hasError = true;
        } else if (/[^0-9]/.test(addForm.soDienThoai)) {
            newError.soDienThoai = "Số điện thoại chỉ được chứa số, không được có ký tự đặc biệt";
            hasError = true;
        } else if (!addForm.soDienThoai.startsWith('0')) {
            newError.soDienThoai = "Số điện thoại phải bắt đầu bằng 0";
            hasError = true;
        } else if (addForm.soDienThoai.length !== 10) {
            newError.soDienThoai = "Số điện thoại phải có đúng 10 chữ số";
            hasError = true;
        } else if (!/^0\d{9}$/.test(addForm.soDienThoai)) {
            newError.soDienThoai = "Số điện thoại không đúng định dạng";
            hasError = true;
        }

        // Validate ngày sinh
        if (!addForm.ngaySinh) {
            newError.ngaySinh = "Ngày sinh không được để trống";
            hasError = true;
        } else {
            const dob = new Date(addForm.ngaySinh);
            const today = new Date();

            // Kiểm tra ngày hợp lệ
            if (isNaN(dob.getTime())) {
                newError.ngaySinh = "Ngày sinh không hợp lệ";
                hasError = true;
            } else if (dob > today) {
                newError.ngaySinh = "Ngày sinh không được lớn hơn ngày hiện tại";
                hasError = true;
            } else {
                // Tính tuổi
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }

                if (age < 15) {
                    newError.ngaySinh = "Nhân viên phải đủ 15 tuổi trở lên";
                    hasError = true;
                } else if (age > 60) {
                    newError.ngaySinh = "Tuổi nhân viên không được quá 60 tuổi (tuổi nghỉ hưu)";
                    hasError = true;
                }
            }
        }

        // Validate địa chỉ theo thứ tự: Tỉnh → Huyện → Xã → Ngõ
        if (!selectedProvince) {
            newError.diaChi = "Vui lòng chọn Tỉnh/Thành phố";
            hasError = true;
        } else if (!selectedDistrict) {
            newError.diaChi = "Vui lòng chọn Quận/Huyện";
            hasError = true;
        } else if (!selectedWard) {
            newError.diaChi = "Vui lòng chọn Xã/Phường";
            hasError = true;
        } else if (!ngoNgach.trim()) {
            newError.diaChi = "Thông tin ngõ/ngách không được để trống";
            hasError = true;
        } else if (ngoNgach.includes('  ')) {
            newError.diaChi = "Thông tin ngõ/ngách không được có nhiều dấu cách liên tiếp";
            hasError = true;
        } else if (ngoNgach.length > 50) {
            newError.diaChi = "Thông tin ngõ/ngách không được quá 50 ký tự";
            hasError = true;
        }
        if (hasError) {
            setAddError(newError);
            return;
        }

        // Nếu thông tin đúng và đủ, hiển thị confirm dialog
        const formData = {
            ...addForm,
            gioiTinh: addForm.gioiTinh === "Nam",
            thanhPho: selectedProvince.province_name,
            quanHuyen: selectedDistrict.district_name,
            xaPhuong: selectedWard.ward_name,
            ngoNgach: ngoNgach
        };
        setValidatedFormData(formData);
        setShowConfirmDialog(true);
    };

    const handleConfirmAdd = async () => {
        if (!validatedFormData) return;

        setAddLoading(true);
        setShowConfirmDialog(false);

        try {
            let fetchOptions: any = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validatedFormData)
            };
            const res = await fetch("http://localhost:8080/nhan-vien/them", fetchOptions);
            const data = await res.json();
            if (data.success) {
                setSuccessToast("Thêm nhân viên thành công!");
                setTimeout(() => {
                    window.location.href = "/NhanVien/HienThi";
                }, 800);
            } else {
                if (data.message && data.message.toLowerCase().includes('số điện thoại')) {
                    setAddError(prev => ({ ...prev, soDienThoai: data.message }));
                } else if (data.message && data.message.toLowerCase().includes('email')) {
                    setAddError(prev => ({ ...prev, email: data.message }));
                } else {
                    setAddError(prev => ({ ...prev, chung: data.message || "Có lỗi xảy ra" }));
                }
            }
        } catch (err) {
            setAddError(prev => ({ ...prev, chung: "Không thể kết nối server" }));
        }
        setAddLoading(false);
    };

    return (
        <>
            <AdminLayout activeMenu="employees" pageTitle="Quản lý nhân viên" onMenuChangeAction={() => {}}>
            {/* Modal Overlay */}
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
                    borderRadius: 20,
                    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12), 0 6px 24px rgba(181, 157, 58, 0.08)",
                    padding: 32,
                    maxWidth: 700,
                    width: "85%",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    position: "relative",
                    border: "1px solid rgba(181, 157, 58, 0.1)",
                    animation: "modalSlideIn 0.3s ease-out"
                }}>
                    {/* Header với gradient */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: "linear-gradient(90deg, #b59d3a 0%, #8a7a2a 100%)",
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20
                    }} />
                    
                    {/* Close button */}
                    <button 
                        type="button" 
                        onClick={() => window.location.href = "/NhanVien/HienThi"} 
                        style={{ 
                            position: "absolute", 
                            top: 16, 
                            right: 16, 
                            background: "rgba(181, 157, 58, 0.1)", 
                            border: "none", 
                            fontSize: 16, 
                            cursor: "pointer", 
                            color: "#b59d3a",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(181, 157, 58, 0.2)"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "rgba(181, 157, 58, 0.2)";
                            e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "rgba(181, 157, 58, 0.1)";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        <FaTimes />
                    </button>
                    
                    {/* Header */}
                    <div style={{ marginBottom: 24, textAlign: "center" }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                            boxShadow: "0 6px 20px rgba(181, 157, 58, 0.25)"
                        }}>
                            <span style={{ fontSize: 20, color: "#fff", fontWeight: 700 }}>+</span>
                        </div>
                        <h2 style={{ 
                            margin: 0, 
                            color: "#1e293b", 
                            fontWeight: 700, 
                            fontSize: 24,
                            background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}>
                            Thêm nhân viên
                        </h2>
                    </div>
                <form onSubmit={handleAddNhanVien} noValidate>
                    {/* Hàng 1: Họ và tên | Email */}
                    <div style={{ display: 'flex', gap: 32, marginBottom: 18 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Họ và tên *</label>
                            <input placeholder="Nhập họ và tên" value={addForm.tenNhanVien} onChange={e => setAddForm(f => ({ ...f, tenNhanVien: e.target.value }))} style={{ width: "100%", padding: '12px 16px', borderRadius: 7, border: addError.tenNhanVien ? "1.5px solid #e74c3c" : "1.5px solid #b59d3a55", background: '#fff', color: '#222' }} />
                            {addError.tenNhanVien && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{addError.tenNhanVien}</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Email *</label>
                            <input type="text" placeholder="Nhập email" value={addForm.email} onChange={e => {
                                console.log('Email input change:', e.target.value, 'length:', e.target.value.length);
                                setAddForm(f => ({ ...f, email: e.target.value }));
                            }} style={{ width: "100%", padding: '12px 16px', borderRadius: 7, border: addError.email ? "1.5px solid #e74c3c" : "1.5px solid #b59d3a55", background: '#fff', color: '#222' }} autoComplete="off" />
                            {addError.email && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{addError.email}</div>}
                        </div>
                    </div>
                    {/* Hàng 2: Số điện thoại | Giới tính */}
                    <div style={{ display: 'flex', gap: 32, marginBottom: 18 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Số điện thoại *</label>
                            <input placeholder="Số điện thoại" value={addForm.soDienThoai} onChange={e => setAddForm(f => ({ ...f, soDienThoai: e.target.value }))} style={{ width: "100%", padding: '12px 16px', borderRadius: 7, border: addError.soDienThoai ? "1.5px solid #e74c3c" : "1.5px solid #b59d3a55", background: '#fff', color: '#222' }} autoComplete="off" />
                            {addError.soDienThoai && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{addError.soDienThoai}</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Giới tính *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: 48 }}>
                                <label className="custom-radio" style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                                    <input type="radio" name="gender" value="Nam" checked={addForm.gioiTinh === "Nam"} onChange={() => setAddForm(f => ({ ...f, gioiTinh: "Nam" }))} />
                                    <span className="checkmark"></span> Nam
                                </label>
                                <label className="custom-radio" style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                                    <input type="radio" name="gender" value="Nữ" checked={addForm.gioiTinh === "Nữ"} onChange={() => setAddForm(f => ({ ...f, gioiTinh: "Nữ" }))} />
                                    <span className="checkmark"></span> Nữ
                                </label>
                            </div>
                        </div>
                    </div>
                    {/* Hàng 3: Ngày sinh | Tỉnh thành | Quận huyện */}
                    <div style={{ display: 'flex', gap: 32, marginBottom: 18 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Ngày sinh *</label>
                            <DatePicker
                                selected={addForm.ngaySinh ? new Date(addForm.ngaySinh) : null}
                                onChange={date => setAddForm(f => ({
                                    ...f,
                                    ngaySinh: date
                                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                        : ""
                                }))}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày sinh"
                                className={`custom-datepicker-input large ${addError.ngaySinh ? 'error' : ''}`}
                                showMonthDropdown
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={new Date().getFullYear() - 1965 + 1}
                                minDate={new Date(1965, 0, 1)}
                                maxDate={new Date()}
                                wrapperClassName="custom-datepicker-wrapper"
                                locale="vi"
                            />
                            {addError.ngaySinh && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{addError.ngaySinh}</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label>Tỉnh thành *</label>
                                <select value={selectedProvince?.province_id || ''} onChange={e => {
                                    const p = provinces.find((p: any) => p.province_id === e.target.value);
                                    setSelectedProvince(p);
                                    setSelectedDistrict(null);
                                    setSelectedWard(null);
                                }} style={{ width: '100%', padding: '12px 16px', borderRadius: 7, border: '1.5px solid #b59d3a55', background: '#fff', color: '#222' }} disabled={provinces.length === 0}>
                                    <option value="">{provinces.length === 0 ? 'Đang tải...' : 'Chọn tỉnh/thành'}</option>
                                    {provinces.map((p: any) => (
                                        <option key={String(p.province_id)} value={p.province_id}>{p.province_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label>Quận, huyện *</label>
                                <select value={selectedDistrict?.district_id || ''} onChange={e => {
                                    const d = districts.find((d: any) => d.district_id === e.target.value);
                                    setSelectedDistrict(d);
                                    setSelectedWard(null);
                                }} style={{ width: '100%', padding: '12px 16px', borderRadius: 7, border: '1.5px solid #b59d3a55', background: '#fff', color: '#222' }} disabled={!selectedProvince || districts.length === 0}>
                                    <option value="">{districts.length === 0 ? 'Chọn tỉnh/thành trước' : 'Chọn quận/huyện'}</option>
                                    {districts.map((d: any) => (
                                        <option key={String(d.district_id)} value={d.district_id}>{d.district_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Hàng 4: (trái trống) | Xã | Ngõ */}
                    <div style={{ display: 'flex', gap: 32, marginBottom: 18 }}>
                        <div style={{ flex: 1, minWidth: 0 }} />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label>Xã *</label>
                                    <select value={selectedWard?.ward_id || ''} onChange={e => {
                                        const w = wards.find((w: any) => w.ward_id === e.target.value);
                                        setSelectedWard(w);
                                    }} style={{ width: '100%', padding: '12px 16px', borderRadius: 7, border: '1.5px solid #b59d3a55', background: '#fff', color: '#222' }} disabled={!selectedDistrict || wards.length === 0}>
                                        <option value="">{wards.length === 0 ? 'Chọn quận/huyện trước' : 'Chọn phường/xã'}</option>
                                        {wards.map((w: any) => (
                                            <option key={String(w.ward_id)} value={w.ward_id}>{w.ward_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label>Ngõ/ngách *</label>
                                    <input placeholder="Nhập ngõ/ngách" value={ngoNgach} onChange={e => setNgoNgach(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 7, border: '1.5px solid #b59d3a55', background: '#fff', color: '#222' }} autoComplete="off" />
                                </div>
                            </div>
                            {addError.diaChi && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 2 }}>
                                {addError.diaChi}
                            </div>}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                        <button type="button" onClick={() => window.location.href = "/NhanVien/HienThi"} style={{ background: "#fff", color: "#888", border: "1.5px solid #bbb", borderRadius: 7, padding: "10px 22px", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <FaTimes style={{ fontSize: 18, color: "#888" }} /> Hủy
                        </button>
                        <button type="submit" disabled={addLoading} style={{ background: "#b59d3a", color: "#fff", border: "none", borderRadius: 7, padding: "10px 22px", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 6, cursor: addLoading ? "not-allowed" : "pointer" }}>
                            <span style={{ fontSize: 20, fontWeight: 700, marginRight: 6 }}>+</span>
                            {addLoading ? "Đang thêm..." : "Thêm nhân viên"}
                        </button>
                    </div>
                </form>
                <style jsx>{`
                    /* Chỉ giữ lại style cho focus state */
                    input:focus,
                    select:focus {
                        outline: none !important;
                        border-color: #b59d3a !important;
                    }
                `}</style>
                {successToast && (
                    <div style={{ position: 'fixed', top: 30, right: 30, zIndex: 2000, background: '#2ecc40', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, boxShadow: '0 2px 12px #0002', minWidth: 220, textAlign: 'center' }}>
                        {successToast}
                    </div>
                )}
                {addError.chung && <div style={{ color: "#e74c3c", marginTop: 10, fontSize: 13, padding: "8px 12px", background: "#fdf2f2", borderRadius: 6, border: "1px solid #fecaca" }}>
                    {addError.chung}
                </div>}
                </div>
            </div>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 32,
                        maxWidth: 500,
                        width: '90%',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: 20,
                            fontWeight: 600,
                            color: '#333',
                            textAlign: 'center'
                        }}>
                            Xác nhận thêm nhân viên
                        </h3>
                        <p style={{
                            margin: '0 0 24px 0',
                            fontSize: 16,
                            color: '#666',
                            lineHeight: 1.5,
                            textAlign: 'center'
                        }}>
                            Bạn có chắc chắn muốn thêm nhân viên này không?
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                style={{
                                    background: '#f8f9fa',
                                    color: '#666',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    padding: '12px 24px',
                                    fontSize: 16,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    minWidth: 100
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmAdd}
                                disabled={addLoading}
                                style={{
                                    background: '#b59d3a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '12px 24px',
                                    fontSize: 16,
                                    fontWeight: 500,
                                    cursor: addLoading ? 'not-allowed' : 'pointer',
                                    minWidth: 100
                                }}
                            >
                                {addLoading ? 'Đang thêm...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
        
        <style dangerouslySetInnerHTML={{
            __html: `
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
            `
        }} />
        </>
    );
} 