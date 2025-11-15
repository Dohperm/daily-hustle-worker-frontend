import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../../hooks/AppDataContext";
import "bootstrap/dist/css/bootstrap.min.css";
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
  const { setUserLoggedIn } = useAppData();
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

  const passwordStrength = getPasswordStrength(formData.password);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  useEffect(() => {
    if (step === 1 && otpRefs.current[0].current) {
      otpRefs.current[0].current.focus();
    }
  }, [step]);

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
      <ToastContainer position="top-center" theme="colored" autoClose={3000} />
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient py-4 px-3">
        <div
          className="bg-white rounded-4 shadow-xl p-4 p-md-5 w-100"
          style={{ maxWidth: "430px" }}
        >
          <div className="mb-4 text-center">
            <span className="badge rounded-pill bg-light fs-6 mb-1">
              {step === 0 ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
            <h3 className="fw-bold mt-2 mb-0">
              {step === 0 ? "Sign Up" : "Verify OTP"}
            </h3>
          </div>
          {/* Registration Step */}
          {step === 0 && (
            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <input
                type="text"
                className="form-control mt-3"
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
                className="form-control mt-3"
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
                className="form-control mt-3"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading}
              />
              <div className="position-relative mt-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
              <div className="mt-2">
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar"
                    style={{
                      background: strengthColors[passwordStrength],
                      width: `${(passwordStrength / 5) * 100}%`,
                    }}
                  ></div>
                </div>
                <div
                  className="small mt-1 mb-0 text-end fw-semibold"
                  style={{ color: strengthColors[passwordStrength] }}
                >
                  {strengthLabels[passwordStrength]}
                </div>
              </div>
              <input
                type="text"
                className="form-control mt-3"
                placeholder="Referral Code (Optional)"
                value={formData.referral_code}
                onChange={(e) =>
                  setFormData({ ...formData, referral_code: e.target.value })
                }
                disabled={loading}
              />
              <select
                className="form-select mt-3"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                disabled={loading}
              >
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="USA">USA</option>
              </select>
              <button
                type="submit"
                className="btn w-100 mt-4 py-2 fw-bold text-white"
                style={{
                  backgroundColor: '#ff4500',
                  border: 'none',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e03e00'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4500'}
                disabled={loading || passwordStrength < 4}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  "Register"
                )}
              </button>
              <div className="text-center mt-3">
                <span className="text-muted small">Already have an account? </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold"
                  style={{ color: '#ff4500' }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
          {/* OTP Verification Step */}
          {step === 1 && (
            <div>
              <p className="text-center text-muted small mb-3">
                Enter the 6-digit code sent to:{" "}
                <strong>{formData.email}</strong>
              </p>
              <div className="d-flex justify-content-center gap-2 mb-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs.current[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="form-control text-center fs-4 fw-bold"
                    style={{
                      width: "48px",
                      height: "54px",
                      fontSize: "1.6rem",
                      borderRadius: "12px",
                    }}
                    disabled={loading}
                  />
                ))}
              </div>
              <button
                className="btn btn-success w-100 py-2 fw-bold"
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
              {otpVerified && (
                <div className="alert alert-success mt-3 text-center">
                  <i className="bi bi-check-circle"></i> Account created
                  successfully!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
