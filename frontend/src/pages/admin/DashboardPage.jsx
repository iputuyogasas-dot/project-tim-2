import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const STATUS_MAP = {
    pending_payment: { label: 'Menunggu Bayar', class: 'badge-pending' },
    waiting_verification: { label: 'Menunggu Verifikasi', class: 'badge-waiting' },
    confirmed: { label: 'Dikonfirmasi', class: 'badge-confirmed' },
    rejected: { label: 'Ditolak', class: 'badge-rejected' },
    processing: { label: 'Diproses', class: 'badge-processing' },
    completed: { label: 'Selesai', class: 'badge-completed' },
    cancelled: { label: 'Dibatalkan', class: 'badge-cancelled' },
};

export default function DashboardPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/orders/admin/all').then(r => { setOrders(r.data.data); setLoading(false); }).catch(() => setLoading(false));
        const interval = setInterval(() => {
            api.get('/orders/admin/all').then(r => setOrders(r.data.data)).catch(() => { });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const count = (s) => orders.filter(o => o.status === s).length;
    const stats = [
        { label: 'Total Pesanan', value: orders.length, icon: '📋', color: 'var(--info)' },
        { label: 'Menunggu Verifikasi', value: count('waiting_verification'), icon: '🔍', color: 'var(--warning)' },
        { label: 'Dikonfirmasi', value: count('confirmed') + count('processing'), icon: '✅', color: 'var(--success)' },
        { label: 'Selesai Hari Ini', value: count('completed'), icon: '🎉', color: 'var(--brand)' },
    ];

    const recentOrders = [...orders].slice(0, 8);

    return (
        <div>
            <div className="admin-header">
                <span>📊 Dashboard</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Auto-refresh setiap 10 detik</span>
            </div>
            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    {stats.map(s => (
                        <div key={s.label} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '4px' }}>{s.label}</div>
                                </div>
                                <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pesanan Terbaru</span>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/orders')}>Lihat Semua</button>
                    </div>
                    {loading ? <div className="loading">Memuat...</div> : (
                        <table className="data-table">
                            <thead><tr><th>#</th><th>Meja</th><th>Total</th><th>Status</th><th>Waktu</th></tr></thead>
                            <tbody>
                                {recentOrders.length === 0
                                    ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>Belum ada pesanan</td></tr>
                                    : recentOrders.map(o => (
                                        <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                            <td>#{o.id}</td>
                                            <td>Meja {o.table_number}</td>
                                            <td>Rp {Number(o.total_amount).toLocaleString('id-ID')}</td>
                                            <td><span className={`badge ${STATUS_MAP[o.status]?.class}`}>{STATUS_MAP[o.status]?.label || o.status}</span></td>
                                            <td style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
