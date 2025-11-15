// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
import Wallet from "./pages/Wallet/Wallet";
import Referrals from "./pages/Referrals/Referrals";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Notifications from "./pages/Notification/Notifications";
import Transactions from "./pages/Transactions/Transactions";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import Layout from "./layouts/DashboardLayout";
import { ToastContainer } from "react-toastify";
import Login from "./pages/auth/Login/login";
import Signup from "./pages/auth/Signup/signup";
import KYCForm from "./pages/auth/Kyc/kyc";
import ForgotPassword from "./pages/auth/ForgotPassword/forgotPassword";
import Landing from "./pages/Landing/Landing";
import { useAppData } from "./hooks/AppDataContext";
import "react-toastify/dist/ReactToastify.css";

function ProtectedRoute({ children }) {
  const { userLoggedIn } = useAppData();
  return userLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { userLoggedIn } = useAppData();

  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          userLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />
        } />

        {/* Dashboard Layout Routes - Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Auth Routes - Redirect to dashboard if already logged in */}
        <Route path="/login" element={
          userLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/signup" element={
          userLoggedIn ? <Navigate to="/dashboard" replace /> : <Signup />
        } />
        <Route path="/kyc" element={<KYCForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
