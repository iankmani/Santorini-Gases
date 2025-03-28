import "../Stylings/Contact.css";

const Contact = () => {
  return (
    <div>
      {/* 📌 Contact Section */}
      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <p>Have questions? Get in touch with us!</p>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="4" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
