import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import "./CompleteProfile.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CompleteProfile = () => {

  const [formData, setFormData] = useState({
    profession: "",
    experience: "",
    skills: "",
    languages: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    workingCity: "",
    serviceArea: "",
    workingRadius: 10,
    aadhaarNumber: "",
    panNumber: "",
    about: "",
  });
  const navigate=useNavigate();

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    const token = localStorage.getItem("token");
console.log("Token:", token);
console.log("URL:", "http://localhost:5000/api/auth/complete-profile");
    const response = await api.put(
      "/auth/complete-profile",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(response.data.message);

    navigate("/technician-dashboard");

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Something went wrong"
    );

  }

};

  return (
    <>
      <Navbar />

      <main className="complete-profile-page">

        <div className="profile-container">

          <div className="profile-header">

            <h1>Complete Your Profile</h1>

            <p>
              Finish your technician profile before accepting jobs.
            </p>

          </div>

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >

            {/* Personal Information */}

            <div className="form-section">

              <h2>Personal Information</h2>

              <div className="form-grid">

                <div className="form-group">
                  <label>Gender</label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >

                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>

                  </select>

                </div>

                <div className="form-group">

                  <label>Date of Birth</label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* Professional Information */}

            <div className="form-section">

              <h2>Professional Information</h2>

              <div className="form-grid">

                <div className="form-group">

                  <label>Profession</label>

                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Experience</label>

                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Skills</label>

                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Languages</label>

                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* Address */}

            <div className="form-section">

              <h2>Address</h2>

              <div className="form-grid">

                <div className="form-group">

                  <label>Address</label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Working City</label>

                  <input
                    type="text"
                    name="workingCity"
                    value={formData.workingCity}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Service Area</label>

                  <input
                    type="text"
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Working Radius (KM)</label>

                  <input
                    type="number"
                    name="workingRadius"
                    value={formData.workingRadius}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* Documents */}

            <div className="form-section">

              <h2>Documents</h2>

              <div className="form-grid">

                <div className="form-group">

                  <label>Aadhaar Number</label>

                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>PAN Number</label>

                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* About */}

            <div className="form-section">

              <h2>About Yourself</h2>

              <textarea
                rows="5"
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell customers about yourself..."
              />

            </div>

            <button
              className="save-profile-btn"
              type="submit"
            >
              Save Profile
            </button>

          </form>

        </div>

      </main>

    </>
  );

};

export default CompleteProfile;