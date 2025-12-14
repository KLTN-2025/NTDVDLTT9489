import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Import instance api từ api.js

const AdminAuthContext = createContext({
    admin: null,
    adminToken: null,
    loginAdmin: () => { },
    logoutAdmin: () => { },
    loading: false,
});

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [adminToken, setAdminToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAdminAuth = async () => {
            try {
                const storedAdminToken = localStorage.getItem("adminToken");
                const storedAdminInfo = localStorage.getItem("adminInfo");

                if (storedAdminToken && storedAdminInfo) {
                    let parsedAdmin;
                    try {
                        parsedAdmin = JSON.parse(storedAdminInfo);
                    } catch (e) {
                        console.error("Dữ liệu admin không hợp lệ:", storedAdminInfo);
                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("adminInfo");
                        setAdminToken(null);
                        setAdmin(null);
                        navigate("/loginadmin");
                        return;
                    }

                    // Kiểm tra token admin (gọi API nếu backend hỗ trợ verify token)
                    setAdminToken(storedAdminToken);
                    setAdmin({ ...parsedAdmin, role: "admin" });
                }
            } catch (error) {
                console.error("Lỗi khi xác thực admin token:", error);
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminInfo");
                setAdminToken(null);
                setAdmin(null);
                navigate("/loginadmin");
            } finally {
                setLoading(false);
            }
        };

        initializeAdminAuth();
    }, [navigate]);

    const loginAdmin = (adminData, token) => {
        if (!adminData || !token) {
            console.error("Dữ liệu đăng nhập admin không hợp lệ:", { adminData, token });
            toast.error("Dữ liệu đăng nhập không hợp lệ!");
            return;
        }
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminInfo", JSON.stringify(adminData));
        setAdminToken(token);
        setAdmin({ ...adminData, role: "admin" });
        toast.success("Đăng nhập admin thành công!");
        navigate("/admin/dashboard");
    };

    const logoutAdmin = async () => {
        try {
            // Gọi API đăng xuất admin
            const response = await api.get("/admin/accounts/logout");
            if (response.data.code === 200) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminInfo");
                setAdminToken(null);
                setAdmin(null);
                toast.success("Đăng xuất admin thành công!");
                navigate("/loginadmin");
            } else {
                toast.error(response.data.message || "Đăng xuất thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất admin:", error);
            toast.error("Đăng xuất thất bại!");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminInfo");
            setAdminToken(null);
            setAdmin(null);
            navigate("/loginadmin");
        }
    };

    return (
        <AdminAuthContext.Provider value={{ admin, adminToken, loginAdmin, logoutAdmin, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    return context;
};