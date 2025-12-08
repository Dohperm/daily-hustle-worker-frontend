import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { uploadFile } from "../../services/services";

export default function TaskDetails() {
  const { theme } = useTheme();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, userData, onApplyFunc, showNotification, submitTaskProof } = useAppData();
  const [task, setTask] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskProofId, setTaskProofId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const fileInputRef = useRef();

  const isDark = theme === "dark";
  const bg = "var(--dh-bg-gradient)";
  const cardBg = "var(--dh-card-bg)";
  const text = "var(--dh-text)";
  const primary = "var(--dh-primary)";

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("userToken");
        const baseURL = import.meta.env.VITE_API_BASE_URL || "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1";
        const res = await fetch(`${baseURL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const taskData = data?.data || null;
        setTask(taskData);
        
        // Check if user has already started this task
        const userTask = userData?.tasks?.find(t => t.task?._id === taskId || t.task_id === taskId);
        if (userTask) {
          setHasStarted(true);
          setTaskProofId(userTask._id);
        }
      } catch (error) {
        console.error("Failed to fetch task", error);
        showNotification?.("Failed to load task details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, showNotification]);

  useEffect(() => {
    if (task?.review_type?.toUpperCase() === "CLOSED") {
      const fetchReviewText = async () => {
        try {
          const token = localStorage.getItem("userToken");
          const baseURL = import.meta.env.VITE_API_BASE_URL || "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1";
          const res = await fetch(`${baseURL}/tasks/${taskId}/closed-review-option`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setReviewText(data?.data?.closed_review_option || "");
        } catch (error) {
          console.error("Failed to fetch review text", error);
        }
      };
      fetchReviewText();
    }
  }, [task, taskId]);

  const handleStartJob = () => {
    if (task.task_site) {
      window.open(task.task_site, "_blank");
    }
    if (!hasStarted) {
      setTaskProofId(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProofFile(null);
      setPreviewURL(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      showNotification?.("Only image files allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification?.("Image must be under 5MB", "error");
      return;
    }
    setProofFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      showNotification?.("Please upload proof image", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await uploadFile(proofFile);
      const src = res.data?.data?.[0]?.src;
      if (!src) throw new Error("Upload failed");

      const token = localStorage.getItem("userToken");
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://daily-hustle-backend-fb9c10f98583.herokuapp.com/api/v1";
      await fetch(`${baseURL}/tasks/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ task_id: task._id, src })
      });

      showNotification?.("Proof submitted successfully!", "success");
      navigate("/dashboard/tasks");
    } catch (err) {
      showNotification?.(err.message || "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 min-vh-100" style={{ background: bg, color: text }}>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: primary }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container-fluid py-4 min-vh-100" style={{ background: bg, color: text }}>
        <div className="text-center py-5">Task not found</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 min-vh-100" style={{ background: bg, color: text }}>
      <div className="mb-4">
        <button className="btn btn-link text-decoration-none" onClick={() => navigate("/dashboard/tasks")} style={{ color: primary }}>
          ← Back to Tasks
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card p-4 mb-4" style={{ background: cardBg, border: "none", borderRadius: "12px" }}>
            <h4 className="fw-bold mb-3" style={{ color: primary }}>
              Read The Job Instruction Carefully, Only Submit Proof After Completion
            </h4>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Sign Up Job</h5>
              <h3 className="fw-bold mb-0" style={{ color: primary }}>
                {task.reward?.currency}{task.reward?.amount_per_worker || 0}
              </h3>
            </div>

            <div className="row text-center mb-4 p-3" style={{ background: isDark ? "#2a2a2d" : "#f8f9fa", borderRadius: "8px" }}>
              <div className="col-4">
                <div className="small text-uppercase mb-1" style={{ color: "var(--dh-muted)" }}>Workers Needed</div>
                <div className="fw-bold fs-5">{task.slots?.max ?? 0}</div>
              </div>
              <div className="col-4">
                <div className="small text-uppercase mb-1" style={{ color: "var(--dh-muted)" }}>Workers Applied</div>
                <div className="fw-bold fs-5">{task.slots?.used ?? 0}</div>
              </div>
              <div className="col-4">
                <div className="small text-uppercase mb-1" style={{ color: "var(--dh-muted)" }}>Job ID</div>
                <div className="fw-bold fs-5">{task._id?.slice(-6) || "N/A"}</div>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-2">Instructions</h6>
              <div className="p-3" style={{ background: isDark ? "#2a2a2d" : "#fff9e6", borderRadius: "8px", border: "1px solid #ffc107" }}>
                <div dangerouslySetInnerHTML={{ __html: task.instructions || "No instructions provided" }} />
              </div>
            </div>

            {task.description && (
              <div className="mb-2">
                <h6 className="fw-bold mb-2">Description</h6>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
              </div>
            )}

            <div className="row mb-2">
              <div className="col-md-6 mb-3">
                <strong>Category:</strong> {task.category}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Review Type:</strong> {task.review_type || "N/A"}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Approval Mode:</strong> {task.approval?.mode || "Self"}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Duration:</strong> {task.min_duration ?? "N/A"}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Complexity:</strong> {task.complexity_rating || "N/A"}
              </div>
            </div>

            {task.review_type?.toUpperCase() === "CLOSED" && reviewText && (
              <div className="mb-4 p-3" style={{ background: isDark ? "#2a2a2d" : "#f8f9fa", borderRadius: "8px", border: "1px solid #ddd" }}>
                <h6 className="fw-bold mb-2" style={{ color: primary }}>⚠️ Review Text</h6>
                <p className="small mb-2">Paste the text as it is on the job site.</p>
                <div className="d-flex gap-2 align-items-center">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={reviewText} 
                    readOnly 
                  />
                  <button 
                    className="btn btn-sm" 
                    style={{ background: primary, color: "#fff", whiteSpace: "nowrap" }}
                    onClick={() => {
                      navigator.clipboard.writeText(reviewText);
                      showNotification?.("Review text copied!", "success");
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {!hasStarted && (
              <div className="mb-4 mt-4">
                <button 
                  className="btn btn-dark fw-bold px-4 py-2"
                  onClick={handleStartJob}
                >
                  START JOB
                </button>
              </div>
            )}

            <div className="mb-4">
              <h4 className="fw-bold mb-3" style={{ color: primary }}>
                🚨 Read Carefully & Submit
              </h4>
              <p className="small mb-3">Please kindly send the appropriate Screenshot of your submission and nice comment</p>
              
              <h6 className="fw-bold mb-3">Submit Details To Proceed</h6>
              <p className="small text-danger mb-2">⚠️ Incomplete Submission = No Payment</p>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Upload Real Screenshot (No Inspect)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewURL && (
                  <div className="mt-3 text-center">
                    <img src={previewURL} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "200px" }} />
                  </div>
                )}
              </div>
              
              <div className="small text-muted mb-3">
                <p>Complete only the job exactly as described. Do not add extra tasks.</p>
                <p>After completing the work, submit the required proof immediately. Employers have 5 days to approve or reject your submission.</p>
                <p>If they do not respond within 5 days, the job will be automatically approved. Incorrect submissions will result in blacklisting and loss of access to future jobs.</p>
                <p>If your proof is rejected, use the "Choose File" button to resubmit promptly. Repeated rejections may lead to account suspension.</p>
                <p>For questions, issues, or to report requests that go beyond the listed task, contact support immediately.</p>
                <p>We review all disputes fairly. For urgent help or to report violations, email support at <strong>info@dailyhustle.com</strong> and include the job ID.</p>
                <p>Thank you for your cooperation and attention to detail.</p>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="confirmCheck"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="confirmCheck">
                  ⚠️ By ticking this box, you confirm you've completed the job correctly as instructed. Otuside, check your submission before submitting. Submitting "Done" without completing all work will result in rejection and potential account suspension.
                </label>
              </div>
              
              <button 
                className="btn fw-bold px-4 py-2" 
                style={{ background: primary, color: "#fff" }}
                onClick={handleSubmitProof}
                disabled={isSubmitting || !proofFile || !confirmChecked}
              >
                {isSubmitting ? (hasStarted ? "UPDATING..." : "SUBMITTING...") : (hasStarted ? "UPDATE PROOF" : "SUBMIT PROOF")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
