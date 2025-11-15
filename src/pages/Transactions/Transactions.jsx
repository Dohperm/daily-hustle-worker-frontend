// src/pages/Transactions/Transactions.jsx
import React, { useState } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
// eslint-disable-next-line no-unused-vars
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Transactions() {
  const { theme } = useTheme();
  const { userData, recordTaskHistory } = useAppData();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1c1c1e" : "#fff";
  const containerBg = isDark ? "#121212" : "#f8f9fa";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const muted = isDark ? "#adb5bd" : "#6c757d";
  const primary = "var(--dh-red)";

  const { transactions = [] } = userData || {};

  // Filter transactions
  const filteredTransactions = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getTypeColor = (type) => (type === "Task Payment" ? primary : "#6c757d");

  const openModal = (tx) => {
    setSelectedTransaction(tx);
    recordTaskHistory("transactions", "opened_details", `Viewed transaction #${tx.id}`);
  };

  const closeModal = () => setSelectedTransaction(null);

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
              Page {currentPage}/{totalPages} • {filteredTransactions.length}{" "}
              total
            </small>
          </div>
          <button
            className="btn btn-outline-light rounded-pill"
            onClick={() => navigate("/wallet")}
            style={{ borderColor: primary, color: textColor }}
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Wallet
          </button>
        </div>

        {/* Filter */}
        <div className="mb-3">
          {["all", "Task Payment"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilter(type);
                setCurrentPage(1);
              }}
              className="btn rounded-pill px-3 fw-semibold me-2"
              style={{
                border: `1px solid ${primary}`,
                color: filter === type ? "#fff" : textColor,
                backgroundColor: filter === type ? primary : "transparent",
              }}
            >
              {type === "all" ? "All" : "Task Payments"}
            </button>
          ))}
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
                  {["ID", "Date", "Type", "Amount", "Task"].map((h, i) => (
                    <th key={i} style={{ border: "none", color: textColor }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((t) => (
                  <tr
                    key={t.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => openModal(t)}
                  >
                    <td style={{ color: primary, border: "none" }}>#{t.id}</td>
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
                        color: primary,
                        fontWeight: "bold",
                      }}
                    >
                      ₦{t.amount.toLocaleString()}
                    </td>
                    <td style={{ border: "none", color: textColor }}>
                      {t.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className="btn rounded-pill px-3 py-1"
                style={{
                  backgroundColor:
                    currentPage === i + 1 ? primary : "transparent",
                  color: currentPage === i + 1 ? "#fff" : textColor,
                  border: `1px solid ${primary}`,
                }}
              >
                {i + 1}
              </button>
            ))}
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
                  Transaction #{selectedTransaction.id}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Type:</strong> {selectedTransaction.type}
                </p>
                <p>
                  <strong>Amount:</strong> ₦
                  {selectedTransaction.amount.toLocaleString()}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedTransaction.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Task:</strong> {selectedTransaction.title}
                </p>
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
