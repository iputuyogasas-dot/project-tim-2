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
        if (!session) return setError('Sesi tidak valid. Scan ulang QR.');
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
        <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
            <p>Keranjang kosong atau sesi tidak valid.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Kembali</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--gray-700)', fontSize: '1.2rem' }}>←</button>
                    <div className="topbar-title">Checkout</div>
                    <div style={{ width: '32px' }} />
                </div>
            </div>

            <div className="container" style={{ paddingTop: '16px', paddingBottom: '100px' }}>
                {error && <div className="error-box">{error}</div>}

                {/* Order Summary */}
                <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', fontWeight: '700' }}>Ringkasan Pesanan</div>
                    {cart.map(item => (
                        <div key={item.menu_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--gray-50)' }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span style={{ fontWeight: '600' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', fontWeight: '700', fontSize: '1.05rem' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--brand)' }}>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Customer Name (optional) */}
                <div className="form-group">
                    <label className="form-label">Nama (opsional)</label>
                    <input className="form-input" placeholder="Nama Anda" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Catatan Pesanan (opsional)</label>
                    <textarea className="form-input" rows={2} placeholder="Catatan umum untuk pesanan ini..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                {/* Bank Info */}
                {bankAccount && (
                    <div className="card" style={{ padding: '16px', marginBottom: '16px', background: 'var(--brand-light)' }}>
                        <div style={{ fontWeight: '700', marginBottom: '10px', color: 'var(--brand)' }}>💳 Informasi Pembayaran Transfer</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Bank</span>
                            <span style={{ fontWeight: '600' }}>{bankAccount.bank_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No. Rekening</span>
                            <span style={{ fontWeight: '700', fontSize: '1rem' }}>{bankAccount.account_number}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Atas Nama</span>
                            <span style={{ fontWeight: '600' }}>{bankAccount.account_holder}</span>
                        </div>
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,107,43,0.2)', paddingTop: '10px' }}>
                            <div style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>Jumlah Transfer</div>
                            <div style={{ fontWeight: '700', fontSize: '1.3rem', color: 'var(--brand)' }}>Rp {total.toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', maxWidth: '480px', margin: '0 auto' }}>
                <button className="btn btn-primary btn-lg" onClick={handleConfirm} disabled={loading}>
                    {loading ? '⏳ Membuat Pesanan...' : '✅ Konfirmasi & Buat Pesanan'}
                </button>
            </div>
        </div>
    );
}
