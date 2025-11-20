import React, { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getReferralHistory, getReferralStats, getUser } from "../../services/services";

export default function Referrals() {
  const { theme } = useTheme();
  const { userData, addNotification, recordTaskHistory } = useAppData();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [referralData, setReferralData] = useState({ data: [], metadata: {} });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total_referrals: 0, total_referral_earnings: 0, total_hustle_points: 0 });
  const [userInfo, setUserInfo] = useState({});

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const containerBg = isDark ? "#121212" : "#f8f9fa";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";
  const borderColor = isDark ? "#333" : "#dee2e6";
  const primary = "var(--dh-red)";
  const gradientBg = isDark
    ? "linear-gradient(135deg, #7f1d1d, #240046)"
    : "linear-gradient(135deg, var(--dh-red), #ff4d4d)";

  const {
    username = userInfo.username || "User",
  } = userData || {};
  const referralCode = userInfo.my_referral_code || "HUSTLE123";
  const referralLink = `https://workers.dailyhustle.fun/signup?referral_code=${referralCode}`;
  const earningsPerReferral = 500;

  const itemsPerPage = 10;
  const { data: referralHistory = [], metadata = {} } = referralData;
  const totalPages = metadata.pages || 1;

  // Fetch referral data
  const fetchReferrals = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getReferralHistory(page, itemsPerPage, '', '', searchTerm);
      setReferralData(response.data.data);
    } catch (error) {
      toast.error("Failed to load referral history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats and user info
  const fetchStats = async () => {
    try {
      const [statsResponse, userResponse] = await Promise.all([
        getReferralStats(),
        getUser()
      ]);
      setStats(statsResponse.data.data);
      setUserInfo(userResponse.data.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReferrals(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ----------------------------
  // Copy link handler
  // ----------------------------
  const copyToClipboard = () => {
    if (copying) return;
    setCopying(true);
    
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        toast.success("✅ Referral link copied!");
        setTimeout(() => setCopied(false), 2000);

        addNotification({
          title: "Referral Link Copied!",
          message: "Share with friends to earn ₦500 per referral!",
          type: "success",
          category: "referral",
        });

        recordTaskHistory(
          "referral",
          "link_copied",
          `Referral link copied: ${referralCode}`
        );
      })
      .catch(() => {
        toast.error("❌ Failed to copy referral link!");
      })
      .finally(() => {
        setCopying(false);
      });
  };

  // ----------------------------
  // Share handler
  // ----------------------------
  const shareReferral = async () => {
    recordTaskHistory(
      "referral",
      "shared",
      `Referral link shared via device options`
    );
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${username}'s Daily Hustle!`,
          text: `Earn ₦500 daily with me on Daily Hustle!`,
          url: referralLink,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  // ----------------------------
  // Render Referrals page
  // ----------------------------
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: containerBg,
        color: textColor,
        minHeight: "100vh",
      }}
    >
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol
          className="breadcrumb"
          style={{ background: "transparent", padding: 0 }}
        >
          <li className="breadcrumb-item">
            <a href="/dashboard" style={{ color: labelColor }}>
              Dashboard
            </a>
          </li>
          <li
            className="breadcrumb-item active"
            aria-current="page"
            style={{ color: primary }}
          >
            Referrals
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="fw-bold mb-1" style={{ color: primary }}>
          Referral Program
        </h1>
        <p style={{ color: labelColor }}>
          Invite your friends and earn 10HP when they successfully complete a task🎉🎉!
        </p>
      </div>

      {/* Referral Stats */}
      <div
        className="p-4 mb-4 rounded-4 shadow"
        style={{
          background: gradientBg,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div className="row">
          <div className="col-md-4 mb-3">
            <h2 className="fw-bold">{stats.total_referrals}</h2>
            <small>Friends Referred</small>
          </div>
          <div className="col-md-4 mb-3">
            <h2 className="fw-bold">₦{stats.total_referral_earnings.toLocaleString()}</h2>
            <small>Total Earned</small>
          </div>
          <div className="col-md-4 mb-3">
            <h2 className="fw-bold">{stats.total_hustle_points}</h2>
            <small>Total HP Earned</small>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div
            className="p-4 rounded-4 shadow-sm"
            style={{ backgroundColor: cardBg }}
          >
            <h5 className="fw-bold mb-3" style={{ color: primary }}>
              <i className="bi bi-link-45deg me-2"></i>Your Referral Link
            </h5>
            <div className="input-group rounded-pill overflow-hidden">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="form-control border-0"
                style={{
                  background: isDark ? "#2a2a2d" : "#f8f9fa",
                  color: textColor,
                }}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={copyToClipboard}
                disabled={copying}
              >
                {copied ? (
                  <i className="bi bi-check-lg text-success"></i>
                ) : (
                  <i className="bi bi-copy"></i>
                )}
              </button>
            </div>
            <small style={{ color: labelColor }}>
              Share your link and earn each time your referral completes a task.
            </small>
          </div>
        </div>

        {/* Quick Share */}
        <div className="col-lg-4">
          <div
            className="text-center p-4 rounded-4 shadow-sm h-100"
            style={{ backgroundColor: cardBg }}
          >
            <i className="bi bi-share fs-1 mb-2" style={{ color: primary }}></i>
            <h6 className="fw-bold mb-3">Quick Share</h6>
            <button
              className="btn fw-bold text-white w-100 mb-2 rounded-pill"
              style={{ background: gradientBg }}
              onClick={shareReferral}
            >
              <i className="bi bi-send me-2"></i>Share via Device
            </button>
            <button
              className="btn btn-outline-light w-100 rounded-pill"
              onClick={() =>
                toast.info("Integration for WhatsApp coming soon!")
              }
            >
              <i className="bi bi-whatsapp me-2"></i>WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold" style={{ color: primary }}>
            Referral History
          </h5>
          <small style={{ color: labelColor }}>{metadata.total || 0} referrals</small>
        </div>

        {/* Search Filter */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa",
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            />
          </div>
        </div>

        <div
          className="rounded-4 shadow-sm"
          style={{ backgroundColor: cardBg }}
        >
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" style={{ color: primary }}></div>
              <p className="mt-2" style={{ color: labelColor }}>Loading referrals...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ color: textColor }}>Name</th>
                    <th style={{ color: textColor }}>Email</th>
                    <th style={{ color: textColor }}>Date</th>
                    <th style={{ color: textColor }}>Earnings</th>
                    <th style={{ color: textColor }}>HP</th>
                  </tr>
                </thead>
                <tbody>
                  {referralHistory.length > 0 ? (
                    referralHistory.map((referral) => (
                      <tr key={referral._id}>
                        <td style={{ color: textColor }}>
                          <i className="bi bi-person-circle me-2"></i>
                          {referral.first_name} {referral.last_name}
                        </td>
                        <td style={{ color: labelColor }}>{referral.email}</td>
                        <td style={{ color: labelColor }}>
                          {new Date(referral.date).toLocaleDateString()}
                        </td>
                        <td className="fw-bold" style={{ color: primary }}>
                          +{referral.earnings?.currency || 'NGN'}{(referral.earnings?.amount || 0).toLocaleString()}
                        </td>
                        <td className="fw-bold" style={{ color: referral.hustle_points?.is_rewarded ? '#28a745' : '#ffc107' }}>
                          {referral.hustle_points?.earned || 0} HP
                          {referral.hustle_points?.is_rewarded && <i className="bi bi-check-circle-fill ms-1"></i>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4" style={{ color: labelColor }}>
                        No referrals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div
              className="p-3 border-top d-flex justify-content-between align-items-center"
              style={{ borderTopColor: borderColor }}
            >
              <div>
                <span style={{ color: labelColor, fontSize: '0.9rem' }}>
                  Page {currentPage} of {totalPages} ({metadata.total} total)
                </span>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span className="btn btn-sm" style={{ backgroundColor: primary, color: 'white' }}>
                  {currentPage}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
