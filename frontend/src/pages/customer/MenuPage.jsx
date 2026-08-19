import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';

const CartContext = React.createContext(null);
export const useCart = () => React.useContext(CartContext);

const SESSION_KEY = 'table_session';

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
            setError('Link tidak valid. Harap scan ulang QR Code meja Anda.');
            setLoading(false);
            return;
        }
        const verify = async () => {
            try {
                const res = await api.get(`/tables/verify?table=${tableId}&token=${token}`);
                setTableData(res.data.data);
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ table_id: tableId, token }));
            } catch {
                setError('Meja tidak ditemukan atau tidak aktif. Harap scan ulang QR Code.');
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

    const addToCart = (menu) => {
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

    if (loading) return <div className="loading">⏳ Memverifikasi meja...</div>;
    if (error) return (
        <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚫</div>
            <h2 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Link Tidak Valid</h2>
            <p style={{ color: 'var(--gray-500)' }}>{error}</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <div>
                        <div className="topbar-title">🍽️ Menu Restoran</div>
                        <div className="topbar-table">Meja {tableData?.table_number}</div>
                    </div>
                    {cartCount > 0 && (
                        <button className="cart-btn" onClick={() => navigate('/cart')}>
                            🛒 Keranjang <span className="cart-count">{cartCount}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="container">
                {/* Search */}
                <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                    <input className="form-input" placeholder="🔍 Cari menu..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                    <button className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory(null)}>Semua</button>
                    {categories.map(c => (
                        <button key={c.id} className={`btn btn-sm ${activeCategory === c.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory(c.id)}>
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                {filteredMenus.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🍽️</div><p>Tidak ada menu ditemukan.</p></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '32px' }}>
                        {filteredMenus.map(menu => {
                            const inCart = cart.find(i => i.menu_id === menu.id);
                            return (
                                <div key={menu.id} className="card" style={{ cursor: 'pointer' }}>
                                    {menu.image_url
                                        ? <img src={menu.image_url} alt={menu.name} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                                        : <div style={{ height: '130px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🍽️</div>
                                    }
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.88rem', marginBottom: '4px', lineHeight: 1.3 }}>{menu.name}</div>
                                        {menu.description && <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px' }}>{menu.description}</div>}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--brand)' }}>Rp {Number(menu.price).toLocaleString('id-ID')}</span>
                                            <button className="btn btn-primary btn-sm" onClick={() => addToCart(menu)}>
                                                {inCart ? `+${inCart.quantity}` : '+ Tambah'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {cartCount > 0 && (
                <div style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '448px', zIndex: 200 }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/cart')}>
                        🛒 Lihat Keranjang ({cartCount} item)
                    </button>
                </div>
            )}
        </div>
    );
}
