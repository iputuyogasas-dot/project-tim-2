import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Utensils, Tag, QrCode, CreditCard, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
    { to: '/admin/menus', label: 'Menu', icon: Utensils },
    { to: '/admin/categories', label: 'Kategori', icon: Tag },
    { to: '/admin/tables', label: 'Meja & QR', icon: QrCode },
    { to: '/admin/bank-accounts', label: 'Rekening Bank', icon: CreditCard },
];

export default function AdminLayout() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-green-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Utensils size={18} />
                    </div>
                    Admin Panel
                </div>
                <nav className="sidebar-nav">
                    {NAV.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                        >
                            <Icon size={18} /> {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} /> {admin?.full_name || 'Admin'}
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)', borderColor: 'var(--border)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleLogout}>
                        <LogOut size={14} /> Keluar
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
