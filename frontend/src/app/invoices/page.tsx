"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../component/Admin-Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InvoicesPage() {
    const [activeMenu, setActiveMenu] = useState('invoices');
    const router = useRouter();

    return (
        <AdminLayout activeMenu="invoices" onMenuChangeAction={setActiveMenu} pageTitle="Quản lý hóa đơn">
            <div style={{
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
                minHeight: '60vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '20px',
                margin: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    color: '#b59d3a',
                    margin: '0 0 20px 0',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(181, 157, 58, 0.1)'
                }}>
                    Chọn loại hóa đơn cần quản lý
                </h1>
                
                <div style={{
                    display: 'flex',
                    gap: '50px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    {/* Hóa đơn Online */}
                    <div
                        onClick={() => router.push('/invoices/online')}
                        style={{
                            width: '320px',
                            height: '220px',
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            borderRadius: '20px',
                            padding: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(25, 118, 210, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(25, 118, 210, 0.3)';
                        }}
                    >
                        <div style={{ 
                            fontSize: '56px', 
                            marginBottom: '20px',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}>🛒</div>
                        <h2 style={{ 
                            margin: '0 0 16px 0', 
                            fontSize: '26px', 
                            fontWeight: '700',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            Hóa đơn Online
                        </h2>
                        <p style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            opacity: 0.95,
                            lineHeight: '1.4'
                        }}>
                            Quản lý đơn hàng từ website
                        </p>
                    </div>

                    {/* Hóa đơn Offline */}
                    <div
                        onClick={() => router.push('/invoices/ofline')}
                        style={{
                            width: '320px',
                            height: '220px',
                            background: 'linear-gradient(135deg, #b59d3a 0%, #8b7a2e 100%)',
                            borderRadius: '20px',
                            padding: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(181, 157, 58, 0.3)',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(181, 157, 58, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(181, 157, 58, 0.3)';
                        }}
                    >
                        <div style={{ 
                            fontSize: '56px', 
                            marginBottom: '20px',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}>🏪</div>
                        <h2 style={{ 
                            margin: '0 0 16px 0', 
                            fontSize: '26px', 
                            fontWeight: '700',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            Hóa đơn tại quầy
                        </h2>
                        <p style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            opacity: 0.95,
                            lineHeight: '1.4'
                        }}>
                            Quản lý đơn hàng tại cửa hàng
                        </p>
                    </div>
                </div>
            </div>
            
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