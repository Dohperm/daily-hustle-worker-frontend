// src/App.jsx
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
import TaskDetails from "./pages/Tasks/TaskDetails";
import Wallet from "./pages/Wallet/Wallet";
import Referrals from "./pages/Referrals/Referrals";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Notifications from "./pages/Notification/Notifications";
import Transactions from "./pages/Transactions/Transactions";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import Layout from "./layouts/DashboardLayout";
import { ToastContainer, toast } from "react-toastify";
import Login from "./pages/auth/Login/login";
import Signup from "./pages/auth/Signup/signup";
import Onboarding from "./pages/auth/Onboarding/onboarding";
import KYCForm from "./pages/auth/Kyc/kyc";
import ForgotPassword from "./pages/auth/ForgotPassword/forgotPassword";
import Landing from "./pages/Landing/Landing";
import { useAppData } from "./hooks/AppDataContext";
import KycModal from "./components/Modal/KycModal";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

function ProtectedRoute({ children }) {
  const { userLoggedIn } = useAppData();
  return userLoggedIn ? children : <Navigate to="/login" replace />;
}

function OnboardingProtectedRoute({ children }) {
  const { userLoggedIn } = useAppData();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUserProfile = async () => {
      if (userLoggedIn) {
        try {
          const response = await fetch('https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      setLoading(false);
    };
    checkUserProfile();
  }, [userLoggedIn]);

  if (loading) return <LoadingSpinner fullScreen message="Checking your profile..." variant="pulse" />;
  if (!userLoggedIn) return <Navigate to="/login" replace />;
  
  const needsOnboarding = !user?.first_name || !user?.username;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  
  return children;
}



export default function App() {
  const { userLoggedIn, showKycModal, setShowKycModal } = useAppData();

  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          userLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />
        } />

        {/* Dashboard Layout Routes - Protected */}
        <Route path="/dashboard" element={
          <OnboardingProtectedRoute>
            <Layout />
          </OnboardingProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:taskId" element={<TaskDetails />} />
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
        <Route path="/onboarding" element={
          userLoggedIn ? <Onboarding /> : <Navigate to="/login" replace />
        } />
        <Route path="/kyc" element={<KYCForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
      
      <style jsx global>{`
        .custom-toast {
          font-family: "Poppins", system-ui, sans-serif !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .custom-toast-body {
          font-family: "Poppins", system-ui, sans-serif !important;
          font-weight: 500;
        }
        
        .Toastify__toast--success {
          background: #28a745 !important;
          color: white !important;
        }
        
        .Toastify__toast--error {
          background: #dc3545 !important;
          color: white !important;
        }
        
        .Toastify__toast--success .Toastify__progress-bar {
          background: rgba(255, 255, 255, 0.3) !important;
        }
        
        .Toastify__toast--error .Toastify__progress-bar {
          background: rgba(255, 255, 255, 0.3) !important;
        }
        
        .Toastify__close-button {
          color: white !important;
          opacity: 0.8;
        }
        
        .Toastify__close-button:hover {
          opacity: 1;
        }
        
        .Toastify__toast--error .Toastify__toast-icon svg,
        .Toastify__toast--error .Toastify__toast-icon path {
          fill: white !important;
        }
        
        .Toastify__toast--success .Toastify__toast-icon svg,
        .Toastify__toast--success .Toastify__toast-icon path {
          fill: white !important;
        }
      `}</style>
      <KycModal 
        show={showKycModal} 
        onClose={() => setShowKycModal(false)} 
      />
    </>
  );
}
