import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { uploadFile } from "../../services/services";
import logo from "../../../public/assets/logo.png";

export default function ModalTask({ task, show, onClose }) {
  const { theme } = useTheme();
  const {
    userData,
    showNotification,
    submitTaskProof,
    onApplyFunc,
    setUserData,
  } = useAppData();

  const isDark = theme === "dark";
  const bg = isDark ? "#1c1c1e" : "#fff";
  const text = isDark ? "#f8f9fa" : "#212529";
  const primary = "var(--dh-red)";
  const placeholderImage = logo;
  const [localProofRecord, setLocalProofRecord] = useState(null);
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);

  const proofRecord =
    localProofRecord ||
    userData?.tasks?.find((t) => (t.task?._id || t.task_id) === task._id) ||
    null;

  const userStatus = (
    proofRecord?.status ||
    proofRecord?.submission_progress ||
    ""
  ).toLowerCase();

  const isPending = userStatus === "pending";
  const isApproved = userStatus === "approved";
  const isBlacklisted = userStatus === "blacklisted";
  const hasStarted = !!proofRecord;

  const [showProofForm, setShowProofForm] = useState(false);
  const [proofText, setProofText] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    if (!show) {
      setProofText("");
      setProofFile(null);
      setPreviewURL(null);
      setError("");
      setShowProofForm(false);
      setLocalProofRecord(null);
      setIsStarting(false);
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (proofRecord) {
      setProofText(proofRecord.title || "");
      setPreviewURL(proofRecord.src || null);
      setProofFile(null);
      setShowProofForm(!(isPending || isApproved || isBlacklisted));
    } else {
      setProofText("");
      setPreviewURL(null);
      setProofFile(null);
      setShowProofForm(false);
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [show, proofRecord, isPending, isApproved, isBlacklisted]);

  useEffect(() => {
    if (proofFile) {
      const url = URL.createObjectURL(proofFile);
      setPreviewURL(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [proofFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProofFile(null);
      setPreviewURL(proofRecord?.src || null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed.");
      setProofFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      setProofFile(null);
      return;
    }
    setError("");
    setProofFile(file);
  };

  const handleCopy = () => {
    if (typeof task.review_text === "string") {
      navigator.clipboard.writeText(task.review_text);
      showNotification?.("Review text copied!", "success");
    }
  };

  const handleStartTask = async () => {
    if (isStarting || hasStarted) return;
    setIsStarting(true);
    setError("");
    try {
      const proofData = await onApplyFunc(task);
      if (!proofData?._id) throw new Error("Invalid proof response");

      const newProof = {
        ...proofData,
        task_id: proofData.task_id || task._id,
        task,
        title: "",
        src: null,
        status: "started",
        submission_progress: "started",
      };

      setLocalProofRecord(newProof);
      setUserData((prev) => ({
        ...prev,
        tasks: [...(prev.tasks || []), newProof],
      }));

      setShowProofForm(true);
      showNotification?.(`Started: "${task.title}"`, "success");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to start task";
      setError(msg);
      showNotification?.(msg, "error");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) {
      setError("Text proof required");
      return;
    }
    if (!proofFile && !previewURL) {
      setError("Image proof required");
      return;
    }
    if (!proofRecord?._id) {
      setError("System error. Please refresh.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let src = previewURL;
      if (proofFile) {
        const res = await uploadFile(proofFile);
        if (!res.data?.data?.[0]?.src) throw new Error("Upload failed");
        src = res.data.data[0].src;
      }
      const submittedTitle = proofText.trim();

      await submitTaskProof(proofRecord._id, { title: submittedTitle, src });

      setUserData((prev) => {
        const updatedTasks = (prev.tasks || []).map((t) => {
          const idMatch = (t.task?._id || t.task_id) === task._id;
          if (idMatch) {
            return {
              ...t,
              title: submittedTitle,
              src: src,
              status: "pending",
              submission_progress: "pending",
            };
          }
          return t;
        });
        return { ...prev, tasks: updatedTasks };
      });

      if (localProofRecord) {
        setLocalProofRecord((prev) => ({
          ...prev,
          title: submittedTitle,
          src: src,
          status: "pending",
          submission_progress: "pending",
        }));
      }

      setProofFile(null);
      setShowProofForm(false);
      showNotification?.("Proof submitted successfully!", "success");
      onClose?.();
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Request timed out."
          : err.response?.data?.message || err.message || "Submission failed";
      setError(msg);
      showNotification?.("Failed: " + msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={showProofForm ? undefined : onClose}
      centered
      backdrop={showProofForm ? "static" : true}
      keyboard={!showProofForm}
    >
      {/* HEADER */}
      <div
        className="py-3 px-4 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: primary, color: "#fff" }}
      >
        <h5 className="fw-bold m-0">{task.title}</h5>
        <button
          className="btn-close btn-close-white"
          onClick={onClose}
        />
      </div>
      {/* BODY */}
      <div className="p-4" style={{ backgroundColor: bg, color: text }}>
        {/* Attachment Top */}
        {task.attachment && (
          <div className="mb-3 text-center">
            <img
              src={task.attachment || placeholderImage}
              alt="Attachment"
              className="img-fluid rounded shadow-sm"
              style={{
                maxHeight: 70,
                maxWidth: "120px",
                objectFit: "cover",
                border: "1px solid #e8e8e8",
                cursor: "pointer",
                background: "#fff",
                transition: "box-shadow 0.2s",
              }}
              onClick={() => setShowAttachmentPopup(true)}
            />
          </div>
        )}
        {/* Popup for enlarged image */}
        <Modal
          show={showAttachmentPopup}
          onHide={() => setShowAttachmentPopup(false)}
          centered
        >
          <div
            className="text-center bg-white p-2"
            style={{ position: "relative" }}
          >
            <Button
              variant="secondary"
              size="sm"
              style={{
                position: "absolute",
                top: 10,
                right: 16,
                zIndex: 99,
                fontSize: 18,
                borderRadius: "32px",
                padding: "2px 12px",
                background: "#6c757d",
                border: "none",
              }}
              onClick={() => setShowAttachmentPopup(false)}
            >
              ✖
            </Button>
            <img
              src={task.attachment}
              alt="Attachment Preview"
              style={{
                maxWidth: "96vw",
                maxHeight: "74vh",
                borderRadius: 8,
                boxShadow: "0 0 14px rgba(0,0,0,0.12)",
              }}
            />
          </div>
        </Modal>
        {/* Standard Task Info */}
        <div className="mb-2 fw-bold fs-6">{task.category}</div>
        {task.sub_category && (
          <div className="mb-2 text-muted small">{task.sub_category}</div>
        )}
        {/* Description (HTML) */}
        {task.description && (
          <div className="mb-2">
            <div
              dangerouslySetInnerHTML={{ __html: task.description }}
              style={{
                fontSize: "1rem",
                padding: "0.3em 0",
                background: isDark ? "#222226" : "#f5f5f7",
                borderRadius: "6px",
              }}
            />
          </div>
        )}
        {/* Instructions (HTML) */}
        <div className="mb-2">
          <b>Instructions:</b>
          <div
            dangerouslySetInnerHTML={{ __html: task.instructions || 'No instructions provided' }}
            style={{
              fontSize: "1rem",
              marginTop: 3,
              padding: "0.3em 0",
              background: isDark ? "#222226" : "#f7faff",
              borderRadius: "6px",
            }}
          />
        </div>
        <div className="mb-2">
          <span>
            <b>Reward:</b> {task.reward?.currency}{" "}
            {(
              task.reward?.amount_per_worker ??
              task.reward?.amount ??
              0
            ).toLocaleString()}
          </span>
          <span className="ms-3">
            <b>Slots:</b> {task.slots?.used ?? 0}/{task.slots?.max ?? 0}
          </span>
        </div>
        <div className="mb-2">
          <span>
            <b>Review Type:</b> {task.review_type || 'N/A'}
          </span>
          <span className="ms-3">
            <b>Approval:</b> {task.approval?.mode || 'Self'}
          </span>
        </div>
        {/* Closed-review block with safe string check */}
        {String(task.review_type).toUpperCase() === "CLOSED" &&
          typeof task.review_text === "string" &&
          task.review_text.trim() && (
            <div
              className="p-3 mb-3 rounded"
              style={{
                background: isDark ? "#2a2a2d" : "#f8f9fa",
                border: "1px solid #ddd",
              }}
            >
              <h6 className="fw-bold mb-2" style={{ color: primary }}>
                Copy Review Text Below
              </h6>
              <textarea
                className="form-control mb-2"
                readOnly
                rows={3}
                value={task.review_text}
                style={{ backgroundColor: bg, color: text }}
              />
              <Button
                className="rounded-pill text-white fw-semibold"
                style={{ backgroundColor: primary, border: "none" }}
                onClick={handleCopy}
              >
                Copy Review Text
              </Button>
            </div>
          )}
        {/* Error */}
        {error && <div className="alert alert-light small py-2">{error}</div>}
        {/* ALIGNED BUTTONS */}
        {!hasStarted && !showProofForm && (
          <div className="d-flex gap-2 justify-content-center">
            {task.task_site && (
              <a
                href={task.task_site}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm rounded-pill text-white"
                style={{ backgroundColor: primary, border: "none" }}
              >
                Go to Task Site
              </a>
            )}
            <Button
              size="sm"
              className="rounded-pill px-4"
              style={{ backgroundColor: primary, border: "none" }}
              onClick={handleStartTask}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <Spinner size="sm" /> Starting...
                </>
              ) : (
                "Start Task"
              )}
            </Button>
          </div>
        )}
        {/* PROOF FORM */}
        {showProofForm && (
          <Form onSubmit={handleSubmitProof} className="mt-4">
            <h6 className="fw-bold mb-3" style={{ color: primary }}>
              Submit Proof (Text + Image Required)
            </h6>
            <Form.Group className="mb-3">
              <Form.Label>Text Proof</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="Describe your completion (mention requirements)..."
                disabled={isSubmitting}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image Proof</Form.Label>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
                required={!previewURL}
              />
              {previewURL && (
                <div className="mt-2 text-center">
                  <img
                    src={previewURL}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: 180 }}
                  />
                </div>
              )}
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                type="submit"
                size="sm"
                className="text-white"
                style={{ backgroundColor: primary, border: "none" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" /> Submitting...
                  </>
                ) : (
                  "Submit Proof"
                )}
              </Button>
            </div>
          </Form>
        )}
        {/* PENDING / APPROVED / BLACKLISTED: SHOW SUBMITTED PROOF */}
        {!showProofForm &&
          hasStarted &&
          (isPending || isApproved || isBlacklisted) && (
            <div className="mt-4">
              <div
                className="py-3 text-center rounded"
                style={{
                  border: `1px solid ${primary}40`,
                  color: isPending
                    ? "#ffc107"
                    : isApproved
                    ? "#2ecc71"
                    : isBlacklisted
                    ? "#dc3545"
                    : "#212529",
                  background: isBlacklisted ? "#fff0f0" : undefined,
                }}
              >
                {isPending && "Awaiting review..."}
                {isApproved && "Approved! Reward incoming."}
                {isBlacklisted &&
                  "Blacklisted. This submission has been rejected and blacklisted."}
              </div>
              <div className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label>Text Proof</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={proofText}
                    readOnly
                    disabled
                    style={{
                      backgroundColor: isDark ? "#2a2a2c" : "#e9ecef",
                      opacity: 1,
                    }}
                  />
                </Form.Group>
                {proofRecord?.src && (
                  <Form.Group className="mb-3">
                    <Form.Label>Image Proof</Form.Label>
                    <div className="mt-2 text-center">
                      <img
                        src={proofRecord.src}
                        alt="Submitted Proof"
                        className="img-fluid rounded"
                        style={{ maxHeight: 180 }}
                      />
                    </div>
                  </Form.Group>
                )}
              </div>
            </div>
          )}
      </div>
    </Modal>
  );
}
