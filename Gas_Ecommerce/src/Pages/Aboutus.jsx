import "../Stylings/Aboutus.css";
import ceo from "../assets/Gas_Pics/CEO.jpeg";
import jane from  "../assets/Gas_Pics/jane_doe.jpg"

const Aboutus = () => {
  return (
    <div className="about-container" id="aboutus">
      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="section-content">
          <h2>Our Mission</h2>
          <p>To provide safe, reliable, and efficient gas supply services.</p>
        </div>
        <div className="section-content">
          <h2>Our Vision</h2>
          <p>
            To be the leading gas supplier with innovative energy solutions.
          </p>
        </div>
      </section>

      {/* Why Choose Us? */}
      <section className="why-choose-us">
        <h2>Why Choose Us?</h2>
        <div className="features">
          <div className="feature-card">🚀 Fast Delivery</div>
          <div className="feature-card">💡 Quality Products</div>
          <div className="feature-card">💳 Secure Payments</div>
          <div className="feature-card">📞 24/7 Support</div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="team">
        <h2>Meet Our Team</h2>
        <div className="team-container">
          <div className="team-card">
            <img src={ceo} alt="CEO" />
            <h3>John Doe</h3>
            <p>CEO & Founder</p>
          </div>
          <div className="team-card">
            <img src={jane} alt="Manager" />
            <h3>Jane Smith</h3>
            <p>Operations Manager</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-container">
          <div className="testimonial">
            <p>Fastest gas delivery service Ive ever used!</p>
            <h4>- Emily R.</h4>
          </div>
          <div className="testimonial">
            <p>Reliable and affordable. Highly recommend!</p>
            <h4>- Michael B.</h4>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Aboutus;
