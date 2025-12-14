import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/accounts";

// Lấy thông tin tài khoản qua /accounts/detail/:id
export const getAdminInfo = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}/detail/${id}`);
        console.log("getAdminInfo response:", JSON.stringify(response.data, null, 2));
        if (!response.data) {
            throw new Error("Không tìm thấy tài khoản với ID: " + id);
        }
        return {
            code: 200,
            message: "Lấy thông tin tài khoản thành công",
            data: response.data,
        };
    } catch (error) {
        console.error("getAdminInfo error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

// Lấy thông tin admin từ danh sách tài khoản
export const getAdminByEmail = async (email) => {
    try {
        const response = await api.get(BASE_URL, {
            params: {
                limit: 10, // Lấy tối đa 10 tài khoản
            },
        });
        console.log("getAdminByEmail response:", JSON.stringify(response.data, null, 2));
        if (response.data && response.data.accounts && response.data.accounts.length > 0) {
            // Tìm tài khoản khớp với email (nếu có)
            const matchedAccount = response.data.accounts.find(
                (account) => account.email === email
            ) || response.data.accounts[0]; // Nếu không tìm thấy, lấy tài khoản đầu tiên
            return {
                code: 200,
                message: "Lấy thông tin tài khoản thành công",
                data: matchedAccount,
            };
        } else {
            throw new Error("Không tìm thấy tài khoản nào trong danh sách");
        }
    } catch (error) {
        console.error("getAdminByEmail error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

// Cập nhật thông tin tài khoản
export const updateAdminInfo = async (id, formData) => {
    try {
        const response = await api.patch(`${BASE_URL}/edit/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("updateAdminInfo response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("updateAdminInfo error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};