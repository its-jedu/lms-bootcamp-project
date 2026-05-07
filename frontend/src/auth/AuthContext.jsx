import { createContext, useState, useEffect } from "react";
import { loginUser, logoutUser } from "../api/auth";
import { setAccessToken } from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setAccessToken(data.access);
    setIsAuthenticated(true);

    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("user");
  };

  // Restore session on load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const contextData = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
