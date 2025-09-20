"use client";
import React, { useState } from 'react';
import AdminLayout from '../../../component/Admin-Layout';
import OnlineCounterInvoiceList from './OnlineCounterInvoiceList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OnlineInvoicesPage() {
    const [activeMenu, setActiveMenu] = useState('invoices');
    return (
        <AdminLayout activeMenu="invoices" onMenuChangeAction={setActiveMenu} pageTitle="Hóa đơn online">
            <OnlineCounterInvoiceList />
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