import "./LiveTrackingCard.css";
import {
  FiMapPin,
  FiNavigation,
  FiClock,
  FiArrowRight,
  FiPhone,
  FiMessageCircle,
  FiShield,
  FiStar,
} from "react-icons/fi";

const LiveTrackingCard = () => {
  return (
    <section className="live-tracking">

      <div className="tracking-header">

        <div>

          <h2>Live Technician Tracking</h2>

          <p>
            Your technician is on the way. Follow the journey in real time.
          </p>

        </div>

        <div className="live-status">

          <span className="pulse"></span>

          LIVE

        </div>

      </div>

      <div className="tracking-container">

        <div className="tracking-map">

          <div className="road"></div>

          <div className="pin start-pin"></div>

          <div className="pin end-pin"></div>

          <div className="van">
            🚚
          </div>

          <div className="eta-card">

            <FiClock />

            <div>

              <span>Estimated Arrival</span>

              <h3>12 Minutes</h3>

            </div>

          </div>

        </div>

        <div className="tracking-info">

          <div className="technician-profile">

            <img
              src="https://ui-avatars.com/api/?name=Rahul+Sharma&background=2563eb&color=fff&size=256"
              alt="Technician"
            />

            <div className="tech-content">

              <h3>Rahul Sharma</h3>

              <p>Certified Electrician</p>

              <div className="badges">

                <span className="verified">

                  <FiShield />

                  Verified

                </span>

                <span className="rating">

                  <FiStar />

                  4.9

                </span>

                <span className="jobs">

                  524 Jobs

                </span>

              </div>

            </div>

          </div>

          <div className="journey-card">

            <div className="journey-top">

              <span>Journey Progress</span>

              <strong>72%</strong>

            </div>

            <div className="progress">

              <div className="progress-fill"></div>

            </div>

            <small>Technician is only 2.4 km away</small>

          </div>

          <div className="location-card">

            <div className="location-item">

              <FiMapPin className="icon"/>

              <div>

                <span>Current Location</span>

                <h4>Indiranagar, Bengaluru</h4>

              </div>

            </div>

            <div className="location-item">

              <FiNavigation className="icon"/>

              <div>

                <span>Destination</span>

                <h4>Your Home</h4>

              </div>

            </div>

          </div>

          <div className="booking-card">

            <div>

              <span>Booking ID</span>

              <h4>#FXR20451</h4>

            </div>

            <div>

              <span>OTP</span>

              <h4>4281</h4>

            </div>

          </div>

          <div className="button-group">

            <button className="call-btn">

              <FiPhone />

              Call

            </button>

            <button className="chat-btn">

              <FiMessageCircle />

              Chat

            </button>

            <button className="track-btn">

              Track Live

              <FiArrowRight />

            </button>

          </div>

        </div>

      </div>

    </section>
  );
};

export default LiveTrackingCard;