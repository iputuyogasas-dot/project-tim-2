import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function CategoryManagePage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const fetch = async () => {
        const res = await api.get('/categories');
        setCategories(res.data.data);
        setLoading(false);
    };
    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); setMsg(''); setError(''); };
    const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowModal(true); setMsg(''); setError(''); };

    const handleSave = async () => {
        if (!form.name) return setError('Nama kategori wajib diisi.');
        try {
            if (editing) await api.put(`/categories/${editing.id}`, form);
            else await api.post('/categories', form);
            setMsg(editing ? 'Kategori diupdate.' : 'Kategori ditambahkan.');
            setShowModal(false);
            fetch();
        } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan.'); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus kategori "${name}"?`)) return;
        try {
            await api.delete(`/categories/${id}`);
            fetch();
        } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus.'); }
    };

    return (
        <div>
            <div className="admin-header">
                <span>🏷️ Kelola Kategori</span>
                <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Tambah Kategori</button>
            </div>
            <div className="page-content">
                {msg && <div className="success-box">{msg}</div>}
                <div className="card">
                    {loading ? <div className="loading">Memuat...</div> : (
                        <table className="data-table">
                            <thead><tr><th>#</th><th>Nama</th><th>Deskripsi</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td>{cat.id}</td>
                                        <td><strong>{cat.name}</strong></td>
                                        <td style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{cat.description || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>Hapus</button>
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
                        <div className="modal-title">{editing ? 'Edit Kategori' : 'Tambah Kategori'}</div>
                        {error && <div className="error-box">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Nama Kategori</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Makanan" autoFocus />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deskripsi (opsional)</label>
                            <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat..." />
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
