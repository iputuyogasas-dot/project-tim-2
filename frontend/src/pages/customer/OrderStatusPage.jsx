import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

const STATUS_MAP = {
    pending_payment: { label: 'Menunggu Pembayaran', icon: '⏳', class: 'badge-pending' },
    waiting_verification: { label: 'Menunggu Verifikasi', icon: '🔍', class: 'badge-waiting' },
    confirmed: { label: 'Dikonfirmasi', icon: '✅', class: 'badge-confirmed' },
    rejected: { label: 'Ditolak', icon: '❌', class: 'badge-rejected' },
    processing: { label: 'Sedang Diproses', icon: '👨‍🍳', class: 'badge-processing' },
    completed: { label: 'Selesai / Diantar', icon: '🎉', class: 'badge-completed' },
    cancelled: { label: 'Dibatalkan', icon: '🚫', class: 'badge-cancelled' },
};

const STEPS = ['pending_payment', 'waiting_verification', 'confirmed', 'processing', 'completed'];

export default function OrderStatusPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');

    const fetch = async () => {
        try {
            const res = await api.get(`/orders/${orderId}/status`);
            setOrder(res.data.data);
        } catch { setError('Pesanan tidak ditemukan.'); }
    };

    useEffect(() => {
        fetch();
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (error) return (
        <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❓</div>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
    );

    if (!order) return <div className="loading">⏳ Memuat status pesanan...</div>;

    const status = STATUS_MAP[order.status] || { label: order.status, icon: '📋', class: '' };
    const currentStep = STEPS.indexOf(order.status);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <div className="topbar-title">📍 Status Pesanan #{orderId}</div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '16px' }}>
                <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '3.8rem', marginBottom: '12px' }}>{status.icon}</div>
                    <span className={`badge ${status.class}`} style={{ fontSize: '0.88rem', padding: '6px 18px' }}>{status.label}</span>
                    <p style={{ color: 'var(--text-muted)', marginTop: '14px', fontSize: '0.8rem' }}>
                        🔄 Otomatis diperbarui setiap 5 detik
                    </p>
                </div>

                {/* Progress steps */}
                {order.status !== 'rejected' && order.status !== 'cancelled' && (
                    <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Progress Pesanan</div>
                        {STEPS.map((step, idx) => (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: idx < STEPS.length - 1 ? '12px' : 0 }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                    backgroundColor: currentStep >= idx ? 'var(--primary)' : 'var(--bg-surface-muted)',
                                    color: currentStep >= idx ? '#FFF' : 'var(--text-muted)',
                                }}>
                                    {currentStep > idx ? '✓' : idx + 1}
                                </div>
                                <span style={{ fontSize: '0.88rem', color: currentStep >= idx ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: currentStep === idx ? 700 : 400 }}>
                                    {STATUS_MAP[step]?.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>ID Pesanan</span>
                        <span style={{ fontWeight: 600 }}>#{order.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Biaya</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '1rem' }}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
