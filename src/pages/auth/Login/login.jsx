import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { useAppData } from "../../../hooks/AppDataContext";

const API_BASE = "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "", // email or username
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const idRef = useRef();
  const { setUserLoggedIn } = useAppData();

  useEffect(() => {
    if (idRef.current) idRef.current.focus();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await axios.post(`${API_BASE}/auths/users/login`, formData);
      
      if (res.status === 200 && res.data.data?.token) {
        toast.success("Login successful!");
        localStorage.setItem("userToken", res.data.data.token);
        localStorage.setItem("userLoggedIn", "true");
        setUserLoggedIn(true);
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        const errorMsg = res.data.message || "Invalid credentials";
        setLoginError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      console.error("Login error:", err);
      setLoginError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #fff, #ffe5e5)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <ToastContainer position="top-center" theme="colored" autoClose={2400} />
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: "400px",
          borderRadius: "16px",
          borderTop: "5px solid #ff4500",
        }}
      >
        <h2 className="fw-bold text-center mb-3 text-danger">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email or Username</label>
            <input
              type="text"
              ref={idRef}
              name="identifier"
              className="form-control rounded-3 py-2"
              value={formData.identifier}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-2 position-relative">
            <label className="form-label fw-semibold">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control rounded-3 py-2 pe-5"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="btn btn-link p-0 position-absolute top-50 end-0 pe-3 translate-middle-y text-muted"
              onClick={() => setShowPassword((v) => !v)}
              style={{ fontSize: "1.3rem" }}
            >
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </button>
          </div>
          {loginError && (
            <div className="alert alert-danger small py-2 mb-2 mt-2 text-center">
              {loginError}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-danger w-100 py-2 rounded-3 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
          <p className="text-center mt-3 mb-0">
            Don’t have an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0 text-danger text-decoration-none fw-semibold"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
