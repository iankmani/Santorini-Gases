import '../Stylings/OrderConfirmation.css';
import { FaCheckCircle } from 'react-icons/fa'; // Install with: npm install react-icons
import { useLocation } from "react-router-dom";
const OrderConfirmation = () => {
  const { state } = useLocation();
  const { transaction } = state || {};

  return (
    <div className="confirmation-page">
      <div className="confirmation-header">
        <FaCheckCircle className="success-icon" />
        <h1>Payment Successful!</h1>
      </div>

      <div className="receipt-card">
        <div className="receipt-row">
          <span className="receipt-label">Amount:</span>
          <span className="receipt-value">KES {transaction?.amount}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Phone:</span>
          <span className="receipt-value">{transaction?.phoneNumber}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Reference:</span>
          <span className="receipt-value">{transaction?.accountReference}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">M-Pesa Code:</span>
          <span className="receipt-value">{transaction?.mpesaReceiptNumber}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="print-btn" onClick={() => window.print()}>
          Print Receipt
        </button>
        <button 
          className="home-btn" 
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
