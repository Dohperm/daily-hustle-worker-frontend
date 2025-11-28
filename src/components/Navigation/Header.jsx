/* src/components/Header.jsx */
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { getUnreadCount } from "../../services/services";
import logo from "../../../public/assets/logo.png";

function MobileNotificationBadge() {
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
        top: "-2px",
        left: "18px",
        minWidth: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

const NAV = [
  { name: "Dashboard", path: "/dashboard", icon: "bi-house-door-fill" },
  { name: "Tasks", path: "/dashboard/tasks", icon: "bi-briefcase-fill" },
  { name: "Wallet", path: "/dashboard/wallet", icon: "bi-wallet2" },
  { name: "Notifications", path: "/dashboard/notifications", icon: "bi-bell-fill" },
  { name: "Transactions", path: "/dashboard/transactions", icon: "bi-list-ul" },
  { name: "Referrals", path: "/dashboard/referrals", icon: "bi-people-fill" },
  { name: "Support", path: "/dashboard/support", icon: "bi-headset" },
  { name: "Settings", path: "/dashboard/settings", icon: "bi-gear" },
];

const LOGO = logo;

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userData, logout } = useAppData();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const isDark = theme === "dark";
  const avatar = userData.photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const balance = userData.balance ?? 0;

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      setMenuOpen(false);
    },
    [navigate]
  );

  return (
    <>
      {/* Desktop Header */}
      <div className="d-none d-md-flex align-items-center justify-content-end px-4 py-2 h-100">
        <img
          src={avatar}
          alt="User avatar"
          className="rounded-circle"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            cursor: "pointer",
            border: `2px solid ${isDark ? '#ffffff' : '#ff5722'}`
          }}
          onClick={() => navigate('/dashboard/settings')}
        />
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <header className="mobile-header d-flex d-md-none">
        <div className="d-flex align-items-center justify-content-between w-100 px-3 py-2">
          <span
            className="h5 mb-0 fw-bold d-flex align-items-center"
            style={{ color: "var(--dh-red)" }}
          >
            <img
              src={LOGO}
              alt="Daily Hustle Logo"
              style={{
                height: 30,
                width: 30,
                marginRight: 10,
                objectFit: "contain",
                borderRadius: "8px",
                background: "transparent",
              }}
            />
            Daily Hustle
          </span>
          <div className="d-flex align-items-center gap-2">
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="btn btn-sm"
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                width: 40,
                height: 40,
                border: "none",
                color: isDark ? "#fff" : "var(--dh-primary)",
                background: "none",
              }}
            >
              <i className={`bi ${menuOpen ? "bi-x" : "bi-list"} fs-4`} />
            </button>
          </div>
        </div>
        {/* Drawer */}
        {menuOpen && (
          <nav
            className="mobile-menu-drawer"
            style={{
              backgroundColor: isDark ? "#181a20" : "#fff",
              color: isDark ? "#fff" : "#212529",
              width: "100vw",
              height: "calc(100vh - 60px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "2rem",
            }}
          >
            {/* Avatar */}
            <div className="text-center py-4 border-bottom">
              <img
                src={avatar}
                alt="avatar"
                className="rounded-circle mb-2"
                style={{
                  width: 60,
                  height: 60,
                  border: "3px solid var(--dh-red)",
                  objectFit: "cover",
                }}
              />
              <div className="mt-2">
                <button className="btn btn-outline-light btn-sm rounded-pill px-3">
                  Change Avatar
                </button>
              </div>
            </div>
            {/* Wallet balance */}
            <div
              className="px-4 py-3 d-flex align-items-center justify-content-between border-bottom"
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
              onClick={() => handleNavigate("/dashboard/wallet")}
            >
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-wallet2 fs-5 me-2"
                  style={{ color: "var(--dh-green)" }}
                ></i>
                <span className="fw-bold">
                  {showBalance ? `₦${balance.toLocaleString()}` : "₦••••••"}
                </span>
              </div>
              <i
                className={`bi ${showBalance ? "bi-eye-slash" : "bi-eye"} fs-5`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBalance((prev) => !prev);
                }}
                style={{ color: "var(--dh-muted)", cursor: "pointer" }}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              />
            </div>
            {/* Navigation Links */}
            <div className="nav-links pt-2">
              {NAV.map((item) => {
                const isNotifications = item.name === "Notifications";
                
                return (
                  <button
                    key={item.path}
                    className="nav-link-item w-100 text-start py-2 px-4"
                    onClick={() => handleNavigate(item.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                      fontWeight: 500,
                      fontSize: "1.08rem",
                      position: "relative"
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <i className={`bi ${item.icon} fs-5`} />
                      {isNotifications && (
                        <MobileNotificationBadge />
                      )}
                    </div>
                    {item.name}
                  </button>
                );
              })}
              
              {/* Theme Toggle */}
              <div className="nav-link-item w-100 d-flex justify-content-between align-items-center py-2 px-4 mt-2" style={{ fontWeight: 500, fontSize: "1.08rem" }}>
                <span>Theme</span>
                <div 
                  onClick={handleToggleTheme}
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
              
              {/* Logout */}
              <button
                className="nav-link-item w-100 text-start py-2 px-4"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  fontWeight: 500,
                  fontSize: "1.08rem",
                }}
              >
                <i className="bi bi-box-arrow-left fs-5" />
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}