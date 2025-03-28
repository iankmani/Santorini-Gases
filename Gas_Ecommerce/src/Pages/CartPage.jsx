import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import "../Stylings/CartPage.css";

const CartPage = () => {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = 
    useCartStore();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back to previous page"
      >
        &larr; Continue Shopping
      </button>
      
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/')}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="item-image"
                  />
                )}
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => decreaseQuantity(item.id)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => increaseQuantity(item.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-details">
              <h2>Total: ${total.toFixed(2)}</h2>
              <p>{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
            </div>
            <div className="cart-actions">
              <button 
                onClick={clearCart}
                className="clear-cart-btn"
              >
                Clear Cart
              </button>
              <button 
                onClick={() => navigate("/checkout")}
                className="checkout-button"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;