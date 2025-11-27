import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { getNotifications } from "../../services/services";

export default function Notifications() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        const data = response.data?.data?.data || [];
        setNotifications(data.map(n => ({
          id: n._id,
          title: n.title,
          message: n.description,
          timestamp: new Date(n.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          read: true,
          icon: "bi-bell-fill"
        })));
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = 0;

  return (
    <div className="min-vh-100 p-4" style={{ backgroundColor: isDark ? "#121212" : "#f8f9fa", color: isDark ? "#f8f9fa" : "#212529" }}>
      <h2 className="fw-bold mb-4" style={{ color: "var(--dh-red)" }}>Notifications</h2>
      
      <div className="card border-0" style={{ backgroundColor: isDark ? "#1c1c1e" : "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div className="card-header border-0 py-3" style={{ backgroundColor: isDark ? "#1c1c1e" : "#fff", borderBottom: `1px solid ${isDark ? "#333" : "#dee2e6"}` }}>
          <div className="d-flex align-items-center">
            <h6 className="mb-0 fw-semibold">All Notifications</h6>
            {unreadCount > 0 && (
              <span className="badge rounded-pill ms-2" style={{ backgroundColor: "var(--dh-red)", fontSize: "0.75rem" }}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: "var(--dh-red)" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash fs-1 mb-3" style={{ color: isDark ? "#6c757d" : "#adb5bd" }}></i>
              <h5 className="mb-2">No notifications yet</h5>
              <p style={{ color: isDark ? "#6c757d" : "#adb5bd" }}>You'll see notifications here when you have new activity.</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div 
                key={notification.id}
                className="d-flex align-items-start p-3"
                style={{ 
                  borderBottom: index < notifications.length - 1 ? `1px solid ${isDark ? "#333" : "#dee2e6"}` : 'none',
                  backgroundColor: !notification.read ? (isDark ? "rgba(220, 53, 69, 0.1)" : "rgba(220, 53, 69, 0.05)") : "transparent",
                  cursor: "pointer"
                }}
              >
                <div className="me-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", backgroundColor: isDark ? "#333" : "#f8f9fa" }}
                  >
                    <i className={`${notification.icon}`} style={{ fontSize: "1.1rem", color: isDark ? "#adb5bd" : "#6c757d" }}></i>
                  </div>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="mb-0 fw-semibold" style={{ fontSize: "0.95rem" }}>
                      {notification.title}
                    </h6>
                    {!notification.read && (
                      <div 
                        className="rounded-circle"
                        style={{ width: "8px", height: "8px", backgroundColor: "var(--dh-red)", marginTop: "4px" }}
                      ></div>
                    )}
                  </div>
                  <p className="mb-1 small" style={{ color: isDark ? "#adb5bd" : "#6c757d", lineHeight: "1.4" }}>
                    {notification.message}
                  </p>
                  <small style={{ color: isDark ? "#6c757d" : "#adb5bd", fontSize: "0.8rem" }}>
                    {notification.timestamp}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}