import axios from 'axios';
import mpesaConfig from '../config/mpesaConfig.js';
import prisma from '../config/db.js';

// Password generation utility function
const generateMpesaPassword = (shortcode, passkey) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14); // Format: YYYYMMDDHHmmss
  
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
};

// Timestamp generation utility function
const getMpesaTimestamp = () => {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
};

export const generateToken = async () => {
  try {
    console.log("Using credentials:", mpesaConfig.consumerKey);
    const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
    
    const response = await axios.get(mpesaConfig.tokenURL, {
      headers: { Authorization: `Basic ${auth}` }
    });
    
    if (!response.data.access_token) {
      throw new Error("No access token in response");
    }
    
    return response.data.access_token;
  } catch (error) {
    console.error("Token generation failed:", {
      config: mpesaConfig,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

export const initiateSTKPush = async (phone, amount, accountReference, transactionDesc = "Payment") => {
  const token = await generateToken();

  const payload = {
    BusinessShortCode: mpesaConfig.businessShortCode,
    Password: generateMpesaPassword(mpesaConfig.businessShortCode, mpesaConfig.passkey),
    Timestamp: getMpesaTimestamp(),
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: mpesaConfig.businessShortCode,
    PhoneNumber: phone,
    CallBackURL: mpesaConfig.callbackURL,
    AccountReference: accountReference.substring(0, 12), // Ensure max 12 chars
    TransactionDesc: transactionDesc.substring(0, 13) // Ensure max 13 chars
  };

  try {
    console.log("Initiating STK Push with payload:", payload);
    const response = await axios.post(mpesaConfig.stkPushURL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("M-Pesa Response:", response.data);
    const transaction = await prisma.transaction.create({
      data: {
        phoneNumber: phone,
        amount,
        accountReference,
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        status: 'PENDING'
      }
    });

    return {
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription
    };
  } catch (error) {
    console.error('STK Push error:', {
      error: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    throw error;
  }
};

export const checkTransactionStatus = async (checkoutRequestID) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestID }
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  } catch (error) {
    console.error('Error checking transaction status:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};