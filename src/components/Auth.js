import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Auth.css";
import "../styles/auth.css";
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
        () =>
          navigate(hasCustomUsername ? "/chatroom" : "/greeting", {
            replace: true,
          }),
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
        formData,
      );

      await completeAuth(
        res.data.token,
        isLogin ? "Logged in successfully" : "Registered successfully",
      );
    } catch (err) {
      console.error(err.response?.data?.msg || "An error occurred");
      toast.error(
        err.response?.data?.msg || "Invalid credentials. Please try again.",
      );
    }
  };

  const handleOAuth = (provider) => {
    toast.loading(`Connecting to ${provider}...`, { id: "oauthLoading" });
    window.location.href = `${AUTH_API_BASE_URL}/${provider}`;
  };

  return (
    <main className="auth-root">
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

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-logo">
          Chat<span>Room</span>
        </div>
        <div className="auth-sub">
          {isLogin ? "Welcome back" : "Create your space"}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">
                  Name
                </label>
                <motion.input
                  key="name"
                  id="auth-name"
                  className="auth-input"
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
              </div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="auth-input"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="auth-btn"
          >
            {isLogin ? "Login" : "Sign Up"}
          </motion.button>

          <button
            type="button"
            className="auth-secondary-btn"
            onClick={toggleForm}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <div className="button-container">
          <motion.button
            className="auth-google-btn"
            onClick={() => handleOAuth("google")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              className="google-icon"
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google Sign-In"
              style={{ width: 18, height: 18 }}
            />
            <span>Sign in with Google</span>
          </motion.button>

          <motion.button
            className="auth-google-btn"
            onClick={() => handleOAuth("github")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: "10px" }}
          >
            <img
              className="github-icon"
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub Sign-In"
              style={{
                width: 18,
                height: 18,
                filter: "brightness(0) invert(1)",
              }}
            />
            <span>Continue with GitHub</span>
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
};

export default Auth;
