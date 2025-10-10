import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/categories";

// Lấy danh sách danh mục
export const getCategories = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
    const response = await api.post(`${BASE_URL}/create`, categoryData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
    const response = await api.patch(`${BASE_URL}/edit/${id}`, categoryData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Xóa danh mục
export const deleteCategory = async (id) => {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
};

// Thay đổi trạng thái
export const changeCategoryStatus = async (id, status) => {
    const response = await api.patch(`${BASE_URL}/changeStatus/${status}/${id}`);
    return response.data;
};