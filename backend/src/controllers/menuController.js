const db = require('../db');

// GET /api/categories
const getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/categories
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
    try {
        const [result] = await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
            [name, description, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const [menus] = await db.query('SELECT id FROM menus WHERE category_id = ? LIMIT 1', [id]);
        if (menus.length > 0) return res.status(400).json({ success: false, message: 'Kategori masih digunakan oleh menu.' });
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        res.json({ success: true, message: 'Kategori berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/menus
const getMenus = async (req, res) => {
    const { category_id, available } = req.query;
    try {
        let query = `SELECT m.*, c.name as category_name FROM menus m 
                 LEFT JOIN categories c ON m.category_id = c.id WHERE 1=1`;
        const params = [];
        if (category_id) { query += ' AND m.category_id = ?'; params.push(category_id); }
        if (available === 'true') { query += ' AND m.is_available = TRUE'; }
        query += ' ORDER BY m.name ASC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/menus
const createMenu = async (req, res) => {
    const { category_id, name, description, price } = req.body;
    if (!category_id || !name || !price) {
        return res.status(400).json({ success: false, message: 'Kategori, nama, dan harga wajib diisi.' });
    }
    const image_url = req.file ? `/uploads/menus/${req.file.filename}` : null;
    try {
        const [result] = await db.query(
            'INSERT INTO menus (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
            [category_id, name, description, price, image_url]
        );
        const [rows] = await db.query('SELECT m.*, c.name as category_name FROM menus m LEFT JOIN categories c ON m.category_id = c.id WHERE m.id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/menus/:id
const updateMenu = async (req, res) => {
    const { id } = req.params;
    const { category_id, name, description, price, is_available } = req.body;
    const image_url = req.file ? `/uploads/menus/${req.file.filename}` : null;
    try {
        const fields = [];
        const params = [];
        if (category_id !== undefined) { fields.push('category_id = ?'); params.push(category_id); }
        if (name !== undefined) { fields.push('name = ?'); params.push(name); }
        if (description !== undefined) { fields.push('description = ?'); params.push(description); }
        if (price !== undefined) { fields.push('price = ?'); params.push(price); }
        if (is_available !== undefined) { fields.push('is_available = ?'); params.push(is_available === 'true' || is_available === true ? 1 : 0); }
        if (image_url) { fields.push('image_url = ?'); params.push(image_url); }
        if (fields.length === 0) return res.status(400).json({ success: false, message: 'Tidak ada data untuk diupdate.' });
        params.push(id);
        const [result] = await db.query(`UPDATE menus SET ${fields.join(', ')} WHERE id = ?`, params);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
        const [rows] = await db.query('SELECT m.*, c.name as category_name FROM menus m LEFT JOIN categories c ON m.category_id = c.id WHERE m.id = ?', [id]);
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/menus/:id
const deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM menus WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
        res.json({ success: true, message: 'Menu berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, getMenus, createMenu, updateMenu, deleteMenu };
