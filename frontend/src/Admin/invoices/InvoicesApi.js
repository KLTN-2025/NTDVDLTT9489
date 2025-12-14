import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/orders";

// Lấy danh sách hóa đơn
export const getInvoices = async (adminToken, params = {}) => {
    if (!adminToken) {
        throw new Error("Token không hợp lệ hoặc thiếu!");
    }
    try {
        const response = await api.get(BASE_URL, {
            params,
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        // console.log("getInvoices response:", response.data);

        // Kiểm tra dữ liệu trả về
        if (!response.data || typeof response.data !== 'object') {
            throw new Error("Dữ liệu trả về không hợp lệ!");
        }

        // Nếu không có hóa đơn
        if (!response.data.orders || response.data.orders.length === 0) {
            return { orders: [], totalPage: 1, totalRecords: 0 };
        }

        // Kiểm tra lỗi từ backend
        if (response.data.code === 400) {
            throw new Error(response.data.message || "Lỗi từ server!");
        }

        return response.data;
    } catch (error) {
        // console.error("getInvoices error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Không thể tải danh sách hóa đơn!";
        throw new Error(errorMessage);
    }
};

// Lấy chi tiết hóa đơn
export const getInvoiceDetail = async (adminToken, id) => {
    if (!adminToken) {
        throw new Error("Token không hợp lệ hoặc thiếu!");
    }
    try {
        const response = await api.get(`${BASE_URL}/detail/${id}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        // console.log("getInvoiceDetail response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("getInvoiceDetail error:", error);
        throw error;
    }
};

// Xóa hóa đơn
export const deleteInvoice = async (adminToken, id) => {
    if (!adminToken) {
        throw new Error("Token không hợp lệ hoặc thiếu!");
    }
    try {
        const response = await api.delete(`${BASE_URL}/delete/${id}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        // console.log("deleteInvoice response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("deleteInvoice error:", error);
        throw error;
    }
};

// Cập nhật trạng thái hóa đơn
export const changeOrderStatus = async (adminToken, status, id) => {
    if (!adminToken) {
        throw new Error("Token không hợp lệ hoặc thiếu!");
    }
    try {
        const response = await api.patch(`${BASE_URL}/changeStatus/${status}/${id}`, {}, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        // console.log("changeOrderStatus response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("changeOrderStatus error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật trạng thái hóa đơn!";
        throw new Error(errorMessage);
    }
};

// Cập nhật trạng thái hoàn tiền
export const refundOrder = async (adminToken, id) => {
    if (!adminToken) {
        throw new Error("Token không hợp lệ hoặc thiếu!");
    }
    try {
        const response = await api.patch(`${BASE_URL}/reFundStatus/${id}`, {}, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        // console.log("refundOrder response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("refundOrder error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật trạng thái hoàn tiền!";
        throw new Error(errorMessage);
    }
};