import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Manage from "./pages/Manage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
                <Manage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/courses" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
