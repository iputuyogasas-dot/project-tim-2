import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/orders', label: 'Pesanan', icon: '📋' },
    { to: '/admin/menus', label: 'Menu', icon: '🍽️' },
    { to: '/admin/categories', label: 'Kategori', icon: '🏷️' },
    { to: '/admin/tables', label: 'Meja & QR', icon: '📱' },
    { to: '/admin/bank-accounts', label: 'Rekening Bank', icon: '🏦' },
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
                <div className="sidebar-logo">🍽️ Admin Panel</div>
                <nav className="sidebar-nav">
                    {NAV.map(({ to, label, icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                        >
                            <span>{icon}</span> {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
                        👤 {admin?.full_name}
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444', width: '100%' }} onClick={handleLogout}>
                        Keluar
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
