import { useState, useCallback, useMemo, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { getUnreadCount } from "../../services/services";
import logo from "../../assets/logo.png";

function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        setUnreadCount(response.data?.data?.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span 
      className="position-absolute translate-middle badge rounded-pill"
      style={{
        backgroundColor: "var(--dh-red)",
        color: "white",
        fontSize: "0.6rem",
        top: "-8px",
        left: "12px",
        minWidth: "16px",
        height: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
// Logo image – replace with your actual logo if desired
const LOGO = logo;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { userData, logout } = useAppData();
  const user = userData || {};
  const isDark = theme === "dark";

  const handleWalletClick = useCallback(() => navigate("/dashboard/wallet"), [navigate]);
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const avatar =
    user.photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const navLinks = useMemo(
    () => [
      { name: "Dashboard", path: "/dashboard", icon: "bi-house-door-fill" },
      { name: "Tasks", path: "/dashboard/tasks", icon: "bi-briefcase-fill" },
      { name: "Wallet", path: "/dashboard/wallet", icon: "bi-wallet2" },
      { name: "Notifications", path: "/dashboard/notifications", icon: "bi-bell-fill" },
      // { name: "Transactions", path: "/dashboard/transactions", icon: "bi-list-ul" },
      { name: "Referrals", path: "/dashboard/referrals", icon: "bi-people-fill" },
      { name: "Support", path: "/dashboard/support", icon: "bi-headset" },
      { name: "Settings", path: "/dashboard/settings", icon: "bi-gear-fill" },
    ],
    []
  );

  const formattedBalance =
    user.balance != null ? `₦${user.balance.toLocaleString()}` : "₦0";

  return (
    <div
      className={`sidebar d-flex flex-column p-3 ${
        collapsed ? "collapsed" : ""
      }`}
      style={{
        width: collapsed ? "80px" : "100%",
        backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
        color: isDark ? "#f8f9fa" : "#212529",
        transition: "all 0.3s ease",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div className="text-center mb-3">
        <img
          src={LOGO}
          alt="Daily Hustle Logo"
          style={{
            width: collapsed ? "38px" : "54px",
            height: collapsed ? "38px" : "54px",
            objectFit: "contain",
            borderRadius: "14px",
            margin: "0 auto",
            background: "transparent",
            transition: "width 0.3s,height 0.3s",
          }}
        />
      </div>

      {/* Collapse Toggle */}
      <button
        className="btn btn-sm mb-3"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          border: `1px solid ${isDark ? '#f8f9fa' : '#ff4500'}`,
          color: isDark ? '#f8f9fa' : '#ff4500',
          backgroundColor: 'transparent'
        }}
      >
        <i
          className={`bi ${
            collapsed ? "bi-arrow-right-square" : "bi-arrow-left-square"
          }`}
        />
      </button>

      {/* Avatar Section */}
      <div className="text-center mb-3">
        <img
          src={avatar}
          alt="User avatar"
          className="rounded-circle mb-2"
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Wallet / Balance */}
      {!collapsed && (
        <div
          className="balance-section mb-3 d-flex align-items-center justify-content-between px-2"
          style={{ cursor: "pointer" }}
        >
          <div
            className="balance-info d-flex align-items-center"
            onClick={handleWalletClick}
          >
            <i className="bi bi-wallet2 fs-5 me-2" />
            <span className="fw-bold">
              {showBalance ? formattedBalance : "₦••••••"}
            </span>
          </div>
          <i
            className={`bi ${showBalance ? "bi-eye" : "bi-eye-slash"} fs-5`}
            onClick={() => setShowBalance(!showBalance)}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="nav flex-column">
        {navLinks.map((link) => {
          const isNotifications = link.name === "Notifications";
          
          return (
            <NavLink
              to={link.path}
              className="nav-link-item"
              key={link.name}
              end={link.path === "/dashboard"}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#ff4500" : "transparent",
                color: isActive ? "#fff" : isDark ? "#f8f9fa" : "#212529",
                borderRadius: "10px",
                padding: "8px 10px",
                marginBottom: "4px",
                transition: "0.3s",
                position: "relative",
                display: "flex",
                alignItems: "center"
              })}
            >
              <div style={{ position: "relative" }}>
                <i className={`bi ${link.icon}`} />
                {isNotifications && (
                  <NotificationBadge />
                )}
              </div>
              {!collapsed && <span className="ms-2">{link.name}</span>}
            </NavLink>
          );
        })}

        {/* Logout */}
        <button 
          className="btn mt-3" 
          onClick={handleLogout}
          style={{
            border: `1px solid ${isDark ? '#f8f9fa' : '#ff4500'}`,
            color: isDark ? '#f8f9fa' : '#ff4500',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            padding: '8px 12px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDark ? '#f8f9fa' : '#ff4500';
            e.target.style.color = isDark ? '#212529' : '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = isDark ? '#f8f9fa' : '#ff4500';
          }}
        >
          <i className="bi bi-box-arrow-left" />
          {!collapsed && <span className="ms-2">Logout</span>}
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-outline-secondary mt-2"
          onClick={toggleTheme}
        >
          <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-fill"}`} />
          {!collapsed && (
            <span className="ms-2">{isDark ? "Light" : "Dark"} Mode</span>
          )}
        </button>
      </nav>
    </div>
  );
}
