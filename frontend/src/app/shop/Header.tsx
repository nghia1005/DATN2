import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';

interface HeaderProps {
  userName: string;
  showWelcome: boolean;
  setShowWelcome: (v: boolean) => void;
  setShowCart: (v: boolean) => void;
  setShowCheckout: (v: boolean) => void;
  setShowThankYou: (v: boolean) => void;
  showCart: boolean;
  showCheckout: boolean;
  showThankYou: boolean;
  cart: Array<{ product: any; quantity: number }>;
  router: any;
  handleLogout: () => void;
  search: string;
  setSearch: (v: string) => void;
  isClient: boolean;
  onOpenOrderLookup: () => void;
  showOrderLookupModal: boolean;
  activeLookup?: boolean;
}

export default function Header({ userName, showWelcome, setShowWelcome, setShowCart, setShowCheckout, setShowThankYou, showCart, showCheckout, showThankYou, cart, router, handleLogout, search, setSearch, isClient, onOpenOrderLookup, showOrderLookupModal, activeLookup }: HeaderProps) {
  const pathname = typeof window !== 'undefined' ? usePathname() : undefined;
  const isShopRoute = pathname ? pathname.startsWith('/shop') : true;
  const isLookupRoute = pathname ? pathname.startsWith('/tra-cuu-don-hang') : false;
  const lookupActive = typeof activeLookup === 'boolean' ? activeLookup : isLookupRoute;
  const isMainSection = isShopRoute && !showCart && !showCheckout && !showThankYou;
  const homeActive = isShopRoute && isMainSection && showWelcome;
  const productsActive = isShopRoute && isMainSection && !showWelcome;
  const cartActive = isShopRoute && showCart;
  const normalized = (userName || '').trim().toLowerCase();
  const isLoggedIn = isClient && !!normalized && normalized !== 'tài khoản' && normalized !== 'tai khoan';

  // Function để đọc giỏ hàng từ localStorage
  const getCartFromLocalStorage = (): Array<{ product: any; quantity: number }> => {
    if (typeof window === 'undefined') return [];
    
    try {
      const savedCart = localStorage.getItem('shop_cart');
      console.log('🛒 Header: Reading cart from localStorage:', savedCart);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 Header: Parsed cart:', parsedCart);
        return parsedCart;
      }
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
    }
    return [];
  };

  // Luôn đọc từ localStorage để đảm bảo consistency
  const displayCart = getCartFromLocalStorage();
  
  // Debug logging
  console.log('🛒 Header: Current state - isShopRoute:', isShopRoute, 'cart prop:', cart, 'displayCart:', displayCart);
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
          }
        }
      `}</style>
      <div style={{
        width: '100%',
        background: '#f8edca',
        borderRadius: 18,
        boxShadow: '0 2px 12px rgba(181,157,58,0.08)',
        margin: '0 auto',
        marginTop: 18,
        marginBottom: 24,
        maxWidth: 1400,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        zIndex: 20,
        flexWrap: 'nowrap',
        overflow: 'hidden'
      }}>
      {/* Logo và tên shop */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        minWidth: '160px',
        flexShrink: 0
      }}>
        <img 
          src="/logo-login.png" 
          alt="SoleKing Store" 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            boxShadow: '0 2px 8px #b59d3a22',
            flexShrink: 0
          }} 
        />
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 800, 
          color: '#b59d3a', 
          letterSpacing: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          SoleKing Store
        </span>
      </div>
          {/* Thanh tìm kiếm */}
      <div style={{ 
        flex: '1 1 auto', 
        minWidth: '180px',
        maxWidth: '350px',
        margin: '0 8px',
        display: 'flex', 
        alignItems: 'center', 
        background: '#fffbe7', 
        borderRadius: 18, 
        border: '1.5px solid #e0c97a', 
        padding: '0 12px', 
        height: 36, 
        boxShadow: '0 1px 4px rgba(181,157,58,0.04)',
        flexShrink: 1,
        overflow: 'hidden'
      }}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ 
            border: 'none', 
            background: 'transparent', 
            width: '100%', 
            fontSize: '0.95rem', 
            outline: 'none', 
            color: '#8a7a2a',
            padding: 0,
            margin: 0
          }}
        />
        <SearchIcon style={{ color: '#b59d3a', fontSize: '1.1rem', cursor: 'pointer', flexShrink: 0 }} />
      </div>
          {/* Menu */}
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            flexShrink: 1,
            overflow: 'hidden'
          }}>
              <button style={{
                padding: '6px 14px',
                borderRadius: 18,
                border: '1.5px solid #b59d3a',
                background: homeActive ? '#b59d3a' : '#fff',
                color: homeActive ? '#fff' : '#b59d3a',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
                onClick={() => { if (!isShopRoute) { router.push('/shop?tab=home'); } else { setShowThankYou(false); setShowCheckout(false); setShowCart(false); setShowWelcome(true); } }}
              >
                TRANG CHỦ
              </button>
              <button style={{
                padding: '6px 14px',
                borderRadius: 18,
                border: '1.5px solid #b59d3a',
                background: productsActive ? '#b59d3a' : '#fff',
                color: productsActive ? '#fff' : '#b59d3a',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
                onClick={() => { if (!isShopRoute) { router.push('/shop?tab=products'); } else { setShowThankYou(false); setShowCheckout(false); setShowCart(false); setShowWelcome(false); } }}
              >
                SẢN PHẨM
              </button>
              <button style={{
                padding: '6px 14px',
                borderRadius: 18,
                border: '1.5px solid #b59d3a',
                background: lookupActive ? '#b59d3a' : '#fff',
                color: lookupActive ? '#fff' : '#b59d3a',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
                onClick={() => router.push('/tra-cuu-don-hang')}
              >
                TRA CỨU
              </button>
          </div>
          {/* Tài khoản, giỏ hàng, đăng xuất */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 24 }}>
              <button
                  style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      height: '36px',
                      minWidth: '120px',
                      borderRadius: 20,
                      border: '1.5px solid #b59d3a',
                      background: cartActive ? '#b59d3a' : '#fff',
                      color: cartActive ? '#fff' : '#b59d3a',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                  }}
                  onClick={() => { if (!isShopRoute) { router.push('/shop?tab=cart'); } else { setShowThankYou(false); setShowCheckout(false); setShowWelcome(false); setShowCart(true); } }}
              >
                  <Badge badgeContent={displayCart.reduce((sum, item) => sum + item.quantity, 0)} color="error">
                      <ShoppingCartIcon style={{ fontSize: 20 }} />
                  </Badge>
                  GIỎ HÀNG
              </button>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  color: '#b59d3a', 
                  fontWeight: 600, 
                  fontSize: '0.95rem', 
                  cursor: 'pointer', 
                  transition: 'color 0.2s', 
                  marginLeft: 0,
                  whiteSpace: 'nowrap'
                }} 
                onClick={() => { if (!isLoggedIn) router.push('/login'); }}
              >
                <AccountCircleIcon style={{ fontSize: 20 }} />
                {isClient ? userName : 'TÀI KHOẢN'}
              </div>
              {isLoggedIn && (
                <button 
                  style={{ 
                    padding: '6px 16px', 
                    borderRadius: 10, 
                    border: '1.5px solid #e57373', 
                    background: '#fff0f0', 
                    color: '#e53935', 
                    fontWeight: 700, 
                    fontSize: '0.9rem', 
                    transition: 'all 0.2s', 
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }} 
                  onClick={handleLogout}
                >
                  ĐĂNG XUẤT
                </button>
              )}
      </div>
    </div>
    </>
  );
} 