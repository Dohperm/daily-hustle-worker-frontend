import React, { useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    email: "",
    otp: "",
    new_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const otpRef = useRef(null);

  const handleChange = (e) =>
    setFormFields((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1/auths/users/send-otp",
        {
          identifier: formFields.email,
          otp_type: "RESET_PASSWORD",
        }
      );
      toast.success("OTP sent to your email address!");
      setTimeout(() => setStep(2), 600);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "There was a problem sending the OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1/auths/users/reset-password",
        {
          email: formFields.email,
          otp: formFields.otp,
          new_password: formFields.new_password,
        }
      );
      toast.success("Password reset successful! You can now login.");
      setTimeout(() => (window.location.href = "/login"), 1400);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not reset password, please try again."
      );
      setFormFields((f) => ({ ...f, otp: "", new_password: "" }));
      setTimeout(() => otpRef.current?.focus(), 200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <ToastContainer position="top-center" theme="colored" autoClose={2200} />
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: "400px",
          borderRadius: "16px",
          borderTop: "5px solid #ff4500",
        }}
      >
        <h2 className="fw-bold text-center mb-3 text-light">Forgot Password</h2>
        <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword}>
          {/* Step 1: Enter email */}
          {step === 1 && (
            <>
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                className="form-control mb-3"
                placeholder="Enter your email"
                value={formFields.email}
                onChange={handleChange}
                required
                autoFocus
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-light w-100 fw-bold"
                disabled={loading || !formFields.email}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          )}

          {/* Step 2: Enter OTP and new password */}
          {step === 2 && (
            <>
              <label className="form-label mt-2">OTP Code</label>
              <input
                name="otp"
                type="text"
                maxLength={6}
                ref={otpRef}
                className="form-control mb-2"
                placeholder="Enter 6-digit OTP"
                value={formFields.otp}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label className="form-label">New Password</label>
              <div className="position-relative mb-3">
                <input
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter new password"
                  value={formFields.new_password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-light w-100 fw-bold mt-1"
                disabled={
                  loading || !formFields.otp || !formFields.new_password
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </>
          )}
        </form>
        <p className="text-center mt-3 mb-0">
          <a href="/login" className="text-light fw-semibold">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
