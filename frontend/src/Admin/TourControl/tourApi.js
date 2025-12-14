import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/tours";
const CATEGORY_URL = "http://localhost:3000/api/v1/admin/categories";

// Lấy danh sách tour
export const getTours = async (params = {}) => {
    const response = await api.get(BASE_URL, { params: { ...params, all: true } });
    // console.log("getTours response:", response.data);
    return response.data;
};

// Tạo tour mới
export const createTour = async (tourData) => {
    const response = await api.post(`${BASE_URL}/create`, tourData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    // console.log("createTour response:", response.data);
    return response.data;
};

// Cập nhật tour
export const updateTour = async (id, tourData) => {
    const response = await api.patch(`${BASE_URL}/edit/${id}`, tourData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    // console.log("updateTour response:", response.data);
    return response.data;
};

// Xóa tour
export const deleteTour = async (id) => {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    // console.log("deleteTour response:", response.data);
    return response.data;
};

// Thay đổi trạng thái tour
export const changeTourStatus = async (id, status) => {
    const response = await api.patch(`${BASE_URL}/change-status/${status}/${id}`);
    // console.log("changeTourStatus response:", response.data);
    return response.data;
};

// Lấy chi tiết tour
export const getTourDetail = async (id) => {
    const response = await api.get(`${BASE_URL}/detail/${id}`);
    // console.log("getTourDetail response:", response.data);
    return response.data;
};

// Lấy danh sách danh mục
export const getCategories = async () => {
    const response = await api.get(CATEGORY_URL);
    // console.log("getCategories response:", response.data);
    return response.data;
};

// Thay đổi trạng thái danh mục
export const changeCategoryStatus = async (id, status) => {
    const response = await api.patch(`${CATEGORY_URL}/change-status/${status}/${id}`);
    // console.log("changeCategoryStatus response:", response.data);
    return response.data;
};