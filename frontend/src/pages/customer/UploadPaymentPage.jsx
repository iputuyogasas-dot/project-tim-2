import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
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
            <div style={{ width: '72px', height: '72px', backgroundColor: 'var(--accent-green-light)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--accent-green)' }}>
                <CheckCircle2 size={40} />
            </div>
            <h2 style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 700 }}>Bukti Berhasil Dikirim</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                Kasir/Admin akan memverifikasi pembayaran Anda segera. Anda dapat memantau proses pesanan secara langsung.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/status/${orderId}`)}>Pantau Status Pesanan →</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
            <div className="topbar">
                <div className="topbar-inner">
                    <div className="topbar-title">Upload Bukti Bayar</div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        Upload screenshot atau foto resi transfer bank Anda. Pastikan nominal & nama pemilik rekening terlihat jelas.
                    </p>

                    {error && <div className="error-box">{error}</div>}

                    <div
                        onClick={() => document.getElementById('proof-input').click()}
                        style={{
                            border: '2px dashed var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 20px',
                            textAlign: 'center', cursor: 'pointer', marginBottom: '20px',
                            backgroundColor: preview ? 'transparent' : 'var(--bg-surface-muted)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {preview
                            ? <img src={preview} alt="Preview Bukti" style={{ maxHeight: '280px', borderRadius: 'var(--radius-md)', margin: '0 auto' }} />
                            : (
                                <>
                                    <div style={{ width: '56px', height: '56px', backgroundColor: '#E3F0EF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: 'var(--primary)' }}>
                                        <ImageIcon size={28} />
                                    </div>
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.92rem' }}>Klik di sini untuk memilih gambar</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Format JPG, PNG, WEBP (Maksimal 5MB)</p>
                                </>
                            )
                        }
                    </div>
                    <input id="proof-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

                    <button className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleUpload} disabled={loading || !file}>
                        {loading ? 'Mengirim...' : <><Upload size={18} /> Kirim Bukti Pembayaran</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
