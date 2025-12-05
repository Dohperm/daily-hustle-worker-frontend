import React from "react";
import { useTheme } from "../hooks/useThemeContext";

export default function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner {
          border: 3px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
          border-top: 3px solid #ff5722;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner.sm {
          width: 1rem;
          height: 1rem;
          border-width: 2px;
        }

        .spinner.md {
          width: 2rem;
          height: 2rem;
        }

        .spinner.lg {
          width: 3rem;
          height: 3rem;
          border-width: 4px;
        }

        .loading-text {
          color: ${isDark ? "#aaa" : "#666"};
          font-size: 0.9rem;
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="loading-container">
        <div className={`spinner ${size}`}></div>
        {text && <div className="loading-text">{text}</div>}
      </div>
    </>
  );
}