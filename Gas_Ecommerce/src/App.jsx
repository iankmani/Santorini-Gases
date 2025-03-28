import "./App.css";
import Home from "./Pages/Home";
import CartPage from "./Pages/CartPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
      {/* <Home /> */}
    </>
  );
}

export default App;
