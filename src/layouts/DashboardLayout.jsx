import React, { useState } from "react";
import Sidebar from "../components/Navigation/Sidebar";
import Header from "../components/Navigation/Header";
import { Outlet } from "react-router-dom";
import { useTheme } from "../hooks/useThemeContext";
// import "../styles/DailyHustleLayout.css"; // ensure this imports your CSS file!

export default function DashboardLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div
      className={`dashboard-layout${isDark ? " dh-dark" : ""}`}
      data-bs-theme={isDark ? "dark" : "light"}
    >
      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar${collapsed ? " collapsed" : ""}`}>
        <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
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
