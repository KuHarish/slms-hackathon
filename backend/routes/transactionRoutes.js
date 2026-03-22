const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Ensure this matches the POST /checkout requirement
router.post('/checkout', transactionController.checkoutBook);
router.post('/reserve', transactionController.reserveBook);

// Add POST /return route for returning books
router.post('/return', transactionController.returnBook);

// Fetch all active books borrowed by a user
router.get('/users/:user_id/active-books', transactionController.getActiveBooks);

// Fetch all transactions (for Admin Dashboard)
router.get('/', transactionController.getAllTransactions);

module.exports = router;
