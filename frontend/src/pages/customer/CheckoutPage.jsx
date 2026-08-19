import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [cart] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('cart') || '[]'); } catch { return []; }
    });
    const [session] = useState(() => JSON.parse(sessionStorage.getItem('table_session') || 'null'));
    const [bankAccount, setBankAccount] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/bank-accounts/active').then(r => setBankAccount(r.data.data)).catch(() => { });
    }, []);

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const handleConfirm = async () => {
        if (!session) return setError('Sesi meja tidak valid. Scan ulang QR Meja.');
        setLoading(true); setError('');
        try {
            const res = await api.post('/orders', {
                table_id: session.table_id,
                token: session.token,
                customer_name: customerName || null,
                notes,
                items: cart.map(i => ({ menu_id: i.menu_id, quantity: i.quantity, note: i.note })),
            });
            sessionStorage.removeItem('cart');
            navigate(`/payment/${res.data.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat pesanan.');
        } finally { setLoading(false); }
    };

    if (!session || cart.length === 0) return (
        <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Keranjang kosong atau sesi meja tidak valid.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Kembali ke Menu</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>←</button>
                    <div className="topbar-title">📋 Checkout Pesanan</div>
                    <div style={{ width: '32px' }} />
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '120px' }}>
                {error && <div className="error-box">{error}</div>}

                {/* Order Summary */}
                <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                        Ringkasan Pesanan
                    </div>
                    {cart.map(item => (
                        <div key={item.menu_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--border-light)' }}>
                            <div>
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '6px' }}>× {item.quantity}</span>
                                {item.note && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{item.note}"</div>}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', fontWeight: 700, fontSize: '1.1rem' }}>
                        <span>Total Biaya</span>
                        <span style={{ color: 'var(--accent-green)' }}>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <div className="form-group">
                        <label className="form-label">Nama Pemesan (opsional)</label>
                        <input className="form-input" placeholder="Masukkan nama Anda..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Catatan Tambahan (opsional)</label>
                        <textarea className="form-input" rows={2} placeholder="Catatan untuk pelayan/dapur..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                </div>

                {/* Bank Info */}
                {bankAccount && (
                    <div className="card" style={{ padding: '20px', marginBottom: '20px', backgroundColor: 'var(--accent-green-light)', border: '1px solid #C4ECCE' }}>
                        <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💳 Rekening Pembayaran Transfer
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Bank Target</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{bankAccount.bank_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Nomor Rekening</span>
                            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '1px', color: 'var(--primary)' }}>{bankAccount.account_number}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Atas Nama</span>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{bankAccount.account_holder}</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderTop: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', maxWidth: '520px', margin: '0 auto', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
                <button className="btn btn-secondary btn-lg" onClick={handleConfirm} disabled={loading}>
                    {loading ? '⏳ Membuat Pesanan...' : '✅ Konfirmasi & Kirim Pesanan'}
                </button>
            </div>
        </div>
    );
}
