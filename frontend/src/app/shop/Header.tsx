import React from 'react';
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
  cart: Array<{ product: any; quantity: number }>;
  router: any;
  handleLogout: () => void;
  search: string;
  setSearch: (v: string) => void;
  isClient: boolean;
  onOpenOrderLookup: () => void;
}

export default function Header({ userName, showWelcome, setShowWelcome, setShowCart, cart, router, handleLogout, search, setSearch, isClient, onOpenOrderLookup }: HeaderProps) {
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
        padding: '18px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 20
      }}>
      {/* Logo và tên shop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/logo-login.png" alt="SoleKing Store" style={{ width: 48, height: 48, borderRadius: 12, boxShadow: '0 2px 8px #b59d3a22' }} />
        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#b59d3a', letterSpacing: 1 }}>SoleKing Store</span>
      </div>
      {/* Thanh tìm kiếm */}
      <div style={{ flex: 1, margin: '0 32px', display: 'flex', alignItems: 'center', background: '#fffbe7', borderRadius: 24, border: '1.5px solid #e0c97a', padding: '0 18px', height: 44, boxShadow: '0 1px 4px rgba(181,157,58,0.04)' }}>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '1.1rem', outline: 'none', color: '#8a7a2a' }}
        />
        <SearchIcon style={{ color: '#b59d3a', fontSize: '1.3rem', cursor: 'pointer' }} />
      </div>
      {/* Menu */}
      <div style={{ display: 'flex', gap: 18 }}>
        <button style={{ padding: '8px 28px', borderRadius: 22, border: '1.5px solid #b59d3a', background: showWelcome ? '#b59d3a' : '#fff', color: showWelcome ? '#fff' : '#b59d3a', fontWeight: 700, fontSize: '1.05rem', transition: 'background 0.2s, color 0.2s', cursor: 'pointer' }} onClick={() => { setShowWelcome(true); }}>TRANG CHỦ</button>
        <button style={{ padding: '8px 28px', borderRadius: 22, border: '1.5px solid #b59d3a', background: !showWelcome ? '#b59d3a' : '#fff', color: !showWelcome ? '#fff' : '#b59d3a', fontWeight: 700, fontSize: '1.05rem', transition: 'background 0.2s, color 0.2s', cursor: 'pointer' }} onClick={() => { setShowWelcome(false); }}>SẢN PHẨM</button>

        <button style={{ padding: '8px 24px', borderRadius: 22, border: '1.5px solid #b59d3a', background: '#fff', color: '#b59d3a', fontWeight: 700, fontSize: '1.05rem', transition: 'background 0.2s, color 0.2s', cursor: 'pointer' }} onClick={onOpenOrderLookup}>TRA CỨU</button>
      </div>
      {/* Tài khoản, giỏ hàng, đăng xuất */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b59d3a', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { if (setShowCart && !showWelcome) setShowCart(true); }}>
          <Badge badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} color="error">
            <ShoppingCartIcon style={{ fontSize: 22 }} />
          </Badge> GIỎ HÀNG
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b59d3a', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', transition: 'color 0.2s', marginLeft: 0 }} onClick={() => router.push('/login')}>
          <AccountCircleIcon style={{ fontSize: 22 }} /> {isClient ? userName : 'TÀI KHOẢN'}
        </div>
        <button style={{ marginLeft: 0, padding: '8px 24px', borderRadius: 10, border: '1.5px solid #e57373', background: '#fff0f0', color: '#e53935', fontWeight: 700, fontSize: '1.05rem', transition: 'background 0.2s, color 0.2s', cursor: 'pointer' }} onClick={handleLogout}>ĐĂNG XUẤT</button>
      </div>
    </div>
    </>
  );
} 