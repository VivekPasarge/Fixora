
import { Navigate, useLocation } from "react-router-dom";

const getRoleHome = (user) => {
  if (user?.role === "admin") return "/admin-dashboard";

  if (user?.role === "technician") {
    return user.profileCompleted
      ? "/technician-home"
      : "/complete-profile";
  }

  return "/customer-dashboard";
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const role = String(user?.role || "").toLowerCase();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={getRoleHome(user)} replace />;
  }

  if (role === "technician" && !user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
