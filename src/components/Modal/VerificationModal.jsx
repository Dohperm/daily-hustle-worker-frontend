import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadFile } from '../../services/services';

const VerificationModal = ({ show, onClose, onSuccess, type = 'identity' }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    idType: 'nin',
    idNumber: '',
    idDocument: null,
    selfie: null
  });

  const handleFileUpload = async (file, field) => {
    try {
      setLoading(true);
      const response = await uploadFile(file);
      const fileUrl = response.data?.data[0]?.src;
      setFormData(prev => ({ ...prev, [field]: fileUrl }));
      toast.success(`${field === 'idDocument' ? 'ID document' : 'Selfie'} uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Verification submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shield-check me-2" style={{ color: 'var(--dh-green)' }} />
              Identity Verification
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {step === 1 && (
              <div>
                <h6>Step 1: Phone Verification</h6>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => setStep(2)}
                  disabled={!formData.phone}
                >
                  Send Verification Code
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h6>Step 2: ID Document</h6>
                <div className="mb-3">
                  <label className="form-label">ID Type</label>
                  <select 
                    className="form-select"
                    value={formData.idType}
                    onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
                  >
                    <option value="nin">National ID (NIN)</option>
                    <option value="passport">International Passport</option>
                    <option value="drivers">Driver's License</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">ID Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.idNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                    placeholder="Enter ID number"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Upload ID Document</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'idDocument')}
                  />
                </div>
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => setStep(3)}
                  disabled={!formData.idNumber || !formData.idDocument}
                >
                  Next: Take Selfie
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h6>Step 3: Selfie Verification</h6>
                <div className="text-center mb-3">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2" />
                    Take a clear selfie holding your ID document
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Upload Selfie</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'selfie')}
                  />
                </div>
                <button 
                  className="btn btn-success w-100"
                  onClick={handleSubmit}
                  disabled={!formData.selfie || loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;