
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";
import socket from "../socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // Save JWT token
  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");

    socket.disconnect();

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Fetch logged-in user's profile
  const fetchProfile = async () => {
    try {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        setUser(null);
        return;
      }

      const response = await api.get("/auth/profile");

      const profile = response.data.user || response.data;

      setUser(profile);
    } catch (error) {
      console.error(
        "Profile loading failed:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const receivedToken =
      response.data.token || response.data.accessToken;

    const loggedInUser =
      response.data.user || response.data;

    if (!receivedToken) {
      throw new Error("JWT token was not returned by the server.");
    }

    saveToken(receivedToken);
    setUser(loggedInUser);

    return response.data;
  };

  // Register
  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  };

  // Restore authentication and Socket.IO after refresh
  useEffect(() => {
    if (!token) {
      socket.disconnect();
      setLoading(false);
      return;
    }

    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    fetchProfile();

    return () => {
      // Do not disconnect here. React StrictMode can run effect cleanup
      // and setup again during development.
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
