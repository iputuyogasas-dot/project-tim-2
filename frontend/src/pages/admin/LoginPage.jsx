import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) return setError('Username dan password wajib diisi.');
        setLoading(true); setError('');
        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data.token, res.data.admin);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ padding: '40px 32px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🍃</div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>Admin Restoran</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sistem Pemesanan Barcode Meja</p>
                </div>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" type="text" placeholder="Masukkan username admin" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '8px' }} disabled={loading}>
                        {loading ? '⏳ Memproses...' : '🔑 Masuk ke Dashboard'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>Akses Default: admin / admin123</p>
            </div>
        </div>
    );
}
