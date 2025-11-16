import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { uploadFile } from "../../services/services";
import api from "../../services/api";

export default function EditProofModal({ taskProof, show, onClose }) {
  const { theme } = useTheme();
  const { showNotification, fetchMyTasks } = useAppData();
  
  const isDark = theme === "dark";
  const bg = isDark ? "#1c1c1e" : "#fff";
  const text = isDark ? "#f8f9fa" : "#212529";
  const primary = "var(--dh-red)";
  
  const [proofText, setProofText] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    if (show && taskProof) {
      setProofText(taskProof.title || "");
      setPreviewURL(taskProof.src || null);
      setProofFile(null);
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [show, taskProof]);

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
      setPreviewURL(taskProof?.src || null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) {
      setError("Text proof required");
      return;
    }
    if (!previewURL && !proofFile) {
      setError("Image proof required");
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

      await api.patch(`/task-proof/users/${taskProof._id}`, {
        title: proofText.trim(),
        src: src
      });

      await fetchMyTasks();
      showNotification("Proof updated successfully!", "success");
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Update failed";
      setError(msg);
      showNotification("Failed: " + msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <div
        className="py-3 px-4 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: primary, color: "#fff" }}
      >
        <h5 className="fw-bold m-0">Edit Proof</h5>
        <button className="btn-close btn-close-white" onClick={onClose} />
      </div>
      
      <div className="p-4" style={{ backgroundColor: bg, color: text }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Text Proof</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="Describe your completion..."
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

          {error && <div className="alert alert-danger small py-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white"
              style={{ backgroundColor: primary, border: "none" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" /> Updating...
                </>
              ) : (
                "Update Proof"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}