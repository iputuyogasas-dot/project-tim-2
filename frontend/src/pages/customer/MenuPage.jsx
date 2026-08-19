import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';

const SESSION_KEY = 'table_session';
const PASTEL_COLORS = ['#F7D9C4', '#F4E6C1', '#CDEBF7', '#E8D9F3', '#FBD9E4', '#FADFC0', '#D7EFD1'];

export default function MenuPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [tableData, setTableData] = useState(null);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [menus, setMenus] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('cart') || '[]'); } catch { return []; }
    });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tableId = searchParams.get('table');
        const token = searchParams.get('token');
        if (!tableId || !token) {
            setError('Link QR Code tidak valid. Silakan scan QR Meja Anda.');
            setLoading(false);
            return;
        }
        const verify = async () => {
            try {
                const res = await api.get(`/tables/verify?table=${tableId}&token=${token}`);
                setTableData(res.data.data);
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ table_id: tableId, token }));
            } catch {
                setError('Meja tidak ditemukan atau tidak aktif.');
            } finally { setLoading(false); }
        };
        verify();
    }, [searchParams]);

    useEffect(() => {
        if (!tableData) return;
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => { });
        api.get('/menus?available=true').then(r => setMenus(r.data.data)).catch(() => { });
    }, [tableData]);

    useEffect(() => { sessionStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

    const addToCart = (menu, e) => {
        if (e) e.stopPropagation();
        setCart(prev => {
            const existing = prev.find(i => i.menu_id === menu.id);
            if (existing) return prev.map(i => i.menu_id === menu.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { menu_id: menu.id, name: menu.name, price: menu.price, image_url: menu.image_url, quantity: 1, note: '' }];
        });
    };

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    const filteredMenus = menus.filter(m => {
        const matchCat = !activeCategory || m.category_id === activeCategory;
        const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) return <div className="loading">⏳ Memverifikasi Meja Anda...</div>;
    if (error) return (
        <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🚫</div>
            <h2 style={{ color: 'var(--accent-red)', marginBottom: '8px', fontWeight: 700 }}>Akses Ditolak</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', paddingBottom: '90px' }}>
            {/* Topbar Pill */}
            <div className="topbar">
                <div className="topbar-inner">
                    <div>
                        <div className="topbar-title">🍃 Resto Food & Drink</div>
                        <div className="topbar-table">📍 Meja Nomor {tableData?.table_number}</div>
                    </div>
                    {cartCount > 0 && (
                        <button className="cart-btn" onClick={() => navigate('/cart')}>
                            🛒 <span className="cart-count">{cartCount}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="container">
                {/* Banner Promo per style.json */}
                <div className="promo-banner">
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, fontWeight: 600 }}>Spesial Meja #{tableData?.table_number}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>Pesan Makanan Praktis & Cepat</div>
                    <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Pilih menu favorit Anda dan langsung pesan dari meja.</div>
                </div>

                {/* Search Bar (Pill Input per style.json) */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <input
                        className="form-input"
                        placeholder="🔍 Cari makanan, minuman, atau snack..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Pills (Pastel Backgrounds per style.json) */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px', scrollbarWidth: 'none' }}>
                    <button
                        className={`cat-pill ${!activeCategory ? 'active' : ''}`}
                        style={{ backgroundColor: !activeCategory ? 'var(--primary)' : 'var(--bg-surface)', color: !activeCategory ? '#FFF' : 'var(--text-primary)' }}
                        onClick={() => setActiveCategory(null)}
                    >
                        🍽️ Semua
                    </button>
                    {categories.map((c, idx) => {
                        const pastelBg = PASTEL_COLORS[idx % PASTEL_COLORS.length];
                        const isActive = activeCategory === c.id;
                        return (
                            <button
                                key={c.id}
                                className={`cat-pill ${isActive ? 'active' : ''}`}
                                style={{
                                    backgroundColor: isActive ? 'var(--primary)' : pastelBg,
                                    color: isActive ? '#FFF' : 'var(--text-primary)'
                                }}
                                onClick={() => setActiveCategory(c.id)}
                            >
                                {c.name}
                            </button>
                        );
                    })}
                </div>

                {/* Product Grid per style.json */}
                {filteredMenus.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🥗</div>
                        <p>Menu tidak ditemukan</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {filteredMenus.map(menu => {
                            const inCart = cart.find(i => i.menu_id === menu.id);
                            return (
                                <div key={menu.id} className="card" style={{ padding: '14px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        {/* Product Image */}
                                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                                            {menu.image_url ? (
                                                <img
                                                    src={menu.image_url}
                                                    alt={menu.name}
                                                    style={{ width: '100%', height: '125px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                                />
                                            ) : (
                                                <div style={{ height: '125px', backgroundColor: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                                                    🍱
                                                </div>
                                            )}
                                            {/* Add Circle Button Overlap per style.json productCard */}
                                            <button
                                                className="btn-icon-circle"
                                                style={{ position: 'absolute', bottom: '-10px', right: '8px', boxShadow: 'var(--shadow-md)' }}
                                                onClick={(e) => addToCart(menu, e)}
                                                title="Tambah ke keranjang"
                                            >
                                                {inCart ? `${inCart.quantity}` : '+'}
                                            </button>
                                        </div>

                                        {/* Product Name */}
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                                            {menu.name}
                                        </div>
                                        {/* Description */}
                                        {menu.description && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {menu.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Text per style.json (vibrant green #33A852) */}
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.95rem' }}>
                                            Rp {Number(menu.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Floating Bar */}
            {cartCount > 0 && (
                <div style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '480px', zIndex: 200 }}>
                    <button className="btn btn-secondary btn-lg" style={{ boxShadow: 'var(--shadow-md)' }} onClick={() => navigate('/cart')}>
                        🛒 Lihat Keranjang ({cartCount} item)
                    </button>
                </div>
            )}
        </div>
    );
}
