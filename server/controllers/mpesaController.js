import { initiateSTKPush as initiateSTKService, checkTransactionStatus } from '../services/mpesaService.js';
import prisma from '../config/db.js';

export const initiateSTKPush = async (req, res) => {
  try {
    console.log("🔔 [STK Push] Incoming Request:", {
      headers: redactSensitiveHeaders(req.headers),
      body: redactSensitiveBody(req.body),
      timestamp: new Date().toISOString()
    });

    const { phone, amount, accountReference } = req.body;

    // Validation
    if (!phone || !amount || !accountReference) {
      console.error("❌ [STK Push] Validation Failed - Missing Fields:", {
        received: { phone, amount, accountReference }
      });
      return res.status(400).json({
        status: "FAILED",
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
    
    console.log("✅ [STK Push] Success Response:", {
      checkoutRequestID: result.checkoutRequestID,
      merchantRequestID: result.merchantRequestID,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      status: "SUCCESS",
      data: {
        checkoutRequestID: result.checkoutRequestID,
        merchantRequestID: result.merchantRequestID,
        amount: amount,
        phoneNumber: phone,
        accountReference: accountReference
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("🔥 [STK Push] Critical Error:", {
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      },
      request: {
        body: redactSensitiveBody(req.body),
        headers: redactSensitiveHeaders(req.headers)
      },
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      status: "FAILED",
      error: error.message.includes("token") 
        ? "M-Pesa authentication failed (check credentials)" 
        : "Payment processing error",
      reference: "See server logs for details",
      timestamp: new Date().toISOString()
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
        status: "FAILED",
        error: "checkoutRequestID is required",
        timestamp: new Date().toISOString()
      });
    }

    console.log("🔄 [Status Check] Querying Transaction Status...");
    const transaction = await checkTransactionStatus(checkoutRequestID);
    
    if (!transaction) {
      console.error("❌ [Status Check] Transaction Not Found");
      return res.status(404).json({
        status: "FAILED",
        error: "Transaction not found",
        timestamp: new Date().toISOString()
      });
    }

    console.log("📊 [Status Check] Result:", {
      status: transaction.status,
      receipt: transaction.mpesaReceiptNumber,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      status: transaction.status === "SUCCESS" ? "SUCCESS" : "PENDING",
      data: {
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        amount: transaction.amount,
        phoneNumber: transaction.phoneNumber,
        transactionDate: transaction.transactionDate
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("🔥 [Status Check] Failed:", {
      error: {
        message: error.message,
        stack: error.stack
      },
      query: req.query,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      status: "FAILED",
      error: "Status check failed",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const mpesaCallback = async (req, res) => {
  try {
    console.log("📩 [Callback] Received:", {
      body: redactSensitiveCallback(req.body),
      headers: redactSensitiveHeaders(req.headers),
      timestamp: new Date().toISOString()
    });

    const callbackData = req.body;
    
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      const items = callbackData.Body.stkCallback.CallbackMetadata.Item;
      const receipt = items.find(i => i.Name === "MpesaReceiptNumber").Value;
      const rawDate = items.find(i => i.Name === "TransactionDate").Value;
      
      // Format: YYYYMMDDHHmmss → ISO format
      const transactionDate = new Date(
        rawDate.toString().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6')
      );

      console.log("💰 [Callback] Successful Payment:", {
        receipt,
        transactionDate,
        requestID: callbackData.Body.stkCallback.CheckoutRequestID
      });

      await prisma.transaction.update({
        where: { checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID },
        data: {
          status: "SUCCESS",
          mpesaReceiptNumber: receipt,
          transactionDate: transactionDate
        }
      });

      res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Accepted",
        timestamp: new Date().toISOString()
      });

    } else {
      console.warn("⚠️ [Callback] Failed Payment:", {
        resultCode: callbackData.Body.stkCallback.ResultCode,
        resultDesc: callbackData.Body.stkCallback.ResultDesc,
        requestID: callbackData.Body.stkCallback.CheckoutRequestID
      });
      
      await prisma.transaction.update({
        where: { checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID },
        data: { status: "FAILED" }
      });

      res.status(200).json({
        ResultCode: 1,
        ResultDesc: "Failed",
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("🔥 [Callback] Processing Error:", {
      error: {
        message: error.message,
        stack: error.stack
      },
      rawCallback: redactSensitiveCallback(req.body),
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      ResultCode: 1,
      ResultDesc: "Server error",
      timestamp: new Date().toISOString()
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    console.log("📜 [History] Request:", {
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const { phoneNumber, limit = 10, page = 1 } = req.query;
    
    if (!phoneNumber) {
      console.error("❌ [History] Missing phoneNumber");
      return res.status(400).json({ 
        status: "FAILED",
        error: "phoneNumber is required",
        timestamp: new Date().toISOString()
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { phoneNumber };

    console.log("🔍 [History] Querying Database...");
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip
      }),
      prisma.transaction.count({ where })
    ]);
    
    console.log("📊 [History] Found Transactions:", {
      count: transactions.length,
      total: totalCount,
      phoneNumber,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      status: "SUCCESS",
      data: transactions,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: skip + transactions.length < totalCount
      },
      timestamp: new Date().toISOString()
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
      status: "FAILED",
      error: "Failed to fetch transactions",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper functions for data redaction
function redactSensitiveHeaders(headers) {
  const sensitive = ['authorization', 'cookie'];
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => 
      [k, sensitive.includes(k.toLowerCase()) ? 'REDACTED' : v])
  );
}

function redactSensitiveBody(body) {
  if (!body) return body;
  return {
    ...body,
    password: body.password ? 'REDACTED' : undefined,
    token: body.token ? 'REDACTED' : undefined
  };
}

function redactSensitiveCallback(callbackData) {
  if (!callbackData?.Body?.stkCallback?.CallbackMetadata?.Item) return callbackData;
  return {
    ...callbackData,
    Body: {
      stkCallback: {
        ...callbackData.Body.stkCallback,
        CallbackMetadata: {
          Item: callbackData.Body.stkCallback.CallbackMetadata.Item.map(item => 
            item.Name === 'MpesaReceiptNumber' 
              ? { ...item, Value: item.Value?.toString().replace(/.(?=.{4})/g, 'X') } 
              : item
          )
        }
      }
    }
  };
}