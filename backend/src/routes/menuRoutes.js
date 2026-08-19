const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/auth');
const {
    getCategories, createCategory, updateCategory, deleteCategory,
    getMenus, createMenu, updateMenu, deleteMenu
} = require('../controllers/menuController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/menus')),
    filename: (req, file, cb) => cb(null, `menu_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Hanya file gambar yang diizinkan.'));
        cb(null, true);
    },
});

// Category routes
router.get('/categories', getCategories);                        // public
router.post('/categories', verifyToken, createCategory);
router.put('/categories/:id', verifyToken, updateCategory);
router.delete('/categories/:id', verifyToken, deleteCategory);

// Menu routes
router.get('/menus', getMenus);                                  // public
router.post('/menus', verifyToken, upload.single('image'), createMenu);
router.put('/menus/:id', verifyToken, upload.single('image'), updateMenu);
router.delete('/menus/:id', verifyToken, deleteMenu);

module.exports = router;
