"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/component/Admin-Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InvoicesPage() {
    const router = useRouter();
    const [activeMenu, setActiveMenu] = React.useState('invoices');

    return (
        <AdminLayout activeMenu="invoices" onMenuChangeAction={setActiveMenu} pageTitle="Quản lý hóa đơn">

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </AdminLayout>
    );
}