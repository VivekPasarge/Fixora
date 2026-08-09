import "./Footer.css";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import {
  quickLinks,
  serviceLinks,
  companyLinks,
  contactInfo,
} from "./footerData";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}

        <div className="footer-column">

          <h2 className="footer-logo">
            Fixora
          </h2>

          <p className="footer-description">
            Fixora connects homeowners with trusted and verified
            professionals for electrical, plumbing, AC repair,
            cleaning, painting and many more home services.
          </p>

          <div className="footer-social">

            <a href="#">
              <FaFacebookF />
            </a>

            <a href="#">
              <FaInstagram />
            </a>

            <a href="#">
              <FaLinkedinIn />
            </a>

            <a href="#">
              <FaXTwitter />
            </a>

          </div>

        </div>

        {/* Quick Links */}

        <div className="footer-column">

          <h3>Quick Links</h3>

          <ul>

            {quickLinks.map((item) => (
              <li key={item.name}>
                <Link to={item.path}>
                  {item.name}
                </Link>
              </li>
            ))}

          </ul>

        </div>

        {/* Services */}

        <div className="footer-column">

          <h3>Popular Services</h3>

          <ul>

            {serviceLinks.map((service) => (
              <li key={service}>
                <Link to="/services">
                  {service}
                </Link>
              </li>
            ))}

          </ul>

        </div>

        {/* Contact */}

        <div className="footer-column">

          <h3>Contact</h3>

          <ul className="contact-list">

            <li>
              <FiMapPin />
              <span>{contactInfo.address}</span>
            </li>

            <li>
              <FiPhone />
              <span>{contactInfo.phone}</span>
            </li>

            <li>
              <FiMail />
              <span>{contactInfo.email}</span>
            </li>

          </ul>

          <h3 className="company-title">
            Company
          </h3>

          <ul>

            {companyLinks.map((item) => (
              <li key={item}>
                <a href="#">
                  {item}
                </a>
              </li>
            ))}

          </ul>

        </div>

      </div>

      {/* Bottom */}

      <div className="footer-bottom">

        <div className="footer-container footer-bottom-content">

          <p>
            © 2026 Fixora. All Rights Reserved.
          </p>

          <p>
            Made with ❤️ in India
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;