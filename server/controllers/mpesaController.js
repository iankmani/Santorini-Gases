const mpesaService = require('../services/mpesaService');
const prisma = require('../config/db');

exports.initiateSTKPush = async (req, res) => {
  try {
    const { phone, amount, accountReference, transactionDesc } = req.body;
    
    if (!phone || !amount || !accountReference) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: phone, amount, accountReference' 
      });
    }

    const result = await mpesaService.initiateSTKPush(
      phone,
      amount,
      accountReference,
      transactionDesc || 'Gas purchase'
    );

    res.json({
      success: true,
      message: 'STK push initiated successfully',
      data: result
    });
  } catch (error) {
    console.error('STK Push controller error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate STK push'
    });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.query;
    
    if (!checkoutRequestID) {
      return res.status(400).json({ 
        success: false,
        error: 'checkoutRequestID is required' 
      });
    }

    const transaction = await mpesaService.checkTransactionStatus(checkoutRequestID);
    
    res.json({
      success: true,
      status: transaction.status,
      transaction
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check payment status'
    });
  }
};

exports.mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      // Success case
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
      
      await prisma.transaction.update({
        where: { checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID },
        data: {
          status: 'SUCCESS',
          mpesaReceiptNumber: callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value,
          transactionDate: new Date(
            callbackMetadata.find(item => item.Name === 'TransactionDate').Value.toString()
          )
        }
      });
    } else {
      // Failure case
      await prisma.transaction.update({
        where: { checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID },
        data: { status: 'FAILED' }
      });
    }

    res.status(200).send();
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send();
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const { phoneNumber, limit = 10 } = req.query;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'phoneNumber is required' 
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: { phoneNumber },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transaction history'
    });
  }
};