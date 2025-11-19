// src/context/AppDataProvider.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getUser,
  getBalance,
  allTasks,
  myTasks,
  startTask,
  submitTask,
} from "../../services/services";
import { AppDataContext } from "../../hooks/AppDataContext";

const DEFAULT_USER_DATA = {
  username: "tester",
  balance: 0,
  currency: "NGN",
  isAuthenticated: false,
  kyc: { status: "verified", date: new Date().toISOString() },
  tasks: [],
  notifications: [],
  transactions: [],
};

export default function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState(
    () => JSON.parse(localStorage.getItem("dh_tasks")) || []
  );
  const [userData, setUserData] = useState(
    () => JSON.parse(localStorage.getItem("dh_user")) || DEFAULT_USER_DATA
  );
  const [userLoggedIn, setUserLoggedIn] = useState(
    () => !!JSON.parse(localStorage.getItem("userLoggedIn") || "false")
  );

  useEffect(() => {
    localStorage.setItem("userLoggedIn", JSON.stringify(userLoggedIn));
  }, [userLoggedIn]);
  useEffect(() => {
    localStorage.setItem("dh_tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("dh_user", JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const res = await allTasks();
        setTasks(res.data?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    };
    fetchAllTasks();
  }, []);

  useEffect(() => {
    if (!userLoggedIn) return;
    const token = localStorage.getItem("userToken");
    if (!token) {
      setUserLoggedIn(false);
      return;
    }
    let mounted = true;
    const fetch = async () => {
      try {
        const [userRes, balRes] = await Promise.all([getUser(), getBalance()]);
        if (!mounted) return;
        const newUser = userRes.data?.data || {};
        const bal = balRes.data?.data?.balance ?? userData.balance;
        const currency = balRes.data?.data?.currency ?? "NGN";
        const merged = {
          ...userData,
          ...newUser,
          balance: bal,
          currency,
          isAuthenticated: true,
          kyc: newUser.kyc || {
            status: "verified",
            date: new Date().toISOString(),
          },
        };
        setUserData(merged);
        await fetchMyTasks();
      } catch (e) {
        console.error(e);
        toast.error("Failed to load user data");
        setUserLoggedIn(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, [userLoggedIn]);

  useEffect(() => {
    if (userData.kyc?.status !== "verified") {
      setUserData((prev) => ({
        ...prev,
        kyc: { status: "verified", date: new Date().toISOString() },
      }));
    }
  }, [userData.kyc]);

  const showNotification = useCallback((msg, type = "info") => {
    toast[type](msg, {
      autoClose: 2000,
      position: "top-right",
      theme: "colored",
    });
  }, []);

  const refetchUserData = useCallback(async () => {
    try {
      const userRes = await getUser();
      const newUser = userRes.data?.data || {};
      setUserData((prev) => ({
        ...prev,
        ...newUser,
        isAuthenticated: true,
        kyc: newUser.kyc || prev.kyc,
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh user data");
    }
  }, []);

  // CRITICAL FIX: Return res.data.data
  const onApplyFunc = useCallback(
    async (task) => {
      try {
        if (!task?._id) throw new Error("Invalid task");
        const res = await startTask({ task_id: task._id });
        const proof = res.data?.data;

        if (!proof?._id) {
          throw new Error("Failed to create task proof: missing ID");
        }

        return proof;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to start task";
        showNotification(msg, "error");
        throw error;
      }
    },
    [showNotification]
  );

  const fetchAllTasks = useCallback(async () => {
    const res = await allTasks();
    const data = res.data?.data?.data || [];
    setTasks(data);
    return data;
  }, []);

  const fetchMyTasks = useCallback(async () => {
    try {
      const res = await myTasks();
      const raw = res.data?.data?.data || [];
      const transformed = raw.map((item) => ({
        _id: item._id,
        task_id: item.task._id,
        submission_progress: item.approval_status?.toUpperCase() || "PENDING",
        approval_status: item.approval_status,
        task: item.task,
        title: item.title,
        src: item.src,
      }));
      setUserData((prev) => ({ ...prev, tasks: transformed }));
      return transformed;
    } catch (error) {
      console.error("Failed to fetch my tasks:", error);
      return [];
    }
  }, []);

  const submitTaskProof = useCallback(
    async (taskProofId, data) => {
      const payload = {};
      if (data.title?.trim()) payload.title = data.title.trim();
      if (data.src) payload.src = data.src;
      const res = await submitTask(taskProofId, payload);
      if (res.status === 200) {
        await refetchUserData();
        await fetchMyTasks();
        showNotification?.("Proof submitted successfully!", "success");
      }
      return res.data;
    },
    [refetchUserData, fetchMyTasks, showNotification]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("dh_user");
    setUserLoggedIn(false);
    setUserData(DEFAULT_USER_DATA);
    showNotification("Logged out successfully", "success");
  }, [showNotification]);

  const refreshUserData = useCallback(async () => {
    try {
      await Promise.all([
        refetchUserData(),
        fetchAllTasks(),
        fetchMyTasks()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [refetchUserData, fetchAllTasks, fetchMyTasks]);

  const value = useMemo(
    () => ({
      userLoggedIn,
      setUserLoggedIn,
      userData,
      setUserData,
      refetchUserData,
      refreshUserData,
      tasks,
      setTasks,
      onApplyFunc,
      showNotification,
      fetchAllTasks,
      fetchMyTasks,
      submitTaskProof,
      logout,
    }),
    [
      userLoggedIn,
      userData,
      tasks,
      onApplyFunc,
      showNotification,
      fetchAllTasks,
      fetchMyTasks,
      submitTaskProof,
      refetchUserData,
      refreshUserData,
      logout,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}
