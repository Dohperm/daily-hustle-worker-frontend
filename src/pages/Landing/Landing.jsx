import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useThemeContext";
import "bootstrap-icons/font/bootstrap-icons.css";

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <style jsx>{`
        .dh-landing {
          --bg: ${isDark ? "#0a0a0a" : "#f9fafb"};
          --card: ${isDark ? "#141414" : "#fff"};
          --text: ${isDark ? "#f0f0f0" : "#111"};
          --muted: ${isDark ? "#aaa" : "#666"};
          --border: ${isDark ? "#2a2a2a" : "#e5e7eb"};
          --shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? "0.4" : "0.08"});
          --dh-red: #ff4500;
          --dh-red-hov: #e03e00;
          --dh-red-light: #ff6a33;

          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-family: "Inter", system-ui, sans-serif;
          padding: 2rem 1rem;
        }

        .dh-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dh-hero {
          text-align: center;
          margin-bottom: 4rem;
        }

        .dh-logo {
          font-size: 3rem;
          font-weight: 800;
          color: var(--dh-red);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .dh-tagline {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text);
        }

        .dh-description {
          font-size: 1.1rem;
          color: var(--muted);
          max-width: 600px;
          margin: 0 auto 3rem;
          line-height: 1.6;
        }

        .dh-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .dh-feature {
          background: var(--card);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          text-align: center;
          transition: transform 0.2s;
        }

        .dh-feature:hover {
          transform: translateY(-4px);
        }

        .dh-feature-icon {
          font-size: 2.5rem;
          color: var(--dh-red);
          margin-bottom: 1rem;
        }

        .dh-feature-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .dh-feature-text {
          color: var(--muted);
          line-height: 1.5;
        }

        .dh-cta {
          text-align: center;
          background: var(--card);
          border-radius: 1.2rem;
          padding: 3rem 2rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .dh-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--dh-red), var(--dh-red-light));
        }

        .dh-cta-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text);
        }

        .dh-cta-text {
          font-size: 1.1rem;
          color: var(--muted);
          margin-bottom: 2rem;
        }

        .dh-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .dh-btn {
          padding: 0.875rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dh-btn-primary {
          background: linear-gradient(135deg, var(--dh-red), var(--dh-red-light));
          color: #fff;
        }

        .dh-btn-primary:hover {
          background: linear-gradient(135deg, var(--dh-red-hov), var(--dh-red));
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 69, 0, 0.3);
        }

        .dh-btn-secondary {
          background: transparent;
          color: var(--text);
          border: 2px solid var(--border);
        }

        .dh-btn-secondary:hover {
          border-color: var(--dh-red);
          color: var(--dh-red);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .dh-logo {
            font-size: 2.5rem;
          }
          
          .dh-tagline {
            font-size: 1.3rem;
          }
          
          .dh-features {
            grid-template-columns: 1fr;
          }
          
          .dh-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .dh-btn {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }
      `}</style>

      <div className="dh-landing">
        <div className="dh-container">
          <div className="dh-hero">
            <div className="dh-logo">
              <i className="bi bi-briefcase-fill" />
              DailyHustle
            </div>
            <h1 className="dh-tagline">Earn Money Completing Simple Tasks</h1>
            <p className="dh-description">
              Join thousands of users earning real money by completing reviews, surveys, and micro-tasks. 
              Start your hustle today and get paid for your time.
            </p>
          </div>

          <div className="dh-features">
            <div className="dh-feature">
              <i className="bi bi-cash-coin dh-feature-icon" />
              <h3 className="dh-feature-title">Instant Earnings</h3>
              <p className="dh-feature-text">
                Get paid immediately after completing tasks. No waiting periods or complicated withdrawal processes.
              </p>
            </div>
            
            <div className="dh-feature">
              <i className="bi bi-star-fill dh-feature-icon" />
              <h3 className="dh-feature-title">Quality Tasks</h3>
              <p className="dh-feature-text">
                Complete reviews, surveys, and simple online tasks from verified businesses and platforms.
              </p>
            </div>
            
            <div className="dh-feature">
              <i className="bi bi-people-fill dh-feature-icon" />
              <h3 className="dh-feature-title">Referral Rewards</h3>
              <p className="dh-feature-text">
                Earn extra income by referring friends. Get bonuses for every successful referral you make.
              </p>
            </div>
          </div>

          <div className="dh-cta">
            <h2 className="dh-cta-title">Ready to Start Earning?</h2>
            <p className="dh-cta-text">
              Join our community and start making money with simple tasks today.
            </p>
            <div className="dh-buttons">
              <button 
                className="dh-btn dh-btn-primary"
                onClick={() => navigate('/signup')}
              >
                <i className="bi bi-person-plus" />
                Get Started
              </button>
              <button 
                className="dh-btn dh-btn-secondary"
                onClick={() => navigate('/login')}
              >
                <i className="bi bi-box-arrow-in-right" />
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;