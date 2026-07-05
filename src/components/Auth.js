import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import API_BASE_URL from "../config";
import { useAuth } from "../contexts/AuthContext";

const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`;

const validateToken = async (token) => {
  await axios.post(`${AUTH_API_BASE_URL}/validate-token`, { token });
  return axios.get(`${AUTH_API_BASE_URL}/check-username`, {
    headers: { "x-auth-token": token },
  });
};

const Auth = () => {
  const { setAuthToken, setCustomUsername } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const toggleForm = () => setIsLogin(!isLogin);

  const completeAuth = useCallback(
    async (token, successMessage) => {
      const response = await validateToken(token);
      const { hasCustomUsername, username } = response.data;

      localStorage.setItem("authToken", token);
      setAuthToken(token);

      if (username) {
        localStorage.setItem("customUsername", username);
        setCustomUsername?.(username);
      } else {
        localStorage.removeItem("customUsername");
        setCustomUsername?.("");
      }

      toast.success(successMessage);
      setTimeout(
        () => navigate(hasCustomUsername ? "/chatroom" : "/greeting", { replace: true }),
        900,
      );
    },
    [navigate, setAuthToken, setCustomUsername],
  );

  const handleTokenValidation = useCallback(async () => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) return;

    toast.loading("Authenticating...", { id: "authToast" });

    try {
      await completeAuth(token, "Logged in successfully");
      toast.dismiss("authToast");
    } catch (err) {
      console.error("Error during authentication:", err);
      toast.dismiss("authToast");
      toast.error("Authentication failed, please try again.");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [completeAuth, navigate]);

  useEffect(() => {
    handleTokenValidation();
  }, [handleTokenValidation]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${AUTH_API_BASE_URL}/${isLogin ? "login" : "signup"}`,
        formData
      );

      await completeAuth(
        res.data.token,
        isLogin ? "Logged in successfully" : "Registered successfully",
      );
    } catch (err) {
      console.error(err.response?.data?.msg || "An error occurred");
      toast.error(
        err.response?.data?.msg || "Invalid credentials. Please try again."
      );
    }
  };

  const handleOAuth = (provider) => {
    toast.loading(`Connecting to ${provider}...`, { id: "oauthLoading" });
    window.location.href = `${AUTH_API_BASE_URL}/${provider}`;
  };

  return (
    <main className="auth-page">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.section
        className="auth-left"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="auth-container"
          layout
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="auth-kicker">Live MERN chat</div>
          <h1>{isLogin ? "Welcome back" : "Create your space"}</h1>
          <p className="auth-copy">
            Jump into a cleaner, faster room with files, smart replies, and a
            fresh conversation flow.
          </p>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.input
                  key="name"
                  type="text"
                  name="name"
                  placeholder="Name"
                  onChange={handleChange}
                  required
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 48, y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                />
              )}
            </AnimatePresence>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <div className="button-container">
              <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn">
                {isLogin ? "Login" : "Sign Up"}
              </motion.button>
              <button type="button" className="btn" onClick={toggleForm}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </button>
            </div>
          </form>
          <div className="button-container">
            <motion.button
              className="google-btn"
              onClick={() => handleOAuth("google")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="google-icon-wrapper">
                <img
                  className="google-icon"
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google Sign-In"
                />
              </div>
              <p className="btn-text">
                <b>Sign in with Google</b>
              </p>
            </motion.button>
            <motion.button
              className="github-btn"
              onClick={() => handleOAuth("github")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                className="github-icon"
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                alt="GitHub Sign-In"
              />
              <span>Continue with GitHub</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.section>
      <motion.section
        className="auth-right"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="brand-container">
          <h1>ChatRoom</h1>
          <p>Fast rooms, useful replies, and a smoother way to stay in sync.</p>
          <img src="../img/MERN-logo.png" alt="MERN Logo" />
        </div>
      </motion.section>
    </main>
  );
};

export default Auth;
