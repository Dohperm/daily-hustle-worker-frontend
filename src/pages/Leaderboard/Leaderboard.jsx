import React from 'react';

function Leaderboard() {
    return (
        <div>
            Page is coming soon, keep hustling !!!!😁
        </div>
    );
}

export default Leaderboard;



























// // src/pages/Leaderboard/Leaderboard.jsx
// import React, { useState } from "react";
// import { useTheme } from "../../hooks/useThemeContext";
// import { useUserData } from "../../hooks/useUserDataContext";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";

// export default function Leaderboard() {
//     const { theme } = useTheme();
//     const { userData } = useUserData();
//     const navigate = useNavigate();

//     const [activeTab, setActiveTab] = useState("weekly"); // weekly, monthly, all-time

//     const isDark = theme === "dark";
//     const cardBg = isDark ? "#1c1c1e" : "#ffffff";
//     const containerBg = isDark ? "#121212" : "#f8f9fa";
//     const textColor = isDark ? "#f8f9fa" : "#212529";
//     const labelColor = isDark ? "#adb5bd" : "#6c757d";
//     const primary = "#198754";
//     const borderColor = isDark ? "#333" : "#dee2e6";
//     const gradientBg = isDark
//         ? "linear-gradient(135deg, #5a189a, #240046)"
//         : "linear-gradient(135deg, #198754, #20c997)";
//     const gold = "#ffd700";
//     const silver = "#c0c0c0";
//     const bronze = "#cd7f32";

//     const { username = "User" } = userData || {};

//     // Demo Leaderboard Data
//     const leaderboardData = {
//         weekly: [
//             {
//                 rank: 1,
//                 name: "Chinedu O.",
//                 earnings: 12500,
//                 tasks: 35,
//                 avatar: "👑",
//             },
//             {
//                 rank: 2,
//                 name: "Aisha M.",
//                 earnings: 11200,
//                 tasks: 32,
//                 avatar: "🥇",
//             },
//             {
//                 rank: 3,
//                 name: "Tunde A.",
//                 earnings: 9800,
//                 tasks: 28,
//                 avatar: "🥉",
//             },
//             {
//                 rank: 4,
//                 name: "Funke S.",
//                 earnings: 8500,
//                 tasks: 25,
//                 avatar: "⭐",
//             },
//             {
//                 rank: 5,
//                 name: username,
//                 earnings: 7200,
//                 tasks: 22,
//                 avatar: "⭐",
//                 isMe: true,
//             },
//         ],
//         monthly: [
//             {
//                 rank: 1,
//                 name: "Emeka N.",
//                 earnings: 45000,
//                 tasks: 120,
//                 avatar: "👑",
//             },
//             {
//                 rank: 2,
//                 name: "Zainab K.",
//                 earnings: 41200,
//                 tasks: 110,
//                 avatar: "🥇",
//             },
//             {
//                 rank: 3,
//                 name: "David O.",
//                 earnings: 38500,
//                 tasks: 105,
//                 avatar: "🥉",
//             },
//             {
//                 rank: 4,
//                 name: username,
//                 earnings: 28000,
//                 tasks: 85,
//                 avatar: "⭐",
//                 isMe: true,
//             },
//             {
//                 rank: 5,
//                 name: "Sarah I.",
//                 earnings: 26500,
//                 tasks: 80,
//                 avatar: "⭐",
//             },
//         ],
//         "all-time": [
//             {
//                 rank: 1,
//                 name: "Kingsley U.",
//                 earnings: 245000,
//                 tasks: 650,
//                 avatar: "👑",
//             },
//             {
//                 rank: 2,
//                 name: "Fatima B.",
//                 earnings: 218000,
//                 tasks: 620,
//                 avatar: "🥇",
//             },
//             {
//                 rank: 3,
//                 name: "Peter E.",
//                 earnings: 198000,
//                 tasks: 590,
//                 avatar: "🥉",
//             },
//             {
//                 rank: 4,
//                 name: "Blessing O.",
//                 earnings: 175000,
//                 tasks: 520,
//                 avatar: "⭐",
//             },
//             {
//                 rank: 5,
//                 name: username,
//                 earnings: 152000,
//                 tasks: 480,
//                 avatar: "⭐",
//                 isMe: true,
//             },
//         ],
//     };

//     const currentData = leaderboardData[activeTab];

//     const getRankColor = (rank) => {
//         if (rank === 1) return gold;
//         if (rank === 2) return silver;
//         if (rank === 3) return bronze;
//         return primary;
//     };

//     // ✅ FIXED: REMOVED unused viewProfile function

//     return (
//         <div
//             className="p-4"
//             style={{
//                 backgroundColor: containerBg,
//                 color: textColor,
//                 minHeight: "100vh",
//             }}
//         >
//             {/* Header */}
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <div>
//                     <h1 className="fw-bold mb-1" style={{ color: primary }}>
//                         🏆 Leaderboard
//                     </h1>
//                     <small style={{ color: labelColor }}>
//                         Top hustlers this {activeTab}
//                     </small>
//                 </div>
//             </div>

//             {/* Stats Hero Card */}
//             <div className="row g-3 mb-5">
//                 <div className="col-12">
//                     <div className="position-relative overflow-hidden rounded-4 shadow-lg p-5 text-center">
//                         <div
//                             className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
//                             style={{ background: gradientBg }}
//                         ></div>
//                         <div
//                             style={{
//                                 backgroundColor: cardBg,
//                                 borderRadius: "24px",
//                                 padding: "2rem",
//                                 position: "relative",
//                                 zIndex: 1,
//                             }}
//                         >
//                             <div className="row g-4 mb-4">
//                                 <div className="col-md-4 text-center">
//                                     <div
//                                         className="fs-1 fw-bold"
//                                         style={{ color: gold }}
//                                     >
//                                         #1
//                                     </div>
//                                     <small style={{ color: labelColor }}>
//                                         This {activeTab}
//                                     </small>
//                                 </div>
//                                 <div className="col-md-4 text-center">
//                                     <div className="fs-1 fw-bold text-success">
//                                         ₦
//                                         {currentData[0]?.earnings?.toLocaleString() ||
//                                             0}
//                                     </div>
//                                     <small style={{ color: labelColor }}>
//                                         Top Earnings
//                                     </small>
//                                 </div>
//                                 <div className="col-md-4 text-center">
//                                     <div
//                                         className="fs-1 fw-bold"
//                                         style={{ color: primary }}
//                                     >
//                                         {currentData[0]?.tasks || 0}
//                                     </div>
//                                     <small style={{ color: labelColor }}>
//                                         Tasks
//                                     </small>
//                                 </div>
//                             </div>
//                             <div
//                                 style={{ color: labelColor }}
//                                 className="mb-3 fs-5"
//                             >
//                                 Climb the ranks by completing more tasks!
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="mb-4">
//                 <div className="d-flex gap-2 justify-content-center">
//                     {["weekly", "monthly", "all-time"].map((tab) => (
//                         <button
//                             key={tab}
//                             className={`btn rounded-pill px-4 py-2 fw-bold ${
//                                 activeTab === tab ? "shadow-lg" : ""
//                             }`}
//                             style={{
//                                 backgroundColor:
//                                     activeTab === tab
//                                         ? gradientBg
//                                         : "transparent",
//                                 color: activeTab === tab ? "#fff" : textColor,
//                                 border: `2px solid ${
//                                     activeTab === tab ? "#fff" : borderColor
//                                 }`,
//                             }}
//                             onClick={() => setActiveTab(tab)}
//                         >
//                             {tab === "weekly"
//                                 ? "📅 Week"
//                                 : tab === "monthly"
//                                 ? "📆 Month"
//                                 : "🏆 All Time"}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Leaderboard Table */}
//             <div
//                 className="rounded-4 overflow-hidden shadow-lg"
//                 style={{ backgroundColor: cardBg }}
//             >
//                 <div className="table-responsive">
//                     <table className="table table-hover mb-0">
//                         <thead
//                             style={{
//                                 backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa",
//                             }}
//                         >
//                             <tr>
//                                 <th
//                                     style={{ color: textColor, border: "none" }}
//                                 >
//                                     #
//                                 </th>
//                                 <th
//                                     style={{ color: textColor, border: "none" }}
//                                 >
//                                     Hustler
//                                 </th>
//                                 <th
//                                     style={{ color: textColor, border: "none" }}
//                                 >
//                                     Earnings
//                                 </th>
//                                 <th
//                                     style={{ color: textColor, border: "none" }}
//                                 >
//                                     Tasks
//                                 </th>
//                                 <th
//                                     style={{ color: textColor, border: "none" }}
//                                 >
//                                     Rank
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {currentData.map((hustler, i) => (
//                                 <tr
//                                     key={i}
//                                     className={`align-middle ${
//                                         hustler.isMe ? "table-info" : ""
//                                     }`}
//                                 >
//                                     <td
//                                         style={{
//                                             border: "none",
//                                             fontSize: "1.5rem",
//                                             fontWeight: "bold",
//                                         }}
//                                     >
//                                         {hustler.rank}
//                                     </td>
//                                     <td style={{ border: "none" }}>
//                                         <div className="d-flex align-items-center">
//                                             <span className="me-3 fs-4">
//                                                 {hustler.avatar}
//                                             </span>
//                                             <div>
//                                                 <div
//                                                     style={{
//                                                         color: textColor,
//                                                         fontWeight: "bold",
//                                                     }}
//                                                 >
//                                                     {hustler.name}
//                                                     {hustler.isMe && (
//                                                         <span className="badge bg-primary ms-2">
//                                                             YOU
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td
//                                         style={{
//                                             border: "none",
//                                             fontWeight: "bold",
//                                             color: primary,
//                                         }}
//                                     >
//                                         ₦{hustler.earnings.toLocaleString()}
//                                     </td>
//                                     <td
//                                         style={{
//                                             border: "none",
//                                             color: labelColor,
//                                         }}
//                                     >
//                                         {hustler.tasks}
//                                     </td>
//                                     <td style={{ border: "none" }}>
//                                         <span
//                                             className="badge rounded-pill px-3 py-2 fw-bold"
//                                             style={{
//                                                 backgroundColor: getRankColor(
//                                                     hustler.rank
//                                                 ),
//                                                 color: "#000",
//                                             }}
//                                         >
//                                             #{hustler.rank}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Motivation Cards */}
//             <div className="row g-4 mt-5">
//                 {[
//                     {
//                         icon: "trophy",
//                         title: "🥇 Gold Rush",
//                         desc: "Top 3 weekly = ₦5,000 bonus",
//                         color: gold,
//                     },
//                     {
//                         icon: "fire",
//                         title: "🔥 Hot Streak",
//                         desc: "10 tasks/day = double earnings",
//                         color: "#ff4757",
//                     },
//                     {
//                         icon: "gift",
//                         title: "🎁 Daily Prize",
//                         desc: "Complete 5 tasks = ₦500 free",
//                         color: primary,
//                     },
//                 ].map((prize, i) => (
//                     <div className="col-md-4" key={i}>
//                         <div
//                             className="p-4 rounded-4 text-center h-100 cursor-pointer"
//                             style={{
//                                 backgroundColor: cardBg,
//                                 border: `2px solid ${prize.color}`,
//                                 transition: "all 0.3s ease",
//                             }}
//                             onClick={() =>
//                                 toast.info(`${prize.title} (Coming soon!)`)
//                             }
//                             onMouseEnter={(e) => {
//                                 e.currentTarget.style.transform = "scale(1.02)";
//                                 e.currentTarget.style.boxShadow = `0 10px 25px ${prize.color}20`;
//                             }}
//                             onMouseLeave={(e) => {
//                                 e.currentTarget.style.transform = "scale(1)";
//                                 e.currentTarget.style.boxShadow =
//                                     "0 4px 8px rgba(0,0,0,0.1)";
//                             }}
//                         >
//                             <i
//                                 className={`bi bi-${prize.icon} fs-1 mb-3`}
//                                 style={{ color: prize.color }}
//                             ></i>
//                             <h6
//                                 className="fw-bold mb-2"
//                                 style={{ color: textColor }}
//                             >
//                                 {prize.title}
//                             </h6>
//                             <small style={{ color: labelColor }}>
//                                 {prize.desc}
//                             </small>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Call to Action */}
//             <div
//                 className="text-center mt-5 p-4 rounded-4"
//                 style={{
//                     backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa",
//                     border: `2px dashed ${primary}`,
//                 }}
//             >
//                 <i
//                     className="bi bi-rocket-takeoff fs-1 mb-3"
//                     style={{ color: primary }}
//                 ></i>
//                 <h5 className="fw-bold mb-3" style={{ color: textColor }}>
//                     Ready to climb the ranks? 🚀
//                 </h5>
//                 <button
//                     className="btn fw-bold px-5 py-3 rounded-pill shadow-lg"
//                     style={{
//                         background: gradientBg,
//                         border: "none",
//                         color: "#fff",
//                         fontSize: "1.1rem",
//                     }}
//                     onClick={() => navigate("/dashboard")}
//                 >
//                     Start Hustling Now
//                 </button>
//             </div>
//         </div>
//     );
// }
