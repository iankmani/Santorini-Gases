import useCartStore from "../store/cartStore";

const Cart = () => {
  const { cart, removeFromCart, totalPrice } = useCartStore();

  return (
    <section className="cart-page">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <h3>Total Price: ${totalPrice()}</h3>
          <button className="purchase-btn">Purchase</button>
        </div>
      )}
    </section>
  );
};

export default Cart;
