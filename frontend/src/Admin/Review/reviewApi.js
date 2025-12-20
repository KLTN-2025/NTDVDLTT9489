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

// Lấy danh sách tours
export const getTours = async (adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get("/api/v1/admin/tours");
        // console.log("getTours response:", JSON.stringify(response.data, null, 2));
        // API returns toursObject instead of tours
        return {
            code: 200,
            tours: response.data.toursObject || []
        };
    } catch (err) {
        console.error("getTours error:", err.response?.data || err);
        throw err;
    }
};

// Lấy danh sách đánh giá của tour
export const getTourReviews = async (tourId, params, adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get(`/api/v1/admin/tour-reviews/${tourId}`, { params });
        // console.log("getTourReviews response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (err) {
        console.error("getTourReviews error:", JSON.stringify(err.response?.data, null, 2));
        throw err;
    }
};

// Xóa đánh giá tour
export const deleteTourReview = async (reviewId, adminToken) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.delete(`/api/v1/admin/tour-reviews/delete/${reviewId}`);
        // console.log("deleteTourReview response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (err) {
        console.error("deleteTourReview error:", JSON.stringify(err.response?.data, null, 2));
        throw err;
    }
};