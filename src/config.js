const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://mernback-lsed.onrender.com" ||
      "https://back-wandering-island-6529.fly.dev");

export default API_BASE_URL;
