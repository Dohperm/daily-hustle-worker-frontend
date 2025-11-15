import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const KYCForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    address: "",
    idCard: null,
    utilityBill: null, // Added utility bill
  });
  const [loading, setLoading] = useState(false);

  // State for the pre-form agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // State for image previews
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [utilityBillPreview, setUtilityBillPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "idCard") {
      const file = files?.[0] || null;
      setFormData({ ...formData, idCard: file });
      // Create a preview URL
      if (file && file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setIdCardPreview(previewUrl);
      } else {
        setIdCardPreview(null);
      }
    } else if (name === "utilityBill") {
      const file = files?.[0] || null;
      setFormData({ ...formData, utilityBill: file });
      // Create a preview URL
      if (file && file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setUtilityBillPreview(previewUrl);
      } else {
        setUtilityBillPreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
      if (utilityBillPreview) URL.revokeObjectURL(utilityBillPreview);
    };
  }, [idCardPreview, utilityBillPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idCard || !formData.utilityBill) {
      toast.error("Please upload both required documents.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    // Append all form data
    data.append("fullName", formData.fullName);
    data.append("dob", formData.dob);
    data.append("address", formData.address);
    data.append("idCard", formData.idCard);
    data.append("utilityBill", formData.utilityBill);

    try {
      // mock endpoint for now
      const res = await axios.post(
        "http://localhost:5000/api/kyc/submit",
        data
      );
      if (res.status === 200 || res.data.success) {
        toast.success("✅ KYC submitted successfully!");
      } else {
        toast.error(res.data.message || "Failed to submit KYC");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {!agreedToTerms ? (
        // 1. DATA PRIVACY NOTICE
        <div
          className="card shadow-lg mx-auto p-4 p-md-5"
          style={{ maxWidth: "600px", borderTop: "5px solid #ff4500" }}
        >
          <h3 className="fw-bold text-center text-light mb-3">
            Data Privacy Notice
          </h3>
          <p className="text-muted" style={{ lineHeight: "1.6" }}>
            Your security and privacy are our top priority. The information you
            provide for KYC (Know Your Customer) verification is handled with
            the highest level of care.
          </p>
          <ul className="text-muted">
            <li>Your documents are encrypted and stored securely.</li>
            <li>
              Your data will <strong>never</strong> be shared with unauthorized
              third parties or used for any illicit purposes.
            </li>
            <li>
              This information is used solely for identity verification as
              required by regulations.
            </li>
          </ul>
          <p className="fw-semibold mt-3">
            Please ensure all information and documents you provide are accurate
            and legitimate.
          </p>
          <div
            className="form-check mt-3 p-3 rounded"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <input
              type="checkbox"
              className="form-check-input"
              id="termsCheck"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ borderColor: "#ff4500" }}
            />
            <label
              className="form-check-label fw-semibold"
              htmlFor="termsCheck"
            >
              I have read the notice and affirm that all details I provide will
              be correct.
            </label>
          </div>
        </div>
      ) : (
        // 2. KYC FORM (shows after agreement)
        <div
          className="card shadow-lg mx-auto p-4 p-md-5"
          style={{ maxWidth: "600px", borderTop: "5px solid #ff4500" }}
        >
          <h3 className="fw-bold text-center text-light mb-3">
            KYC Verification
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-control rounded-3 py-2"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="form-control rounded-3 py-2"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Residential Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control rounded-3 py-2"
                rows="3"
                required
              ></textarea>
            </div>

            {/* --- NIN/BVN REMOVED --- */}

            {/* --- UPDATED FILE UPLOADS --- */}

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Upload Means of Identification
              </label>
              <p className="form-text text-muted mt-0 mb-1">
                (e.g., National ID Card, Driver's License, Passport)
              </p>
              <input
                type="file"
                name="idCard"
                accept="image/*"
                className="form-control rounded-3 py-2"
                onChange={handleChange}
                required
              />
              {idCardPreview && (
                <div className="mt-2 text-center">
                  <img
                    src={idCardPreview}
                    alt="ID Card Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "150px" }}
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Upload Utility Document
              </label>
              <p className="form-text text-muted mt-0 mb-1">
                (e.g., Utility Bill showing your address)
              </p>
              <input
                type="file"
                name="utilityBill"
                accept="image/*"
                className="form-control rounded-3 py-2"
                onChange={handleChange}
                required
              />
              {utilityBillPreview && (
                <div className="mt-2 text-center">
                  <img
                    src={utilityBillPreview}
                    alt="Utility Bill Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "150px" }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-light w-100 py-2 fw-semibold rounded-3 mt-3"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit KYC"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default KYCForm;
