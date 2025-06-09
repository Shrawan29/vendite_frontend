// src/wrappers/LoginWrapper.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";

export default function LoginWrapper() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate("/"); // Redirect to homepage or dashboard
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
