// import React from "react";
import useCartStore from "../store/cartStore"; // Import your Zustand store
import "../Stylings/CartPage.css"; // Import the CSS file

const CartPage = () => {
  // Get cart state and actions from the store
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } =
    useCartStore();

  // Calculate total price
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page" >
      <h1>Your Cart</h1>

      {/* Display cart items */}
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>Price: ${item.price.toFixed(2)}</p>
                <p>
                  Quantity:
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  {item.quantity}
                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </p>
                <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Display total price */}
      {cart.length > 0 && (
        <div className="cart-summary">
          <h2>Total: ${total.toFixed(2)}</h2>
          <button onClick={clearCart}>Clear Cart</button>
          <button onClick={() => alert("Proceeding to checkout...")}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;