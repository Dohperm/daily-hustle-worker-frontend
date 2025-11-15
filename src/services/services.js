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
export const getReferralStats = () => api.get("/users/me/referrals/stats");
export const getReferralHistory = () => api.get("/users/me/referrals");

/* ------------------- TRANSACTIONS ------------------- */
export const getTransactions = (page = 1, limit = 10) => 
  api.get(`/transactions/users?page=${page}&limit=${limit}`);

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
