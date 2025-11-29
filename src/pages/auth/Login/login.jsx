import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { useAppData } from "../../../hooks/AppDataContext";
import { useTheme } from "../../../hooks/useThemeContext";
import { signInWithGoogle, signInWithFacebook } from "../../../services/auth";
import { oauthLogin } from "../../../services/services";

const API_BASE = "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1";

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    identifier: "", // email or username
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const idRef = useRef();
  const { setUserLoggedIn } = useAppData();

  const isDark = theme === "dark";

  useEffect(() => {
    if (idRef.current) idRef.current.focus();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { token } = await signInWithGoogle();
      const res = await oauthLogin({ firebase_token: token });
      if (res.data?.data?.token) {
        localStorage.setItem("userToken", res.data.data.token);
        localStorage.setItem("userLoggedIn", "true");
        setUserLoggedIn(true);
        toast.success("Google login successful!");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const { token } = await signInWithFacebook();
      const res = await oauthLogin({ firebase_token: token });
      if (res.data?.data?.token) {
        localStorage.setItem("userToken", res.data.data.token);
        localStorage.setItem("userLoggedIn", "true");
        setUserLoggedIn(true);
        toast.success("Facebook login successful!");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Facebook login failed');
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <style jsx>{`
        .dh-login {
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

        .dh-login-card {
          background: var(--card);
          border-radius: 1.2rem;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .dh-login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--dh-red), var(--dh-red-light));
        }

        .dh-title {
          font-size: 1.8rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
          color: var(--dh-red);
        }

        .dh-form-group {
          margin-bottom: 1.5rem;
        }

        .dh-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text);
          font-size: 0.9rem;
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
          font-family: "Poppins", system-ui, sans-serif;
        }

        .dh-input:focus {
          border-color: var(--dh-red);
          box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
        }

        .dh-input-wrapper {
          position: relative;
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

        .dh-error {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(220, 53, 69, 0.2);
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

        .dh-signup-link {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--muted);
        }

        .dh-signup-btn {
          background: none;
          border: none;
          color: var(--dh-red);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .dh-signup-btn:hover {
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dh-home-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: var(--card);
          border: 2px solid var(--border);
          color: var(--text);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .dh-home-btn:hover {
          border-color: var(--dh-red);
          color: var(--dh-red);
          transform: translateY(-2px);
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

      <div className="dh-login">
        <ToastContainer position="top-center" theme={isDark ? "dark" : "light"} autoClose={2400} />
        
        <button 
          className="dh-home-btn"
          onClick={() => navigate('/')}
        >
          <i className="bi bi-house" />
          Back to Home
        </button>
        
        <div className="dh-login-card">
          <h1 className="dh-title">Welcome Back</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="dh-form-group">
              <label className="dh-label">Email or Username</label>
              <input
                type="text"
                ref={idRef}
                name="identifier"
                className="dh-input"
                value={formData.identifier}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="Enter your email or username"
              />
            </div>
            
            <div className="dh-form-group">
              <label className="dh-label">Password</label>
              <div className="dh-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="dh-input"
                  style={{ paddingRight: "3rem" }}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="dh-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>
            
            {loginError && (
              <div className="dh-error">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="dh-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="dh-spinner" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', margin: '1.5rem 0', color: 'var(--muted)' }}>
            or continue with
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="dh-social-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <i className="bi bi-google" />
              Google
            </button>
            <button
              type="button"
              className="dh-social-btn"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              <i className="bi bi-facebook" />
              Facebook
            </button>
          </div>
          
          <div className="dh-signup-link">
            Don't have an account?{" "}
            <button
              type="button"
              className="dh-signup-btn"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;