import React, { useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const ChatInput = ({ chatHistory, value, onChange, onKeyPress }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedId = useRef(null);

  const fetchSuggestions = async () => {
    if (chatHistory.length === 0) return;

    const lastMsg = chatHistory[chatHistory.length - 1];

    // Only fetch when the other person sent the last message
    if (lastMsg.sender === "currentUser") return;

    // Don't re-fetch for the same message if we already have suggestions
    if (lastFetchedId.current === lastMsg.id && suggestions.length > 0) return;

    setLoading(true);
    setSuggestions([]); // Clear stale suggestions immediately

    try {
      const lastMessages = chatHistory.slice(-3).map((m) => ({
        role: m.sender === "currentUser" ? "user" : "assistant",
        content: m.text,
      }));

      const response = await axios.post(`${API_BASE_URL}/api/get-suggestions`, {
        messages: lastMessages,
      });

      const incoming = response.data?.suggestions;
      setSuggestions(Array.isArray(incoming) ? incoming : []);
      lastFetchedId.current = lastMsg.id; // ✅ Set AFTER success only
    } catch (err) {
      console.error("Suggestions error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    fetchSuggestions();
  };

  const handleSuggestionClick = (text) => {
    onChange(text);
    setSuggestions([]);
  };

  return (
    <div className="chat-input-wrapper">
      {/* Suggestion pills */}
      {(loading || suggestions.length > 0) && (
        <div className="suggestion-bar">
          <span className="sugg-label">AI ✦</span>
          {loading ? (
            <>
              <div className="pill pill--loading">thinking...</div>
              <div
                className="pill pill--loading"
                style={{ animationDelay: ".2s" }}
              >
                · · ·
              </div>
              <div
                className="pill pill--loading"
                style={{ animationDelay: ".4s" }}
              >
                analyzing
              </div>
            </>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={i}
                className="pill"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </button>
            ))
          )}
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onKeyPress={onKeyPress}
        placeholder="Message the room…"
        className="chat-input"
        autoComplete="off"
      />
    </div>
  );
};

export default ChatInput;
