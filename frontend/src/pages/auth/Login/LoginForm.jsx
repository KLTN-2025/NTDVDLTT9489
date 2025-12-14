import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login as loginService } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";
import "./login.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
    if (field === "password") {
      if (!value.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (value.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      else delete newErrors.password;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setTouched({ ...touched, [field]: true });
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    validateField(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    validateField("email", email);
    validateField("password", password);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setLoading(true);
    try {
      const result = await loginService({ email, password });
      console.log("Login result:", result);
      if (result.success && result.code === 200) {
        login(result.user, result.token, result.cartId);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
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
          {touched.email && errors.email && <p className="error-message">{errors.email}</p>}
        </div>
      </div>

      <div className={`input-group ${errors.password ? "input-error" : ""}`}>
        <label>Mật khẩu:</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onBlur={() => setTouched({ ...touched, password: true })}
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
            disabled={loading}
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>
        <div className="error-container">
          {touched.password && errors.password && <p className="error-message">{errors.password}</p>}
        </div>
      </div>

      <button type="submit" className="login-button" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="login-links">
        <p onClick={() => navigate("/forgot-password")}>Quên mật khẩu?</p>
        <p onClick={() => navigate("/register")}>
          Chưa có tài khoản? <span>Đăng ký</span>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;