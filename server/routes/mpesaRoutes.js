const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesaController');

/**
 * @route POST /api/mpesa/stkpush
 * @description Initiate M-Pesa STK push payment
 * @access Public
 */
router.post('/stkpush', mpesaController.initiateSTKPush);

/**
 * @route GET /api/mpesa/status
 * @description Check payment status
 * @access Public
 * @param {String} checkoutRequestID - M-Pesa checkout request ID
 */
router.get('/status', mpesaController.checkPaymentStatus);

/**
 * @route POST /api/mpesa/callback
 * @description M-Pesa payment callback URL
 * @access Public
 */
router.post('/callback', mpesaController.mpesaCallback);

/**
 * @route GET /api/mpesa/transactions
 * @description Get transaction history
 * @access Public
 * @param {String} phoneNumber - Customer phone number
 * @param {Number} [limit=10] - Number of transactions to return
 */
router.get('/transactions', mpesaController.getTransactionHistory);

module.exports = router;