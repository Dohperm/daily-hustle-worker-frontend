import React, { useState, useMemo, useCallback } from "react";
import { useAppData } from "../../hooks/AppDataContext";
import { useTheme } from "../../hooks/useThemeContext";
import { useNavigate } from "react-router-dom";

import "bootstrap-icons/font/bootstrap-icons.css";



export default function Dashboard() {
  const { userData, tasks = [], notifications = [] } = useAppData();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);

  const isDark = theme === "dark";

  const {
    username = "User",
    balance = 0,
    currency = "₦",
    tasks: userTasks = [],
  } = userData || {};

  // Calculate stats
  const stats = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeUserTasks = Array.isArray(userTasks) ? userTasks : [];

    return {
      pending: safeUserTasks.filter((t) => t.status === "pending").length,
      available: safeTasks.filter(
        (t) => !safeUserTasks.some((ut) => ut.id === t.id)
      ).length,
      completed: safeUserTasks.filter((t) =>
        ["verified", "completed", "approved"].includes(t.status)
      ).length,
    };
  }, [tasks, userTasks]);

  // Calculate earnings data
  const earningsData = useMemo(() => {
    const safeUserTasks = Array.isArray(userTasks) ? userTasks : [];
    return {
      totalEarned: balance,
      thisMonth: 0,
      referralBonus: 0,
      tasksCompleted: safeUserTasks.filter((t) =>
        ["verified", "completed", "approved"].includes(t.status)
      ).length,
    };
  }, [balance, userTasks]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Navigate helper
  const go = useCallback((p) => () => navigate(p), [navigate]);

  const toggleBalance = () => setShowBalance((s) => !s);

  return (
    <>
      {/* Global Styles with DH Red */}
      <style jsx>{`
        :root {
          --dh-red: #ff4500;
          --dh-red-hov: #e03e00;
          --dh-red-light: #ff6a33;
        }

        .dh-dash {
          --bg: ${isDark ? "#0a0a0a" : "#f9fafb"};
          --card: ${isDark ? "#141414" : "#fff"};
          --text: ${isDark ? "#f0f0f0" : "#111"};
          --muted: ${isDark ? "#aaa" : "#666"};
          --border: ${isDark ? "#2a2a2a" : "#e5e7eb"};
          --shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? "0.4" : "0.08"});

          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding: 1rem;
          font-family: "Inter", system-ui, sans-serif;
        }

        /* Header */
        .dh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(
            135deg,
            var(--dh-red),
            var(--dh-red-light)
          );
          color: #fff;
          padding: 0.9rem 1.2rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          cursor: pointer;
          box-shadow: var(--shadow);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .dh-header:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(255, 69, 0, 0.3);
        }
        .dh-bell {
          position: relative;
          font-size: 1.35rem;
        }
        .dh-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #fff;
          color: var(--dh-red);
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Balance Card */
        .dh-balance {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--card);
          border-radius: 1.2rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .dh-balance-label {
          font-size: 0.9rem;
          color: var(--muted);
        }
        .dh-balance-amt {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.9rem;
          font-weight: 700;
        }
        .dh-balance-hidden {
          font-family: monospace;
          letter-spacing: 2px;
          color: var(--muted);
        }
        .dh-eye {
          background: none;
          border: none;
          color: var(--dh-red);
          font-size: 1.3rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: 0.2s;
        }
        .dh-eye:hover {
          background: rgba(255, 69, 0, 0.1);
          transform: scale(1.1);
        }
        .dh-btn {
          background: var(--dh-red);
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-start;
          transition: 0.2s;
        }
        .dh-btn:hover {
          background: var(--dh-red-hov);
          transform: translateY(-2px);
        }

        /* Stats */
        .dh-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .dh-stat {
          background: var(--card);
          border-radius: 1rem;
          padding: 1rem;
          text-align: center;
          border: 1px solid var(--border);
          transition: transform 0.2s;
        }
        .dh-stat:hover {
          transform: scale(1.04);
        }
        .dh-stat i {
          font-size: 1.6rem;
          margin-bottom: 0.4rem;
          display: block;
        }
        .dh-stat.pending i {
          color: #ffa726;
        }
        .dh-stat.available i {
          color: #4caf50;
        }
        .dh-stat.completed i {
          color: var(--dh-red);
        }
        .dh-stat-label {
          font-size: 0.85rem;
          color: var(--muted);
        }
        .dh-stat-value {
          font-size: 1.4rem;
          font-weight: 700;
        }

        /* Earnings Cards */
        .dh-earnings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .dh-earning-card {
          background: var(--card);
          border-radius: 1rem;
          padding: 1.2rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          transition: transform 0.2s;
        }
        .dh-earning-card:hover {
          transform: translateY(-2px);
        }
        .dh-earning-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .dh-earning-icon {
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: #fff;
        }
        .dh-earning-icon.total {
          background: var(--dh-red);
        }
        .dh-earning-icon.month {
          background: #4caf50;
        }
        .dh-earning-icon.referral {
          background: #2196f3;
        }
        .dh-earning-icon.tasks {
          background: #9c27b0;
        }
        .dh-earning-label {
          font-size: 0.85rem;
          color: var(--muted);
          font-weight: 500;
        }
        .dh-earning-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        @media (max-width: 640px) {
          .dh-stats,
          .dh-earnings {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Dashboard Content */}
      <section className="dh-dash">
        {/* Welcome Header */}
        <header
          className="dh-header"
          onClick={go("/dashboard/notifications")}
          role="button"
          tabIndex={0}
        >
          <div className="dh-bell">
            <i className="bi bi-bell" />
            {unreadCount > 0 && <span className="dh-badge">{unreadCount}</span>}
          </div>
          <div>
            Welcome, <strong>{username}</strong> 👋
          </div>
        </header>

        {/* Balance */}
        <div className="dh-balance">
          <div>
            <div className="dh-balance-label">Wallet Balance</div>
            <div className="dh-balance-amt" aria-live="polite">
              <i className="bi bi-wallet2" />
              {showBalance ? (
                <strong>
                  {currency}
                  {balance.toLocaleString()}
                </strong>
              ) : (
                <span className="dh-balance-hidden">{currency}•••••</span>
              )}
              <button
                className="dh-eye"
                onClick={toggleBalance}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                <i
                  className={`bi ${showBalance ? "bi-eye-slash" : "bi-eye"}`}
                />
              </button>
            </div>
          </div>
          <button className="dh-btn" onClick={go("/dashboard/wallet")}>
            Withdraw
          </button>
        </div>





        {/* Tasks Overview Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <i className="bi bi-briefcase-fill" style={{ color: 'var(--dh-red)', fontSize: '1.2rem' }}></i>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Tasks Overview</h3>
        </div>

        {/* Task Cards */}
        <div className="dh-earnings" style={{ marginBottom: '2rem' }}>
          <div className="dh-earning-card">
            <div className="dh-earning-header">
              <div className="dh-earning-icon tasks">
                <i className="bi bi-check2-all" />
              </div>
              <div className="dh-earning-label">Tasks Completed</div>
            </div>
            <div className="dh-earning-value">
              {earningsData.tasksCompleted}
            </div>
          </div>

          <div className="dh-earning-card">
            <div className="dh-earning-header">
              <div className="dh-earning-icon" style={{ background: '#ffa726' }}>
                <i className="bi bi-clock-history" />
              </div>
              <div className="dh-earning-label">Tasks Pending</div>
            </div>
            <div className="dh-earning-value">
              {stats.pending}
            </div>
          </div>

          <div className="dh-earning-card">
            <div className="dh-earning-header">
              <div className="dh-earning-icon" style={{ background: '#4caf50' }}>
                <i className="bi bi-check2-circle" />
              </div>
              <div className="dh-earning-label">Tasks Available</div>
            </div>
            <div className="dh-earning-value">
              {stats.available}
            </div>
          </div>
        </div>

        {/* Earnings Overview Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <i className="bi bi-graph-up-arrow" style={{ color: 'var(--dh-red)', fontSize: '1.2rem' }}></i>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Earnings Overview</h3>
          <span style={{ background: 'var(--dh-red)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '0.8rem', marginLeft: 'auto' }}>This Month</span>
        </div>

        {/* Earnings Cards */}
        <div className="dh-earnings">
          <div className="dh-earning-card">
            <div className="dh-earning-header">
              <div className="dh-earning-icon total">
                <i className="bi bi-wallet2" />
              </div>
              <div className="dh-earning-label">Total Earned</div>
            </div>
            <div className="dh-earning-value">
              ₦{earningsData.totalEarned.toLocaleString()}
            </div>
          </div>

          <div className="dh-earning-card">
            <div className="dh-earning-header">
              <div className="dh-earning-icon month">
                <i className="bi bi-calendar3" />
              </div>
              <div className="dh-earning-label">This Month</div>
            </div>
            <div className="dh-earning-value">
              ₦{earningsData.thisMonth.toLocaleString()}
            </div>
          </div>

          <div className="dh-earning-card">
            <div className="dh-earning-header">
              <div className="dh-earning-icon referral">
                <i className="bi bi-people" />
              </div>
              <div className="dh-earning-label">Referral Bonus</div>
            </div>
            <div className="dh-earning-value">
              ₦{earningsData.referralBonus.toLocaleString()}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}