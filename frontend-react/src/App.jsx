import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Accounts from "./pages/Accounts.jsx";
import Transfers from "./pages/Transfers.jsx";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="topbar">
      <Link to="/" className="brand">
        Banking App
      </Link>
      <div className="spacer" />
      {user ? (
        <>
          <span className="muted">Hi, {user.name}</span>
          <Link to="/accounts">Accounts</Link>
          <Link to="/transfers">Transfers</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="card">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="container">
        <Nav />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/accounts"
            element={
              <Protected>
                <Accounts />
              </Protected>
            }
          />
          <Route
            path="/transfers"
            element={
              <Protected>
                <Transfers />
              </Protected>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
