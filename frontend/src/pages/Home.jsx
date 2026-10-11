
import { Navigate } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import TrustBar from "../components/TrustBar/TrustBar";
import Footer from "../components/Footer/Footer";
import api from "../api/axios";

const Home = () => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const role = String(user?.role || "").toLowerCase();

      if (role === "technician") {
        return (
          <Navigate
            to={
              user.profileCompleted
                ? "/technician-home"
                : "/complete-profile"
            }
            replace
          />
        );
      }

      if (role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Footer />
    </>
  );
};

console.log(api.defaults.baseURL);

export default Home;
