import React, { useState } from "react";
import { useTheme } from "../../hooks/useThemeContext";
import { useAppData } from "../../hooks/AppDataContext";
import { toast } from "react-toastify";

export default function Support() {
  const { theme } = useTheme();
  const { userData, addNotification, recordTaskHistory } = useAppData();

  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const containerBg = isDark ? "#121212" : "#f8f9fa";
  const textColor = isDark ? "#f8f9fa" : "#212529";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";
  const borderColor = isDark ? "#333" : "#dee2e6";
  const primary = "var(--dh-red)";
  const gradientBg = isDark
    ? "linear-gradient(135deg, #640000, #240000)"
    : "linear-gradient(135deg, var(--dh-red), #ff4d4d)";

  const { username = "User" } = userData || {};

  // Tabs
  const tabs = [
    { id: "faq", icon: "question-circle", title: "FAQ" },
    { id: "tickets", icon: "ticket-detailed", title: "Support Tickets" },
    { id: "contact", icon: "telephone", title: "Contact" },
  ];

  // FAQ static data (could come from backend later)
  const faqData = [
    {
      id: 1,
      question: "How do I complete my first task?",
      answer:
        "Go to Dashboard → Pick any task → Tap 'Start' → Follow instructions → Submit proof. Earn instantly!",
      category: "tasks",
    },
    {
      id: 2,
      question: "What's the minimum withdrawal amount?",
      answer:
        "Minimum is ₦1,000. Complete KYC first, then withdraw to bank or mobile money.",
      category: "payments",
    },
    {
      id: 3,
      question: "How do referrals work?",
      answer:
        "Share your link → Friend signs up → Completes a task → You earn ₦500 instantly!",
      category: "referrals",
    },
    {
      id: 4,
      question: "Why can't I withdraw my earnings?",
      answer:
        "You need: 1) KYC Verified ✅ 2) Minimum ₦1,000 balance. Then try again in Wallet.",
      category: "payments",
    },
  ];

  const filteredFAQ = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit support ticket
  const submitTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) {
      toast.error("❌ Please fill subject & message!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ticketId = Date.now().toString().slice(-6);
      addNotification({
        title: "Ticket Submitted!",
        message: `Ticket #${ticketId} created successfully.`,
        type: "success",
        category: "support",
      });
      recordTaskHistory("support", "ticket_created", `Support ticket #${ticketId}`);
      toast.success("✅ Ticket submitted! Expect a reply within 2hrs.");
      setTicketSubject("");
      setTicketMessage("");
      setLoading(false);
    }, 1500);
  };

  // Quick contact buttons
  const quickContact = (method) => {
    switch (method) {
      case "whatsapp":
        recordTaskHistory("support", "contact_whatsapp", "Opened WhatsApp chat");
        window.open("https://wa.me/2348000000000?text=Hi Daily Hustle Team!");
        break;
      case "email":
        recordTaskHistory("support", "contact_email", "Opened support email");
        window.location.href = `mailto:support@dailyhustle.com?subject=Help Needed&body=Hi, I'm ${username}`;
        break;
      default:
        toast.info("Coming soon!");
    }
  };

  // --------------------------- Render Components ----------------------------

  const renderFAQTab = () => (
    <div>
      <div className="mb-4">
        <div
          className="input-group"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: "12px",
          }}
        >
          <span
            className="input-group-text bg-transparent border-0"
            style={{ color: labelColor }}
          >
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: "transparent",
              color: textColor,
            }}
          />
        </div>
      </div>

      {filteredFAQ.map((faq, i) => (
        <div
          key={faq.id}
          className="rounded-4 mb-3 shadow-sm"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            className="p-3 d-flex justify-content-between align-items-center"
            onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-semibold mb-0" style={{ color: textColor }}>
              {faq.question}
            </h6>
            <i
              className={`bi ${
                openFAQ === i ? "bi-chevron-up" : "bi-chevron-down"
              }`}
              style={{ color: labelColor }}
            ></i>
          </div>
          {openFAQ === i && (
            <div
              className="p-3"
              style={{
                backgroundColor: isDark ? "#2a2a2d" : "#f8f9fa",
                borderTop: `1px solid ${borderColor}`,
              }}
            >
              <p className="mb-0" style={{ color: labelColor }}>
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderTicketsTab = () => (
    <div>
      <h6 className="fw-bold mb-3" style={{ color: textColor }}>
        <i className="bi bi-ticket me-2"></i>Submit a Support Ticket
      </h6>
      <form onSubmit={submitTicket}>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ color: textColor }}>
            Subject
          </label>
          <input
            type="text"
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            className="form-control rounded-3 py-2"
            style={{
              backgroundColor: cardBg,
              color: textColor,
              borderColor: borderColor,
            }}
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: textColor }}>
            Message
          </label>
          <textarea
            value={ticketMessage}
            onChange={(e) => setTicketMessage(e.target.value)}
            rows="4"
            className="form-control rounded-3"
            style={{
              backgroundColor: cardBg,
              color: textColor,
              borderColor: borderColor,
            }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn w-100 fw-bold py-3 rounded-pill"
          style={{ background: gradientBg, color: "#fff" }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Submitting...
            </>
          ) : (
            <>
              <i className="bi bi-send me-2"></i>Submit Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderChatTab = () => (
    <div className="text-center py-5">
      <i className="bi bi-chat-dots fs-1 mb-3" style={{ color: primary }}></i>
      <h5 className="fw-bold mb-2" style={{ color: textColor }}>
        Live Chat Coming Soon 🚀
      </h5>
      <button
        className="btn fw-semibold px-4 py-2 rounded-pill text-white"
        style={{ background: gradientBg }}
        onClick={() => {
          addNotification({
            title: "Chat Reminder",
            message: "We’ll notify you once chat launches.",
            type: "info",
            category: "support",
          });
          recordTaskHistory("support", "chat_notify_me", "User requested chat alert");
          toast.info("💬 We’ll notify you soon!");
        }}
      >
        Notify Me
      </button>
    </div>
  );

  const renderContactTab = () => (
    <div className="row g-4">
      {[
        {
          method: "whatsapp",
          icon: "whatsapp",
          title: "WhatsApp",
          desc: "Instant assistance (24/7)",
          color: "#25D366",
        },
        {
          method: "email",
          icon: "envelope",
          title: "Email Support",
          desc: "Reach us anytime",
          color: primary,
        },
      ].map((item, i) => (
        <div className="col-md-6" key={i}>
          <div
            className="p-4 text-center rounded-4 shadow-sm cursor-pointer"
            style={{
              backgroundColor: cardBg,
              border: `2px solid ${item.color}`,
              transition: "0.3s ease",
            }}
            onClick={() => quickContact(item.method)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <i
              className={`bi bi-${item.icon} fs-2 mb-2`}
              style={{ color: item.color }}
            ></i>
            <h6 className="fw-bold mb-1" style={{ color: textColor }}>
              {item.title}
            </h6>
            <small style={{ color: labelColor }}>{item.desc}</small>
          </div>
        </div>
      ))}
    </div>
  );

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
            💬 Support Center
          </h1>
          <p style={{ color: labelColor, margin: 0 }}>
            We're always here to help, {username}!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 d-flex justify-content-center flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn rounded-pill px-4 fw-bold ${
              activeTab === tab.id ? "shadow text-white" : ""
            }`}
            style={{
              backgroundColor:
                activeTab === tab.id ? primary : "transparent",
              color: activeTab === tab.id ? "#fff" : textColor,
              border: `1px solid ${activeTab === tab.id ? primary : borderColor}`,
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi bi-${tab.icon} me-2`}></i>
            {tab.title}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="rounded-4 p-4 shadow-sm" style={{ backgroundColor: cardBg }}>
        {activeTab === "faq" && renderFAQTab()}
        {activeTab === "tickets" && renderTicketsTab()}
        {activeTab === "contact" && renderContactTab()}
      </div>
    </div>
  );
}
