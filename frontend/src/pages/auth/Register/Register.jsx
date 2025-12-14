// src/pages/Auth/Register/Register.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import RegisterForm from "./RegisterForm";
import { useAuth } from "../../../context/AuthContext";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Đăng ký - GoTravel";
    window.scrollTo(0, 0);

    // Kiểm tra nếu người dùng đã đăng nhập, chuyển hướng đến dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <>
      <Breadcrumbs title="Đăng ký" pagename="Đăng ký" />

      <div className="register-container">
        <div className="register-header">
          <h1>Chào mừng bạn đến với GoTravel</h1>
          <p>Tạo tài khoản để bắt đầu hành trình của bạn ngay hôm nay!</p>
        </div>
        <RegisterForm />
      </div>

      <ToastContainer />
    </>
  );
};

export default Register;