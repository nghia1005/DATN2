"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoSection}>
                    <Image
                            src="/logo-login.png"
                            alt="SoleKing Store"
                            width={60}
                            height={60}
                            className={styles.headerLogo}
                        />
                        <div className={styles.brandInfo}>
                            <h1 className={styles.brandName}>SoleKing Store</h1>
                            <p className={styles.brandTagline}>Vua của những đôi giày</p>
                        </div>
                </div>
                
                    <div className={styles.headerActions}>
                        <button
                            className={styles.loginButton}
                            onClick={() => handleNavigate("/login")}
                        >
                            Đăng nhập
                        </button>
                    <button
                            className={styles.shopButton}
                            onClick={() => handleNavigate("/shop")}
                    >
                            Vào shop
                    </button>
                    </div>
                </div>
                </header>
                
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h2 className={styles.heroTitle}>
                            Chào mừng đến với <span className={styles.highlight}>SoleKing Store</span>
                        </h2>
                        <p className={styles.heroSubtitle}>
                            Khám phá bộ sưu tập giày đa dạng với chất lượng cao cấp. 
                            Từ giày thể thao đến giày công sở, chúng tôi có tất cả những gì bạn cần.
                        </p>
                        <div className={styles.heroButtons}>
                            <button 
                                className={styles.primaryButton}
                                onClick={() => handleNavigate("/shop")}
                            >
                                Mua sắm ngay
                            </button>
                            <button 
                                className={styles.secondaryButton}
                                onClick={() => handleNavigate("/login")}
                            >
                                Quản lý cửa hàng
                            </button>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <Image
                            src="/logo-login.png"
                            alt="SoleKing Store Collection"
                            width={400}
                            height={400}
                            className={styles.heroLogo}
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.featuresContent}>
                    <h3 className={styles.sectionTitle}>Tại sao chọn SoleKing Store?</h3>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>👟</div>
                            <h4>Đa dạng sản phẩm</h4>
                            <p>Hàng nghìn mẫu giày từ các thương hiệu nổi tiếng</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🚚</div>
                            <h4>Giao hàng nhanh</h4>
                            <p>Giao hàng toàn quốc với thời gian nhanh chóng</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>💎</div>
                            <h4>Chất lượng cao</h4>
                            <p>Cam kết chất lượng với chính sách bảo hành tốt</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🎁</div>
                            <h4>Khuyến mãi hấp dẫn</h4>
                            <p>Nhiều chương trình khuyến mãi và voucher giảm giá</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact & Social Section */}
            <section className={styles.contactSection}>
                <div className={styles.contactContent}>
                    <div className={styles.contactInfo}>
                        <h3 className={styles.sectionTitle}>Liên hệ với chúng tôi</h3>
                        <div className={styles.contactGrid}>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>📍</div>
                                <div>
                                    <h4>Địa chỉ</h4>
                                    <p>123 Đường ABC, Quận 1, TP.HCM</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>📞</div>
                                <div>
                                    <h4>Điện thoại</h4>
                                    <p>0901 234 567</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>✉️</div>
                                <div>
                                    <h4>Email</h4>
                                    <p>info@solekingstore.com</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>🕒</div>
                                <div>
                                    <h4>Giờ làm việc</h4>
                                    <p>8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.socialSection}>
                        <h3 className={styles.sectionTitle}>Kết nối với chúng tôi</h3>
                        <div className={styles.socialGrid}>
                            <a href="https://facebook.com/solekingstore" className={styles.socialLink}>
                                <div className={styles.socialIcon}>📘</div>
                                <span>Facebook</span>
                            </a>
                            <a href="https://instagram.com/solekingstore" className={styles.socialLink}>
                                <div className={styles.socialIcon}>📷</div>
                                <span>Instagram</span>
                            </a>
                            <a href="https://tiktok.com/@solekingstore" className={styles.socialLink}>
                                <div className={styles.socialIcon}>🎵</div>
                                <span>TikTok</span>
                            </a>
                            <a href="https://youtube.com/solekingstore" className={styles.socialLink}>
                                <div className={styles.socialIcon}>📺</div>
                                <span>YouTube</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <Image
                            src="/logo-login.png"
                            alt="SoleKing Store"
                            width={50}
                            height={50}
                            className={styles.footerLogo}
                        />
                        <p className={styles.footerTagline}>
                            Vua của những đôi giày - Nơi bạn tìm thấy phong cách của mình
                        </p>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Liên kết nhanh</h4>
                        <ul className={styles.footerLinks}>
                            <li><button onClick={() => handleNavigate("/shop")}>Mua sắm</button></li>
                            <li><button onClick={() => handleNavigate("/login")}>Quản lý</button></li>
                            <li><a href="#contact">Liên hệ</a></li>
                            <li><a href="#about">Về chúng tôi</a></li>
                        </ul>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Hỗ trợ</h4>
                        <ul className={styles.footerLinks}>
                            <li><a href="#shipping">Chính sách vận chuyển</a></li>
                            <li><a href="#warranty">Chính sách bảo hành</a></li>
                            <li><a href="#privacy">Chính sách bảo mật</a></li>
                        </ul>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>&copy; 2024 SoleKing Store. Tất cả quyền được bảo lưu.</p>
            </div>
            </footer>
        </div>
    );
}
