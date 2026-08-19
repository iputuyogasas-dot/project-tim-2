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
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🍽️</div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Sistem Pemesanan Barcode Meja</p>
                </div>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" type="text" placeholder="Masukkan username" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? '⏳ Masuk...' : '🔑 Masuk'}
                    </button>
                </form>
                <p style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--gray-300)', textAlign: 'center' }}>Default: admin / admin123</p>
            </div>
        </div>
    );
}
