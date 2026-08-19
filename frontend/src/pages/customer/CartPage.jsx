import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('cart') || '[]'); } catch { return []; }
    });

    const session = JSON.parse(sessionStorage.getItem('table_session') || 'null');

    const update = (newCart) => {
        setCart(newCart);
        sessionStorage.setItem('cart', JSON.stringify(newCart));
    };

    const changeQty = (menu_id, delta) => {
        const next = cart.map(i => i.menu_id === menu_id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
        update(next);
    };

    const removeItem = (menu_id) => update(cart.filter(i => i.menu_id !== menu_id));

    const updateNote = (menu_id, note) => update(cart.map(i => i.menu_id === menu_id ? { ...i, note } : i));

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    if (!session) return (
        <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
            <p>Sesi tidak valid. Silakan scan ulang QR Code.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Kembali</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--gray-700)', fontSize: '1.2rem' }}>←</button>
                    <div className="topbar-title">Keranjang Pesanan</div>
                    <div style={{ width: '32px' }} />
                </div>
            </div>

            <div className="container" style={{ paddingTop: '16px', paddingBottom: '140px' }}>
                {cart.length === 0 ? (
                    <div className="empty-state" style={{ paddingTop: '60px' }}>
                        <div className="empty-state-icon">🛒</div>
                        <p>Keranjang kosong.</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Tambah Menu</button>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.menu_id} className="card" style={{ marginBottom: '12px', padding: '14px' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                {item.image_url
                                    ? <img src={item.image_url} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                    : <div style={{ width: '60px', height: '60px', background: 'var(--gray-100)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍽️</div>
                                }
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                                    <div style={{ color: 'var(--brand)', fontWeight: '700' }}>Rp {Number(item.price).toLocaleString('id-ID')}</div>
                                </div>
                                <button onClick={() => removeItem(item.menu_id)} style={{ background: 'none', color: 'var(--danger)', fontSize: '1.2rem', alignSelf: 'flex-start' }}>🗑</button>
                            </div>

                            {/* Qty control */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => changeQty(item.menu_id, -1)}>−</button>
                                <span style={{ fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                                <button className="btn btn-primary btn-sm" onClick={() => changeQty(item.menu_id, 1)}>+</button>
                                <span style={{ marginLeft: 'auto', fontWeight: '700' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            </div>

                            <input
                                className="form-input"
                                placeholder="Catatan (misal: tidak pedas)"
                                value={item.note}
                                onChange={e => updateNote(item.menu_id, e.target.value)}
                                style={{ fontSize: '0.82rem' }}
                            />
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', maxWidth: '480px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '600' }}>Total Pesanan</span>
                        <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--brand)' }}>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/checkout')}>Lanjut ke Checkout →</button>
                </div>
            )}
        </div>
    );
}
