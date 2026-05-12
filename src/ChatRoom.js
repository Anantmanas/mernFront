import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
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
  const [onlineCount] = useState(4); // Replace with real presence if available
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const normalizeName = (name) => (name || "").trim().toLowerCase();
  const propUsername = (username || "").trim();

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
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/auth/check-username`, {
        headers: { "x-auth-token": token },
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
    if (!propUsername) {
      fetchUsername();
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [propUsername, fetchMessages]);

  useEffect(() => {
    if (propUsername) {
      setUser(propUsername);
    }
  }, [propUsername]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resolveActiveUser = async () => {
    if (propUsername) return propUsername;
    if (user.trim()) return user.trim();
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/auth/check-username`, {
        headers: { "x-auth-token": token },
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
      await axios.post(
        `${API_BASE_URL}/messages`,
        { user: activeUser, message: trimmedMessage },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("authToken"),
          },
        },
      );
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
      onLogout();
      setTimeout(() => {
        toast("Redirecting...");
        setTimeout(() => {
          toast.success("Logged out successfully!");
          setTimeout(() => navigate("/"), 500);
        }, 1500);
      }, 300);
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
      await axios.delete(
        `${API_BASE_URL}/messages/${encodeURIComponent(id)}`,
        {
          headers: { "x-auth-token": localStorage.getItem("authToken") },
        },
      );
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

  // Initials from username
  const getInitials = (name) => (name ? name.slice(0, 2).toUpperCase() : "??");
  const isImage = (type = "") => type.startsWith("image/");

  // Deterministic avatar color per username
  const avatarColors = [
    "linear-gradient(135deg,#4f8ef7,#7c5cfc)",
    "linear-gradient(135deg,#f85149,#fc8c00)",
    "linear-gradient(135deg,#3fb950,#00d4aa)",
    "linear-gradient(135deg,#e3b341,#f0883e)",
    "linear-gradient(135deg,#bc8cff,#f778ba)",
  ];
  const avatarColor = (name) =>
    avatarColors[(name?.charCodeAt(0) ?? 0) % avatarColors.length];

  return (
    <div className="chat-app">
      <Toaster position="top-center" reverseOrder={false} />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-icon">💬</div>
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
            <div
              className="avatar-sm"
              style={{ background: avatarColor(user) }}
            >
              {getInitials(user)}
            </div>
            <span className="user-name">{user}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Rule Modal ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">🛡️</div>
            <h2>Community guidelines</h2>
            <p>
              Keep it <strong>respectful and constructive</strong>. No hate
              speech, harassment, or abusive language. Violations will result in
              removal from this room.
            </p>
            <button className="close-modal" onClick={() => setShowModal(false)}>
              Understood, let's chat
            </button>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="chat-room">
        <div className="messages-list">
          {messages.map((msg, i) => {
            const mid = getMessageId(msg);
            const isMine = normalizeName(msg.user) === normalizeName(user);
            const showSender =
              !isMine &&
              (i === 0 ||
                normalizeName(messages[i - 1]?.user) !==
                  normalizeName(msg.user));

            return (
              <div
                key={mid || `row-${i}`}
                className={`msg-row ${isMine ? "mine" : "theirs"} ${
                  messageToDelete === mid ? "delete-pin" : ""
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMessageToDelete(messageToDelete === mid ? null : mid);
                }}
              >
                {showSender && <span className="sender-label">{msg.user}</span>}
                <div className="bubble-wrap">
                  {!isMine && (
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
                      style={isMine ? { justifyContent: "flex-end" } : {}}
                    >
                      <time>{formatMessageTime(msg.timestamp)}</time>
                      {(isMine || messageToDelete === mid) && (
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteMessage(mid);
                          }}
                          title="Delete"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {error && <div className="error-msg">{error}</div>}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="input-container">
          <ChatInput
            chatHistory={messages.map((m) => ({
              id: getMessageId(m),
              sender:
                normalizeName(m.user) === normalizeName(user)
                  ? "currentUser"
                  : "other",
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
          <button className="send-btn" onClick={sendMessage} aria-label="Send">
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
