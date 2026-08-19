const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/auth');
const { createOrder, getOrderStatus, getAllOrders, getOrderDetail, updateOrderStatus } = require('../controllers/orderController');
const { uploadPaymentProof, verifyPayment } = require('../controllers/paymentController');

const paymentStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/payments')),
    filename: (req, file, cb) => cb(null, `payment_${Date.now()}${path.extname(file.originalname)}`),
});
const uploadProof = multer({
    storage: paymentStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Hanya file gambar yang diizinkan.'));
        cb(null, true);
    },
});

// Customer routes (public)
router.post('/', createOrder);
router.get('/:id/status', getOrderStatus);
router.post('/:id/payment', uploadProof.single('proof'), uploadPaymentProof);

// Admin routes
router.get('/admin/all', verifyToken, getAllOrders);
router.get('/admin/:id', verifyToken, getOrderDetail);
router.patch('/admin/:id/status', verifyToken, updateOrderStatus);
router.patch('/admin/payments/:id/verify', verifyToken, verifyPayment);

module.exports = router;
