import React, { useState, useMemo, useEffect } from "react";
import { Pagination, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../hooks/AppDataContext";
import { useTheme } from "../../hooks/useThemeContext";
import ModalTask from "../../components/Modal/ModalTask";
import EditProofModal from "../../components/Modal/EditProofModal";

export default function Tasks() {
  const { theme } = useTheme();
  const { userData, tasks } = useAppData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("tasksActiveTab") || "available");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const isDark = theme === "dark";

  const palette = useMemo(
    () => ({
      bg: "var(--dh-bg-gradient)",
      cardBg: "var(--dh-card-bg)",
      text: "var(--dh-text)",
      label: "var(--dh-muted)",
      red: "var(--dh-primary)",
    }),
    [isDark]
  );

  useEffect(() => {
    if (activeTab === "available") {
      setFilteredTasks(tasks || []);
    } else {
      setFilteredTasks([]);
    }
    setPage(1);
  }, [activeTab, tasks]);

  const totalPages = Math.ceil(filteredTasks.length / perPage);
  const visible = useMemo(() => {
    return filteredTasks.slice((page - 1) * perPage, page * perPage);
  }, [filteredTasks, page, perPage]);



  return (
    <div className="container-fluid py-4 px-3 min-vh-100" style={{ background: palette.bg, color: palette.text }}>
      <h2 className="text-center fw-bold mb-4" style={{ color: palette.red }}>
        Tasks
      </h2>
      {/* Tabs */}
      <div className="d-flex justify-content-center mb-4">
        {["available", "ongoing", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              localStorage.setItem("tasksActiveTab", tab);
            }}
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
            {tab === "available" ? "Available Tasks" : tab === "ongoing" ? "Ongoing Tasks" : "Completed Tasks"}
          </button>
        ))}
      </div>
      {/* Task List */}
      {visible.length > 0 ? (
        visible.map((t, index) => {
          const task = activeTab === "available" ? t : t.task || t;
          const userStatus =
            (activeTab === "ongoing" || activeTab === "completed")
              ? String(t.submission_progress || t.status || "").toUpperCase()
              : null;
          if (!task) return null;

          return (
            <div key={index} className="card">
              <div className="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
                <div className="flex-grow-1" style={{ minWidth: "250px" }}>
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
                    <div style={{ minWidth: "150px" }}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Slots</span>
                        <span>{task.slots?.used ?? 0}/{task.slots?.max ?? 0}</span>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${((task.slots?.used ?? 0) / (task.slots?.max || 1)) * 100}%`,
                            backgroundColor: palette.red
                          }}
                        />
                      </div>
                    </div>

                    {task.review_type?.toUpperCase() === "OPEN" && (
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Open Review</span>
                    )}{" "}
                    {task.review_type?.toUpperCase() === "CLOSED" && (
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Closed Review</span>
                    )}
                    {userStatus && (
                      <span
                        className={`badge ${
                          userStatus === "PENDING"
                            ? "badge-warning"
                            : userStatus === "REJECTED"
                            ? "badge-danger"
                            : userStatus === "APPROVED"
                            ? "badge-success"
                            : userStatus === "RESUBMIT"
                            ? "badge-warning"
                            : ""
                        }`}
                        style={{
                          background: userStatus === "RESUBMIT" ? 'rgba(255, 107, 53, 0.2)' : undefined,
                          color: userStatus === "RESUBMIT" ? '#ff6b35' : undefined
                        }}
                      >
                        {userStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-primary rounded-pill"
                    style={{ minWidth: "100px", flex: "1" }}
                    onClick={() => {
                      if (activeTab === "available") {
                        navigate(`/dashboard/tasks/${task._id}`);
                      } else {
                        setSelectedTask({ ...task, proofData: t });
                        setShowModal(true);
                      }
                    }}
                  >
                    {activeTab === "available" ? "Apply" : "View Proof"}
                  </button>
                  {activeTab === "ongoing" && (
                    <button
                      className={`btn ${(userStatus === "APPROVED" || userStatus === "REJECTED") ? '' : 'btn-outline'} rounded-pill`}
                      style={{
                        backgroundColor: (userStatus === "APPROVED" || userStatus === "REJECTED") ? "transparent" : undefined,
                        color: (userStatus === "APPROVED" || userStatus === "REJECTED") ? "#6c757d" : undefined,
                        border: (userStatus === "APPROVED" || userStatus === "REJECTED") ? "1px solid #6c757d" : undefined,
                        minWidth: "100px",
                        cursor: (userStatus === "APPROVED" || userStatus === "REJECTED") ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (userStatus !== "APPROVED") {
                          setSelectedTask(t);
                          setShowEditModal(true);
                        }
                      }}
                      disabled={userStatus === "APPROVED" || userStatus === "REJECTED"}
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
            : activeTab === "ongoing"
            ? "You have no ongoing tasks."
            : "You have no completed tasks yet."}
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
