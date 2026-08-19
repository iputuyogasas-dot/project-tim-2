const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
    getActiveBankAccount, getAllBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount
} = require('../controllers/paymentController');

router.get('/active', getActiveBankAccount);                    // public
router.get('/', verifyToken, getAllBankAccounts);
router.post('/', verifyToken, createBankAccount);
router.put('/:id', verifyToken, updateBankAccount);
router.delete('/:id', verifyToken, deleteBankAccount);

module.exports = router;
