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

        .dh-plans {
          margin: 4rem 0;
        }

        .dh-plans-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text);
        }

        .dh-plans-subtitle {
          text-align: center;
          color: var(--dh-red);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 3rem;
        }

        .dh-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .dh-plan-card {
          background: var(--card);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          position: relative;
          transition: transform 0.2s;
        }

        .dh-plan-card:hover {
          transform: translateY(-4px);
        }

        .dh-plan-badge {
          position: absolute;
          top: -10px;
          left: 20px;
          padding: 0.3rem 0.8rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
        }

        .dh-plan-badge.free {
          background: #6c757d;
        }

        .dh-plan-badge.pro {
          background: #ffa726;
        }

        .dh-plan-badge.vip {
          background: #9c27b0;
        }

        .dh-plan-badge.enterprise {
          background: #2196f3;
        }

        .dh-plan-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          color: var(--text);
        }

        .dh-plan-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dh-red);
          margin-bottom: 1.5rem;
        }

        .dh-plan-features {
          list-style: none;
          padding: 0;
        }

        .dh-plan-features li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
          color: var(--text);
        }

        .dh-plan-features i {
          color: #4caf50;
          font-size: 0.9rem;
        }

        .dh-coming-soon {
          text-align: center;
          background: linear-gradient(135deg, var(--dh-red), var(--dh-red-light));
          color: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          font-weight: 600;
          margin-top: 2rem;
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
            <h1 className="dh-tagline">For Workers: Earn Money Completing Simple Tasks</h1>
            <p className="dh-description">
              Join thousands of workers earning real money by completing reviews, surveys, and micro-tasks. 
              Perfect for freelancers, students, and anyone looking for flexible income opportunities.
            </p>
          </div>

          <div className="dh-features">
            <div className="dh-feature">
              <i className="bi bi-cash-coin dh-feature-icon" />
              <h3 className="dh-feature-title">Worker-Friendly Payments</h3>
              <p className="dh-feature-text">
                Get paid immediately after task completion. Fair rates for workers with transparent payment system.
              </p>
            </div>
            
            <div className="dh-feature">
              <i className="bi bi-star-fill dh-feature-icon" />
              <h3 className="dh-feature-title">Flexible Work</h3>
              <p className="dh-feature-text">
                Work on your schedule. Choose from reviews, surveys, and micro-tasks that fit your availability.
              </p>
            </div>
            
            <div className="dh-feature">
              <i className="bi bi-people-fill dh-feature-icon" />
              <h3 className="dh-feature-title">Build Your Network</h3>
              <p className="dh-feature-text">
                Earn extra by referring other workers. Build your network and increase your earning potential.
              </p>
            </div>
          </div>

          <div className="dh-plans">
            <h2 className="dh-plans-title">Choose Your Plan</h2>
            <p className="dh-plans-subtitle">📱 Worker Plans</p>
            
            <div className="dh-plans-grid">
              <div className="dh-plan-card">
                <div className="dh-plan-badge free">FREE</div>
                <h3 className="dh-plan-title">Casual Earner</h3>
                <div className="dh-plan-price">₦0/annum</div>
                <ul className="dh-plan-features">
                  <li><i className="bi bi-check"></i> Low-paying jobs only</li>
                  <li><i className="bi bi-check"></i> 10 tasks/day limit</li>
                  <li><i className="bi bi-check"></i> Standard approval queue</li>
                  <li><i className="bi bi-check"></i> 2 HP per task</li>
                </ul>
              </div>

              <div className="dh-plan-card">
                <div className="dh-plan-badge pro">PRO</div>
                <h3 className="dh-plan-title">⚡ PRO Consistent Earner</h3>
                <div className="dh-plan-price">₦5,000/annum</div>
                <ul className="dh-plan-features">
                  <li><i className="bi bi-check"></i> Medium + Low-paying jobs</li>
                  <li><i className="bi bi-check"></i> 25 tasks/day limit</li>
                  <li><i className="bi bi-check"></i> Faster approval queue</li>
                  <li><i className="bi bi-check"></i> 3 HP per task (1.5x boost)</li>
                  <li><i className="bi bi-check"></i> HP for withdrawal fee reduction</li>
                </ul>
              </div>

              <div className="dh-plan-card">
                <div className="dh-plan-badge vip">VIP</div>
                <h3 className="dh-plan-title">⭐ VIP Full-Time Hustler</h3>
                <div className="dh-plan-price">₦10,000/annum</div>
                <ul className="dh-plan-features">
                  <li><i className="bi bi-check"></i> ALL job types access</li>
                  <li><i className="bi bi-check"></i> Unlimited tasks/day</li>
                  <li><i className="bi bi-check"></i> VIP approval (fastest)</li>
                  <li><i className="bi bi-check"></i> 4 HP per task (2x boost)</li>
                  <li><i className="bi bi-check"></i> Free withdrawals (₦0 fee)</li>
                  <li><i className="bi bi-check"></i> Instant HP to cash conversion</li>
                </ul>
              </div>
            </div>

            <div className="dh-coming-soon">
              Coming Soon: All subscription plans will be available in the next 30 days. Sign up now to get notified!
            </div>
          </div>

          <div className="dh-cta">
            <h2 className="dh-cta-title">Ready to Start Working?</h2>
            <p className="dh-cta-text">
              Join our worker community and start earning money on your own terms today.
            </p>
            <div className="dh-buttons">
              <button 
                className="dh-btn dh-btn-primary"
                onClick={() => navigate('/signup')}
              >
                <i className="bi bi-person-plus" />
Join as Worker
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