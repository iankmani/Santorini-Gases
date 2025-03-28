import "./App.css";
import Home from "./Pages/Home";
import CartPage from "./Pages/CartPage";
import Checkout from "./Pages/Checkout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
      {/* <Home /> */}
    </>
  );
}

export default App;
