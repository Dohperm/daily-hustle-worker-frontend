import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../../hooks/AppDataContext";
import { useTheme } from "../../../hooks/useThemeContext";
import { updateUser, verifyUsername, completeOnboarding } from "../../../services/services";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

const jobCategories = [
  { id: "content-creation", label: "Content Creation", icon: "bi-camera-video" },
  { id: "social-media", label: "Social Media Marketing", icon: "bi-share" },
  { id: "data-entry", label: "Data Entry", icon: "bi-keyboard" },
  { id: "customer-service", label: "Customer Service", icon: "bi-headset" },
  { id: "graphic-design", label: "Graphic Design", icon: "bi-palette" },
  { id: "writing", label: "Writing & Translation", icon: "bi-pen" },
  { id: "web-development", label: "Web Development", icon: "bi-code-slash" },
  { id: "virtual-assistant", label: "Virtual Assistant", icon: "bi-person-workspace" },
  { id: "market-research", label: "Market Research", icon: "bi-graph-up" },
  { id: "testing", label: "App/Website Testing", icon: "bi-bug" },
  { id: "tutoring", label: "Online Tutoring", icon: "bi-book" },
  { id: "transcription", label: "Transcription", icon: "bi-mic" }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { setUserLoggedIn, userLoggedIn, logout } = useAppData();


  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    country: "Ghana",
    referral_code: "",
    job_categories: []
  });
  const [usernameStatus, setUsernameStatus] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus('');
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await verifyUsername(username);
      setUsernameStatus(res.data?.data?.isAvailable ? 'available' : 'taken');
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameStatus('error');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleJobCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      job_categories: prev.job_categories.includes(categoryId)
        ? prev.job_categories.filter(id => id !== categoryId)
        : [...prev.job_categories, categoryId]
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.username || !formData.phone) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (usernameStatus !== 'available') {
        toast.error("Please choose an available username");
        return;
      }
      setStep(2);
    }
  };



  const handleComplete = async () => {
    if (formData.job_categories.length === 0) {
      toast.error("Please select at least one job category");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        phone: formData.phone.startsWith("+234") ? "0" + formData.phone.slice(4) : formData.phone,
        country: formData.country,
        preferred_job_categories: formData.job_categories
      };
      
      if (formData.referral_code?.trim()) {
        payload.referral_code = formData.referral_code.trim();
      }

      await completeOnboarding(payload);
      toast.success("Profile completed successfully! Welcome aboard! 🎉");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      console.error("Profile completion error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to complete profile. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .dh-onboarding {
          --bg: ${isDark ? "#0a0a0a" : "#f9fafb"};
          --card: ${isDark ? "#141414" : "#fff"};
          --text: ${isDark ? "#f0f0f0" : "#111"};
          --muted: ${isDark ? "#aaa" : "#666"};
          --border: ${isDark ? "#2a2a2a" : "#e5e7eb"};
          --shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? "0.4" : "0.08"});
          --dh-red: #ff5722;
          --dh-red-hov: #e64a19;
          --dh-red-light: #ff7043;
          --success: #28a745;
          --warning: #ffc107;

          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-family: "Poppins", system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .dh-onboarding-card {
          background: var(--card);
          border-radius: 1.2rem;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          min-height: 500px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .dh-onboarding-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--dh-red), var(--dh-red-light));
        }

        .dh-progress-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .dh-step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin: 0 0.5rem;
          transition: all 0.3s;
        }

        .dh-step.active {
          background: linear-gradient(135deg, var(--dh-red), var(--dh-red-light));
          color: white;
        }

        .dh-step.inactive {
          background: var(--border);
          color: var(--muted);
        }

        .dh-step.completed {
          background: var(--success);
          color: white;
        }

        .dh-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.5rem;
          color: var(--dh-red);
        }

        .dh-subtitle {
          text-align: center;
          color: var(--muted);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .dh-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .dh-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          background: var(--card);
          color: var(--text);
          font-size: 1rem;
          transition: all 0.2s;
          outline: none;
          margin-bottom: 1rem;
          font-family: "Poppins", system-ui, sans-serif;
        }

        .dh-input:focus {
          border-color: var(--dh-red);
          box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
        }

        .dh-input::placeholder {
          color: var(--muted);
        }

        .dh-username-wrapper {
          position: relative;
          grid-column: 1 / -1;
        }

        .dh-username-status {
          font-size: 0.85rem;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
        }

        .dh-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .dh-category-card {
          padding: 1rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--card);
        }

        .dh-category-card:hover {
          border-color: var(--dh-red);
          transform: translateY(-2px);
        }

        .dh-category-card.selected {
          border-color: var(--dh-red);
          background: rgba(255, 87, 34, 0.1);
          color: var(--dh-red);
        }

        .dh-category-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 87, 34, 0.1);
          color: var(--dh-red);
        }

        .dh-category-card.selected .dh-category-icon {
          background: var(--dh-red);
          color: white;
        }

        .dh-category-label {
          font-weight: 600;
          flex: 1;
        }

        .dh-button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .dh-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .dh-btn-full {
          width: 100%;
        }

        .dh-required-notice {
          background: rgba(255, 87, 34, 0.1);
          border: 1px solid rgba(255, 87, 34, 0.2);
          color: var(--dh-red);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .dh-required-notice i {
          font-size: 1.1rem;
        }

        .dh-btn-primary {
          background: linear-gradient(135deg, var(--dh-red), var(--dh-red-light));
          color: white;
        }

        .dh-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--dh-red-hov), var(--dh-red));
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 87, 34, 0.3);
        }

        .dh-btn-secondary {
          background: var(--border);
          color: var(--muted);
          border: 2px solid var(--border);
        }

        .dh-btn-secondary:hover:not(:disabled) {
          background: var(--muted);
          color: var(--card);
        }

        .dh-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .dh-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dh-selected-count {
          text-align: center;
          color: var(--muted);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .dh-logout-btn {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: var(--card);
          border: 2px solid var(--border);
          color: var(--text);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          z-index: 10;
        }

        .dh-logout-btn:hover {
          border-color: #dc3545;
          color: #dc3545;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .dh-form-grid {
            grid-template-columns: 1fr;
          }
          
          .dh-categories-grid {
            grid-template-columns: 1fr;
          }
          
          .dh-button-group {
            flex-direction: column;
          }
          
          .dh-logout-btn {
            top: 1rem;
            right: 1rem;
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      `}</style>


      <div className="dh-onboarding">
        <button 
          className="dh-logout-btn"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right" />
          Logout
        </button>
        
        <div className="dh-onboarding-card">
          <div className="dh-progress-indicator">
            <div className={`dh-step ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
            <div className={`dh-step ${step >= 2 ? 'active' : step === 1 ? 'inactive' : 'completed'}`}>2</div>
          </div>

          {step === 1 && (
            <>
              <h1 className="dh-title">Complete Your Profile</h1>
              <p className="dh-subtitle">Let's get to know you better</p>
              <div className="dh-required-notice">
                <i className="bi bi-info-circle" />
                <span>Profile completion is required to access your dashboard</span>
              </div>

              <div className="dh-form-grid">
                <input
                  type="text"
                  className="dh-input"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={loading}
                />
                <input
                  type="text"
                  className="dh-input"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={loading}
                />
                <div className="dh-username-wrapper">
                  <input
                    type="text"
                    className="dh-input"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").toLowerCase();
                      setFormData({ ...formData, username: value });
                      checkUsernameAvailability(value);
                    }}
                    disabled={loading}
                    style={{ marginBottom: '0.25rem' }}
                  />
                  <div className="dh-username-status">
                    {checkingUsername && <span style={{ color: 'var(--muted)' }}>Checking availability...</span>}
                    {usernameStatus === 'available' && <span style={{ color: 'var(--success)' }}>✓ Username available</span>}
                    {usernameStatus === 'taken' && <span style={{ color: '#dc3545' }}>✗ Username taken</span>}
                    {usernameStatus === 'error' && <span style={{ color: 'var(--warning)' }}>Error checking username</span>}
                  </div>
                </div>
                <input
                  type="tel"
                  className="dh-input"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
                <select
                  className="dh-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={loading}
                >
                  <option value="Ghana">Ghana</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="USA">USA</option>
                </select>
              </div>

              <input
                type="text"
                className="dh-input"
                placeholder="Referral Code (Optional)"
                value={formData.referral_code}
                onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                disabled={loading}
              />

              <div className="dh-button-group">
                <button
                  className="dh-btn dh-btn-primary dh-btn-full"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next Step
                  <i className="bi bi-arrow-right" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="dh-title">Choose Your Interests</h1>
              <p className="dh-subtitle">Select job categories you're interested in</p>

              <div className="dh-selected-count">
                {formData.job_categories.length} of {jobCategories.length} categories selected
              </div>

              <div className="dh-categories-grid">
                {jobCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`dh-category-card ${formData.job_categories.includes(category.id) ? 'selected' : ''}`}
                    onClick={() => handleJobCategoryToggle(category.id)}
                  >
                    <div className="dh-category-icon">
                      <i className={category.icon} />
                    </div>
                    <div className="dh-category-label">{category.label}</div>
                    {formData.job_categories.includes(category.id) && (
                      <i className="bi bi-check-circle-fill" style={{ color: 'var(--dh-red)' }} />
                    )}
                  </div>
                ))}
              </div>

              <div className="dh-button-group">
                <button
                  className="dh-btn dh-btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left" />
                  Back
                </button>
                <button
                  className="dh-btn dh-btn-primary"
                  onClick={handleComplete}
                  disabled={loading || formData.job_categories.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="dh-spinner" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <i className="bi bi-check-circle" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}