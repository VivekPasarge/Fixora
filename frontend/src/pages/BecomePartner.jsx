import { motion } from "framer-motion";
//import { default as CountUp } from "react-countup";
import * as CountUp from "react-countup";
import {
  FiArrowRight,
  FiCheckCircle,
  FiDollarSign,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./BecomePartner.css";

const BecomePartner = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
confirmPassword: "",
    dob: "",
    profession: "",
    experience: "",
    workingCity: "",
    languages: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (formData.password !== formData.confirmPassword) {
  alert("Passwords do not match");
  setLoading(false);
  return;
}

      const response = await api.post("/partners", formData);

      alert(response.data.message);
setFormData({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  dob: "",
  profession: "",
  experience: "",
  workingCity: "",
  languages: "",
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
  upiId: "",
});
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="partner-page">

        {/* Hero */}

        <section className="partner-hero">
          <div className="partner-container">

            <motion.div
              className="partner-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="partner-badge">
                JOIN FIXORA PARTNER NETWORK
              </span>

              <h1>
                Earn More by Becoming a
                <span> Fixora Partner</span>
              </h1>

              <p>
                Join thousands of skilled professionals providing trusted
                home services across India. Choose your own working hours,
                accept nearby jobs and grow your income with Fixora.
              </p>

              <div className="hero-buttons">
<button
  className="primary-btn"
  onClick={() =>
    document
      .querySelector(".partner-registration")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }
>
  Register Now
  <FiArrowRight />
</button>

                <button
  className="secondary-btn"
  onClick={() =>
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }
>
  Learn More
</button>
              </div>
            </motion.div>

            <motion.div
              className="partner-right"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="earn-card">
                <h2>₹25,000+</h2>
                <p>Average Monthly Earnings</p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Benefits */}

        <section className="partner-benefits">

          <div className="partner-container">

            <div className="section-heading">
              <span>WHY JOIN FIXORA</span>
              <h2>Everything You Need To Grow</h2>
            </div>

            <div className="benefits-grid">

              <div className="benefit-card">
                <FiDollarSign />
                <h3>Higher Earnings</h3>
                <p>
                  Earn competitive income with transparent payouts.
                </p>
              </div>

              <div className="benefit-card">
                <FiClock />
                <h3>Flexible Schedule</h3>
                <p>
                  Work whenever you want and accept only the jobs you like.
                </p>
              </div>

              <div className="benefit-card">
                <FiUsers />
                <h3>More Customers</h3>
                <p>
                  Receive bookings from thousands of nearby customers.
                </p>
              </div>

              <div className="benefit-card">
                <FiCheckCircle />
                <h3>Verified Platform</h3>
                <p>
                  Build trust with customers through verified profiles.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* How It Works */}

<section id="how-it-works" className="partner-process">

  <div className="partner-container">

    <div className="section-heading">

      <span>HOW IT WORKS</span>

      <h2>Become a Fixora Partner in 4 Simple Steps</h2>

      <p className="process-subtitle">
        Join our trusted network and start receiving nearby service requests.
      </p>

    </div>

    <div className="timeline">

      <div className="timeline-item">

        <div className="timeline-icon">
          📝
        </div>

        <div className="timeline-content">

          <span>STEP 1</span>

          <h3>Apply Online</h3>

          <p>
            Fill in your personal and professional details using the partner registration form.
          </p>

        </div>

      </div>

      <div className="timeline-item">

        <div className="timeline-icon">
          📄
        </div>

        <div className="timeline-content">

          <span>STEP 2</span>

          <h3>Upload Documents</h3>

          <p>
            Submit your Aadhaar, profile photo, and supporting documents for verification.
          </p>

        </div>

      </div>

      <div className="timeline-item">

        <div className="timeline-icon">
          ✅
        </div>

        <div className="timeline-content">

          <span>STEP 3</span>

          <h3>Verification & Approval</h3>

          <p>
            Our team reviews your application and activates your technician account.
          </p>

        </div>

      </div>

      <div className="timeline-item">

        <div className="timeline-icon">
          💰
        </div>

        <div className="timeline-content">

          <span>STEP 4</span>

          <h3>Start Earning</h3>

          <p>
            Accept nearby bookings, complete services, and grow your monthly income.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

        {/* Eligibility */}

        <section className="partner-eligibility">

          <div className="partner-container">

            <div className="section-heading">

              <span>WHO CAN JOIN?</span>

              <h2>Basic Eligibility Requirements</h2>

              <p>
                Becoming a Fixora Partner is simple. If you meet the
                following requirements, you're ready to start your journey.
              </p>

            </div>

            <div className="eligibility-grid">

              <div className="eligibility-card">
                <div className="eligibility-icon">👤</div>
                <h3>18+ Years</h3>
                <p>You must be at least 18 years old.</p>
              </div>

              <div className="eligibility-card">
                <div className="eligibility-icon">🪪</div>
                <h3>Valid Aadhaar</h3>
                <p>Aadhaar verification is mandatory.</p>
              </div>

              <div className="eligibility-card">
                <div className="eligibility-icon">🛠</div>
                <h3>Professional Skill</h3>
                <p>Experience in any service category.</p>
              </div>

              <div className="eligibility-card">
                <div className="eligibility-icon">📱</div>
                <h3>Smartphone</h3>
                <p>Required for accepting and managing jobs.</p>
              </div>

              <div className="eligibility-card">
                <div className="eligibility-icon">🏦</div>
                <h3>Bank Account</h3>
                <p>Required for receiving payments.</p>
              </div>

              <div className="eligibility-card">
                <div className="eligibility-icon">📍</div>
                <h3>Service Area</h3>
                <p>Select your preferred working locations.</p>
              </div>

            </div>

          </div>

        </section>

       {/* Earnings */}

<section className="partner-earnings">

  <div className="partner-container">

    <div className="section-heading">

      <span>ESTIMATED EARNINGS</span>

      <h2>Turn Your Skills Into Monthly Income</h2>

      <p>
        Work on your own schedule, accept nearby service requests,
        and earn a stable monthly income with Fixora.
      </p>

    </div>

    <div className="earnings-grid">

      <div className="earning-card">

        <div className="earning-icon">⚡</div>

        <h3>Electrician</h3>

        <h2>₹35k – ₹60k</h2>

        <span>Average Monthly Income</span>

      </div>

      <div className="earning-card">

        <div className="earning-icon">🚰</div>

        <h3>Plumber</h3>

        <h2>₹30k – ₹55k</h2>

        <span>Average Monthly Income</span>

      </div>

      <div className="earning-card">

        <div className="earning-icon">❄️</div>

        <h3>AC Repair</h3>

        <h2>₹40k – ₹70k</h2>

        <span>Average Monthly Income</span>

      </div>

      <div className="earning-card">

        <div className="earning-icon">🎨</div>

        <h3>Painter</h3>

        <h2>₹28k – ₹50k</h2>

        <span>Average Monthly Income</span>

      </div>

      <div className="earning-card">

        <div className="earning-icon">🪚</div>

        <h3>Carpenter</h3>

        <h2>₹35k – ₹65k</h2>

        <span>Average Monthly Income</span>

      </div>

      <div className="earning-card">

        <div className="earning-icon">🧹</div>

        <h3>Home Cleaning</h3>

        <h2>₹25k – ₹45k</h2>

        <span>Average Monthly Income</span>

      </div>

    </div>

  </div>

</section>

                {/* Partner Registration */}

        <section className="partner-registration">

          <div className="partner-container">

            <div className="section-heading">

            </div>

            <div className="partner-form-card">

              <div className="form-header">

                <span className="form-badge">
                  REGISTER NOW
                </span>

                <h2>
                  Become a Fixora Partner
                </h2>

                <p>
                  Fill in your details below to join the
                  Fixora Partner Network.
                </p>

              </div>

              <form
                className="partner-form"
                onSubmit={handleSubmit}
              >

                {/* Personal Information */}

                <div className="form-section">

                  <h3>Personal Information</h3>

                 <div className="form-grid">

  <div className="form-group">
    <label>Full Name</label>
    <input
      type="text"
      name="fullName"
      placeholder="Enter your full name"
      value={formData.fullName}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Email Address</label>
    <input
      type="email"
      name="email"
      placeholder="Enter your email"
      value={formData.email}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Phone Number</label>
    <input
      type="text"
      name="phone"
      placeholder="Enter phone number"
      value={formData.phone}
      onChange={handleChange}
    />
  </div>
  <div className="form-group">
  <label>Password</label>

  <input
    type="password"
    name="password"
    placeholder="Create Password"
    value={formData.password}
    onChange={handleChange}
    required
  />
</div>

<div className="form-group">
  <label>Confirm Password</label>

  <input
    type="password"
    name="confirmPassword"
    placeholder="Confirm Password"
    value={formData.confirmPassword}
    onChange={handleChange}
    required
  />
</div>

  <div className="form-group">
    <label>Date of Birth</label>
    <input
      type="date"
      name="dob"
      value={formData.dob}
      onChange={handleChange}
    />
  </div>

</div>
                </div>

               {/* Professional Information */}

{/* Professional Information */}

<div className="form-section">

  <h3 className="form-section-title">
    💼 Professional Information
  </h3>
   <br></br>
  <p className="form-section-subtitle">
    <b>Tell us about your skills and work experience.</b>
  </p>

  <div className="form-grid">

    <div className="form-group">

      <label>Profession *</label>

      <select
        name="profession"
        value={formData.profession}
        onChange={handleChange}
        required
      >
        <option value="">Choose Your Profession</option>
        <option value="Electrician">⚡ Electrician</option>
        <option value="Plumber">🚰 Plumber</option>
        <option value="Carpenter">🪚 Carpenter</option>
        <option value="Painter">🎨 Painter</option>
        <option value="AC Repair">❄️ AC Repair</option>
        <option value="Cleaning">🧹 Home Cleaning</option>
        <option value="Appliance Repair">🔧 Appliance Repair</option>
      </select>

    </div>

    <div className="form-group">

      <label>Experience *</label>

      <input
        type="number"
        min="0"
        max="50"
        name="experience"
        value={formData.experience}
        onChange={handleChange}
        placeholder="Example: 5 Years"
        required
      />

    </div>

    <div className="form-group">

      <label>Working City *</label>

      <input
        type="text"
        name="workingCity"
        value={formData.workingCity}
        onChange={handleChange}
        placeholder="Example: Bengaluru"
        required
      />

    </div>

    <div className="form-group">

      <label>Languages Known *</label>

      <input
        type="text"
        name="languages"
        value={formData.languages}
        onChange={handleChange}
        placeholder="Kannada, English, Hindi"
        required
      />

    </div>

  </div>

</div>

               {/* Upload Documents */}

{/* Upload Documents */}

<div className="form-section">

  <h3 className="form-section-title">
    📄 Upload Documents
  </h3>

  <div className="upload-grid">

    <label className="upload-card">

      <input type="file" hidden />

      <div className="upload-icon">
        📷
      </div>

      <h4>Profile Photo</h4>

      <p>Upload JPG or PNG</p>

      <span>Click to Upload</span>

    </label>

    <label className="upload-card">

      <input type="file" hidden />

      <div className="upload-icon">
        🪪
      </div>

      <h4>Aadhaar Card</h4>

      <p>Front Side</p>

      <span>Click to Upload</span>

    </label>

    <label className="upload-card">

      <input type="file" hidden />

      <div className="upload-icon">
        📄
      </div>

      <h4>Experience Certificate</h4>

      <p>Optional</p>

      <span>Click to Upload</span>

    </label>

    <label className="upload-card">

      <input type="file" hidden />

      <div className="upload-icon">
        📝
      </div>

      <h4>Other Document</h4>

      <p>Optional</p>

      <span>Click to Upload</span>

    </label>

  </div>

</div>
{/* Bank Details */}

<div className="form-section">

  <h3 className="form-section-title">
    🏦 Bank Details
  </h3>

  <div className="form-grid">

    <div className="form-group">
      <label>Account Holder Name</label>
      <input
        type="text"
        name="accountHolder"
        value={formData.accountHolder}
        onChange={handleChange}
        placeholder="Enter account holder name"
        required
      />
    </div>

    <div className="form-group">
      <label>Account Number</label>
      <input
        type="text"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        placeholder="Enter account number"
        required
      />
    </div>

    <div className="form-group">
      <label>IFSC Code</label>
      <input
        type="text"
        name="ifsc"
        value={formData.ifsc}
        onChange={handleChange}
        placeholder="Enter IFSC code"
        required
      />
    </div>

    <div className="form-group">
      <label>UPI ID (Optional)</label>
      <input
        type="text"
        name="upiId"
        value={formData.upiId}
        onChange={handleChange}
        placeholder="example@upi"
      />
    </div>

  </div>

</div>

<div className="submit-section">

  <button
    type="submit"
    className="partner-submit-btn"
    disabled={loading}
  >
    {loading ? "Submitting..." : "Submit Application"}
  </button>

</div>

</form>

</div>

</div>

</section>
                {/* Testimonials */}

<section className="partner-testimonials">

  <div className="partner-container">

    <div className="section-heading">

      <span>SUCCESS STORIES</span>

      <h2>Hear From Our Partners</h2>

      <p>
        Thousands of professionals have grown their careers with Fixora.
      </p>

    </div>

    <div className="testimonial-grid">

      <div className="testimonial-card">

        <div className="testimonial-top">

          <div className="testimonial-avatar">👨</div>

          <div>

            <h4>Rahul Sharma</h4>

            <span>Electrician • Bengaluru</span>

          </div>

          <div className="verified-badge">
            ✓ Verified
          </div>

        </div>

        <div className="stars">
          ⭐⭐⭐⭐⭐
        </div>

        <p>
          "Since joining Fixora, I receive regular bookings every week.
          My monthly income has almost doubled."
        </p>

        <div className="income-tag">
          ₹48,000 / Month
        </div>

      </div>

      <div className="testimonial-card">

        <div className="testimonial-top">

          <div className="testimonial-avatar">👨</div>

          <div>

            <h4>Arjun Patel</h4>

            <span>Plumber • Ahmedabad</span>

          </div>

          <div className="verified-badge">
            ✓ Verified
          </div>

        </div>

        <div className="stars">
          ⭐⭐⭐⭐⭐
        </div>

        <p>
          "The flexible work schedule lets me choose jobs that fit my
          availability. Payments are always on time."
        </p>

        <div className="income-tag">
          ₹42,000 / Month
        </div>

      </div>

      <div className="testimonial-card">

        <div className="testimonial-top">

          <div className="testimonial-avatar">👩</div>

          <div>

            <h4>Priya Verma</h4>

            <span>Home Cleaning • Pune</span>

          </div>

          <div className="verified-badge">
            ✓ Verified
          </div>

        </div>

        <div className="stars">
          ⭐⭐⭐⭐⭐
        </div>

        <p>
          "Fixora helped me build trust with customers through ratings
          and verified reviews."
        </p>

        <div className="income-tag">
          ₹36,000 / Month
        </div>

      </div>

    </div>

  </div>

</section>
        {/* FAQ */}

        <section className="partner-faq">

          <div className="partner-container">

            <div className="section-heading">

              <span>FREQUENTLY ASKED QUESTIONS</span>

              <h2>Have Questions? We've Got Answers.</h2>

              <p>
                Everything you need to know before joining the
                Fixora Partner Network.
              </p>

            </div>

            <div className="faq-list">

              <div className="faq-card">

                <h3>How long does approval take?</h3>

                <p>
                  Most partner applications are verified within
                  24–48 hours.
                </p>

              </div>

              <div className="faq-card">

                <h3>Is there any registration fee?</h3>

                <p>
                  No. Joining Fixora is completely free.
                </p>

              </div>

              <div className="faq-card">

                <h3>How will I receive payments?</h3>

                <p>
                  Payments are transferred directly to your registered
                  bank account.
                </p>

              </div>

              <div className="faq-card">

                <h3>Can I work part-time?</h3>

                <p>
                  Yes. You can accept jobs whenever you are available.
                </p>

              </div>

              <div className="faq-card">

                <h3>What documents are required?</h3>

                <p>
                  Aadhaar Card, Profile Photo and Bank Details are
                  mandatory for verification.
                </p>

              </div>

              <div className="faq-card">

                <h3>Can I choose my service area?</h3>

                <p>
                  Yes. You can select the cities and locations where
                  you want to receive bookings.
                </p>

              </div>

            </div>

          </div>

        </section>
        {/* Final CTA */}

<section className="partner-cta">

  <div className="partner-container">

    <div className="cta-box">

      <span>JOIN FIXORA TODAY</span>

      <h2>
        Ready to Grow Your Career?
      </h2>

      <p>
        Join thousands of skilled professionals earning with Fixora.
        Register today and start receiving service requests from customers near you.
      </p>

      <button
        className="cta-btn"
        onClick={() =>
          document
            .querySelector(".partner-form-section")
            ?.scrollIntoView({
              behavior:"smooth"
            })
        }
      >
        Become a Partner
      </button>

    </div>

  </div>

</section>
{/* Statistics */}

<section className="partner-stats">

  <div className="partner-container">

    <div className="stats-grid">

      <div className="stat-card">

    <h2>50,00+</h2>

        <p>Active Partners</p>

      </div>

      <div className="stat-card">

       <h2>150+</h2>
        <p>Cities Covered</p>

      </div>

      <div className="stat-card">
<h2>4.9 ★</h2>
        <p>Average Partner Rating</p>

      </div>

      <div className="stat-card">

     <h2>₹8 Cr+</h2>
        <p>Paid to Partners</p>

      </div>

    </div>

  </div>

</section>

{/* Why Technicians Love Fixora */}

<section className="partner-highlights">

  <div className="partner-container">

    <div className="section-heading">

      <span>WHY FIXORA</span>

      <h2>Why Thousands Choose Fixora</h2>

      <p>
        More opportunities, flexible work, and secure payments.
      </p>

    </div>

    <div className="highlights-grid">

      <div className="highlight-card">

        <div className="highlight-icon">📍</div>

        <h3>Nearby Jobs</h3>

        <p>
          Receive service requests from customers in your preferred area.
        </p>

      </div>

      <div className="highlight-card">

        <div className="highlight-icon">💸</div>

        <h3>Weekly Payments</h3>

        <p>
          Earnings are transferred directly to your registered bank account.
        </p>

      </div>

      <div className="highlight-card">

        <div className="highlight-icon">⭐</div>

        <h3>Build Reputation</h3>

        <p>
          Collect ratings and reviews to receive more bookings.
        </p>

      </div>

      <div className="highlight-card">

        <div className="highlight-icon">📱</div>

        <h3>Manage Everything</h3>

        <p>
          Accept jobs, update status and track earnings from one dashboard.
        </p>

      </div>

    </div>

  </div>

</section>
      </main>

    </>

  );

};

export default BecomePartner;