import React, { useEffect, useState } from "react";
import { useAppData } from "../../hooks/AppDataContext";

const FALLBACK = {
  totalEarned: 0,
  thisMonth: 0,
  referralBonus: 0,
  tasksCompleted: 0,
  currency: "₦",
};

/* --------------------------------------------------- */
const EarningsOverview = () => {
  const { userData } = useAppData();
  const [animated, setAnimated] = useState(false);

  const { balance = 0, currency = "₦", tasks: userTasks = [] } = userData || {};

  const real = {
    totalEarned: balance,
    thisMonth: Math.floor(balance * 0.7),
    referralBonus: 3200,
    tasksCompleted: (userTasks || []).filter((t) =>
      ["verified", "completed", "approved"].includes(t.status)
    ).length,
    currency,
  };

  const data = real.totalEarned > 0 ? real : FALLBACK;

  // start animation after a tiny delay (so the card is painted first)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* GLOBAL BLACK BACKGROUND */}
      <style jsx>{`
        :global(html),
        :global(body) {
          background: #000 !important;
          color: #fff;
        }

        .eo-card {
          --bg: #141414;
          --text: #f0f0f0;
          --muted: #aaa;
          --border: #2a2a2a;
          --shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

          background: var(--bg);
          border-radius: 1.2rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        .eo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .eo-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
        }
        .eo-badge {
          background: var(--dh-red, #ff4500);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 0.8rem;
        }

        .eo-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .eo-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .eo-item.highlight {
          background: linear-gradient(
            135deg,
            rgba(255, 69, 0, 0.08),
            rgba(255, 69, 0, 0.04)
          );
          padding: 0.75rem;
          border-radius: 1rem;
        }
        .eo-icon {
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #fff;
        }
        .eo-icon.total {
          background: var(--dh-red, #ff4500);
        }
        .eo-icon.month {
          background: #4caf50;
        }
        .eo-icon.refer {
          background: #2196f3;
        }
        .eo-icon.tasks {
          background: #9c27b0;
        }

        .eo-content {
          flex: 1;
        }
        .eo-label {
          font-size: 0.9rem;
          color: var(--muted);
        }
        .eo-value {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text);
        }
        .eo-footer {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--muted);
          text-align: right;
        }
      `}</style>

      <section className="eo-card">
        <header className="eo-header">
          <h3 className="eo-title">
            <i className="bi bi-graph-up-arrow"></i>
            Earnings Overview
          </h3>
          <span className="eo-badge">This Month</span>
        </header>

        <div className="eo-list">
          <EarningItem
            highlight
            icon="bi-wallet2"
            label="Total Earned"
            value={data.totalEarned}
            currency={data.currency}
            animated={animated}
            iconClass="total"
          />
          <EarningItem
            icon="bi-calendar3"
            label="This Month"
            value={data.thisMonth}
            currency={data.currency}
            animated={animated}
            iconClass="month"
          />
          <EarningItem
            icon="bi-people"
            label="Referral Bonus"
            value={data.referralBonus}
            currency={data.currency}
            animated={animated}
            iconClass="refer"
          />
          <EarningItem
            icon="bi-check2-all"
            label="Tasks Completed"
            value={data.tasksCompleted}
            currency=""
            animated={false}
            iconClass="tasks"
          />
        </div>

        <div className="eo-footer">Updated just now</div>
      </section>
    </>
  );
};

/* --------------------------------------------------- */
const EarningItem = ({
  highlight,
  icon,
  label,
  value,
  currency,
  animated,
  iconClass,
}) => (
  <div className={`eo-item${highlight ? " highlight" : ""}`}>
    <div className={`eo-icon ${iconClass}`}>
      <i className={`bi ${icon}`}></i>
    </div>
    <div className="eo-content">
      <div className="eo-label">{label}</div>
      <div className="eo-value">
        {animated ? (
          <AnimatedNumber value={value} currency={currency} />
        ) : (
          <>
            {currency}
            {value.toLocaleString()}
          </>
        )}
      </div>
    </div>
  </div>
);

/* --------------------------------------------------- */
const AnimatedNumber = ({ value, currency }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const duration = 1200; // ms
    const steps = 60;
    const inc = value / steps;
    let cur = 0;

    const timer = setInterval(() => {
      cur += inc;
      if (cur >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(cur));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <>
      {currency}
      {display.toLocaleString()}
    </>
  );
};

export default EarningsOverview;
