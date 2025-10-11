import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/orders";

export const getRevenueStatistics = async (params) => {
    try {
        const response = await api.get(BASE_URL, {
            params: {
                ...params, // Sử dụng status từ params (trong trường hợp này là "paid")
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
        });

        const orders = response.data.orders;
        const totalItems = response.data.totalPage * (params.limit || 10);
        const statistics = {};

        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const key = `${month}/${year}`;

            if (params.year && parseInt(params.year) !== year) return;
            if (params.month && parseInt(params.month) !== month) return;
            if (params.startDate && params.endDate) {
                const start = new Date(params.startDate);
                const end = new Date(params.endDate);
                if (date < start || date > end) return;
            }

            if (!statistics[key]) {
                statistics[key] = {
                    month: `${month}/${year}`,
                    tours: 0,
                    hotels: 0,
                    totalPrice: 0,
                    tourRevenue: 0,
                    hotelRevenue: 0,
                };
            }

            if (order.tours && order.tours.length > 0) {
                order.tours.forEach((tour) => {
                    const stock = tour.timeStarts && tour.timeStarts.length > 0 ? tour.timeStarts[0].stock || 0 : 0;
                    statistics[key].tours += stock;
                    statistics[key].tourRevenue += (tour.price || 0) * stock;
                });
            }

            if (order.hotels && order.hotels.length > 0) {
                order.hotels.forEach((hotel) => {
                    if (hotel.rooms && hotel.rooms.length > 0) {
                        hotel.rooms.forEach((room) => {
                            statistics[key].hotels += room.quantity || 0;
                            statistics[key].hotelRevenue += (room.price || 0) * (room.quantity || 0);
                        });
                    }
                });
            }

            statistics[key].totalPrice = statistics[key].tourRevenue + statistics[key].hotelRevenue;
        });

        const result = Object.values(statistics).sort((a, b) => {
            const [monthA, yearA] = a.month.split("/");
            const [monthB, yearB] = b.month.split("/");
            return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });

        // console.log("Dữ liệu thống kê:", result);

        return {
            code: 200,
            message: "Lấy dữ liệu thống kê thành công!",
            data: result,
            totalItems: totalItems,
        };
    } catch (error) {
        // console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        throw error;
    }
};