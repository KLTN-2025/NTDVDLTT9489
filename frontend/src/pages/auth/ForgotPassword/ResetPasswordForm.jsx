import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword, verifyOtp, resetPassword } from "../../../services/authService";
import "./resetPassword.css";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(null); // Lưu token trong state thay vì localStorage
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null); // Thời gian hết hạn OTP
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy email từ query parameter
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
      // Thiết lập thời gian hết hạn OTP (180 giây) để đồng bộ với frontend
      const expiryTime = new Date().getTime() + 180000; // 180 giây = 3 phút
      setOtpExpiry(expiryTime);
    } else {
      toast.error("Không tìm thấy email. Vui lòng quay lại trang quên mật khẩu!");
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  // Đếm ngược thời gian hết hạn OTP
  useEffect(() => {
    if (!otpExpiry) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (now >= otpExpiry) {
        setOtpExpiry(null);
        toast.warn("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới!");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  const validateField = (field, value) => {
    let newErrors = { ...errors };
    if (field === "otp") {
      if (!value.trim()) newErrors.otp = "OTP không được để trống";
      else if (value.length !== 6) newErrors.otp = "OTP phải có 6 chữ số";
      else if (!/^\d{6}$/.test(value)) newErrors.otp = "OTP chỉ được chứa số";
      else delete newErrors.otp;
    }
    if (field === "password") {
      if (!value.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (value.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      else delete newErrors.password;
    }
    if (field === "confirmPassword") {
      if (!value.trim()) newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống";
      else if (value !== password) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      else delete newErrors.confirmPassword;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setTouched({ ...touched, [field]: true });
    if (field === "otp") setOtp(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    validateField(field, value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP không được để trống";
    else if (otp.length !== 6) newErrors.otp = "OTP phải có 6 chữ số";
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = "OTP chỉ được chứa số";
    if (token) {
      if (!password.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      if (!confirmPassword.trim()) newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống";
      else if (confirmPassword !== password) newErrors.confirmPassword = "Mật khẩu không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    toast.error("Vui lòng kiểm tra lại thông tin!");
    return;
  }

  // Kiểm tra nếu OTP đã hết hạn
  if (otpExpiry && new Date().getTime() >= otpExpiry) {
    toast.error("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới!");
    return;
  }

  setLoading(true);

  try {
    if (!token) {
      const otpResult = await verifyOtp(email, otp);
      toast.success(otpResult.message || "Xác thực OTP thành công!");
      setToken(otpResult.token);
    } else {
      const resetResult = await resetPassword(token, password);
      toast.success(resetResult.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2000);
    }
  } catch (error) {
    const errorMessage = typeof error.message === "string" ? error.message : error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
    toast.error(errorMessage);
    if (typeof error.message === "string" && error.message.includes("Mã OTP không đúng")) {
      toast.warn("Mã OTP không đúng. Vui lòng kiểm tra lại hoặc gửi lại mã mới!");
    }
    if (typeof error.message === "string" && error.message.includes("Token không hợp lệ")) {
      setToken(null);
      navigate("/forgot-password");
    }
  } finally {
    setLoading(false);
  }
};

  const handleResendOtp = async () => {
    if (otpExpiry && new Date().getTime() < otpExpiry) {
      const remainingSeconds = Math.floor((otpExpiry - new Date().getTime()) / 1000);
      toast.info(`Vui lòng chờ ${remainingSeconds} giây trước khi gửi lại OTP!`);
      return;
    }

    setResendLoading(true);
    try {
      const result = await forgotPassword(email);
      toast.success(result.message || "Đã gửi lại mã OTP qua email!");
      // Cập nhật thời gian hết hạn mới
      const expiryTime = new Date().getTime() + 180000; // 180 giây = 3 phút
      setOtpExpiry(expiryTime);
      setOtp(""); // Xóa OTP cũ
      setTouched({ ...touched, otp: false });
      setErrors({ ...errors, otp: null });
    } catch (error) {
      const errorMessage = error.message || "Gửi lại OTP thất bại!";
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Tính thời gian còn lại của OTP
  const getRemainingTime = () => {
    if (!otpExpiry) return "Hết hạn";
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((otpExpiry - now) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <form onSubmit={handleSubmit} className="reset-password-form">
      <div className={`input-group ${errors.email ? "input-error" : ""}`}>
        <label>Email:</label>
        <input type="email" value={email} disabled={true} />
      </div>

      <div className={`input-group ${errors.otp ? "input-error" : ""}`}>
        <label>
          Mã OTP: {otpExpiry && (
            <span className="otp-timer">
              (Hết hạn sau: {getRemainingTime()})
            </span>
          )}
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => handleInputChange("otp", e.target.value)}
          onBlur={() => setTouched({ ...touched, otp: true })}
          placeholder="Nhập mã OTP 6 chữ số"
          disabled={loading || token}
        />
        <div className="error-container">
          {touched.otp && errors.otp && (
            <p className="error-message">{errors.otp}</p>
          )}
        </div>
      </div>

      <div className="resend-otp">
        <p onClick={handleResendOtp} disabled={resendLoading}>
          {resendLoading ? (
            <span>
              <i className="bi bi-arrow-repeat spinning me-2"></i>
              Đang gửi...
            </span>
          ) : (
            "Gửi lại OTP"
          )}
        </p>
      </div>

      {token && (
        <>
          <div className={`input-group ${errors.password ? "input-error" : ""}`}>
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
            <div className="error-container">
              {touched.password && errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>
          </div>

          <div className={`input-group ${errors.confirmPassword ? "input-error" : ""}`}>
            <label>Xác nhận mật khẩu:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              placeholder="Xác nhận mật khẩu mới"
              disabled={loading}
            />
            <div className="error-container">
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        className="reset-password-button"
        disabled={loading}
      >
        {loading ? (
          <span>
            <i className="bi bi-arrow-repeat spinning me-2"></i>
            Đang xử lý...
          </span>
        ) : token ? (
          "Đặt lại mật khẩu"
        ) : (
          "Xác thực OTP"
        )}
      </button>

      <div className="reset-password-links">
        <p onClick={() => navigate("/login")}>
          Quay lại <span>Đăng nhập</span>
        </p>
      </div>
    </form>
  );
};

export default ResetPasswordForm;