import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const STATUS_LABELS = {
    pending_payment: 'Menunggu Bayar', waiting_verification: 'Menunggu Verifikasi',
    confirmed: 'Dikonfirmasi', rejected: 'Ditolak', processing: 'Diproses', completed: 'Selesai', cancelled: 'Dibatalkan'
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const fetch = async () => {
        try {
            const res = await api.get(`/orders/admin/${id}`);
            setOrder(res.data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [id]);

    const updateStatus = async (status) => {
        setActionLoading(true); setMsg('');
        try {
            await api.patch(`/orders/admin/${id}/status`, { status });
            setMsg(`Status berhasil diupdate ke "${STATUS_LABELS[status]}".`);
            fetch();
        } catch (err) { setMsg(err.response?.data?.message || 'Gagal update status.'); }
        finally { setActionLoading(false); }
    };

    const verifyPayment = async (paymentId, status) => {
        setActionLoading(true); setMsg('');
        try {
            await api.patch(`/orders/admin/payments/${paymentId}/verify`, { status });
            setMsg(`Pembayaran ${status === 'verified' ? 'diterima' : 'ditolak'}.`);
            fetch();
        } catch (err) { setMsg(err.response?.data?.message || 'Gagal verifikasi.'); }
        finally { setActionLoading(false); }
    };

    if (loading) return <div className="loading">⏳ Memuat detail pesanan...</div>;
    if (!order) return <div className="page-content"><p>Pesanan tidak ditemukan.</p></div>;

    const latestPayment = order.payments?.[0];

    return (
        <div>
            <div className="admin-header">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', fontSize: '1.2rem' }}>←</button>
                    <span>Detail Pesanan #{order.id}</span>
                </div>
                <span className={`badge badge-${order.status?.split('_')[0]}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <div className="page-content">
                {msg && <div className={msg.includes('Gagal') ? 'error-box' : 'success-box'}>{msg}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Order Info */}
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ fontWeight: '700', marginBottom: '14px' }}>📋 Info Pesanan</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Meja</span>
                            <strong>Meja {order.table_number}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Nama</span>
                            <span>{order.customer_name || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Total</span>
                            <strong style={{ color: 'var(--brand)' }}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Waktu</span>
                            <span style={{ fontSize: '0.82rem' }}>{new Date(order.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        {order.notes && <div style={{ marginTop: '12px', padding: '10px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '0.85rem' }}>📝 {order.notes}</div>}
                    </div>

                    {/* Actions */}
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ fontWeight: '700', marginBottom: '14px' }}>⚡ Aksi</div>
                        {order.status === 'waiting_verification' && latestPayment?.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => verifyPayment(latestPayment.id, 'verified')} disabled={actionLoading}>✅ ACC / Setujui</button>
                                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => verifyPayment(latestPayment.id, 'rejected')} disabled={actionLoading}>❌ Tolak</button>
                            </div>
                        )}
                        {order.status === 'confirmed' && (
                            <button className="btn btn-primary w-full" style={{ marginBottom: '8px' }} onClick={() => updateStatus('processing')} disabled={actionLoading}>👨‍🍳 Mulai Proses</button>
                        )}
                        {order.status === 'processing' && (
                            <button className="btn btn-success w-full" onClick={() => updateStatus('completed')} disabled={actionLoading}>🎉 Selesai / Diantar</button>
                        )}
                        {['pending_payment', 'rejected'].includes(order.status) && (
                            <button className="btn btn-danger w-full" style={{ marginTop: '8px' }} onClick={() => updateStatus('cancelled')} disabled={actionLoading}>Batalkan Pesanan</button>
                        )}
                        {['confirmed', 'processing', 'completed', 'cancelled'].includes(order.status) && !['confirmed', 'processing'].includes(order.status) && (
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Tidak ada aksi tersedia untuk status ini.</p>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: '700' }}>Item Pesanan</div>
                    <table className="data-table">
                        <thead><tr><th>Menu</th><th>Harga</th><th>Qty</th><th>Subtotal</th><th>Catatan</th></tr></thead>
                        <tbody>
                            {order.items?.map(item => (
                                <tr key={item.id}>
                                    <td><strong>{item.menu_name}</strong></td>
                                    <td>Rp {Number(item.price_at_order).toLocaleString('id-ID')}</td>
                                    <td>{item.quantity}</td>
                                    <td><strong>Rp {Number(item.subtotal).toLocaleString('id-ID')}</strong></td>
                                    <td style={{ color: 'var(--gray-500)', fontSize: '0.82rem' }}>{item.note || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Payment Evidence */}
                {latestPayment && (
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ fontWeight: '700', marginBottom: '14px' }}>💳 Bukti Pembayaran</div>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {latestPayment.proof_image_url && (
                                <img src={latestPayment.proof_image_url} alt="Bukti Transfer" style={{ maxWidth: '280px', borderRadius: '8px', border: '1px solid var(--gray-200)' }} />
                            )}
                            <div>
                                <div style={{ marginBottom: '6px' }}><span style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginRight: '8px' }}>Status:</span>
                                    <span className={`badge ${latestPayment.status === 'verified' ? 'badge-confirmed' : latestPayment.status === 'rejected' ? 'badge-rejected' : 'badge-waiting'}`}>{latestPayment.status}</span>
                                </div>
                                <div style={{ marginBottom: '6px', fontSize: '0.85rem' }}><span style={{ color: 'var(--gray-500)' }}>Bank: </span>{latestPayment.bank_name}</div>
                                <div style={{ marginBottom: '6px', fontSize: '0.85rem' }}><span style={{ color: 'var(--gray-500)' }}>No. Rek: </span>{latestPayment.account_number}</div>
                                <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--gray-500)' }}>Upload: </span>{new Date(latestPayment.uploaded_at).toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
