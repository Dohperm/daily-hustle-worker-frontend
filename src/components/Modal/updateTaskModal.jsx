// src/components/Modal/UpdateTaskModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useThemeContext";
import {
  ClipboardCheck,
  Upload,
  FileText,
  ShieldCheck,
  XCircle,
  CheckCircle,
} from "lucide-react";

export default function UpdateTaskModal({ task, show, onClose, onApply }) {
  const [proofType, setProofType] = useState("");
  const [proofText, setProofText] = useState("");
  const [image, setImage] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const primary = "#e63946";
  const cardBg = isDark ? "#1c1c1e" : "#fff";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const muted = isDark ? "#adb5bd" : "#6c757d";

  useEffect(() => {
    if (task) {
      setProofType("");
      setProofText("");
      setImage(null);
      setAgreed(false);
    }
  }, [task]);

  const handleClose = () => onClose?.();

  const handleProofType = (type) => {
    setProofType(type);
    if (type === "Image") setProofText("");
    else setImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!proofType) {
      toast.warning("⚠️ Please select a proof type (Image or Text)!");
      return;
    }
    if (proofType === "Image" && !image) {
      toast.warning("⚠️ Please upload your screenshot!");
      return;
    }
    if (proofType === "Text" && !proofText.trim()) {
      toast.warning("⚠️ Please describe your proof!");
      return;
    }
    if (!agreed) {
      toast.warning("⚠️ Please confirm your proof is genuine!");
      return;
    }

    const submissionData = {
      id: task.id || Date.now(),
      taskId: task.taskId || task.id,
      title: task.title,
      payout: task.payout,
      description: task.description,
      instructions: task.instructions,
      slots: task.slots,
      completedSlots: task.completedSlots,
      category: task.category,
      proofText: proofType === "Text" ? proofText : "",
      image: proofType === "Image" ? image : null,
      submittedAt: new Date().toISOString(),
      status: "Pending",
    };

    onApply?.(submissionData);
    toast.success("✅ Task resubmitted successfully!");
    handleClose();
  };

  if (!task) return null;

  const isSubmitReady =
    proofType && (proofType === "Image" ? image : proofText.trim()) && agreed;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop
      centered
      contentClassName="border-0 shadow-lg rounded-3 overflow-hidden"
    >
      {/* Header */}
      <div
        className="py-3 px-4 d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: primary,
          color: "#fff",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <ClipboardCheck size={22} />
          <h5 className="fw-bold mb-0">Redo Task</h5>
        </div>
        <button
          type="button"
          aria-label="Close"
          className="btn-close btn-close-white"
          onClick={handleClose}
        ></button>
      </div>

      {/* Body */}
      <div
        className="p-4"
        style={{
          backgroundColor: cardBg,
          color: textColor,
        }}
      >
        {/* Overview */}
        <div
          className="rounded-3 p-3 mb-3 shadow-sm"
          style={{
            backgroundColor: cardBg,
            borderLeft: `5px solid ${primary}`,
          }}
        >
          <div className="row text-center text-md-start">
            <div className="col-md-4 mb-2">
              <p
                className="fw-semibold mb-1 text-uppercase small"
                style={{ color: primary }}
              >
                Title
              </p>
              <span className="fw-bold">{task.title}</span>
            </div>
            <div className="col-md-4 mb-2">
              <p
                className="fw-semibold mb-1 text-uppercase small"
                style={{ color: primary }}
              >
                Category
              </p>
              <span style={{ color: muted }}>{task.category}</span>
            </div>
            <div className="col-md-4 mb-2">
              <p
                className="fw-semibold mb-1 text-uppercase small"
                style={{ color: primary }}
              >
                Payout
              </p>
              <span className="fw-bold" style={{ color: "#28a745" }}>
                ₦{task.payout.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <h6 className="fw-bold mb-2" style={{ color: primary }}>
            <FileText className="me-2" size={18} /> Description
          </h6>
          <div
            className="rounded-3 p-3 border"
            style={{
              backgroundColor: cardBg,
              borderColor: isDark ? "#343a40" : "#ced4da",
              color: muted,
            }}
          >
            {task.description}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-3">
          <h6 className="fw-bold mb-2" style={{ color: primary }}>
            <ShieldCheck className="me-2" size={18} /> Instructions
          </h6>
          <div
            className="rounded-3 p-3 border"
            style={{
              backgroundColor: cardBg,
              borderColor: isDark ? "#343a40" : "#ced4da",
              color: muted,
              whiteSpace: "pre-wrap",
            }}
          >
            {task.instructions}
          </div>
        </div>

        {/* Proof Form */}
        <Form onSubmit={handleSubmit}>
          <h6 className="fw-bold mb-3" style={{ color: primary }}>
            Resubmit Proof of Completion
          </h6>

          {/* Proof Type Selection */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold" style={{ color: textColor }}>
              Select Proof Type{" "}
              <span style={{ color: primary }}>*Required</span>
            </Form.Label>
            <div className="d-flex gap-2">
              <Button
                variant={proofType === "Image" ? "primary" : "outline-primary"}
                className="w-50 rounded-pill"
                onClick={() => handleProofType("Image")}
                style={{
                  backgroundColor: proofType === "Image" ? primary : cardBg,
                  borderColor: primary,
                  color: proofType === "Image" ? "#fff" : primary,
                }}
              >
                Image Proof
              </Button>
              <Button
                variant={proofType === "Text" ? "primary" : "outline-primary"}
                className="w-50 rounded-pill"
                onClick={() => handleProofType("Text")}
                style={{
                  backgroundColor: proofType === "Text" ? primary : cardBg,
                  borderColor: primary,
                  color: proofType === "Text" ? "#fff" : primary,
                }}
              >
                Text Proof
              </Button>
            </div>
          </Form.Group>

          {/* Image Proof */}
          {proofType === "Image" && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: textColor }}>
                Upload Screenshot{" "}
                <span style={{ color: primary }}>*Required</span>
              </Form.Label>
              <div
                className="text-center p-4 rounded-3 border border-dashed"
                style={{
                  borderColor: primary,
                  backgroundColor: isDark
                    ? "rgba(230, 57, 70, 0.1)"
                    : "#fff5f5",
                }}
              >
                <Upload size={24} className="mb-2" style={{ color: primary }} />
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="form-control border-0 bg-transparent text-center"
                  required
                />
                <small style={{ color: image ? "#28a745" : "red" }}>
                  {image ? `✅ ${image.name}` : "Upload screenshot *REQUIRED*"}
                </small>
              </div>
            </Form.Group>
          )}

          {/* Text Proof */}
          {proofType === "Text" && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: textColor }}>
                Proof Description{" "}
                <span style={{ color: primary }}>*Required</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="Describe your proof of completion..."
                style={{
                  backgroundColor: cardBg,
                  color: textColor,
                  borderColor: isDark ? "#343a40" : "#ced4da",
                }}
                className={proofText.trim() ? "border-success" : "border-light"}
                required
              />
            </Form.Group>
          )}

          {/* Checkbox */}
          <Form.Group className="form-check mb-4">
            <Form.Check
              type="checkbox"
              label="I confirm that my proof is genuine and accurate."
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ color: textColor }}
              required
            />
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              className="d-flex align-items-center gap-1 px-4 rounded-pill"
              style={{ borderColor: muted, color: muted }}
            >
              <XCircle size={18} /> Cancel
            </Button>
            <Button
              type="submit"
              className="fw-semibold px-4 rounded-pill shadow-sm"
              disabled={!isSubmitReady}
              style={{
                backgroundColor: isSubmitReady ? primary : muted,
                borderColor: isSubmitReady ? primary : muted,
                color: "#fff",
              }}
            >
              Resubmit Proof
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
