import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationModal from "../../components/Modal/NotificationModal";
import { useAppData } from "../../hooks/AppDataContext";
import { useTheme } from "../../hooks/useThemeContext";

// ============================================================================
// 📬 Notifications Component
// ============================================================================
export default function Notifications() {
  const navigate = useNavigate();
  const {
    userData,
    markNotificationAsRead,
    deleteNotification,
    addNotification,
    recordTaskHistory,
  } = useAppData();
  const { theme } = useTheme();

  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  // Colors
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const containerBg = isDark ? "#121212" : "#f8f9fa";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";
  const primary = "var(--dh-red)";

  // Notifications list
  const notifications = userData?.notifications || [];

  // Display unread notifications toast-like
  useEffect(() => {
    notifications.forEach((notif) => {
      if (!notif.isRead) {
        addNotification({
          message: notif.message,
          type: notif.type || "info",
          title: notif.title || "New Notification",
          category: notif.category || "general",
        });
      }
    });
  }, [notifications, addNotification]);

  // Empty state
  if (!notifications.length)
    return (
      <div
        className="p-4 text-center min-vh-100 d-flex flex-column justify-content-center"
        style={{ backgroundColor: containerBg, color: textColor }}
      >
        <i
          className="bi bi-bell-slash fs-1 mb-3"
          style={{ color: labelColor }}
        ></i>
        <h2 className="fw-bold mb-3" style={{ color: primary }}>
          No Notifications
        </h2>
        <p className="text-muted mb-4">
          You haven’t received any notifications yet. Start a task to see new activity!
        </p>
        <button
          className="btn fw-bold rounded-pill px-4 py-2"
          style={{ backgroundColor: primary, color: "#fff" }}
          onClick={() => navigate("/tasks")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Start Earning Tasks
        </button>
      </div>
    );

  // Sorting - unread first, then newest
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Pagination
  const indexOfLast = currentPage * notificationsPerPage;
  const indexOfFirst = indexOfLast - notificationsPerPage;
  const currentNotifications = sortedNotifications.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(sortedNotifications.length / notificationsPerPage);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrev = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);

  // When click notification
  const handleNotificationClick = (notif) => {
    if (!notif.isRead && markNotificationAsRead) {
      markNotificationAsRead(notif.id);
      recordTaskHistory(
        notif.id,
        "notification_read",
        `Opened: "${notif.title || notif.message}"`
      );
    }
    setSelectedNotificationId(notif.id);

    if (notif.category === "task" && notif.taskId) {
      navigate(`/tasks?tab=my`);
    }
  };

  // Delete
  const handleDelete = (id) => {
    if (window.confirm("Delete this notification?")) {
      deleteNotification(id);
      recordTaskHistory(id, "notification_deleted", "Notification removed");
    }
  };

  // Color configs
  const getTypeConfig = (type) => {
    const map = {
      success: { color: "#198754", icon: "bi-check-circle-fill" },
      error: { color: "#ff4500", icon: "bi-x-circle-fill" },
      info: { color: "#0d6efd", icon: "bi-info-circle-fill" },
      warning: { color: "#ffc107", icon: "bi-exclamation-triangle-fill" },
      default: { color: "#6c757d", icon: "bi-bell-fill" },
    };
    return map[type] || map.default;
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
            {notifications.length} Total
          </small>
        </div>
        <button
          className="btn btn-outline-light btn-sm rounded-pill"
          style={{ borderColor: primary, color: primary }}
          onClick={() => {
            notifications
              .filter((n) => !n.isRead)
              .forEach((n) => markNotificationAsRead(n.id));
            recordTaskHistory(
              "notifications",
              "mark_all_read",
              `${unreadCount} notifications marked read`
            );
          }}
        >
          <i className="bi bi-check-all me-1"></i>
          Mark All Read
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <ul className="list-group list-group-flush">
          {currentNotifications.map((notif) => {
            const { color, icon } = getTypeConfig(notif.type);
            const isUnread = !notif.isRead;
            return (
              <li
                key={notif.id}
                className={`list-group-item d-flex align-items-start mb-2 rounded shadow-sm`}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  backgroundColor: cardBg,
                  color: textColor,
                  borderLeft: `5px solid ${color}`,
                  cursor: "pointer",
                  opacity: isUnread ? 1 : 0.7,
                  transition: "all 0.2s ease",
                }}
              >
                <i
                  className={`${icon} me-3`}
                  style={{ fontSize: "1.5rem", color }}
                ></i>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{notif.title}</div>
                  <p className="small mb-1" style={{ color: labelColor }}>
                    {notif.message}
                  </p>
                  <small style={{ color: labelColor }}>
                    <i className="bi bi-clock me-1"></i>
                    {new Date(notif.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
                <button
                  className="btn btn-outline-light btn-sm ms-2"
                  title="Delete this notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
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
        <div className="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
          <small style={{ color: labelColor }}>
            Showing {indexOfFirst + 1}-
            {Math.min(indexOfLast, sortedNotifications.length)} of{" "}
            {sortedNotifications.length}
          </small>
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-outline-light btn-sm rounded-pill"
              style={{ borderColor: primary, color: primary }}
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left" />
            </button>
            <span style={{ color: labelColor }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-light btn-sm rounded-pill"
              style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <NotificationModal
        show={!!selectedNotificationId}
        onHide={() => setSelectedNotificationId(null)}
        notificationId={selectedNotificationId}
      />
    </div>
  );
}
