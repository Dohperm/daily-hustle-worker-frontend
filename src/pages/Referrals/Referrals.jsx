import React, { useState } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Referrals() {
  const { theme } = useTheme();
  const { userData, addNotification, recordTaskHistory } = useAppData();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
    username = "User",
    referralCode = "HUSTLE123",
    referralIncome = 0,
    referrals = 0,
    kyc = {},
  } = userData || {};
  const kycVerified = kyc.status === "verified";

  const referralLink = `https://dailyhustle.com/ref/${referralCode}`;
  const earningsPerReferral = 500;

  // Example data (mock)
  const referralHistory = [
    { friend: "John D.", date: "Oct 17", amount: 500 },
    { friend: "Sarah K.", date: "Oct 17", amount: 500 },
    { friend: "Mike B.", date: "Oct 16", amount: 500 },
    { friend: "Lisa M.", date: "Oct 15", amount: 500 },
    { friend: "Emma W.", date: "Oct 14", amount: 500 },
    { friend: "David S.", date: "Oct 13", amount: 500 },
  ];

  const itemsPerPage = 5;
  const totalPages = Math.ceil(referralHistory.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentReferrals = referralHistory.slice(start, start + itemsPerPage);

  // ----------------------------
  // Copy link handler
  // ----------------------------
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
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
    } catch {
      toast.error("❌ Failed to copy referral link!");
    }
  };

  // ----------------------------
  // Share handler
  // ----------------------------
  const shareReferral = () => {
    recordTaskHistory(
      "referral",
      "shared",
      `Referral link shared via device options`
    );
    if (navigator.share) {
      navigator.share({
        title: `Join ${username}'s Daily Hustle!`,
        text: `Earn ₦500 daily with me on Daily Hustle!`,
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

  if (!kycVerified) {
    return (
      <div
        className="p-4 text-center d-flex flex-column align-items-center justify-content-center"
        style={{
          backgroundColor: containerBg,
          color: textColor,
          minHeight: "100vh",
        }}
      >
        <div
          className="rounded-4 p-5 mb-4"
          style={{
            background: gradientBg,
            color: "#fff",
            maxWidth: "480px",
            margin: "auto",
          }}
        >
          <i className="bi bi-shield-slash fs-1 mb-3"></i>
          <h1 className="fw-bold mb-3">KYC Required</h1>
          <p className="mb-4">Complete verification to activate referrals</p>
          <button
            className="btn btn-light fw-bold px-5 py-3 rounded-pill shadow-lg"
            onClick={() => navigate("/kyc")}
          >
            Verify KYC Now
          </button>
        </div>
      </div>
    );
  }

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
          Invite your friends and earn ₦{earningsPerReferral.toLocaleString()}{" "}
          each!
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
            <h2 className="fw-bold">{referrals}</h2>
            <small>Friends Referred</small>
          </div>
          <div className="col-md-4 mb-3">
            <h2 className="fw-bold">₦{referralIncome.toLocaleString()}</h2>
            <small>Total Earned</small>
          </div>
          <div className="col-md-4 mb-3">
            <h2 className="fw-bold">{Math.round(referrals * 100)}%</h2>
            <small>Referral Growth</small>
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
          <small style={{ color: labelColor }}>{referrals} referrals</small>
        </div>

        <div
          className="rounded-4 shadow-sm"
          style={{ backgroundColor: cardBg }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ color: textColor }}>Friend</th>
                  <th style={{ color: textColor }}>Date</th>
                  <th style={{ color: textColor }}>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {currentReferrals.map((r, i) => (
                  <tr key={i}>
                    <td style={{ color: textColor }}>
                      <i className="bi bi-person-circle me-2"></i>
                      {r.friend}
                    </td>
                    <td style={{ color: labelColor }}>{r.date}</td>
                    <td className="fw-bold" style={{ color: primary }}>
                      +₦{r.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="p-3 border-top d-flex justify-content-between align-items-center"
              style={{ borderTopColor: borderColor }}
            >
              <div className="d-flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`rounded-pill px-3 py-1 border-0 fw-semibold ${
                      currentPage === i + 1 ? "text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        currentPage === i + 1 ? primary : "transparent",
                      color: currentPage === i + 1 ? "#fff" : labelColor,
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div>
                <button
                  className="btn btn-outline-light rounded-pill me-1"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  className="btn btn-outline-light rounded-pill"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(currentPage + 1, totalPages))
                  }
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
