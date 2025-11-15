// src/pages/Transactions/Transactions.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getTransactions } from "../../services/services";

export default function Transactions() {
  const { theme } = useTheme();
  const { recordTaskHistory } = useAppData();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1c1c1e" : "#fff";
  const containerBg = isDark ? "#121212" : "#f8f9fa";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const muted = isDark ? "#adb5bd" : "#6c757d";
  const primary = "var(--dh-red)";

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions(currentPage, itemsPerPage, '-1', search);
      setTransactions(response.data.data.data);
      setMetadata(response.data.data.metadata);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filter === "all" || t.type.toLowerCase() === filter.toLowerCase()
  );

  const getTypeColor = (type) => (type === "Credit" ? primary : "#6c757d");

  const openModal = (tx) => {
    setSelectedTransaction(tx);
    recordTaskHistory("transactions", "opened_details", `Viewed transaction ${tx.reference}`);
  };

  const closeModal = () => setSelectedTransaction(null);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: containerBg, color: textColor }}
      >
        <div className="spinner-border" style={{ color: primary }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!transactions?.length)
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center min-vh-100 p-4"
        style={{ backgroundColor: containerBg, color: textColor }}
      >
        <i className="bi bi-inbox fs-1 mb-3" style={{ color: muted }}></i>
        <h5>No transactions yet</h5>
        <small style={{ color: muted }}>
          Complete tasks to start tracking earnings.
        </small>
      </div>
    );

  return (
    <>
      <div
        className="container-fluid p-4 min-vh-100"
        style={{ backgroundColor: containerBg, color: textColor }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: primary }}>
              <i className="bi bi-list-ul me-2"></i>Transactions
            </h2>
            <small style={{ color: muted }}>
              Page {metadata.page || 1}/{metadata.pages || 1} • {metadata.total || 0} total
            </small>
          </div>
          <button
            className="btn btn-outline-light rounded-pill"
            onClick={() => navigate("/dashboard/wallet")}
            style={{ borderColor: primary, color: textColor }}
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Wallet
          </button>
        </div>

        {/* Search and Filter */}
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                color: textColor
              }}
            />
          </div>
          <div className="col-md-6">
            {["all", "Credit", "Debit"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className="btn rounded-pill px-3 fw-semibold me-2"
                style={{
                  border: `1px solid ${primary}`,
                  color: filter === type ? "#fff" : textColor,
                  backgroundColor: filter === type ? primary : "transparent",
                }}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div
          className="rounded-4 shadow-sm overflow-hidden"
          style={{ backgroundColor: cardBg }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead
                style={{ backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa" }}
              >
                <tr>
                  {["Reference", "Date", "Type", "Amount", "Description"].map((h, i) => (
                    <th key={i} style={{ border: "none", color: textColor }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr
                    key={t._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => openModal(t)}
                  >
                    <td style={{ color: primary, border: "none" }}>
                      {t.reference.slice(-8)}
                    </td>
                    <td style={{ color: muted, border: "none" }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ border: "none" }}>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: getTypeColor(t.type),
                          color: "#fff",
                        }}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      style={{
                        border: "none",
                        color: t.type === "Credit" ? "#28a745" : "#dc3545",
                        fontWeight: "bold",
                      }}
                    >
                      {t.type === "Credit" ? "+" : "-"}₦{t.amount.toLocaleString()}
                    </td>
                    <td style={{ border: "none", color: textColor }}>
                      {t.description.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {metadata.pages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn rounded-pill px-3"
              style={{
                backgroundColor: "transparent",
                color: textColor,
                border: `1px solid ${primary}`,
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            
            <span style={{ color: textColor, margin: "0 15px" }}>
              {currentPage} of {metadata.pages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(metadata.pages, prev + 1))}
              disabled={currentPage === metadata.pages}
              className="btn rounded-pill px-3"
              style={{
                backgroundColor: "transparent",
                color: textColor,
                border: `1px solid ${primary}`,
                opacity: currentPage === metadata.pages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {selectedTransaction && (
        <div
          className="modal fade show d-block"
          style={{
            position: "fixed",
            top: 0,
            background: "rgba(0,0,0,0.6)",
            width: "100%",
            height: "100%",
            zIndex: 1055,
          }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content rounded-4 shadow"
              style={{ backgroundColor: cardBg, color: textColor }}
            >
              <div
                className="modal-header border-0"
                style={{ backgroundColor: primary }}
              >
                <h5 className="text-white m-0">
                  Transaction Details
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Reference:</strong> {selectedTransaction.reference}
                </p>
                <p>
                  <strong>Type:</strong> {selectedTransaction.type}
                </p>
                <p>
                  <strong>Amount:</strong> ₦{selectedTransaction.amount.toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`badge ms-2 ${selectedTransaction.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                    {selectedTransaction.status}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Description:</strong> {selectedTransaction.description.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                {selectedTransaction.metadata?.fees !== undefined && (
                  <p>
                    <strong>Fees:</strong> ₦{selectedTransaction.metadata.fees}
                  </p>
                )}
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-light rounded-pill px-4"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
