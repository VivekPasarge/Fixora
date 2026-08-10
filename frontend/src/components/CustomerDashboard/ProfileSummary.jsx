import { useEffect, useState } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiEdit,
  FiCheck,
  FiX,
} from "react-icons/fi";

import api from "../../api/axios";
import "./ProfileSummary.css";

const ProfileSummary = () => {
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
        "Profile Summary Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load profile."
      );
    }
  };


  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =========================================================
     START EDIT
  ========================================================= */

  const handleEdit = () => {
    setMessage("");
    setError("");

    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });

    setEditMode(true);
  };


  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });

    setMessage("");
    setError("");

    setEditMode(false);
  };


  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async () => {
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
      <section className="profile-summary">

        <div className="profile-summary-loading">
          {error || "Loading profile..."}
        </div>

      </section>
    );
  }


  /* =========================================================
     PROFILE SUMMARY
  ========================================================= */

  return (
    <section className="profile-summary">


      {/* =====================================================
          PROFILE TOP
      ===================================================== */}

      <div className="profile-top">

        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User"
          )}&background=2563eb&color=ffffff&size=256`}
          alt="Profile"
        />

        {!editMode ? (

          <>
            <h2>
              {user.name}
            </h2>

            <span className="member-badge">
              Premium Member
            </span>
          </>

        ) : (

          <div className="profile-edit-heading">

            <h2>
              Edit Profile
            </h2>

            <span className="member-badge">
              Premium Member
            </span>

          </div>

        )}

      </div>


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (

        <div className="profile-summary-success">

          <FiCheck />

          <span>
            {message}
          </span>

        </div>

      )}


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (

        <div className="profile-summary-error">

          <FiX />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          VIEW MODE
      ===================================================== */}

      {!editMode ? (

        <div className="profile-info">

          {/* FULL NAME */}

          <div className="info-item">

            <FiUser className="info-icon" />

            <div>

              <span>
                Full Name
              </span>

              <h4>
                {user.name || "Not provided"}
              </h4>

            </div>

          </div>


          {/* PHONE */}

          <div className="info-item">

            <FiPhone className="info-icon" />

            <div>

              <span>
                Phone
              </span>

              <h4>
                {user.phone || "Not provided"}
              </h4>

            </div>

          </div>


          {/* EMAIL */}

          <div className="info-item">

            <FiMail className="info-icon" />

            <div>

              <span>
                Email
              </span>

              <h4>
                {user.email || "Not provided"}
              </h4>

            </div>

          </div>


          {/* ADDRESS */}

          <div className="info-item">

            <FiMapPin className="info-icon" />

            <div>

              <span>
                Address
              </span>

              <h4>
                {user.address || "Not provided"}
              </h4>

            </div>

          </div>


          {/* JOINED */}

          <div className="info-item">

            <FiCalendar className="info-icon" />

            <div>

              <span>
                Joined
              </span>

              <h4>
                {user.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "July 2026"}
              </h4>

            </div>

          </div>

        </div>

      ) : (


        /* ===================================================
           EDIT MODE
        =================================================== */

        <div className="profile-edit-form">


          {/* NAME */}

          <div className="profile-edit-field">

            <label>
              Full Name
            </label>

            <div className="profile-input-wrapper">

              <FiUser />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

            </div>

          </div>


          {/* PHONE */}

          <div className="profile-edit-field">

            <label>
              Phone
            </label>

            <div className="profile-input-wrapper">

              <FiPhone />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />

            </div>

          </div>


          {/* EMAIL */}

          <div className="profile-edit-field">

            <label>
              Email
            </label>

            <div className="profile-input-wrapper disabled">

              <FiMail />

              <input
                type="email"
                value={user.email || ""}
                disabled
              />

            </div>

            <small>
              Email cannot be changed.
            </small>

          </div>


          {/* ADDRESS */}

          <div className="profile-edit-field">

            <label>
              Address
            </label>

            <div className="profile-input-wrapper textarea-wrapper">

              <FiMapPin />

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
              />

            </div>

          </div>


          {/* EDIT ACTIONS */}

          <div className="profile-edit-actions">

            <button
              type="button"
              className="profile-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >

              <FiX />

              Cancel

            </button>


            <button
              type="button"
              className="profile-save-btn"
              onClick={handleSave}
              disabled={saving}
            >

              <FiCheck />

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          EDIT BUTTON
      ===================================================== */}

      {!editMode && (

        <button
          type="button"
          className="edit-profile-btn"
          onClick={handleEdit}
        >

          <FiEdit />

          Edit Profile

        </button>

      )}

    </section>
  );
};

export default ProfileSummary;