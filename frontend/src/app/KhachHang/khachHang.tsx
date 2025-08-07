"use client";
import React, { useState, useEffect } from "react";
// Đã xóa: import addressDataRaw from './vn-address.json';
// Đã xóa: const addressData = addressDataRaw.results;

export default function KhachHang() {
    // State quản lý khách hàng
    const [khachHangs, setKhachHangs] = useState<any[]>([]);
    const [loadingKH, setLoadingKH] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
    const [addressData, setAddressData] = useState<any[]>([]);

    // useEffect để load danh sách khách hàng khi mount
    useEffect(() => {
        fetchKhachHangs();
    }, []);

    useEffect(() => {
        fetch('/vn-address.json')
            .then(res => res.json())
            .then(data => setAddressData(data.results || []));
    }, []);

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
            } else {
                console.error('Lỗi khi chuyển đổi trạng thái');
            }
        } catch (error) {
            console.error('Lỗi khi chuyển đổi trạng thái:', error);
        }
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

    // Xử lý submit form thêm/sửa khách hàng
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let errors: any = {};

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

        // 2. Kiểm tra tên khách hàng
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
                } else {
                    setKhachHangs((prev: any[]) => [...prev, savedKhachHang]);
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
                alert(isEditing ? '✅ Cập nhật khách hàng thành công!' : '✅ Thêm khách hàng thành công!');
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Có lỗi xảy ra';
                alert(`❌ Lỗi: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Lỗi khi lưu khách hàng:', error);
            alert('❌ Có lỗi xảy ra khi lưu khách hàng. Vui lòng kiểm tra kết nối mạng.');
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
        if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
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
            }
        } catch (e) {
            console.error('Lỗi khi reload địa chỉ khách hàng:', e);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCurrentAddress((prev: any) => ({ ...prev, thanhPho: value, quanHuyen: '', xaPhuong: '' }));
        const found = addressData.find((d: any) => d.province_name === value);
        setFilteredDistricts(found ? found.districts.map((d: any) => d.district_name) : []);
        setFilteredWards([]);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCurrentAddress((prev: any) => ({ ...prev, quanHuyen: value, xaPhuong: '' }));
        const foundProvince = addressData.find((d: any) => d.province_name === currentAddress.thanhPho);
        const foundDistrict = foundProvince?.districts.find((d: any) => d.district_name === value);
        setFilteredWards(foundDistrict ? foundDistrict.wards.map((w: any) => w.ward_name) : []);
    };

    // --- UI: render bảng, form, modal, ... ---
    return (
        <div style={{marginTop: 24, maxWidth: 1400, marginLeft: "auto", marginRight: "auto"}}>
            {/* Đã xóa tiêu đề Quản lý khách hàng ở đây */}
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24}}>
                <h2 style={{color: "#333", fontWeight: 700, fontSize: "1.5rem", margin: 0}}>
                    Quản lý khách hàng
                </h2>
            </div>
            {loadingKH ? (
                <div style={{textAlign: "center", padding: "40px", fontSize: "1.1rem", color: "#666"}}>
                    Đang tải dữ liệu khách hàng...
                </div>
            ) : (
                <div>
                    <div style={{
                        marginBottom: 20,
                        padding: "20px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef"
                    }}>
                        <h3 style={{margin: "0 0 15px 0", color: "#495057", fontSize: "1.1rem"}}>
                            🔍 Tìm kiếm khách hàng
                        </h3>
                        <div style={{display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap"}}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nhập mã, tên, số điện thoại hoặc email để tìm kiếm"
                                style={{
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "0.9rem",
                                    flex: 1,
                                    minWidth: "300px"
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600"
                                }}
                            >
                                🔍 Tìm kiếm
                            </button>
                            <button
                                onClick={handleResetSearch}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600"
                                }}
                            >
                                🔄 Làm mới
                            </button>
                            <button
                                onClick={() => openModal()}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600"
                                }}
                                title="Thêm khách hàng mới"
                            >
                                ➕ Thêm
                            </button>
                        </div>
                        {searchTerm && (
                            <div style={{
                                marginTop: "10px",
                                padding: "8px 12px",
                                background: "#e3f2fd",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                                color: "#1976d2"
                            }}>
                                🔍 Đang tìm kiếm: "{searchTerm}"
                            </div>
                        )}
                    </div>
                    {/* Bảng khách hàng */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            background: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "none"
                        }}>
                            <thead>
                            <tr style={{background: "#007bff", color: "#fff"}}>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>ID</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Mã KH</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Tên khách hàng</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Ngày sinh</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Giới tính</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Số điện thoại</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Email</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Trạng thái</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem"}}>Địa chỉ</th>
                                <th style={{padding: "12px 10px", fontWeight: 700, textAlign: "left", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                    Thao tác
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {khachHangs.map((kh, idx) => (
                                <tr key={kh.idKhachHang} style={{background: idx % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid #dee2e6"}}>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>{kh.idKhachHang}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 600, fontSize: "0.9rem"}}>{kh.maKhachHang}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>{kh.tenKhachHang}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>{kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : ""}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>{kh.gioiTinh === true ? "Nam" : kh.gioiTinh === false ? "Nữ" : "Không xác định"}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>{kh.soDienThoai}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>{kh.email}</td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>
                                    <span style={{
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        background: kh.trangThai === "Hoạt động" ? "#d4edda" : "#f8d7da",
                                        color: kh.trangThai === "Hoạt động" ? "#155724" : "#721c24",
                                        display: "inline-block",
                                        userSelect: "none",
                                        minWidth: 90,
                                        textAlign: "center",
                                        border: "1px solid #ccc"
                                    }}>
                                        {kh.trangThai === 'Hoạt động' ? '✔️' : '⛔'} {kh.trangThai}
                                    </span>
                                    </td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem"}}>
                                        {kh.danhSachDiaChi && kh.danhSachDiaChi.length > 0 ? (
                                            (() => {
                                                const defaultAddress = kh.danhSachDiaChi.find((diaChi: any) => diaChi.macDinh === "Có");
                                                if (defaultAddress) {
                                                    return (
                                                        <div style={{
                                                            padding: "8px",
                                                            background: "#e3f2fd",
                                                            borderRadius: "4px",
                                                            border: "1px solid #bbdefb",
                                                            fontSize: "0.85rem"
                                                        }}>
                                                            <div style={{fontWeight: 600, marginBottom: "4px", color: "#1976d2"}}>
                                                                ⭐ Địa chỉ mặc định
                                                            </div>
                                                            <div style={{marginBottom: "4px"}}>
                                                                {defaultAddress.thanhPho}, {defaultAddress.quanHuyen}
                                                            </div>
                                                            <div style={{color: "#6c757d", fontSize: "0.8rem"}}>
                                                                {defaultAddress.xaPhuong}, {defaultAddress.ngoNgach}
                                                            </div>
                                                            {defaultAddress.ghiChu && (
                                                                <div style={{
                                                                    color: "#6c757d",
                                                                    fontSize: "0.8rem",
                                                                    fontStyle: "italic",
                                                                    marginTop: "4px"
                                                                }}>
                                                                    Ghi chú: {defaultAddress.ghiChu}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div style={{
                                                            padding: "8px",
                                                            background: "#f8f9fa",
                                                            borderRadius: "4px",
                                                            border: "1px solid #dee2e6",
                                                            fontSize: "0.85rem",
                                                            textAlign: "center"
                                                        }}>
                                                            <div style={{color: "#6c757d", fontStyle: "italic"}}>
                                                                Chưa có địa chỉ mặc định
                                                            </div>
                                                            <div style={{color: "#6c757d", fontSize: "0.8rem", marginTop: "4px"}}>
                                                                ({kh.danhSachDiaChi.length} địa chỉ khác)
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()
                                        ) : (
                                            <span style={{color: "#6c757d", fontStyle: "italic"}}>Chưa có địa chỉ</span>
                                        )}
                                    </td>
                                    <td style={{padding: "12px 10px", color: "#495057", fontWeight: 500, fontSize: "0.9rem", display: "flex", gap: 4, justifyContent: "flex-start", alignItems: "center"}}>
                                        <button
                                            onClick={() => openModal(kh)}
                                            style={{padding: "4px 8px", background: "#ffc107", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 2}}
                                            title="Sửa khách hàng"
                                        >
                                            <span role="img" aria-label="edit">✏️</span>
                                        </button>
                                        <button
                                            onClick={async () => await openAddressListModal(kh)}
                                            style={{padding: "4px 8px", background: "#17a2b8", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 2}}
                                            title="Quản lý địa chỉ"
                                        >
                                            <span role="img" aria-label="address">📍</span>
                                        </button>
                                        <button
                                            onClick={() => toggleTrangThai(kh.idKhachHang)}
                                            style={{
                                                padding: "4px 8px",
                                                background: kh.trangThai === "Hoạt động" ? "#28a745" : "#6c757d",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "0.95rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                transition: "all 0.3s ease"
                                            }}
                                            title={`Chuyển trạng thái từ "${kh.trangThai}" sang "${kh.trangThai === 'Hoạt động' ? 'Ngừng hoạt động' : 'Hoạt động'}"`}
                                        >
                                        <span role="img" aria-label="toggle-status">
                                            {kh.trangThai === 'Hoạt động' ? '🟢' : '⏸️'}
                                        </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Empty state */}
                    {khachHangs.length === 0 && (
                        <div style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#6c757d",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            marginTop: "20px"
                        }}>
                            <div style={{fontSize: "3rem", marginBottom: "16px"}}>👤</div>
                            <h3 style={{margin: "0 0 12px 0", color: "#495057"}}>
                                {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
                            </h3>
                            <p style={{margin: 0, fontSize: "1rem"}}>
                                {searchTerm ?
                                    `Không có khách hàng nào phù hợp với từ khóa "${searchTerm}"` :
                                    'Dữ liệu khách hàng sẽ hiển thị ở đây khi có thông tin.'
                                }
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={handleResetSearch}
                                    style={{
                                        marginTop: "15px",
                                        padding: "8px 16px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem"
                                    }}
                                >
                                    🔄 Xem tất cả khách hàng
                                </button>
                            )}
                        </div>
                    )}
                    {/* Kết quả tìm kiếm */}
                    {khachHangs.length > 0 && searchTerm && (
                        <div style={{
                            marginBottom: "15px",
                            padding: "10px 15px",
                            background: "#d4edda",
                            borderRadius: "6px",
                            border: "1px solid #c3e6cb",
                            fontSize: "0.9rem",
                            color: "#155724"
                        }}>
                            ✅ Tìm thấy {khachHangs.length} khách hàng phù hợp với từ khóa "{searchTerm}"
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        width: "90%",
                        maxWidth: "700px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        position: "relative",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                    }}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24}}>
                            <div style={{fontWeight: "600", color: "#1976d2"}}>
                                📍 Quản lý địa chỉ khách hàng
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddressListModal(false);
                                    setTimeout(() => openAddAddressModal(selectedCustomer.idKhachHang), 100);
                                }}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}
                            >
                                <span role="img" aria-label="add">➕</span>
                                Thêm địa chỉ
                            </button>
                        </div>
                        {selectedCustomer.danhSachDiaChi && selectedCustomer.danhSachDiaChi.length > 0 ? (
                            <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                                {selectedCustomer.danhSachDiaChi.map((address: any, index: number) => (
                                    <div key={address.idDiaChi} style={{
                                        padding: "20px",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "8px",
                                        background: address.macDinh === "Có" ? "#e3f2fd" : "#fff",
                                        position: "relative"
                                    }}>
                                        {address.macDinh === "Có" && (
                                            <div style={{
                                                position: "absolute",
                                                top: "10px",
                                                right: "10px",
                                                background: "#007bff",
                                                color: "#fff",
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600"
                                            }}>
                                                ⭐ Mặc định
                                            </div>
                                        )}
                                        <div style={{marginBottom: "10px"}}>
                                            <strong>Địa chỉ {index + 1}:</strong>
                                        </div>
                                        <div style={{marginBottom: "8px"}}>
                                            <strong>Thành phố:</strong> {address.thanhPho}
                                        </div>
                                        <div style={{marginBottom: "8px"}}>
                                            <strong>Quận/Huyện:</strong> {address.quanHuyen}
                                        </div>
                                        <div style={{marginBottom: "8px"}}>
                                            <strong>Xã/Phường:</strong> {address.xaPhuong}
                                        </div>
                                        <div style={{marginBottom: "8px"}}>
                                            <strong>Ngõ/Ngách:</strong> {address.ngoNgach}
                                        </div>
                                        {address.ghiChu && (
                                            <div style={{marginBottom: "8px"}}>
                                                <strong>Ghi chú:</strong> {address.ghiChu}
                                            </div>
                                        )}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            marginTop: "15px",
                                            gap: "10px"
                                        }}>
                                            {address.macDinh !== "Có" && (
                                                <button
                                                    onClick={() => setDefaultAddress(address.idDiaChi, selectedCustomer.idKhachHang)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#28a745",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "0.9rem",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    ⭐ Đặt làm mặc định
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditAddressModal(address, selectedCustomer.idKhachHang)}
                                                style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#ffc107",
                                                    color: "#333",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "0.9rem",
                                                    fontWeight: "600"
                                                }}
                                                title="Sửa địa chỉ"
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(address.idDiaChi, selectedCustomer.idKhachHang)}
                                                style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: address.macDinh === "Có" ? "#6c757d" : "#dc3545",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: address.macDinh === "Có" ? "not-allowed" : "pointer",
                                                    fontSize: "0.9rem",
                                                    fontWeight: "600",
                                                    opacity: address.macDinh === "Có" ? 0.6 : 1
                                                }}
                                                disabled={address.macDinh === "Có"}
                                                title={address.macDinh === "Có" ? "Không thể xóa địa chỉ mặc định" : "Xóa địa chỉ"}
                                            >
                                                ❌ Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#6c757d",
                                background: "#f8f9fa",
                                borderRadius: "8px"
                            }}>
                                <div style={{fontSize: "3rem", marginBottom: "16px"}}>📍</div>
                                <h3 style={{margin: "0 0 12px 0", color: "#495057"}}>Chưa có địa chỉ nào</h3>
                                <p style={{margin: 0, fontSize: "1rem"}}>Khách hàng này chưa có địa chỉ nào được thêm.</p>
                            </div>
                        )}
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop: "1px solid #eee"
                        }}>
                            <button
                                onClick={closeAddressListModal}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600"
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal thêm/sửa khách hàng */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        width: "90%",
                        maxWidth: "600px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        position: "relative",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                    }}>
                        <button
                            onClick={closeModal}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "20px",
                                fontSize: "24px",
                                cursor: "pointer",
                                background: "none",
                                border: "none",
                                color: "#666",
                                fontWeight: "bold"
                            }}
                        >
                            ×
                        </button>
                        <h2 style={{
                            margin: "0 0 25px 0",
                            color: "#333",
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            textAlign: "center"
                        }}>
                            {isEditing ? '✏️ Sửa khách hàng' : '➕ Thêm khách hàng mới'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Mã khách hàng *
                                    </label>
                                    <input
                                        type="text"
                                        name="maKhachHang"
                                        value={currentKhachHang.maKhachHang}
                                        onChange={handleInputChange}
                                        onBlur={e => validateField(e.target.name, e.target.value)}
                                        readOnly={isEditing}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: validationErrors.maKhachHang ? "1px solid #dc3545" : "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "0.9rem",
                                            boxSizing: "border-box",
                                            backgroundColor: isEditing ? "#f8f9fa" : "white",
                                            color: isEditing ? "#6c757d" : "#333"
                                        }}
                                        placeholder="Ví dụ: KH001"
                                    />
                                    {validationErrors.maKhachHang && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.maKhachHang}
                                        </div>
                                    )}
                                    {!validationErrors.maKhachHang && currentKhachHang.maKhachHang && (
                                        <div style={{color: "#28a745", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ✅ Mã khách hàng hợp lệ
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Tên khách hàng *
                                    </label>
                                    <input
                                        type="text"
                                        name="tenKhachHang"
                                        value={currentKhachHang.tenKhachHang}
                                        onChange={handleInputChange}
                                        onBlur={e => validateField(e.target.name, e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: validationErrors.tenKhachHang ? "1px solid #dc3545" : "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "0.9rem",
                                            boxSizing: "border-box"
                                        }}
                                        placeholder="Nhập tên khách hàng"
                                    />
                                    {validationErrors.tenKhachHang && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.tenKhachHang}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    name="ngaySinh"
                                    value={currentKhachHang.ngaySinh}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "0.9rem",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Chọn ngày sinh"
                                />
                            </div>
                            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Giới tính
                                    </label>
                                    <div style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                        <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                                            <input
                                                type="radio"
                                                name="gioiTinh"
                                                value="true"
                                                checked={currentKhachHang.gioiTinh === true}
                                                onChange={handleInputChange}
                                                style={{margin: 0}}
                                            />
                                            <span>Nam</span>
                                        </label>
                                        <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                                            <input
                                                type="radio"
                                                name="gioiTinh"
                                                value="false"
                                                checked={currentKhachHang.gioiTinh === false}
                                                onChange={handleInputChange}
                                                style={{margin: 0}}
                                            />
                                            <span>Nữ</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Số điện thoại *
                                    </label>
                                    <input
                                        type="tel"
                                        name="soDienThoai"
                                        value={currentKhachHang.soDienThoai}
                                        onChange={handleInputChange}
                                        onBlur={e => validateField(e.target.name, e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: validationErrors.soDienThoai ? "1px solid #dc3545" : "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "0.9rem",
                                            boxSizing: "border-box"
                                        }}
                                        placeholder="Ví dụ: 0123456789"
                                    />
                                    {validationErrors.soDienThoai && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.soDienThoai}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={currentKhachHang.email}
                                    onChange={handleInputChange}
                                    onBlur={e => validateField(e.target.name, e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: validationErrors.email ? "1px solid #dc3545" : "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "0.9rem",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Ví dụ: example@gmail.com"
                                />
                                {validationErrors.email && (
                                    <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                        ❌ {validationErrors.email}
                                    </div>
                                )}
                            </div>
                            {!isEditing && (
                                <>
                                    <div style={{fontWeight: 600, color: "#1976d2", marginTop: 10, marginBottom: 10}}>Thông tin địa chỉ</div>
                                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                                        <div>
                                            <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                                Thành phố *
                                            </label>
                                            <select
                                                name="thanhPho"
                                                value={currentAddress.thanhPho}
                                                onChange={handleProvinceChange}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: validationErrors.thanhPho ? "1px solid #dc3545" : "1px solid #ddd",
                                                    borderRadius: "6px",
                                                    fontSize: "0.9rem",
                                                    boxSizing: "border-box"
                                                }}
                                            >
                                                <option value="">Chọn tỉnh/thành</option>
                                                {addressData.map((p) => (
                                                    <option key={p.province_id} value={p.province_name}>{p.province_name}</option>
                                                ))}
                                            </select>
                                            {validationErrors.thanhPho && (
                                                <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                    ❌ {validationErrors.thanhPho}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                                Quận/Huyện *
                                            </label>
                                            <select
                                                name="quanHuyen"
                                                value={currentAddress.quanHuyen}
                                                onChange={handleDistrictChange}
                                                disabled={!filteredDistricts.length}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: validationErrors.quanHuyen ? "1px solid #dc3545" : "1px solid #ddd",
                                                    borderRadius: "6px",
                                                    fontSize: "0.9rem",
                                                    boxSizing: "border-box"
                                                }}
                                            >
                                                <option value="">Chọn quận/huyện</option>
                                                {filteredDistricts.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            {validationErrors.quanHuyen && (
                                                <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                    ❌ {validationErrors.quanHuyen}
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
                                                    boxSizing: "border-box"
                                                }}
                                            >
                                                <option value="">Chọn phường/xã</option>
                                                {filteredWards.map((w) => (
                                                    <option key={w} value={w}>{w}</option>
                                                ))}
                                            </select>
                                            {validationErrors.xaPhuong && (
                                                <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                    ❌ {validationErrors.xaPhuong}
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
                                                    padding: "12px",
                                                    border: validationErrors.ngoNgach ? "1px solid #dc3545" : "1px solid #ddd",
                                                    borderRadius: "6px",
                                                    fontSize: "0.9rem",
                                                    boxSizing: "border-box"
                                                }}
                                                placeholder="Nhập ngõ/ngách"
                                            />
                                            {validationErrors.ngoNgach && (
                                                <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                                    ❌ {validationErrors.ngoNgach}
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
                                            style={{width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box"}}
                                            placeholder="Ghi chú thêm (nếu có)"
                                        />
                                    </div>
                                    <div>
                                        <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                            Đặt làm mặc định
                                        </label>
                                        <select
                                            name="macDinh"
                                            value={currentAddress.macDinh}
                                            onChange={handleAddressInputChange}
                                            style={{width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box"}}
                                        >
                                            <option value="Không">Không</option>
                                            <option value="Có">Có</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div style={{
                                display: "flex",
                                gap: "15px",
                                justifyContent: "flex-end",
                                marginTop: "20px",
                                paddingTop: "20px",
                                borderTop: "1px solid #eee"
                            }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        fontWeight: "600"
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingSubmit}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: loadingSubmit ? "#6c757d" : "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: loadingSubmit ? "not-allowed" : "pointer",
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        opacity: loadingSubmit ? 0.7 : 1
                                    }}
                                >
                                    {loadingSubmit ? '⏳ Đang lưu...' : (isEditing ? '💾 Cập nhật' : '➕ Thêm mới')}
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        width: "90%",
                        maxWidth: "600px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        position: "relative",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                    }}>
                        <button
                            onClick={closeAddressModal}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "20px",
                                fontSize: "24px",
                                cursor: "pointer",
                                background: "none",
                                border: "none",
                                color: "#666",
                                fontWeight: "bold"
                            }}
                        >
                            ×
                        </button>
                        <h2 style={{
                            margin: "0 0 25px 0",
                            color: "#333",
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            textAlign: "center"
                        }}>
                            {isEditingAddress ? '✏️ Sửa địa chỉ' : '➕ Thêm địa chỉ mới'}
                        </h2>
                        <form onSubmit={handleAddressSubmit} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Thành phố *
                                    </label>
                                    <select
                                        name="thanhPho"
                                        value={currentAddress.thanhPho}
                                        onChange={handleProvinceChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: validationErrors.thanhPho ? "1px solid #dc3545" : "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "0.9rem",
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        <option value="">Chọn tỉnh/thành</option>
                                        {addressData.map((p) => (
                                            <option key={p.province_id} value={p.province_name}>{p.province_name}</option>
                                        ))}
                                    </select>
                                    {validationErrors.thanhPho && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.thanhPho}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "0.9rem"}}>
                                        Quận/Huyện *
                                    </label>
                                    <select
                                        name="quanHuyen"
                                        value={currentAddress.quanHuyen}
                                        onChange={handleDistrictChange}
                                        disabled={!filteredDistricts.length}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: validationErrors.quanHuyen ? "1px solid #dc3545" : "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "0.9rem",
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {filteredDistricts.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    {validationErrors.quanHuyen && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.quanHuyen}
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
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {filteredWards.map((w) => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                    {validationErrors.xaPhuong && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.xaPhuong}
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
                                            padding: "12px",
                                            border: validationErrors.ngoNgach ? "1px solid #dc3545" : "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "0.9rem",
                                            boxSizing: "border-box"
                                        }}
                                        placeholder="Nhập ngõ/ngách"
                                    />
                                    {validationErrors.ngoNgach && (
                                        <div style={{color: "#dc3545", fontSize: "0.8rem", marginTop: "4px"}}>
                                            ❌ {validationErrors.ngoNgach}
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
                                    style={{width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box"}}
                                    placeholder="Ghi chú thêm (nếu có)"
                                />
                            </div>
                            <div style={{display: "flex", gap: "15px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee"}}>
                                <button
                                    type="button"
                                    onClick={closeAddressModal}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        fontWeight: "600"
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingAddress}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: loadingAddress ? "#6c757d" : "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: loadingAddress ? "not-allowed" : "pointer",
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        opacity: loadingAddress ? 0.7 : 1
                                    }}
                                >
                                    {loadingAddress ? '⏳ Đang lưu...' : (isEditingAddress ? '💾 Cập nhật' : '➕ Thêm mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}