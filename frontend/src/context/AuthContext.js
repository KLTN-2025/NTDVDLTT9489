import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { verifyToken, logout as logoutService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          let parsedUser;
          try {
            parsedUser = JSON.parse(storedUser);
          } catch (e) {
            console.error("Dữ liệu user không hợp lệ:", storedUser);
            localStorage.clear();
            setToken(null);
            setUser(null);
            navigate("/login");
            return;
          }

          const result = await verifyToken();
          console.log("Verify token result:", result);
          if (result.success && result.code === 200) {
            setToken(storedToken);
            setUser(result.user);
          } else {
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.clear();
            setToken(null);
            setUser(null);
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Lỗi khi xác thực token:", error);
        localStorage.clear();
        setToken(null);
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  const login = (userData, token, cartId) => {
    if (!userData || !token) {
      console.error("Dữ liệu đăng nhập không hợp lệ:", { userData, token, cartId });
      toast.error("Dữ liệu đăng nhập không hợp lệ!");
      return;
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    if (cartId) localStorage.setItem("cartId", cartId);
    setToken(token);
    setUser(userData);
    toast.success("Đăng nhập thành công!");
    navigate(userData.role === "admin" ? "/admin" : "/");
  };

  const logout = async () => {
    try {
      const result = await logoutService();
      if (result.success && result.code === 200) {
        localStorage.clear();
        setToken(null);
        setUser(null);
        toast.success("Đăng xuất thành công!");
        navigate("/login");
      } else {
        toast.error(result.message || "Đăng xuất thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đăng xuất thất bại!");
      localStorage.clear();
      setToken(null);
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};