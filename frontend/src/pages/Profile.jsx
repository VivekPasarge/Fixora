import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import api from "../api/axios";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  /* =========================================================
     FETCH PROFILE
     ========================================================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileUser = response.data.user;

      setUser(profileUser);

      setFormData({
        name: profileUser.name || "",
        phone: profileUser.phone || "",
        address: profileUser.address || "",
      });
    } catch (error) {
      console.error("Fetch Profile Error:", error);
    }
  };

  /* =========================================================
     HANDLE INPUT
     ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     UPDATE PROFILE
     ========================================================= */

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        "/auth/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Profile updated successfully"
      );

      setEditMode(false);

      fetchProfile();
    } catch (error) {
      console.error("Update Profile Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (!user) {
    return (
      <>
        <Navbar />

        <div className="customer-profile-loading">
          Loading profile...
        </div>
      </>
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <>
      <Navbar />

      <main className="customer-profile-page">

        <div className="customer-profile-card">

          {/* =================================================
              PROFILE HEADER
              ================================================= */}

          <div className="customer-profile-top">

            <div className="customer-profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="customer-profile-heading">

              <h1>
                {user.name}
              </h1>

              <p>
                {user.role}
              </p>

            </div>

          </div>


          {/* =================================================
              PROFILE INFORMATION
              ================================================= */}

          <div className="customer-profile-body">

            {/* NAME */}

            <div className="customer-profile-field">

              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editMode}
              />

            </div>


            {/* EMAIL */}

            <div className="customer-profile-field">

              <label>
                Email
              </label>

              <input
                type="email"
                value={user.email || ""}
                disabled
              />

            </div>


            {/* PHONE */}

            <div className="customer-profile-field">

              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editMode}
              />

            </div>


            {/* ADDRESS */}

            <div className="customer-profile-field">

              <label>
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editMode}
              />

            </div>

          </div>


          {/* =================================================
              ACTION BUTTON
              ================================================= */}

          <div className="customer-profile-actions">

            {!editMode ? (

              <button
                type="button"
                className="customer-profile-btn"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>

            ) : (

              <button
                type="button"
                className="customer-profile-btn"
                onClick={updateProfile}
              >
                Save Changes
              </button>

            )}

          </div>

        </div>

      </main>
    </>
  );
};

export default Profile;