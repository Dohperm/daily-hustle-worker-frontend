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
      fileUrlUpdate("photo", imageUrl, userData);

      if (!imageUrl) {
        toast.error("No image URL returned from server.");
        throw new Error("No image URL returned from server.");
      }

      setAvatarPreview(imageUrl);
      await updateUserImageUrl({ type: "photo", fileUrl: imageUrl });
      refetchUserData();
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

    const normPhone = editPhone.startsWith("+234")
      ? editPhone.replace("+", "")
      : editPhone;
    const phoneRegex = /^(234\d{10}|0\d{10})$/;
    if (!phoneRegex.test(normPhone)) {
      toast.error("Phone must be 234XXXXXXXXXX or 0XXXXXXXXXX");
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        username: editUsername,
        phone: normPhone,
      }).then(() => refetchUserData());
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
          `Saved: ${editUsername}, ${normPhone}`
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

  const [editUsername, setEditUsername] = useState(username);
  const [editPhone, setEditPhone] = useState(phone);

  useEffect(() => {
    setEditUsername(username);
    setEditPhone(phone);
  }, [username, phone]);

  const renderProfileTab = () => (
    <form onSubmit={handleSaveProfile}>
      <div
        className="text-center mb-4 p-4 rounded-3"
        style={{ background: isDark ? "#23242d" : "#f7f7fd" }}
      >
        <img
          src={
            avatarPreview ||
            photo ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="Avatar"
          className="rounded-circle mb-3"
          style={{
            width: 90,
            height: 90,
            objectFit: "cover",
            border: `3px solid ${primary}`,
          }}
        />
        <br />
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploadingAvatar}
          className="btn btn-outline-light btn-sm"
        >
          {uploadingAvatar ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Uploading...
            </>
          ) : (
            <>
              <i className="bi bi-camera me-1"></i> Change Avatar
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
      </div>

      <div
        className="mb-4 p-3 rounded-3"
        style={{ background: isDark ? "#2a2a2d" : "#f8f9fa" }}
      >
        <label
          className="form-label fw-bold d-flex align-items-center"
          style={{ color: isDark ? "#f8f9fa" : "#212529" }}
        >
          <i className="bi bi-person me-2"></i> Username
        </label>
        <input
          type="text"
          className="form-control rounded-3"
          value={editUsername}
          placeholder="Your username"
          onChange={(e) => setEditUsername(e.target.value)}
          style={{
            background: isDark ? "#1c1c1e" : "#fff",
            color: isDark ? "#f8f9fa" : "#212529",
            borderColor: isDark ? "#333" : "#dee2e6",
          }}
        />
      </div>
      <div
        className="mb-4 p-3 rounded-3"
        style={{ background: isDark ? "#2a2a2d" : "#f8f9fa" }}
      >
        <label
          className="form-label fw-bold d-flex align-items-center"
          style={{ color: isDark ? "#f8f9fa" : "#212529" }}
        >
          <i className="bi bi-telephone me-2"></i> Phone Number
        </label>
        <input
          type="tel"
          className="form-control rounded-3"
          value={editPhone}
          placeholder="234XXXXXXXXXX or 0XXXXXXXXXX"
          onChange={(e) => setEditPhone(e.target.value)}
          style={{
            background: isDark ? "#1c1c1e" : "#fff",
            color: isDark ? "#f8f9fa" : "#212529",
            borderColor: isDark ? "#333" : "#dee2e6",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn w-100 fw-bold py-3 rounded-pill text-white"
        style={{ background: gradientBg, border: "none" }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>{" "}
            Saving...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i> Save Profile
          </>
        )}
      </button>
    </form>
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
              <small style={{ color: userData.kyc?.is_approved ? 'var(--dh-green)' : "#ffc107" }}>
                {userData.kyc?.is_approved ? "Verified" : "Pending Verification"}
              </small>
            </div>
            <button
              className="btn fw-bold rounded-pill px-4"
              style={{
                backgroundColor: userData.kyc?.is_approved ? '#28a745' : '#ff5722',
                color: userData.kyc?.is_approved ? "#fff" : "#fff",
                border: 'none'
              }}
              onClick={() => setShowKycForm(true)}
              disabled={userData.kyc?.is_approved}
            >
              {userData.kyc?.is_approved ? "Verified" : "Complete KYC"}
            </button>
          </div>
          <small className="text-muted">
            Complete KYC verification to unlock all platform features and verified badges
          </small>
        </div>
      </div>

      {/* Worker Badge */}
      <div className="col-12">
        <div
          className="p-4 rounded-4"
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#fff",
            border: `1px solid ${isDark ? "#333" : "#dee2e6"}`,
            opacity: userData.kyc?.is_approved ? 1 : 0.6
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <VerificationBadge type="worker" verified={userData.kyc?.is_approved && verifiedWorker} size="lg" />
            <button
              className="btn btn-outline-success btn-sm"
              disabled={!userData.kyc?.is_approved || verifiedWorker}
              onClick={() => toast.info('Worker badge request submitted!')}
            >
              {verifiedWorker ? 'Active' : 'Request'}
            </button>
          </div>
          <small className="text-muted">
            Verified workers get priority access to premium tasks
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
