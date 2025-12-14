import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "/api/v1/admin/reviews";

const createApiInstance = (adminToken) => {
    return axios.create({
        baseURL: "http://localhost:3000",
        headers: {
            Authorization: `Bearer ${adminToken || localStorage.getItem("adminToken")}`,
        },
    });
};

// Lấy danh sách khách sạn (tái sử dụng từ HotelApi)
export const getHotels = async (adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get("/api/v1/admin/hotels");
        // console.log("getHotels response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (err) {
        console.error("getHotels error:", err.response?.data || err);
        throw err;
    }
};

// Lấy danh sách đánh giá của khách sạn
export const getHotelReviews = async (hotelId, params, adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get(`${BASE_URL}/hotels/${hotelId}`, { params });
        // console.log("getHotelReviews response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (err) {
        console.error("getHotelReviews error:", JSON.stringify(err.response?.data, null, 2));
        throw err;
    }
};

// Lấy danh sách đánh giá của phòng
export const getRoomReviews = async (hotelId, roomId, params, adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get(`${BASE_URL}/rooms/${hotelId}/${roomId}`, { params });
        // console.log("getRoomReviews response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (err) {
        console.error("getRoomReviews error:", JSON.stringify(err.response?.data, null, 2));
        throw err;
    }
};

// Xóa đánh giá
export const deleteReview = async (reviewId, adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.delete(`${BASE_URL}/delete/${reviewId}`);
        // console.log("deleteReview response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (err) {
        console.error("deleteReview error:", JSON.stringify(err.response?.data, null, 2));
        throw err;
    }
};