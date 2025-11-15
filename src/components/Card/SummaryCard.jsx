import React from "react";
import { useTheme } from "../../hooks/useThemeContext";

export default function SummaryCard({
  icon,
  label,
  value,
  color = "primary",
  trend = null,
  progress = null, // New prop: number 0-100 for progress bar
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark ? "#1a1a1a" : "#fff";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";
  const trendColor =
    trend?.direction === "up"
      ? "text-success"
      : trend?.direction === "down"
      ? "text-light"
      : "";

  return (
    <div
      className="summary-card d-flex flex-column p-3 rounded shadow-sm"
      style={{
        backgroundColor: cardBg,
        transition: "all 0.3s ease",
        cursor: "default",
      }}
    >
      <div className="d-flex align-items-center mb-2">
        {/* Icon */}
        <div
          className={`icon-wrapper bg-${color} text-white d-flex align-items-center justify-content-center rounded-circle me-3`}
          style={{
            width: "50px",
            height: "50px",
            fontSize: "1.4rem",
            transition: "transform 0.3s ease",
          }}
        >
          <i className={`bi ${icon}`}></i>
        </div>

        {/* Text + Trend */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div
              className="label"
              style={{ fontSize: "0.9rem", color: labelColor }}
            >
              {label}
            </div>
            {trend && (
              <div
                className={`trend d-flex align-items-center ${trendColor}`}
                style={{ fontSize: "0.85rem" }}
              >
                <i className={`bi bi-caret-${trend.direction}-fill me-1`}></i>
                {trend.value}
              </div>
            )}
          </div>
          <div
            className="value fw-bold"
            style={{ fontSize: "1.25rem", color: textColor }}
          >
            {value}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== null && (
        <div
          className="progress mt-2"
          style={{ height: "6px", borderRadius: "4px" }}
        >
          <div
            className={`progress-bar bg-${color}`}
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}

      {/* Hover effect */}
      <style>
        {`
          .summary-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.15);
          }
          .summary-card:hover .icon-wrapper {
            transform: scale(1.1);
          }
        `}
      </style>
    </div>
  );
}
