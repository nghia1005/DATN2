import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { SelectChangeEvent } from '@mui/material/Select';

// Định nghĩa các interface cần thiết (có thể copy từ page.tsx)
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
    idDanhMuc?: number;
    // Thêm field sale
    phanTramGiamGia?: number;
    trangThaiSale?: string;
}
interface Brand { idThuongHieu: number; tenThuongHieu: string; }
interface Color { idMauSac: number; mauSac: string; }
interface Size { idKichCo: number; kichCo: string; }
interface Category { idDanhMuc: number; tenDanhMuc: string; }

export function useShopPageLogic() {
    // --- State ---
    const [userRole, setUserRole] = useState<'NHAN_VIEN' | 'KHACH_HANG' | null>(null);
    const [addressData, setAddressData] = useState<any>({ results: [] });
    const [products, setProducts] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedColors, setSelectedColors] = useState<number[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [showWelcome, setShowWelcome] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState<ProductVariant | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalColor, setModalColor] = useState<string>("");
    const [modalSize, setModalSize] = useState<string>("");
    const [modalQuantity, setModalQuantity] = useState<number>(1);
    const [cart, setCart] = useState<Array<{product: ProductVariant, quantity: number}>>([]);
    const [showCart, setShowCart] = useState(false);
    const [selectedCartIndexes, setSelectedCartIndexes] = useState<number[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState<Array<{product: ProductVariant, quantity: number}>>([]);
    const [showQRSelector, setShowQRSelector] = useState(false);
    const [selectedQR, setSelectedQR] = useState<any>(null);
    const [showThankYou, setShowThankYou] = useState(false);
    const [lastInvoiceCode, setLastInvoiceCode] = useState<string>('');
    const [lastInvoice, setLastInvoice] = useState<any>(null);
    const [customerInfo, setCustomerInfo] = useState({
        name: '', email: '', phone: '', city: '', district: '', ward: '', address: '', payment: 'cod', voucher: '',
    });
    const [userAddresses, setUserAddresses] = useState<any[]>([]);
    const [showAddressSelect, setShowAddressSelect] = useState(false);
    const [addressError, setAddressError] = useState("");

    const [customerFormError, setCustomerFormError] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        thanhPho: '', quanHuyen: '', xaPhuong: '', ngoNgach: '', ghiChu: ''
    });
    const [userName, setUserName] = useState('Tài khoản');
    const [isClient, setIsClient] = useState(false);
    
    // State cho voucher
    const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
    
    // State cho thông báo
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        show: false,
        message: '',
        type: 'info'
    });

    // Hàm hiển thị thông báo
    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        console.log('showNotification called:', { message, type });
        
        if (!message) {
            console.log('Empty message, hiding notification');
            setNotification(prev => ({ ...prev, show: false }));
            return;
        }
        
        console.log('Setting notification state:', { show: true, message, type });
        setNotification({
            show: true,
            message,
            type
        });
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            console.log('Auto-hiding notification');
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // --- Effect ---
    useEffect(() => {
        setIsClient(true);
        try {
            let userStr = localStorage.getItem('user');
            if (!userStr || userStr === '{}') {
                userStr = localStorage.getItem('khachHang') || '{}';
            }
            const user = JSON.parse(userStr);
            if (user) {
                if (user.vaiTro === 'KHACH_HANG' || user.idVaiTro === 3) {
                setUserName(user.tenKhachHang || 'Khách hàng');
                } else if (user.vaiTro === 'NHAN_VIEN' || user.idVaiTro === 2) {
                    setUserName(user.tenNhanVien || user.tenTaiKhoan || 'Nhân viên');
                } else {
                    setUserName(user.tenTaiKhoan || 'Tài khoản');
                }
            } else {
                setUserName('Tài khoản');
            }
        } catch {
            setUserName('Tài khoản');
        }
    }, []);
    useEffect(() => {
        console.log('ShopPage loaded', typeof window !== 'undefined' ? localStorage.getItem('user') : null);
    }, []);
    useEffect(() => {
        fetch('/vn-address.json')
            .then(res => res.json())
            .then(data => setAddressData(data));
    }, []);
    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:8080/chi-tiet-san-pham/hien-thi")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .finally(() => setLoading(false));
        fetch("http://localhost:8080/thuong-hieu/hien-thi").then(res=>res.json()).then(setBrands);
        fetch("http://localhost:8080/mau-sac/hien-thi").then(res=>res.json()).then(setColors);
        fetch("http://localhost:8080/kich-co/hien-thi").then(res=>res.json()).then(setSizes);
        fetch("http://localhost:8080/danh-muc/hien-thi").then(res=>res.json()).then(setCategories);
    }, []);
    
    // Tự động cập nhật số lượng trong giỏ hàng khi products thay đổi
    useEffect(() => {
        if (products.length > 0 && cart.length > 0) {
            setCart(prevCart => prevCart.map(cartItem => {
                const updatedProduct = products.find(p => p.idChiTietSanPham === cartItem.product.idChiTietSanPham);
                if (updatedProduct) {
                    // Cập nhật thông tin sản phẩm và giới hạn số lượng theo tồn kho
                    return {
                        ...cartItem,
                        product: updatedProduct,
                        quantity: Math.min(cartItem.quantity, updatedProduct.soLuong || 0)
                    };
                }
                return cartItem;
            }));
        }
    }, [products, cart.length]);
    useEffect(() => {
        const khachHang = localStorage.getItem('user') || localStorage.getItem('khachHang');
        if (khachHang) {
            const user = JSON.parse(khachHang);
            console.log('User data from localStorage:', user); // Debug log
            console.log('User object keys:', Object.keys(user)); // Debug log
            console.log('User values:', Object.values(user)); // Debug log
            if (user.vaiTro === 'NHAN_VIEN' || user.idVaiTro === 2) {
                // Gọi API lấy thông tin nhân viên mới nhất
                fetch(`http://localhost:8080/nhan-vien/chi-tiet/${user.idNhanVien || user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        const nv = data.data || data;
                        setCustomerInfo({
                            name: nv.tenNhanVien || nv.tenTaiKhoan || '',
                            email: nv.email || '',
                            phone: nv.soDienThoai || nv.sdt || '',
                            city: '',
                            district: '',
                            ward: '',
                            address: '',
                            payment: 'cod',
                            voucher: '',
                        });
                        // Nếu muốn đồng bộ lại localStorage:
                        localStorage.setItem('user', JSON.stringify(nv));
                    });
            } else if (user.vaiTro === 'KHACH_HANG' || user.idVaiTro === 3) {
                // Gọi API lấy danh sách khách hàng và tìm customer theo ID
                const customerId = user.idKhachHang || user.id;
                console.log('Customer ID from user:', customerId); // Debug log
                if (customerId && customerId !== 'undefined') {
                    fetch(`http://localhost:8080/khach-hang/hien-thi`)
                      .then(res => res.json())
                      .then(data => {
                        console.log('API Response:', data); // Debug log
                        console.log('Looking for customer with ID:', customerId); // Debug log
                        // Tìm customer theo ID trong danh sách
                        const kh = data.find((customer: any) => {
                          console.log('Checking customer:', customer.idKhachHang, 'vs', customerId); // Debug log
                          return customer.idKhachHang == customerId || customer.id == customerId;
                        });
                        console.log('Customer data:', kh); // Debug log
                        console.log('danhSachDiaChi:', kh?.danhSachDiaChi); // Debug log
                        console.log('danhSachDiaChi type:', typeof kh?.danhSachDiaChi); // Debug log
                        console.log('danhSachDiaChi isArray:', Array.isArray(kh?.danhSachDiaChi)); // Debug log
                        console.log('Phone fields:', {
                          soDienThoai: kh?.soDienThoai,
                          sdt: kh?.sdt,
                          phone: kh?.phone,
                          dienThoai: kh?.dienThoai
                        }); // Debug log
                        if (kh) {
                          setCustomerInfo({
                            name: kh.tenKhachHang || '',
                            email: kh.email || '',
                            phone: kh.soDienThoai || kh.sdt || kh.phone || kh.dienThoai || '',
                            city: kh.thanhPho || '',
                            district: kh.quanHuyen || '',
                            ward: kh.xaPhuong || '',
                            address: kh.diaChi || '',
                            payment: 'cod',
                            voucher: '',
                          });
                          
                          // Luôn set userAddresses từ danhSachDiaChi
                          console.log('kh.danhSachDiaChi exists:', !!kh.danhSachDiaChi);
                          console.log('kh.danhSachDiaChi value:', kh.danhSachDiaChi);
                          setUserAddresses(kh.danhSachDiaChi || []);
                          console.log('Set userAddresses to:', kh.danhSachDiaChi || []);
                        } else {
                          console.error('Không tìm thấy khách hàng với ID:', customerId);
                          // Fallback: sử dụng thông tin từ localStorage
                          setCustomerInfo({
                            name: user.tenKhachHang || '',
                            email: user.email || '',
                            phone: user.soDienThoai || user.sdt || '',
                            city: '',
                            district: '',
                            ward: '',
                            address: '',
                            payment: 'cod',
                            voucher: '',
                          });
                        }
                      })
                      .catch(err => {
                        console.error('Lỗi khi lấy thông tin khách hàng:', err);
                        // Fallback: sử dụng thông tin từ localStorage
                        setCustomerInfo({
                          name: user.tenKhachHang || '',
                          email: user.email || '',
                          phone: user.soDienThoai || user.sdt || '',
                          city: '',
                          district: '',
                          ward: '',
                          address: '',
                          payment: 'cod',
                          voucher: '',
                        });
                      });
                } else {
                    // Nếu không có ID, tìm theo tên tài khoản hoặc tên khách hàng
                    console.log('No customer ID, trying to find by username or name:', user.tenTaiKhoan, user.tenKhachHang);
                    fetch(`http://localhost:8080/khach-hang/hien-thi`)
                      .then(res => res.json())
                      .then(data => {
                        console.log('API Response for name search:', data);
                        // Tìm customer theo tên tài khoản hoặc tên khách hàng
                        const kh = data.find((customer: any) => 
                          customer.tenKhachHang === user.tenKhachHang || 
                          customer.email === user.tenTaiKhoan ||
                          customer.tenKhachHang === user.tenTaiKhoan
                        );
                        console.log('Customer found by name:', kh);
                        if (kh) {
                          setCustomerInfo({
                            name: kh.tenKhachHang || '',
                            email: kh.email || '',
                            phone: kh.soDienThoai || kh.sdt || kh.phone || kh.dienThoai || '',
                            city: kh.thanhPho || '',
                            district: kh.quanHuyen || '',
                            ward: kh.xaPhuong || '',
                            address: kh.diaChi || '',
                            payment: 'cod',
                            voucher: '',
                          });
                          
                          // Luôn set userAddresses từ danhSachDiaChi
                          console.log('kh.danhSachDiaChi exists:', !!kh.danhSachDiaChi);
                          console.log('kh.danhSachDiaChi value:', kh.danhSachDiaChi);
                          setUserAddresses(kh.danhSachDiaChi || []);
                          console.log('Set userAddresses to:', kh.danhSachDiaChi || []);
                        } else {
                          console.error('Không tìm thấy khách hàng với tên:', user.tenKhachHang, user.tenTaiKhoan);
                          // Fallback: sử dụng thông tin từ localStorage
                          setCustomerInfo({
                            name: user.tenKhachHang || '',
                            email: user.email || '',
                            phone: user.soDienThoai || user.sdt || '',
                            city: '',
                            district: '',
                            ward: '',
                            address: '',
                            payment: 'cod',
                            voucher: '',
                          });
                        }
                      })
                      .catch(err => {
                        console.error('Lỗi khi tìm khách hàng theo tên:', err);
                        // Fallback: sử dụng thông tin từ localStorage
                        setCustomerInfo({
                          name: user.tenKhachHang || '',
                          email: user.email || '',
                          phone: user.soDienThoai || user.sdt || '',
                          city: '',
                          district: '',
                          ward: '',
                          address: '',
                          payment: 'cod',
                          voucher: '',
                        });
                      });
                }
            } else {
                // Khách hàng giữ logic cũ
                setCustomerInfo((prev) => ({
                    ...prev,
                    name: prev.name && prev.name.trim() ? prev.name : (user.tenKhachHang || user.tenNhanVien || ''),
                    email: prev.email && prev.email.trim() ? prev.email : (user.email || ''),
                    phone: prev.phone && prev.phone.trim() ? prev.phone : (user.soDienThoai || user.sdt || ''),
                }));
            }
            // Nếu là nhân viên và có diaChi, chuyển thành mảng danhSachDiaChi
            if (!user.danhSachDiaChi && user.diaChi) {
                user.danhSachDiaChi = [{
                    thanhPho: '',
                    quanHuyen: '',
                    xaPhuong: '',
                    ngoNgach: user.diaChi,
                    ghiChu: 'Địa chỉ nhân viên'
                }];
            }
            if (user.danhSachDiaChi && Array.isArray(user.danhSachDiaChi)) {
                setUserAddresses(user.danhSachDiaChi);
            } else {
                setUserAddresses([]);
            }
        }
    }, []);
    useEffect(() => {
        const khachHang = localStorage.getItem('user') || localStorage.getItem('khachHang');
        if (khachHang) {
            const user = JSON.parse(khachHang);
            if (user.vaiTro === 'NHAN_VIEN' || user.idVaiTro === 2) {
                setUserRole('NHAN_VIEN');
                // Gọi API lấy thông tin nhân viên mới nhất
                fetch(`http://localhost:8080/nhan-vien/chi-tiet/${user.idNhanVien || user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        const nv = data.data || data;
                        setCustomerInfo({
                            name: nv.tenNhanVien || nv.tenTaiKhoan || '',
                            email: nv.email || '',
                            phone: nv.soDienThoai || nv.sdt || '',
                            city: '',
                            district: '',
                            ward: '',
                            address: '',
                            payment: 'cod',
                            voucher: '',
                        });
                        // Nếu muốn đồng bộ lại localStorage:
                        localStorage.setItem('user', JSON.stringify(nv));
                    });
            } else {
                setUserRole('KHACH_HANG');
                // Khách hàng giữ logic cũ
            setCustomerInfo((prev) => ({
                ...prev,
                    name: prev.name && prev.name.trim() ? prev.name : (user.tenKhachHang || user.tenNhanVien || ''),
                email: prev.email && prev.email.trim() ? prev.email : (user.email || ''),
                    phone: prev.phone && prev.phone.trim() ? prev.phone : (user.soDienThoai || user.sdt || ''),
                }));
            }
            // Nếu là nhân viên và có diaChi, chuyển thành mảng danhSachDiaChi
            if (!user.danhSachDiaChi && user.diaChi) {
                user.danhSachDiaChi = [{
                    thanhPho: '',
                    quanHuyen: '',
                    xaPhuong: '',
                    ngoNgach: user.diaChi,
                    ghiChu: 'Địa chỉ nhân viên'
                }];
            }
            if (user.danhSachDiaChi && Array.isArray(user.danhSachDiaChi)) {
                setUserAddresses(user.danhSachDiaChi);
            } else {
                setUserAddresses([]);
            }
        }
    }, []);

    // --- Các hàm xử lý logic, filter, ... ---
    // Lọc sản phẩm theo filter + search + menu hãng + sale
    const filteredProducts = products.filter(product => {
        if (product.trangThai === 'Ngừng bán') return false;
        

        
        const matchColor = selectedColors.length === 0 || colors.find(c => c.idMauSac === product.idMauSac && selectedColors.includes(c.idMauSac));
        const matchSize = selectedSizes.length === 0 || sizes.find(s => s.idKichCo === product.idKichCo && selectedSizes.includes(s.idKichCo));
        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(product.tenThuongHieu);
        const matchSearch = !search || product.tenSanPham.toLowerCase().includes(search.toLowerCase());
        return matchBrand && matchColor && matchSize && matchSearch;
    });



    // Lấy các màu và size có thể chọn cho sản phẩm đang xem
    const modalColors = selectedProduct ? colors.filter(c => c.idMauSac === selectedProduct.idMauSac || products.some(p => p.idSanPham === selectedProduct.idSanPham && p.idMauSac === c.idMauSac)) : [];
    const modalSizes = selectedProduct ? sizes.filter(s => s.idKichCo === selectedProduct.idKichCo || products.some(p => p.idSanPham === selectedProduct.idSanPham && p.idKichCo === s.idKichCo)) : [];

    // Khi chọn màu sắc trong popup, đổi selectedProduct sang biến thể đúng màu
    const handleColorChange = (e: SelectChangeEvent<string>) => {
        const newColor = e.target.value;
        setModalColor(newColor);
        // Tìm biến thể cùng idSanPham, đúng màu
        const matched = products.find(
            p =>
                p.idSanPham === selectedProduct?.idSanPham &&
                p.tenMauSac === newColor
        );
        if (matched) {
            setSelectedProduct(matched);
            setModalSize(matched.tenKichCo || "");
            setModalQuantity(1);
        }
    };

    // Khi bấm 'Thêm vào giỏ', cập nhật cart và showCart
    const handleAddToCart = () => {
        if (!selectedProduct) return;
        setCart(prev => {
            const idx = prev.findIndex(item => item.product.idChiTietSanPham === selectedProduct.idChiTietSanPham);
            if (idx !== -1) {
                // Đã có, cộng dồn số lượng, không vượt quá kho
                const newCart = [...prev];
                const maxQty = selectedProduct.soLuong || 1;
                newCart[idx] = {
                    ...newCart[idx],
                    quantity: Math.min(maxQty, newCart[idx].quantity + modalQuantity)
                };
                return newCart;
            } else {
                // Thêm mới
                return [...prev, { product: selectedProduct, quantity: modalQuantity }];
            }
        });
        setModalOpen(false);
    };

    // Hàm cập nhật số lượng sản phẩm trong state products và localStorage
    const updateProductQuantity = (idChiTietSanPham: number, quantity: number) => {
        setProducts((prevProducts: ProductVariant[]) => prevProducts.map(p =>
            p.idChiTietSanPham === idChiTietSanPham
                ? { ...p, soLuong: (p.soLuong || 0) - quantity }
                : p
        ));
        // Nếu bạn lưu products vào localStorage, cập nhật ở đây
        const stored = localStorage.getItem('products');
        if (stored) {
            const arr = JSON.parse(stored);
            const idx = arr.findIndex((p: any) => p.idChiTietSanPham === idChiTietSanPham);
            if (idx !== -1) {
                arr[idx].soLuong = (arr[idx].soLuong || 0) - quantity;
                localStorage.setItem('products', JSON.stringify(arr));
            }
        }
    };

    // Hàm lưu địa chỉ mới
    const handleSaveAddress = async () => {
        if (!newAddress.thanhPho || !newAddress.quanHuyen || !newAddress.xaPhuong) {
            setAddressError('Vui lòng điền đầy đủ thông tin địa chỉ!');
            return;
        }
        
        setAddressError('');
        
        // Kiểm tra xem có user đăng nhập không
        const khachHang = localStorage.getItem('user') || localStorage.getItem('khachHang');
        console.log('handleSaveAddress - khachHang from localStorage:', khachHang);
        
        if (khachHang) {
            // Nếu có user đăng nhập, lưu vào backend
            try {
                const user = JSON.parse(khachHang);
                console.log('handleSaveAddress - user object:', user);
                console.log('handleSaveAddress - user keys:', Object.keys(user));
                
                // Tìm customer ID từ nhiều trường có thể có
                let customerId = user.idKhachHang || user.id || user.customerId;
                
                // Nếu không có ID trực tiếp, tìm theo email hoặc tên tài khoản
                if (!customerId) {
                    console.log('handleSaveAddress - No direct ID, searching by email/username');
                    // Gọi API để tìm customer theo email hoặc tên tài khoản
                    const searchResponse = await fetch(`http://localhost:8080/khach-hang/hien-thi`);
                    if (searchResponse.ok) {
                        const customers = await searchResponse.json();
                        const foundCustomer = customers.find((c: any) => 
                            c.email === user.email || 
                            c.tenTaiKhoan === user.tenTaiKhoan ||
                            c.tenKhachHang === user.tenKhachHang
                        );
                        if (foundCustomer) {
                            customerId = foundCustomer.idKhachHang;
                            console.log('handleSaveAddress - Found customer by search:', foundCustomer);
                        }
                    }
                }
                
                if (!customerId) {
                    setAddressError('Không tìm thấy thông tin khách hàng! Vui lòng đăng nhập lại.');
                    return;
                }
                
                // Gửi địa chỉ lên backend
                const response = await fetch(`http://localhost:8080/khach-hang/${customerId}/dia-chi`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        thanhPho: newAddress.thanhPho,
                        quanHuyen: newAddress.quanHuyen,
                        xaPhuong: newAddress.xaPhuong,
                        ngoNgach: newAddress.ngoNgach || '',
                        ghiChu: newAddress.ghiChu || '',
                        macDinh: 'Không'
                    })
                });
                
                if (response.ok) {
                    // Lưu vào state local
                    setUserAddresses(prev => [...prev, newAddress]);
                    setCustomerInfo(prev => ({
                        ...prev,
                        city: newAddress.thanhPho,
                        district: newAddress.quanHuyen,
                        ward: newAddress.xaPhuong,
                        address: newAddress.ngoNgach || ''
                    }));
                    setShowNewAddressForm(false);
                    setNewAddress({ thanhPho: '', quanHuyen: '', xaPhuong: '', ngoNgach: '', ghiChu: '' });
                    
                    // Hiển thị thông báo thành công
                    showNotification('✅ Lưu địa chỉ thành công!', 'success');
                } else {
                    const errorData = await response.json();
                    const errorMessage = `Lỗi: ${errorData.message || 'Không thể lưu địa chỉ'}`;
                    setAddressError(errorMessage);
                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi lưu địa chỉ:', error);
                const errorMessage = 'Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại!';
                setAddressError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } else {
            // Nếu không có user đăng nhập, chỉ lưu tạm thời vào state local
            setUserAddresses(prev => [...prev, newAddress]);
            setCustomerInfo(prev => ({
                ...prev,
                city: newAddress.thanhPho,
                district: newAddress.quanHuyen,
                ward: newAddress.xaPhuong,
                address: newAddress.ngoNgach || ''
            }));
            setShowNewAddressForm(false);
            setNewAddress({ thanhPho: '', quanHuyen: '', xaPhuong: '', ngoNgach: '', ghiChu: '' });
            
            // Hiển thị thông báo
            showNotification('✅ Địa chỉ đã được thêm vào form. Lưu vào tài khoản khi đăng nhập!', 'success');
        }
    };

    // Function tự động điền thông tin khách hàng
    const handleAutoFillCustomerInfo = () => {
        const khachHang = localStorage.getItem('user') || localStorage.getItem('khachHang');
        if (khachHang) {
            const user = JSON.parse(khachHang);
            if (user.vaiTro === 'KHACH_HANG' || user.idVaiTro === 3) {
                const customerId = user.idKhachHang || user.id;
                console.log('Auto-fill Customer ID from user:', customerId); // Debug log
                if (customerId && customerId !== 'undefined') {
                    // Gọi API lấy danh sách khách hàng và tìm customer theo ID
                    fetch(`http://localhost:8080/khach-hang/hien-thi`)
                        .then(res => res.json())
                        .then(data => {
                            console.log('Auto-fill API Response:', data); // Debug log
                            console.log('Auto-fill Looking for customer with ID:', customerId); // Debug log
                            // Tìm customer theo ID trong danh sách
                            const kh = data.find((customer: any) => {
                              console.log('Auto-fill Checking customer:', customer.idKhachHang, 'vs', customerId); // Debug log
                              return customer.idKhachHang == customerId || customer.id == customerId;
                            });
                            console.log('Auto-fill Customer data:', kh); // Debug log
                            console.log('Auto-fill danhSachDiaChi:', kh?.danhSachDiaChi); // Debug log
                            console.log('Auto-fill danhSachDiaChi type:', typeof kh?.danhSachDiaChi); // Debug log
                            console.log('Auto-fill danhSachDiaChi isArray:', Array.isArray(kh?.danhSachDiaChi)); // Debug log
                            console.log('Auto-fill Phone fields:', {
                                soDienThoai: kh?.soDienThoai,
                                sdt: kh?.sdt,
                                phone: kh?.phone,
                                dienThoai: kh?.dienThoai
                            }); // Debug log
                            if (kh) {
                              setCustomerInfo({
                                  name: kh.tenKhachHang || '',
                                  email: kh.email || '',
                                  phone: kh.soDienThoai || kh.sdt || kh.phone || kh.dienThoai || '',
                                  city: kh.thanhPho || '',
                                  district: kh.quanHuyen || '',
                                  ward: kh.xaPhuong || '',
                                  address: kh.diaChi || '',
                                  payment: 'cod',
                                  voucher: '',
                              });
                              
                              // Luôn set userAddresses từ danhSachDiaChi
                              console.log('Auto-fill kh.danhSachDiaChi exists:', !!kh.danhSachDiaChi);
                              console.log('Auto-fill kh.danhSachDiaChi value:', kh.danhSachDiaChi);
                              setUserAddresses(kh.danhSachDiaChi || []);
                              console.log('Auto-fill Set userAddresses to:', kh.danhSachDiaChi || []);
                            } else {
                              console.error('Không tìm thấy khách hàng với ID:', customerId);
                              // Fallback: sử dụng thông tin từ localStorage
                              setCustomerInfo(prev => ({
                                  ...prev,
                                  name: user.tenKhachHang || '',
                                  phone: user.soDienThoai || user.sdt || '',
                              }));
                            }
                        })
                        .catch(err => {
                            console.error('Lỗi khi lấy thông tin khách hàng:', err);
                            // Fallback: sử dụng thông tin từ localStorage
                            setCustomerInfo(prev => ({
                                ...prev,
                                name: user.tenKhachHang || '',
                                phone: user.soDienThoai || user.sdt || '',
                            }));
                        });
                } else {
                    // Nếu không có ID, tìm theo tên tài khoản hoặc tên khách hàng
                    console.log('Auto-fill No customer ID, trying to find by username or name:', user.tenTaiKhoan, user.tenKhachHang);
                    fetch(`http://localhost:8080/khach-hang/hien-thi`)
                        .then(res => res.json())
                        .then(data => {
                            console.log('Auto-fill API Response for name search:', data);
                            // Tìm customer theo tên tài khoản hoặc tên khách hàng
                            const kh = data.find((customer: any) => 
                              customer.tenKhachHang === user.tenKhachHang || 
                              customer.email === user.tenTaiKhoan ||
                              customer.tenKhachHang === user.tenTaiKhoan
                            );
                            console.log('Auto-fill Customer found by name:', kh);
                            if (kh) {
                              setCustomerInfo({
                                  name: kh.tenKhachHang || '',
                                  email: kh.email || '',
                                  phone: kh.soDienThoai || kh.sdt || kh.phone || kh.dienThoai || '',
                                  city: kh.thanhPho || '',
                                  district: kh.quanHuyen || '',
                                  ward: kh.xaPhuong || '',
                                  address: kh.diaChi || '',
                                  payment: 'cod',
                                  voucher: '',
                              });
                            } else {
                              console.error('Auto-fill Không tìm thấy khách hàng với tên:', user.tenKhachHang, user.tenTaiKhoan);
                              // Fallback: sử dụng thông tin từ localStorage
                              setCustomerInfo(prev => ({
                                  ...prev,
                                  name: user.tenKhachHang || '',
                                  phone: user.soDienThoai || user.sdt || '',
                              }));
                            }
                        })
                        .catch(err => {
                            console.error('Auto-fill Lỗi khi tìm khách hàng theo tên:', err);
                            // Fallback: sử dụng thông tin từ localStorage
                            setCustomerInfo(prev => ({
                                ...prev,
                                name: user.tenKhachHang || '',
                                phone: user.soDienThoai || user.sdt || '',
                            }));
                        });
                }
            } else {
                // Nếu không phải khách hàng, chỉ điền thông tin cơ bản
                setCustomerInfo(prev => ({
                    ...prev,
                    name: user.tenKhachHang || user.tenNhanVien || '',
                    phone: user.soDienThoai || user.sdt || '',
                }));
            }
        }
    };

    // Hàm xử lý voucher
    const handleVoucherChange = (voucher: any) => {
        setSelectedVoucher(voucher);
    };

    // Xử lý MoMo payment return
    useEffect(() => {
        console.log('🔍 useEffect for MoMo return - Component mounted/updated');
        
        const checkMomoPaymentReturn = async () => {
            console.log('🔍 useEffect triggered - checking MoMo return');
            const urlParams = new URLSearchParams(window.location.search);
            const momoReturn = urlParams.get('momo_return');
            
            console.log('🔍 Current URL:', window.location.href);
            console.log('🔍 momo_return param:', momoReturn);
            console.log('🔍 All URL params:', Object.fromEntries(urlParams.entries()));
            
            // Kiểm tra nhiều trường hợp có thể là MoMo return
            const isMomoReturn = momoReturn === 'true' || 
                                urlParams.get('resultCode') !== null || 
                                urlParams.get('message') !== null ||
                                urlParams.get('orderId') !== null;
            
            console.log('🔍 isMomoReturn:', isMomoReturn);
            
            if (isMomoReturn) {
                console.log('🔄 MoMo payment return detected');
                
                // Lấy orderId từ localStorage hoặc URL params
                const momoOrderId = urlParams.get('orderId') || localStorage.getItem('pendingMomoOrderId');
                
                if (momoOrderId) {
                    console.log('📋 MoMo orderId:', momoOrderId);
                    
                    try {
                        // Kiểm tra trạng thái giao dịch MoMo
                        const statusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
                        const statusResult = await statusResponse.json();
                        
                        console.log('📊 MoMo status check result:', statusResult);
                        
                        console.log('🔍 Status check result:', statusResult);
                        console.log('🔍 Transaction status:', statusResult.data?.trangThai);
                        
                        if (statusResult.success && statusResult.data?.trangThai === 'Thành công') {
                            // Thanh toán thành công - Tạo hóa đơn và link
                            console.log('🎉 MoMo payment successful, creating invoice...');
                            try {
                                // Lấy thông tin đơn hàng từ localStorage
                                const checkoutData = localStorage.getItem('checkoutData');
                                console.log('📋 Checkout data from localStorage:', checkoutData);
                                if (checkoutData) {
                                    const orderData = JSON.parse(checkoutData);
                                    
                                    console.log('📝 Creating invoice with data:', {
                                        ...orderData,
                                        phuongThucThanhToan: 'MOMO',
                                        trangThai: 'Đã thanh toán'
                                    });
                                    
                                    // Tạo hóa đơn
                                    const invoiceResponse = await fetch('http://localhost:8080/api/hoadon', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            ...orderData,
                                            phuongThucThanhToan: 'MOMO',
                                            trangThai: 'Chờ xác nhận'
                                        }),
                                    });
                                    
                                    console.log('📊 Invoice response status:', invoiceResponse.status);
                                    if (invoiceResponse.ok) {
                                        const invoiceResult = await invoiceResponse.json();
                                        console.log('✅ Invoice created successfully:', invoiceResult);
                                        const idHoaDon = invoiceResult.data.idHoaDon;
                                        
                                        // Link MoMo transaction với hóa đơn
                                        console.log('🔗 Linking MoMo transaction with invoice...');
                                        const linkResponse = await fetch(`http://localhost:8080/api/momo/link-invoice/${momoOrderId}/${idHoaDon}`, {
                                            method: 'POST'
                                        });
                                        console.log('🔗 Link response:', linkResponse.status);
                                        
                                        // Redirect về trang thank you với thông tin hóa đơn
                                        const thankYouUrl = `/shop/thank-you?invoiceCode=${invoiceResult.data.maHoaDon}&email=${orderData.email || customerInfo.email}`;
                                        console.log('🔄 Redirecting to:', thankYouUrl);
                                        window.location.href = thankYouUrl;
                                    } else {
                                        const errorText = await invoiceResponse.text();
                                        console.error('❌ Invoice creation failed:', errorText);
                                        showNotification('❌ Lỗi tạo hóa đơn sau thanh toán MoMo.', 'error');
                                    }
                                } else {
                                    console.log('⚠️ No checkout data found in localStorage');
                                    console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
                                    console.log('🔍 pendingMomoOrderId:', localStorage.getItem('pendingMomoOrderId'));
                                    console.log('🔍 checkoutData:', localStorage.getItem('checkoutData'));
                                    showNotification('💳 Thanh toán MoMo thành công!', 'success');
                                }
                            } catch (error) {
                                console.error('Error creating invoice after MoMo payment:', error);
                                showNotification('💳 Thanh toán MoMo thành công!', 'success');
                            }
                            
                            // Xóa orderId khỏi localStorage
                            localStorage.removeItem('pendingMomoOrderId');
                            localStorage.removeItem('checkoutData');
                            
                            // Xóa params khỏi URL
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, document.title, newUrl);
                            
                        } else if (statusResult.success && statusResult.data?.trangThai === 'Chờ thanh toán') {
                            // Vẫn đang chờ - Tự động thử test thành công
                            showNotification('⏳ Đang xử lý thanh toán MoMo...', 'info');
                            
                            try {
                                // Tự động trigger test thành công
                                const testResponse = await fetch(`http://localhost:8080/api/momo/test-success/${momoOrderId}`, {
                                    method: 'POST'
                                });
                                const testResult = await testResponse.json();
                                
                                if (testResult.success) {
                                    // Check lại status sau khi test
                                    const newStatusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${momoOrderId}`);
                                    const newStatusResult = await newStatusResponse.json();
                                    
                                    if (newStatusResult.success && newStatusResult.data?.trangThai === 'Thành công') {
                                        showNotification('💳 Thanh toán MoMo thành công! Đơn hàng của bạn đã được xử lý.', 'success');
                                        
                                        // Xóa orderId khỏi localStorage
                                        localStorage.removeItem('pendingMomoOrderId');
                                        
                                        // Xóa params khỏi URL
                                        const newUrl = window.location.pathname;
                                        window.history.replaceState({}, document.title, newUrl);
                                    }
                                }
                            } catch (error) {
                                console.error('Auto test error:', error);
                                showNotification('❌ Có lỗi xảy ra khi xử lý thanh toán MoMo. Vui lòng liên hệ hỗ trợ.', 'error');
                            }
                        } else {
                            showNotification('❌ Thanh toán MoMo chưa hoàn thành. Vui lòng thử lại.', 'error');
                        }
                    } catch (error) {
                        console.error('Error checking MoMo status:', error);
                        showNotification('❌ Không thể kiểm tra trạng thái thanh toán MoMo.', 'error');
                    }
                } else {
                    console.log('❌ No MoMo orderId found');
                }
            }
        };

        // Chỉ chạy khi component mount và có params
        if (typeof window !== 'undefined') {
            console.log('🔍 Component mounted, calling checkMomoPaymentReturn');
            checkMomoPaymentReturn();
        } else {
            console.log('🔍 Window not available, skipping MoMo check');
        }
    }, []);

    // Thêm useEffect để kiểm tra localStorage và force trigger logic tạo hóa đơn
    useEffect(() => {
        const checkPendingMomoOrder = async () => {
            console.log('🔍 Checking for pending MoMo orders in localStorage');
            
            let pendingOrderId = localStorage.getItem('pendingMomoOrderId');
            const checkoutData = localStorage.getItem('checkoutData');
            
            console.log('🔍 pendingOrderId:', pendingOrderId);
            console.log('🔍 checkoutData exists:', !!checkoutData);
            
            console.log('🔍 All localStorage keys:', Object.keys(localStorage));
            console.log('🔍 All localStorage values:', {
                pendingMomoOrderId: localStorage.getItem('pendingMomoOrderId'),
                checkoutData: localStorage.getItem('checkoutData'),
                otherKeys: Object.keys(localStorage).filter(key => key !== 'pendingMomoOrderId' && key !== 'checkoutData')
            });
            
            if (pendingOrderId && checkoutData) {
                console.log('🔍 Found pending MoMo order, checking status...');
            } else if (checkoutData && !pendingOrderId) {
                console.log('🔍 No pendingOrderId but have checkoutData, searching for recent MoMo transactions...');
                
                try {
                    // Tìm giao dịch MoMo gần nhất cho loại Online
                    const searchResponse = await fetch('http://localhost:8080/api/momo/recent-online');
                    const searchResult = await searchResponse.json();
                    
                    if (searchResult.success && searchResult.data) {
                        console.log('🔍 Found recent MoMo transaction:', searchResult.data);
                        pendingOrderId = searchResult.data.orderId;
                    }
                } catch (error) {
                    console.error('Error searching for recent MoMo transaction:', error);
                }
            }
            
            if (pendingOrderId && checkoutData) {
                console.log('🔍 Proceeding with orderId:', pendingOrderId);
                
                try {
                    // Kiểm tra trạng thái giao dịch MoMo
                    const statusResponse = await fetch(`http://localhost:8080/api/momo/check-status/${pendingOrderId}`);
                    const statusResult = await statusResponse.json();
                    
                    console.log('🔍 MoMo status check result:', statusResult);
                    
                    if (statusResult.success && statusResult.data?.trangThai === 'Thành công') {
                        console.log('🎉 MoMo payment successful, creating invoice...');
                        
                        const orderData = JSON.parse(checkoutData);
                        
                        console.log('📝 Creating invoice with data:', {
                            ...orderData,
                            phuongThucThanhToan: 'MOMO',
                            trangThai: 'Chờ xác nhận'
                        });
                        
                        // Tạo hóa đơn
                        const invoiceResponse = await fetch('http://localhost:8080/api/hoadon', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...orderData,
                                phuongThucThanhToan: 'MOMO',
                                trangThai: 'Chờ xác nhận'
                            }),
                        });
                        
                        console.log('📊 Invoice response status:', invoiceResponse.status);
                        if (invoiceResponse.ok) {
                            const invoiceResult = await invoiceResponse.json();
                            console.log('✅ Invoice created successfully:', invoiceResult);
                            
                            console.log('🔍 Invoice result structure:', invoiceResult);
                            console.log('🔍 invoiceResult.data:', invoiceResult.data);
                            console.log('🔍 invoiceResult.data.idHoaDon:', invoiceResult.data?.idHoaDon);
                            
                            // Kiểm tra idHoaDon trong cả data và root level
                            const idHoaDon = invoiceResult.data?.idHoaDon || invoiceResult.idHoaDon;
                            
                            if (idHoaDon) {
                                
                                // Link MoMo transaction với hóa đơn
                                console.log('🔗 Linking MoMo transaction with invoice...');
                                const linkResponse = await fetch(`http://localhost:8080/api/momo/link-invoice/${pendingOrderId}/${idHoaDon}`, {
                                    method: 'POST'
                                });
                                console.log('🔗 Link response:', linkResponse.status);
                                
                                // Redirect về trang thank you với thông tin hóa đơn
                                const maHoaDon = invoiceResult.data?.maHoaDon || invoiceResult.maHoaDon;
                                const thankYouUrl = `/shop/thank-you?invoiceCode=${maHoaDon}&email=${orderData.email || customerInfo.email}`;
                                console.log('🔄 Redirecting to:', thankYouUrl);
                                window.location.href = thankYouUrl;
                            } else {
                                console.error('❌ Invoice result missing idHoaDon:', invoiceResult);
                                showNotification('❌ Lỗi tạo hóa đơn: Thiếu thông tin hóa đơn.', 'error');
                            }
                        } else {
                            const errorText = await invoiceResponse.text();
                            console.error('❌ Invoice creation failed:', errorText);
                            showNotification('❌ Lỗi tạo hóa đơn sau thanh toán MoMo.', 'error');
                        }
                        
                        // Xóa orderId khỏi localStorage
                        localStorage.removeItem('pendingMomoOrderId');
                        localStorage.removeItem('checkoutData');
                    }
                } catch (error) {
                    console.error('Error checking pending MoMo order:', error);
                }
            }
        };
        
        // Chạy sau 2 giây để đảm bảo component đã load xong
        const timer = setTimeout(checkPendingMomoOrder, 2000);
        
        return () => clearTimeout(timer);
    }, []);



    // --- Trả về tất cả các biến/hàm cần thiết cho phần render ---
    return {
        userRole, addressData, products, setProducts, loading, router, brands, colors, sizes, categories,
        selectedColors, setSelectedColors, selectedSizes, setSelectedSizes, selectedBrands, setSelectedBrands,
        search, setSearch, showWelcome, setShowWelcome, showWelcomeModal, setShowWelcomeModal, selectedProduct, setSelectedProduct, modalOpen, setModalOpen,
        modalColor, setModalColor, modalSize, setModalSize, modalQuantity, setModalQuantity, cart, setCart, showCart, setShowCart,
        selectedCartIndexes, setSelectedCartIndexes, showCheckout, setShowCheckout, checkoutItems, setCheckoutItems,
        showQRSelector, setShowQRSelector, selectedQR, setSelectedQR, showThankYou, setShowThankYou, lastInvoiceCode, setLastInvoiceCode, lastInvoice, setLastInvoice,
        customerInfo, setCustomerInfo, userAddresses, setUserAddresses, showAddressSelect, setShowAddressSelect, addressError, setAddressError,
        customerFormError, setCustomerFormError, showNewAddressForm, setShowNewAddressForm,
        newAddress, setNewAddress, userName, isClient,
        selectedVoucher, handleVoucherChange,
        filteredProducts, modalColors, modalSizes,
        handleColorChange, handleAddToCart, updateProductQuantity, handleSaveAddress, handleAutoFillCustomerInfo,
        notification, showNotification
    };
} 