import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [customUsername, setCustomUsername] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customUsername");
    setAuthToken(null);
    setCustomUsername("");
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("customUsername");

    const initAuth = async () => {
      if (storedToken) {
        try {
          await axios.post(`${API_BASE_URL}/auth/validate-token`, {
            token: storedToken,
          });
          setAuthToken(storedToken);
          if (storedUsername) {
            setCustomUsername(storedUsername);
          }
        } catch (err) {
          console.error("Token validation failed:", err);
          handleLogout();
        }
      }
      setAuthReady(true);
    };

    initAuth();

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [handleLogout]);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, customUsername, setCustomUsername, authReady, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
