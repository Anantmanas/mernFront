import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Greeting.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import API_BASE_URL from "../config";

const Greeting = ({ setCustomUsername, authToken }) => {
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
      <Toaster position="top-center" reverseOrder={false} />
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
