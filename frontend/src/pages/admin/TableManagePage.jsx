import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function TableManagePage() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({ table_number: '', status: 'active' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const fetch = async () => {
        const res = await api.get('/tables');
        setTables(res.data.data);
        setLoading(false);
    };
    useEffect(() => { fetch(); }, []);

    const handleAdd = async () => {
        if (!tableNumber) return setError('Nomor meja wajib diisi.');
        try {
            await api.post('/tables', { table_number: tableNumber });
            setMsg(`Meja ${tableNumber} berhasil ditambahkan beserta QR Code.`);
            setShowModal(false); setTableNumber(''); fetch();
        } catch (err) { setError(err.response?.data?.message || 'Gagal menambahkan meja.'); }
    };

    const handleUpdate = async () => {
        if (!editForm.table_number) return setError('Nomor meja wajib diisi.');
        try {
            await api.put(`/tables/${editing.id}`, editForm);
            setMsg('Meja berhasil diupdate.'); setEditing(null); fetch();
        } catch (err) { setError(err.response?.data?.message || 'Gagal update meja.'); }
    };

    const handleDelete = async (id, num) => {
        if (!confirm(`Hapus Meja ${num}?`)) return;
        try { await api.delete(`/tables/${id}`); fetch(); } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus.'); }
    };

    const BACKEND = 'http://localhost:5000';

    return (
        <div>
            <div className="admin-header">
                <span>📱 Kelola Meja & QR Code</span>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setError(''); setMsg(''); }}>+ Tambah Meja</button>
            </div>
            <div className="page-content">
                {msg && <div className="success-box">{msg}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {loading ? <div className="loading">Memuat...</div> : tables.map(t => (
                        <div key={t.id} className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>Meja {t.table_number}</div>
                                <span className={`badge ${t.status === 'active' ? 'badge-confirmed' : 'badge-cancelled'}`}>{t.status}</span>
                            </div>
                            {t.qr_code_url && (
                                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                    <img src={`${BACKEND}${t.qr_code_url}`} alt={`QR Meja ${t.table_number}`} style={{ width: '140px', height: '140px', margin: '0 auto', border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '4px' }} />
                                    <a href={`${BACKEND}${t.qr_code_url}`} download={`qr-meja-${t.table_number}.png`} className="btn btn-outline btn-sm" style={{ marginTop: '8px', display: 'inline-block' }}>⬇ Download QR</a>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                                    onClick={() => { setEditing(t); setEditForm({ table_number: t.table_number, status: t.status }); setError(''); }}>Edit</button>
                                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(t.id, t.table_number)}>Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">Tambah Meja Baru</div>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '16px' }}>QR Code akan otomatis digenerate setelah meja ditambahkan.</p>
                        {error && <div className="error-box">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Nomor Meja</label>
                            <input className="form-input" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Contoh: 1, 2, VIP-1" autoFocus />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleAdd}>Tambah & Generate QR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="modal-overlay" onClick={() => setEditing(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">Edit Meja {editing.table_number}</div>
                        {error && <div className="error-box">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Nomor Meja</label>
                            <input className="form-input" value={editForm.table_number} onChange={e => setEditForm({ ...editForm, table_number: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                <option value="active">Aktif</option>
                                <option value="inactive">Non-aktif</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setEditing(null)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleUpdate}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
