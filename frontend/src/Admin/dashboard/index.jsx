import { useState, useEffect } from "react";
import { Box, Button, Typography, useTheme, FormControl, InputLabel, Select, MenuItem, useMediaQuery, Menu } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import ApartmentIcon from "@mui/icons-material/Apartment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Header from "../../components/Scenes/Header";
import LineChart from "../../components/Scenes/LineChart";
import PieChart from "../../components/Scenes/PieChart";
import StatBox from "../../components/Scenes/StatBox";
import { DataGrid } from "@mui/x-data-grid";
import { getContacts } from "../contacts/ContactsApi";
import { getInvoices, getInvoiceDetail } from "../invoices/InvoicesApi";
import { getDashboardStats } from "./dashboardApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminAuth } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { adminToken } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalTours: 0,
    toursToday: 0,
    totalHotels: 0,
    hotelsToday: 0,
    revenueToday: 0,
    totalAvailableTours: 0,
    totalAvailableHotels: 0,
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
  });
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [userPaginationModel, setUserPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [userRowCount, setUserRowCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fetch monthly revenue
  const fetchMonthlyRevenue = async () => {
    if (!adminToken) {
      setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      navigate("/loginadmin");
      return;
    }

    // console.log("Fetching monthly revenue for month:", selectedMonth, "year:", selectedYear);
    try {
      const monthlyInvoicesResponse = await getInvoices(adminToken, {
        page: 1,
        limit: 100,
        status: "paid",
        year: selectedYear,
        month: selectedMonth,
      });
      // console.log("Monthly Invoices Response for month", selectedMonth, ":", JSON.stringify(monthlyInvoicesResponse, null, 2));
      let monthlyInvoices = monthlyInvoicesResponse.orders || [];

      // Lọc hóa đơn theo tháng và năm được chọn
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
      monthlyInvoices = monthlyInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= startOfMonth && invoiceDate <= endOfMonth;
      });

      // Tính tổng doanh thu từ totalPrice
      const calculatedRevenue = monthlyInvoices.reduce((sum, invoice) => {
        return sum + (invoice.totalPrice || 0);
      }, 0);

      // console.log("Calculated revenue for month", selectedMonth, ":", calculatedRevenue);
      setRevenueThisMonth(calculatedRevenue);
      if (calculatedRevenue === 0) {
        setErrorMessage(`Không có doanh thu trong tháng ${selectedMonth}/${selectedYear}.`);
      } else {
        setErrorMessage("");
      }
    } catch (err) {
      console.error("Error fetching monthly revenue:", err);
      const errorMsg = err.message || `Lỗi khi tải dữ liệu doanh thu tháng: ${err.response?.data?.message || err.message}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        navigate("/loginadmin");
      }
    }
  };

  // Download monthly report (by day)
  const handleDownloadMonthlyReport = async () => {
    if (!adminToken) {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      navigate("/loginadmin");
      return;
    }

    setLoading(true);
    try {
      const response = await getInvoices(adminToken, {
        page: 1,
        limit: 100,
        status: "paid",
        year: selectedYear,
        month: selectedMonth,
      });

      let invoices = Array.isArray(response.orders) ? response.orders : [];
      if (invoices.length === 0) {
        toast.info(`Không có hóa đơn nào trong tháng ${selectedMonth}/${selectedYear}.`, { position: "top-right" });
        setLoading(false);
        handleMenuClose();
        return;
      }

      // Lọc hóa đơn để chỉ lấy những hóa đơn trong tháng và năm được chọn
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
      invoices = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= startOfMonth && invoiceDate <= endOfMonth;
      });

      if (invoices.length === 0) {
        toast.info(`Không có hóa đơn nào trong tháng ${selectedMonth}/${selectedYear} sau khi lọc.`, { position: "top-right" });
        setLoading(false);
        handleMenuClose();
        return;
      }

      // Fetch chi tiết hóa đơn
      const detailedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          try {
            const detailResponse = await getInvoiceDetail(adminToken, invoice._id);
            return {
              ...invoice,
              tours: detailResponse.data.tours || invoice.tours,
              hotels: detailResponse.data.hotels || invoice.hotels,
            };
          } catch (err) {
            console.error(`Error fetching details for invoice ${invoice._id}:`, err);
            return invoice;
          }
        })
      );

      // Nhóm hóa đơn theo ngày
      const invoicesByDate = {};
      detailedInvoices.forEach((invoice) => {
        const date = new Date(invoice.createdAt).toLocaleDateString("vi-VN");
        if (!invoicesByDate[date]) {
          invoicesByDate[date] = [];
        }
        invoicesByDate[date].push(invoice);
      });

      // Tạo workbook và worksheet mới
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("BÁO CÁO DOANH THU THÁNG");

      // Thêm dòng tiêu đề ở row 1
      const titleRow = worksheet.addRow([`BÁO CÁO DOANH THU THÁNG ${selectedMonth}/${selectedYear}`]);
      worksheet.mergeCells('A1:F1');
      titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "111111" } };
      titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" } };
      titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      titleRow.height = 20;
      // Thêm border cho dòng tiêu đề
      titleRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Thêm dòng tiêu đề cột ở row 2
      const headerRow = worksheet.addRow(["Ngày", "Mã hóa đơn", "Tên khách hàng", "Tour", "Khách sạn", "Tổng giá (VNĐ)"]);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "111111" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "B9D3EE" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Định nghĩa độ rộng cột
      worksheet.columns = [
        { key: "date", width: 15 },
        { key: "orderCode", width: 20 },
        { key: "customer", width: 20 },
        { key: "tours", width: 70 },
        { key: "hotels", width: 65 },
        { key: "totalPrice", width: 15 },
      ];

      // Thêm dữ liệu (bắt đầu từ row 3)
      Object.keys(invoicesByDate).forEach((date) => {
        const dailyInvoices = invoicesByDate[date];
        const tourCounts = {};
        dailyInvoices.forEach((invoice) => {
          if (Array.isArray(invoice.tours)) {
            invoice.tours.forEach((tour) => {
              const tourId = tour.tourInfo?._id || tour.tour_id;
              if (tourId) {
                tourCounts[tourId] = (tourCounts[tourId] || 0) + 1;
              }
            });
          }
        });

        dailyInvoices.forEach((invoice) => {
          const tours = Array.isArray(invoice.tours) && invoice.tours.length > 0
            ? invoice.tours
              .map((tour) => {
                const tourId = tour.tourInfo?._id || tour.tour_id;
                const quantity = tourCounts[tourId] || 0;
                return `${tour.tourInfo?.title || "N/A"} (SL: ${quantity})`;
              })
              .join(" | ")
            : "0";

          const hotels = Array.isArray(invoice.hotels) && invoice.hotels.length > 0
            ? invoice.hotels
              .map((hotel) => {
                if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0) {
                  return hotel.rooms
                    .map((room) => `${hotel.hotelInfo?.name || "N/A"} - ${room.roomInfo?.name || "N/A"} (SL: ${room.quantity || 0})`)
                    .join(" | ");
                }
                return null;
              })
              .filter((item) => item !== null)
              .join(" | ") || "0"
            : "0";

          worksheet.addRow({
            date,
            orderCode: invoice.orderCode || invoice._id || "N/A",
            customer: invoice.userInfor?.fullName || "N/A",
            tours,
            hotels,
            totalPrice: invoice.totalPrice?.toLocaleString("vi-VN") || "0",
          });
        });
      });

      // Thêm dòng tổng doanh thu
      const totalRow = worksheet.addRow({
        date: "",
        orderCode: "",
        customer: "",
        tours: "",
        hotels: "Tổng doanh thu",
        totalPrice: revenueThisMonth.toLocaleString("vi-VN") + " VNĐ",
      });

      // Định dạng dòng tổng doanh thu
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 5 || colNumber === 6) {
          cell.font = { bold: true, color: { argb: "111111" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF66" } };
        }
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Thêm border cho toàn bộ bảng (từ row 2 trở đi)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 2) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        }
      });

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BaoCaoDoanhThu_${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading monthly report:", err);
      toast.error(`Lỗi khi tải báo cáo tháng: ${err.response?.data?.message || err.message}`, { position: "top-right" });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  // Download yearly report
  const handleDownloadYearlyReport = async () => {
    if (!adminToken) {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      navigate("/loginadmin");
      return;
    }

    setLoading(true);
    try {
      let allInvoices = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await getInvoices(adminToken, {
          page,
          limit: 100,
          status: "paid",
          year: selectedYear,
        });

        if (!Array.isArray(response.orders)) {
          setLoading(false);
          handleMenuClose();
          return;
        }

        allInvoices = allInvoices.concat(response.orders);
        totalPages = response.totalPage || 1;
        page++;
      } while (page <= totalPages);

      if (allInvoices.length === 0) {
        toast.info(`Không có hóa đơn nào trong năm ${selectedYear}.`, { position: "top-right" });
        setLoading(false);
        handleMenuClose();
        return;
      }

      // Lọc hóa đơn để chỉ lấy những hóa đơn trong năm được chọn
      const startOfYear = new Date(selectedYear, 0, 1);
      const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);
      allInvoices = allInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= startOfYear && invoiceDate <= endOfYear;
      });

      if (allInvoices.length === 0) {
        toast.info(`Không có hóa đơn nào trong năm ${selectedYear} sau khi lọc.`, { position: "top-right" });
        setLoading(false);
        handleMenuClose();
        return;
      }

      // Fetch chi tiết hóa đơn
      const detailedInvoices = await Promise.all(
        allInvoices.map(async (invoice) => {
          try {
            const detailResponse = await getInvoiceDetail(adminToken, invoice._id);
            // console.log("getInvoiceDetail response for invoice", invoice._id, ":", JSON.stringify(detailResponse.data, null, 2));
            return {
              ...invoice,
              tours: detailResponse.data.tours || invoice.tours,
              hotels: detailResponse.data.hotels || invoice.hotels,
            };
          } catch (err) {
            console.error(`Error fetching details for invoice ${invoice._id}:`, err);
            return invoice;
          }
        })
      );

      // Tổng hợp dữ liệu theo tháng
      const monthlyData = {};
      detailedInvoices.forEach((invoice) => {
        const invoiceMonth = new Date(invoice.createdAt).getMonth() + 1;
        if (!monthlyData[invoiceMonth]) {
          monthlyData[invoiceMonth] = {
            totalRevenue: 0,
            invoiceCount: 0,
            totalTours: 0,
            totalHotelRooms: 0,
          };
        }
        monthlyData[invoiceMonth].totalRevenue += invoice.totalPrice || 0;
        monthlyData[invoiceMonth].invoiceCount += 1;

        // Tính số lượng tour
        if (Array.isArray(invoice.tours)) {
          const tourCounts = {};
          invoice.tours.forEach((tour) => {
            const tourId = tour.tourInfo?._id || tour.tour_id;
            if (tourId) {
              tourCounts[tourId] = (tourCounts[tourId] || 0) + 1;
            }
          });
          Object.values(tourCounts).forEach((count) => {
            monthlyData[invoiceMonth].totalTours += count;
          });
        } else {
          monthlyData[invoiceMonth].totalTours = 0;
        }

        if (Array.isArray(invoice.hotels)) {
          invoice.hotels.forEach((hotel) => {
            if (Array.isArray(hotel.rooms)) {
              hotel.rooms.forEach((room) => {
                monthlyData[invoiceMonth].totalHotelRooms += room.quantity || 0;
              });
            }
          });
        } else {
          monthlyData[invoiceMonth].totalHotelRooms = 0;
        }
      });

      // Tạo workbook và worksheet mới
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("BÁO CÁO DOANH THU NĂM");

      // Thêm dòng tiêu đề ở row 1
      const titleRow = worksheet.addRow([`BÁO CÁO DOANH THU NĂM ${selectedYear}`]);
      worksheet.mergeCells('A1:E1');
      titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "111111" } };
      titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" } };
      titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      titleRow.height = 20;
      // Thêm border cho dòng tiêu đề
      titleRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Thêm dòng tiêu đề cột ở row 2
      const headerRow = worksheet.addRow(["Tháng", "Số hóa đơn", "Tổng tour", "Tổng phòng khách sạn", "Tổng doanh thu (VNĐ)"]);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "111111" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "B9D3EE" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Định nghĩa độ rộng cột
      worksheet.columns = [
        { key: "month", width: 15 },
        { key: "invoiceCount", width: 15 },
        { key: "totalTours", width: 15 },
        { key: "totalHotelRooms", width: 20 },
        { key: "totalRevenue", width: 20 },
      ];

      // Thêm dữ liệu (bắt đầu từ row 3)
      let yearlyTotalRevenue = 0;
      Object.keys(monthlyData).forEach((month) => {
        worksheet.addRow({
          month: months[parseInt(month) - 1].label,
          invoiceCount: monthlyData[month].invoiceCount,
          totalTours: monthlyData[month].totalTours,
          totalHotelRooms: monthlyData[month].totalHotelRooms,
          totalRevenue: monthlyData[month].totalRevenue.toLocaleString("vi-VN"),
        });
        yearlyTotalRevenue += monthlyData[month].totalRevenue;
      });

      // Thêm dòng tổng doanh thu
      const totalRow = worksheet.addRow({
        month: "",
        invoiceCount: "",
        totalTours: "",
        totalHotelRooms: "Tổng doanh thu",
        totalRevenue: yearlyTotalRevenue.toLocaleString("vi-VN") + " VNĐ",
      });

      // Định dạng dòng tổng doanh thu
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 4 || colNumber === 5) {
          cell.font = { bold: true, color: { argb: "111111" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF66" } };
        }
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Thêm border cho toàn bộ bảng (từ row 2 trở đi)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 2) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        }
      });

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BaoCaoDoanhThu_${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading yearly report:", err);
      toast.error(`Lỗi khi tải báo cáo năm: ${err.response?.data?.message || err.message}`, { position: "top-right" });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!adminToken) {
      setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      navigate("/loginadmin");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      // Fetch core statistics from dashboardApi
      const dashboardStats = await getDashboardStats(adminToken);

      // Fetch users for daily metrics and recent users table
      const allUsersResponse = await getContacts(
        {
          page: 1,
          limit: 1000,
        },
        adminToken
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = allUsersResponse.users.filter((user) => {
        const userDate = new Date(user.createdAt);
        userDate.setHours(0, 0, 0, 0);
        return userDate.getTime() === today.getTime();
      }).length;

      // Fetch users for pagination
      const usersResponse = await getContacts(
        {
          page: userPaginationModel.page + 1,
          limit: userPaginationModel.pageSize,
        },
        adminToken
      );

      // Fetch invoices for daily metrics and recent invoices table
      const invoicesResponse = await getInvoices(adminToken, {
        page: 1,
        limit: 1000,
        status: "paid",
      });

      let invoicesData = Array.isArray(invoicesResponse.orders) ? invoicesResponse.orders : [];

      // Calculate daily metrics
      const toursToday = invoicesData.filter(
        (invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          invoiceDate.setHours(0, 0, 0, 0);
          return invoiceDate.getTime() === today.getTime() &&
            Array.isArray(invoice.tours) &&
            invoice.tours.length > 0;
        }
      ).length;

      const hotelsToday = invoicesData.filter(
        (invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          invoiceDate.setHours(0, 0, 0, 0);
          return invoiceDate.getTime() === today.getTime() &&
            Array.isArray(invoice.hotels) &&
            invoice.hotels.length > 0;
        }
      ).length;

      const revenueToday = invoicesData
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          invoiceDate.setHours(0, 0, 0, 0);
          return invoiceDate.getTime() === today.getTime();
        })
        .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);

      const totalTours = invoicesData.filter((invoice) => Array.isArray(invoice.tours) && invoice.tours.length > 0).length;
      const totalHotels = invoicesData.filter((invoice) => Array.isArray(invoice.hotels) && invoice.hotels.length > 0).length;

      // Prepare recent users data from allUsersResponse
      const recentUsersData = allUsersResponse.users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((user, index) => ({
          id: user._id,
          stt: index + 1,
          fullName: user.fullName || "N/A",
          email: user.email || "N/A",
          createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
        }));

      // Prepare recent invoices data
      const recentInvoicesData = invoicesData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((invoice, index) => ({
          id: invoice._id,
          stt: index + 1,
          txId: invoice.orderCode || invoice._id || "N/A",
          user: invoice.userInfor?.fullName || "N/A",
          date: new Date(invoice.createdAt).toLocaleDateString("vi-VN"),
          cost: (invoice.totalPrice / 1000).toLocaleString("vi-VN") + " VNĐ",
        }));

      // Update stats with data from dashboardApi and calculated metrics
      setStats({
        totalUsers: dashboardStats.totalUsers,
        newUsersToday,
        totalTours,
        toursToday,
        totalHotels,
        hotelsToday,
        revenueToday,
        totalAvailableTours: dashboardStats.totalAvailableTours,
        totalAvailableHotels: dashboardStats.totalAvailableHotels,
        totalOrders: dashboardStats.totalOrders,
        pendingOrders: dashboardStats.pendingOrders,
        paidOrders: dashboardStats.paidOrders,
        cancelledOrders: dashboardStats.cancelledOrders,
      });
      setRecentUsers(recentUsersData);
      setRecentInvoices(recentInvoicesData);
      setUserRowCount(dashboardStats.totalUsers);
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      const errorMsg =
        err.message || `Lỗi khi tải dữ liệu dashboard: ${err.response?.data?.message || err.message}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        navigate("/loginadmin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [adminToken, userPaginationModel]);

  useEffect(() => {
    fetchMonthlyRevenue();
  }, [selectedMonth, selectedYear, adminToken]);

  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setUserPaginationModel({ page: 0, pageSize: 5 });
    setErrorMessage("");
  };

  const userColumns = [
    { field: "stt", headerName: "STT", flex: isMobile ? 0.2 : 0.3 },
    { field: "fullName", headerName: "Tên", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: isMobile ? 0.5 : 0.7 },
  ];

  const invoiceColumns = [
    { field: "stt", headerName: "STT", flex: isMobile ? 0.2 : 0.3 },
    { field: "txId", headerName: "Mã giao dịch", flex: 0.8 },
    { field: "user", headerName: "Người dùng", flex: 1 },
    { field: "date", headerName: "Ngày", flex: isMobile ? 0.5 : 0.6 },
    { field: "cost", headerName: "Số tiền", flex: isMobile ? 0.5 : 0.8 },
  ];

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems="center" gap={2}>
        <Header title="Bảng điều khiển" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "bold",
              padding: isMobile ? "8px 16px" : "10px 20px",
            }}
            onClick={handleMenuOpen}
            disabled={loading}
          >
            <DownloadOutlined sx={{ mr: "10px" }} />
            Tải báo cáo doanh thu
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                p: 1,
                minWidth: 222,
                backgroundColor: colors.primary[400],
              },
            }}
          >
            <MenuItem onClick={handleDownloadMonthlyReport}>
              Theo tháng
            </MenuItem>
            <MenuItem onClick={handleDownloadYearlyReport}>
              Theo năm
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {errorMessage && (
        <Box my={2}>
          <Typography color="error" align="center">{errorMessage}</Typography>
        </Box>
      )}

      <Box
        display="grid"
        gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}
        gridAutoRows={isMobile ? "auto" : "140px"}
        gap={isMobile ? "10px" : "20px"}
      >
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ borderRadius: "10px" }}
        >
          <StatBox
            title={stats.totalUsers.toLocaleString()}
            subtitle="Tổng người dùng"
            progress={stats.totalUsers ? stats.newUsersToday / stats.totalUsers : 0}
            increase={`+${stats.newUsersToday} hôm nay`}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ borderRadius: "10px" }}
        >
          <StatBox
            title={stats.totalTours.toLocaleString()}
            subtitle="Tổng tour đã bán"
            progress={stats.totalTours ? stats.toursToday / stats.totalTours : 0}
            increase={`+${stats.toursToday} hôm nay`}
            icon={
              <FlightTakeoffOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ borderRadius: "10px" }}
        >
          <StatBox
            title={stats.totalHotels.toLocaleString()}
            subtitle="Tổng phòng đã bán"
            progress={stats.totalHotels ? stats.hotelsToday / stats.totalHotels : 0}
            increase={`+${stats.hotelsToday} hôm nay`}
            icon={
              <MeetingRoomOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ borderRadius: "10px" }}
        >
          <StatBox
            title={`${(stats.revenueToday / 1000).toLocaleString()} VNĐ`}
            subtitle="Doanh thu hôm nay"
            progress={0}
            increase=""
            icon={
              <MonetizationOnIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 8"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          sx={{ overflow: "visible", borderRadius: "10px" }}
        >
          <Box
            mt="20px"
            p={isMobile ? "0 15px" : "0 30px"}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" flexDirection="column">
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Doanh thu tháng này
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {(revenueThisMonth / 1000000).toLocaleString()}M VNĐ
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: isMobile ? 80 : 100 }}>
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Tháng"
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: isMobile ? 80 : 100 }}>
                <InputLabel>Năm</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Năm"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleResetFilters}
                sx={{ fontWeight: "bold", padding: isMobile ? "6px 12px" : "8px 16px" }}
              >
                Đặt lại
              </Button>
            </Box>
          </Box>
          <Box height={isMobile ? "400px" : "800px"} mt="0px" sx={{ width: "100%", overflow: "visible" }}>
            <LineChart isDashboard={true} selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Box>
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p={isMobile ? "10px" : "20px"}
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap="15px"
          sx={{ overflow: "auto", borderRadius: "10px" }}
        >
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            p="20px"
            borderRadius="16px"
            backgroundColor={colors.grey[900]}
            border={`1px solid ${colors.grey[300]}`}
            boxShadow={`0px 4px 12px ${colors.grey[900]}10`}
            onClick={() => navigate("/admin/tourcontrol")}
            sx={{
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0px 8px 20px ${colors.grey[900]}20`,
              },
            }}
          >
            <TourOutlinedIcon
              sx={{
                fontSize: isMobile ? "50px" : "60px",
                color: colors.greenAccent[400],
                mr: "20px",
              }}
            />
            <Box>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                color={colors.grey[100]}
              >
                Tổng tour
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                color={colors.grey[300]}
                ml="25px"
              >
                {stats.totalAvailableTours.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            p="20px"
            borderRadius="16px"
            backgroundColor={colors.grey[900]}
            border={`1px solid ${colors.grey[200]}`}
            boxShadow={`0px 4px 12px ${colors.grey[800]}10`}
            onClick={() => navigate("/admin/hotel")}
            sx={{
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0px 8px 20px ${colors.grey[900]}20`,
              },
            }}
          >
            <ApartmentIcon
              sx={{
                fontSize: isMobile ? "50px" : "60px",
                color: colors.greenAccent[400],
                mr: "20px",
              }}
            />
            <Box>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                color={colors.grey[100]}
              >
                Tổng khách sạn
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                color={colors.grey[300]}
                ml="30px"
              >
                {stats.totalAvailableHotels.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p={isMobile ? "15px" : "30px"}
          sx={{ borderRadius: "10px" }}
        >
          <Typography variant="h5" fontWeight="600">
            Phân bổ đặt Tour và Khách sạn trong năm
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="20px"
          >
            <Box height={isMobile ? "150px" : "230px"} width="100%">
              <PieChart isDashboard={true} selectedYear={selectedYear} />
            </Box>
          </Box>
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          sx={{ borderRadius: "10px" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Hóa đơn gần đây
            </Typography>
          </Box>
          {recentInvoices.length === 0 ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>Không có hóa đơn để hiển thị.</Typography>
            </Box>
          ) : (
            <Box height="250px">
              <DataGrid
                rows={recentInvoices}
                columns={invoiceColumns}
                getRowId={(row) => row.id}
                hideFooter
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none",
                    color: colors.grey[100],
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              />
            </Box>
          )}
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          sx={{ borderRadius: "10px" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Người dùng mới
            </Typography>
          </Box>
          <Box height="250px">
            {loading ? (
              <Typography variant="h6" align="center" mt={4}>
                Đang tải...
              </Typography>
            ) : recentUsers.length === 0 ? (
              <Typography variant="h6" align="center" mt={4}>
                Không có người dùng mới để hiển thị
              </Typography>
            ) : (
              <DataGrid
                rows={recentUsers}
                columns={userColumns}
                getRowId={(row) => row.id}
                hideFooter
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none",
                    color: colors.grey[100],
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;