// src/pages/Auth/ForgotPassword/ForgotPassword.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuth } from "../../../context/AuthContext";
import "./forgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Quên mật khẩu - GoTravel";
    window.scrollTo(0, 0);

    // Kiểm tra nếu người dùng đã đăng nhập, chuyển hướng đến dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <>
      <Breadcrumbs title="Quên mật khẩu" pagename="Quên mật khẩu" />

      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1>Quên mật khẩu?</h1>
          <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
        </div>
        <ForgotPasswordForm />
      </div>

      <ToastContainer />
    </>
  );
};

export default ForgotPassword;