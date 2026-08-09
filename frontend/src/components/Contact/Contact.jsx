import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiSend,
} from "react-icons/fi";

import "./Contact.css";

const Contact = () => {
  return (
    <section
      id="contact"
      className="contact-section"
    >
      <div className="container">

        {/* Left */}

        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >

          <span className="contact-tag">
            CONTACT US
          </span>

          <h2>
            Let's Get In Touch
          </h2>

          <p>
            Need help booking a service or have a question about
            Fixora? Our support team is always ready to help you.
          </p>

          <div className="contact-item">

            <FiMapPin />

            <div>
              <h3>Address</h3>
              <p>Bengaluru, Karnataka, India</p>
            </div>

          </div>

          <div className="contact-item">

            <FiPhone />

            <div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>

          </div>

          <div className="contact-item">

            <FiMail />

            <div>
              <h3>Email</h3>
              <p>support@fixora.com</p>
            </div>

          </div>

        </motion.div>

        {/* Right */}

        <motion.div
          className="contact-form-card"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >

          <h2>Send a Message</h2>

          <form className="contact-form">

            <input
              type="text"
              placeholder="Your Name"
            />

            <input
              type="email"
              placeholder="Your Email"
            />

            <input
              type="text"
              placeholder="Subject"
            />

            <textarea
              rows="6"
              placeholder="Write your message..."
            ></textarea>

            <button type="submit">
              <FiSend />
              Send Message
            </button>

          </form>

        </motion.div>

      </div>
    </section>
  );
};

export default Contact;