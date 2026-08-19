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
        <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Sesi meja tidak terdeteksi. Silakan scan QR Code kembali.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Kembali ke Beranda</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>←</button>
                    <div className="topbar-title">🛒 Keranjang Pesanan</div>
                    <div style={{ width: '32px' }} />
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '160px' }}>
                {cart.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <p>Keranjang pesanan Anda masih kosong.</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Lihat Menu</button>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.menu_id} className="card" style={{ marginBottom: '14px', padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                                {item.image_url
                                    ? <img src={item.image_url} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                                    : <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🍽️</div>
                                }
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.name}</div>
                                    <div style={{ color: 'var(--accent-green)', fontWeight: '700', fontSize: '0.95rem' }}>Rp {Number(item.price).toLocaleString('id-ID')}</div>
                                </div>
                                <button onClick={() => removeItem(item.menu_id)} style={{ background: 'none', color: 'var(--accent-red)', fontSize: '1.2rem', padding: '4px' }}>🗑</button>
                            </div>

                            {/* Qty control stepper per style.json */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', backgroundColor: 'var(--bg-surface-muted)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
                                <button className="btn btn-outline btn-sm" style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }} onClick={() => changeQty(item.menu_id, -1)}>−</button>
                                <span style={{ fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                                <button className="btn btn-primary btn-sm" style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }} onClick={() => changeQty(item.menu_id, 1)}>+</button>
                                <span style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--accent-green)' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            </div>

                            <input
                                className="form-input"
                                placeholder="✏️ Catatan khusus (misal: ekstra pedas, es dikit)..."
                                value={item.note}
                                onChange={e => updateNote(item.menu_id, e.target.value)}
                                style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                            />
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderTop: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', maxWidth: '520px', margin: '0 auto', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Total Pembayaran</span>
                        <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--accent-green)' }}>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/checkout')}>Lanjut ke Checkout →</button>
                </div>
            )}
        </div>
    );
}
