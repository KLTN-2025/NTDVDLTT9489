import api from "../utils/api";

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    console.log("Login response:", response.data);
    const { token, cartId } = response.data;

    if (response.data.code !== 200) {
      return {
        success: false,
        code: response.data.code,
        message: response.data.message,
      };
    }

    // Gọi /users/detail để lấy thông tin user
    const detailResponse = await api.get("/users/detail", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Detail response:", detailResponse.data);

    if (detailResponse.data.code !== 200) {
      return {
        success: false,
        code: detailResponse.data.code,
        message: detailResponse.data.message,
      };
    }

    return {
      success: true,
      code: 200,
      user: detailResponse.data.infor, // Backend trả về "infor"
      token,
      cartId: cartId || null,
    };
  } catch (error) {
    console.error("Login error:", error.response?.data || error);
    return {
      success: false,
      code: error.response?.status || 500,
      message: error.response?.data?.message || "Đăng nhập thất bại!",
    };
  }
};

// Các hàm khác (register, verifyToken, logout) giữ nguyên nếu không cần thay đổi
// src/services/authService.js

export const register = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    console.log("Register response:", JSON.stringify(response.data, null, 2));
    if (response.data.code === 200) {
      return {
        code: 200,
        message: response.data.message,
        token: response.data.token,
      };
    } else {
      return {
        code: response.data.code,
        message: response.data.message || "Đăng ký thất bại!",
        errors: response.data.errors || [], // Truyền errors từ backend
      };
    }
  } catch (error) {
    console.error("Register error:", error.response?.data || error);
    return {
      code: error.response?.status || 500,
      message: error.response?.data?.message || "Đăng ký thất bại!",
      errors: error.response?.data?.errors || [],
    };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/users/password/forgot", { email });
    console.log("Forgot password response:", JSON.stringify(response.data, null, 2));
    if (response.data.code === 200) {
      return {
        code: 200,
        message: response.data.message,
      };
    } else {
      throw new Error(response.data.message || "Gửi yêu cầu thất bại!");
    }
  } catch (error) {
    console.error("Forgot password error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post("/users/password/otp", { email, otp });
    console.log("Verify OTP response:", JSON.stringify(response.data, null, 2));
    if (response.data.code === 200) {
      return {
        code: 200,
        message: response.data.message,
        token: response.data.token,
      };
    } else {
      throw new Error(response.data.message || "Xác thực OTP thất bại!");
    }
  } catch (error) {
    console.error("Verify OTP error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Xác thực OTP thất bại!");
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post("/users/password/reset", { token, password });
    console.log("Reset password response:", JSON.stringify(response.data, null, 2));
    if (response.data.code === 200) {
      return {
        code: 200,
        message: response.data.message,
      };
    } else {
      throw new Error(response.data.message || "Đặt lại mật khẩu thất bại!");
    }
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Đặt lại mật khẩu thất bại!");
  }
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Không có token");

    const response = await api.get("/users/detail", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Verify token response:", response.data); // Debug
    return {
      success: true,
      code: response.status,
      user: response.data.infor, // Backend trả về "infor" thay vì "user"
    };
  } catch (error) {
    console.error("Verify token error:", error.response?.data);
    return {
      success: false,
      code: error.response?.status || 401,
      message: error.response?.data?.message || "Token không hợp lệ!",
    };
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/users/logout", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      code: response.status,
    };
  } catch (error) {
    console.error("Logout error:", error.response?.data);
    return {
      success: false,
      code: error.response?.status || 500,
      message: error.response?.data?.message || "Đăng xuất thất bại!",
    };
  }
};