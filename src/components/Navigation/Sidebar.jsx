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

export default function Sidebar({ collapsed, toggleSidebar, mobileOpen, setMobileOpen }) {
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { userData, logout } = useAppData();
  const user = userData || {};
  const isDark = theme === "dark";

  const handleWalletClick = useCallback(() => {
    navigate("/dashboard/wallet");
    if (setMobileOpen) setMobileOpen(false);
  }, [navigate, setMobileOpen]);
  
  const handleLogout = useCallback(() => {
    logout();
    if (setMobileOpen) setMobileOpen(false);
  }, [logout, setMobileOpen]);

  const handleNavClick = useCallback((path) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  }, [navigate, setMobileOpen]);

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
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1055,
            display: window.innerWidth <= 991 ? 'block' : 'none'
          }}
        />
      )}
      
      <div
        className={`sidebar d-flex flex-column p-3 ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "show" : ""}`}
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



      {/* Wallet / Balance */}
      {!collapsed && (
        <div
          className="balance-section mb-4 d-flex align-items-center justify-content-between px-2"
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
            <div
              className="nav-link-item"
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              style={{
                backgroundColor: window.location.pathname === link.path ? "#ff5722" : "transparent",
                color: window.location.pathname === link.path ? "#fff" : isDark ? "#f8f9fa" : "#212529",
                borderRadius: "10px",
                padding: "8px 10px",
                marginBottom: "4px",
                transition: "0.3s",
                position: "relative",
                display: "flex",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <div style={{ position: "relative" }}>
                <i className={`bi ${link.icon}`} />
                {isNotifications && (
                  <NotificationBadge />
                )}
              </div>
              {!collapsed && <span className="ms-2">{link.name}</span>}
            </div>
          );
        })}

      </nav>

      {/* Theme Toggle Container - Admin Style */}
      {!collapsed && (
        <div className="theme-toggle-container mt-auto pt-3" style={{ borderTop: `1px solid ${isDark ? '#404040' : '#e5e7eb'}` }}>
          <div className="theme-toggle d-flex align-items-center justify-content-between p-3 mb-2" style={{ color: isDark ? '#ffffff' : '#1f2937', fontSize: '0.9rem' }}>
            <span>Theme</span>
            <div 
              className={`theme-switch ${isDark ? 'active' : ''}`} 
              onClick={toggleTheme}
              style={{
                position: 'relative',
                width: '50px',
                height: '24px',
                background: isDark ? '#ff5722' : '#e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                content: '',
                position: 'absolute',
                top: '2px',
                left: isDark ? '26px' : '2px',
                width: '20px',
                height: '20px',
                background: 'white',
                borderRadius: '50%',
                transition: 'left 0.3s'
              }}></div>
            </div>
          </div>
          
          {/* Logout - Admin Style */}
          <div 
            className="nav-link-item" 
            onClick={handleLogout}
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: isDark ? '#ffffff' : '#1f2937',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '0.75rem',
              transition: 'all 0.3s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff5722';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDark ? '#ffffff' : '#1f2937';
            }}
          >
            <i className="bi bi-box-arrow-left" style={{ fontSize: '1.1rem', width: '20px' }} />
            <span>Log Out</span>
          </div>
        </div>
      )}
      
      {/* Collapsed Theme Toggle */}
      {collapsed && (
        <div className="mt-auto pt-3">
          <div 
            className="nav-link-item text-center" 
            onClick={toggleTheme}
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: isDark ? '#ffffff' : '#1f2937',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '0.75rem',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-fill"}`} />
          </div>
          <div 
            className="nav-link-item text-center" 
            onClick={handleLogout}
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: isDark ? '#ffffff' : '#1f2937',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '0.75rem',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <i className="bi bi-box-arrow-left" />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
