import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/users";

// Lấy danh sách khách hàng
export const getContacts = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    // console.log("getContacts response:", response.data);
    return response.data;
};

// Thay đổi trạng thái khách hàng
export const changeContactStatus = async (id, status) => {
    const response = await api.patch(`${BASE_URL}/changeStatus/${status}/${id}`);
    // console.log("changeContactStatus response:", response.data);
    return response.data;
};

// Lấy chi tiết khách hàng
export const getContactDetail = async (id) => {
    const response = await api.get(`${BASE_URL}/detail/${id}`);
    // console.log("getContactDetail response:", response.data);
    return response.data;
};

// Xóa khách hàng
export const deleteContact = async (id) => {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    // console.log("deleteContact response:", response.data);
    return response.data;
};