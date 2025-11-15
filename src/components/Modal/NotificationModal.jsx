import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationModal from "../../components/Modal/NotificationModal";
import { useUserData } from "../../hooks/useUserDataContext";
import { useTheme } from "../../hooks/useThemeContext";

// ============================================================================
// 📬 Notifications Component
// Displays a list of user notifications with pagination, sorting, and toast display.
// Allows marking notifications as read, deleting, and viewing details in a modal.
// Integrates with UserDataContext for notifications and wallet updates.
// ============================================================================
export default function Notifications() {
  const navigate = useNavigate();
  const { userData, markNotificationAsRead, deleteNotification, showNotification } = useUserData();
  const { theme } = useTheme();
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  // Theme colors for awodaily
  const isDark = theme === "dark";
  const primary = "#198754";
  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const containerBg = isDark ? "#121212" : "#f8f9fa";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";

  // Get notifications from userData
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifications = userData?.notifications || [];

  // Display unread notifications as toasts on page load
  useEffect(() => {
    notifications.forEach((notif) => {
      if (!notif.isRead) {
        showNotification(notif);
      }
    });
  }, [notifications, showNotification]);

  // Handle empty notifications
  if (!notifications.length) {
    return (
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: containerBg,
          color: textColor,
          minHeight: "100vh",
        }}
      >
        <i
          className="bi bi-bell-slash fs-1 mb-3"
          style={{ color: labelColor }}
        ></i>
        <h1 className="fw-bold mb-3" style={{ color: primary }}>
          No Notifications
        </h1>
        <p className="text-muted mb-4">
          You haven't received any notifications yet.
        </p>
        <button
          className="btn btn-success fw-semibold rounded-pill"
          style={{ backgroundColor: primary, borderColor: primary }}
          onClick={() => navigate("/tasks")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Start Earning Tasks
        </button>
      </div>
    );
  }

  // Sort notifications: Unread first, then by createdAt DESC
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1; // Unread first
    return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
  });

  // Pagination logic
  const indexOfLast = currentPage * notificationsPerPage;
  const indexOfFirst = indexOfLast - notificationsPerPage;
  const currentNotifications = sortedNotifications.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedNotifications.length / notificationsPerPage);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle pagination navigation
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      document
        .querySelector(".notifications-list")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      document
        .querySelector(".notifications-list")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle clicking a notification
  const handleNotificationClick = (notification) => {
    if (!notification.isRead && markNotificationAsRead) {
      markNotificationAsRead(notification.id);
    }
    setSelectedNotificationId(notification.id);
    if (notification.category === "task" && notification.taskId) {
      navigate("/tasks?tab=my");
    } else if (notification.category === "funding" && notification.taskId) {
      navigate("/tasks?tab=my");
    }
  };

  // Handle deleting a single notification
  const handleDeleteNotification = (notificationId) => {
    if (window.confirm("Delete this notification?") && deleteNotification) {
      deleteNotification(notificationId);
    }
  };

  // Get type-specific colors and icons
  const getTypeConfig = (type) => {
    const configs = {
      success: { color: "#198754", icon: "bi-check-circle-fill" },
      error: { color: "#ff4500", icon: "bi-x-circle-fill" },
      info: { color: "#0d6efd", icon: "bi-info-circle-fill" },
      warning: { color: "#ffc107", icon: "bi-exclamation-triangle-fill" },
      login: { color: "#198754", icon: "bi-box-arrow-in-right" },
      kyc: { color: "#17a2b8", icon: "bi-shield-check" },
      default: { color: "#6c757d", icon: "bi-bell-fill" },
    };
    return configs[type] || configs.default;
  };

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: containerBg,
        color: textColor,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ color: primary }}>
            Notifications
          </h1>
          <small style={{ color: labelColor }}>
            {unreadCount > 0 && (
              <span className="badge bg-light me-2">{unreadCount} New</span>
            )}
            {notifications.length} total
            {userData.balance > 0 && (
              <span className="ms-2">
                {" "}
                | Balance: ₦{userData.balance.toLocaleString()}
              </span>
            )}
          </small>
        </div>
        <button
          className="btn btn-outline-success btn-sm rounded-pill"
          style={{ borderColor: primary, color: primary }}
          onClick={() => {
            if (markNotificationAsRead) {
              notifications.forEach(
                (n) => !n.isRead && markNotificationAsRead(n.id)
              );
            }
          }}
        >
          <i className="bi bi-check-all me-1"></i>
          Mark All Read
        </button>
      </div>

      {/* Notifications List */}
      <div
        className="notifications-list"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <ul className="list-group list-group-flush">
          {currentNotifications.map((notif) => {
            const { color, icon } = getTypeConfig(notif.type);
            const isUnread = !notif.isRead;

            return (
              <li
                key={notif.id}
                className={`list-group-item d-flex align-items-start p-3 mb-2 rounded shadow-sm position-relative ${
                  isUnread ? "border-primary" : ""
                }`}
                style={{
                  backgroundColor: isUnread ? `${cardBg} !important` : cardBg,
                  color: textColor,
                  borderLeft: `5px solid ${color}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleNotificationClick(notif)}
              >
                {/* Unread Dot */}
                {isUnread && (
                  <span
                    className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary"
                    style={{ width: "8px", height: "8px" }}
                  ></span>
                )}

                {/* Icon */}
                <i
                  className={`${icon} me-3`}
                  style={{
                    fontSize: "1.5rem",
                    color: color,
                    flexShrink: 0,
                  }}
                ></i>

                {/* Content */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold" style={{ color: textColor }}>
                        {notif.title}
                      </div>
                      <div
                        className={`badge fs-6 mb-1 ${
                          isUnread ? "bg-primary" : "bg-light text-dark"
                        }`}
                      >
                        {notif.category || "General"}
                      </div>
                    </div>
                    {isUnread && (
                      <span className="badge bg-primary fs-6">New</span>
                    )}
                  </div>

                  <div style={{ color: labelColor }} className="small mb-2">
                    {notif.message.length > 80
                      ? `${notif.message.substring(0, 80)}...`
                      : notif.message}
                  </div>

                  <small style={{ color: labelColor }}>
                    <i className="bi bi-clock me-1"></i>
                    {new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>

                {/* Delete Button */}
                <button
                  className="btn btn-outline-light btn-sm ms-2 rounded-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notif.id);
                  }}
                  title="Delete notification"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top"
          style={{ borderColor: isDark ? "#343a40" : "#dee2e6" }}
        >
          <small style={{ color: labelColor }}>
            Showing {indexOfFirst + 1}-
            {Math.min(indexOfLast, sortedNotifications.length)} of{" "}
            {sortedNotifications.length}
          </small>

          <div className="d-flex gap-1">
            <button
              className="btn btn-outline-success btn-sm rounded-pill"
              style={{ borderColor: primary, color: primary }}
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="px-2" style={{ color: labelColor }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-success btn-sm rounded-pill"
              style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        show={!!selectedNotificationId}
        onHide={() => setSelectedNotificationId(null)}
        notificationId={selectedNotificationId}
      />
    </div>
  );
}