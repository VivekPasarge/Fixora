import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiEdit3,
  FiX,
} from "react-icons/fi";

import Navbar from "../components/Navbar/Navbar";
import api from "../api/axios";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

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
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await api.get(
        "/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileUser = response.data.user;

      setUser(profileUser);

      setFormData({
        name: profileUser.name || "",
        phone: profileUser.phone || "",
        address: profileUser.address || "",
      });

    } catch (error) {
      console.error(
        "Fetch Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your profile."
      );
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
     START EDITING
  ========================================================= */

  const startEditing = () => {
    setMessage("");
    setError("");

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    setEditMode(true);
  };


  /* =========================================================
     CANCEL EDITING
  ========================================================= */

  const cancelEditing = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    setMessage("");
    setError("");

    setEditMode(false);
  };


  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const updateProfile = async () => {
    try {
      setSaving(true);

      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );

        return;
      }

      /* Validate name */

      if (!formData.name.trim()) {
        setError("Name cannot be empty.");

        return;
      }

      /* Validate phone */

      if (!formData.phone.trim()) {
        setError(
          "Phone number cannot be empty."
        );

        return;
      }

      const response = await api.put(
        "/auth/profile",
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
        Backend should ideally return:

        {
          success: true,
          message: "Profile updated successfully",
          user: {...}
        }
      */

      const updatedUser =
        response.data.user || {
          ...user,

          name: formData.name.trim(),

          phone: formData.phone.trim(),

          address: formData.address.trim(),
        };

      setUser(updatedUser);

      setFormData({
        name: updatedUser.name || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      });

      setEditMode(false);

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Update Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );

    } finally {
      setSaving(false);
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
          {error || "Loading profile..."}
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

              {user.name
                ?.charAt(0)
                .toUpperCase()}

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
              SUCCESS MESSAGE
          ================================================= */}

          {message && (

            <div className="profile-success-message">

              <FiCheckCircle />

              <span>
                {message}
              </span>

            </div>

          )}


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (

            <div className="profile-error-message">

              <FiX />

              <span>
                {error}
              </span>

            </div>

          )}


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
                placeholder="Enter your name"
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

              <small>
                Email cannot be changed from your profile.
              </small>

            </div>


            {/* PHONE */}

            <div className="customer-profile-field">

              <label>
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editMode}
                placeholder="Enter your phone number"
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
                placeholder="Enter your complete address"
                rows="4"
              />

            </div>

          </div>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="customer-profile-actions">

            {!editMode ? (

             <button
  type="button"
  className="customer-profile-btn"
  onClick={() => {
    alert("EDIT BUTTON WORKS");
    setEditMode(true);
  }}
>
  <FiEdit3 />
  Edit Profile
</button>
               

            ) : (

              <>

                <button
                  type="button"
                  className="customer-profile-cancel-btn"
                  onClick={cancelEditing}
                  disabled={saving}
                >

                  <FiX />

                  Cancel

                </button>


                <button
                  type="button"
                  className="customer-profile-btn"
                  onClick={updateProfile}
                  disabled={saving}
                >

                  <FiCheckCircle />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </>

            )}

          </div>

        </div>

      </main>
    </>
  );
};

export default Profile;