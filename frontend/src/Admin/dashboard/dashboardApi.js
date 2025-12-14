import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/admin/dashboard";

const createApiInstance = (adminToken) => {
    return axios.create({
        baseURL: "http://localhost:3000",
        headers: {
            Authorization: `Bearer ${adminToken || localStorage.getItem("adminToken")}`,
        },
    });
};

// Lấy dữ liệu thống kê dashboard
export const getDashboardStats = async (adminToken, params = {}) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get(BASE_URL, { params });
        // console.log("getDashboardStats response:", JSON.stringify(response.data, null, 2));

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "Lỗi khi lấy dữ liệu thống kê");
        }

        const { statistic } = response.data;

        // Map backend statistic to frontend expected format
        return {
            totalUsers: statistic.user.total || 0,
            totalAvailableTours: statistic.tour.total || 0,
            totalAvailableHotels: statistic.hotel.total || 0,
            totalOrders: statistic.order.total || 0,
            pendingOrders: statistic.order.pending || 0,
            paidOrders: statistic.order.paid || 0,
            cancelledOrders: statistic.order.cancel || 0,
            totalReviews: statistic.review.total || 0,
            averageRating: statistic.review.average || 0,
            totalVouchers: statistic.voucher.total || 0,
            validVouchers: statistic.voucher.valid || 0,
            expiredVouchers: statistic.voucher.expire || 0,
            totalCategories: statistic.category.total || 0,
            totalAccounts: statistic.account.total || 0,
            totalRoles: statistic.role.total || 0,
        };
    } catch (error) {
        console.error("getDashboardStats error:", error.response?.data || error);
        const errorMessage = error.response?.data?.message || error.message || "Không thể tải dữ liệu thống kê!";
        throw new Error(errorMessage);
    }
};