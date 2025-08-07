"use client";
import React, { useState } from 'react';
import AdminLayout from '../../../component/Admin-Layout';
import CounterInvoiceList from './CounterInvoiceList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OfflineInvoicesPage() {
    const [activeMenu, setActiveMenu] = useState('invoices');
    return (
        <AdminLayout activeMenu="invoices" onMenuChangeAction={setActiveMenu} pageTitle="Hóa đơn tại quầy">
            <CounterInvoiceList />
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