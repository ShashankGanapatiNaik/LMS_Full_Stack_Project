import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("lms_token", data.token);
    localStorage.setItem(
      "lms_user",
      JSON.stringify({ email: data.email, fullName: data.fullName, role: data.role })
    );
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
    return data;
  };

  const register = async (fullName, email, password, role) => {
    const { data } = await api.post("/auth/register", { fullName, email, password, role });
    localStorage.setItem("lms_token", data.token);
    localStorage.setItem(
      "lms_user",
      JSON.stringify({ email: data.email, fullName: data.fullName, role: data.role })
    );
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
