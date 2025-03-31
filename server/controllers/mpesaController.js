import { initiateSTKPush as initiateSTKService, 
  checkTransactionStatus } from '../services/mpesaService.js';
import prisma from '../config/db.js';

export const initiateSTKPush = async (req, res) => {
  try {
    console.log("🔔 [STK Push] Incoming Request:", {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const { phone, amount, accountReference } = req.body;

    // Validation
    if (accountReference.length > 12) {
      console.error("❌ AccountReference too long (max 12 chars)");
      return res.status(400).json({ 
        success: false,
        error: "accountReference must be ≤ 12 characters" 
      });
    }
    if (!phone || !amount || !accountReference) {
      console.error("❌ [STK Push] Validation Failed - Missing Fields:", {
        received: { phone, amount, accountReference }
      });
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        example: {
          phone: "254712345678",
          amount: 100,
          accountReference: "TEST123"
        }
      });
    }

    console.log("🔄 [STK Push] Calling M-Pesa Service...");
    const result = await initiateSTKService(phone, amount, accountReference);
    
    console.log("✅ [STK Push] Success Response from M-Pesa:", {
      checkoutRequestID: result.checkoutRequestID,
      merchantRequestID: result.merchantRequestID,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "STK push initiated",
      data: {
        checkoutRequestID: result.checkoutRequestID,
        merchantRequestID: result.merchantRequestID
      }
    });

  } catch (error) {
    console.error("🔥 [STK Push] Critical Error:", {
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      },
      request: {
        body: req.body,
        headers: req.headers
      },
      timestamp: new Date().toISOString()
    });

    const errorMessage = error.message.includes("token") 
      ? "M-Pesa authentication failed (check credentials)" 
      : "Payment processing error";

    res.status(500).json({
      success: false,
      error: errorMessage,
      reference: "See server logs for details"
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    console.log("🔔 [Status Check] Incoming Request:", {
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const { checkoutRequestID } = req.query;

    if (!checkoutRequestID) {
      console.error("❌ [Status Check] Missing checkoutRequestID");
      return res.status(400).json({
        success: false,
        error: "checkoutRequestID is required",
        example: "/api/mpesa/status?checkoutRequestID=ws_CO_123456789"
      });
    }

    console.log("🔄 [Status Check] Querying Transaction Status...");
    const transaction = await checkTransactionStatus(checkoutRequestID);
    
    console.log("📊 [Status Check] Result:", {
      status: transaction.status,
      receipt: transaction.mpesaReceiptNumber,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      status: transaction.status,
      receipt: transaction.mpesaReceiptNumber,
      transaction
    });

  } catch (error) {
    console.error("🔥 [Status Check] Failed:", {
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      },
      query: req.query,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: "Status check failed",
      details: error.message,
      reference: "See server logs for troubleshooting"
    });
  }
};

export const mpesaCallback = async (req, res) => {
  try {
    console.log("📩 [Callback] Received:", {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    const callbackData = req.body;
    
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      console.log("💰 [Callback] Successful Payment");
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
      
      const updateData = {
        status: 'SUCCESS',
        mpesaReceiptNumber: callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value,
        transactionDate: new Date(
          callbackMetadata.find(item => item.Name === 'TransactionDate').Value.toString()
        )
      };

      console.log("🔄 [Callback] Updating Transaction:", updateData);
      await prisma.transaction.update({
        where: { checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID },
        data: updateData
      });

    } else {
      console.warn("⚠️ [Callback] Failed Payment:", {
        resultCode: callbackData.Body.stkCallback.ResultCode,
        resultDesc: callbackData.Body.stkCallback.ResultDesc
      });
      await prisma.transaction.update({
        where: { checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID },
        data: { status: 'FAILED' }
      });
    }

    res.status(200).send();

  } catch (error) {
    console.error("🔥 [Callback] Processing Error:", {
      error: {
        message: error.message,
        stack: error.stack
      },
      rawCallback: req.body,
      timestamp: new Date().toISOString()
    });

    res.status(500).send();
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    console.log("📜 [History] Request:", {
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const { phoneNumber, limit = 10 } = req.query;
    
    if (!phoneNumber) {
      console.error("❌ [History] Missing phoneNumber");
      return res.status(400).json({ 
        success: false,
        error: 'phoneNumber is required' 
      });
    }

    console.log("🔍 [History] Querying Database...");
    const transactions = await prisma.transaction.findMany({
      where: { phoneNumber },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    console.log("📊 [History] Found Transactions:", {
      count: transactions.length,
      phoneNumber,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error("🔥 [History] Database Error:", {
      error: {
        message: error.message,
        stack: error.stack
      },
      query: req.query,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
};