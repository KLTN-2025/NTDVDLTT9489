// src/pages/auth/Login/Login.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import LoginForm from "./LoginForm";
import { useAuth } from "../../../context/AuthContext";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth(); // Lỗi xảy ra ở đây

  useEffect(() => {
    document.title = "Đăng nhập - GoTravel";
    window.scroll(0, 0);

    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLoginSuccess = (token, user) => {
    login(token, user);
    navigate("/dashboard");
  };

  return (
    <>
      <Breadcrumbs title="Đăng nhập" pagename="Đăng nhập" />

      <div className="login-container">
        <div className="login-header">
          <h1>Chào mừng bạn đến với GoTravel</h1>
          <p>Đăng nhập để bắt đầu trải nghiệm ngay hôm nay!</p>
        </div>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>

      <ToastContainer />
    </>
  );
};

export default Login;