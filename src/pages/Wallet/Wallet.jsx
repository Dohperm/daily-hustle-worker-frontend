// src/pages/Wallet/Wallet.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getTransactions } from "../../services/services";

export default function Wallet() {
  const { theme } = useTheme();
  const { userData, updateUserWallet, recordTaskHistory } = useAppData();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const isDark = theme === "dark";
  const card = isDark ? "#1c1c1e" : "#ffffff";
  const bg = isDark ? "#121212" : "#f8f9fa";
  const text = isDark ? "#f8f9fa" : "#212529";
  const label = isDark ? "#adb5bd" : "#6c757d";
  const border = isDark ? "#333" : "#dee2e6";
  const primary = "var(--dh-red)";

  const { balance = 0, kyc = {} } = userData;
  const kycVerified = kyc.status === "verified";
  const minWithdraw = 1000;
  const canWithdraw = balance >= minWithdraw && kycVerified;

  // Fetch recent transactions
  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await getTransactions(1, 5);
      const responseData = response.data?.data;
      if (responseData) {
        setTransactions(responseData.data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);

    if (!kycVerified) return toast.error("❌ Complete your KYC first!");
    if (isNaN(amt) || amt < minWithdraw)
      return toast.error(`❌ Minimum withdrawal ₦${minWithdraw}`);
    if (amt > balance) return toast.error("❌ Insufficient funds!");

    setLoading(true);
    setTimeout(() => {
      updateUserWallet(-amt);
      recordTaskHistory(
        "wallet",
        "withdrawal",
        `₦${amt.toLocaleString()} requested via ${method}`
      );
      toast.success("✅ Withdrawal processing (within 24 hours)");
      setShowModal(false);
      setLoading(false);
      setAmount("");
    }, 1500);
  };

  return (
    <div
      className="min-vh-100 py-4 px-3"
      style={{ background: bg, color: text }}
    >
      <h2 className="fw-bold mb-3" style={{ color: primary }}>
        Wallet & Earnings
      </h2>
      <p style={{ color: label }}>Manage your transfers securely</p>

      {/* Balance Card */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 style={{ color: label }}>Balance</h5>
          <i
            className={`bi ${showBalance ? "bi-eye-slash" : "bi-eye"}`}
            style={{ cursor: "pointer", color: label }}
            onClick={() => setShowBalance(!showBalance)}
          ></i>
        </div>
        <h1 className="fw-bold mb-3" style={{ color: primary }}>
          {showBalance ? `₦${balance.toLocaleString()}` : "₦•••••"}
        </h1>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn rounded-pill fw-bold text-white px-4"
            style={{ background: primary }}
            disabled={!canWithdraw}
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-arrow-down-circle me-1"></i>Withdraw
          </button>
          <button
            className="btn btn-outline-light rounded-pill fw-bold px-4"
            onClick={() => navigate("/transactions")}
          >
            <i className="bi bi-list-ul me-1"></i>Transactions
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ color: text }}>Recent Transactions</h5>
          <button
            className="btn btn-sm"
            style={{ color: primary }}
            onClick={() => navigate("/dashboard/transactions")}
          >
            View All
          </button>
        </div>
        
        {transactionsLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" style={{ color: primary }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-borderless mb-0">
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td style={{ border: "none", padding: "0.5rem 0" }}>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            background: t.type === "Credit" ? "rgba(255, 69, 0, 0.1)" : "rgba(220, 53, 69, 0.1)"
                          }}
                        >
                          <i
                            className={`bi ${t.type === "Credit" ? "bi-arrow-down" : "bi-arrow-up"}`}
                            style={{ color: t.type === "Credit" ? primary : "#dc3545" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <div style={{ color: text, fontWeight: "500" }}>
                            {t.type === "Credit" ? "Task Payment" : "Withdrawal"}
                          </div>
                          <small style={{ color: label }}>
                            {new Date(t.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div
                          style={{
                            color: t.type === "Credit" ? primary : "#dc3545",
                            fontWeight: "bold"
                          }}
                        >
                          {t.type === "Credit" ? "+" : "-"}{t.currency} {t.amount.toLocaleString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4" style={{ color: label }}>
            <i className="bi bi-inbox fs-4 mb-2 d-block"></i>
            No transactions yet
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{
            background: "rgba(0,0,0,0.6)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 450 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content rounded-4"
              style={{ background: card, color: text }}
            >
              <div
                className="modal-header border-0"
                style={{ background: primary, color: "#fff" }}
              >
                <h5 className="m-0">Withdraw Funds</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleWithdraw}>
                <div className="modal-body">
                  <label className="fw-semibold mb-2">Amount (₦)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-control mb-3"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  />
                  <label className="fw-semibold mb-2">Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="form-select"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <option value="bank">🏦 Bank Transfer</option>
                    <option value="mobile">📱 Mobile Money</option>
                  </select>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn rounded-pill btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn rounded-pill text-white fw-bold px-4"
                    style={{ background: primary }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-down-circle me-1"></i>Withdraw
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
