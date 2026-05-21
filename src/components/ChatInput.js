import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import API_BASE_URL from "../config";

const ChatInput = ({ chatHistory, value, onChange, onKeyDown }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedId = useRef(null);
  const inputRef = useRef(null);

  const fetchSuggestions = async () => {
    if (chatHistory.length === 0) {
      setSuggestions([]);
      return;
    }

    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.sender === "currentUser") {
      setSuggestions([]);
      return;
    }

    if (lastFetchedId.current === lastMsg.id && suggestions.length > 0) return;

    setLoading(true);
    setSuggestions([]);

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
      lastFetchedId.current = lastMsg.id;
    } catch (err) {
      console.error("Suggestions error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    onChange(text);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (chatHistory.length === 0) {
      setSuggestions([]);
      return;
    }

    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.sender === "currentUser") {
      setSuggestions([]);
      return;
    }

    void fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory.length, chatHistory[chatHistory.length - 1]?.id]);

  return (
    <div className="chat-input-wrapper">
      <AnimatePresence>
        {(loading || suggestions.length > 0) && (
          <motion.div
            className="suggestion-bar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <span className="sugg-label">AI</span>
            {loading ? (
              <>
                <div className="pill pill--loading">thinking...</div>
                <div
                  className="pill pill--loading"
                  style={{ animationDelay: ".2s" }}
                >
                  ...
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
                <motion.button
                  key={`${s}-${i}`}
                  className="pill"
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {s}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={fetchSuggestions}
        onKeyDown={onKeyDown}
        placeholder="Message the room..."
        className="chat-input"
        autoComplete="off"
      />
    </div>
  );
};

export default ChatInput;
