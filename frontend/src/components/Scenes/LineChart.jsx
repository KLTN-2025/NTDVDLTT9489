import { ResponsiveLine } from "@nivo/line";
import { useTheme, Box, Typography, CircularProgress, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import { useEffect, useState, useMemo } from "react";
import { getInvoices } from "../../Admin/invoices/InvoicesApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminContext";

const LineChart = ({ isDashboard = false, selectedYear, selectedMonth }) => {
  const theme = useTheme();
  const colors = useMemo(() => tokens(theme.palette.mode), [theme.palette.mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tickValues, setTickValues] = useState([0, 5, 10, 15, 20, 25, 30]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!adminToken) {
        setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
        toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
        navigate("/loginadmin");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        console.log("Fetching invoice data for year:", selectedYear, "month:", selectedMonth);
        const params = {
          status: "paid",
          year: selectedYear,
          month: selectedMonth || undefined,
          page: 1,
          limit: 50,
        };
        const response = await getInvoices(adminToken, params);
        console.log("API Response:", JSON.stringify(response, null, 2));

        if (!response || !Array.isArray(response.orders)) {
          throw new Error("Dữ liệu hóa đơn không hợp lệ!");
        }

        if (response.orders.length === 0) {
          setErrorMessage(`Không có dữ liệu doanh thu cho ${selectedMonth ? `tháng ${selectedMonth}/${selectedYear}` : `năm ${selectedYear}`}.`);
          setData([]);
          toast.info(`Không có dữ liệu doanh thu cho ${selectedMonth ? `tháng ${selectedMonth}/${selectedYear}` : `năm ${selectedYear}`}.`, { position: "top-right" });
          return;
        }

        const tourData = {
          id: "Tours",
          color: colors.blueAccent[700],
          data: [],
        };
        const hotelData = {
          id: "Hotels",
          color: colors.greenAccent[500],
          data: [],
        };

        if (selectedMonth) {
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const dailyRevenue = Array.from({ length: daysInMonth }, () => ({
            tourRevenue: 0,
            hotelRevenue: 0,
          }));

          response.orders.forEach((invoice) => {
            const createdAt = new Date(invoice.createdAt);
            const day = createdAt.getDate() - 1;
            if (
              createdAt.getFullYear() === selectedYear &&
              createdAt.getMonth() + 1 === selectedMonth &&
              day >= 0 &&
              day < daysInMonth
            ) {
              if (invoice.tours?.length > 0) {
                invoice.tours.forEach((tour) => {
                  const stock = tour.timeStarts?.[0]?.stock || 0;
                  dailyRevenue[day].tourRevenue += (tour.price || 0) * stock;
                });
              }
              if (invoice.hotels?.length > 0) {
                invoice.hotels.forEach((hotel) => {
                  if (hotel.rooms?.length > 0) {
                    hotel.rooms.forEach((room) => {
                      dailyRevenue[day].hotelRevenue += (room.price || 0) * (room.quantity || 0);
                    });
                  }
                });
              }
            }
          });

          for (let day = 1; day <= daysInMonth; day++) {
            const tourRev = dailyRevenue[day - 1].tourRevenue / 1000000;
            const hotelRev = dailyRevenue[day - 1].hotelRevenue / 1000000;
            const xLabel = `${day}/${selectedMonth}/${selectedYear}`;
            tourData.data.push({
              x: xLabel,
              y: tourRev,
            });
            hotelData.data.push({
              x: xLabel,
              y: hotelRev,
            });
          }
        } else {
          for (let month = 1; month <= 12; month++) {
            const monthlyRevenue = {
              tourRevenue: 0,
              hotelRevenue: 0,
            };

            response.orders.forEach((invoice) => {
              const createdAt = new Date(invoice.createdAt);
              if (createdAt.getFullYear() === selectedYear && createdAt.getMonth() + 1 === month) {
                if (invoice.tours?.length > 0) {
                  invoice.tours.forEach((tour) => {
                    const stock = tour.timeStarts?.[0]?.stock || 0;
                    monthlyRevenue.tourRevenue += (tour.price || 0) * stock;
                  });
                }
                if (invoice.hotels?.length > 0) {
                  invoice.hotels.forEach((hotel) => {
                    if (hotel.rooms?.length > 0) {
                      hotel.rooms.forEach((room) => {
                        monthlyRevenue.hotelRevenue += (room.price || 0) * (room.quantity || 0);
                      });
                    }
                  });
                }
              }
            });

            const tourRev = monthlyRevenue.tourRevenue / 1000000;
            const hotelRev = monthlyRevenue.hotelRevenue / 1000000;
            const xLabel = `${month}/${selectedYear}`;
            tourData.data.push({
              x: xLabel,
              y: tourRev,
            });
            hotelData.data.push({
              x: xLabel,
              y: hotelRev,
            });
          }
        }

        const formattedData = [tourData, hotelData];
        console.log("Formatted Data:", JSON.stringify(formattedData, null, 2));

        const maxValue = formattedData.length > 0
          ? Math.max(...formattedData.flatMap(series => series.data.map(point => point.y)))
          : 30;
        const newTickValues = Array.from({ length: Math.floor(maxValue / 5) + 1 }, (_, i) => i * 5);

        setTickValues(newTickValues);
        setData(formattedData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
        const errorMsg = error.message || `Lỗi kết nối API: ${error.response?.data?.message || error.message}`;
        setErrorMessage(errorMsg);
        setData([]);
        setTickValues([0, 5, 10, 15, 20, 25, 30]);
        toast.error(errorMsg, { position: "top-right" });
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          localStorage.removeItem("adminToken");
          navigate("/loginadmin");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, [selectedYear, selectedMonth, adminToken, navigate, colors]);

  return (
    <Box height="100%" position="relative" sx={{ overflow: "visible" }}>
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
      <Box height={isMobile ? "200px" : isDashboard ? "250px" : "400px"} sx={{ width: "100%" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="error">{errorMessage}</Typography>
          </Box>
        ) : data.length === 0 || data.every((d) => d.data.every((point) => point.y === 0)) ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography>
              Không có dữ liệu doanh thu để hiển thị cho {selectedMonth ? `tháng ${selectedMonth}/${selectedYear}` : `năm ${selectedYear}`}.
            </Typography>
          </Box>
        ) : (
          <ResponsiveLine
            data={data}
            theme={{
              axis: {
                domain: { line: { stroke: colors.grey[100] } },
                legend: { text: { fill: colors.grey[100] } },
                ticks: {
                  line: { stroke: colors.grey[100], strokeWidth: 1 },
                  text: { fill: colors.grey[100], fontSize: isMobile ? 8 : 10 },
                },
              },
              legends: { text: { fill: colors.grey[100], fontSize: isMobile ? 8 : 10 } },
              tooltip: { container: { color: colors.primary[500] } },
            }}
            colors={data.map((d) => d.color)}
            margin={{ top: isMobile ? 10 : 20, right: isMobile ? 30 : 50, bottom: isMobile ? 40 : 50, left: isMobile ? 30 : 50 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 0,
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat={(value) => `${Math.round(value)}M VNĐ`}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: isMobile ? 45 : 45,
              legend: isDashboard ? undefined : selectedMonth ? "Ngày" : "Tháng",
              legendOffset: isMobile ? 30 : 36,
              legendPosition: "middle",
              format: (value) => value.split("/")[selectedMonth ? 0 : 0],
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: isDashboard ? undefined : "Doanh thu (triệu VNĐ)",
              legendOffset: isMobile ? -25 : -40,
              legendPosition: "middle",
              tickValues: tickValues,
              format: (value) => `${Math.round(value)}M`,
            }}
            enableGridX={false}
            enableGridY={true}
            pointSize={isMobile ? 4 : 6}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            enablePointLabel={false}
            useMesh={true}
            legends={isMobile || isDashboard ? [] : [
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 40,
                translateY: -10,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 50,
                itemHeight: 16,
                itemOpacity: 0.75,
                symbolSize: 10,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            tooltip={({ point }) => (
              <div style={{ padding: 12, background: colors.primary[800], color: colors.grey[100] }}>
                <strong>{point.data.x}</strong><br />
                {point.serieId}: {Math.round(point.data.y)}M VNĐ
              </div>
            )}
          />
        )}
      </Box>
    </Box>
  );
};

export default LineChart;