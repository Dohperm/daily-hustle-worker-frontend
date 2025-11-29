import api from "./api";

/* ------------------- USER PROFILE ------------------- */
export const getUser = () => api.get("/users/me");
export const updateUser = (updates) => api.patch("/users/me", updates);
export const getBalance = () => api.get("/users/me/wallet-balance");

/* ----------------------- TASKS ---------------------- */
export const allTasks = () => api.get("/tasks");
export const startTask = (payload) => {
  const body = { task_id: String(payload.task_id || payload) };
  return api.post("/task-proof", body);
};
export const viewTask = (taskId) => api.get(`/tasks/${taskId}`);
export const myTasks = () => api.get("/task-proof/users");
export const submitTask = (taskId, data) =>
  api.patch(`/task-proof/users/${taskId}`, data);

export const getTaskStats = () => api.get("/task-proof/users/stats");
export const getReferralStats = () => api.get("/referrals/stats");
export const getReferralHistory = (pageNo = 1, limitNo = 10, fromDate = '', toDate = '', search = '') => {
  const params = new URLSearchParams({ pageNo, limitNo });
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (search) params.append('search', search);
  return api.get(`/referrals/history?${params}`);
};

/* ------------------- TRANSACTIONS ------------------- */
export const getTransactions = (pageNo = 1, limitNo = 10, order = '-1', search = '') => {
  const params = new URLSearchParams({ pageNo, limitNo, order });
  if (search) params.append('search', search);
  return api.get(`/transactions/users?${params}`);
};

/* -------------------- FILE UPLOAD ------------------- */
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("files", file); // keep the key that the backend expects
  return api.post("/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
/* You may alias if desired, but it's not required */
export const uploadImage = uploadFile;

/* ----------- PATCH USER WITH FILE URL ---------- */
export const fileUrlUpdate = async ({ type, fileUrl, user } = {}) => {
  const body = {};
  if (user?.firstname) body.first_name = user.firstname;
  if (user?.lastname) body.last_name = user.lastname;
  if (type === "photo") body.photo = fileUrl;
  if (user?.phone) {
    const normalized = user.phone.startsWith("+234")
      ? "0" + user.phone.slice(4)
      : user.phone;
    body.phone = normalized;
  }
  if (type && fileUrl) body[type] = fileUrl;
  if (Object.keys(body).length === 0) {
    return Promise.resolve({ data: {} });
  }
  return api.patch("/users/me", body).then((e) => console.log(e));
};

/* ------------------- NOTIFICATIONS ------------------- */
export const getNotifications = () => api.get("/notifications/users");
export const getUnreadCount = () => api.get("/notifications/users/unread-count");

/* ------------------- VERIFICATION ------------------- */
export const submitVerification = (data) => api.post("/verification/identity", data);
export const getVerificationStatus = () => api.get("/verification/status");
export const sendPhoneVerification = (phone) => api.post("/verification/phone/send", { phone });
export const verifyPhoneCode = (phone, code) => api.post("/verification/phone/verify", { phone, code });
export const requestWorkerBadge = () => api.post("/verification/badge/worker");
export const requestAdvertiserBadge = () => api.post("/verification/badge/advertiser");
export const getBadgeStatus = () => api.get("/verification/badges");

/* ------------------- SOCIAL AUTH ------------------- */
export const oauthLogin = (payload) => api.post("/auths/users/oauth-login", payload);
