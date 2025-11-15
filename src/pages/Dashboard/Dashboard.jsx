import React, { useState, useMemo, useCallback } from "react";
import { useAppData } from "../../hooks/AppDataContext";
import { useTheme } from "../../hooks/useThemeContext";
import { useNavigate } from "react-router-dom";
import EarningsOverview from "../../components/subcomponents/EarningsOverview";
import "bootstrap-icons/font/bootstrap-icons.css";

const NAV_SHORTCUTS = [
  { name: "Tasks", path: "/tasks", icon: "bi-briefcase-fill" },
  { name: "Wallet", path: "/wallet", icon: "bi-wallet2" },
  { name: "Notifications", path: "/notifications", icon: "bi-bell-fill" },
  { name: "Transactions", path: "/transactions", icon: "bi-list-ul" },
  { name: "Referrals", path: "/referrals", icon: "bi-people-fill" },
];

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

        /* Quick Nav */
        .dh-quick {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.8rem;
        }
        .dh-quick-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 1rem;
          background: var(--card);
          border: 1.5px solid var(--border);
          border-radius: 1rem;
          color: var(--text);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.25s;
        }
        .dh-quick-btn:hover {
          background: var(--dh-red);
          color: #fff;
          border-color: var(--dh-red);
          transform: translateY(-3px);
        }
        .dh-quick-btn i {
          font-size: 1.5rem;
          transition: transform 0.2s;
        }
        .dh-quick-btn:hover i {
          transform: scale(1.2);
        }

        @media (max-width: 640px) {
          .dh-stats,
          .dh-quick {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Dashboard Content */}
      <section className="dh-dash">
        {/* Welcome Header */}
        <header
          className="dh-header"
          onClick={go("/notifications")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && go("/notifications")()}
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
          <button className="dh-btn" onClick={go("/wallet")}>
            Withdraw
          </button>
        </div>

        {/* Task Stats */}
        <div className="dh-stats">
          <div className="dh-stat pending">
            <i className="bi bi-clock-history" />
            <div className="dh-stat-label">Pending</div>
            <div className="dh-stat-value">{stats.pending}</div>
          </div>
          <div className="dh-stat available">
            <i className="bi bi-check2-circle" />
            <div className="dh-stat-label">Available</div>
            <div className="dh-stat-value">{stats.available}</div>
          </div>
          <div className="dh-stat completed">
            <i className="bi bi-check2-all" />
            <div className="dh-stat-label">Completed</div>
            <div className="dh-stat-value">{stats.completed}</div>
          </div>
        </div>

        {/* Earnings Overview */}
        <EarningsOverview />

        {/* Quick Access */}
        <div className="dh-quick">
          {NAV_SHORTCUTS.map((item) => (
            <button
              key={item.name}
              className="dh-quick-btn"
              onClick={go(item.path)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
