const db = require('../db');

// GET /api/bank-accounts/active  (public)
const getActiveBankAccount = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM bank_accounts WHERE is_active = TRUE LIMIT 1');
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Rekening bank aktif tidak ditemukan.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/admin/bank-accounts (admin)
const getAllBankAccounts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM bank_accounts ORDER BY is_active DESC, id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/admin/bank-accounts (admin)
const createBankAccount = async (req, res) => {
    const { bank_name, account_number, account_holder, is_active } = req.body;
    if (!bank_name || !account_number || !account_holder) {
        return res.status(400).json({ success: false, message: 'Nama bank, nomor rekening, dan atas nama wajib diisi.' });
    }
    try {
        if (is_active) await db.query('UPDATE bank_accounts SET is_active = FALSE');
        const [result] = await db.query(
            'INSERT INTO bank_accounts (bank_name, account_number, account_holder, is_active) VALUES (?, ?, ?, ?)',
            [bank_name, account_number, account_holder, is_active ? 1 : 0]
        );
        const [rows] = await db.query('SELECT * FROM bank_accounts WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/admin/bank-accounts/:id (admin)
const updateBankAccount = async (req, res) => {
    const { id } = req.params;
    const { bank_name, account_number, account_holder, is_active } = req.body;
    try {
        if (is_active) await db.query('UPDATE bank_accounts SET is_active = FALSE WHERE id != ?', [id]);
        await db.query(
            'UPDATE bank_accounts SET bank_name = COALESCE(?, bank_name), account_number = COALESCE(?, account_number), account_holder = COALESCE(?, account_holder), is_active = COALESCE(?, is_active) WHERE id = ?',
            [bank_name, account_number, account_holder, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
        );
        const [rows] = await db.query('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Rekening tidak ditemukan.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/admin/bank-accounts/:id (admin)
const deleteBankAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM bank_accounts WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Rekening tidak ditemukan.' });
        res.json({ success: true, message: 'Rekening berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/orders/:id/payment - Upload bukti transfer (customer)
const uploadPaymentProof = async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'Bukti transfer wajib diupload.' });
    try {
        const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (order.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

        const [bankAccount] = await db.query('SELECT id FROM bank_accounts WHERE is_active = TRUE LIMIT 1');
        if (bankAccount.length === 0) return res.status(500).json({ success: false, message: 'Rekening bank tidak tersedia.' });

        const proof_image_url = `/uploads/payments/${req.file.filename}`;
        await db.query(
            'INSERT INTO payments (order_id, bank_account_id, amount_transferred, proof_image_url) VALUES (?, ?, ?, ?)',
            [id, bankAccount[0].id, order[0].total_amount, proof_image_url]
        );
        await db.query("UPDATE orders SET status = 'waiting_verification' WHERE id = ?", [id]);
        res.json({ success: true, message: 'Bukti pembayaran berhasil diupload. Silakan tunggu verifikasi admin.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PATCH /api/admin/payments/:id/verify - Verifikasi bukti (admin)
const verifyPayment = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status harus "verified" atau "rejected".' });
    }
    try {
        const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
        if (payment.length === 0) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan.' });

        await db.query(
            'UPDATE payments SET status = ?, verified_by = ?, verified_at = NOW() WHERE id = ?',
            [status, req.admin.id, id]
        );

        const newOrderStatus = status === 'verified' ? 'confirmed' : 'rejected';
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [newOrderStatus, payment[0].order_id]);

        res.json({ success: true, message: `Pembayaran ${status === 'verified' ? 'disetujui' : 'ditolak'}.` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getActiveBankAccount, getAllBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount, uploadPaymentProof, verifyPayment };
