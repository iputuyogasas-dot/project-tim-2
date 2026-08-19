import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../api';

export default function BankAccountPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ bank_name: '', account_number: '', account_holder: '', is_active: false });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const fetch = async () => {
        const res = await api.get('/bank-accounts');
        setAccounts(res.data.data); setLoading(false);
    };
    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEditing(null); setForm({ bank_name: '', account_number: '', account_holder: '', is_active: false }); setShowModal(true); setMsg(''); setError(''); };
    const openEdit = (acc) => { setEditing(acc); setForm({ bank_name: acc.bank_name, account_number: acc.account_number, account_holder: acc.account_holder, is_active: acc.is_active }); setShowModal(true); setMsg(''); setError(''); };

    const handleSave = async () => {
        if (!form.bank_name || !form.account_number || !form.account_holder) return setError('Semua field wajib diisi.');
        try {
            if (editing) await api.put(`/bank-accounts/${editing.id}`, form);
            else await api.post('/bank-accounts', form);
            setMsg(editing ? 'Rekening diupdate.' : 'Rekening ditambahkan.');
            setShowModal(false); fetch();
        } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan.'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus rekening ini?')) return;
        try { await api.delete(`/bank-accounts/${id}`); fetch(); } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus.'); }
    };

    const setActive = async (acc) => {
        await api.put(`/bank-accounts/${acc.id}`, { ...acc, is_active: true });
        fetch();
    };

    return (
        <div>
            <div className="admin-header">
                <span>Pengaturan Rekening Bank</span>
                <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={openAdd}>
                    <Plus size={16} /> Tambah Rekening
                </button>
            </div>
            <div>
                {msg && <div className="success-box">{msg}</div>}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Hanya 1 rekening dengan status <strong>Aktif</strong> yang akan ditampilkan ke pelanggan saat checkout.
                </p>
                <div className="card">
                    {loading ? <div className="loading">Memuat rekening...</div> : (
                        <table className="data-table">
                            <thead><tr><th>Bank</th><th>No. Rekening</th><th>Atas Nama</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {accounts.map(acc => (
                                    <tr key={acc.id}>
                                        <td><strong>{acc.bank_name}</strong></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '1px' }}>{acc.account_number}</td>
                                        <td>{acc.account_holder}</td>
                                        <td>
                                            {acc.is_active
                                                ? <span className="badge badge-confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Aktif</span>
                                                : <button className="btn btn-outline btn-sm" onClick={() => setActive(acc)}>Set Aktif</button>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(acc)}><Edit2 size={14} /></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(acc.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">{editing ? 'Edit Rekening' : 'Tambah Rekening'}</div>
                        {error && <div className="error-box">{error}</div>}
                        <div className="form-group"><label className="form-label">Nama Bank</label><input className="form-input" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="BCA, Mandiri, BRI..." /></div>
                        <div className="form-group"><label className="form-label">Nomor Rekening</label><input className="form-input" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="0123456789" /></div>
                        <div className="form-group"><label className="form-label">Atas Nama</label><input className="form-input" value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} placeholder="Nama pemilik rekening" /></div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                            <label htmlFor="is_active" className="form-label" style={{ margin: 0 }}>Jadikan rekening aktif (tampil ke pelanggan)</label>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
