// src/pages/Auth/ForgotPassword/ForgotPasswordForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../../../services/authService";
import "./forgotPassword.css";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateField = (field, value) => {
    let newErrors = { ...errors };
    if (field === "email") {
      if (!value.trim()) newErrors.email = "Email không được để trống";
      else if (!isValidEmail(value)) newErrors.email = "Email không hợp lệ";
      else delete newErrors.email;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setTouched({ ...touched, [field]: true });
    setEmail(value);
    validateField(field, value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email không được để trống";
    else if (!isValidEmail(email)) newErrors.email = "Email không hợp lệ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại email!");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      toast.success(result.message || "Đã gửi mã OTP qua email! Vui lòng kiểm tra hộp thư.");
      // Chuyển hướng sang trang ResetPasswordForm với email
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
    } catch (error) {
      const errorMessage = error.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <div className={`input-group ${errors.email ? "input-error" : ""}`}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          onBlur={() => setTouched({ ...touched, email: true })}
          placeholder="Nhập email của bạn"
          disabled={loading}
        />
        <div className="error-container">
          {touched.email && errors.email && (
            <p className="error-message">{errors.email}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="forgot-password-button"
        disabled={loading}
      >
        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>

      <div className="forgot-password-links">
        <p onClick={() => navigate("/login")}>
          Quay lại <span>Đăng nhập</span>
        </p>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;