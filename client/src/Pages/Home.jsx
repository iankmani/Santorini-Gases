import "../Stylings/Home.css";
import HeroSection from "../Components/HeroSection.jsx";
import FeaturedSec from "./FeaturedSec.jsx";
import Aboutus from "./Aboutus.jsx";
import Contact from "./Contact.jsx";
import BestSellers from "./Bestsellers.jsx";
import Categories from "./Categories.jsx";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedSec />
      <BestSellers/>
      <Categories/>
      <Aboutus />
      <Contact />
    </>
  );
};

export default Home;
