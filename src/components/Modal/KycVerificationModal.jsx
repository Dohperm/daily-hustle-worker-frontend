import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useThemeContext";
import { useUserData } from "../../hooks/useUserDataContext";
import "react-toastify/dist/ReactToastify.css";

export default function KycVerificationModal({ show, onHide }) {
  const { theme } = useTheme();
  const { userData, submitKYC, verifyKYC } = useUserData();
  const [kycType, setKycType] = useState("NIN");
  const [idNumber, setIdNumber] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";
  const buttonBg = "#28a745";
  const buttonText = "#ffffff";
  const primary = "#e63946";

  // Check if KYC is already verified
  const isKycVerified = userData?.kyc?.status === "verified";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isKycVerified) {
      toast.info("Your KYC is already verified.", {
        position: "top-center",
        className: "bg-light text-dark border border-info rounded-3",
      });
      return;
    }
    if (!kycType || !idNumber.trim() || !documentUrl.trim()) {
      toast.warning("Please fill all fields before submitting.", {
        position: "top-center",
        className: "bg-light text-dark border border-warning rounded-3",
      });
      return;
    }

    const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
    if (!urlPattern.test(documentUrl)) {
      toast.error("Please provide a valid URL for the document.", {
        position: "top-center",
        className: "bg-light text-dark border border-light rounded-3",
      });
      return;
    }

    setLoading(true);
    const kycData = { type: kycType, idNumber, documentUrl };

    try {
      await submitKYC(kycData);
      setTimeout(() => {
        verifyKYC("verified");
        setLoading(false);
        setKycType("NIN");
        setIdNumber("");
        setDocumentUrl("");
        onHide();
      }, 2000);
    } catch (error) {
      toast.error("Failed to submit KYC. Please try again.", {
        position: "top-center",
        className: "bg-light text-dark border border-light rounded-3",
      });
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop
      centered
      contentClassName="border-0 shadow-lg rounded-3 overflow-hidden"
      aria-labelledby="kycModalLabel"
    >
      <div
        className="py-3 px-4 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: primary, color: "#ffffff" }}
      >
        <h5 className="fw-bold mb-0" id="kycModalLabel">
          KYC Verification
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onHide}
          aria-label="Close"
        ></button>
      </div>
      <div
        className="p-4"
        style={{ backgroundColor: cardBg, color: textColor }}
      >
        {isKycVerified ? (
          <div className="text-center">
            <h6 className="fw-bold mb-3" style={{ color: buttonBg }}>
              KYC Already Verified
            </h6>
            <p style={{ color: labelColor }}>
              Your KYC has been successfully verified. No further action is
              required.
            </p>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className="w-100 rounded-pill"
              style={{ borderColor: labelColor, color: labelColor }}
              aria-label="Close modal"
            >
              Close
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: labelColor }}>KYC Type</Form.Label>
              <Form.Select
                id="kycType"
                value={kycType}
                onChange={(e) => setKycType(e.target.value)}
                style={{
                  backgroundColor: isDark ? "#2c2c2e" : "#fff",
                  color: textColor,
                  borderColor: isDark ? "#495057" : "#ced4da",
                }}
                aria-label="Select KYC type"
                disabled={loading}
              >
                <option value="NIN">NIN</option>
                <option value="BVN">BVN</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driver’s License">Driver’s License</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: labelColor }}>ID Number</Form.Label>
              <Form.Control
                type="text"
                id="idNumber"
                placeholder="Enter your ID number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                style={{
                  backgroundColor: isDark ? "#2c2c2e" : "#fff",
                  color: textColor,
                  borderColor: isDark ? "#495057" : "#ced4da",
                }}
                aria-label="ID number"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: labelColor }}>
                Document URL (proof)
              </Form.Label>
              <Form.Control
                type="text"
                id="documentUrl"
                placeholder="https://example.com/document.jpg"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                style={{
                  backgroundColor: isDark ? "#2c2c2e" : "#fff",
                  color: textColor,
                  borderColor: isDark ? "#495057" : "#ced4da",
                }}
                aria-label="Document URL"
                required
                disabled={loading}
              />
              <Form.Text style={{ color: labelColor }}>
                Provide a valid URL to your document (e.g., hosted image).
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 fw-bold rounded-pill"
              disabled={loading}
              style={{
                backgroundColor: buttonBg,
                color: buttonText,
                borderColor: buttonBg,
              }}
              aria-label={loading ? "Submitting KYC" : "Submit KYC"}
            >
              {loading ? "Submitting..." : "Submit KYC"}
            </Button>
          </Form>
        )}
      </div>
    </Modal>
  );
}
