import "./UpcomingBooking.css";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiStar,
} from "react-icons/fi";

import technician from "../../assets/hero/hero-right.png";

const UpcomingBooking = () => {
  return (
    <section className="upcoming-booking">

      <div className="booking-header">

        <div>

          <h2>Upcoming Booking</h2>

          <p>
            Your technician is confirmed and will arrive shortly.
          </p>

        </div>

        <span className="booking-status">
          Confirmed
        </span>

      </div>

      <div className="booking-body">

        <div className="technician-card">

          <img
            src={technician}
            alt="Technician"
          />

          <h3>Rahul Sharma</h3>

          <p>Certified Electrician</p>

          <div className="rating">

            <FiStar />

            <FiStar />

            <FiStar />

            <FiStar />

            <FiStar />

            <span>4.9 Rating</span>

          </div>

        </div>

        <div className="booking-details">

          <div className="details-grid">

            <div className="detail-card">

              <div className="detail-icon">

                <FiCalendar />

              </div>

              <div>

                <span>Date</span>

                <h4>12 July 2026</h4>

              </div>

            </div>

            <div className="detail-card">

              <div className="detail-icon">

                <FiClock />

              </div>

              <div>

                <span>Time</span>

                <h4>10:30 AM</h4>

              </div>

            </div>

            <div className="detail-card full-width">

              <div className="detail-icon">

                <FiMapPin />

              </div>

              <div>

                <span>Address</span>

                <h4>
                  24 MG Road, Bengaluru, Karnataka
                </h4>

              </div>

            </div>

          </div>

          <div className="booking-buttons">

            <button className="track-btn">

              <FiNavigation />

              Track Live

            </button>

            <button className="call-btn">

              <FiPhone />

              Call Technician

            </button>

          </div>

        </div>

      </div>

    </section>
  );
};

export default UpcomingBooking;