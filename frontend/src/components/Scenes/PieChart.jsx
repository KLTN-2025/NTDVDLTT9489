import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../../theme";
import { useTheme, Typography, Box, useMediaQuery, CircularProgress } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { getInvoices } from "../../Admin/invoices/InvoicesApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminContext";

const PieChart = ({ isDashboard = false, selectedYear }) => {
  const theme = useTheme();
  const colors = useMemo(() => tokens(theme.palette.mode), [theme.palette.mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPieData = async () => {
      if (!adminToken) {
        setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
        toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
        navigate("/loginadmin");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        const invoicesData = await getInvoices(adminToken, {
          page: 1,
          limit: 50,
          status: "paid",
        });
        if (!invoicesData || !Array.isArray(invoicesData.orders)) {
          throw new Error("Dữ liệu hóa đơn không hợp lệ!");
        }

        // Lọc dữ liệu theo năm được chọn
        const filteredInvoices = invoicesData.orders.filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          const invoiceYear = invoiceDate.getFullYear();
          return invoiceYear === selectedYear;
        });

        console.log("Filtered invoices for year", selectedYear, ":", JSON.stringify(filteredInvoices, null, 2));

        let tourRevenue = 0;
        let hotelRevenue = 0;
        filteredInvoices.forEach((invoice) => {
          if (invoice.tours?.length > 0) {
            invoice.tours.forEach((tour) => {
              const stock = tour.timeStarts?.[0]?.stock || 0;
              const price = tour.price || 0;
              tourRevenue += price * stock;
              console.log(`Tour: stock=${stock}, price=${price}, revenue=${price * stock}`);
            });
          }
          if (invoice.hotels?.length > 0) {
            invoice.hotels.forEach((hotel) => {
              if (hotel.rooms?.length > 0) {
                hotel.rooms.forEach((room) => {
                  const quantity = room.quantity || 0;
                  const price = room.price || 0;
                  hotelRevenue += price * quantity;
                  console.log(`Hotel room: quantity=${quantity}, price=${price}, revenue=${price * quantity}`);
                });
              }
            });
          }
        });

        const totalRevenue = tourRevenue + hotelRevenue;
        console.log(`Total Revenue for year ${selectedYear}: tour=${tourRevenue}, hotel=${hotelRevenue}, total=${totalRevenue}`);

        if (totalRevenue === 0) {
          setErrorMessage(`Không có dữ liệu doanh thu cho năm ${selectedYear}.`);
          setPieData([]);
          toast.info(`Không có dữ liệu doanh thu cho năm ${selectedYear}.`, { position: "top-right" });
        } else {
          const newPieData = [
            {
              id: "Tour",
              label: "Tour",
              value: tourRevenue / 1000000, // Chia cho 1,000,000 để hiển thị đơn vị M VNĐ
              color: colors.blueAccent[700],
            },
            {
              id: "Hotel",
              label: "Hotel",
              value: hotelRevenue / 1000000,
              color: colors.greenAccent[500],
            },
          ];
          setPieData(newPieData);
          console.log("Pie Data:", JSON.stringify(newPieData, null, 2));
        }
      } catch (err) {
        console.error("Fetch pie data error:", err);
        const errorMsg = err.message || `Lỗi khi tải dữ liệu hóa đơn: ${err.response?.data?.message || err.message}`;
        setErrorMessage(errorMsg);
        setPieData([]);
        toast.error(errorMsg, { position: "top-right" });
        if (err.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          localStorage.removeItem("adminToken");
          navigate("/loginadmin");
        }
      } finally {
        setLoading(false);
        console.log("Finished fetching pie data for year", selectedYear);
      }
    };
    fetchPieData();
  }, [adminToken, navigate, selectedYear]);

  return (
    <Box height="100%" position="relative">
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
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? "150px" : isDashboard ? "200px" : "300px"}>
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? "150px" : isDashboard ? "200px" : "300px"}>
          <Typography color="error">{errorMessage}</Typography>
        </Box>
      ) : pieData.length === 0 || pieData.every((item) => item.value === 0) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? "150px" : isDashboard ? "200px" : "300px"}>
          <Typography color={colors.grey[100]}>
            Chưa có dữ liệu doanh thu để hiển thị
          </Typography>
        </Box>
      ) : (
        <ResponsivePie
          data={pieData}
          theme={{
            axis: {
              domain: { line: { stroke: colors.grey[100] } },
              legend: { text: { fill: colors.grey[100] } },
              ticks: { line: { stroke: colors.grey[100], strokeWidth: 1 }, text: { fill: colors.grey[100] } },
            },
            legends: { text: { fill: colors.grey[100], fontSize: isMobile ? 8 : 10 } },
          }}
          margin={isMobile ? { top: 10, right: 20, bottom: 40, left: 20 } : isDashboard ? { top: 20, right: 40, bottom: 60, left: 40 } : { top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          enableArcLabels={isMobile ? false : true}
          arcLabelsRadiusOffset={0.4}
          arcLabelsSkipAngle={7}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          valueFormat={(value) => `${value.toFixed(3)}M VNĐ`}
          defs={[
            {
              id: "dots",
              type: "patternDots",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              size: 4,
              padding: 1,
              stagger: true,
            },
            {
              id: "lines",
              type: "patternLines",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
            },
          ]}
          legends={isMobile ? [] : isDashboard ? [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 40,
              itemsSpacing: 0,
              itemWidth: 80,
              itemHeight: 18,
              itemTextColor: colors.grey[100],
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 14,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: { itemTextColor: colors.grey[500] },
                },
              ],
            },
          ] : [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: colors.grey[100],
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: { itemTextColor: colors.grey[500] },
                },
              ],
            },
          ]}
        />
      )}
    </Box>
  );
};

export default PieChart;