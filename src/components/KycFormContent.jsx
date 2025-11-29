import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useThemeContext";
import { uploadFile, updateUser } from "../services/services";
import { useAppData } from "../hooks/AppDataContext";

const KycFormContent = ({ onClose }) => {
  const { theme } = useTheme();
  const { refetchUserData } = useAppData();
  const isDark = theme === "dark";
  
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    identificationNumber: "",
    address: "",
    idCard: null,
  });
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [idCardPreview, setIdCardPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "idCard") {
      const file = files?.[0] || null;
      setFormData({ ...formData, idCard: file });
      if (file && file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setIdCardPreview(previewUrl);
      } else {
        setIdCardPreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    return () => {
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
    };
  }, [idCardPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idCard) {
      toast.error("Please upload your ID document.");
      return;
    }

    setLoading(true);
    try {
      // Upload ID document
      const uploadRes = await uploadFile(formData.idCard);
      const idSrc = uploadRes.data?.data[0]?.src;
      
      if (!idSrc) {
        throw new Error("Failed to upload document");
      }

      // Submit KYC data
      const kycPayload = {
        kyc: {
          full_name: formData.fullName,
          DOB: new Date(formData.dob).toISOString(),
          identification_number: formData.identificationNumber,
          residential_address: formData.address,
          id_src: idSrc
        }
      };

      await updateUser(kycPayload);
      toast.success("KYC submitted successfully!");
      await refetchUserData();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ color: isDark ? '#f0f0f0' : '#333' }}>
      {!agreedToTerms ? (
        <div>
          <h5 className="mb-3">Data Privacy Notice</h5>
          <p style={{ lineHeight: "1.6" }}>
            Your security and privacy are our top priority. The information you
            provide for KYC verification is handled with the highest level of care.
          </p>
          <ul>
            <li>Your documents are encrypted and stored securely.</li>
            <li>Your data will <strong>never</strong> be shared with unauthorized third parties.</li>
            <li>This information is used solely for identity verification as required by regulations.</li>
          </ul>
          <p className="fw-semibold mt-3">
            Please ensure all information and documents you provide are accurate and legitimate.
          </p>
          <div className="form-check mt-3 p-3 rounded" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa' }}>
            <input
              type="checkbox"
              className="form-check-input"
              id="termsCheck"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label className="form-check-label fw-semibold" htmlFor="termsCheck">
              I have read the notice and affirm that all details I provide will be correct.
            </label>
          </div>
          <button 
            className="btn mt-3"
            onClick={() => setAgreedToTerms(true)}
            disabled={!agreedToTerms}
            style={{
              backgroundColor: '#ff5722',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              opacity: !agreedToTerms ? 0.7 : 1
            }}
          >
            Continue
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-control"
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
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Identification Number</label>
            <input
              type="text"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your ID number"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Residential Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              rows="3"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Upload Means of Identification</label>
            <p className="form-text text-muted">(e.g., National ID Card, Driver's License, Passport)</p>
            <input
              type="file"
              name="idCard"
              accept="image/*"
              className="form-control"
              onChange={handleChange}
              required
            />
            {idCardPreview && (
              <div className="mt-2 text-center">
                <img src={idCardPreview} alt="ID Preview" className="img-fluid rounded" style={{ maxHeight: "150px" }} />
              </div>
            )}
          </div>



          <button 
            type="submit" 
            className="btn w-100" 
            disabled={loading}
            style={{
              backgroundColor: '#ff5722',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </button>
        </form>
      )}
    </div>
  );
};

export default KycFormContent;