import "../Stylings/BestSellers.css";
import gas from "../assets/Gas_Pics/gas13kg.jpg";
import gasrefill from "../assets/Gas_Pics/gasrefill.jpeg";
import fifteenkggas from "../assets/Gas_Pics/15kg-gas.jpeg";
import grill from "../assets/Gas_Pics/grill.jpeg";
import campingstove from "../assets/Gas_Pics/campingstove.jpeg";
import cooker from "../assets/Gas_Pics/cooker.jpeg";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom"; // For navigation

const BestSellers = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate(); // For navigation

  // Product data
  const discountedProducts = [
    {
      id: 1,
      name: "6kg Gas Cylinder",
      image: gas,
      oldPrice: 50,
      newPrice: 40,
      discount: "20% OFF",
    },
    {
      id: 2,
      name: "13kg Gas Refill",
      image: gasrefill,
      oldPrice: 70,
      newPrice: 59.5,
      discount: "15% OFF",
    },
    {
      id: 3,
      name: "Double Burner Gas Stove",
      image: cooker,
      oldPrice: 100,
      newPrice: 90,
      discount: "10% OFF",
    },
  ];

  const bestsellingProducts = [
    { id: 4, name: "15kg Gas Cylinder", image: fifteenkggas, price: 85 },
    { id: 5, name: "6kg Gas Refill", image: gasrefill, price: 25 },
    { id: 6, name: "Portable Gas Grill", image: grill, price: 120 },
    { id: 7, name: "Camping Gas Stove", image: campingstove, price: 60 },
  ];

  const handleBuyNow = (product) => {
    addToCart(product); // Add product to cart
    navigate("/cart"); // Navigate to cart page
  };

  return (
    <section id="best-sellers" className="bestsellers-section">
      <h2 className="section-title">Here are our Best Sellers</h2>

      <div className="bestsellers-container">
        {/* Left Column - Discounted Products */}
        <div className="discounted-products">
          <h3>Discounted Products</h3>
          {discountedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <span className="discount-badge">{product.discount}</span>
              <img src={product.image} alt={product.name} className="product-image" />
              <h4>{product.name}</h4>
              <p className="old-price">${product.oldPrice.toFixed(2)}</p>
              <p className="new-price">${product.newPrice.toFixed(2)}</p>
              <button
                className="buy-now"
                onClick={() => handleBuyNow({ ...product, price: product.newPrice })}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Right Column - Best-Selling Products */}
        <div className="bestselling-products">
          <h3>Best-Selling Products</h3>
          <div className="product-grid">
            {bestsellingProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <h4>{product.name}</h4>
                <p className="price">${product.price.toFixed(2)}</p>
                <button
                  className="buy-now"
                  onClick={() => handleBuyNow(product)}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;