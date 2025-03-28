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

  // Handle M-Pesa payment
  const handleMpesaPayment = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX)");
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("M-Pesa payment request sent! Check your phone to complete payment");
        // Poll for payment completion (simplified example)
        setTimeout(() => {
          clearCart();
          navigate("/order-confirmation");
        }, 30000); // Wait 30 seconds before redirecting (in real app, poll backend)
      } else {
        throw new Error(data.error || "Payment failed");
      }
    } catch (error) {
      toast.error(`Payment error: ${error.message}`);
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-container">
        {/* Payment Method Selection */}
        <div className="payment-method">
          <h2>Payment Method</h2>
          <div className="payment-option">
            <input
              type="radio"
              id="mpesa"
              name="payment"
              value="mpesa"
              defaultChecked
            />
            <label htmlFor="mpesa">M-Pesa</label>
          </div>
        </div>

        {/* M-Pesa Payment Form */}
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
            />
            <small>Format: 2547XXXXXXXX (e.g., 254712345678)</small>
          </div>

          <button
            className="pay-now-btn"
            onClick={handleMpesaPayment}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay with M-Pesa"}
          </button>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: KES {total.toFixed(2)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;