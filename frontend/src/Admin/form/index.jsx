import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  useTheme,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from "@mui/material";
import { tokens } from "../../theme";
import { useAdminAuth } from "../../context/AdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAdminInfo, updateAdminInfo, getAdminByEmail } from "./FormApi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Form = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const [adminInfo, setAdminInfo] = useState({
    _id: "",
    fullName: "",
    email: "",
    phone: "",
    avatar: "../../assets/user.png",
  });
  const [newAvatar, setNewAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      let storedAdminInfo = {};
      try {
        storedAdminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
        console.log("Form: Stored adminInfo:", JSON.stringify(storedAdminInfo, null, 2));
      } catch (e) {
        console.error("Form: Invalid adminInfo in localStorage:", e);
        localStorage.removeItem("adminInfo");
        storedAdminInfo = {};
      }

      if (!adminToken) {
        console.log("Form: No adminToken found");
        toast.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/loginadmin";
        }, 2000);
        return;
      }

      const initialInfo = {
        _id: storedAdminInfo._id || "",
        fullName: storedAdminInfo.fullName || "",
        email: storedAdminInfo.email || "",
        phone: storedAdminInfo.phone || "",
        avatar: storedAdminInfo.avatar || "../../assets/user.png",
      };
      setAdminInfo(initialInfo);

      setLoading(true);
      try {
        let response;
        if (storedAdminInfo._id) {
          console.log("Form: Fetching admin info with ID:", storedAdminInfo._id);
          response = await getAdminInfo(storedAdminInfo._id);
        } else if (storedAdminInfo.email) {
          console.log("Form: No admin ID, fetching by email:", storedAdminInfo.email);
          response = await getAdminByEmail(storedAdminInfo.email);
        } else {
          console.log("Form: No admin ID or email, using stored info");
          setIsEditable(false);
          toast.warn("Không tìm thấy thông tin tài khoản. Vui lòng cập nhật thông tin.", {
            position: "top-right",
          });
          return;
        }

        console.log("Form: Fetch admin info response:", JSON.stringify(response, null, 2));
        if (response.code === 200 && response.data) {
          const data = response.data;
          const updatedInfo = {
            _id: data._id || storedAdminInfo._id,
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar || "../../assets/user.png",
          };
          setAdminInfo(updatedInfo);
          setIsEditable(true);
          localStorage.setItem("adminInfo", JSON.stringify(updatedInfo));
        } else {
          toast.error(response.message || "Không thể tải thông tin tài khoản!", {
            position: "top-right",
          });
          setIsEditable(false);
        }
      } catch (err) {
        console.error("Form: Error fetching admin info:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        const errorMessage = err.response?.data?.message || err.message || "Không thể tải thông tin tài khoản!";
        toast.warn(errorMessage, { position: "top-right" });

        if (err.response?.status === 401) {
          console.log("Form: Unauthorized error, redirecting to /loginadmin");
          toast.error("Phiên đăng nhập không hợp lệ! Vui lòng đăng nhập lại.", {
            position: "top-right",
          });
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          setTimeout(() => {
            window.location.href = "/loginadmin";
          }, 2000);
        } else {
          console.log("Form: Using stored info due to API error");
          setIsEditable(false);
          setAdminInfo(initialInfo); // Dùng thông tin từ localStorage
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, [adminToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else {
      setAdminInfo({ ...adminInfo, [name]: value });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File ảnh không được lớn hơn 5MB!", {
          position: "top-right",
        });
        return;
      }
      console.log("Form: Selected file:", file);
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminInfo({ ...adminInfo, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSave = async () => {
    if (!adminInfo._id) {
      console.log("Form: No admin ID for update");
      toast.error("Không tìm thấy ID tài khoản! Vui lòng đăng nhập lại.", {
        position: "top-right",
      });
      return;
    }

    const storedAdminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
    const hasChanges =
      newAvatar ||
      adminInfo.fullName !== (storedAdminInfo.fullName || "") ||
      adminInfo.email !== (storedAdminInfo.email || "") ||
      adminInfo.phone !== (storedAdminInfo.phone || "") ||
      password !== "";

    if (!hasChanges) {
      toast.info("Không có thay đổi để lưu!", { position: "top-right" });
      return;
    }

    if (!isEditable) {
      toast.error("Không thể cập nhật do thiếu thông tin tài khoản!", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (newAvatar) {
        formData.append("avatar", newAvatar);
      }
      formData.append("fullName", adminInfo.fullName);
      formData.append("email", adminInfo.email);
      formData.append("phone", adminInfo.phone);
      if (password) {
        formData.append("password", password);
      }
      console.log("Form: FormData entries:", [...formData.entries()]);

      const response = await updateAdminInfo(adminInfo._id, formData);
      console.log("Form: Update admin info response:", JSON.stringify(response, null, 2));
      if (response.code === 200) {
        const updatedResponse = await getAdminInfo(adminInfo._id);
        if (updatedResponse.code === 200 && updatedResponse.data) {
          const updatedInfo = {
            _id: updatedResponse.data._id,
            fullName: updatedResponse.data.fullName || "",
            email: updatedResponse.data.email || "",
            phone: updatedResponse.data.phone || "",
            avatar: updatedResponse.data.avatar || adminInfo.avatar,
          };
          setAdminInfo(updatedInfo);
          setIsEditable(true);
          localStorage.setItem("adminInfo", JSON.stringify(updatedInfo));
          setPassword("");
          toast.success("Cập nhật thông tin thành công!", {
            position: "top-right",
          });
          setNewAvatar(null);
        } else {
          toast.error("Không thể làm mới thông tin tài khoản sau khi cập nhật!", {
            position: "top-right",
          });
        }
      } else {
        toast.error(response.message || "Cập nhật thông tin thất bại!", {
          position: "top-right",
        });
      }
    } catch (err) {
      console.error("Form: Error updating admin info:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = err.response?.data?.message || err.message || "Cập nhật thông tin thất bại!";
      toast.error(errorMessage, { position: "top-right" });
      if (err.response?.status === 401) {
        console.log("Form: Unauthorized error, redirecting to /loginadmin");
        toast.error("Phiên đăng nhập không hợp lệ! Vui lòng đăng nhập lại.", {
          position: "top-right",
        });
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        setTimeout(() => {
          window.location.href = "/loginadmin";
        }, 2000);
      } else if (errorMessage.includes("quyền")) {
        toast.error("Vui lòng liên hệ quản trị viên để cấp quyền account_edit!", {
          position: "top-right",
        });
      } else if (errorMessage.includes("Email đã tồn tại")) {
        toast.error("Email đã được sử dụng! Vui lòng chọn email khác.", {
          position: "top-right",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ margin: "40px" }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      <Card sx={{ backgroundColor: colors.primary[400] }}>
        <CardHeader
          title={
            <Typography variant="h4" color={colors.grey[100]}>
              Cài đặt tài khoản
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={adminInfo.avatar}
                alt="Admin Avatar"
                sx={{ width: 150, height: 150, mb: 2, borderRadius: "50%", border: "2px solid" }}
              />
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
                disabled={loading || !isEditable}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="contained"
                  component="span"
                  color="primary"
                  disabled={loading || !isEditable}
                >
                  Thay đổi Avatar
                </Button>
              </label>
              <Box mt={3} width="50%">
                <TextField
                  fullWidth
                  margin="normal"
                  label="Họ và tên"
                  name="fullName"
                  value={adminInfo.fullName || ""}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading || !isEditable}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  value={adminInfo.email || ""}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading || !isEditable}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Số điện thoại"
                  name="phone"
                  value={adminInfo.phone || ""}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading || !isEditable}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mật khẩu mới"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading || !isEditable}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 3, fontWeight: "bold" }}
                onClick={handleSave}
                disabled={loading || !isEditable}
              >
                Lưu thay đổi
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Form;