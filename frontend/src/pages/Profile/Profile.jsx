import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "./profile.css";

const Profile = () => {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    type: "", // "success" hoặc "error"
    message: "",
    show: false,
  });

  useEffect(() => {
    document.title = "Hồ sơ - GoTravel";
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") return; // Ngăn chặn thay đổi email
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    if (notification.show) {
      console.log("Ẩn thông báo do thay đổi form");
      setNotification({ type: "", message: "", show: false });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (giới hạn 3MB)
      if (file.size > 3 * 1024 * 1024) {
        console.log("Hiển thị thông báo lỗi: Ảnh quá lớn");
        setNotification({
          type: "error",
          message: "Ảnh đại diện không được vượt quá 3MB!",
          show: true,
        });
        toast.error("Ảnh đại diện không được vượt quá 3MB!");
        setTimeout(() => {
          console.log("Ẩn thông báo sau 5 giây");
          setNotification((prev) => ({ ...prev, show: false }));
        }, 5000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Họ tên không được để trống!";
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Kiểm tra kích thước chuỗi base64 của avatar (giới hạn khoảng 2.5MB)
    if (formData.avatar && formData.avatar.length > 2.5 * 1024 * 1024) {
      console.log("Hiển thị thông báo lỗi: Dữ liệu ảnh quá lớn");
      setNotification({
        type: "error",
        message: "Dữ liệu ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn.",
        show: true,
      });
      toast.error("Dữ liệu ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn.");
      setLoading(false);
      setTimeout(() => {
        console.log("Ẩn thông báo sau 5 giây");
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
      return;
    }

    // Loại bỏ email khỏi dữ liệu gửi lên để đồng bộ với backend
    const { email, ...dataToSend } = formData;
    console.log("Dữ liệu gửi lên API (sau khi loại bỏ email):", dataToSend); // Debug

    // Xác minh rằng email không tồn tại trong dataToSend
    if (dataToSend.hasOwnProperty("email")) {
      console.error("Lỗi: Email vẫn tồn tại trong dữ liệu gửi lên:", dataToSend);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại!",
        show: true,
      });
      toast.error("Đã xảy ra lỗi hệ thống. Vui lòng thử lại!");
      setLoading(false);
      setTimeout(() => {
        console.log("Ẩn thông báo sau 5 giây");
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
      return;
    }

    try {
      const response = await api.patch("/users/edit", dataToSend);
      console.log("API Response:", response.data); // Debug
      if (response.data.code === 200) {
        console.log("Hiển thị thông báo thành công");
        const updatedUser = response.data.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        login(updatedUser, localStorage.getItem("token"), localStorage.getItem("cartId"));
        setNotification({
          type: "success",
          message: "Cập nhật hồ sơ thành công!",
          show: true,
        });
        toast.success("Cập nhật hồ sơ thành công!");
        setEditMode(false);
      } else {
        console.log("Hiển thị thông báo lỗi từ API");
        setNotification({
          type: "error",
          message: response.data.message || "Cập nhật hồ sơ thất bại!",
          show: true,
        });
        toast.error(response.data.message || "Cập nhật hồ sơ thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error.response?.data || error);
      const errorMsg =
        error.response?.status === 413
          ? "Dữ liệu gửi lên quá lớn! Vui lòng chọn ảnh nhỏ hơn."
          : error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      console.log("Hiển thị thông báo lỗi từ catch:", errorMsg);
      setNotification({
        type: "error",
        message: errorMsg,
        show: true,
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setTimeout(() => {
        console.log("Ẩn thông báo sau 5 giây");
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const closeNotification = () => {
    console.log("Người dùng đóng thông báo thủ công");
    setNotification({ type: "", message: "", show: false });
  };

  return (
    <>
      <Breadcrumbs title="Hồ sơ cá nhân" pagename="Hồ sơ" />
      <div className="profile-container">
        <div className="profile-content">
          {notification.show && (
            <div className={`notification ${notification.type}`}>
              <span>{notification.message}</span>
              <button className="close-btn" onClick={closeNotification}>
                ×
              </button>
            </div>
          )}
          {!editMode ? (
            <div className="profile-view">
              <img
                src={
                  formData.avatar ||
                  "https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/Hinh-dai-dien-hai-huoc-cam-dep-duoi-ai-do.jpg?1704789789335"
                }
                alt="Avatar"
                className="profile-avatar"
              />
              <div className="profile-info">
                <p>
                  <strong>Họ tên:</strong> {formData.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {formData.phone || "Chưa cập nhật"}
                </p>
                <p>
                  <strong>Ngày tham gia:</strong>{" "}
                  {new Date(user?.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Chỉnh sửa
              </button>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true} // Vô hiệu hóa chỉnh sửa email
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Ảnh đại diện (tối đa 3MB):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
                {formData.avatar && (
                  <img src={formData.avatar} alt="Preview" className="avatar-preview" />
                )}
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;