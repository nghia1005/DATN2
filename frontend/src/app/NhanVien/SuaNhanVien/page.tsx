"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../../component/Admin-Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import { FaSave, FaArrowLeft, FaEdit, FaTimes } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

registerLocale("vi", vi);

export default function SuaNhanVienPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const [editForm, setEditForm] = useState({
        maNhanVien: "",
        tenNhanVien: "",
        email: "",
        soDienThoai: "",
        gioiTinh: "Nam",
        ngaySinh: "",
        diaChi: "",
        trangThai: "Hoạt động"
    });
    const [editLoading, setEditLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [successToast, setSuccessToast] = useState("");
    const [errorToast, setErrorToast] = useState("");
    const [errors, setErrors] = useState<{[key: string]: string}>({});
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
                const arr = Array.isArray(data.results) ? data.results : [];
                setAddressData(arr);
            })
            .catch(() => setAddressData([]));
    }, []);

    // Validation functions
    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^0\d{9}$/;
        return phoneRegex.test(phone);
    };

    const validateAge = (birthDate: string): boolean => {
        if (!birthDate) return false;
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 15;
        }
        return age >= 15;
    };

    const validateForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        // Validate họ tên
        if (!editForm.tenNhanVien.trim()) {
            newErrors.tenNhanVien = "Họ và tên không được để trống";
        } else if (editForm.tenNhanVien.startsWith(' ')) {
            newErrors.tenNhanVien = "Họ và tên không được bắt đầu bằng dấu cách";
        } else if (editForm.tenNhanVien.endsWith(' ')) {
            newErrors.tenNhanVien = "Họ và tên không được kết thúc bằng dấu cách";
        } else if (/\s{2,}/.test(editForm.tenNhanVien)) {
            newErrors.tenNhanVien = "Họ và tên không được có nhiều dấu cách liên tiếp";
        } else if (editForm.tenNhanVien.length < 5) {
            newErrors.tenNhanVien = "Họ và tên phải có ít nhất 5 ký tự";
        } else if (editForm.tenNhanVien.length > 100) {
            newErrors.tenNhanVien = "Họ và tên không được quá 100 ký tự";
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(editForm.tenNhanVien)) {
            newErrors.tenNhanVien = "Họ và tên chỉ được chứa chữ cái và dấu cách";
        }

        // Validate email
        if (!editForm.email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (editForm.email.startsWith(' ')) {
            newErrors.email = "Email không được bắt đầu bằng dấu cách";
        } else if (editForm.email.endsWith(' ')) {
            newErrors.email = "Email không được kết thúc bằng dấu cách";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            newErrors.email = "Email không đúng định dạng (ví dụ: example@domain.com)";
        } else if (editForm.email.length > 100) {
            newErrors.email = "Email không được quá 100 ký tự";
        }

        // Validate số điện thoại
        if (!editForm.soDienThoai.trim()) {
            newErrors.soDienThoai = "Số điện thoại không được để trống";
        } else if (editForm.soDienThoai.startsWith(' ')) {
            newErrors.soDienThoai = "Số điện thoại không được bắt đầu bằng dấu cách";
        } else if (editForm.soDienThoai.endsWith(' ')) {
            newErrors.soDienThoai = "Số điện thoại không được kết thúc bằng dấu cách";
        } else if (editForm.soDienThoai.includes(' ')) {
            newErrors.soDienThoai = "Số điện thoại không được có dấu cách ở giữa";
        } else if (/[^0-9]/.test(editForm.soDienThoai)) {
            newErrors.soDienThoai = "Số điện thoại chỉ được chứa số, không được có ký tự đặc biệt";
        } else if (!/^0\d{9}$/.test(editForm.soDienThoai)) {
            newErrors.soDienThoai = "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số";
        }

        // Validate ngày sinh
        if (!editForm.ngaySinh) {
            newErrors.ngaySinh = "Ngày sinh không được để trống";
        } else {
            const dob = new Date(editForm.ngaySinh);
            const today = new Date();

            // Kiểm tra ngày hợp lệ
            if (isNaN(dob.getTime())) {
                newErrors.ngaySinh = "Ngày sinh không hợp lệ";
            } else if (dob > today) {
                newErrors.ngaySinh = "Ngày sinh không được lớn hơn ngày hiện tại";
            } else {
                // Tính tuổi
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }

                if (age < 15) {
                    newErrors.ngaySinh = "Nhân viên phải đủ 15 tuổi trở lên";
                } else if (age > 60) {
                    newErrors.ngaySinh = "Tuổi nhân viên không được quá 60 tuổi (tuổi nghỉ hưu)";
                }
            }
        }

        // Validate địa chỉ theo thứ tự: Tỉnh → Huyện → Xã → Ngõ
        if (!selectedProvince) {
            newErrors.diaChi = "Vui lòng chọn Tỉnh/Thành phố";
        } else if (!selectedDistrict) {
            newErrors.diaChi = "Vui lòng chọn Quận/Huyện";
        } else if (!selectedWard) {
            newErrors.diaChi = "Vui lòng chọn Xã/Phường";
        } else if (!ngoNgach.trim()) {
            newErrors.diaChi = "Thông tin ngõ/ngách không được để trống";
        } else if (ngoNgach.trim() && ngoNgach.length > 200) {
            newErrors.diaChi = "Thông tin ngõ/ngách không được quá 200 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!id) return;
        setFetching(true);
        fetch(`http://localhost:8080/nhan-vien/chi-tiet/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setEditForm({
                        ...data.data,
                        gioiTinh: data.data.gioiTinh === true || data.data.gioiTinh === "Nam" ? "Nam" : "Nữ",
                        ngaySinh: data.data.ngaySinh || ""
                    });

                    // Sử dụng thông tin địa chỉ chi tiết từ backend
                    if (data.data.thanhPho && data.data.quanHuyen && data.data.xaPhuong) {
                        setNgoNgach(data.data.ngoNgach || "");

                        // Tìm tỉnh, quận, xã từ dữ liệu địa chỉ
                        let foundProvince = null, foundDistrict = null, foundWard = null;
                        addressData.forEach((province: any) => {
                            if (province.province_name === data.data.thanhPho) {
                                foundProvince = province;
                                province.districts.forEach((district: any) => {
                                    if (district.district_name === data.data.quanHuyen) {
                                        foundDistrict = district;
                                        district.wards.forEach((ward: any) => {
                                            if (ward.ward_name === data.data.xaPhuong) {
                                                foundWard = ward;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        setSelectedProvince(foundProvince);
                        setSelectedDistrict(foundDistrict);
                        setSelectedWard(foundWard);
                    } else {
                        // Fallback cho dữ liệu cũ (nếu chưa có địa chỉ chi tiết)
                        const diaChi = data.data.diaChi || "";
                        let ngo = "";
                        let diaChiNoNgo = diaChi;
                        if (diaChi.includes(",")) {
                            const parts = diaChi.split(",");
                            if (parts.length > 3) {
                                ngo = parts[0].trim();
                                diaChiNoNgo = parts.slice(1).join(",").trim();
                            }
                        }
                        setNgoNgach(ngo);

                        let foundProvince = null, foundDistrict = null, foundWard = null;
                        addressData.forEach((province: any) => {
                            if (diaChiNoNgo.includes(province.province_name)) {
                                foundProvince = province;
                                province.districts.forEach((district: any) => {
                                    if (diaChiNoNgo.includes(district.district_name)) {
                                        foundDistrict = district;
                                        district.wards.forEach((ward: any) => {
                                            if (diaChiNoNgo.includes(ward.ward_name)) {
                                                foundWard = ward;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        setSelectedProvince(foundProvince);
                        setSelectedDistrict(foundDistrict);
                        setSelectedWard(foundWard);
                    }
                }
                setFetching(false);
            })
            .catch(() => setFetching(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, addressData.length]);

    const handleEditNhanVien = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Nếu thông tin đúng và đủ, hiển thị confirm dialog
        const formData = {
            ...editForm,
            gioiTinh: editForm.gioiTinh === "Nam",
            thanhPho: selectedProvince?.province_name,
            quanHuyen: selectedDistrict?.district_name,
            xaPhuong: selectedWard?.ward_name,
            ngoNgach: ngoNgach
        };
        setValidatedFormData(formData);
        setShowConfirmDialog(true);
    };

    const handleConfirmEdit = async () => {
        if (!validatedFormData) return;

        setEditLoading(true);
        setShowConfirmDialog(false);
        setErrorToast("");

        try {
            const res = await fetch(`http://localhost:8080/nhan-vien/sua/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validatedFormData)
            });
            const data = await res.json();
            if (data.success) {
                setSuccessToast("Cập nhật nhân viên thành công!");
                setTimeout(() => {
                    router.push("/NhanVien/HienThi?page=1");
                }, 400);
            } else {
                if (data.message && data.message.toLowerCase().includes('số điện thoại')) {
                    setErrors(prev => ({ ...prev, soDienThoai: data.message }));
                } else if (data.message && data.message.toLowerCase().includes('email')) {
                    setErrors(prev => ({ ...prev, email: data.message }));
                } else {
                    setErrorToast(data.message || "Có lỗi xảy ra khi cập nhật nhân viên");
                }
            }
        } catch (err) {
            console.error("Không thể kết nối server");
            setErrorToast("Không thể kết nối đến server");
        }
        setEditLoading(false);
    };

    const handleCancel = () => {
        router.push("/NhanVien/HienThi");
    };

    if (fetching) return <div style={{ textAlign: "center", padding: 40 }}>Đang tải dữ liệu nhân viên...</div>;

    // Lấy danh sách tỉnh/thành
    const provinces = addressData;
    // Lấy danh sách quận/huyện theo tỉnh đã chọn
    const districts = selectedProvince ? selectedProvince.districts : [];
    // Lấy danh sách xã/phường theo quận/huyện đã chọn
    const wards = selectedDistrict ? selectedDistrict.wards : [];

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
                            onClick={handleCancel} 
                            style={{ 
                                position: "absolute", 
                                top: 20, 
                                right: 20, 
                                background: "rgba(181, 157, 58, 0.1)", 
                                border: "none", 
                                fontSize: 18, 
                                cursor: "pointer", 
                                color: "#b59d3a",
                                width: 36,
                                height: 36,
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
                            <FaEdit style={{ fontSize: 20, color: "#fff" }} />
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
                            Sửa thông tin nhân viên
                        </h2>
                    </div>
                <form onSubmit={handleEditNhanVien}>
                    {/* Hàng 1: Tên nhân viên | Email */}
                    <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Họ và tên *</label>
                            <input 
                                placeholder="Nhập họ tên" 
                                value={editForm.tenNhanVien} 
                                onChange={e => setEditForm(f => ({ ...f, tenNhanVien: e.target.value }))} 
                                style={{ 
                                    width: "100%", 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: errors.tenNhanVien ? "2px solid #ef4444" : "2px solid rgba(181, 157, 58, 0.2)", 
                                    background: '#fff', 
                                    color: '#1e293b',
                                    fontSize: 14,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.tenNhanVien ? "#ef4444" : "#b59d3a";
                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.tenNhanVien ? "#ef4444" : "rgba(181, 157, 58, 0.2)";
                                    e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                }}
                            />
                            {errors.tenNhanVien && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{errors.tenNhanVien}</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Email *</label>
                            <input 
                                type="email" 
                                placeholder="Nhập email" 
                                value={editForm.email} 
                                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} 
                                style={{ 
                                    width: "100%", 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: errors.email ? "2px solid #ef4444" : "2px solid rgba(181, 157, 58, 0.2)", 
                                    background: '#fff', 
                                    color: '#1e293b',
                                    fontSize: 14,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.email ? "#ef4444" : "#b59d3a";
                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.email ? "#ef4444" : "rgba(181, 157, 58, 0.2)";
                                    e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                }}
                            />
                            {errors.email && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{errors.email}</div>}
                        </div>
                    </div>
                    {/* Hàng 2: Số điện thoại | Giới tính */}
                    <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Số điện thoại *</label>
                            <input 
                                placeholder="Số điện thoại" 
                                value={editForm.soDienThoai} 
                                onChange={e => setEditForm(f => ({ ...f, soDienThoai: e.target.value }))} 
                                style={{ 
                                    width: "100%", 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: errors.soDienThoai ? "2px solid #ef4444" : "2px solid rgba(181, 157, 58, 0.2)", 
                                    background: '#fff', 
                                    color: '#1e293b',
                                    fontSize: 14,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.soDienThoai ? "#ef4444" : "#b59d3a";
                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.soDienThoai ? "#ef4444" : "rgba(181, 157, 58, 0.2)";
                                    e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                }}
                            />
                            {errors.soDienThoai && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{errors.soDienThoai}</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Giới tính *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: 48 }}>
                                <label className="custom-radio" style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                                    <input type="radio" name="gender" value="Nam" checked={editForm.gioiTinh === "Nam"} onChange={() => setEditForm(f => ({ ...f, gioiTinh: "Nam" }))} />
                                    <span className="checkmark"></span> Nam
                                </label>
                                <label className="custom-radio" style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                                    <input type="radio" name="gender" value="Nữ" checked={editForm.gioiTinh === "Nữ"} onChange={() => setEditForm(f => ({ ...f, gioiTinh: "Nữ" }))} />
                                    <span className="checkmark"></span> Nữ
                                </label>
                            </div>
                        </div>
                    </div>
                    {/* Hàng 3: Ngày sinh | Tỉnh thành | Quận huyện */}
                    <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label>Ngày sinh *</label>
                            <DatePicker
                                selected={editForm.ngaySinh ? new Date(editForm.ngaySinh) : null}
                                onChange={date => setEditForm(f => ({
                                    ...f,
                                    ngaySinh: date
                                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                        : ""
                                }))}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày sinh"
                                className={`custom-datepicker-input large ${errors.ngaySinh ? 'error' : ''}`}
                                showMonthDropdown
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={new Date().getFullYear() - 1965 + 1}
                                minDate={new Date(1965, 0, 1)}
                                maxDate={new Date()}
                                wrapperClassName="custom-datepicker-wrapper"
                                locale="vi"
                            />
                            {errors.ngaySinh && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{errors.ngaySinh}</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label>Tỉnh thành *</label>
                                <select value={selectedProvince?.province_id || ''} onChange={e => {
                                    const p = provinces.find((p: any) => p.province_id === e.target.value);
                                    setSelectedProvince(p);
                                    setSelectedDistrict(null);
                                    setSelectedWard(null);
                                }} style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                                    background: '#fff', 
                                    color: '#1e293b',
                                    fontSize: 14,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                }} disabled={provinces.length === 0}>
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
                                }} style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                                    background: '#fff', 
                                    color: '#1e293b',
                                    fontSize: 14,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                }} disabled={!selectedProvince || districts.length === 0}>
                                    <option value="">{districts.length === 0 ? 'Chọn tỉnh/thành trước' : 'Chọn quận/huyện'}</option>
                                    {districts.map((d: any) => (
                                        <option key={String(d.district_id)} value={d.district_id}>{d.district_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Hàng 4: (trái trống) | Xã | Ngõ */}
                    <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }} />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label>Xã *</label>
                                <select value={selectedWard?.ward_id || ''} onChange={e => {
                                    const w = wards.find((w: any) => w.ward_id === e.target.value);
                                    setSelectedWard(w);
                                }} style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: '2px solid rgba(181, 157, 58, 0.2)', 
                                    background: '#fff', 
                                    color: '#1e293b',
                                    fontSize: 14,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                }} disabled={!selectedDistrict || wards.length === 0}>
                                    <option value="">{wards.length === 0 ? 'Chọn quận/huyện trước' : 'Chọn phường/xã'}</option>
                                    {wards.map((w: any) => (
                                        <option key={String(w.ward_id)} value={w.ward_id}>{w.ward_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label>Ngõ/ngách *</label>
                                <input 
                                    placeholder="Nhập ngõ/ngách" 
                                    value={ngoNgach} 
                                    onChange={e => setNgoNgach(e.target.value)} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 16px', 
                                        borderRadius: 10, 
                                        border: '2px solid rgba(181, 157, 58, 0.2)', 
                                        background: '#fff', 
                                        color: '#1e293b',
                                        fontSize: 14,
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#b59d3a";
                                        e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "rgba(181, 157, 58, 0.2)";
                                        e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                    }}
                                />
                                {errors.diaChi && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{errors.diaChi}</div>}
                            </div>
                        </div>
                    </div>
                    {/* Hàng 5: Nút hủy | Nút lưu */}
                    <div style={{ 
                        display: 'flex', 
                        gap: 12, 
                        justifyContent: 'center', 
                        marginTop: 24,
                        paddingTop: 20,
                        borderTop: "1px solid rgba(181, 157, 58, 0.1)"
                    }}>
                        <button 
                            type="button" 
                            onClick={handleCancel} 
                            style={{ 
                                background: "#fff", 
                                color: "#64748b", 
                                border: "2px solid rgba(181, 157, 58, 0.2)", 
                                borderRadius: 10, 
                                padding: "10px 20px", 
                                fontWeight: 600, 
                                fontSize: 14, 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 6, 
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 12px rgba(181, 157, 58, 0.1)"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = "rgba(181, 157, 58, 0.4)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(181, 157, 58, 0.2)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = "rgba(181, 157, 58, 0.2)";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.1)";
                            }}
                        >
                            <FaTimes style={{ fontSize: 18 }} /> Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={editLoading} 
                            style={{ 
                                background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: 10, 
                                padding: "10px 20px", 
                                fontWeight: 600, 
                                fontSize: 14, 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 6, 
                                cursor: editLoading ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 6px 20px rgba(181, 157, 58, 0.3)",
                                opacity: editLoading ? 0.7 : 1
                            }}
                            onMouseOver={(e) => {
                                if (!editLoading) {
                                    e.currentTarget.style.transform = "translateY(-3px)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(181, 157, 58, 0.4)";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!editLoading) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.3)";
                                }
                            }}
                        >
                            <FaSave style={{ fontSize: 18 }} /> {editLoading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </form>
                <style jsx>{`
                    input:invalid,
                    select:invalid {
                        box-shadow: none !important;
                    }
                    
                    input:focus:invalid,
                    select:focus:invalid {
                        box-shadow: none !important;
                    }
                    
                    /* Tắt tooltip validation mặc định */
                    input::-webkit-validation-bubble-message,
                    select::-webkit-validation-bubble-message {
                        display: none !important;
                    }
                    
                    /* Tắt outline khi focus */
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
                                Xác nhận cập nhật nhân viên
                            </h3>
                            <p style={{
                                margin: '0 0 24px 0',
                                fontSize: 16,
                                color: '#666',
                                lineHeight: 1.5,
                                textAlign: 'center'
                            }}>
                                Bạn có chắc chắn muốn cập nhật thông tin nhân viên này không?
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
                                    onClick={handleConfirmEdit}
                                    disabled={editLoading}
                                    style={{
                                        background: '#b59d3a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '12px 24px',
                                        fontSize: 16,
                                        fontWeight: 500,
                                        cursor: editLoading ? 'not-allowed' : 'pointer',
                                        minWidth: 100
                                    }}
                                >
                                    {editLoading ? 'Đang cập nhật...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
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