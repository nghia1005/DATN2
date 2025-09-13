"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState<string>("");
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const errorRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccess("");

        let newErrors: {[key: string]: string} = {};

        // Validation: Kiểm tra trống
        if (!email) {
            newErrors.email = "Email không được để trống!";
        }
        if (!phone) {
            newErrors.phone = "Số điện thoại không được để trống!";
        }
        if (!fullName) {
            newErrors.fullName = "Họ tên không được để trống!";
        }
        if (!gender) {
            newErrors.gender = "Vui lòng chọn giới tính!";
        }
        if (!dateOfBirth) {
            newErrors.dateOfBirth = "Ngày sinh không được để trống!";
        }

        // Validation: Format email
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Email không đúng định dạng!";
        }

        // Validation: Số điện thoại
        if (phone) {
            if (phone.startsWith(' ')) {
                newErrors.phone = "Số điện thoại không được bắt đầu bằng dấu cách!";
            } else if (phone.endsWith(' ')) {
                newErrors.phone = "Số điện thoại không được kết thúc bằng dấu cách!";
            } else if (phone.includes(' ')) {
                newErrors.phone = "Số điện thoại không được có dấu cách ở giữa!";
            } else if (/[^0-9]/.test(phone)) {
                newErrors.phone = "Số điện thoại chỉ được chứa số, không được có chữ cái hoặc ký tự đặc biệt!";
            } else if (!/^0\d{9}$/.test(phone)) {
                newErrors.phone = "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số!";
            }
        }

        // Validation: Tên khách hàng
        if (fullName) {
            const trimmedFullName = fullName.trim();

            if (trimmedFullName.length < 2) {
                newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự!";
            } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(trimmedFullName)) {
                newErrors.fullName = "Họ tên chỉ được chứa chữ cái và dấu cách!";
            } else if (trimmedFullName.includes('  ')) {
                newErrors.fullName = "Họ tên không được chứa 2 dấu cách liên tiếp!";
            } else if (fullName !== trimmedFullName) {
                newErrors.fullName = "Họ tên không được chứa khoảng trắng ở đầu hoặc cuối!";
            }
        }

        // Validation: Kiểm tra tuổi (phải đủ 16 tuổi)
        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 16) {
                newErrors.dateOfBirth = "Bạn phải đủ 16 tuổi để đăng ký tài khoản!";
            } else if (age > 120) {
                newErrors.dateOfBirth = "Ngày sinh không hợp lệ!";
            }
        }

        // Nếu có lỗi, hiển thị và dừng
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/auth/register-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    soDienThoai: phone,
                    tenKhachHang: fullName.trim(), // Sử dụng tên đã được trim
                    gioiTinh: gender,
                    ngaySinh: dateOfBirth || ""
                })
            });
            const result = await res.json();
            if (result.success) {
                // Kiểm tra xem có thông tin tài khoản trong response không
                if (result.data && result.data.tenTaiKhoan && result.data.matKhau) {
                    setSuccess(`Đăng ký thành công! Thông tin đăng nhập: ${result.data.tenTaiKhoan} / ${result.data.matKhau}`);
                } else {
                    setSuccess(result.message || "Đăng ký thành công! Vui lòng kiểm tra email để lấy thông tin tài khoản.");
                }
                setTimeout(() => router.push("/login"), 5000);
            } else {
                setErrors({general: result.message || "Đăng ký thất bại!"});
            }
        } catch (err) {
            setErrors({general: "Không thể kết nối tới máy chủ!"});
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(120deg, #cbb86c 0%, #f3e9c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div id="datepicker-portal" style={{ position: 'relative', zIndex: 9999 }}></div>

            <form
                onSubmit={handleSubmit}
                style={{
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: 20,
                    boxShadow: "0 20px 60px rgba(181, 157, 58, 0.2)",
                    padding: 40,
                    minWidth: 400,
                    maxWidth: 450,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    position: "relative",
                    zIndex: 1,
                    border: "2px solid rgba(181, 157, 58, 0.1)",
                    backdropFilter: "blur(10px)"
                }}
            >
                <h2 style={{ 
                    color: "#6b4f1d", 
                    textAlign: "center", 
                    marginBottom: 24,
                    fontSize: "24px",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #b59d3a 0%, #8b7355 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                }}>
                    Đăng ký tài khoản khách hàng
                </h2>
                <div style={{ marginBottom: 6 }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "4px", 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "#6b4f1d" 
                    }}>
                        Email *
                    </label>
                    <input
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: errors.email ? "2px solid #e57373" : "2px solid #cbb86c",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.3s ease"
                        }}
                    />
                    {errors.email && (
                        <div style={{ color: "#e57373", fontSize: "12px", marginTop: "4px" }}>{errors.email}</div>
                    )}
                </div>
                
                <div style={{ marginBottom: 6 }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "4px", 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "#6b4f1d" 
                    }}>
                        Họ và tên *
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: errors.fullName ? "2px solid #e57373" : "2px solid #cbb86c",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.3s ease"
                        }}
                    />
                    {errors.fullName && (
                        <div style={{ color: "#e57373", fontSize: "12px", marginTop: "4px" }}>{errors.fullName}</div>
                    )}
                </div>
                
                <div style={{ marginBottom: 6 }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "4px", 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "#6b4f1d" 
                    }}>
                        Số điện thoại *
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: errors.phone ? "2px solid #e57373" : "2px solid #cbb86c",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.3s ease"
                        }}
                    />
                    {errors.phone && (
                        <div style={{ color: "#e57373", fontSize: "12px", marginTop: "4px" }}>{errors.phone}</div>
                    )}
                </div>
                <div style={{ marginBottom: 6 }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "4px", 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "#6b4f1d" 
                    }}>
                        Giới tính *
                    </label>
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: errors.gender ? "2px solid #e57373" : "2px solid #cbb86c",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.3s ease",
                            backgroundColor: "white"
                        }}
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="NAM">Nam</option>
                        <option value="NU">Nữ</option>
                    </select>
                    {errors.gender && (
                        <div style={{ color: "#e57373", fontSize: "12px", marginTop: "4px" }}>{errors.gender}</div>
                    )}
                </div>
                
                <div style={{ marginBottom: 6 }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "4px", 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "#6b4f1d" 
                    }}>
                        Ngày sinh *
                    </label>
                                        <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => {
                                console.log('Date selected:', e.target.value);
                                setDateOfBirth(e.target.value);
                            }}
                            min="1900-01-01"
                            max={new Date().toISOString().split('T')[0]}
                            className={`${styles["date-input"]} ${errors.dateOfBirth ? styles.error : ""}`}
                        />
                    </div>
                    {errors.dateOfBirth && (
                        <div style={{ color: "#e57373", fontSize: "12px", marginTop: "4px" }}>{errors.dateOfBirth}</div>
                    )}
                </div>
                {errors.general && (
                    <div ref={errorRef} style={{ color: "#fff", background: "#e57373", borderRadius: 8, padding: "7px 12px", margin: "4px 0", textAlign: "center", fontWeight: 500 }}>{errors.general}</div>
                )}
                {success && (
                    <div style={{ color: "#6b5b1e", background: "#cbb86c", borderRadius: 8, padding: "7px 12px", margin: "4px 0", textAlign: "center", fontWeight: 600 }}>{success}</div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: 16,
                        padding: "14px 0",
                        background: "linear-gradient(135deg, #b59d3a 0%, #8b7355 100%)",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "16px",
                        border: "none",
                        borderRadius: 12,
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 16px rgba(181, 157, 58, 0.25)",
                        letterSpacing: 1,
                        transition: "all 0.3s ease",
                        width: "100%"
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.35)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.25)";
                        }
                    }}
                >
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
                
                <div style={{ 
                    textAlign: "center", 
                    marginTop: 16,
                    fontSize: "14px",
                    color: "#666"
                }}>
                    Đã có tài khoản?{" "}
                    <a 
                        href="/login" 
                        style={{
                            color: "#b59d3a",
                            textDecoration: "none",
                            fontWeight: "600",
                            transition: "color 0.3s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#8b7355"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#b59d3a"}
                    >
                        Đăng nhập ngay
                    </a>
                </div>
            </form>
        </div>
    );
}