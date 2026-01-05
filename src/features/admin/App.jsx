import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";


import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Projects from "./pages/Projects.jsx";
import Tasks from "./pages/Tasks.jsx";
import Issues from "./pages/Issues.jsx";
import Reports from "./pages/Reports.jsx";
import ClientAccess from "./pages/ClientAccess.jsx";

import ClientDashboard from "./pages/ClientDashboard.jsx";
import ProjectManager from "./pages/ProjectManager.jsx";
import Chat from "./pages/Chat.jsx";
import Email from "./pages/Email.jsx"; // New Email Import
import Helpdesk from "./pages/Helpdesk.jsx";
import DevPanel from "./pages/DevPanel.jsx";
import Settings from "./pages/Settings.jsx";

// 🔐 Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;

  // Allow SUPER_ADMIN to access everything
  if (user.role === "SUPER_ADMIN") {
    return <Layout>{children}</Layout>;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

import { AppProvider } from "./context/AppContext.jsx";

const App = () => {
  return (
    <AppProvider>
      <Routes>

        {/* Public Routes */}
        <Route path="login" element={<Navigate to="/login" replace />} />

        {/* Home redirect */}
        <Route path="" element={<Navigate to="dashboard" replace />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="employees"
          element={
            <ProtectedRoute requiredRole="admin">
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="projects/:id/manage"
          element={
            <ProtectedRoute>
              <ProjectManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="issues"
          element={
            <ProtectedRoute>
              <Issues />
            </ProtectedRoute>
          }
        />

        <Route
          path="chat"   // 👈 NEW CHAT ROUTE
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="email"
          element={
            <ProtectedRoute>
              <Email />
            </ProtectedRoute>
          }
        />

        <Route
          path="helpdesk"
          element={
            <ProtectedRoute>
              <Helpdesk />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="client-access"
          element={
            <ProtectedRoute>
              <ClientAccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="dev-panel"
          element={
            <ProtectedRoute>
              <DevPanel />
            </ProtectedRoute>
          }
        />

        {/* Client Facing Routes */}
        <Route path="client/login" element={<Navigate to="/login" replace />} />
        <Route path="client/dashboard" element={<ClientDashboard />} />

      </Routes>
    </AppProvider>
  );
};

export default App;
