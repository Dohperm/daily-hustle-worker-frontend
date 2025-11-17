import React, { useState, useMemo, useEffect } from "react";
import { Pagination, Badge } from "react-bootstrap";
import { useAppData } from "../../hooks/AppDataContext";
import { useTheme } from "../../hooks/useThemeContext";
import ModalTask from "../../components/Modal/ModalTask";
import EditProofModal from "../../components/Modal/EditProofModal";

export default function Tasks() {
  const { theme } = useTheme();
  const { userData, tasks } = useAppData();

  const [activeTab, setActiveTab] = useState("available");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const isDark = theme === "dark";

  const palette = useMemo(
    () => ({
      bg: isDark ? "#121212" : "#f8f9fa",
      cardBg: isDark ? "#1c1c1e" : "#fff",
      text: isDark ? "#f8f9fa" : "#212529",
      label: isDark ? "#adb5bd" : "#6c757d",
      red: "var(--dh-red)",
    }),
    [isDark]
  );

  // FILTER TASKS
  useEffect(() => {
    if (activeTab === "available") {
      setFilteredTasks(tasks || []);
    } else {
      setFilteredTasks(userData.tasks || []);
    }
    setPage(1);
  }, [activeTab, tasks, userData.tasks]);

  const totalPages = Math.ceil(filteredTasks.length / perPage);
  const visible = useMemo(() => {
    return filteredTasks.slice((page - 1) * perPage, page * perPage);
  }, [filteredTasks, page, perPage]);

  const paginationStyle = `
    .pagination .page-item .page-link {
      color: var(--dh-red);
      border-radius: 50%;
      margin: 0 3px;
      border: 1px solid var(--dh-red);
    }
    .pagination .page-item.active .page-link {
      background-color: var(--dh-red);
      color: #fff;
      border-color: var(--dh-red);
    }
    .pagination .page-item .page-link:hover {
      background-color: #c92b2b;
      color: #fff;
      border-color: #c92b2b;
    }
  `;

  return (
    <div
      className="container-fluid py-4 px-3 min-vh-100"
      style={{ background: palette.bg, color: palette.text }}
    >
      <style>{paginationStyle}</style>
      <h2 className="text-center fw-bold mb-4" style={{ color: palette.red }}>
        Tasks
      </h2>
      {/* Tabs */}
      <div className="d-flex justify-content-center mb-4">
        {["available", "myTasks"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn mx-2 rounded-pill ${
              activeTab === tab ? "text-white" : ""
            }`}
            style={{
              backgroundColor: activeTab === tab ? palette.red : "transparent",
              color: activeTab === tab ? "#fff" : palette.label,
              border: `1px solid ${palette.red}`,
              transition: "all 0.3s ease",
            }}
          >
            {tab === "available" ? "Available Tasks" : "My Tasks"}
          </button>
        ))}
      </div>
      {/* Task List */}
      {visible.length > 0 ? (
        visible.map((t, index) => {
          const task = activeTab === "available" ? t : t.task || t;
          const userStatus =
            activeTab === "myTasks"
              ? String(t.submission_progress || t.status || "").toUpperCase()
              : null;
          if (!task) return null;

          const isFull = (task.slots?.used ?? 0) >= (task.slots?.max ?? 0);
          const isDisabled = activeTab === "available" && isFull;

          const statusColor =
            userStatus === "PENDING"
              ? "#ffc107"
              : userStatus === "REJECTED"
              ? "#e74c3c"
              : userStatus === "APPROVED"
              ? "#2ecc71"
              : palette.label;

          return (
            <div
              key={index}
              className="p-3 mb-3 rounded shadow-sm"
              style={{
                backgroundColor: palette.cardBg,
                border: "1px solid rgba(0,0,0,0.05)",
                opacity: isDisabled ? 0.6 : 1,
              }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">{task.title}</h6>
                  <p
                    className="small text-uppercase mb-1"
                    style={{ color: palette.label }}
                  >
                    {task.category}
                  </p>
                  {/* <p className="small mb-2">{task.description}</p> */}
                  <div className="d-flex flex-wrap align-items-center gap-3 small">
                    <span>
                      <b>Reward:</b> {task.reward?.currency}{" "}
                      {typeof task.reward?.amount_per_worker !== "undefined"
                        ? task.reward.amount_per_worker.toLocaleString()
                        : (task.reward?.amount || 0).toLocaleString()}
                    </span>
                    <span style={{ color: palette.label }}>
                      Slots: {task.slots?.used ?? 0}/{task.slots?.max ?? 0}
                    </span>
                    {isFull && <Badge bg="danger">Full</Badge>}
                    {task.review_type?.toUpperCase() === "OPEN" && (
                      <Badge bg="info">Open Review</Badge>
                    )}{" "}
                    {task.review_type?.toUpperCase() === "CLOSED" && (
                      <Badge bg="info">Closed Review</Badge>
                    )}
                    {userStatus && (
                      <span
                        className="fw-semibold"
                        style={{
                          color: statusColor,
                          textTransform: "uppercase",
                        }}
                      >
                        {userStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn fw-bold rounded-pill text-white"
                    style={{
                      backgroundColor: isDisabled ? "#6c757d" : palette.red,
                      minWidth: "130px",
                      border: "none",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      if (!isDisabled) {
                        if (activeTab === "available") {
                          setSelectedTask(task);
                        } else {
                          // For My Tasks, pass the full task proof object
                          setSelectedTask({ ...task, proofData: t });
                        }
                        setShowModal(true);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    {activeTab === "available"
                      ? isFull
                        ? "Full"
                        : "View Details"
                      : "View Proof"}
                  </button>
                  {activeTab === "myTasks" && (
                    <button
                      className="btn fw-bold rounded-pill"
                      style={{
                        backgroundColor: "transparent",
                        color: userStatus === "APPROVED" ? "#6c757d" : palette.red,
                        border: `1px solid ${userStatus === "APPROVED" ? "#6c757d" : palette.red}`,
                        minWidth: "100px",
                        cursor: userStatus === "APPROVED" ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (userStatus !== "APPROVED") {
                          setSelectedTask(t);
                          setShowEditModal(true);
                        }
                      }}
                      disabled={userStatus === "APPROVED"}
                    >
                      Edit Proof
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-5" style={{ color: palette.label }}>
          {activeTab === "available"
            ? "No available tasks right now. Check back soon!"
            : "You haven't started any tasks yet."}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={i + 1 === page}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            />
          </Pagination>
        </div>
      )}
      {/* Modal */}
      {selectedTask && (
        <ModalTask
          task={selectedTask}
          show={showModal}
          onClose={() => setShowModal(false)}
          isAvailableTask={activeTab === "available"}
        />
      )}
      {/* Edit Proof Modal */}
      {selectedTask && (
        <EditProofModal
          taskProof={selectedTask}
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
