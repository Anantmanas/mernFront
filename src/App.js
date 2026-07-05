import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import Greeting from "./components/Greetings";
import ChatRoom from "./ChatRoom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const PrivateRoute = ({ element }) => {
  const { authToken } = useAuth();
  return authToken ? element : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { authToken, authReady } = useAuth();

  if (!authReady) return null;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            authToken ? (
              <Navigate to="/chatroom" replace />
            ) : (
              <Auth />
            )
          }
        />
        <Route
          path="/auth/success"
          element={<Auth />}
        />
        <Route
          path="/greeting"
          element={<PrivateRoute element={<Greeting />} />}
        />
        <Route
          path="/chatroom"
          element={<PrivateRoute element={<ChatRoom />} />}
        />
        <Route path="*" element={<Navigate to={authToken ? "/chatroom" : "/"} replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
