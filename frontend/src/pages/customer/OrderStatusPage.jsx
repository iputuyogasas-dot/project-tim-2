import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Search, CheckCircle2, XCircle, ChefHat, Check, Ban, AlertCircle } from 'lucide-react';
import api from '../../api';

const STATUS_MAP = {
    pending_payment: { label: 'Menunggu Pembayaran', icon: Clock, class: 'badge-pending', iconBg: '#FFF7D6', iconColor: '#B48000' },
    waiting_verification: { label: 'Menunggu Verifikasi', icon: Search, class: 'badge-waiting', iconBg: '#FFEDD5', iconColor: '#C2410C' },
    confirmed: { label: 'Dikonfirmasi', icon: CheckCircle2, class: 'badge-confirmed', iconBg: '#DFF3E4', iconColor: '#1F6D32' },
    rejected: { label: 'Ditolak', icon: XCircle, class: 'badge-rejected', iconBg: '#FDE8E8', iconColor: '#991B1B' },
    processing: { label: 'Sedang Diproses', icon: ChefHat, class: 'badge-processing', iconBg: '#E0F2FE', iconColor: '#0369A1' },
    completed: { label: 'Selesai / Diantar', icon: Check, class: 'badge-completed', iconBg: '#E8F0EC', iconColor: '#1F3D2B' },
    cancelled: { label: 'Dibatalkan', icon: Ban, class: 'badge-cancelled', iconBg: '#F2F0EA', iconColor: '#6B6B6B' },
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
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-surface-muted)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: 'var(--text-muted)' }}>
                <AlertCircle size={32} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
    );

    if (!order) return <div className="loading">Memuat status pesanan...</div>;

    const status = STATUS_MAP[order.status] || { label: order.status, icon: Clock, class: '', iconBg: 'var(--bg-surface-muted)', iconColor: 'var(--text-primary)' };
    const StatusIcon = status.icon;
    const currentStep = STEPS.indexOf(order.status);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <div className="topbar-title">Status Pesanan #{orderId}</div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '16px' }}>
                <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
                    {/* SVG Icon Box per reference image */}
                    <div style={{ width: '64px', height: '64px', backgroundColor: status.iconBg, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: status.iconColor }}>
                        <StatusIcon size={32} />
                    </div>
                    <span className={`badge ${status.class}`} style={{ fontSize: '0.88rem', padding: '6px 18px' }}>{status.label}</span>
                    <p style={{ color: 'var(--text-muted)', marginTop: '14px', fontSize: '0.8rem' }}>
                        Otomatis diperbarui setiap 5 detik
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
                                    {currentStep > idx ? <Check size={14} /> : idx + 1}
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
