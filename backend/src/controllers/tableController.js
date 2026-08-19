const db = require('../db');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// GET /api/tables
const getAllTables = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM `tables` ORDER BY table_number ASC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/tables/verify
const verifyTable = async (req, res) => {
    const { table, token } = req.query;
    if (!table || !token) {
        return res.status(400).json({ success: false, message: 'Parameter table dan token wajib diisi.' });
    }
    try {
        const [rows] = await db.query(
            "SELECT * FROM `tables` WHERE id = ? AND table_token = ? AND status = 'active'",
            [table, token]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Meja tidak ditemukan atau tidak aktif.' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/tables
const createTable = async (req, res) => {
    const { table_number } = req.body;
    if (!table_number) return res.status(400).json({ success: false, message: 'Nomor meja wajib diisi.' });
    try {
        const token = uuidv4();
        const qrDir = path.join(__dirname, '../../uploads/qr');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

        // Insert first to get id
        const [result] = await db.query(
            'INSERT INTO `tables` (table_number, table_token) VALUES (?, ?)',
            [table_number, token]
        );
        const tableId = result.insertId;
        const qrUrl = `${BASE_URL}/order?table=${tableId}&token=${token}`;
        const qrFileName = `table_${tableId}.png`;
        const qrFilePath = path.join(qrDir, qrFileName);

        await QRCode.toFile(qrFilePath, qrUrl, { width: 300 });
        const qrCodeUrl = `/uploads/qr/${qrFileName}`;
        await db.query('UPDATE `tables` SET qr_code_url = ? WHERE id = ?', [qrCodeUrl, tableId]);

        const [rows] = await db.query('SELECT * FROM `tables` WHERE id = ?', [tableId]);
        res.status(201).json({ success: true, message: 'Meja berhasil ditambahkan.', data: rows[0] });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Nomor meja sudah ada.' });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/tables/:id
const updateTable = async (req, res) => {
    const { id } = req.params;
    const { table_number, status } = req.body;
    try {
        await db.query(
            'UPDATE `tables` SET table_number = COALESCE(?, table_number), status = COALESCE(?, status) WHERE id = ?',
            [table_number, status, id]
        );
        const [rows] = await db.query('SELECT * FROM `tables` WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });
        res.json({ success: true, message: 'Meja berhasil diupdate.', data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/tables/:id
const deleteTable = async (req, res) => {
    const { id } = req.params;
    try {
        const [orders] = await db.query(
            "SELECT id FROM orders WHERE table_id = ? AND status NOT IN ('completed','cancelled') LIMIT 1",
            [id]
        );
        if (orders.length > 0) {
            return res.status(400).json({ success: false, message: 'Tidak bisa menghapus meja yang masih memiliki pesanan aktif.' });
        }
        const [result] = await db.query('DELETE FROM `tables` WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });
        res.json({ success: true, message: 'Meja berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getAllTables, verifyTable, createTable, updateTable, deleteTable };
