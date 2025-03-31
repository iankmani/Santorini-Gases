import express from 'express';
import {
  initiateSTKPush,
  checkPaymentStatus,
  mpesaCallback,
  getTransactionHistory
} from '../controllers/mpesaController.js';

const router = express.Router();

/**
 * @route POST /api/mpesa/stkpush
 * @description Initiate M-Pesa STK push payment
 * @access Public
 */
router.post('/stkpush', initiateSTKPush);

/**
 * @route GET /api/mpesa/status
 * @description Check payment status
 * @access Public
 * @param {String} checkoutRequestID - M-Pesa checkout request ID
 */
router.get('/status', checkPaymentStatus);

/**
 * @route POST /api/mpesa/callback
 * @description M-Pesa payment callback URL
 * @access Public
 */
router.post('/callback', mpesaCallback);

/**
 * @route GET /api/mpesa/transactions
 * @description Get transaction history
 * @access Public
 * @param {String} phoneNumber - Customer phone number
 * @param {Number} [limit=10] - Number of transactions to return
 */
router.get('/transactions', getTransactionHistory);

export default router;