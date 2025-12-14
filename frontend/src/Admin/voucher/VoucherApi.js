import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/vouchers";

// Lấy danh sách voucher
export const getVouchers = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    // console.log("getVouchers response:", response.data);
    return response.data;
};

// Tạo voucher mới
export const createVoucher = async (voucherData) => {
    const response = await api.post(`${BASE_URL}/create`, voucherData);
    // console.log("createVoucher response:", response.data);
    return response.data;
};

// Cập nhật voucher
export const updateVoucher = async (id, voucherData) => {
    const response = await api.patch(`${BASE_URL}/edit/${id}`, voucherData);
    // console.log("updateVoucher response:", response.data);
    return response.data;
};

// Xóa voucher
export const deleteVoucher = async (id) => {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    // console.log("deleteVoucher response:", response.data);
    return response.data;
};

// Lấy chi tiết voucher
export const getVoucherDetail = async (id) => {
    const response = await api.get(`${BASE_URL}/detail/${id}`);
    // console.log("getVoucherDetail response:", response.data);
    return response.data;
};