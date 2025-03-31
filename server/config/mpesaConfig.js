// config/mpesaConfig.js
export default {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackURL: process.env.MPESA_CALLBACK_URL,
  transactionType: process.env.MPESA_TRANSACTION_TYPE,
  tokenURL: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  stkPushURL: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
};