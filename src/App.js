import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import Greeting from "./components/Greetings";
import ChatRoom from "./ChatRoom";

const PrivateRoute = ({ element, authToken }) => {
  return authToken ? element : <Navigate to="/" replace />;
};

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [customUsername, setCustomUsername] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("customUsername");
    if (storedToken) {
      setAuthToken(storedToken);
    }
    if (storedUsername) {
      setCustomUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("customUsername");
      setAuthToken(null);
      setCustomUsername("");
    }, 2000);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            authToken ? (
              <Navigate to="/chatroom" replace />
            ) : (
              <Auth setAuthToken={setAuthToken} />
            )
          }
        />
        <Route
          path="/auth/success"
          element={<Auth setAuthToken={setAuthToken} />}
        />
        <Route
          path="/greeting"
          element={
            <PrivateRoute
              element={
                <Greeting
                  setCustomUsername={setCustomUsername}
                  authToken={authToken}
                />
              }
              authToken={authToken}
            />
          }
        />
        <Route
          path="/chatroom"
          element={
            <PrivateRoute
              element={
                <ChatRoom username={customUsername} onLogout={handleLogout} />
              }
              authToken={authToken}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
