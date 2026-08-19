import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Plus, Utensils, AlertCircle } from 'lucide-react';
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

    if (loading) return <div className="loading">Memverifikasi Meja Anda...</div>;
    if (error) return (
        <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#FDE8E8', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--accent-red)' }}>
                <AlertCircle size={32} />
            </div>
            <h2 style={{ color: 'var(--accent-red)', marginBottom: '8px', fontWeight: 700 }}>Akses Ditolak</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', paddingBottom: '90px' }}>
            {/* Topbar Pill */}
            <div className="topbar">
                <div className="topbar-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--accent-green-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <Utensils size={20} />
                        </div>
                        <div>
                            <div className="topbar-title">Resto Food & Drink</div>
                            <div className="topbar-table">Meja Nomor {tableData?.table_number}</div>
                        </div>
                    </div>
                    {cartCount > 0 && (
                        <button className="cart-btn" onClick={() => navigate('/cart')}>
                            <ShoppingBag size={18} />
                            <span className="cart-count">{cartCount}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="container">
                {/* Promo Banner */}
                <div className="promo-banner">
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, fontWeight: 600 }}>Pemesanan Meja #{tableData?.table_number}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>Pesan Makanan & Minuman</div>
                    <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Pilih menu favorit Anda dan langsung kirim pesanan ke dapur.</div>
                </div>

                {/* Search Bar */}
                <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                        className="form-input"
                        placeholder="Cari makanan, minuman, atau snack..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px', scrollbarWidth: 'none' }}>
                    <button
                        className={`cat-pill ${!activeCategory ? 'active' : ''}`}
                        style={{ backgroundColor: !activeCategory ? 'var(--primary)' : 'var(--bg-surface)', color: !activeCategory ? '#FFF' : 'var(--text-primary)' }}
                        onClick={() => setActiveCategory(null)}
                    >
                        Semua Menu
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

                {/* Product Grid */}
                {filteredMenus.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--bg-surface-muted)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: 'var(--text-muted)' }}>
                            <Utensils size={28} />
                        </div>
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
                                                <div style={{ height: '125px', backgroundColor: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                    <Utensils size={32} />
                                                </div>
                                            )}
                                            {/* Add Circle Button */}
                                            <button
                                                className="btn-icon-circle"
                                                style={{ position: 'absolute', bottom: '-10px', right: '8px', boxShadow: 'var(--shadow-md)' }}
                                                onClick={(e) => addToCart(menu, e)}
                                                title="Tambah ke keranjang"
                                            >
                                                {inCart ? `${inCart.quantity}` : <Plus size={18} />}
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

                                    {/* Price Text */}
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
                    <button className="btn btn-secondary btn-lg" style={{ boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => navigate('/cart')}>
                        <ShoppingBag size={20} />
                        Lihat Keranjang ({cartCount} item)
                    </button>
                </div>
            )}
        </div>
    );
}
