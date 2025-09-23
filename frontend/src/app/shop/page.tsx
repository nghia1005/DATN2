"use client";
import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import {useRouter} from "next/navigation";
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {Paper, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {SelectChangeEvent} from '@mui/material/Select';
import Badge from '@mui/material/Badge';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import LogoutIcon from '@mui/icons-material/Logout';
import Header from './Header';
import SidebarFilter from './SidebarFilter';
import ProductList from './ProductList';
import Cart from './Cart';
import CheckoutForm from './CheckoutForm';
import AddressModal from './AddressModal';
import ThankYouModal from './ThankYouModal';
import OrderLookupModal from './OrderLookupModal';

import ProductDetailModal from './ProductDetailModal';
import OrderSummary from './OrderSummary';
import Notification from './Notification';

import { useShopPageLogic } from './useShopPageLogic';

interface ProductVariant {
    idChiTietSanPham: number;
    idSanPham: number;
    maSanPham: string;
    tenSanPham: string;
    tenThuongHieu: string;
    tenDanhMuc: string;
    duongDanHinhAnh?: string;
    moTa?: string;
    trangThai?: string;
    idMauSac?: number;
    tenMauSac?: string;
    idKichCo?: number;
    tenKichCo?: string;
    gia: number;
    soLuong?: number;
    idDanhMuc?: number; // Thêm dòng này để fix lỗi linter
    // Thêm field sale

}

interface Brand { idThuongHieu: number; tenThuongHieu: string; }
interface Color { idMauSac: number; mauSac: string; }
interface Size { idKichCo: number; kichCo: string; }
interface Category { idDanhMuc: number; tenDanhMuc: string; }

export default function ShopPage() {
    // Sử dụng custom hook để lấy toàn bộ state, effect, logic
    const logic = useShopPageLogic();
    const {
        userRole, addressData, products, setProducts, loading, router, brands, colors, sizes, categories,
        selectedColors, setSelectedColors, selectedSizes, setSelectedSizes, selectedBrands, setSelectedBrands,
        search, setSearch, showWelcome, setShowWelcome, showWelcomeModal, setShowWelcomeModal, selectedProduct, setSelectedProduct, modalOpen, setModalOpen,
        modalColor, setModalColor, modalSize, setModalSize, modalQuantity, setModalQuantity, cart, setCart, showCart, setShowCart,
        selectedCartIndexes, setSelectedCartIndexes, showCheckout, setShowCheckout, checkoutItems, setCheckoutItems,
        showThankYou, setShowThankYou, lastInvoiceCode, setLastInvoiceCode, lastInvoice, setLastInvoice,
        customerInfo, setCustomerInfo, userAddresses, setUserAddresses, showAddressSelect, setShowAddressSelect, addressError, setAddressError,
        customerFormError, setCustomerFormError, fieldErrors, setFieldErrors, showNewAddressForm, setShowNewAddressForm,
        newAddress, setNewAddress,         userName, isClient,         selectedVoucher, handleVoucherChange,
        filteredProducts, modalColors, modalSizes,
        handleColorChange, handleAddToCart, updateProductQuantity, handleSaveAddress, handleAutoFillCustomerInfo,
        notification, showNotification
    } = logic;

    // State cho modal tra cứu đơn hàng
    const [showOrderLookupModal, setShowOrderLookupModal] = useState(false);

    // Tính toán danh sách tỉnh/thành, quận/huyện, phường/xã dựa trên dữ liệu addressData và customerInfo
    const provinces = addressData.results.map((p: any) => p.province_name);
    const selectedProvince = addressData.results.find((p: any) => p.province_name === customerInfo.city);
    const districts = selectedProvince ? selectedProvince.districts.map((d: any) => d.district_name) : [];
    const selectedDistrict = selectedProvince?.districts.find((d: any) => d.district_name === customerInfo.district);
    const wards = selectedDistrict ? selectedDistrict.wards.map((w: any) => w.ward_name) : [];

    // Đặt lại selectedProvinceModal và selectedDistrictModal đúng vị trí, sau khi đã có hook và trước khi sử dụng
    const selectedProvinceModal = addressData.results.find((p: any) => p.province_name === newAddress.thanhPho);
    const selectedDistrictModal = selectedProvinceModal?.districts.find((d: any) => d.district_name === newAddress.quanHuyen);

    // Sync header tab via query param when navigating from other routes
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const tab = url.searchParams.get('tab');
            if (tab === 'home') {
                setShowWelcome(true);
                setShowCart(false);
                setShowCheckout(false);
            } else if (tab === 'products') {
                setShowWelcome(false);
                setShowCart(false);
                setShowCheckout(false);
            } else if (tab === 'cart') {
                setShowWelcome(false);
                setShowCheckout(false);
                setShowCart(true);
            }
        }
    }, []);

    // --- SAU KHI GỌI HẾT HOOK, mới return sớm ---
    if (!isClient) return null;

    // Nếu là nhân viên, chỉ cho phép xem, không cho phép mua hàng
    const isStaff = userRole === 'NHAN_VIEN';

    return (
        <>
            {/* Component thông báo */}
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => showNotification('', 'info')}
            />

            {/* Nút Đăng xuất ở góc trên bên phải */}
            {/* <Box sx={{ position: 'fixed', top: 16, right: 24, zIndex: 9999 }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Đăng xuất
                </Button>
            </Box> */}
            {/* Phần còn lại của trang */}
            <Box sx={{ background: "#f8f6ed", minHeight: "100vh", py: 0 }}>
                {/* Header mới đẹp hơn */}
                <Header
                    userName={userName}
                    showWelcome={showWelcome}
                    setShowWelcome={setShowWelcome}
                    setShowCart={setShowCart}
                    setShowCheckout={setShowCheckout}
                    setShowThankYou={setShowThankYou}
                    showCart={showCart}
                    showCheckout={showCheckout}
                    showThankYou={showThankYou}
                    cart={cart}
                    router={router}
                    handleLogout={() => {
                        localStorage.removeItem('user');
                        router.push('/login');
                    }}
                    search={search}
                    setSearch={setSearch}
                    isClient={isClient}
                    showOrderLookupModal={showOrderLookupModal}
                    onOpenOrderLookup={() => setShowOrderLookupModal(true)}
                />
                {/* Main content */}
                {!showCart && !showCheckout && !showThankYou && (
                    <>
                        {false ? (
                            <Box sx={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 9999,
                                backdropFilter: 'blur(5px)'
                            }}>
                                {/* Sale Banner Modal */}
                                <Box sx={{
                                    position: 'relative',
                                    width: '70%',
                                    maxWidth: '600px',
                                    textAlign: 'center'
                                }}>
                                    <img
                                        src="/banner.png"
                                        alt="Sale Banner"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            setShowWelcomeModal(false);
                                            setShowWelcome(false);
                                            // Chuyển sang trang sản phẩm
                                            window.scrollTo(0, 0);
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.transition = 'transform 0.3s ease';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    />

                                    {/* Close button */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '-15px',
                                            right: '-15px',
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#fff',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#666',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                        onClick={() => {
                                            setShowWelcomeModal(false);
                                            // Không chuyển sang trang sale, chỉ đóng modal
                                        }}
                                    >
                                        ×
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ maxWidth: 1300, mx: "auto", px: 2, display: 'flex', gap: 4, mt: 3 }}>
                                {/* Sidebar filter - chỉ hiển thị khi xem sản phẩm */}
                                {!showWelcome && (
                                    <SidebarFilter
                                        brands={brands}
                                        colors={colors}
                                        sizes={sizes}
                                        selectedBrands={selectedBrands}
                                        setSelectedBrands={setSelectedBrands}
                                        selectedColors={selectedColors}
                                        setSelectedColors={setSelectedColors}
                                        selectedSizes={selectedSizes}
                                        setSelectedSizes={setSelectedSizes}
                                    />
                                )}
                                {/* Danh sách sản phẩm */}
                                <Box sx={{ flex: 1 }}>
                                    {/* Hiển thị trang chủ welcome khi showWelcome = true */}
                                    {showWelcome && (
                                        <Box sx={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: 6, pb: 2 }}>
                                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                                <img src="/logo-login.png" alt="SoleKing Store" style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 16, boxShadow: '0 2px 12px #b59d3a22' }} />
                                                <Typography variant="h3" sx={{ fontWeight: 900, color: '#b59d3a', mb: 1, letterSpacing: 1 }}>
                                                    Chào mừng đến với <span style={{ color: '#a88a2c' }}>SoleKing Store!</span>
                                                </Typography>
                                                <Typography variant="h6" sx={{ color: '#b59d3a', fontWeight: 500, mb: 2 }}>
                                                    SoleKing Store – Nâng tầm phong cách, khẳng định chất riêng trên từng bước chân
                                                </Typography>
                                            </Box>
                                            <Paper elevation={0} sx={{ maxWidth: 500, mx: 'auto', mb: 4, p: 3, borderRadius: 4, bgcolor: '#fffbe6', border: '1px solid #f0e3b6' }}>
                                                <List>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <CheckCircleIcon sx={{ color: '#b59d3a' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary="Cam kết uy tín – sản phẩm chính hãng, nguồn gốc rõ ràng" />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <CheckCircleIcon sx={{ color: '#b59d3a' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary="Đa dạng phong cách – cập nhật xu hướng mới nhất" />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <CheckCircleIcon sx={{ color: '#b59d3a' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary="Chất lượng phục vụ – tận tâm, chuyên nghiệp, hỗ trợ nhanh chóng" />
                                                    </ListItem>
                                                </List>
                                            </Paper>
                                            <Box sx={{ textAlign: 'center', color: '#a88a2c', fontSize: 18, mb: 2 }}>
                                                <div style={{ marginBottom: 8 }}>
                                                    <b>Hotline:</b> 0365 175 821 &nbsp;|&nbsp; <b>Email:</b> <Link href="mailto:shopsolekingstore@gmail.com" sx={{ color: '#1976d2', fontWeight: 700 }}>shopsolekingstore@gmail.com</Link> | <b>Kết nối:</b>
                                                    <Link href="https://zalo.me/g/eptuwo485" sx={{ color: '#0084ff', fontWeight: 700, mx: 1 }}>Zalo</Link>
                                                </div>
                                            </Box>
                                            <Box sx={{ width: '100%', textAlign: 'center', color: '#b59d3a', fontSize: 16, mt: 2, borderTop: '1px solid #f0e3b6', pt: 2 }}>
                                                © 2025 SoleKing Store. All rights reserved.
                                            </Box>
                                        </Box>
                                    )}
                                    {/* Danh sách sản phẩm - hiển thị khi không phải trang chủ */}
                                    {!showWelcome && (
                                        <>
                                            {loading ? (
                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                                                    <CircularProgress />
                                                </Box>
                                            ) : (
                                                <ProductList
                                                    loading={loading}
                                                    uniqueProductVariants={filteredProducts}
                                                    setSelectedProduct={setSelectedProduct}
                                                    setModalColor={setModalColor}
                                                    setModalSize={setModalSize}
                                                    setModalQuantity={setModalQuantity}
                                                    setModalOpen={setModalOpen}
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* Popup chi tiết sản phẩm */}
                                    <ProductDetailModal
                                        open={modalOpen}
                                        onClose={() => setModalOpen(false)}
                                        product={selectedProduct}
                                        colors={modalColors}
                                        sizes={modalSizes}
                                        modalColor={modalColor}
                                        setModalColor={setModalColor}
                                        modalSize={modalSize}
                                        setModalSize={setModalSize}
                                        modalQuantity={modalQuantity}
                                        setModalQuantity={setModalQuantity}
                                        // Nếu là nhân viên, truyền hàm rỗng thay vì undefined
                                        onAddToCart={isStaff ? () => {} : handleAddToCart}
                                        onBuyNow={isStaff ? () => {} : () => {
                                            if (selectedProduct) {
                                                setCheckoutItems([{ product: selectedProduct, quantity: modalQuantity }]);
                                                setModalOpen(false);
                                                setShowCheckout(true);
                                            }
                                        }}
                                    />
                                    {isStaff && (
                                        <Box sx={{ color: 'red', fontWeight: 600, mt: 2, textAlign: 'center' }}>
                                            Nhân viên không được phép mua hàng. Bạn chỉ có thể theo dõi, quản lý sản phẩm và đơn hàng.
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
                {/* Các phần Cart, Checkout, ... nếu là nhân viên thì không render hoặc chỉ render readonly */}
                {!isStaff && showCart && (
                    <Cart
                        cart={cart}
                        selectedCartIndexes={selectedCartIndexes}
                        setSelectedCartIndexes={setSelectedCartIndexes}
                        setCart={setCart}
                        setShowCart={setShowCart}
                        setShowWelcome={setShowWelcome}
                        onCheckout={() => {
                            setCheckoutItems(cart.filter((_, idx) => selectedCartIndexes.includes(idx)));
                            setShowCheckout(true);
                            setShowCart(false);
                        }}
                    />
                )}
                {/* Giao diện đặt hàng */}
                {!isStaff && showCheckout && (
                    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, mb: 6, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #b59d3a22', p: 4, display: 'flex', gap: 4 }}>
                        <CheckoutForm
                            customerInfo={customerInfo}
                            setCustomerInfo={setCustomerInfo}
                            userAddresses={userAddresses}
                            setShowAddressSelect={setShowAddressSelect}
                            setShowNewAddressForm={setShowNewAddressForm}
                            showNewAddressForm={showNewAddressForm}
                            addressError={addressError}
                            setAddressError={setAddressError}
                            vouchers={[]}
                            provinces={provinces}
                            districts={districts}
                            wards={wards}
                            selectedProvince={selectedProvince}
                            selectedDistrict={selectedDistrict}
                            setNewAddress={setNewAddress}
                            newAddress={newAddress}
                            handleCreateInvoice={() => {}}
                            userRole={userRole}
                            handleAutoFillCustomerInfo={handleAutoFillCustomerInfo}
                            customerFormError={customerFormError}
                            setCustomerFormError={setCustomerFormError}
                            fieldErrors={fieldErrors}
                            setFieldErrors={setFieldErrors}
                        />
                        <OrderSummary
                            checkoutItems={checkoutItems}
                            customerInfo={customerInfo}
                            calcCheckout={(items, voucher) => {
                                // Tính tổng tiền sản phẩm
                                const total = items.reduce((sum, item) => {
                                    return sum + (item.product.gia || 0) * item.quantity;
                                }, 0);

                                // Tính tiền giảm (voucher)
                                let discount = 0;
                                if (selectedVoucher) {
                                    if (selectedVoucher.kieuGiamGia === 'PERCENT') {
                                        // Giảm theo phần trăm
                                        discount = Math.min(
                                            total * (selectedVoucher.phanTramGiamGia / 100),
                                            selectedVoucher.giaTriToiDa
                                        );
                                    } else if (selectedVoucher.kieuGiamGia === 'FIXED') {
                                        // Giảm cố định
                                        discount = selectedVoucher.giaTriToiDa;
                                    }
                                }

                                // Tính tiền ship theo địa chỉ
                                let ship = 0;
                                if (customerInfo.city) {
                                    // Chỉ miễn ship khi có voucher FREE_SHIP
                                    if (selectedVoucher && selectedVoucher.kieuGiamGia === 'FREE_SHIP') {
                                        ship = 0; // Miễn ship khi có voucher FREE_SHIP
                                    } else {
                                        // Phí ship theo địa chỉ khi không có voucher FREE_SHIP
                                        if (customerInfo.city === 'Thành phố Hà Nội' || customerInfo.city === 'Thành phố Hồ Chí Minh') {
                                            ship = 15000; // Phí ship thấp cho Hà Nội và TP.HCM
                                        }
                                        // Phí ship cao hơn cho các tỉnh xa
                                        else if (['Tỉnh Cà Mau', 'Tỉnh Bạc Liêu', 'Tỉnh Sóc Trăng', 'Tỉnh Trà Vinh', 'Tỉnh Vĩnh Long', 'Tỉnh Bến Tre'].includes(customerInfo.city)) {
                                            ship = 45000; // Phí ship cao cho miền Tây
                                        }
                                        // Các tỉnh khác
                                        else {
                                            ship = 30000; // Phí ship thông thường
                                        }
                                    }
                                } else {
                                    // Nếu chưa chọn địa chỉ, tính phí ship mặc định
                                    ship = (selectedVoucher && selectedVoucher.kieuGiamGia === 'FREE_SHIP') ? 0 : 30000;
                                }

                                // Tính tiền cần thanh toán
                                const needPay = total - discount + ship;

                                return { total, discount, ship, needPay };
                            }}
                            onPay={                          async () => {
                                // Reset field errors
                                setFieldErrors({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    city: '',
                                    district: '',
                                    ward: '',
                                    address: ''
                                });

                                // Validation thông tin khách hàng
                                let hasError = false;
                                const newFieldErrors = {
                                    name: '',
                                    email: '',
                                    phone: '',
                                    city: '',
                                    district: '',
                                    ward: '',
                                    address: ''
                                };

                                if (!customerInfo.name || !customerInfo.name.trim()) {
                                    newFieldErrors.name = 'Vui lòng nhập tên';
                                    hasError = true;
                                }

                                if (!customerInfo.phone || !customerInfo.phone.trim()) {
                                    newFieldErrors.phone = 'Số điện thoại không hợp lệ';
                                    hasError = true;
                                }

                                if (!customerInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
                                    newFieldErrors.email = 'Email không hợp lệ';
                                    hasError = true;
                                }

                                if (!customerInfo.city) {
                                    newFieldErrors.city = 'Chọn tỉnh/thành phố';
                                    hasError = true;
                                }

                                if (!customerInfo.district) {
                                    newFieldErrors.district = 'Chọn quận/huyện';
                                    hasError = true;
                                }

                                if (!customerInfo.ward) {
                                    newFieldErrors.ward = 'Chọn phường/xã';
                                    hasError = true;
                                }

                                if (hasError) {
                                    setFieldErrors(newFieldErrors);
                                    return;
                                }

                                // Kiểm tra số lượng tồn kho trước khi thanh toán
                                const insufficientStockItems = checkoutItems.filter(item => {
                                    const product = products.find(p => p.idChiTietSanPham === item.product.idChiTietSanPham);
                                    return product && (product.soLuong || 0) < item.quantity;
                                });

                                if (insufficientStockItems.length > 0) {
                                    const itemNames = insufficientStockItems.map(item =>
                                        `${item.product.tenSanPham} (${item.product.tenMauSac}, ${item.product.tenKichCo})`
                                    ).join(', ');
                                    setCustomerFormError(`Số lượng tồn kho không đủ cho: ${itemNames}. Vui lòng cập nhật giỏ hàng!`);
                                    showNotification(`Số lượng tồn kho không đủ cho một số sản phẩm!`, 'error');
                                    return;
                                }

                                try {
                                    // Tạo hóa đơn mới
                                    // Tìm ID khách hàng từ thông tin đã nhập
                                    let idKhachHang = null;

                                    // Kiểm tra xem có đăng nhập không
                                    const currentUser = localStorage.getItem('user');
                                    if (currentUser) {
                                        const user = JSON.parse(currentUser);
                                        if (user.vaiTro === 'KHACH_HANG' || user.idVaiTro === 3) {
                                            idKhachHang = user.idKhachHang || user.id;
                                        }
                                    }

                                    // Nếu chưa đăng nhập hoặc không tìm thấy ID khách hàng, tìm kiếm theo thông tin
                                    if (!idKhachHang && customerInfo.name && customerInfo.phone) {
                                        try {
                                            const customerResponse = await fetch('http://localhost:8080/khach-hang/hien-thi');
                                            if (customerResponse.ok) {
                                                const customers = await customerResponse.json();
                                                // Tìm khách hàng theo tên và số điện thoại, hoặc theo email
                                                const foundCustomer = customers.find((c: any) =>
                                                    (c.tenKhachHang === customerInfo.name && c.soDienThoai === customerInfo.phone) ||
                                                    (customerInfo.email && c.email === customerInfo.email)
                                                );
                                                if (foundCustomer) {
                                                    idKhachHang = foundCustomer.idKhachHang;
                                                }
                                            }
                                        } catch (error) {
                                            console.log('Không tìm thấy khách hàng, sẽ tạo mới');
                                        }
                                    }

                                    // Nếu vẫn không tìm thấy, tạo khách hàng mới
                                    if (!idKhachHang) {
                                        try {
                                            // Tạo mã khách hàng tự động dựa trên thời gian hiện tại
                                            const timestamp = new Date().getTime();
                                            const randomNum = Math.floor(Math.random() * 1000);
                                            const maKhachHang = `KH${timestamp}${randomNum}`.slice(0, 20); // Giới hạn độ dài mã
                                            
                                            const newCustomerData = {
                                                maKhachHang: maKhachHang,
                                                tenKhachHang: customerInfo.name,
                                                soDienThoai: customerInfo.phone,
                                                email: customerInfo.email || `${maKhachHang}@default.com`,
                                                diaChi: `${customerInfo.address}, ${customerInfo.ward}, ${customerInfo.district}, ${customerInfo.city}`,
                                                trangThai: 'Hoạt động',
                                                gioiTinh: true  // Mặc định là Nam (true: Nam, false: Nữ)
                                            };

                                            const createCustomerResponse = await fetch('http://localhost:8080/khach-hang/them', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify(newCustomerData)
                                            });

                                            if (createCustomerResponse.ok) {
                                                const newCustomer = await createCustomerResponse.json();
                                                idKhachHang = newCustomer.data?.idKhachHang || newCustomer.idKhachHang;
                                                console.log('Đã tạo khách hàng mới với ID:', idKhachHang);
                                            } else {
                                                const errorResponse = await createCustomerResponse.text();
                                                console.error('Không thể tạo khách hàng mới. Lỗi từ server:', errorResponse);
                                                console.error('Status code:', createCustomerResponse.status);
                                                console.error('Request data:', JSON.stringify(newCustomerData, null, 2));
                                                setCustomerFormError(`Không thể tạo thông tin khách hàng. Lý do: ${errorResponse || 'Không xác định'}`);
                                                return;
                                            }
                                        } catch (error) {
                                            console.error('Lỗi khi tạo khách hàng mới:', error);
                                            setCustomerFormError('Không thể tạo thông tin khách hàng. Vui lòng thử lại!');
                                            return;
                                        }
                                    }



                                    const invoiceData = {
                                        idKhachHang: idKhachHang,
                                        idNhanVien: null,
                                        ngayTao: new Date().toISOString(),
                                        loaiHoaDon: 'Online',
                                        loaiDon: 'Online', // Thêm trường loaiDon
                                        tenNguoiNhan: customerInfo.name,
                                        soDienThoai: customerInfo.phone,
                                        email: customerInfo.email,
                                        diaChiNhanHang: `${customerInfo.address}, ${customerInfo.ward}, ${customerInfo.district}, ${customerInfo.city}`,
                                        tongTien: checkoutItems.reduce((sum, item) => sum + item.product.gia * item.quantity, 0),
                                        giamGia: selectedVoucher ? (selectedVoucher.kieuGiamGia === 'PERCENT' ?
                                            Math.min(checkoutItems.reduce((sum, item) => sum + item.product.gia * item.quantity, 0) * (selectedVoucher.phanTramGiamGia / 100), selectedVoucher.giaTriToiDa) :
                                            selectedVoucher.giaTriToiDa) : 0,
                                        phiShip: customerInfo.city ?
                                            (selectedVoucher && selectedVoucher.kieuGiamGia === 'FREE_SHIP' ? 0 :
                                                customerInfo.city === 'Thành phố Hà Nội' || customerInfo.city === 'Thành phố Hồ Chí Minh' ? 15000 :
                                                    ['Tỉnh Cà Mau', 'Tỉnh Bạc Liêu', 'Tỉnh Sóc Trăng', 'Tỉnh Trà Vinh', 'Tỉnh Vĩnh Long', 'Tỉnh Bến Tre'].includes(customerInfo.city) ? 45000 : 30000) : 30000,
                                        thanhTien: checkoutItems.reduce((sum, item) => sum + item.product.gia * item.quantity, 0) -
                                            (selectedVoucher ? (selectedVoucher.kieuGiamGia === 'PERCENT' ?
                                                Math.min(checkoutItems.reduce((sum, item) => sum + item.product.gia * item.quantity, 0) * (selectedVoucher.phanTramGiamGia / 100), selectedVoucher.giaTriToiDa) :
                                                selectedVoucher.giaTriToiDa) : 0) +
                                            (customerInfo.city ?
                                                (selectedVoucher && selectedVoucher.kieuGiamGia === 'FREE_SHIP' ? 0 :
                                                    customerInfo.city === 'Thành phố Hà Nội' || customerInfo.city === 'Thành phố Hồ Chí Minh' ? 15000 :
                                                        ['Tỉnh Cà Mau', 'Tỉnh Bạc Liêu', 'Tỉnh Sóc Trăng', 'Tỉnh Trà Vinh', 'Tỉnh Vĩnh Long', 'Tỉnh Bến Tre'].includes(customerInfo.city) ? 45000 : 30000) : 30000),
                                        trangThai: customerInfo.payment === 'bank' ? 'Đã xác nhận' : 'Chờ xác nhận',
                                        idPhieuGiamGia: selectedVoucher ? selectedVoucher.idPhieuGiamGia : null,
                                        ghiChu: '',
                                        chiTiet: checkoutItems.map(item => ({
                                            idChiTietSanPham: item.product.idChiTietSanPham,
                                            soLuong: item.quantity,
                                            donGia: item.product.gia,
                                            thanhTien: item.product.gia * item.quantity
                                        }))
                                    };

                                    console.log('Creating invoice with data:', invoiceData);

                                    const response = await fetch('http://localhost:8080/api/hoadon', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(invoiceData)
                                    });

                                    if (!response.ok) {
                                        const errorText = await response.text();
                                        console.error('Backend error response:', errorText);
                                        setCustomerFormError(`Không thể tạo hóa đơn: ${response.status} - ${errorText}`);
                                        showNotification('Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại!', 'error');
                                        return;
                                    }

                                    const result = await response.json();
                                    console.log('Invoice created successfully:', result);

                                    // Lưu mã hóa đơn
                                    if (result.data && result.data.maHoaDon) {
                                        setLastInvoiceCode(result.data.maHoaDon);
                                    } else if (result.maHoaDon) {
                                        setLastInvoiceCode(result.maHoaDon);
                                    }

                                    // Hiển thị thông báo thành công
                                    showNotification('Tạo hóa đơn thành công!', 'success');

                                    // Logic trừ số lượng sản phẩm:
                                    // - Thanh toán chuyển khoản (bank): Trạng thái "Đã xác nhận" → Trừ số lượng ngay
                                    // - Thanh toán tiền mặt (cod): Trạng thái "Chờ xác nhận" → Chỉ trừ khi admin chuyển sang "Đã xác nhận"
                                    if (customerInfo.payment === 'bank') {
                                        // Trừ số lượng ngay vì đã thanh toán chuyển khoản
                                        checkoutItems.forEach(item => {
                                            setProducts((prevProducts: ProductVariant[]) => prevProducts.map((p: ProductVariant) =>
                                                p.idChiTietSanPham === item.product.idChiTietSanPham
                                                    ? { ...p, soLuong: Math.max(0, (p.soLuong || 0) - item.quantity) }
                                                    : p
                                            ));
                                        });
                                    }
                                    // Nếu thanh toán tiền mặt, không trừ số lượng ở đây
                                    // Số lượng sẽ được trừ khi admin chuyển trạng thái từ "Chờ xác nhận" sang "Đã xác nhận"

                                    // Xử lý thanh toán thành công
                                    setShowThankYou(true);
                                    setShowCheckout(false);
                                    setShowCart(false);

                                    // Clear cart after successful order creation
                                    setCart([]);
                                    setSelectedCartIndexes([]);
                                    setShowWelcome(false);
                                } catch (error) {
                                    console.error('Error creating invoice:', error);

                                    // Xử lý lỗi từ backend
                                    let errorMessage = 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại!';
                                    setCustomerFormError(errorMessage);
                                    showNotification(errorMessage, 'error');

                                    if (error instanceof Error) {
                                        const errorText = error.message;

                                        // Kiểm tra nếu là lỗi về số lượng tồn kho
                                        if (errorText.includes('Số lượng tồn kho không đủ')) {
                                            try {
                                                // Parse JSON error response
                                                const errorMatch = errorText.match(/\{.*\}/);
                                                if (errorMatch) {
                                                    const errorData = JSON.parse(errorMatch[0]);
                                                    if (errorData.message) {
                                                        errorMessage = errorData.message;
                                                    }
                                                }
                                            } catch (parseError) {
                                                // Nếu không parse được JSON, sử dụng message gốc
                                                errorMessage = 'Số lượng tồn kho không đủ cho một số sản phẩm. Vui lòng kiểm tra lại giỏ hàng!';
                                            }
                                        } else if (errorText.includes('Không thể tạo hóa đơn')) {
                                            // Xử lý các lỗi khác từ backend
                                            try {
                                                const errorMatch = errorText.match(/\{.*\}/);
                                                if (errorMatch) {
                                                    const errorData = JSON.parse(errorMatch[0]);
                                                    if (errorData.message) {
                                                        errorMessage = errorData.message;
                                                    }
                                                }
                                            } catch (parseError) {
                                                errorMessage = 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại!';
                                            }
                                        }
                                    }

                                    setCustomerFormError(errorMessage);

                                    // Hiển thị thông báo lỗi
                                    showNotification(errorMessage, 'error');
                                }
                            }}
                            onBack={() => {
                                setShowCheckout(false);
                                setShowCart(false);
                                setShowWelcome(true);
                            }}
                            customerFormError={customerFormError}
                            setCustomerFormError={setCustomerFormError}
                            payment={customerInfo.payment}
                            setPayment={v => setCustomerInfo(info => ({ ...info, payment: v }))}
                            selectedVoucher={selectedVoucher}
                            onVoucherChange={handleVoucherChange}
                        />
                    </Box>
                )}
                <ThankYouModal
                    showThankYou={showThankYou}
                    setShowThankYou={setShowThankYou}
                    setShowWelcome={setShowWelcome}
                    invoiceCode={lastInvoiceCode}
                    customerEmail={customerInfo.email}
                />
            </Box>

            <AddressModal
                showNewAddressForm={showNewAddressForm}
                setShowNewAddressForm={setShowNewAddressForm}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                provinces={provinces}
                // Đặt lại selectedProvinceModal và selectedDistrictModal đúng vị trí, sau khi đã có hook và trước khi sử dụng
                selectedProvinceModal={selectedProvinceModal}
                selectedDistrictModal={selectedDistrictModal}
                addressError={addressError}
                setAddressError={setAddressError}
                handleSaveAddress={handleSaveAddress}
                userAddresses={userAddresses}
                setCustomerInfo={setCustomerInfo}
                setShowAddressSelect={setShowAddressSelect}
            />

            {/* Modal tra cứu đơn hàng */}
            <OrderLookupModal
                open={showOrderLookupModal}
                onClose={() => setShowOrderLookupModal(false)}
            />
        </>
    );
}