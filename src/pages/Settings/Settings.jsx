// src/pages/Settings.jsx
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  uploadImage,
  updateUser,
  fileUrlUpdate,
} from "../../services/services";
import VerificationBadge from "../../components/VerificationBadge";
import VerificationModal from "../../components/Modal/VerificationModal";
import KycFormContent from "../../components/KycFormContent";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const {
    userData,
    updateUserData,
    refetchUserData,
    updateUserImageUrl,
    addNotification,
    recordTaskHistory,
  } = useAppData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userData?.photo || "");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showKycForm, setShowKycForm] = useState(false);
  const fileInputRef = useRef(null);
  const previousBlobUrl = useRef(null);
  const isDark = theme === "dark";
  const primary = "var(--dh-red)";
  const gradientBg = isDark
    ? "linear-gradient(135deg, #660000, #240000)"
    : "linear-gradient(135deg, var(--dh-red), #ff4c4c)";

  const {
    username = "",
    phone = "",
    kyc = {},
    notificationsEnabled = true,
    photo = "",
    verifiedWorker = false,
    verifiedAdvertiser = false,
    first_name = "",
    last_name = "",
    email = "",
    country = "Ghana",
  } = userData || {};

  const kycVerified = kyc.status === "verified";

  const tabs = [
    { id: "profile", icon: "person", title: "Profile" },
    { id: "verification", icon: "shield-check", title: "Verification" },
    { id: "security", icon: "shield-lock", title: "Security" },
    { id: "notifications", icon: "bell", title: "Notifications" },
    { id: "payments", icon: "credit-card", title: "Payments" },
    { id: "privacy", icon: "eye-slash", title: "Privacy" },
  ];

  useEffect(() => {
    return () => {
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }
    };
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No image selected");
      return;
    }

    setUploadingAvatar(true);

    if (previousBlobUrl.current) {
      URL.revokeObjectURL(previousBlobUrl.current);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    previousBlobUrl.current = previewUrl;

    try {
      const { data } = await uploadImage(file);
      const imageUrl = data?.data[0]?.src;

      if (!imageUrl) {
        toast.error("No image URL returned from server.");
        throw new Error("No image URL returned from server.");
      }

      // Update profile with new photo URL
      await updateUser({ photo: imageUrl });
      setAvatarPreview(imageUrl);
      await refetchUserData();
      
      toast.success("Profile picture updated!");
      addNotification({
        title: "Avatar Updated",
        message: "Your profile picture has been changed.",
        type: "success",
        category: "profile",
      });
      if (typeof recordTaskHistory === "function") {
        recordTaskHistory("avatar", "updated", "User changed profile picture");
      }
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Upload failed"
      );
      setAvatarPreview(photo);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await updateUser({
        first_name: editFirstName,
        last_name: editLastName,
      });
      await refetchUserData();
      toast.success("Profile saved!");
      addNotification({
        title: "Profile Saved",
        message: "Your details have been updated.",
        type: "success",
        category: "profile",
      });
      if (typeof recordTaskHistory === "function") {
        recordTaskHistory(
          "profile",
          "updated",
          `Saved: ${editFirstName} ${editLastName}`
        );
      }
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    updateUserData({ notificationsEnabled: newValue });
    toast.success(
      newValue ? "Notifications enabled" : "Notifications disabled"
    );
    addNotification({
      title: newValue ? "Alerts On" : "Alerts Off",
      message: newValue ? "You’ll get updates" : "All alerts muted",
      type: newValue ? "info" : "warning",
      category: "notifications",
    });
    if (typeof recordTaskHistory === "function") {
      recordTaskHistory(
        "notifications",
        newValue ? "enabled" : "disabled",
        "User toggled notifications"
      );
    }
  };

  const verifyKYC = () => {
    navigate("/kyc");
    addNotification({ title: "KYC Started", type: "success", category: "kyc" });
    if (typeof recordTaskHistory === "function") {
      recordTaskHistory("kyc", "started", "User initiated KYC");
    }
  };

  const logout = () => {
    if (window.confirm("Logout from Daily Hustle?")) {
      if (typeof recordTaskHistory === "function") {
        recordTaskHistory("session", "logout", "User logged out");
      }
      toast.info("Logged out");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userLoggedIn");
      navigate("/");
    }
  };

  const [editFirstName, setEditFirstName] = useState(first_name);
  const [editLastName, setEditLastName] = useState(last_name);

  useEffect(() => {
    setEditFirstName(first_name);
    setEditLastName(last_name);
  }, [first_name, last_name]);

  const renderProfileTab = () => (
    <div>
      <h5 className="mb-4 fw-bold" style={{ color: isDark ? "#f8f9fa" : "#333" }}>Basic Information - Updated</h5>
      
      <form onSubmit={handleSaveProfile}>
        <div className="row mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>First Name</label>
            <input
              type="text"
              className="form-control"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              style={{
                background: isDark ? "#1c1c1e" : "#fff",
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                color: isDark ? "#f8f9fa" : "#333"
              }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>Last Name</label>
            <input
              type="text"
              className="form-control"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              style={{
                background: isDark ? "#1c1c1e" : "#fff",
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                color: isDark ? "#f8f9fa" : "#333"
              }}
            />
          </div>
          <div className="col-md-4 text-center">
            <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>Profile Picture</label>
            <div className="d-flex justify-content-center position-relative">
              <img
                src={avatarPreview || photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  border: `3px solid #ff5722`
                }}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="btn btn-sm position-absolute"
                style={{
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(50%)',
                  background: '#ff5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  padding: '2px 8px'
                }}
              >
                {uploadingAvatar ? 'Uploading...' : 'Edit'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>Email Address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            readOnly
            style={{
              background: isDark ? "#2a2a2a" : "#f8f9fa",
              border: 'none',
              color: isDark ? "#f8f9fa" : "#333"
            }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>Phone Number</label>
          <input
            type="tel"
            className="form-control"
            value={phone}
            readOnly
            style={{
              background: isDark ? "#2a2a2a" : "#f8f9fa",
              border: 'none',
              color: isDark ? "#f8f9fa" : "#333"
            }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            readOnly
            style={{
              background: isDark ? "#2a2a2a" : "#f8f9fa",
              border: 'none',
              color: isDark ? "#f8f9fa" : "#333"
            }}
          />
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>Country</label>
            <input
              type="text"
              className="form-control"
              value={country}
              readOnly
              style={{
                background: isDark ? "#2a2a2a" : "#f8f9fa",
                border: 'none',
                color: isDark ? "#f8f9fa" : "#333"
              }}
            />
          </div>
        </div>

        <div className="d-flex gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            style={{
              border: `1px solid ${isDark ? '#666' : '#ccc'}`,
              color: isDark ? "#ccc" : "#666"
            }}
          >
            Edit
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              background: '#ff5722',
              color: 'white',
              border: 'none'
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderVerificationTab = () => (
    <div className="row g-4">
      {/* KYC Verification */}
      <div className="col-12">
        <div
          className="p-4 rounded-4"
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#fff",
            border: `2px solid ${userData.kyc?.is_approved ? 'var(--dh-green)' : "#ffc107"}`,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold mb-1" style={{ color: isDark ? "#f8f9fa" : "#212529" }}>
                <i className="bi bi-shield-check me-2" />
                KYC Verification
              </h6>
              <small style={{ color: (userData.kyc?.is_approved || userData.kyc?.status === 'verified') ? '#28a745' : "#ffc107" }}>
                {(userData.kyc?.is_approved || userData.kyc?.status === 'verified') ? "✓ KYC Completed" : "Pending Verification"}
              </small>
            </div>
            <button
              className="btn fw-bold rounded-pill px-4"
              style={{
                backgroundColor: userData.kyc?.is_approved ? '#28a745' : '#ff5722',
                color: "#fff",
                border: 'none'
              }}
              onClick={() => setShowKycForm(true)}
              disabled={userData.kyc?.is_approved || userData.kyc?.status === 'verified'}
            >
              {(userData.kyc?.is_approved || userData.kyc?.status === 'verified') ? "✓ Completed" : "Complete KYC"}
            </button>
          </div>
          <small className="text-muted">
            {(userData.kyc?.is_approved || userData.kyc?.status === 'verified')
              ? "Your KYC verification has been completed and approved. All platform features and verified badges are now unlocked."
              : "Complete KYC verification to unlock all platform features and verified badges"
            }
          </small>
        </div>
      </div>


    </div>
  );

  const renderSecurityTab = () => (
    <div className="row g-4">
      <div className="col-12">
        <div
          className="p-4 rounded-4"
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#fff",
            border: `2px solid ${kycVerified ? primary : "#ff4500"}`,
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6
                className="fw-bold mb-1"
                style={{ color: isDark ? "#f8f9fa" : "#212529" }}
              >
                KYC Verification
              </h6>
              <small style={{ color: kycVerified ? primary : "#ff4500" }}>
                {kycVerified ? "Verified" : "Not Verified"}
              </small>
            </div>
            <button
              className="btn fw-bold rounded-pill px-4"
              style={{
                backgroundColor: kycVerified ? primary : gradientBg,
                color: "#fff",
              }}
              onClick={verifyKYC}
              disabled={kycVerified}
            >
              {kycVerified ? "Verified" : "Verify Now"}
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div
          className="p-4 rounded-4 cursor-pointer"
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#fff",
            border: `1px solid ${isDark ? "#333" : "#dee2e6"}`,
          }}
          onClick={() => toast.info("Change Password feature coming soon!")}
        >
          <i className="bi bi-key fs-3 mb-3" style={{ color: primary }}></i>
          <h6
            className="fw-bold mb-2"
            style={{ color: isDark ? "#f8f9fa" : "#212529" }}
          >
            Change Password
          </h6>
          <small style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
            Update account password securely
          </small>
        </div>
      </div>
      <div className="col-md-6">
        <div
          className="p-4 rounded-4 cursor-pointer"
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#fff",
            border: `1px solid ${isDark ? "#333" : "#dee2e6"}`,
          }}
          onClick={logout}
        >
          <i
            className="bi bi-box-arrow-right fs-3 mb-3"
            style={{ color: "#ff4500" }}
          ></i>
          <h6
            className="fw-bold mb-2"
            style={{ color: isDark ? "#f8f9fa" : "#212529" }}
          >
            Logout
          </h6>
          <small style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
            Sign out from account
          </small>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="p-3">
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={notificationsEnabled}
          onChange={toggleNotifications}
        />
        <label className="form-check-label">Push Notifications</label>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="p-3">
      <p>Payment methods coming soon...</p>
    </div>
  );
  const renderPrivacyTab = () => (
    <div className="p-3">
      <p>Privacy settings...</p>
    </div>
  );

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: isDark ? "#121212" : "#f8f9fa",
        color: isDark ? "#f8f9fa" : "#212529",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ color: primary }}>
            Settings
          </h1>
          <small style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
            Manage your Daily Hustle account
          </small>
        </div>
        <button
          onClick={toggleTheme}
          className="btn rounded-pill"
          style={{
            background: isDark ? "#fff" : "#000",
            color: isDark ? "#000" : "#fff",
          }}
        >
          <i className={`bi bi-${isDark ? "sun" : "moon"}`}></i>
        </button>
      </div>
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn rounded-pill px-4 py-2 fw-bold ${
              activeTab === tab.id ? "shadow" : ""
            }`}
            style={{
              background: activeTab === tab.id ? primary : "transparent",
              color:
                activeTab === tab.id ? "#fff" : isDark ? "#f8f9fa" : "#212529",
              border: `1px solid ${
                activeTab === tab.id ? primary : isDark ? "#333" : "#dee2e6"
              }`,
            }}
          >
            <i className={`bi bi-${tab.icon} me-1`}></i>
            {tab.title}
          </button>
        ))}
      </div>
      <div
        className="rounded-4 p-4 shadow-sm"
        style={{ background: isDark ? "#1c1c1e" : "#fff" }}
      >
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "verification" && renderVerificationTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "notifications" && renderNotificationsTab()}
        {activeTab === "payments" && renderPaymentsTab()}
        {activeTab === "privacy" && renderPrivacyTab()}
      </div>
      <div className="text-center mt-4">
        <button onClick={logout} className="btn btn-link text-light">
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
      
      <VerificationModal 
        show={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          toast.success('Verification completed!');
          refetchUserData();
        }}
      />
      
      {/* KYC Form Modal */}
      {showKycForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">KYC Verification</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowKycForm(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <KycFormContent onClose={() => setShowKycForm(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
