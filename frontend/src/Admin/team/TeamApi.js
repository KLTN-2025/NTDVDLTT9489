import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/accounts";

// Lấy danh sách tài khoản
export const getAccounts = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    // console.log("getAccounts response:", response.data);
    return response.data;
};

// Tạo tài khoản mới
export const createAccount = async (accountData, adminToken) => {
    try {
        const response = await api.post(`${BASE_URL}/create`, accountData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${adminToken}`,
            },
        });
        // console.log("createAccount response:", response.data);
        return response.data;
    } catch (err) {
        console.error("createAccount error:", err.response?.data);
        throw err;
    }
};

// Cập nhật tài khoản
export const updateAccount = async (id, accountData) => {
    const response = await api.patch(`${BASE_URL}/edit/${id}`, accountData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    // console.log("updateAccount response:", response.data);
    return response.data;
};

// Xóa tài khoản
export const deleteAccount = async (id) => {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    // console.log("deleteAccount response:", response.data);
    return response.data;
};

// Lấy chi tiết tài khoản
export const getAccountDetail = async (id) => {
    const response = await api.get(`${BASE_URL}/detail/${id}`);
    // console.log("getAccountDetail response:", response.data);
    return response.data;
};

// Thay đổi trạng thái tài khoản
export const changeAccountStatus = async (id, status) => {
    const response = await api.patch(`${BASE_URL}/changeStatus/${status}/${id}`);
    // console.log("changeAccountStatus response:", response.data);
    return response.data;
};

// Lấy chi tiết nhóm quyền
export const getRoleDetail = async (id) => {
    const response = await api.get(`http://localhost:3000/api/v1/admin/roles/detail/${id}`);
    // console.log("getRoleDetail response:", response.data);
    return response.data;
};