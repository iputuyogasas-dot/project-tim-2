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

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const url = statusFilter ? `/orders/admin/all?status=${statusFilter}` : '/orders/admin/all';
            const res = await api.get(url);
            setOrders(res.data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [statusFilter]);

    useEffect(() => {
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [statusFilter]);

    return (
        <div>
            <div className="admin-header">
                <span>📋 Daftar Pesanan</span>
            </div>
            <div className="page-content">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[{ value: '', label: 'Semua' }, ...Object.entries(STATUS_MAP).map(([v, s]) => ({ value: v, label: s.label }))].map(opt => (
                        <button key={opt.value} className={`btn btn-sm ${statusFilter === opt.value ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(opt.value)}>
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="card">
                    {loading ? <div className="loading">Memuat...</div> : (
                        <table className="data-table">
                            <thead><tr><th>#</th><th>Meja</th><th>Nama</th><th>Total</th><th>Status</th><th>Waktu</th><th></th></tr></thead>
                            <tbody>
                                {orders.length === 0
                                    ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>Tidak ada pesanan</td></tr>
                                    : orders.map(o => (
                                        <tr key={o.id}>
                                            <td>#{o.id}</td>
                                            <td><strong>Meja {o.table_number}</strong></td>
                                            <td>{o.customer_name || '-'}</td>
                                            <td><strong>Rp {Number(o.total_amount).toLocaleString('id-ID')}</strong></td>
                                            <td><span className={`badge ${STATUS_MAP[o.status]?.class}`}>{STATUS_MAP[o.status]?.label || o.status}</span></td>
                                            <td style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleString('id-ID')}</td>
                                            <td><button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/orders/${o.id}`)}>Detail</button></td>
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
