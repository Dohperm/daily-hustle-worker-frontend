import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTheme } from "../../hooks/useThemeContext";

export default function ModalMyTask({ task, show, onClose }) {
  const { theme } = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);
  const isDark = theme === "dark";

  const primary = "#e63946";
  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";

  if (!task) return null;

  const handleCopy = () => {
    if (task.reviewText) {
      navigator.clipboard.writeText(task.reviewText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <div
        className="py-3 px-4 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: primary, color: "#ffffff" }}
      >
        <h5 className="fw-bold mb-0">
          <i className="bi bi-list-task me-2"></i>
          {task.title}
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
        ></button>
      </div>

      <div
        className="p-4"
        style={{
          backgroundColor: cardBg,
          color: textColor,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <p className="fw-semibold mb-2" style={{ color: labelColor }}>
          {task.category || "UNCATEGORIZED"}
        </p>
        <p>{task.description}</p>

        {/* Site Link */}
        {task.link && (
          <Button
            className="rounded-pill mb-3"
            style={{
              backgroundColor: primary,
              color: "#fff",
              border: "none",
            }}
            onClick={() =>
              window.open(task.link, "_blank", "noopener,noreferrer")
            }
          >
            <i className="bi bi-globe2 me-2"></i> Go to Task Website
          </Button>
        )}

        {/* Proof Section */}
        {(task.proofText || task.proofImage) && (
          <div className="mt-3">
            <h6 className="fw-bold mb-2" style={{ color: primary }}>
              Submitted Proof
            </h6>
            {task.proofText && (
              <p
                className="p-2 rounded small"
                style={{
                  backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa",
                }}
              >
                {task.proofText}
              </p>
            )}
            {task.proofImage && (
              <img
                src={task.proofImage}
                alt="proof"
                className="img-fluid rounded shadow-sm mt-2"
              />
            )}
          </div>
        )}

        {/* Review Copy */}
        {task.closed && task.reviewText && (
          <div
            className="p-3 mt-4 rounded"
            style={{
              backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa",
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: primary }}>
              Review Text
            </h6>
            <p className="small mb-2">{task.reviewText}</p>
            <Button
              size="sm"
              onClick={handleCopy}
              variant="outline-light"
              className="rounded-pill fw-semibold"
            >
              {copySuccess ? "Copied!" : "Copy Review"}
            </Button>
          </div>
        )}

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={onClose}
            style={{ borderColor: labelColor, color: labelColor }}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
