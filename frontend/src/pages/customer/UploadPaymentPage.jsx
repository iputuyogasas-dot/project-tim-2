import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function UploadPaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) return setError('Hanya file gambar yang diizinkan (JPG, PNG, WEBP).');
        if (f.size > 5 * 1024 * 1024) return setError('Ukuran file maksimal 5MB.');
        setError('');
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleUpload = async () => {
        if (!file) return setError('Pilih file bukti transfer terlebih dahulu.');
        setLoading(true); setError('');
        try {
            const formData = new FormData();
            formData.append('proof', file);
            await api.post(`/orders/${orderId}/payment`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal upload bukti pembayaran.');
        } finally { setLoading(false); }
    };

    if (success) return (
        <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ marginBottom: '8px' }}>Bukti Berhasil Dikirim!</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Admin akan memverifikasi pembayaran Anda segera. Pantau status pesanan di bawah ini.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/status/${orderId}`)}>Pantau Status Pesanan →</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <div className="topbar-title">Upload Bukti Bayar</div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '24px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '20px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Silakan upload screenshot atau foto bukti transfer Anda. Pastikan nominal dan nama rekening terlihat jelas.
                    </p>

                    {error && <div className="error-box">{error}</div>}

                    <div
                        onClick={() => document.getElementById('proof-input').click()}
                        style={{
                            border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius)', padding: '40px 20px',
                            textAlign: 'center', cursor: 'pointer', marginBottom: '16px',
                            background: preview ? 'none' : 'var(--gray-50)',
                        }}
                    >
                        {preview
                            ? <img src={preview} alt="Preview" style={{ maxHeight: '300px', borderRadius: '8px', margin: '0 auto' }} />
                            : <><div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div><p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Klik untuk pilih file gambar</p><p style={{ color: 'var(--gray-300)', fontSize: '0.75rem' }}>JPG, PNG, WEBP - Max 5MB</p></>
                        }
                    </div>
                    <input id="proof-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

                    <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={loading || !file}>
                        {loading ? '⏳ Mengirim...' : '📤 Upload Bukti Pembayaran'}
                    </button>
                </div>
            </div>
        </div>
    );
}
