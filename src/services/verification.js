import api from "./api";

// Identity Verification
export const submitVerification = (data) => api.post("/verification/identity", data);
export const getVerificationStatus = () => api.get("/verification/status");
export const uploadVerificationDocument = (file, type) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  return api.post("/verification/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

// Phone Verification
export const sendPhoneVerification = (phone) => api.post("/verification/phone/send", { phone });
export const verifyPhoneCode = (phone, code) => api.post("/verification/phone/verify", { phone, code });

// Badge Management
export const requestWorkerBadge = () => api.post("/verification/badge/worker");
export const requestAdvertiserBadge = () => api.post("/verification/badge/advertiser");
export const getBadgeStatus = () => api.get("/verification/badges");