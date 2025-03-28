import { useState } from "react";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import "../Stylings/Checkout.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Checkout = () => {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total price
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Validate M-Pesa phone number
  const isValidPhone = (phone) => {
    const regex = /^254(7|1)\d{8}$/;
    return regex.test(phone);
  };

  // Handle M-Pesa payment
  const handleMpesaPayment = async () => {
    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid M-Pesa phone number (e.g., 254712345678)");
      return;
    }

    if (total <= 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    toast.info("Initiating M-Pesa payment...");

    try {
      const response = await fetch("http://localhost:3001/api/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          amount: total,
          accountReference: `GAS-${Date.now()}`,
          transactionDesc: "Gas purchase",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment request failed");
      }

      const data = await response.json();
      
      toast.success(
        <div>
          <p>M-Pesa payment request sent!</p>
          <p>Check your phone to complete payment</p>
        </div>,
        { autoClose: false }
      );

      // Start polling for payment status
      await checkPaymentStatus(data.checkoutRequestID);
      
    } catch (error) {
      toast.error(`Payment error: ${error.message}`);
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll payment status
  const checkPaymentStatus = async (checkoutRequestID) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 3000; // 3 seconds
    
    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`http://localhost:3001/api/mpesa/status?checkoutRequestID=${checkoutRequestID}`);
        const data = await response.json();
        
        if (data.status === "success") {
          clearCart();
          navigate("/order-confirmation", { state: { transaction: data } });
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          toast.warn("Payment verification timeout. Please check your M-Pesa messages.");
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        }
      }
    };
    
    await poll();
  };

  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Cart
      </button>
      
      <h1>Checkout</h1>

      <div className="checkout-container">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="order-total">
            <h3>Total: KES {total.toFixed(2)}</h3>
          </div>
        </div>

        {/* Payment Section */}
        <div className="payment-section">
          <div className="payment-method">
            <h2>Payment Method</h2>
            <div className="payment-option">
              <input
                type="radio"
                id="mpesa"
                name="payment"
                value="mpesa"
                defaultChecked
                disabled={isProcessing}
              />
              <label htmlFor="mpesa">M-Pesa</label>
            </div>
          </div>

          <div className="mpesa-form">
            <h2>M-Pesa Payment Details</h2>
            <div className="form-group">
              <label>M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isProcessing}
              />
              <small>Format: 2547XXXXXXXX (e.g., 254712345678)</small>
            </div>

            <button
              className={`pay-now-btn ${isProcessing ? "processing" : ""}`}
              onClick={handleMpesaPayment}
              disabled={isProcessing || cart.length === 0}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                "Pay with M-Pesa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;