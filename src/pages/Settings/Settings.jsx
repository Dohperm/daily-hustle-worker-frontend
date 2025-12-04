// src/pages/Settings.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  uploadImage,
  updateUser,
  fileUrlUpdate,
  getBanks,
  getBankAccounts,
  verifyAccount,
  saveBankInfo,
  removeAccount,
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

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("settingsActiveTab") || "profile");
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

  const kycVerified = useMemo(() => {
    return userData?.kyc?.is_approved === true;
  }, [userData?.kyc?.is_approved]);

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
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
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
              <small style={{ color: userData.kyc?.is_approved ? '#28a745' : "#ffc107" }}>
                {userData.kyc?.is_approved ? "✓ KYC Completed" : "Pending Verification"}
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
              disabled={userData.kyc?.is_approved}
            >
              {userData.kyc?.is_approved ? "✓ Completed" : "Complete KYC"}
            </button>
          </div>
          <small className="text-muted">
            {userData.kyc?.is_approved
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

  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: ''
  });
  const [savingBankDetails, setSavingBankDetails] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [removingAccountId, setRemovingAccountId] = useState(null);
  const [removePassword, setRemovePassword] = useState('');

  useEffect(() => {
    fetchBanks();
    loadExistingBankAccounts();
  }, []);

  const loadExistingBankAccounts = async () => {
    try {
      const response = await getBankAccounts();
      const accounts = response.data?.data || response.data || [];
      console.log('Fetched bank accounts from API:', accounts);
      setBankAccounts(Array.isArray(accounts) ? accounts : []);
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      // Fallback to userData if API fails
      if (userData?.bank_accounts && Array.isArray(userData.bank_accounts)) {
        setBankAccounts(userData.bank_accounts);
      } else {
        setBankAccounts([]);
      }
    }
  };

  const resetBankForm = () => {
    setBankDetails({
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: ''
    });
  };

  const handleRemoveAccount = async (accountId) => {
    if (bankAccounts.length <= 1) {
      toast.error('You must have at least one payment account');
      return;
    }
    
    if (!removePassword) {
      toast.error('Please enter your password to remove this account');
      return;
    }
    
    try {
      await removeAccount({ accountId, password: removePassword });
      
      setRemovingAccountId(null);
      setRemovePassword('');
      toast.success('Bank account removed successfully');
      await loadExistingBankAccounts();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove account';
      toast.error(errorMessage);
    }
  };

  const loadExistingBankInfo = () => {
    if (userData?.bank_info && !bankDetails.accountName) {
      setBankDetails({
        bankName: userData.bank_info.bank_name || '',
        bankCode: userData.bank_info.bank_code || '',
        accountNumber: userData.bank_info.account_number || '',
        accountName: userData.bank_info.account_name || ''
      });
    }
  };

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const { data } = await getBanks();
      setBanks(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load banks';
      toast.error(errorMessage);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
    
    if (field === 'accountNumber' && value.length >= 10 && bankDetails.bankCode) {
      verifyAccountNumber(value, bankDetails.bankCode);
    }
  };

  const handleBankChange = (bankName, bankCode) => {
    setBankDetails(prev => ({ 
      ...prev, 
      bankName, 
      bankCode,
      accountName: '' // Reset account name when bank changes
    }));
    
    if (bankDetails.accountNumber.length >= 10) {
      verifyAccountNumber(bankDetails.accountNumber, bankCode);
    }
  };

  const verifyAccountNumber = async (accountNumber, bankCode) => {
    if (!accountNumber || !bankCode) return;
    
    setVerifyingAccount(true);
    try {
      const response = await verifyAccount({ account_number: accountNumber, bank_code: bankCode });
      const accountName = response?.data?.account_name || response?.data?.data?.account_name || '';
      setBankDetails(prev => ({ ...prev, accountName }));
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Could not verify account number';
      toast.error(errorMessage);
      setBankDetails(prev => ({ ...prev, accountName: '' }));
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankCode) {
      toast.error('Please fill in all bank details');
      return;
    }
    
    setSavingBankDetails(true);
    try {
      await saveBankInfo({
        bank_name: bankDetails.bankName,
        account_number: bankDetails.accountNumber,
        account_name: bankDetails.accountName,
        bank_code: bankDetails.bankCode
      });
      toast.success('Bank details saved successfully!');
      addNotification({
        title: 'Bank Details Updated',
        message: 'Your payment information has been saved.',
        type: 'success',
        category: 'payments'
      });
      setIsEditing(false);
      setShowAddForm(false);
      resetBankForm();
      await refetchUserData();
      await loadExistingBankAccounts();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save bank details';
      toast.error(errorMessage);
    } finally {
      setSavingBankDetails(false);
    }
  };

  const renderPaymentsTab = () => (
    <div>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold mb-0" style={{ color: isDark ? "#f8f9fa" : "#333" }}>
            Bank Details for Payments
          </h5>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              resetBankForm();
            }}
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-plus me-1"></i>
            Add Bank Account
          </button>
        </div>
        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          <i className="bi bi-info-circle me-2"></i>
          Manage your bank accounts for receiving payments and withdrawals.
        </p>
      </div>

      {/* Existing Bank Accounts */}
      {bankAccounts.length > 0 ? (
        <div className="mb-4">
          <h6 className="fw-semibold mb-3" style={{ color: isDark ? "#f8f9fa" : "#333" }}>Your Bank Accounts</h6>
          {bankAccounts.map((account, index) => {
            const accountId = account._id || account.id || index;
            console.log('Rendering account:', account, 'with ID:', accountId);
            return (
            <div key={accountId} className="card mb-3" style={{
              backgroundColor: isDark ? "#1c1c1e" : "#fff",
              border: `1px solid ${isDark ? '#444' : '#ddd'}`,
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title mb-1" style={{ color: isDark ? "#f8f9fa" : "#333" }}>
                      {account.bank_name}
                      {account.is_primary && <span className="badge bg-success ms-2">Primary</span>}
                    </h6>
                    <p className="card-text mb-1" style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
                      <strong>Account:</strong> {account.account_number}
                    </p>
                    <p className="card-text mb-0" style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
                      <strong>Name:</strong> {account.account_name}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    {bankAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRemovingAccountId(accountId)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-bank2 fs-1 text-muted mb-3 d-block"></i>
          <h6 className="text-muted">No Bank Account Found</h6>
          <p className="text-muted small">You haven't added any bank accounts yet. Click "Add Bank Account" to get started.</p>
        </div>
      )}

      {/* Remove Account Modal */}
      {removingAccountId !== null && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remove Bank Account</h5>
                <button className="btn-close" onClick={() => {
                  setRemovingAccountId(null);
                  setRemovePassword('');
                }}></button>
              </div>
              <div className="modal-body">
                <p>Enter your password to confirm removal of this bank account:</p>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={removePassword}
                  onChange={(e) => setRemovePassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => {
                  setRemovingAccountId(null);
                  setRemovePassword('');
                }}>Cancel</button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleRemoveAccount(removingAccountId)}
                  disabled={!removePassword}
                >
                  Remove Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Account Form */}
      {showAddForm && (
        <form onSubmit={handleSaveBankDetails}>
          <h6 className="fw-semibold mb-3" style={{ color: isDark ? "#f8f9fa" : "#333" }}>
            Add New Bank Account
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>
                Bank Name *
              </label>
              <select
                className="form-select bank-select"
                value={bankDetails.bankName}
                onChange={(e) => {
                  const selectedBank = banks.find(bank => bank.name === e.target.value);
                  if (selectedBank) {
                    handleBankChange(selectedBank.name, selectedBank.code);
                  }
                }}
                disabled={loadingBanks}
                style={{
                  background: isDark ? "#1c1c1e" : "#fff",
                  border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                  color: isDark ? "#f8f9fa" : "#333"
                }}
              >
                <option value="">{loadingBanks ? 'Loading banks...' : 'Select your bank'}</option>
                {Array.isArray(banks) && banks.map((bank) => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>
                Account Number *
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your account number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                  style={{
                    background: isDark ? "#1c1c1e" : "#fff",
                    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                    color: isDark ? "#f8f9fa" : "#333"
                  }}
                />
                {verifyingAccount && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ color: isDark ? "#f8f9fa" : "#666" }}>
                Account Name *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Account name will appear here after verification"
                value={bankDetails.accountName}
                readOnly
                style={{
                  background: isDark ? "#2a2a2a" : "#f8f9fa",
                  border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                  color: isDark ? "#f8f9fa" : "#333"
                }}
              />
              {bankDetails.accountName && (
                <small className="text-success mt-1 d-block">
                  <i className="bi bi-check-circle me-1"></i>
                  Account verified
                </small>
              )}
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button
              type="submit"
              disabled={savingBankDetails}
              className="btn fw-bold px-4"
              style={{
                background: '#ff5722',
                color: 'white',
                border: 'none'
              }}
            >
              {savingBankDetails ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Save Bank Details
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                resetBankForm();
              }}
              className="btn btn-outline-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 p-3 rounded" style={{ 
        backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
        border: `1px solid ${isDark ? '#333' : '#e9ecef'}`
      }}>
        <small className="text-muted">
          <i className="bi bi-shield-check me-2" style={{ color: '#28a745' }}></i>
          Your bank details are encrypted and securely stored. We only use this information to process your payments.
        </small>
      </div>
    </div>
  );
  const renderPrivacyTab = () => (
    <div className="p-3">
      <p>Privacy settings...</p>
    </div>
  );

  return (
    <>
      <style>
        {`
          .bank-select option:hover {
            background-color: #ff5722 !important;
            color: white !important;
          }
        `}
      </style>
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
            onClick={() => {
              setActiveTab(tab.id);
              localStorage.setItem("settingsActiveTab", tab.id);
            }}
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
    </>
  );
}
