import React, { useState, useEffect } from "react";
import Sidebar from "../components/Navigation/Sidebar";
import Header from "../components/Navigation/Header";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useThemeContext";
import { useAppData } from "../hooks/AppDataContext";
// import "../styles/DailyHustleLayout.css"; // ensure this imports your CSS file!

export default function DashboardLayout() {
  const { theme } = useTheme();
  const location = useLocation();
  const { refreshUserData } = useAppData();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed] = useState(false);


  const toggleSidebar = () => setCollapsed((prev) => !prev);

  // Refresh all API calls when location changes
  useEffect(() => {
    if (refreshUserData) {
      refreshUserData();
    }
    // Trigger a custom event for other components to refresh
    window.dispatchEvent(new CustomEvent('refreshData'));
  }, [location.pathname, refreshUserData]);

  return (
    <div
      className={`dashboard-layout${isDark ? " dh-dark" : ""}`}
      data-bs-theme={isDark ? "dark" : "light"}
    >
      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar${collapsed ? " collapsed" : ""}`}>
        <Sidebar />
      </aside>

      {/* HEADER */}
      <header className="dashboard-header">
        <Header />
      </header>

      {/* MAIN SECTION */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
