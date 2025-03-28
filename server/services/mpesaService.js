const axios = require('axios');
const mpesaConfig = require('../config/mpesaConfig');
const prisma = require('../config/db');

const generateToken = async () => {
  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
  
  try {
    const response = await axios.get(mpesaConfig.tokenURL, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating token:', error.response?.data || error.message);
    throw error;
  }
};

const initiateSTKPush = async (phone, amount, accountReference, transactionDesc) => {
  const token = await generateToken();
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -3);
  const password = Buffer.from(`${mpesaConfig.businessShortCode}${mpesaConfig.passkey}${timestamp}`).toString('base64');
  
  const payload = {
    BusinessShortCode: mpesaConfig.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: mpesaConfig.transactionType,
    Amount: amount,
    PartyA: phone,
    PartyB: mpesaConfig.businessShortCode,
    PhoneNumber: phone,
    CallBackURL: mpesaConfig.callbackURL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  };

  try {
    const response = await axios.post(mpesaConfig.stkPushURL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

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
    console.error('STK Push error:', error.response?.data || error.message);
    throw error;
  }
};

const checkTransactionStatus = async (checkoutRequestID) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestID }
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  } catch (error) {
    console.error('Error checking transaction status:', error);
    throw error;
  }
};

module.exports = {
  initiateSTKPush,
  checkTransactionStatus
};