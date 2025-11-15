import React from "react";
import { useTheme } from "../context/Theme/useThemeContext";

export default function JobRow({ job, onOpen }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const bgColor = isDark ? "#1c1c1e" : "#ffffff";
    const textColor = isDark ? "#f8f9fa" : "#212529";
    const labelColor = isDark ? "#adb5bd" : "#6c757d";

    return (
        <div
            className="job-row p-3 mb-2 rounded shadow-sm d-flex align-items-center"
            style={{
                backgroundColor: bgColor,
                color: textColor,
                cursor: "pointer",
                transition: "transform 0.25s ease",
            }}
            onClick={() => onOpen(job.id)}
            onMouseEnter={(e) =>
                (e.target.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
            <i
                className={`bi ${job.icon} me-3`}
                style={{ fontSize: "1.5rem" }}
            ></i>
            <div className="flex-grow-1">
                <h6 className="fw-bold">{job.title}</h6>
                <p className="small" style={{ color: labelColor }}>
                    {job.category} • ₦{job.payout.toLocaleString()} •{" "}
                    {job.progress[0]}/{job.progress[1]} {job.locked ? "🔒" : ""}
                </p>
            </div>
            <span
                className={`badge bg-${job.locked ? "secondary" : "success"}`}
            >
                {job.locked ? "Locked" : "Available"}
            </span>
        </div>
    );
}
