import "./ProfileSummary.css";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiEdit,
} from "react-icons/fi";

const ProfileSummary = () => {
  return (
    <section className="profile-summary">

      <div className="profile-top">

        <img
          src="https://ui-avatars.com/api/?name=Vivek+Pasarge&background=2563eb&color=ffffff&size=256"
          alt="Profile"
        />

        <h2>Vivek Pasarge</h2>

        <span className="member-badge">
          Premium Member
        </span>

      </div>

      <div className="profile-info">

        <div className="info-item">

          <FiUser className="info-icon" />

          <div>

            <span>Full Name</span>

            <h4>Vivek Pasarge</h4>

          </div>

        </div>

        <div className="info-item">

          <FiPhone className="info-icon" />

          <div>

            <span>Phone</span>

            <h4>+91 63663 35828</h4>

          </div>

        </div>

        <div className="info-item">

          <FiMail className="info-icon" />

          <div>

            <span>Email</span>

            <h4>vivek@email.com</h4>

          </div>

        </div>

        <div className="info-item">

          <FiMapPin className="info-icon" />

          <div>

            <span>Address</span>

            <h4>Bengaluru, Karnataka</h4>

          </div>

        </div>

        <div className="info-item">

          <FiCalendar className="info-icon" />

          <div>

            <span>Joined</span>

            <h4>July 2026</h4>

          </div>

        </div>

      </div>

      <button className="edit-profile-btn">

        <FiEdit />

        Edit Profile

      </button>

    </section>
  );
};

export default ProfileSummary;