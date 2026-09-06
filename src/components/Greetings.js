import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Greeting.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import API_BASE_URL from "../config";
import { useAuth } from "../contexts/AuthContext";

const Greeting = () => {
  const { setCustomUsername, authToken } = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);
        setName(decodedToken.name || "User");
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/");
      }
    }
  }, [authToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/set-username`,
        { username: username.trim() },
        {
          headers: {
            "x-auth-token": authToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.customUsername) {
        setCustomUsername(res.data.customUsername);
        localStorage.setItem("customUsername", res.data.customUsername);
        toast.success("Great choice");
        setTimeout(() => navigate("/chatroom", { replace: true }), 900);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
          "An error occurred while setting the username.",
      );
    }
  };

  return (
    <motion.main
      className="greeting-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgba(16,20,42,0.92)",
            backdropFilter: "blur(20px)",
            color: "#E8EDFF",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            fontFamily: "'Manrope', sans-serif",
            fontSize: "13.5px",
            fontWeight: "500",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          },
          success: {
            iconTheme: { primary: "#34D399", secondary: "transparent" },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "transparent" },
          },
        }}
      />
      <div className="greeting-card">
        <span className="greeting-kicker">One last step</span>
        <h1>Hey {name}</h1>
        <p>Pick the display name people will see in the chat room.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <motion.button
            className="send-btn"
            type="submit"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Set Username
          </motion.button>
        </form>
      </div>
    </motion.main>
  );
};

export default Greeting;
