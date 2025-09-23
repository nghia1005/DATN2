"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import { parseISO, isValid, format } from 'date-fns';
import addressDataRaw from './vn-address.json';
const addressData = addressDataRaw.results;
import AdminLayout from "@/component/Admin-Layout";


// Đăng ký ngôn ngữ tiếng Việt cho DatePicker
registerLocale('vi', vi);
import { FaSearch, FaSyncAlt, FaEye, FaEdit, FaPowerOff, FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";

export default function KhachHangPage() {
    const [activeMenu, setActiveMenu] = useState("customers");
    // State quản lý khách hàng
    const [khachHangs, setKhachHangs] = useState<any[]>([]);
    const [loadingKH, setLoadingKH] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentKhachHang, setCurrentKhachHang] = useState<any>({
        maKhachHang: "",
        tenKhachHang: "",
        ngaySinh: "",
        gioiTinh: true,
        soDienThoai: "",
        email: "",
        trangThai: "Hoạt động"
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [validationErrors, setValidationErrors] = useState<any>({
        maKhachHang: "",
        tenKhachHang: "",
        ngaySinh: "",
        soDienThoai: "",
        email: "",
        thanhPho: "",
        quanHuyen: "",
        xaPhuong: "",
        ngoNgach: ""
    });
    // State quản lý địa chỉ
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<any>({
        thanhPho: "",
        quanHuyen: "",
        xaPhuong: "",
        ngoNgach: "",
        ghiChu: "",
        macDinh: "Không"
    });
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [showAddressListModal, setShowAddressListModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);
    const [filteredWards, setFilteredWards] = useState<string[]>([]);
    const [toast, setToast] = useState<{type: 'success'|'error', message: string}|null>(null);
    // Xác nhận đổi trạng thái
    const [showConfirmToggle, setShowConfirmToggle] = useState(false);
    const [confirmToggleId, setConfirmToggleId] = useState<number | null>(null);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filteredKhachHangs, setFilteredKhachHangs] = useState<any[]>([]);
    // Bộ lọc giống giao diện nhân viên
    const [filterTrangThai, setFilterTrangThai] = useState<string>("");
    const [filterGioiTinh, setFilterGioiTinh] = useState<string>("");

    // useEffect để load danh sách khách hàng khi mount
    useEffect(() => {
        fetchKhachHangs();
    }, []);

    // Cập nhật danh sách đã lọc theo bộ lọc (trạng thái, giới tính)
    useEffect(() => {
        let result = [...khachHangs];
        if (filterTrangThai) {
            result = result.filter((kh: any) => (kh.trangThai || "").toLowerCase() === filterTrangThai.toLowerCase());
        }
        if (filterGioiTinh !== "") {
            // filterGioiTinh là chuỗi "true" | "false"
            result = result.filter((kh: any) => String(kh.gioiTinh) === filterGioiTinh);
        }
        setFilteredKhachHangs(result);
        setCurrentPage(1);
    }, [khachHangs, filterTrangThai, filterGioiTinh]);

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentKhachHangs = filteredKhachHangs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredKhachHangs.length / itemsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Hàm chuyển đến trang đầu
    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    // Hàm chuyển đến trang cuối
    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    // Hàm chuyển đến trang trước
    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Hàm chuyển đến trang sau
    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const fetchKhachHangs = () => {
        setLoadingKH(true);
        fetch("http://localhost:8080/khach-hang/hien-thi")
            .then(res => res.json())
            .then(data => {
                setKhachHangs(data || []);
                setLoadingKH(false);
            })
            .catch(error => {
                console.error("Error fetching customers:", error);
                setLoadingKH(false);
            });
    };

    // Chuyển đổi trạng thái hoạt động của khách hàng
    const toggleTrangThai = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8080/khach-hang/chuyen-trang-thai/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const updatedKhachHang = await response.json();
                setKhachHangs(prev => prev.map(kh =>
                    kh.idKhachHang === id ? updatedKhachHang : kh
                ));
                setFilteredKhachHangs(prev => prev.map(kh =>
                    kh.idKhachHang === id ? updatedKhachHang : kh
                ));
                showToast('success', 'Đã đổi trạng thái khách hàng');
            } else {
                showToast('error', 'Lỗi khi đổi trạng thái');
            }
        } catch (error) {
            console.error('Lỗi khi chuyển đổi trạng thái:', error);
            showToast('error', 'Không thể kết nối server');
        }
    };

    const requestToggleTrangThai = (id: number) => {
        setConfirmToggleId(id);
        setShowConfirmToggle(true);
    };

    // Mở modal thêm/sửa khách hàng
    const openModal = (khachHang?: any) => {
        if (khachHang) {
            setCurrentKhachHang({
                ...khachHang,
                ngaySinh: khachHang.ngaySinh || "",
                trangThai: khachHang.trangThai || "Hoạt động"
            });
            setIsEditing(true);
        } else {
            setCurrentKhachHang({
                maKhachHang: "",
                tenKhachHang: "",
                ngaySinh: "",
                gioiTinh: true,
                soDienThoai: "",
                email: "",
                trangThai: "Hoạt động"
            });
            setIsEditing(false); // Đảm bảo luôn set false khi thêm mới
            setCurrentAddress({
                thanhPho: "",
                quanHuyen: "",
                xaPhuong: "",
                ngoNgach: "",
                ghiChu: "",
                macDinh: "Không"
            });
        }
        setValidationErrors({
            maKhachHang: "",
            tenKhachHang: "",
            soDienThoai: "",
            email: "",
            thanhPho: "",
            quanHuyen: "",
            xaPhuong: "",
            ngoNgach: ""
        });
        setShowModal(true);
    };

    // Đóng modal thêm/sửa khách hàng
    const closeModal = () => {
        setShowModal(false);
        setCurrentKhachHang({
            maKhachHang: "",
            tenKhachHang: "",
            ngaySinh: "",
            gioiTinh: true,
            soDienThoai: "",
            email: "",
            trangThai: "Hoạt động"
        });
        setValidationErrors({
            maKhachHang: "",
            tenKhachHang: "",
            soDienThoai: "",
            email: "",
            thanhPho: "",
            quanHuyen: "",
            xaPhuong: "",
            ngoNgach: ""
        });
    };

    // Xử lý thay đổi input trong form khách hàng
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentKhachHang((prev: any) => ({
            ...prev,
            [name]: name === "gioiTinh" ? value === "true" : value
        }));
        if (name === "email") {
            // Validate realtime cho email
            let error = "";
            if (!value.trim()) {
                error = "Email không được để trống";
            } else if (value.startsWith(' ')) {
                error = "Email không được bắt đầu bằng dấu cách";
            } else if (value.endsWith(' ')) {
                error = "Email không được kết thúc bằng dấu cách";
            } else if (value.includes(' ')) {
                error = "Email không được có dấu cách ở giữa";
            } else if (value.includes('  ')) {
                error = "Email không được có nhiều dấu cách liên tiếp";
            }
            setValidationErrors((prev: any) => ({
                ...prev,
                email: error
            }));
        } else {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Kiểm tra hợp lệ từng trường
    const validateField = (fieldName: string, value: string) => {
        let error = "";
        switch (fieldName) {
            case 'maKhachHang':
                if (!value.trim()) {
                    error = "Mã khách hàng không được để trống";
                } else if (value.startsWith(' ')) {
                    error = "Mã khách hàng không được bắt đầu bằng dấu cách";
                } else if (value.includes(' ')) {
                    error = "Mã khách hàng không được có dấu cách ở giữa";
                } else if (!/^KH[A-Z0-9]+$/.test(value.toUpperCase())) {
                    error = "Mã khách hàng chỉ được chứa chữ hoa và số, bắt đầu bằng KH";
                } else if (!isEditing) {
                    const existingCustomer = khachHangs.find(kh =>
                        kh.maKhachHang.toUpperCase() === value.toUpperCase()
                    );
                    if (existingCustomer) {
                        error = "Mã khách hàng đã tồn tại";
                    }
                }
                break;
            case 'tenKhachHang':
                if (!value.trim()) {
                    error = "Tên khách hàng không được để trống";
                } else if (value.startsWith(' ')) {
                    error = "Tên khách hàng không được bắt đầu bằng dấu cách";
                } else if (value.includes('  ')) {
                    error = "Tên khách hàng không được có nhiều dấu cách liên tiếp";
                } else if (/[^a-zA-ZÀ-ỹà-ỹ\s]/.test(value)) {
                    error = "Tên khách hàng không được chứa số hoặc ký tự đặc biệt";
                } else if (value.trim().length < 2) {
                    error = "Tên khách hàng phải có ít nhất 2 ký tự";
                }
                break;
            case 'soDienThoai':
                if (!value.trim()) {
                    error = "Số điện thoại không được để trống";
                } else if (value.startsWith(' ')) {
                    error = "Số điện thoại không được bắt đầu bằng dấu cách";
                } else if (value.includes(' ')) {
                    error = "Số điện thoại không được có dấu cách ở giữa";
                } else if (/[^0-9]/.test(value)) {
                    error = "Số điện thoại chỉ được chứa số";
                } else if (value.length !== 10) {
                    error = "Số điện thoại phải có đúng 10 chữ số";
                } else if (!isEditing) {
                    const existingCustomer = khachHangs.find(kh =>
                        kh.soDienThoai === value
                    );
                    if (existingCustomer) {
                        error = "Số điện thoại đã tồn tại";
                    }
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = "Email không được để trống";
                } else if (value.startsWith(' ')) {
                    error = "Email không được bắt đầu bằng dấu cách";
                } else if (value.endsWith(' ')) {
                    error = "Email không được kết thúc bằng dấu cách";
                } else if (value.includes(' ')) {
                    error = "Email không được có dấu cách ở giữa";
                } else if (value.includes('  ')) {
                    error = "Email không được có nhiều dấu cách liên tiếp";
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        error = "Email không hợp lệ. Ví dụ: example@gmail.com";
                    } else {
                        // Check trùng email (trừ trường hợp đang sửa chính khách hàng đó)
                        const existed = khachHangs.find(kh => kh.email.toLowerCase() === value.toLowerCase() && (!isEditing || kh.idKhachHang !== currentKhachHang.idKhachHang));
                        if (existed) {
                            error = "Email đã tồn tại trong hệ thống";
                        }
                    }
                }
                break;
        }
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: error
        }));
    };

    // Xử lý mở modal xác nhận
    const handleOpenConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    // Xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        handleOpenConfirm(e);
    };

    // Xử lý xác nhận thêm/sửa khách hàng
    const handleConfirmSubmit = async () => {
        setShowConfirmDialog(false);
        let errors: any = {};

        // Validate date of birth
        if (!currentKhachHang.ngaySinh) {
            errors.ngaySinh = 'Vui lòng chọn ngày sinh';
        } else {
            const birthDate = new Date(currentKhachHang.ngaySinh);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                errors.ngaySinh = 'Khách hàng phải từ đủ 18 tuổi trở lên';
            }
        }

        // 1. Kiểm tra mã khách hàng
        if (!currentKhachHang.maKhachHang.trim()) {
            errors.maKhachHang = 'Vui lòng nhập mã khách hàng';
        } else if (currentKhachHang.maKhachHang.startsWith(' ')) {
            errors.maKhachHang = 'Mã khách hàng không được bắt đầu bằng dấu cách';
        } else if (currentKhachHang.maKhachHang.includes(' ')) {
            errors.maKhachHang = 'Mã khách hàng không được có dấu cách ở giữa';
        } else if (!/^KH[A-Z0-9]+$/.test(currentKhachHang.maKhachHang.toUpperCase())) {
            errors.maKhachHang = 'Mã khách hàng chỉ được chứa chữ hoa và số, bắt đầu bằng KH';
        } else if (!isEditing) {
            const existingCustomer = khachHangs.find(kh =>
                kh.maKhachHang.toUpperCase() === currentKhachHang.maKhachHang.toUpperCase()
            );
            if (existingCustomer) {
                errors.maKhachHang = 'Mã khách hàng đã tồn tại trong hệ thống';
            }
        }

        // 2. Kiểm tra ngày sinh
        if (!errors.ngaySinh && !currentKhachHang.ngaySinh) {
            errors.ngaySinh = 'Vui lòng chọn ngày sinh';
        }

        // 3. Kiểm tra tên khách hàng
        if (!currentKhachHang.tenKhachHang.trim()) {
            errors.tenKhachHang = 'Vui lòng nhập tên khách hàng';
        } else if (currentKhachHang.tenKhachHang.startsWith(' ')) {
            errors.tenKhachHang = 'Tên khách hàng không được bắt đầu bằng dấu cách';
        } else if (currentKhachHang.tenKhachHang.includes('  ')) {
            errors.tenKhachHang = 'Tên khách hàng không được có nhiều dấu cách liên tiếp';
        } else if (/[^a-zA-ZÀ-ỹà-ỹ\s]/.test(currentKhachHang.tenKhachHang)) {
            errors.tenKhachHang = 'Tên khách hàng không được chứa số hoặc ký tự đặc biệt';
        } else if (currentKhachHang.tenKhachHang.trim().length < 2) {
            errors.tenKhachHang = 'Tên khách hàng phải có ít nhất 2 ký tự';
        }

        // 3. Kiểm tra số điện thoại
        if (!currentKhachHang.soDienThoai.trim()) {
            errors.soDienThoai = 'Vui lòng nhập số điện thoại';
        } else if (currentKhachHang.soDienThoai.startsWith(' ')) {
            errors.soDienThoai = 'Số điện thoại không được bắt đầu bằng dấu cách';
        } else if (currentKhachHang.soDienThoai.includes(' ')) {
            errors.soDienThoai = 'Số điện thoại không được có dấu cách ở giữa';
        } else if (/[^0-9]/.test(currentKhachHang.soDienThoai)) {
            errors.soDienThoai = 'Số điện thoại chỉ được chứa số';
        } else if (currentKhachHang.soDienThoai.length !== 10) {
            errors.soDienThoai = 'Số điện thoại phải có đúng 10 chữ số';
        } else if (!isEditing) {
            const existingCustomer = khachHangs.find(kh =>
                kh.soDienThoai === currentKhachHang.soDienThoai
            );
            if (existingCustomer) {
                errors.soDienThoai = 'Số điện thoại đã tồn tại trong hệ thống';
            }
        }

        // 4. Kiểm tra email
        if (!currentKhachHang.email.trim()) {
            errors.email = "Vui lòng nhập email";
        } else if (currentKhachHang.email.startsWith(" ")) {
            errors.email = "Email không được bắt đầu bằng dấu cách";
        } else if (currentKhachHang.email.endsWith(" ")) {
            errors.email = "Email không được kết thúc bằng dấu cách";
        } else if (!/^\S+@\S+\.\S+$/.test(currentKhachHang.email)) {
            errors.email = "Email không đúng định dạng";
        }

        // 5. Kiểm tra địa chỉ khi thêm mới
        if (!isEditing) {
            if (!currentAddress.thanhPho.trim()) {
                errors.thanhPho = 'Vui lòng chọn thành phố';
            }
            if (!currentAddress.quanHuyen.trim()) {
                errors.quanHuyen = 'Vui lòng chọn quận/huyện';
            }
            if (!currentAddress.xaPhuong.trim()) {
                errors.xaPhuong = 'Vui lòng chọn xã/phường';
            }
            if (!currentAddress.ngoNgach.trim()) {
                errors.ngoNgach = 'Vui lòng nhập ngõ/ngách';
            }
        }

        // Cập nhật validation errors
        setValidationErrors(errors);

        // Nếu có lỗi ở bất kỳ trường nào, không submit
        if (Object.values(errors).some(Boolean)) {
            return;
        }
        setLoadingSubmit(true);
        try {
            const url = isEditing
                ? `http://localhost:8080/khach-hang/sua/${currentKhachHang.idKhachHang}`
                : `http://localhost:8080/khach-hang/them`;
            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentKhachHang)
            });
            if (response.ok) {
                const responseData = await response.json();
                let savedKhachHang;
                if (responseData.data) {
                    savedKhachHang = responseData.data;
                } else {
                    savedKhachHang = responseData;
                }
                if (isEditing) {
                    setKhachHangs((prev: any[]) => prev.map(kh =>
                        kh.idKhachHang === currentKhachHang.idKhachHang ? savedKhachHang : kh
                    ));
                    // Cập nhật filteredKhachHangs nếu đang có tìm kiếm
                    setFilteredKhachHangs((prev: any[]) => prev.map(kh =>
                        kh.idKhachHang === currentKhachHang.idKhachHang ? savedKhachHang : kh
                    ));
                } else {
                    setKhachHangs((prev: any[]) => [savedKhachHang, ...prev]);
                    // Cập nhật filteredKhachHangs nếu đang có tìm kiếm
                    setFilteredKhachHangs((prev: any[]) => [savedKhachHang, ...prev]);
                    // Sau khi thêm khách hàng mới, nếu có địa chỉ thì thêm địa chỉ luôn
                    if (currentAddress.thanhPho) {
                        await fetch(`http://localhost:8080/khach-hang/${savedKhachHang.idKhachHang}/dia-chi`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(currentAddress)
                        });
                        await reloadSelectedCustomerAddresses(savedKhachHang.idKhachHang);
                    }
                }
                closeModal();
                showToast('success', isEditing ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!');
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Có lỗi xảy ra';
                showToast('error', `Lỗi: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Lỗi khi lưu khách hàng:', error);
            showToast('error', 'Có lỗi xảy ra khi lưu khách hàng. Vui lòng kiểm tra kết nối mạng.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Hàm xử lý địa chỉ
    const openAddAddressModal = (customerId: number) => {
        setSelectedCustomerId(customerId);
        setIsEditingAddress(false);
        setCurrentAddress({
            thanhPho: "",
            quanHuyen: "",
            xaPhuong: "",
            ngoNgach: "",
            ghiChu: "",
            macDinh: "Không"
        });
        // Reset filtered data
        setFilteredDistricts([]);
        setFilteredWards([]);
        setShowAddressModal(true);
    };

    const openEditAddressModal = (address: any, customerId: number) => {
        setSelectedCustomerId(customerId);
        setIsEditingAddress(true);
        setCurrentAddress({
            idDiaChi: address.idDiaChi,
            thanhPho: address.thanhPho,
            quanHuyen: address.quanHuyen,
            xaPhuong: address.xaPhuong,
            ngoNgach: address.ngoNgach,
            ghiChu: address.ghiChu,
            macDinh: address.macDinh
        });
        setShowAddressModal(true);
    };

    const closeAddressModal = () => {
        setShowAddressModal(false);
        if (selectedCustomer) {
            setTimeout(() => setShowAddressListModal(true), 0);
        }
        setSelectedCustomerId(null);
        setCurrentAddress({
            thanhPho: "",
            quanHuyen: "",
            xaPhuong: "",
            ngoNgach: "",
            ghiChu: "",
            macDinh: "Không"
        });
        // Reset validation errors
        setValidationErrors({
            maKhachHang: "",
            tenKhachHang: "",
            soDienThoai: "",
            email: "",
            thanhPho: "",
            quanHuyen: "",
            xaPhuong: "",
            ngoNgach: ""
        });
    };

    // Sửa handleAddressInputChange để clear lỗi khi nhập lại
    const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentAddress((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    // Sửa handleAddressSubmit để validate từng trường và set lỗi UI
    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId) return;
        const newErrors: any = {};

        // Validate các trường bắt buộc
        if (!currentAddress.thanhPho.trim()) {
            newErrors.thanhPho = 'Vui lòng chọn thành phố';
        }
        if (!currentAddress.quanHuyen.trim()) {
            newErrors.quanHuyen = 'Vui lòng chọn quận/huyện';
        }
        if (!currentAddress.xaPhuong.trim()) {
            newErrors.xaPhuong = 'Vui lòng chọn xã/phường';
        }
        if (!currentAddress.ngoNgach.trim()) {
            newErrors.ngoNgach = 'Vui lòng nhập ngõ/ngách';
        }

        // Tự động đặt địa chỉ mới thành "Không mặc định"
        const addressDataToSubmit = {
            ...currentAddress,
            macDinh: "Không"
        };

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }
        setLoadingAddress(true);
        try {
            const url = isEditingAddress
                ? `http://localhost:8080/khach-hang/dia-chi/${currentAddress.idDiaChi}`
                : `http://localhost:8080/khach-hang/${selectedCustomerId}/dia-chi`;
            const method = isEditingAddress ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressDataToSubmit)
            });
            if (response.ok) {
                // Refresh danh sách khách hàng để cập nhật địa chỉ
                const updatedResponse = await fetch("http://localhost:8080/khach-hang/hien-thi");
                if (updatedResponse.ok) {
                    const updatedData = await updatedResponse.json();
                    setKhachHangs(updatedData || []);
                }
                closeAddressModal();
                alert(isEditingAddress ? '✅ Cập nhật địa chỉ mặc định thành công!' : '✅ Thêm địa chỉ thành công!');

                // Tự động load lại dữ liệu địa chỉ của khách hàng hiện tại
                if (selectedCustomer) {
                    await reloadSelectedCustomerAddresses(selectedCustomer.idKhachHang);
                    // Mở lại modal danh sách địa chỉ với dữ liệu mới
                    setTimeout(() => {
                        setShowAddressListModal(true);
                    }, 100);
                }
            } else {
                const errorData = await response.json();
                alert(`❌ Lỗi: ${errorData.message || 'Có lỗi xảy ra'}`);
            }
        } catch (error) {
            console.error('Lỗi khi lưu địa chỉ:', error);
            alert('❌ Có lỗi xảy ra khi lưu địa chỉ. Vui lòng kiểm tra kết nối mạng.');
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleDeleteAddress = async (addressId: number, customerId: number) => {
        const note = prompt('Bạn có chắc chắn muốn xóa địa chỉ này?\n\nGhi chú (không bắt buộc):');
        if (note === null) {
            return;
        }
        try {
            // Kiểm tra xem có phải địa chỉ mặc định duy nhất không
            const customer = khachHangs.find(kh => kh.idKhachHang === customerId);
            if (customer && customer.danhSachDiaChi) {
                const defaultAddresses = customer.danhSachDiaChi.filter((addr: any) => addr.macDinh === "Có");
                const isCurrentAddressDefault = defaultAddresses.some((addr: any) => addr.idDiaChi === addressId);
                if (defaultAddresses.length === 1 && isCurrentAddressDefault) {
                    alert('❌ Không thể xóa địa chỉ mặc định duy nhất. Mỗi khách hàng phải có ít nhất 1 địa chỉ mặc định.');
                    return;
                }
            }
            const response = await fetch(`http://localhost:8080/khach-hang/dia-chi/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                // Refresh danh sách khách hàng
                const updatedResponse = await fetch("http://localhost:8080/khach-hang/hien-thi");
                if (updatedResponse.ok) {
                    const updatedData = await updatedResponse.json();
                    setKhachHangs(updatedData || []);
                }
                alert('✅ Xóa địa chỉ thành công!');

                // Tự động load lại dữ liệu địa chỉ của khách hàng hiện tại
                if (selectedCustomer) {
                    await reloadSelectedCustomerAddresses(selectedCustomer.idKhachHang);
                }
            } else {
                alert('❌ Lỗi khi xóa địa chỉ');
            }
        } catch (error) {
            console.error('Lỗi khi xóa địa chỉ:', error);
            alert('❌ Có lỗi xảy ra khi xóa địa chỉ');
        }
    };

    // Hàm xử lý danh sách địa chỉ
    const openAddressListModal = async (customer: any) => {
        const response = await fetch(`http://localhost:8080/khach-hang/chi-tiet/${customer.idKhachHang}`);
        if (response.ok) {
            const updatedCustomer = await response.json();
            setSelectedCustomer(updatedCustomer);
            setShowAddressListModal(true);
        }
    };

    const closeAddressListModal = () => {
        setShowAddressListModal(false);
        setSelectedCustomer(null);
    };

    const setDefaultAddress = async (addressId: number, customerId: number) => {
        try {
            // Kiểm tra xem địa chỉ này đã là mặc định chưa
            const selectedAddress = selectedCustomer?.danhSachDiaChi?.find((addr: any) => addr.idDiaChi === addressId);
            if (selectedAddress && selectedAddress.macDinh === "Có") {
                alert('ℹ️ Địa chỉ này đã là địa chỉ mặc định.');
                return;
            }
            // Đầu tiên, set tất cả địa chỉ của khách hàng này thành "Không mặc định"
            const customer = khachHangs.find(kh => kh.idKhachHang === customerId);
            if (customer && customer.danhSachDiaChi) {
                for (const address of customer.danhSachDiaChi) {
                    if (address.idDiaChi !== addressId) {
                        const updateData = {
                            ...address,
                            macDinh: "Không"
                        };
                        await fetch(`http://localhost:8080/khach-hang/dia-chi/${address.idDiaChi}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updateData)
                        });
                    }
                }
            }
            // Sau đó, set địa chỉ được chọn thành "Mặc định"
            if (selectedAddress) {
                const updateData = {
                    ...selectedAddress,
                    macDinh: "Có"
                };
                const response = await fetch(`http://localhost:8080/khach-hang/dia-chi/${addressId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });
                if (response.ok) {
                    // Refresh danh sách khách hàng
                    const updatedResponse = await fetch("http://localhost:8080/khach-hang/hien-thi");
                    if (updatedResponse.ok) {
                        const updatedData = await updatedResponse.json();
                        setKhachHangs(updatedData || []);
                        // Cập nhật selectedCustomer
                        const updatedCustomer = updatedData.find((kh: any) => kh.idKhachHang === customerId);
                        setSelectedCustomer(updatedCustomer);
                    }
                    alert('✅ Đặt địa chỉ mặc định thành công!');
                } else {
                    alert('❌ Lỗi khi đặt địa chỉ mặc định');
                }
            }
        } catch (error) {
            console.error('Lỗi khi đặt địa chỉ mặc định:', error);
            alert('❌ Có lỗi xảy ra khi đặt địa chỉ mặc định');
        }
    };

    // Tìm kiếm khách hàng
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setLoadingKH(true);
            fetch("http://localhost:8080/khach-hang/hien-thi")
                .then(res => res.json())
                .then(data => {
                    setKhachHangs(data || []);
                    setCurrentPage(1); // Reset về trang đầu
                    setLoadingKH(false);
                })
                .catch(error => {
                    console.error("Error fetching customers:", error);
                    setLoadingKH(false);
                });
            return;
        }
        setLoadingKH(true);
        try {
            const searchTermEncoded = encodeURIComponent(searchTerm);
            // Tìm theo tên
            let response = await fetch(`http://localhost:8080/khach-hang/tim-kiem/ten/${searchTermEncoded}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setKhachHangs(data);
                    setCurrentPage(1); // Reset về trang đầu sau khi tìm kiếm
                    setLoadingKH(false);
                    return;
                }
            }
            // Tìm theo số điện thoại
            response = await fetch(`http://localhost:8080/khach-hang/tim-kiem/sdt/${searchTermEncoded}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setKhachHangs(data);
                    setCurrentPage(1); // Reset về trang đầu sau khi tìm kiếm
                    setLoadingKH(false);
                    return;
                }
            }
            // Tìm theo mã khách hàng
            response = await fetch(`http://localhost:8080/khach-hang/tim-kiem/ma/${searchTermEncoded}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setKhachHangs([data]);
                    setCurrentPage(1); // Reset về trang đầu sau khi tìm kiếm
                    setLoadingKH(false);
                    return;
                }
            }
            // Tìm theo email
            response = await fetch(`http://localhost:8080/khach-hang/tim-kiem/email/${searchTermEncoded}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setKhachHangs([data]);
                    setCurrentPage(1); // Reset về trang đầu sau khi tìm kiếm
                    setLoadingKH(false);
                    return;
                }
            }
            setKhachHangs([]);
        } catch (error) {
            console.error("Error searching customers:", error);
            setKhachHangs([]);
        } finally {
            setLoadingKH(false);
        }
    };

    // Làm mới tìm kiếm, load lại toàn bộ khách hàng
    const handleResetSearch = () => {
        setSearchTerm("");
        setCurrentPage(1); // Reset về trang đầu
        setLoadingKH(true);
        fetch("http://localhost:8080/khach-hang/hien-thi")
            .then(res => res.json())
            .then(data => {
                setKhachHangs(data || []);
                setLoadingKH(false);
            })
            .catch(error => {
                console.error("Error fetching customers:", error);
                setLoadingKH(false);
            });
    };

    // Thêm hàm reloadSelectedCustomerAddresses
    const reloadSelectedCustomerAddresses = async (customerId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/khach-hang/chi-tiet/${customerId}`);
            if (response.ok) {
                const updatedCustomer = await response.json();
                setSelectedCustomer(updatedCustomer);
                // Đồng bộ lại danh sách khách hàng tổng nếu cần
                setKhachHangs((prev: any[]) => prev.map(kh => kh.idKhachHang === customerId ? updatedCustomer : kh));
                // Cập nhật filteredKhachHangs nếu đang có tìm kiếm
                setFilteredKhachHangs((prev: any[]) => prev.map(kh => kh.idKhachHang === customerId ? updatedCustomer : kh));
            }
        } catch (e) {
            console.error('Lỗi khi reload địa chỉ khách hàng:', e);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        setCurrentAddress((prev: any) => ({
            ...prev,
            thanhPho: provinceName,
            quanHuyen: "",
            xaPhuong: ""
        }));
        const found = addressData.find(p => p.province_name === provinceName);
        setFilteredDistricts(found ? found.districts.map(d => d.district_name) : []);
        setFilteredWards([]);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtName = e.target.value;
        setCurrentAddress((prev: any) => ({
            ...prev,
            quanHuyen: districtName,
            xaPhuong: ""
        }));
        const foundProvince = addressData.find(p => p.province_name === currentAddress.thanhPho);
        const foundDistrict = foundProvince?.districts.find(d => d.district_name === districtName);
        setFilteredWards(foundDistrict ? foundDistrict.wards.map(w => w.ward_name) : []);
    };

    // Thêm hàm showToast
    const showToast = (type: 'success'|'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // --- UI: render bảng, form, modal, ... ---
    return (
        <AdminLayout activeMenu={activeMenu} onMenuChangeAction={setActiveMenu} pageTitle="Quản lý khách hàng">
            <div style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e5e7eb",
                minHeight: "calc(100vh - 120px)"
            }}>
                {/* Header với tìm kiếm, filter, nút thêm - style đồng bộ với layout tổng */}
                <div style={{
                    background: "#fff",
                    padding: "24px 32px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #e5e7eb"
                }}>
                    <h2 style={{
                        color: "#111827",
                        fontWeight: 700,
                        marginBottom: 24,
                        fontSize: "1.75rem",
                        textShadow: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <span style={{ fontSize: "2rem" }}>👥</span>
                        Danh sách khách hàng
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                        {/* Tìm kiếm + Filter + Làm mới bên trái */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khách hàng..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: "12px 16px 12px 44px",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        minWidth: 280,
                                        fontSize: 15,
                                        background: '#fff',
                                        color: '#111827',
                                        fontWeight: 500,
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                    onFocus={(e) => {
                                        e.target.style.border = "1px solid #2563eb";
                                        e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.2)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = "1px solid #d1d5db";
                                        e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)";
                                    }}
                                />
                                <FaSearch style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: 18,
                                    color: "#b59d3a"
                                }} />
                            </div>
                            <button
                                style={{
                                    background: "#6366f1",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "12px 20px",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)"
                                }}
                                onClick={handleSearch}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <FaSearch style={{ fontSize: 16 }} />
                                Tìm kiếm
                            </button>
                            {/* Bộ lọc Trạng thái */}
                            <select
                                value={filterTrangThai}
                                onChange={e => setFilterTrangThai(e.target.value)}
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    border: "1px solid #d1d5db",
                                    background: "#fff",
                                    color: "#111827",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 200,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                                    transition: "all 0.2s ease"
                                }}
                                onFocus={(e) => {
                                    (e.target as HTMLSelectElement).style.border = "1px solid #2563eb";
                                }}
                                onBlur={(e) => {
                                    (e.target as HTMLSelectElement).style.border = "1px solid #d1d5db";
                                }}
                            >
                                <option value="">📊 Tất cả trạng thái</option>
                                <option value="Hoạt động">✅ Hoạt động</option>
                                <option value="Ngừng hoạt động">❌ Ngừng hoạt động</option>
                            </select>
                            {/* Bộ lọc Giới tính */}
                            <select
                                value={filterGioiTinh}
                                onChange={e => setFilterGioiTinh(e.target.value)}
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    border: "1px solid #d1d5db",
                                    background: "#fff",
                                    color: "#111827",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 180,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                                    transition: "all 0.2s ease"
                                }}
                                onFocus={(e) => {
                                    (e.target as HTMLSelectElement).style.border = "1px solid #2563eb";
                                }}
                                onBlur={(e) => {
                                    (e.target as HTMLSelectElement).style.border = "1px solid #d1d5db";
                                }}
                            >
                                <option value="">👥 Tất cả giới tính</option>
                                <option value="true">👨 Nam</option>
                                <option value="false">👩 Nữ</option>
                            </select>
                            <button
                                style={{
                                    background: "#e5e7eb",
                                    color: "#111827",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    padding: "12px 20px",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                                }}
                                onClick={handleResetSearch}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.1)";
                                }}
                            >
                                <FaSyncAlt style={{ fontSize: 16 }} />
                                Làm mới
                            </button>
                        </div>
                        {/* Nút thêm khách hàng bên phải */}
                        <button
                            onClick={() => openModal()}
                            style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                padding: "14px 28px",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                boxShadow: "0 6px 18px rgba(16, 185, 129, 0.3)",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                            title="Thêm khách hàng mới"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.3)";
                            }}
                        >
                            <span style={{ fontSize: "18px" }}>➕</span>
                            Thêm khách hàng
                        </button>
                    </div>
                </div>
                {loadingKH ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 40px",
                        fontSize: "1.2rem",
                        color: "#6b4f1d",
                        background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(181, 157, 58, 0.08)",
                        border: "1px solid rgba(181, 157, 58, 0.1)"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
                        <div style={{ fontWeight: 600, marginBottom: "8px" }}>Đang tải dữ liệu...</div>
                        <div style={{ color: "#8a7a2a", fontSize: "1rem" }}>Vui lòng chờ trong giây lát</div>
                    </div>
                ) : (
                    <div>
                        {/* Bảng khách hàng */}
                        <div style={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            marginBottom: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 16px rgba(181, 157, 58, 0.1)',
                            border: "1px solid rgba(181, 157, 58, 0.1)",
                            background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)"
                        }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                background: "transparent",
                                borderRadius: "12px",
                                overflow: "hidden"
                            }}>
                                <thead>
                                <tr style={{
                                    background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                    color: "#fff"
                                }}>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>STT</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Mã KH</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Tên khách hàng</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Ngày sinh</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Giới tính</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Số điện thoại</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Email</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Trạng thái</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Địa chỉ</th>
                                    <th style={{
                                        padding: "10px 8px",
                                        fontWeight: 700,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        borderBottom: "none",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                    }}>Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentKhachHangs.map((kh, idx) => (
                                    <tr key={kh.idKhachHang} style={{
                                        background: idx % 2 === 0 ? "linear-gradient(135deg, #fff 0%, #fffbe6 100%)" : "linear-gradient(135deg, #f9e7b4 0%, #fff 100%)",
                                        borderBottom: "1px solid rgba(181, 157, 58, 0.1)",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #fffbe6 0%, #f9e7b4 100%)";
                                            e.currentTarget.style.transform = "scale(1.01)";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = idx % 2 === 0 ? "linear-gradient(135deg, #fff 0%, #fffbe6 100%)" : "linear-gradient(135deg, #f9e7b4 0%, #fff 100%)";
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 600,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{indexOfFirstItem + idx + 1}</td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#b59d3a",
                                            fontWeight: 700,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{kh.maKhachHang}</td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 600,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{kh.tenKhachHang}</td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#8a7a2a",
                                            fontWeight: 500,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : ""}</td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 500,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{kh.gioiTinh === true ? "Nam" : kh.gioiTinh === false ? "Nữ" : "Không xác định"}</td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 500,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{kh.soDienThoai}</td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 500,
                                            fontSize: "0.85rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>{kh.email}</td>
                                        <td style={{
                                            padding: "16px 12px",
                                            color: "#6b4f1d",
                                            fontWeight: 500,
                                            fontSize: "0.95rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>
                                        <span style={{
                                            padding: "6px 10px",
                                            borderRadius: 999,
                                            fontSize: "0.8rem",
                                            fontWeight: 700,
                                            background: kh.trangThai === "Hoạt động" ? "#d1e7dd" : "#f8d7da",
                                            color: kh.trangThai === "Hoạt động" ? "#0f5132" : "#842029",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 8,
                                            minWidth: 0,
                                            border: "1px solid",
                                            borderColor: kh.trangThai === "Hoạt động" ? "#badbcc" : "#f5c2c7",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                                        }}>
                                            <span style={{ width: 8, height: 8, borderRadius: 999, background: kh.trangThai === 'Hoạt động' ? '#198754' : '#dc3545' }} />
                                            {kh.trangThai}
                                        </span>
                                        </td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 500,
                                            fontSize: "0.8rem",
                                            borderRight: "1px solid rgba(181, 157, 58, 0.1)"
                                        }}>
                                            {kh.danhSachDiaChi && kh.danhSachDiaChi.length > 0 ? (
                                                (() => {
                                                    const defaultAddress = kh.danhSachDiaChi.find((diaChi: any) => diaChi.macDinh === "Có");
                                                    if (defaultAddress) {
                                                        return (
                                                            <div style={{
                                                                padding: "6px 8px",
                                                                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                                                borderRadius: "6px",
                                                                border: "1px solid #bbdefb",
                                                                fontSize: "0.75rem",
                                                                boxShadow: "0 1px 4px rgba(33, 150, 243, 0.1)"
                                                            }}>
                                                                <div style={{
                                                                    fontWeight: 600,
                                                                    marginBottom: "2px",
                                                                    color: "#1976d2",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "2px"
                                                                }}>
                                                                    <span style={{ fontSize: "0.8rem" }}>⭐</span>
                                                                    Mặc định
                                                                </div>
                                                                <div style={{
                                                                    marginBottom: "2px",
                                                                    fontWeight: 500,
                                                                    color: "#1565c0",
                                                                    fontSize: "0.7rem"
                                                                }}>
                                                                    {defaultAddress.thanhPho}, {defaultAddress.quanHuyen}
                                                                </div>
                                                                <div style={{
                                                                    color: "#6c757d",
                                                                    fontSize: "0.65rem"
                                                                }}>
                                                                    {defaultAddress.xaPhuong}, {defaultAddress.ngoNgach}
                                                                </div>
                                                                {defaultAddress.ghiChu && (
                                                                    <div style={{
                                                                        color: "#6c757d",
                                                                        fontSize: "0.65rem",
                                                                        fontStyle: "italic",
                                                                        marginTop: "2px",
                                                                        padding: "2px 4px",
                                                                        background: "rgba(255,255,255,0.5)",
                                                                        borderRadius: "3px"
                                                                    }}>
                                                                        📝 {defaultAddress.ghiChu}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div style={{
                                                                padding: "6px 8px",
                                                                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                                                borderRadius: "6px",
                                                                border: "1px solid #dee2e6",
                                                                fontSize: "0.75rem",
                                                                textAlign: "center"
                                                            }}>
                                                                <div style={{
                                                                    color: "#6c757d",
                                                                    fontStyle: "italic",
                                                                    marginBottom: "2px"
                                                                }}>
                                                                    📍 Chưa có mặc định
                                                                </div>
                                                                <div style={{
                                                                    color: "#6c757d",
                                                                    fontSize: "0.65rem",
                                                                    background: "rgba(181, 157, 58, 0.1)",
                                                                    padding: "2px 6px",
                                                                    borderRadius: "8px",
                                                                    display: "inline-block"
                                                                }}>
                                                                    ({kh.danhSachDiaChi.length} địa chỉ)
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })()
                                            ) : (
                                                <span style={{
                                                    color: "#8a7a2a",
                                                    fontStyle: "italic",
                                                    padding: "4px 8px",
                                                    background: "rgba(181, 157, 58, 0.1)",
                                                    borderRadius: "6px",
                                                    display: "inline-block",
                                                    fontSize: "0.75rem"
                                                }}>📍 Chưa có địa chỉ</span>
                                            )}
                                        </td>
                                        <td style={{
                                            padding: "10px 8px",
                                            color: "#6b4f1d",
                                            fontWeight: 500,
                                            fontSize: "0.8rem",
                                            display: "flex",
                                            gap: 6,
                                            justifyContent: "flex-start",
                                            alignItems: "center"
                                        }}>
                                            {/* Địa chỉ */}
                                            <button
                                                onClick={async () => await openAddressListModal(kh)}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    boxShadow: "0 1px 4px rgba(52, 152, 219, 0.3)"
                                                }}
                                                title="Quản lý địa chỉ"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(52, 152, 219, 0.4)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(52, 152, 219, 0.3)";
                                                }}
                                            >
                                                <FaMapMarkerAlt />
                                            </button>
                                            {/* Chỉnh sửa */}
                                            <button
                                                onClick={() => openModal(kh)}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    background: "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    boxShadow: "0 1px 4px rgba(241, 196, 15, 0.3)"
                                                }}
                                                title="Sửa khách hàng"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(241, 196, 15, 0.4)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(241, 196, 15, 0.3)";
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                            {/* Đổi trạng thái */}
                                            <button
                                                onClick={() => requestToggleTrangThai(kh.idKhachHang)}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    background: kh.trangThai === "Hoạt động" ? "linear-gradient(135deg, #2ecc40 0%, #27ae60 100%)" : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    boxShadow: kh.trangThai === "Hoạt động" ? "0 1px 4px rgba(46, 204, 64, 0.3)" : "0 1px 4px rgba(231, 76, 60, 0.3)"
                                                }}
                                                title={`Chuyển trạng thái từ "${kh.trangThai}" sang "${kh.trangThai === 'Hoạt động' ? 'Ngừng hoạt động' : 'Hoạt động'}"`}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                                    e.currentTarget.style.boxShadow = kh.trangThai === "Hoạt động" ? "0 2px 8px rgba(46, 204, 64, 0.4)" : "0 2px 8px rgba(231, 76, 60, 0.4)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                    e.currentTarget.style.boxShadow = kh.trangThai === "Hoạt động" ? "0 1px 4px rgba(46, 204, 64, 0.3)" : "0 1px 4px rgba(231, 76, 60, 0.3)";
                                                }}
                                            >
                                                <FaPowerOff />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Phân trang */}
                        {filteredKhachHangs.length > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '20px 0',
                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                borderRadius: "12px",
                                marginTop: "20px",
                                boxShadow: "0 4px 16px rgba(181, 157, 58, 0.08)",
                                border: "1px solid rgba(181, 157, 58, 0.1)"
                            }}>
                                {/* Điều hướng phân trang */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {/* Nút trang đầu */}
                                    <button
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: "8px 12px",
                                            background: currentPage === 1 ? "rgba(181, 157, 58, 0.1)" : "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: currentPage === 1 ? "#8a7a2a" : "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                            fontWeight: 600,
                                            fontSize: "1.2rem",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: currentPage === 1 ? "none" : "0 2px 8px rgba(181, 157, 58, 0.3)",
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== 1) {
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== 1) {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.3)";
                                            }
                                        }}
                                        title="Trang đầu"
                                    >
                                        ⏮️
                                    </button>

                                    {/* Nút trang trước */}
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: "8px 12px",
                                            background: currentPage === 1 ? "rgba(181, 157, 58, 0.1)" : "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: currentPage === 1 ? "#8a7a2a" : "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                            fontWeight: 600,
                                            fontSize: "1.2rem",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: currentPage === 1 ? "none" : "0 2px 8px rgba(181, 157, 58, 0.3)",
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== 1) {
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== 1) {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.3)";
                                            }
                                        }}
                                        title="Trang trước"
                                    >
                                        ◀️
                                    </button>

                                    {/* Các nút số trang */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => {
                                        // Hiển thị tối đa 5 trang xung quanh trang hiện tại
                                        const startPage = Math.max(1, currentPage - 2);
                                        const endPage = Math.min(totalPages, currentPage + 2);

                                        if (pageNumber >= startPage && pageNumber <= endPage) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    style={{
                                                        padding: "8px 12px",
                                                        background: pageNumber === currentPage ? "linear-gradient(135deg, #8a7a2a 0%, #6b4f1d 100%)" : "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                        color: pageNumber === currentPage ? "#fff" : "#6b4f1d",
                                                        border: pageNumber === currentPage ? "none" : "2px solid rgba(181, 157, 58, 0.3)",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        fontWeight: pageNumber === currentPage ? 700 : 600,
                                                        fontSize: "0.85rem",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: pageNumber === currentPage ? "0 2px 8px rgba(181, 157, 58, 0.4)" : "0 2px 8px rgba(181, 157, 58, 0.1)"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (pageNumber !== currentPage) {
                                                            e.currentTarget.style.transform = "translateY(-1px)";
                                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.2)";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (pageNumber !== currentPage) {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.1)";
                                                        }
                                                    }}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Nút trang sau */}
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: "8px 12px",
                                            background: currentPage === totalPages ? "rgba(181, 157, 58, 0.1)" : "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: currentPage === totalPages ? "#8a7a2a" : "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                            fontWeight: 600,
                                            fontSize: "1.2rem",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: currentPage === totalPages ? "none" : "0 2px 8px rgba(181, 157, 58, 0.3)",
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.3)";
                                            }
                                        }}
                                        title="Trang sau"
                                    >
                                        ▶️
                                    </button>

                                    {/* Nút trang cuối */}
                                    <button
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: "8px 12px",
                                            background: currentPage === totalPages ? "rgba(181, 157, 58, 0.1)" : "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: currentPage === totalPages ? "#8a7a2a" : "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                            fontWeight: 600,
                                            fontSize: "1.2rem",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: currentPage === totalPages ? "none" : "0 2px 8px rgba(181, 157, 58, 0.3)",
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(181, 157, 58, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.3)";
                                            }
                                        }}
                                        title="Trang cuối"
                                    >
                                        ⏭️
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {filteredKhachHangs.length === 0 && (
                            <div style={{
                                textAlign: "center",
                                padding: "80px 40px",
                                color: "#6b4f1d",
                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                borderRadius: "16px",
                                marginTop: "24px",
                                boxShadow: "0 8px 32px rgba(181, 157, 58, 0.1)",
                                border: "1px solid rgba(181, 157, 58, 0.1)"
                            }}>
                                <div style={{
                                    fontSize: "4rem",
                                    marginBottom: "20px",
                                    filter: "drop-shadow(0 4px 8px rgba(181, 157, 58, 0.2))"
                                }}>👥</div>
                                <h3 style={{
                                    margin: "0 0 16px 0",
                                    color: "#6b4f1d",
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    textShadow: "0 2px 4px rgba(181, 157, 58, 0.1)"
                                }}>
                                    {searchTerm ? '🔍 Không tìm thấy khách hàng' : '📋 Chưa có khách hàng nào'}
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: "1.1rem",
                                    color: "#8a7a2a",
                                    lineHeight: "1.6"
                                }}>
                                    {searchTerm ?
                                        `Không có khách hàng nào phù hợp với từ khóa "${searchTerm}"` :
                                        'Dữ liệu khách hàng sẽ hiển thị ở đây khi có thông tin.'
                                    }
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={handleResetSearch}
                                        style={{
                                            marginTop: "24px",
                                            padding: "12px 24px",
                                            background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: "0 4px 16px rgba(181, 157, 58, 0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            margin: "24px auto 0 auto"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.3)";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.2rem" }}>🔄</span>
                                        Xem tất cả khách hàng
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* Modal danh sách địa chỉ */}
                {showAddressListModal && selectedCustomer && (
                    <div style={{
                        position: "fixed",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        backdropFilter: "blur(4px)"
                    }}>
                        <div style={{
                            background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                            padding: "32px",
                            borderRadius: "16px",
                            width: "90%",
                            maxWidth: "800px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "relative",
                            boxShadow: "0 20px 60px rgba(181, 157, 58, 0.3)",
                            border: "1px solid rgba(181, 157, 58, 0.2)"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 28,
                                paddingBottom: 16,
                                borderBottom: "2px solid rgba(181, 157, 58, 0.1)"
                            }}>
                                <div style={{
                                    fontWeight: "700",
                                    color: "#6b4f1d",
                                    fontSize: "1.3rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    <span style={{ fontSize: "1.5rem" }}>📍</span>
                                    Quản lý địa chỉ khách hàng
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddressListModal(false);
                                        setTimeout(() => openAddAddressModal(selectedCustomer.idKhachHang), 100);
                                    }}
                                    style={{
                                        padding: "12px 20px",
                                        background: "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: "0 4px 16px rgba(181, 157, 58, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.3)";
                                    }}
                                >
                                    <span style={{ fontSize: "1.1rem" }}>➕</span>
                                    Thêm địa chỉ
                                </button>
                            </div>
                            {selectedCustomer.danhSachDiaChi && selectedCustomer.danhSachDiaChi.length > 0 ? (
                                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                                    {selectedCustomer.danhSachDiaChi.map((address: any, index: number) => (
                                        <div key={address.idDiaChi} style={{
                                            padding: "24px",
                                            border: "2px solid",
                                            borderColor: address.macDinh === "Có" ? "#bbdefb" : "rgba(181, 157, 58, 0.2)",
                                            borderRadius: "12px",
                                            background: address.macDinh === "Có" ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" : "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                            position: "relative",
                                            boxShadow: address.macDinh === "Có" ? "0 8px 24px rgba(33, 150, 243, 0.15)" : "0 4px 16px rgba(181, 157, 58, 0.1)",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                        }}
                                             onMouseEnter={(e) => {
                                                 e.currentTarget.style.transform = "translateY(-2px)";
                                                 e.currentTarget.style.boxShadow = address.macDinh === "Có" ? "0 12px 32px rgba(33, 150, 243, 0.2)" : "0 8px 24px rgba(181, 157, 58, 0.15)";
                                             }}
                                             onMouseLeave={(e) => {
                                                 e.currentTarget.style.transform = "translateY(0)";
                                                 e.currentTarget.style.boxShadow = address.macDinh === "Có" ? "0 8px 24px rgba(33, 150, 243, 0.15)" : "0 4px 16px rgba(181, 157, 58, 0.1)";
                                             }}
                                        >
                                            {address.macDinh === "Có" && (
                                                <div style={{
                                                    position: "absolute",
                                                    top: "12px",
                                                    right: "12px",
                                                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                                    color: "#fff",
                                                    padding: "6px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "0.85rem",
                                                    fontWeight: "700",
                                                    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}>
                                                    <span style={{ fontSize: "1rem" }}>⭐</span>
                                                    Mặc định
                                                </div>
                                            )}
                                            <div style={{
                                                marginBottom: "16px",
                                                color: "#6b4f1d",
                                                fontSize: "1.1rem",
                                                fontWeight: 700,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px"
                                            }}>
                                                <span style={{ fontSize: "1.2rem" }}>📍</span>
                                                Địa chỉ {index + 1}
                                            </div>
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "12px",
                                                marginBottom: "12px"
                                            }}>
                                                <div style={{
                                                    padding: "8px 12px",
                                                    background: "rgba(255,255,255,0.6)",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(181, 157, 58, 0.1)"
                                                }}>
                                                    <div style={{fontWeight: 600, color: "#6b4f1d", fontSize: "0.9rem", marginBottom: "4px"}}>🏙️ Thành phố:</div>
                                                    <div style={{color: "#8a7a2a", fontSize: "0.95rem"}}>{address.thanhPho}</div>
                                                </div>
                                                <div style={{
                                                    padding: "8px 12px",
                                                    background: "rgba(255,255,255,0.6)",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(181, 157, 58, 0.1)"
                                                }}>
                                                    <div style={{fontWeight: 600, color: "#6b4f1d", fontSize: "0.9rem", marginBottom: "4px"}}>🏘️ Quận/Huyện:</div>
                                                    <div style={{color: "#8a7a2a", fontSize: "0.95rem"}}>{address.quanHuyen}</div>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "12px",
                                                marginBottom: "12px"
                                            }}>
                                                <div style={{
                                                    padding: "8px 12px",
                                                    background: "rgba(255,255,255,0.6)",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(181, 157, 58, 0.1)"
                                                }}>
                                                    <div style={{fontWeight: 600, color: "#6b4f1d", fontSize: "0.9rem", marginBottom: "4px"}}>🏠 Xã/Phường:</div>
                                                    <div style={{color: "#8a7a2a", fontSize: "0.95rem"}}>{address.xaPhuong}</div>
                                                </div>
                                                <div style={{
                                                    padding: "8px 12px",
                                                    background: "rgba(255,255,255,0.6)",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(181, 157, 58, 0.1)"
                                                }}>
                                                    <div style={{fontWeight: 600, color: "#6b4f1d", fontSize: "0.9rem", marginBottom: "4px"}}>🚪 Ngõ/Ngách:</div>
                                                    <div style={{color: "#8a7a2a", fontSize: "0.95rem"}}>{address.ngoNgach}</div>
                                                </div>
                                            </div>
                                            {address.ghiChu && (
                                                <div style={{
                                                    padding: "12px",
                                                    background: "rgba(255,255,255,0.8)",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(181, 157, 58, 0.1)",
                                                    marginBottom: "12px"
                                                }}>
                                                    <div style={{fontWeight: 600, color: "#6b4f1d", fontSize: "0.9rem", marginBottom: "4px"}}>📝 Ghi chú:</div>
                                                    <div style={{color: "#8a7a2a", fontSize: "0.95rem", fontStyle: "italic"}}>{address.ghiChu}</div>
                                                </div>
                                            )}
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                marginTop: "20px",
                                                gap: "12px",
                                                paddingTop: "16px",
                                                borderTop: "1px solid rgba(181, 157, 58, 0.1)"
                                            }}>
                                                {address.macDinh !== "Có" && (
                                                    <button
                                                        onClick={() => setDefaultAddress(address.idDiaChi, selectedCustomer.idKhachHang)}
                                                        style={{
                                                            padding: "10px 18px",
                                                            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "10px",
                                                            cursor: "pointer",
                                                            fontSize: "0.9rem",
                                                            fontWeight: "600",
                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                            boxShadow: "0 2px 8px rgba(40, 167, 69, 0.3)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(40, 167, 69, 0.4)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(40, 167, 69, 0.3)";
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "1rem" }}>⭐</span>
                                                        Đặt làm mặc định
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditAddressModal(address, selectedCustomer.idKhachHang)}
                                                    style={{
                                                        padding: "10px 18px",
                                                        background: "linear-gradient(135deg, #ffc107 0%, #ffb300 100%)",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "10px",
                                                        cursor: "pointer",
                                                        fontSize: "0.9rem",
                                                        fontWeight: "600",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 2px 8px rgba(255, 193, 7, 0.3)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px"
                                                    }}
                                                    title="Sửa địa chỉ"
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 193, 7, 0.4)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "translateY(0)";
                                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 193, 7, 0.3)";
                                                    }}
                                                >
                                                    <span style={{ fontSize: "1rem" }}>✏️</span>
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(address.idDiaChi, selectedCustomer.idKhachHang)}
                                                    style={{
                                                        padding: "10px 18px",
                                                        background: address.macDinh === "Có" ? "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)" : "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "10px",
                                                        cursor: address.macDinh === "Có" ? "not-allowed" : "pointer",
                                                        fontSize: "0.9rem",
                                                        fontWeight: "600",
                                                        opacity: address.macDinh === "Có" ? 0.6 : 1,
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: address.macDinh === "Có" ? "0 2px 8px rgba(108, 117, 125, 0.3)" : "0 2px 8px rgba(220, 53, 69, 0.3)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px"
                                                    }}
                                                    disabled={address.macDinh === "Có"}
                                                    title={address.macDinh === "Có" ? "Không thể xóa địa chỉ mặc định" : "Xóa địa chỉ"}
                                                    onMouseEnter={(e) => {
                                                        if (address.macDinh !== "Có") {
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(220, 53, 69, 0.4)";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (address.macDinh !== "Có") {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(220, 53, 69, 0.3)";
                                                        }
                                                    }}
                                                >
                                                    <span style={{ fontSize: "1rem" }}>❌</span>
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: "center",
                                    padding: "60px 40px",
                                    color: "#6b4f1d",
                                    background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 16px rgba(181, 157, 58, 0.08)",
                                    border: "1px solid rgba(181, 157, 58, 0.1)"
                                }}>
                                    <div style={{
                                        fontSize: "4rem",
                                        marginBottom: "20px",
                                        filter: "drop-shadow(0 4px 8px rgba(181, 157, 58, 0.2))"
                                    }}>📍</div>
                                    <h3 style={{
                                        margin: "0 0 16px 0",
                                        color: "#6b4f1d",
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        textShadow: "0 2px 4px rgba(181, 157, 58, 0.1)"
                                    }}>Chưa có địa chỉ nào</h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "1.1rem",
                                        color: "#8a7a2a",
                                        lineHeight: "1.6"
                                    }}>Khách hàng này chưa có địa chỉ nào được thêm.</p>
                                </div>
                            )}
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "32px",
                                paddingTop: "24px",
                                borderTop: "2px solid rgba(181, 157, 58, 0.1)"
                            }}>
                                <button
                                    onClick={closeAddressListModal}
                                    style={{
                                        padding: "14px 28px",
                                        background: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: "0 4px 16px rgba(108, 117, 125, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(108, 117, 125, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(108, 117, 125, 0.3)";
                                    }}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm đổi trạng thái */}
                {showConfirmToggle && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 340, boxShadow: '0 4px 24px #0002', position: 'relative' }}>
                            <h3 style={{ color: '#b59d3a', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Xác nhận</h3>
                            <div style={{ color: '#333', fontSize: 16, marginBottom: 16 }}>Bạn có muốn thay đổi trạng thái tài khoản này không?</div>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                                <button onClick={() => { setShowConfirmToggle(false); setConfirmToggleId(null); }} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: '#eee', color: '#333', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Hủy</button>
                                <button onClick={async () => { if (confirmToggleId != null) { await toggleTrangThai(confirmToggleId); } setShowConfirmToggle(false); setConfirmToggleId(null); }} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: '#b59d3a', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Đồng ý</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal thêm/sửa khách hàng */}
                {showModal && (
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
                            <button
                                onClick={closeModal}
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
                                    <span style={{ fontSize: 20, color: "#fff", fontWeight: 700 }}>{isEditing ? '✏️' : '👤'}</span>
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
                                    {isEditing ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "24px"}}>
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            Mã khách hàng *
                                        </label>
                                        <input
                                            type="text"
                                            name="maKhachHang"
                                            value={currentKhachHang.maKhachHang}
                                            onChange={handleInputChange}
                                            readOnly={isEditing}
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.maKhachHang ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: isEditing ? "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" : "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: isEditing ? "#6c757d" : "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                            }}
                                            placeholder="Ví dụ: KH001"
                                            onFocus={(e) => {
                                                if (!isEditing) {
                                                    e.target.style.border = "2px solid #b59d3a";
                                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                }
                                            }}
                                            onBlur={(e) => {
                                                validateField(e.target.name, e.target.value);
                                                e.target.style.border = validationErrors.maKhachHang ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                            }}
                                        />
                                        {validationErrors.maKhachHang && (
                                            <div style={{
                                                color: "#e74c3c",
                                                fontSize: "0.85rem",
                                                marginTop: "6px",
                                                padding: "6px 10px",
                                                background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                borderRadius: "8px",
                                                border: "1px solid #ffb3b3",
                                                fontWeight: "500"
                                            }}>
                                                ⚠️ {validationErrors.maKhachHang}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            👤 Tên khách hàng *
                                        </label>
                                        <input
                                            type="text"
                                            name="tenKhachHang"
                                            value={currentKhachHang.tenKhachHang}
                                            onChange={handleInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.tenKhachHang ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                            }}
                                            placeholder="Nhập tên khách hàng"
                                            onFocus={(e) => {
                                                e.target.style.border = "2px solid #b59d3a";
                                                e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                            }}
                                            onBlur={(e) => {
                                                validateField(e.target.name, e.target.value);
                                                e.target.style.border = validationErrors.tenKhachHang ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                            }}
                                        />
                                        {validationErrors.tenKhachHang && (
                                            <div style={{
                                                color: "#e74c3c",
                                                fontSize: "0.85rem",
                                                marginTop: "6px",
                                                padding: "6px 10px",
                                                background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                borderRadius: "8px",
                                                border: "1px solid #ffb3b3",
                                                fontWeight: "500"
                                            }}>
                                                ⚠️ {validationErrors.tenKhachHang}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        display: "block",
                                        marginBottom: "10px",
                                        fontWeight: "700",
                                        color: "#6b4f1d",
                                        fontSize: "0.95rem",
                                        textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                    }}>
                                        📅 Ngày sinh
                                    </label>
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <DatePicker
                                            selected={currentKhachHang.ngaySinh && isValid(new Date(currentKhachHang.ngaySinh))
                                                ? new Date(currentKhachHang.ngaySinh)
                                                : null}
                                            onChange={(date: Date | null) => {
                                                let formattedDate = "";
                                                if (date && isValid(date)) {
                                                    // Format as YYYY-MM-DD
                                                    formattedDate = format(date, 'yyyy-MM-dd');
                                                }
                                                
                                                setCurrentKhachHang(prev => ({
                                                    ...prev,
                                                    ngaySinh: formattedDate
                                                }));

                                                // Validate age
                                                if (date) {
                                                    const today = new Date();
                                                    let age = today.getFullYear() - date.getFullYear();
                                                    const monthDiff = today.getMonth() - date.getMonth();
                                                    
                                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                                                        age--;
                                                    }
                                                    
                                                    if (age < 18) {
                                                        setValidationErrors(prev => ({
                                                            ...prev,
                                                            ngaySinh: "Khách hàng phải từ đủ 18 tuổi trở lên"
                                                        }));
                                                    } else {
                                                        setValidationErrors(prev => ({
                                                            ...prev,
                                                            ngaySinh: ""
                                                        }));
                                                    }
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        ngaySinh: "Vui lòng nhập ngày sinh"
                                                    }));
                                                }
                                            }}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Chọn ngày sinh"
                                            className={`custom-datepicker-input ${validationErrors.ngaySinh ? 'error' : ''}`}
                                            showMonthDropdown
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={new Date().getFullYear() - 1965 + 1}
                                            minDate={new Date(1965, 0, 1)}
                                            maxDate={new Date()}
                                            wrapperClassName="custom-datepicker-wrapper"
                                            locale="vi"
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.ngaySinh 
                                                    ? "2px solid #ff4d4f" 
                                                    : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: validationErrors.ngaySinh 
                                                    ? "0 0 0 2px rgba(255, 77, 79, 0.2)" 
                                                    : "0 2px 8px rgba(181, 157, 58, 0.05)"
                                            }}
                                        />
                                        {validationErrors.ngaySinh && (
                                            <div style={{ 
                                                color: '#ff4d4f', 
                                                fontSize: '0.85rem', 
                                                marginTop: '4px',
                                                padding: '4px 8px',
                                                backgroundColor: '#fff1f0',
                                                borderRadius: '4px',
                                                border: '1px solid #ffccc7'
                                            }}>
                                                ⚠️ {validationErrors.ngaySinh}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            🚻 Giới tính
                                        </label>
                                        <div style={{
                                            display: "flex",
                                            gap: "16px",
                                            alignItems: "center",
                                            padding: "14px 16px",
                                            background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                            border: "2px solid rgba(181, 157, 58, 0.2)",
                                            borderRadius: "12px",
                                            boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                        }}>
                                            <label style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                cursor: "pointer",
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                background: currentKhachHang.gioiTinh === true ? "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)" : "transparent",
                                                color: currentKhachHang.gioiTinh === true ? "#fff" : "#6b4f1d",
                                                fontWeight: "600",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: currentKhachHang.gioiTinh === true ? "0 2px 8px rgba(181, 157, 58, 0.3)" : "none"
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="gioiTinh"
                                                    value="true"
                                                    checked={currentKhachHang.gioiTinh === true}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        margin: 0,
                                                        width: "18px",
                                                        height: "18px",
                                                        accentColor: "#b59d3a"
                                                    }}
                                                />
                                                <span>👨 Nam</span>
                                            </label>
                                            <label style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                cursor: "pointer",
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                background: currentKhachHang.gioiTinh === false ? "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)" : "transparent",
                                                color: currentKhachHang.gioiTinh === false ? "#fff" : "#6b4f1d",
                                                fontWeight: "600",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: currentKhachHang.gioiTinh === false ? "0 2px 8px rgba(181, 157, 58, 0.3)" : "none"
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="gioiTinh"
                                                    value="false"
                                                    checked={currentKhachHang.gioiTinh === false}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        margin: 0,
                                                        width: "18px",
                                                        height: "18px",
                                                        accentColor: "#b59d3a"
                                                    }}
                                                />
                                                <span>👩 Nữ</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            📞 Số điện thoại *
                                        </label>
                                        <input
                                            type="tel"
                                            name="soDienThoai"
                                            value={currentKhachHang.soDienThoai}
                                            onChange={handleInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.soDienThoai ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                            }}
                                            placeholder="Ví dụ: 0123456789"
                                            onFocus={(e) => {
                                                e.target.style.border = "2px solid #b59d3a";
                                                e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                            }}
                                            onBlur={(e) => {
                                                validateField(e.target.name, e.target.value);
                                                e.target.style.border = validationErrors.soDienThoai ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                            }}
                                        />
                                        {validationErrors.soDienThoai && (
                                            <div style={{
                                                color: "#e74c3c",
                                                fontSize: "0.85rem",
                                                marginTop: "6px",
                                                padding: "6px 10px",
                                                background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                borderRadius: "8px",
                                                border: "1px solid #ffb3b3",
                                                fontWeight: "500"
                                            }}>
                                                ⚠️ {validationErrors.soDienThoai}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        display: "block",
                                        marginBottom: "10px",
                                        fontWeight: "700",
                                        color: "#6b4f1d",
                                        fontSize: "0.95rem",
                                        textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                    }}>
                                        📧 Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={currentKhachHang.email}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            border: validationErrors.email ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                            borderRadius: "12px",
                                            fontSize: "0.95rem",
                                            boxSizing: "border-box",
                                            background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                            color: "#6b4f1d",
                                            fontWeight: "500",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                        }}
                                        placeholder="Ví dụ: example@gmail.com"
                                        onFocus={(e) => {
                                            e.target.style.border = "2px solid #b59d3a";
                                            e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                        }}
                                        onBlur={(e) => {
                                            validateField(e.target.name, e.target.value);
                                            e.target.style.border = validationErrors.email ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                            e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                        }}
                                    />
                                    {validationErrors.email && (
                                        <div style={{
                                            color: "#e74c3c",
                                            fontSize: "0.85rem",
                                            marginTop: "6px",
                                            padding: "6px 10px",
                                            background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                            borderRadius: "8px",
                                            border: "1px solid #ffb3b3",
                                            fontWeight: "500"
                                        }}>
                                            ⚠️ {validationErrors.email}
                                        </div>
                                    )}
                                </div>
                                {!isEditing && (
                                    <>
                                        <div style={{
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            marginTop: "20px",
                                            marginBottom: "16px",
                                            fontSize: "1.1rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}>
                                            📍 Thông tin địa chỉ
                                        </div>
                                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
                                            <div>
                                                <label style={{
                                                    display: "block",
                                                    marginBottom: "10px",
                                                    fontWeight: "700",
                                                    color: "#6b4f1d",
                                                    fontSize: "0.95rem",
                                                    textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                                }}>
                                                    🏙️ Thành phố *
                                                </label>
                                                <select
                                                    name="thanhPho"
                                                    value={currentAddress.thanhPho}
                                                    onChange={handleProvinceChange}
                                                    style={{
                                                        width: "100%",
                                                        padding: "14px 16px",
                                                        border: validationErrors.thanhPho ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                        borderRadius: "12px",
                                                        fontSize: "0.95rem",
                                                        boxSizing: "border-box",
                                                        background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                        color: "#6b4f1d",
                                                        fontWeight: "500",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.border = "2px solid #b59d3a";
                                                        e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.border = validationErrors.thanhPho ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                        e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                                    }}
                                                >
                                                    <option value="">Chọn tỉnh/thành</option>
                                                    {addressData.map((p) => (
                                                        <option key={p.province_id} value={p.province_name}>{p.province_name}</option>
                                                    ))}
                                                </select>
                                                {validationErrors.thanhPho && (
                                                    <div style={{
                                                        color: "#e74c3c",
                                                        fontSize: "0.85rem",
                                                        marginTop: "6px",
                                                        padding: "6px 10px",
                                                        background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                        borderRadius: "8px",
                                                        border: "1px solid #ffb3b3",
                                                        fontWeight: "500"
                                                    }}>
                                                        ⚠️ {validationErrors.thanhPho}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{
                                                    display: "block",
                                                    marginBottom: "10px",
                                                    fontWeight: "700",
                                                    color: "#6b4f1d",
                                                    fontSize: "0.95rem",
                                                    textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                                }}>
                                                    🏘️ Quận/Huyện *
                                                </label>
                                                <select
                                                    name="quanHuyen"
                                                    value={currentAddress.quanHuyen}
                                                    onChange={handleDistrictChange}
                                                    disabled={!filteredDistricts.length}
                                                    style={{
                                                        width: "100%",
                                                        padding: "14px 16px",
                                                        border: validationErrors.quanHuyen ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                        borderRadius: "12px",
                                                        fontSize: "0.95rem",
                                                        boxSizing: "border-box",
                                                        background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                        color: "#6b4f1d",
                                                        fontWeight: "500",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)",
                                                        opacity: !filteredDistricts.length ? 0.6 : 1
                                                    }}
                                                    onFocus={(e) => {
                                                        if (filteredDistricts.length) {
                                                            e.target.style.border = "2px solid #b59d3a";
                                                            e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.border = validationErrors.quanHuyen ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                        e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                                    }}
                                                >
                                                    <option value="">Chọn quận/huyện</option>
                                                    {filteredDistricts.map((d) => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                                {validationErrors.quanHuyen && (
                                                    <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                        {validationErrors.quanHuyen}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                                            <div>
                                                <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                                    Xã/Phường *
                                                </label>
                                                <select
                                                    name="xaPhuong"
                                                    value={currentAddress.xaPhuong}
                                                    onChange={handleAddressInputChange}
                                                    disabled={!filteredWards.length}
                                                    style={{
                                                        width: "100%",
                                                        padding: "12px",
                                                        border: validationErrors.xaPhuong ? "1px solid #dc3545" : "1px solid #ddd",
                                                        borderRadius: "6px",
                                                        fontSize: "0.9rem",
                                                        boxSizing: "border-box",
                                                        background: "#fff",
                                                        color: "#222"
                                                    }}
                                                >
                                                    <option value="">Chọn phường/xã</option>
                                                    {filteredWards.map((w) => (
                                                        <option key={w} value={w}>{w}</option>
                                                    ))}
                                                </select>
                                                {validationErrors.xaPhuong && (
                                                    <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                        {validationErrors.xaPhuong}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                                    Ngõ/Ngách *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="ngoNgach"
                                                    value={currentAddress.ngoNgach}
                                                    onChange={handleAddressInputChange}
                                                    style={{
                                                        width: "100%",
                                                        padding: "14px 16px",
                                                        border: validationErrors.ngoNgach ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                        borderRadius: "12px",
                                                        fontSize: "0.95rem",
                                                        boxSizing: "border-box",
                                                        background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                        color: "#6b4f1d",
                                                        fontWeight: "500",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                                    }}
                                                    placeholder="Nhập ngõ/ngách"
                                                    onFocus={(e) => {
                                                        e.target.style.border = "2px solid #b59d3a";
                                                        e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.border = validationErrors.ngoNgach ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                        e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                                    }}
                                                />
                                                {validationErrors.ngoNgach && (
                                                    <div style={{
                                                        color: "#e74c3c",
                                                        fontSize: "0.85rem",
                                                        marginTop: "6px",
                                                        padding: "6px 10px",
                                                        background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                        borderRadius: "8px",
                                                        border: "1px solid #ffb3b3",
                                                        fontWeight: "500"
                                                    }}>
                                                        ⚠️ {validationErrors.ngoNgach}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{
                                                display: "block",
                                                marginBottom: "10px",
                                                fontWeight: "700",
                                                color: "#6b4f1d",
                                                fontSize: "0.95rem",
                                                textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                            }}>
                                                📝 Ghi chú
                                            </label>
                                            <textarea
                                                name="ghiChu"
                                                value={currentAddress.ghiChu}
                                                onChange={handleAddressInputChange}
                                                rows={3}
                                                style={{
                                                    width: "100%",
                                                    padding: "14px 16px",
                                                    border: "2px solid rgba(181, 157, 58, 0.2)",
                                                    borderRadius: "12px",
                                                    fontSize: "0.95rem",
                                                    boxSizing: "border-box",
                                                    background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                    color: "#6b4f1d",
                                                    fontWeight: "500",
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)",
                                                    resize: "vertical",
                                                    minHeight: "80px"
                                                }}
                                                placeholder="Ghi chú thêm (nếu có)"
                                                onFocus={(e) => {
                                                    e.target.style.border = "2px solid #b59d3a";
                                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.border = "2px solid rgba(181, 157, 58, 0.2)";
                                                    e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: "block",
                                                marginBottom: "10px",
                                                fontWeight: "700",
                                                color: "#6b4f1d",
                                                fontSize: "0.95rem",
                                                textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                            }}>
                                                ⭐ Đặt làm mặc định
                                            </label>
                                            <select
                                                name="macDinh"
                                                value={currentAddress.macDinh}
                                                onChange={handleAddressInputChange}
                                                style={{
                                                    width: "100%",
                                                    padding: "14px 16px",
                                                    border: "2px solid rgba(181, 157, 58, 0.2)",
                                                    borderRadius: "12px",
                                                    fontSize: "0.95rem",
                                                    boxSizing: "border-box",
                                                    background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                    color: "#6b4f1d",
                                                    fontWeight: "500",
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.border = "2px solid #b59d3a";
                                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.border = "2px solid rgba(181, 157, 58, 0.2)";
                                                    e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                                }}
                                            >
                                                <option value="Không">Không</option>
                                                <option value="Có">Có</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div style={{
                                    display: "flex",
                                    gap: "16px",
                                    justifyContent: "flex-end",
                                    marginTop: "28px",
                                    paddingTop: "24px",
                                    borderTop: "2px solid rgba(181, 157, 58, 0.1)"
                                }}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={{
                                            padding: "14px 28px",
                                            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                            color: "#6b4f1d",
                                            border: "2px solid rgba(181, 157, 58, 0.3)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            fontWeight: "700",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: "0 2px 8px rgba(181, 157, 58, 0.1)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.2)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.1)";
                                        }}
                                    >
                                        <FaTimes style={{fontSize: '1.2em'}} /> Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loadingSubmit}
                                        style={{
                                            padding: "14px 28px",
                                            background: loadingSubmit ? "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)" : "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "12px",
                                            cursor: loadingSubmit ? "not-allowed" : "pointer",
                                            fontSize: "1rem",
                                            fontWeight: "700",
                                            opacity: loadingSubmit ? 0.7 : 1,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: loadingSubmit ? "0 2px 8px rgba(108, 117, 125, 0.3)" : "0 4px 16px rgba(181, 157, 58, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loadingSubmit) {
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loadingSubmit) {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.3)";
                                            }
                                        }}
                                    >
                                        {loadingSubmit
                                            ? '⏳ Đang lưu...'
                                            : (isEditing
                                                ? (<><FaSave style={{fontSize: '1.2em', marginRight: 6}} /> Lưu</>)
                                                : '➕ Thêm')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Modal thêm/sửa địa chỉ */}
                {showAddressModal && (
                    <div style={{
                        position: "fixed",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1100,
                        backdropFilter: "blur(4px)"
                    }}>
                        <div style={{
                            background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                            padding: "32px",
                            borderRadius: "20px",
                            width: "90%",
                            maxWidth: "650px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "relative",
                            boxShadow: "0 20px 60px rgba(181, 157, 58, 0.3)",
                            border: "1px solid rgba(181, 157, 58, 0.1)"
                        }}>
                            <button
                                onClick={closeAddressModal}
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    right: "24px",
                                    width: "36px",
                                    height: "36px",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                    border: "2px solid rgba(181, 157, 58, 0.2)",
                                    borderRadius: "50%",
                                    color: "#6b4f1d",
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 2px 8px rgba(181, 157, 58, 0.1)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.1)";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.1)";
                                }}
                            >
                                ×
                            </button>
                            <h2 style={{
                                margin: "0 0 32px 0",
                                color: "#6b4f1d",
                                fontSize: "1.75rem",
                                fontWeight: "700",
                                textAlign: "center",
                                textShadow: "0 2px 4px rgba(181, 157, 58, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "12px"
                            }}>
                                <span style={{ fontSize: "2rem" }}>
                                    {isEditingAddress ? '✏️' : '📍'}
                                </span>
                                {isEditingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                            </h2>
                            <form onSubmit={handleAddressSubmit} style={{display: "flex", flexDirection: "column", gap: "24px"}}>
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            🏙️ Thành phố *
                                        </label>
                                        <select
                                            name="thanhPho"
                                            value={currentAddress.thanhPho}
                                            onChange={handleProvinceChange}
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.thanhPho ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = "2px solid #b59d3a";
                                                e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = validationErrors.thanhPho ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                            }}
                                        >
                                            <option value="">Chọn tỉnh/thành</option>
                                            {addressData.map((p) => (
                                                <option key={p.province_id} value={p.province_name}>{p.province_name}</option>
                                            ))}
                                        </select>
                                        {validationErrors.thanhPho && (
                                            <div style={{
                                                color: "#e74c3c",
                                                fontSize: "0.85rem",
                                                marginTop: "6px",
                                                padding: "6px 10px",
                                                background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                borderRadius: "8px",
                                                border: "1px solid #ffb3b3",
                                                fontWeight: "500"
                                            }}>
                                                ⚠️ {validationErrors.thanhPho}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            🏘️ Quận/Huyện *
                                        </label>
                                        <select
                                            name="quanHuyen"
                                            value={currentAddress.quanHuyen}
                                            onChange={handleDistrictChange}
                                            disabled={!filteredDistricts.length}
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.quanHuyen ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)",
                                                opacity: !filteredDistricts.length ? 0.6 : 1
                                            }}
                                            onFocus={(e) => {
                                                if (filteredDistricts.length) {
                                                    e.target.style.border = "2px solid #b59d3a";
                                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                }
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = validationErrors.quanHuyen ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                            }}
                                        >
                                            <option value="">Chọn quận/huyện</option>
                                            {filteredDistricts.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        {validationErrors.quanHuyen && (
                                            <div style={{
                                                color: "#e74c3c",
                                                fontSize: "0.85rem",
                                                marginTop: "6px",
                                                padding: "6px 10px",
                                                background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                borderRadius: "8px",
                                                border: "1px solid #ffb3b3",
                                                fontWeight: "500"
                                            }}>
                                                ⚠️ {validationErrors.quanHuyen}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            🏠 Xã/Phường *
                                        </label>
                                        <select
                                            name="xaPhuong"
                                            value={currentAddress.xaPhuong}
                                            onChange={handleAddressInputChange}
                                            disabled={!filteredWards.length}
                                            style={{
                                                width: "100%",
                                                padding: "14px 16px",
                                                border: validationErrors.xaPhuong ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)",
                                                borderRadius: "12px",
                                                fontSize: "0.95rem",
                                                boxSizing: "border-box",
                                                background: "linear-gradient(135deg, #fff 0%, #fffbe6 100%)",
                                                color: "#6b4f1d",
                                                fontWeight: "500",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 2px 8px rgba(181, 157, 58, 0.05)",
                                                opacity: !filteredWards.length ? 0.6 : 1
                                            }}
                                            onFocus={(e) => {
                                                if (filteredWards.length) {
                                                    e.target.style.border = "2px solid #b59d3a";
                                                    e.target.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.15)";
                                                }
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = validationErrors.xaPhuong ? "2px solid #e74c3c" : "2px solid rgba(181, 157, 58, 0.2)";
                                                e.target.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.05)";
                                            }}
                                        >
                                            <option value="">Chọn phường/xã</option>
                                            {filteredWards.map((w) => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                        </select>
                                        {validationErrors.xaPhuong && (
                                            <div style={{
                                                color: "#e74c3c",
                                                fontSize: "0.85rem",
                                                marginTop: "6px",
                                                padding: "6px 10px",
                                                background: "linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%)",
                                                borderRadius: "8px",
                                                border: "1px solid #ffb3b3",
                                                fontWeight: "500"
                                            }}>
                                                ⚠️ {validationErrors.xaPhuong}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "700",
                                            color: "#6b4f1d",
                                            fontSize: "0.95rem",
                                            textShadow: "0 1px 2px rgba(181, 157, 58, 0.1)"
                                        }}>
                                            🏡 Ngõ/Ngách *
                                        </label>
                                        <input
                                            type="text"
                                            name="ngoNgach"
                                            value={currentAddress.ngoNgach}
                                            onChange={handleAddressInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: validationErrors.ngoNgach ? "1px solid #dc3545" : "1px solid #ddd",
                                                borderRadius: "6px",
                                                fontSize: "0.9rem",
                                                boxSizing: "border-box",
                                                background: "#fff",
                                                color: "#222"
                                            }}
                                            placeholder="Nhập ngõ/ngách"
                                        />
                                        {validationErrors.ngoNgach && (
                                            <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                {validationErrors.ngoNgach}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Ghi chú
                                    </label>
                                    <textarea
                                        name="ghiChu"
                                        value={currentAddress.ghiChu}
                                        onChange={handleAddressInputChange}
                                        rows={2}
                                        style={{width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box", background: "#fff", color: "#222"}}
                                        placeholder="Ghi chú thêm (nếu có)"
                                    />
                                </div>
                                <div style={{
                                    display: "flex",
                                    gap: "16px",
                                    justifyContent: "flex-end",
                                    marginTop: "28px",
                                    paddingTop: "24px",
                                    borderTop: "2px solid rgba(181, 157, 58, 0.1)"
                                }}>
                                    <button
                                        type="button"
                                        onClick={closeAddressModal}
                                        style={{
                                            padding: "14px 28px",
                                            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                            color: "#6b4f1d",
                                            border: "2px solid rgba(181, 157, 58, 0.3)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            fontWeight: "700",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: "0 2px 8px rgba(181, 157, 58, 0.1)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.2)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(181, 157, 58, 0.1)";
                                        }}
                                    >
                                        ❌ Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loadingAddress}
                                        style={{
                                            padding: "14px 28px",
                                            background: loadingAddress ? "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)" : "linear-gradient(135deg, #b59d3a 0%, #8a7a2a 100%)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "12px",
                                            cursor: loadingAddress ? "not-allowed" : "pointer",
                                            fontSize: "1rem",
                                            fontWeight: "700",
                                            opacity: loadingAddress ? 0.7 : 1,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: loadingAddress ? "0 2px 8px rgba(108, 117, 125, 0.3)" : "0 4px 16px rgba(181, 157, 58, 0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loadingAddress) {
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(181, 157, 58, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loadingAddress) {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(181, 157, 58, 0.3)";
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: "1.2rem" }}>
                                            {loadingAddress ? '⏳' : (isEditingAddress ? '💾' : '➕')}
                                        </span>
                                        {loadingAddress ? 'Đang lưu...' : (isEditingAddress ? 'Cập nhật' : 'Thêm mới')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {toast && (
                    <div style={{
                        position: 'fixed',
                        top: 30,
                        right: 30,
                        zIndex: 2000,
                        background: toast.type === 'success' ? 'linear-gradient(135deg, #2ecc40 0%, #27ae60 100%)' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        color: '#fff',
                        padding: '16px 32px',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: toast.type === 'success' ? '0 8px 24px rgba(46, 204, 64, 0.3)' : '0 8px 24px rgba(231, 76, 60, 0.3)',
                        minWidth: 280,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: toast.type === 'success' ? '#27ae60' : '#c0392b',
                        backdropFilter: 'blur(8px)',
                        animation: 'slideInRight 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {toast.message}
                        </div>
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
                            width: 600,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: 20,
                                fontWeight: 600,
                                color: '#333',
                                textAlign: 'center'
                            }}>
                                {isEditing ? 'Xác nhận cập nhật' : 'Xác nhận thêm khách hàng'}
                            </h3>
                            <p style={{
                                margin: '0 0 16px 0',
                                fontSize: 16,
                                color: '#666',
                                lineHeight: 1.5,
                                textAlign: 'center'
                            }}>
                                {isEditing
                                    ? 'Bạn có chắc chắn muốn cập nhật thông tin khách hàng này không?'
                                    : 'Bạn có chắc chắn muốn thêm khách hàng mới không?'
                                }
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
                                    onClick={handleConfirmSubmit}
                                    disabled={loadingSubmit}
                                    style={{
                                        background: '#b59d3a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '12px 24px',
                                        fontSize: 16,
                                        fontWeight: 500,
                                        cursor: loadingSubmit ? 'not-allowed' : 'pointer',
                                        minWidth: 100
                                    }}
                                >
                                    {loadingSubmit
                                        ? isEditing ? 'Đang cập nhật...' : 'Đang thêm...'
                                        : 'Xác nhận'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}