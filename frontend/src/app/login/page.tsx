"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";

console.log("render login page");

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  return score;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(10);
  const errorRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [showStaffChoice, setShowStaffChoice] = useState(false);

  // Reset popup chọn trang khi vào lại trang login
  useEffect(() => {
    setShowStaffChoice(false);
  }, []);

  // Focus input đầu tiên khi vào trang
  useEffect(() => {
    userRef.current?.focus();
  }, []);

  // Đếm ngược lockout
  useEffect(() => {
    if (lockout && lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockout && lockoutTime === 0) {
      setLockout(false);
      setLockoutTime(10);
      setFailCount(0);
    }
  }, [lockout, lockoutTime]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("submit login form");
    e.preventDefault();
    if (lockout) return;
    
    // Kiểm tra validation trước khi submit
    if (!username.trim()) {
      setError("Vui lòng nhập tên tài khoản!");
      if (errorRef.current) {
        errorRef.current.classList.remove(styles.shake);
        void errorRef.current.offsetWidth;
        errorRef.current.classList.add(styles.shake);
      }
      userRef.current?.focus();
      return;
    }
    
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu!");
      if (errorRef.current) {
        errorRef.current.classList.remove(styles.shake);
        void errorRef.current.offsetWidth;
        errorRef.current.classList.add(styles.shake);
      }
      passRef.current?.focus();
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tenTaiKhoan: username,
          matKhau: password
        })
      });
      const result = await res.json();
      if (result.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(result.data));
        // Kiểm tra vai trò
        if (result.data.vaiTro === "KHACH_HANG") {
          setSuccess(true);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              router.push("/shop");
            }, 500);
          }, 1200);
        } else if (result.data.vaiTro === "NHAN_VIEN") {
          setShowStaffChoice(true);
          setLoading(false);
        } else {
          setSuccess(true);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              router.push("/dashboard");
            }, 500);
          }, 1200);
        }
      } else {
        setFailCount(f => f + 1);
        setError(result.message || "Đăng nhập thất bại!");
        setLoading(false);
        if (errorRef.current) {
          errorRef.current.classList.remove(styles.shake);
          void errorRef.current.offsetWidth;
          errorRef.current.classList.add(styles.shake);
        }
        if (failCount + 1 >= 3) {
          setLockout(true);
        }
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ!");
      setLoading(false);
    }
  };

  // Nhấn Enter submit form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  // Tab chuyển input
  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      if (document.activeElement === userRef.current) {
        e.preventDefault();
        passRef.current?.focus();
      } else if (document.activeElement === passRef.current) {
        e.preventDefault();
        userRef.current?.focus();
      }
    }
  };

  // Press & hold con mắt để hiện mật khẩu
  const handleEyeDown = () => setShowPassword(true);
  const handleEyeUp = () => setShowPassword(false);

  // Độ mạnh mật khẩu
  const strength = getPasswordStrength(password);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Image
              src="/logo-login.png"
              alt="SoleKing Store"
              width={50}
              height={50}
              className={styles.headerLogo}
            />
            <div className={styles.brandInfo}>
              <h1 className={styles.brandName}>SoleKing Store</h1>
              <p className={styles.brandTagline}>Vua của những đôi giày</p>
            </div>
          </div>
          <button 
            className={styles.backButton}
            onClick={() => router.push("/")}
          >
            ← Về trang chủ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.loginContainer + (fadeOut ? " " + styles.fadeOut : "")}>
          {/* Left Side - Form */}
          <div className={styles.loginLeft}>
            <div className={styles.formHeader}>
              <h2 className={styles.welcomeTitle}>
                Chào mừng trở lại!
              </h2>
              <p className={styles.welcomeSubtitle}>
                Đăng nhập để tiếp tục trải nghiệm mua sắm tuyệt vời
              </p>
            </div>

            <form className={styles.loginForm} onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    className={username ? styles.filled : ""}
                    ref={userRef}
                    onKeyDown={e => { handleKeyDown(e); handleTab(e); }}
                    tabIndex={1}
                    placeholder=" "
                  />
                  <label htmlFor="username" className={styles.inputLabel}>
                    <span className={styles.labelIcon}>👤</span>
                    Tên tài khoản
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={password ? styles.filled : ""}
                    ref={passRef}
                    onKeyDown={e => { handleKeyDown(e); handleTab(e); }}
                    tabIndex={2}
                    placeholder=" "
                  />
                  <label htmlFor="password" className={styles.inputLabel}>
                    <span className={styles.labelIcon}>🔒</span>
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onMouseDown={handleEyeDown}
                    onMouseUp={handleEyeUp}
                    onMouseLeave={handleEyeUp}
                    onTouchStart={handleEyeDown}
                    onTouchEnd={handleEyeUp}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <div ref={errorRef} className={styles.errorMessage}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              {lockout && (
                <div className={styles.lockoutMessage}>
                  <span className={styles.lockoutIcon}>🔒</span>
                  Đăng nhập sai quá nhiều! Vui lòng thử lại sau {lockoutTime}s.
                </div>
              )}

              <button 
                type="submit" 
                className={styles.loginButton} 
                disabled={loading || lockout}
              >
                {loading ? (
                  <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <>
                    <span className={styles.buttonIcon}>🚀</span>
                    Đăng nhập
                  </>
                )}
              </button>

              {success && (
                <div className={styles.successMessage}>
                  <span className={styles.successIcon}>✅</span>
                  Đăng nhập thành công!
                </div>
              )}
            </form>

            <div className={styles.formFooter}>
              <p className={styles.registerText}>
                Chưa có tài khoản? 
                <a href="/register" className={styles.registerLink}>
                  Đăng ký ngay
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className={styles.loginRight}>
            <div className={styles.visualContent}>
              <div className={styles.logoContainer}>
                <Image
                  src="/logo-login.png"
                  alt="SoleKing Store"
                  width={200}
                  height={200}
                  className={styles.mainLogo}
                />
              </div>
              
              <div className={styles.welcomeText}>
                <h3 className={styles.welcomeHeading}>
                  SoleKing Store
                </h3>
                <p className={styles.welcomeDescription}>
                  Khám phá bộ sưu tập giày đa dạng với chất lượng cao cấp
                </p>
              </div>

              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>👟</span>
                  <span>Đa dạng sản phẩm</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🚚</span>
                  <span>Giao hàng nhanh</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>💎</span>
                  <span>Chất lượng cao</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Choice Modal */}
      {showStaffChoice && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowStaffChoice(false)}
            >
              ×
            </button>
            
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Chọn chế độ truy cập
              </h3>
              <p className={styles.modalSubtitle}>
                Bạn muốn sử dụng hệ thống ở chế độ nào?
              </p>
            </div>

            <div className={styles.modalButtons}>
              <button
                className={styles.modalButton}
                onClick={() => { 
                  setShowStaffChoice(false); 
                  router.push('/pos'); 
                }}
              >
                <span className={styles.buttonIcon}>💼</span>
                <div className={styles.buttonContent}>
                  <strong>Quản lý cửa hàng</strong>
                  <span>Bán hàng tại quầy, quản lý kho, thống kê</span>
                </div>
              </button>
              
              <button
                className={styles.modalButton}
                onClick={() => {
                  setShowStaffChoice(false);
                  setTimeout(() => {
                    window.location.href = '/shop';
                  }, 100);
                }}
              >
                <span className={styles.buttonIcon}>🛒</span>
                <div className={styles.buttonContent}>
                  <strong>Mua sắm online</strong>
                  <span>Xem sản phẩm, đặt hàng, thanh toán</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}