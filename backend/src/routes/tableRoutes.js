const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getAllTables, verifyTable, createTable, updateTable, deleteTable } = require('../controllers/tableController');

router.get('/verify', verifyTable);                         // public
router.get('/', verifyToken, getAllTables);
router.post('/', verifyToken, createTable);
router.put('/:id', verifyToken, updateTable);
router.delete('/:id', verifyToken, deleteTable);

module.exports = router;
