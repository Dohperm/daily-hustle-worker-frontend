/* src/components/Header.jsx */
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import logo from "../../../public/assets/logo.png";
const NAV = [
  { name: "Dashboard", path: "/dashboard", icon: "bi-house-door-fill" },
  { name: "Tasks", path: "/tasks", icon: "bi-briefcase-fill" },
  { name: "Wallet", path: "/wallet", icon: "bi-wallet2" },
  { name: "Notifications", path: "/notifications", icon: "bi-bell-fill" },
  { name: "Transactions", path: "/transactions", icon: "bi-list-ul" },
  { name: "Referrals", path: "/referrals", icon: "bi-people-fill" },
  { name: "Support", path: "/support", icon: "bi-headset" },
  { name: "Settings", path: "/settings", icon: "bi-gear" },
  { name: "Login", path: "/login", icon: "bi-box-arrow-in-right" },
  { name: "Signup", path: "/signup", icon: "bi-box-arrow-in-right" },
];

// Provide a logo image; you can replace the src below with your actual logo url

// Logo image – replace with your actual logo if desired
const LOGO = logo; // EXAMPLE Daily Hustle logo

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userData } = useAppData();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const isDark = theme === "dark";
  const avatar =
    userData.photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
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
            {/* LOGO IMAGE */}
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
          {/* Controls */}
          <div className="d-flex align-items-center gap-2">
            <button
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              className="btn btn-sm rounded-circle"
              onClick={handleToggleTheme}
              style={{
                width: 40,
                height: 40,
                border: `1px solid ${isDark ? "#fff" : "var(--dh-red)"}`,
                color: isDark ? "#fff" : "var(--dh-red)",
                background: "none",
              }}
            >
              <i
                className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-fill"} fs-5`}
              />
            </button>
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="btn btn-sm rounded-circle"
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                width: 40,
                height: 40,
                border: `1px solid ${isDark ? "#fff" : "var(--dh-red)"}`,
                color: isDark ? "#fff" : "var(--dh-red)",
                background: "none",
              }}
            >
              <i className={`bi ${menuOpen ? "bi-x" : "bi-grid-fill"} fs-5`} />
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
              minWidth: 260,
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
              onClick={() => handleNavigate("/wallet")}
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
              {NAV.map((item) => (
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
                  }}
                >
                  <i className={`bi ${item.icon} fs-5`} />
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
