const db = require('../db');

// POST /api/orders - Buat pesanan baru (customer)
const createOrder = async (req, res) => {
    const { table_id, token, customer_name, items, notes } = req.body;
    if (!table_id || !token || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'table_id, token, dan items wajib diisi.' });
    }
    try {
        const [tables] = await db.query(
            "SELECT * FROM `tables` WHERE id = ? AND table_token = ? AND status = 'active'",
            [table_id, token]
        );
        if (tables.length === 0) {
            return res.status(403).json({ success: false, message: 'Token meja tidak valid.' });
        }

        // Fetch prices for all menu items
        const menuIds = items.map(i => i.menu_id);
        const [menus] = await db.query(`SELECT id, price, name, is_available FROM menus WHERE id IN (?)`, [menuIds]);
        const menuMap = {};
        menus.forEach(m => menuMap[m.id] = m);

        for (const item of items) {
            if (!menuMap[item.menu_id]) return res.status(400).json({ success: false, message: `Menu ID ${item.menu_id} tidak ditemukan.` });
            if (!menuMap[item.menu_id].is_available) return res.status(400).json({ success: false, message: `Menu "${menuMap[item.menu_id].name}" sedang tidak tersedia.` });
        }

        let totalAmount = 0;
        const orderItemsData = items.map(item => {
            const price = parseFloat(menuMap[item.menu_id].price);
            const qty = parseInt(item.quantity) || 1;
            const subtotal = price * qty;
            totalAmount += subtotal;
            return [item.menu_id, qty, price, subtotal, item.note || null];
        });

        const [orderResult] = await db.query(
            'INSERT INTO orders (table_id, customer_name, total_amount, notes) VALUES (?, ?, ?, ?)',
            [table_id, customer_name || null, totalAmount, notes || null]
        );
        const orderId = orderResult.insertId;

        const itemsQuery = 'INSERT INTO order_items (order_id, menu_id, quantity, price_at_order, subtotal, note) VALUES ?';
        const itemsValues = orderItemsData.map(item => [orderId, ...item]);
        await db.query(itemsQuery, [itemsValues]);

        const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const [orderItems] = await db.query(
            'SELECT oi.*, m.name as menu_name FROM order_items oi LEFT JOIN menus m ON oi.menu_id = m.id WHERE oi.order_id = ?',
            [orderId]
        );
        res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat.', data: { ...order[0], items: orderItems } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/orders/:id/status - Status pesanan (customer)
const getOrderStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT id, status, total_amount, created_at, updated_at FROM orders WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/admin/orders - Daftar semua pesanan (admin)
const getAllOrders = async (req, res) => {
    const { status, table_id } = req.query;
    try {
        let query = `SELECT o.*, t.table_number FROM orders o 
                 LEFT JOIN \`tables\` t ON o.table_id = t.id WHERE 1=1`;
        const params = [];
        if (status) { query += ' AND o.status = ?'; params.push(status); }
        if (table_id) { query += ' AND o.table_id = ?'; params.push(table_id); }
        query += ' ORDER BY o.created_at DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/admin/orders/:id - Detail pesanan (admin)
const getOrderDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const [order] = await db.query(
            'SELECT o.*, t.table_number FROM orders o LEFT JOIN `tables` t ON o.table_id = t.id WHERE o.id = ?',
            [id]
        );
        if (order.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

        const [items] = await db.query(
            'SELECT oi.*, m.name as menu_name, m.image_url FROM order_items oi LEFT JOIN menus m ON oi.menu_id = m.id WHERE oi.order_id = ?',
            [id]
        );
        const [payments] = await db.query(
            'SELECT p.*, b.bank_name, b.account_number FROM payments p LEFT JOIN bank_accounts b ON p.bank_account_id = b.id WHERE p.order_id = ? ORDER BY p.created_at DESC',
            [id]
        );
        res.json({ success: true, data: { ...order[0], items, payments } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PATCH /api/admin/orders/:id/status - Update status pesanan (admin)
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['confirmed', 'rejected', 'processing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Status tidak valid. Pilih dari: ${validStatuses.join(', ')}` });
    }
    try {
        const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        res.json({ success: true, message: `Status pesanan diupdate menjadi "${status}".`, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { createOrder, getOrderStatus, getAllOrders, getOrderDetail, updateOrderStatus };
