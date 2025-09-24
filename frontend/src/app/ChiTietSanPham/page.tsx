"use client";
import React, { useEffect, useState } from "react";
import ProductDetailTable from './ProductDetailTable';
import AdminLayout from "../../component/Admin-Layout";
import { useRouter } from 'next/navigation';

export default function ChiTietSanPhamPage() {
  const [userRole, setUserRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserRole(userData.vaiTro || '');
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      router.push('/dang-nhap');
    }
  }, [router]);

  return (
    <AdminLayout activeMenu="products" onMenuChangeAction={() => {}} pageTitle="Chi tiết sản phẩm">
      <ProductDetailTable userRole={userRole} />
    </AdminLayout>
  );
}