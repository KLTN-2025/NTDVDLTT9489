import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "./changePassword.css";

const ChangePassword = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    type: "", // "success" hoặc "error"
    message: "",
    show: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    // Ẩn thông báo khi người dùng chỉnh sửa form
    if (notification.show) setNotification({ ...notification, show: false });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu hiện tại!";
    if (!formData.newPassword) newErrors.newPassword = "Vui lòng nhập mật khẩu mới!";
    if (!formData.confirmNewPassword)
      newErrors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới!";
    if (formData.newPassword.length < 6)
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự!";
    if (formData.newPassword !== formData.confirmNewPassword)
      newErrors.confirmNewPassword = "Xác nhận mật khẩu không khớp!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.patch("/users/password/change", formData);
      console.log("API Response:", response.data); // Debug
      if (response.data.code === 200) {
        setNotification({
          type: "success",
          message: "Mật khẩu của bạn đã được đổi thành công! Vui lòng đăng nhập lại.",
          show: true,
        });
        toast.success("Đổi mật khẩu thành công!");
        login(user, localStorage.getItem("token"), localStorage.getItem("cartId"));
        setFormData({ password: "", newPassword: "", confirmNewPassword: "" });
        setTimeout(() => setNotification({ ...notification, show: false }), 5000); // Ẩn sau 5 giây
      } else {
        setNotification({
          type: "error",
          message: response.data.message || "Đổi mật khẩu thất bại! Vui lòng thử lại.",
          show: true,
        });
        toast.error(response.data.message || "Đổi mật khẩu thất bại!");
        setTimeout(() => setNotification({ ...notification, show: false }), 5000);
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      const errorMsg =
        error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      setNotification({
        type: "error",
        message: errorMsg,
        show: true,
      });
      toast.error(errorMsg);
      setTimeout(() => setNotification({ ...notification, show: false }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <>
      <Breadcrumbs title="Đổi mật khẩu" pagename="Đổi mật khẩu" />
      <div className="change-password-container">
        <div className="change-password-content">
          <h2 className="change-password-title">Đổi mật khẩu</h2>
          {notification.show && (
            <div className={`notification ${notification.type}`}>
              <span>{notification.message}</span>
              <button className="close-btn" onClick={closeNotification}>
                &times;
              </button>
            </div>
          )}
          <form className="change-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mật khẩu hiện tại:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.confirmNewPassword && (
                <span className="error">{errors.confirmNewPassword}</span>
              )}
            </div>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;