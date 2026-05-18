import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import API_BASE_URL from "./config";
import ChatInput from "./components/ChatInput";
import FileUpload from "./components/FileUpload";

const ChatRoom = ({ username, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [onlineCount] = useState(4);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const normalizeName = (name) => (name || "").trim().toLowerCase();
  const propUsername = (username || "").trim();
  const token = localStorage.getItem("authToken");
  const currentUserId = (() => {
    try {
      return token ? String(jwtDecode(token)?.userId || "") : "";
    } catch {
      return "";
    }
  })();

  const getMessageId = (msg) =>
    msg == null ? "" : String(msg._id ?? msg.id ?? "").trim();

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchUsername = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/check-username`, {
        headers: { "x-auth-token": localStorage.getItem("authToken") },
      });
      if (response.data.username) setUser(response.data.username);
    } catch (err) {
      console.error("Error fetching username:", err);
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`);
      const list = Array.isArray(response.data) ? response.data : [];
      const orderedMessages = [...list].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return String(getMessageId(a)).localeCompare(String(getMessageId(b)));
      });
      setMessages(orderedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  useEffect(() => {
    if (messageToDelete == null) return undefined;
    const onDoc = (e) => {
      if (e.target.closest?.(".delete-btn")) return;
      setMessageToDelete(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [messageToDelete]);

  useEffect(() => {
    if (!propUsername) fetchUsername();
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [propUsername, fetchMessages]);

  useEffect(() => {
    if (propUsername) setUser(propUsername);
  }, [propUsername]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resolveActiveUser = async () => {
    if (propUsername) return propUsername;
    if (user.trim()) return user.trim();
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/check-username`, {
        headers: { "x-auth-token": localStorage.getItem("authToken") },
      });
      const fetchedUser = response?.data?.username?.trim();
      if (fetchedUser) {
        setUser(fetchedUser);
        return fetchedUser;
      }
    } catch (err) {
      console.error("Error resolving username:", err);
    }
    return "";
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Say something first!");
      setTimeout(() => setError(""), 2500);
      return;
    }
    try {
      const activeUser = await resolveActiveUser();
      if (!activeUser) {
        setError("Username unavailable. Refresh and try again.");
        return;
      }
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        { user: activeUser, message: trimmedMessage },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("authToken"),
          },
        },
      );
      setMessages((prev) => [...prev, response.data]);
      setMessage("");
      setError("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Could not send message. Try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      localStorage.removeItem("authToken");
      localStorage.removeItem("customUsername");
      onLogout();
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/", { replace: true }), 500);
    } catch {
      toast.error("Error logging out. Please try again.");
    }
  };

  const handleDeleteMessage = async (rawId) => {
    const id = rawId != null ? String(rawId).trim() : "";
    if (!id) {
      toast.error("Could not delete this message.");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/messages/${encodeURIComponent(id)}`, {
        headers: { "x-auth-token": localStorage.getItem("authToken") },
      });
      setMessages((prev) => prev.filter((msg) => getMessageId(msg) !== id));
      toast.success("Message deleted");
      fetchMessages();
      setMessageToDelete(null);
    } catch (err) {
      console.error("Error deleting message:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.msg ||
        "Could not delete message.";
      toast.error(msg);
    }
  };

  const getInitials = (name) => (name ? name.slice(0, 2).toUpperCase() : "??");
  const isImage = (type = "") => type.startsWith("image/");
  const isMine = (msg) =>
    (currentUserId && String(msg.senderId || "") === currentUserId) ||
    normalizeName(msg.user) === normalizeName(user);

  const avatarColors = [
    "linear-gradient(135deg,#2563eb,#14b8a6)",
    "linear-gradient(135deg,#f97316,#ef4444)",
    "linear-gradient(135deg,#16a34a,#0ea5e9)",
    "linear-gradient(135deg,#ca8a04,#db2777)",
    "linear-gradient(135deg,#7c3aed,#06b6d4)",
  ];
  const avatarColor = (name) =>
    avatarColors[(name?.charCodeAt(0) ?? 0) % avatarColors.length];

  return (
    <div className="chat-app">
      <Toaster position="top-center" reverseOrder={false} />

      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="nav-left">
          <div className="nav-icon">CR</div>
          <div>
            <div className="nav-title">Chat room</div>
            <div className="nav-sub">
              <span className="online-dot" />
              {onlineCount} online
            </div>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-chip">
            <div className="avatar-sm" style={{ background: avatarColor(user) }}>
              {getInitials(user)}
            </div>
            <span className="user-name">{user || "You"}</span>
          </div>
          <motion.button
            className="logout-button"
            onClick={handleLogout}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            Sign out
          </motion.button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="modal-icon">!</div>
              <h2>Community guidelines</h2>
              <p>
                Keep it <strong>respectful and constructive</strong>. No hate
                speech, harassment, or abusive language. Violations will result
                in removal from this room.
              </p>
              <motion.button
                className="close-modal"
                onClick={() => setShowModal(false)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Understood, let's chat
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-room">
        <div className="messages-list">
          {messages.map((msg, i) => {
            const mid = getMessageId(msg);
            const mine = isMine(msg);
            const showSender =
              !mine &&
              (i === 0 ||
                normalizeName(messages[i - 1]?.user) !== normalizeName(msg.user));

            return (
              <motion.div
                key={mid || `row-${i}`}
                className={`msg-row ${mine ? "mine" : "theirs"} ${
                  messageToDelete === mid ? "delete-pin" : ""
                }`}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMessageToDelete(messageToDelete === mid ? null : mid);
                }}
              >
                {showSender && <span className="sender-label">{msg.user}</span>}
                <div className="bubble-wrap">
                  {!mine && (
                    <div
                      className="avatar-sm message-avatar"
                      style={{ background: avatarColor(msg.user) }}
                    >
                      {getInitials(msg.user)}
                    </div>
                  )}
                  <div>
                    <div className="bubble">
                      {msg.message}
                      {msg.fileUrl && (
                        <div className="attachment-wrap">
                          {isImage(msg.fileType) ? (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="attachment-link"
                            >
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName || "uploaded file"}
                                className="chat-image"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="attachment-link"
                            >
                              {msg.fileName || "Open attachment"}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className="msg-meta"
                      style={mine ? { justifyContent: "flex-end" } : {}}
                    >
                      <time>{formatMessageTime(msg.timestamp)}</time>
                      {(mine || messageToDelete === mid) && (
                        <motion.button
                          type="button"
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteMessage(mid);
                          }}
                          title="Delete"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          x
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {error && <div className="error-msg">{error}</div>}
          <div ref={bottomRef} />
        </div>

        <motion.div
          className="input-container"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <ChatInput
            chatHistory={messages.map((m) => ({
              id: getMessageId(m),
              sender: isMine(m) ? "currentUser" : "other",
              text: m.message,
            }))}
            value={message}
            onChange={setMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <FileUpload
            onUploadSuccess={() => {
              setError("");
              fetchMessages();
            }}
            onError={(uploadError) => setError(uploadError)}
          />
          <motion.button
            className="send-btn"
            onClick={sendMessage}
            aria-label="Send"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatRoom;
