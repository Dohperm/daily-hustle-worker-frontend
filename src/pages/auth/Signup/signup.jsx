import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../../hooks/AppDataContext";
import { useTheme } from "../../../hooks/useThemeContext";
import { signInWithGoogle, signInWithFacebook } from "../../../services/auth";
import { oauthLogin } from "../../../services/services";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

const getPasswordStrength = (pw) => {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
  return Math.min(score, 5);
};
const strengthLabels = ["Too Short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#ff4500", "#ffc107", "#1ab7ea", "#198754", "#28a745"];

const API_BASE = "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1";

export default function QuickSignup() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { setUserLoggedIn } = useAppData();
  const isDark = theme === "dark";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    referral_code: "", 
    country: "Ghana",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [socialProvider, setSocialProvider] = useState('');

  const passwordStrength = getPasswordStrength(formData.password);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  useEffect(() => {
    if (step === 1 && otpRefs.current[0].current) {
      otpRefs.current[0].current.focus();
    }
  }, [step]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('referral_code');
    if (referralCode) {
      setFormData(prev => ({ ...prev, referral_code: referralCode }));
    }
  }, []);

  const handleGoogleSignup = () => {
    setSocialProvider('google');
    setShowReferralModal(true);
  };

  const handleFacebookSignup = () => {
    setSocialProvider('facebook');
    setShowReferralModal(true);
  };

  const proceedWithSocialSignup = async () => {
    setLoading(true);
    setShowReferralModal(false);
    try {
      const { token } = socialProvider === 'google' ? await signInWithGoogle() : await signInWithFacebook();
      const payload = { firebase_token: token };
      if (referralCode?.trim()) payload.referral_code = referralCode.trim();
      const res = await oauthLogin(payload);
      if (res.data?.data?.token) {
        localStorage.setItem("userToken", res.data.data.token);
        localStorage.setItem("userLoggedIn", "true");
        setUserLoggedIn(true);
        toast.success(`${socialProvider} signup successful!`);
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (error) {
      console.error(`${socialProvider} signup error:`, error);
      toast.error(`${socialProvider} signup failed`);
    } finally {
      setLoading(false);
      setReferralCode('');
      setSocialProvider('');
    }
  };

  // Registration Step
  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordStrength < 4) {
      toast.error("Please choose a stronger password.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auths/users/register`, formData);
      toast.success("Registration successful! OTP sent to your email.");
      setTimeout(() => setStep(1), 600);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Registration failed.";
      toast.error(errorMsg);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].current?.focus();
  };
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1].current?.focus();
  };

  // OTP Verification & Auto Login
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auths/users/register/validate-token`, {
        verification_code: otpCode,
        email: formData.email,
      });
      toast.success("Account verified! Welcome aboard! 🎉");
      setOtpVerified(true);

      // Auto-login after verification
      try {
        const loginRes = await axios.post(`${API_BASE}/auths/users/login`, {
          identifier: formData.username || formData.email,
          password: formData.password,
        });
        
        if (loginRes.status === 200 && loginRes.data.data?.token) {
          // Update app context
          localStorage.setItem("userToken", loginRes.data.data.token);
          localStorage.setItem("userLoggedIn", "true");
          setUserLoggedIn(true);
          
          toast.success("Login successful!");
          setTimeout(() => navigate("/dashboard"), 1200);
        }
      } catch (loginErr) {
        console.error("Auto-login error:", loginErr);
        toast.error("Account created! Please login manually.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid or expired OTP.";
      toast.error(errorMsg);
      console.error("OTP verification error:", err);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .dh-signup {
          --bg: ${isDark ? "#0a0a0a" : "#f9fafb"};
          --card: ${isDark ? "#141414" : "#fff"};
          --text: ${isDark ? "#f0f0f0" : "#111"};
          --muted: ${isDark ? "#aaa" : "#666"};
          --border: ${isDark ? "#2a2a2a" : "#e5e7eb"};
          --shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? "0.4" : "0.08"});
          --dh-red: #ff5722;
          --dh-red-hov: #e64a19;
          --dh-red-light: #ff7043;

          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-family: "Poppins", system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .dh-signup-card {
          background: var(--card);
          border-radius: 1.2rem;
          padding: 2rem;
          width: 100%;
          max-width: 430px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .dh-signup-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--dh-red), var(--dh-red-light));
        }

        .dh-step-badge {
          background: ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"};
          color: var(--muted);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .dh-title {
          font-size: 1.8rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
          color: var(--dh-red);
        }

        .dh-input {
          width: 100%;
          padding: 0.75rem 1rem;
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

        .dh-input-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .dh-eye-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .dh-eye-btn:hover {
          color: var(--dh-red);
          background: rgba(255, 87, 34, 0.1);
        }

        .dh-progress {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .dh-progress-bar {
          height: 100%;
          transition: width 0.3s ease;
        }

        .dh-strength-label {
          font-size: 0.85rem;
          font-weight: 600;
          text-align: right;
          margin-top: 0.25rem;
        }

        .dh-submit-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, var(--dh-red), var(--dh-red-light));
          color: #fff;
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
          margin-top: 1.5rem;
        }

        .dh-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--dh-red-hov), var(--dh-red));
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 87, 34, 0.3);
        }

        .dh-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .dh-login-link {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--muted);
        }

        .dh-login-btn {
          background: none;
          border: none;
          color: var(--dh-red);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .dh-login-btn:hover {
          color: var(--dh-red-hov);
          text-decoration: underline;
        }

        .dh-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .dh-otp-container {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin: 1.5rem 0;
        }

        .dh-otp-input {
          width: 48px;
          height: 54px;
          text-align: center;
          font-size: 1.6rem;
          font-weight: bold;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          background: var(--card);
          color: var(--text);
          outline: none;
          transition: all 0.2s;
        }

        .dh-otp-input:focus {
          border-color: var(--dh-red);
          box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
        }

        .dh-otp-text {
          text-align: center;
          color: var(--muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .dh-success-alert {
          background: rgba(40, 199, 111, 0.1);
          color: #28c76f;
          padding: 0.75rem;
          border-radius: 0.75rem;
          text-align: center;
          margin-top: 1rem;
          border: 1px solid rgba(40, 199, 111, 0.2);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .dh-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .dh-modal {
          background: var(--card);
          border-radius: 1rem;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
        }
        
        .dh-modal-header {
          padding: 1.5rem 1.5rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dh-modal-header h3 {
          margin: 0;
          color: var(--dh-red);
          font-weight: 700;
        }
        
        .dh-modal-close {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }
        
        .dh-modal-close:hover {
          color: var(--dh-red);
          background: rgba(255, 87, 34, 0.1);
        }
        
        .dh-modal-body {
          padding: 1.5rem;
        }
        
        .dh-modal-body p {
          margin-bottom: 1rem;
          color: var(--text);
          font-weight: 500;
        }
        
        .dh-modal-buttons {
          display: flex;
          gap: 0.75rem;
        }
        
        .dh-modal-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .dh-modal-btn-secondary {
          background: var(--border);
          color: var(--muted);
        }
        
        .dh-modal-btn-secondary:hover {
          background: var(--muted);
          color: var(--card);
        }
        
        .dh-modal-btn-primary {
          background: linear-gradient(135deg, var(--dh-red), var(--dh-red-light));
          color: white;
        }
        
        .dh-modal-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 87, 34, 0.3);
        }
        
        .dh-social-btn {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid var(--border);
          background: var(--card);
          color: var(--text);
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .dh-social-btn:hover:not(:disabled) {
          border-color: var(--dh-red);
          color: var(--dh-red);
          transform: translateY(-2px);
        }
        
        .dh-social-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <ToastContainer position="top-center" theme={isDark ? "dark" : "light"} autoClose={3000} />
      <div className="dh-signup">
        <div className="dh-signup-card">
          <div className="text-center">
            <span className="dh-step-badge">
              {step === 0 ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
            <h1 className="dh-title">
              {step === 0 ? "Create Account" : "Verify OTP"}
            </h1>
          </div>
          {step === 0 && (
            <form onSubmit={handleRegister}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <input
                  type="text"
                  className="dh-input"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                  disabled={loading}
                  style={{ marginBottom: 0 }}
                />
                <input
                  type="text"
                  className="dh-input"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                  disabled={loading}
                  style={{ marginBottom: 0 }}
                />
              </div>
              <input
                type="text"
                className="dh-input"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value.replace(/\s/g, "").toLowerCase(),
                  })
                }
                required
                minLength={3}
                disabled={loading}
              />
              <input
                type="tel"
                className="dh-input"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={loading}
              />
              <input
                type="email"
                className="dh-input"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading}
              />
              <div className="dh-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="dh-input"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={loading}
                  style={{ paddingRight: "3rem", marginBottom: 0 }}
                />
                <button
                  type="button"
                  className="dh-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
              <div>
                <div className="dh-progress">
                  <div
                    className="dh-progress-bar"
                    style={{
                      background: strengthColors[passwordStrength],
                      width: `${(passwordStrength / 5) * 100}%`,
                    }}
                  />
                </div>
                <div
                  className="dh-strength-label"
                  style={{ color: strengthColors[passwordStrength] }}
                >
                  {strengthLabels[passwordStrength]}
                </div>
              </div>
              <input
                type="text"
                className="dh-input"
                placeholder="Referral Code (Optional)"
                value={formData.referral_code}
                onChange={(e) =>
                  setFormData({ ...formData, referral_code: e.target.value })
                }
                disabled={loading}
              />
              <select
                className="dh-input"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                disabled={loading}
                style={{ marginBottom: 0 }}
              >
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="USA">USA</option>
              </select>
              <button
                type="submit"
                className="dh-submit-btn"
                disabled={loading || passwordStrength < 4}
              >
                {loading ? (
                  <>
                    <div className="dh-spinner" />
                    Processing...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
              
              <div style={{ textAlign: 'center', margin: '1.5rem 0', color: 'var(--muted)' }}>
                or sign up with
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="dh-social-btn"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <i className="bi bi-google" />
                  Google
                </button>
                <button
                  type="button"
                  className="dh-social-btn"
                  onClick={handleFacebookSignup}
                  disabled={loading}
                >
                  <i className="bi bi-facebook" />
                  Facebook
                </button>
              </div>
              <div className="dh-login-link">
                Already have an account?{" "}
                <button
                  type="button"
                  className="dh-login-btn"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
          {step === 1 && (
            <div>
              <p className="dh-otp-text">
                Enter the 6-digit code sent to:{" "}
                <strong>{formData.email}</strong>
              </p>
              <div className="dh-otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs.current[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="dh-otp-input"
                    disabled={loading}
                  />
                ))}
              </div>
              <button
                className="dh-submit-btn"
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                style={{ marginTop: 0 }}
              >
                {loading ? (
                  <>
                    <div className="dh-spinner" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
              {otpVerified && (
                <div className="dh-success-alert">
                  <i className="bi bi-check-circle" /> Account created successfully!
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Referral Code Modal */}
        {showReferralModal && (
          <div className="dh-modal-overlay">
            <div className="dh-modal">
              <div className="dh-modal-header">
                <h3>Referral Code</h3>
                <button 
                  className="dh-modal-close"
                  onClick={() => {
                    setShowReferralModal(false);
                    setReferralCode('');
                    setSocialProvider('');
                  }}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
              <div className="dh-modal-body">
                <p>Do you have a referral code?</p>
                <input
                  type="text"
                  className="dh-input"
                  placeholder="Enter referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <div className="dh-modal-buttons">
                  <button 
                    className="dh-modal-btn dh-modal-btn-secondary"
                    onClick={proceedWithSocialSignup}
                  >
                    Skip
                  </button>
                  <button 
                    className="dh-modal-btn dh-modal-btn-primary"
                    onClick={proceedWithSocialSignup}
                  >
                    Continue with {socialProvider}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
