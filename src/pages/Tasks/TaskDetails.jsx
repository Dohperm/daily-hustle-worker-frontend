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
  const fileInputRef = useRef();

  const isDark = theme === "dark";
  const bg = "var(--dh-bg-gradient)";
  const cardBg = "var(--dh-card-bg)";
  const text = "var(--dh-text)";
  const primary = "var(--dh-primary)";

  useEffect(() => {
    const foundTask = tasks?.find(t => t._id === taskId);
    setTask(foundTask);
  }, [taskId, tasks]);

  const handleStartJob = () => {
    if (task.task_site) {
      window.open(task.task_site, "_blank");
    }
    setTaskProofId(true);
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

  if (!task) {
    return (
      <div className="container-fluid py-4 min-vh-100" style={{ background: bg, color: text }}>
        <div className="text-center py-5">Loading task details...</div>
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
        <div className="col-lg-8">
          <div className="card p-4 mb-4" style={{ background: cardBg, border: "none", borderRadius: "12px" }}>
            <h4 className="fw-bold mb-3" style={{ color: primary }}>
              Read The Job Instruction Carefully, Only Submit Proof After Completion
            </h4>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Sign Up Job</h5>
              <h3 className="fw-bold mb-0" style={{ color: primary }}>
                {task.reward?.currency}{task.reward?.amount_per_worker || task.reward?.amount || 0}
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
              <h6 className="fw-bold mb-2" style={{ color: primary }}>Click Start Job</h6>
              <ul className="mb-3">
                <li>Open the provided website.</li>
                <li>Sign up using your <strong>real email address</strong>.</li>
                <li>Submit a screenshot showing your email was accepted or account dashboard.</li>
              </ul>
              <p className="small text-muted">Do not use fake emails or create accounts you won't be able to access again.</p>
              <button 
                className="btn btn-dark fw-bold px-4 py-2"
                onClick={handleStartJob}
              >
                START JOB
              </button>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-2" style={{ color: primary }}>
                🚨 Read Carefully & Submit
              </h6>
              <div className="p-3" style={{ background: isDark ? "#2a2a2d" : "#fff9e6", borderRadius: "8px", border: "1px solid #ffc107" }}>
                <div dangerouslySetInnerHTML={{ __html: task.instructions || "No instructions provided" }} />
              </div>
            </div>

            {task.description && (
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Description</h6>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
              </div>
            )}

            <div className="row">
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
                <strong>Complexity:</strong> {task.complexity || "N/A"}
              </div>
            </div>

            {taskProofId && (
              <form onSubmit={handleSubmitProof} className="mt-4 p-4" style={{ background: isDark ? "#2a2a2d" : "#f8f9fa", borderRadius: "8px" }}>
                <h6 className="fw-bold mb-3" style={{ color: primary }}>Submit Your Proof</h6>
                <div className="mb-3">
                  <label className="form-label">Upload Screenshot</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  {previewURL && (
                    <div className="mt-3 text-center">
                      <img src={previewURL} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "200px" }} />
                    </div>
                  )}
                </div>
                <button type="submit" className="btn fw-bold px-4 py-2" style={{ background: primary, color: "#fff" }} disabled={isSubmitting}>
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT PROOF"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card p-4 text-center" style={{ background: cardBg, border: "none", borderRadius: "12px" }}>
            <div className="mb-3">
              <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                   style={{ width: "100px", height: "100px", background: primary }}>
                <span className="fs-1 fw-bold text-white">{userData?.username?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
            </div>
            <button className="btn btn-sm mb-2" style={{ background: primary, color: "#fff" }}>CHANGE AVATAR</button>
            <div className="fw-bold mb-3">@{userData?.username || "user"}</div>
            <div className="small mb-3" style={{ color: "var(--dh-muted)" }}>
              Members Access ({userData?.membership_days || 0} days left)
            </div>
            <h3 className="fw-bold mb-3" style={{ color: primary }}>₦{userData?.wallet?.balance || 0}</h3>
            <div className="fw-bold mb-2">CREDITS: {userData?.credits || 0}</div>
            
            <div className="d-flex justify-content-around mb-3">
              <div className="text-center">
                <div className="fw-bold fs-4">0</div>
                <div className="small" style={{ color: "var(--dh-muted)" }}>Following</div>
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4">0</div>
                <div className="small" style={{ color: "var(--dh-muted)" }}>Followers</div>
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4">0</div>
                <div className="small" style={{ color: "var(--dh-muted)" }}>Topics</div>
              </div>
            </div>

            <div className="d-flex gap-2 mb-3">
              <button className="btn flex-fill" style={{ background: "#28a745", color: "#fff" }}>1 👍</button>
              <button className="btn flex-fill" style={{ background: "#dc3545", color: "#fff" }}>👎 0</button>
            </div>

            <div className="mt-4">
              <h6 className="fw-bold mb-3">STATS</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Invites</span>
                <span className="fw-bold">0</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Posted Jobs</span>
                <span className="fw-bold">{userData?.tasks?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
