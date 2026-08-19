import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Utensils, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../api';

export default function MenuManagePage() {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', category_id: '', price: '', description: '', is_available: true });
    const [imageFile, setImageFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const fetchAll = async () => {
        const [m, c] = await Promise.all([api.get('/menus'), api.get('/categories')]);
        setMenus(m.data.data); setCategories(c.data.data); setLoading(false);
    };
    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', category_id: categories[0]?.id || '', price: '', description: '', is_available: true }); setImageFile(null); setShowModal(true); setMsg(''); setError(''); };
    const openEdit = (menu) => { setEditing(menu); setForm({ name: menu.name, category_id: menu.category_id, price: menu.price, description: menu.description || '', is_available: menu.is_available }); setImageFile(null); setShowModal(true); setMsg(''); setError(''); };

    const handleSave = async () => {
        if (!form.name || !form.category_id || !form.price) return setError('Nama, kategori, dan harga wajib diisi.');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (imageFile) fd.append('image', imageFile);
            if (editing) await api.put(`/menus/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else await api.post('/menus', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMsg(editing ? 'Menu diupdate.' : 'Menu ditambahkan.');
            setShowModal(false); fetchAll();
        } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan.'); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus menu "${name}"?`)) return;
        try { await api.delete(`/menus/${id}`); fetchAll(); } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus.'); }
    };

    const toggleAvailable = async (menu) => {
        const fd = new FormData();
        fd.append('is_available', !menu.is_available);
        await api.put(`/menus/${menu.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        fetchAll();
    };

    return (
        <div>
            <div className="admin-header">
                <span>Kelola Menu</span>
                <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={openAdd}>
                    <Plus size={16} /> Tambah Menu
                </button>
            </div>
            <div>
                {msg && <div className="success-box">{msg}</div>}
                <div className="card">
                    {loading ? <div className="loading">Memuat menu...</div> : (
                        <table className="data-table">
                            <thead><tr><th>Menu</th><th>Kategori</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {menus.map(m => (
                                    <tr key={m.id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {m.image_url
                                                    ? <img src={m.image_url} alt={m.name} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    : (
                                                        <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--bg-surface-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                            <Utensils size={20} />
                                                        </div>
                                                    )
                                                }
                                                <strong>{m.name}</strong>
                                            </div>
                                        </td>
                                        <td>{m.category_name}</td>
                                        <td>Rp {Number(m.price).toLocaleString('id-ID')}</td>
                                        <td>
                                            <button className={`btn btn-sm ${m.is_available ? 'btn-secondary' : 'btn-outline'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => toggleAvailable(m)}>
                                                {m.is_available ? <><CheckCircle2 size={14} /> Tersedia</> : <><XCircle size={14} /> Habis</>}
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}><Edit2 size={14} /></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id, m.name)}><Trash2 size={14} /></button>
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
                        <div className="modal-title">{editing ? 'Edit Menu' : 'Tambah Menu'}</div>
                        {error && <div className="error-box">{error}</div>}
                        <div className="form-group"><label className="form-label">Nama Menu</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div className="form-group">
                            <label className="form-label">Kategori</label>
                            <select className="form-input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Harga (Rp)</label><input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Gambar {editing ? '(biarkan kosong jika tidak ingin ganti)' : ''}</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} />
                            <label htmlFor="available" className="form-label" style={{ margin: 0 }}>Tersedia</label>
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
