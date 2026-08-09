import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import api from "../api/axios";
import "./TechnicianProfile.css";

const TechnicianProfile = () => {
  const [user, setUser] = useState(null);

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

      setUser(response.data.user);

    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "120px" }}>
        Loading...
      </h2>
    );
  }

  return (
    <>
      <Navbar />

      <div className="profile-page">

        <div className="profile-card">

          <div className="profile-header">

            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1>{user.name}</h1>
              <p>{user.profession || "Technician"}</p>
            </div>

          </div>

          <div className="profile-body">

            <label>Name</label>
            <input value={user.name} disabled />

            <label>Email</label>
            <input value={user.email} disabled />

            <label>Phone</label>
            <input value={user.phone} disabled />

            <label>Profession</label>
            <input value={user.profession || ""} disabled />

            <label>Experience</label>
            <input value={user.experience || ""} disabled />

            <label>Working City</label>
            <input value={user.workingCity || ""} disabled />

            <label>Languages</label>
            <input value={user.languages || ""} disabled />

            <label>Skills</label>
            <input value={user.skills || ""} disabled />

            <label>About</label>
            <textarea
              value={user.about || ""}
              disabled
            />

          </div>

        </div>

      </div>
    </>
  );
};

export default TechnicianProfile;