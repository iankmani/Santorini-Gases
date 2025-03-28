import "../Stylings/Home.css";
import pgs from "../../src/assets/Gas_Pics/portable_gas_stove.jpg";
import gaspic from "../assets/Gas_Pics/gas13kg.jpg";
import accessories from "../assets/Gas_Pics/accessories.jpg";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom"; // For navigation

const FeaturedSec = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate(); // For navigating to the cart page

  const products = [
    { id: 1, name: "High-quality gas cylinders", image: gaspic, price: 40.0 },
    { id: 2, name: "Portable gas stoves", image: pgs, price: 60.0 },
    { id: 3, name: "Premium gas accessories", image: accessories, price: 25.0 },
  ];

  const handleAddToCart = (product) => {
    addToCart(product); // Add product to cart
    navigate("/cart"); // Navigate to the cart page
  };

  return (
    <section className="featured" id="featured-products">
      <h2>Featured Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <p>Top-quality product for your needs.</p>
            <p className="price">${product.price.toFixed(2)}</p>
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSec;