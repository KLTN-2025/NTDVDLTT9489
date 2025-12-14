import React, { useState, useEffect } from "react";
import { Container, Card, ListGroup, Alert, Spinner, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "./orderdetail.css";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Chi tiết đơn hàng - GoTravel";
    window.scrollTo(0, 0);
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      console.log("Fetching order detail for orderId:", orderId);
      const response = await api.get(`/users/ordersDetail/${orderId}`);
      console.log("API Response:", response.data);
      if (response.data.code === 200) {
        if (response.data.data) {
          setOrder(response.data.data.order);
          const rawTours = response.data.data.tours || [];
          const rawHotels = response.data.data.hotels || [];

          const toursWithQuantity = rawTours.map((tour) => {
            const totalQuantity = tour.timeStarts?.reduce((sum, time) => sum + (time.stock || 0), 0) || 0;
            return { ...tour, quantity: totalQuantity };
          });

          const processedHotels = rawHotels.map((hotel) => ({
            ...hotel,
            rooms: hotel.rooms.map((room) => {
              const checkInDate = room.checkIn ? new Date(room.checkIn) : null;
              const checkOutDate = room.checkOut ? new Date(room.checkOut) : null;
              const numNights = checkInDate && checkOutDate && checkInDate < checkOutDate
                ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
                : 0;
              if (checkInDate && checkOutDate && checkInDate >= checkOutDate) {
                console.warn(`Dữ liệu ngày không hợp lệ cho phòng ${room.roomInfo?.name}: checkIn=${room.checkIn}, checkOut=${room.checkOut}`);
              }
              return { ...room, numNights };
            }),
          }));

          setTours(toursWithQuantity);
          setHotels(processedHotels);

          console.log("Processed Tours Data:", JSON.stringify(toursWithQuantity, null, 2));
          console.log("Processed Hotels Data:", JSON.stringify(processedHotels, null, 2));
        } else {
          toast.error("Đơn hàng không tồn tại hoặc bạn không có quyền truy cập!");
          console.log("No data returned for orderId:", orderId);
        }
      } else if (response.data.code === 404) {
        toast.error("Không tìm thấy đơn hàng! Vui lòng kiểm tra lại mã đơn hàng.");
        console.log("404 Error from backend for orderId:", orderId, "Response:", response.data);
      } else {
        toast.error(response.data.message || "Không thể tải chi tiết đơn hàng!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error.response?.data || error.message);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          navigate("/login");
        } else if (error.response.status === 404) {
          toast.error("Không tìm thấy đơn hàng! Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ.");
          console.log("404 Error for orderId:", orderId, "Response:", error.response.data);
        } else {
          toast.error(error.response.data?.message || "Không thể tải chi tiết đơn hàng. Vui lòng thử lại!");
        }
      } else {
        toast.error("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return { className: "status-pending", label: "Đang chờ", canCancel: true };
      case "paid":
        return { className: "status-paid", label: "Đã thanh toán", canCancel: false };
      case "cancelled":
        return { className: "status-cancelled", label: "Đã hủy", canCancel: false };
      default:
        return { className: "", label: status, canCancel: false };
    }
  };

  const handleCancelOrder = async () => {
    if (!order || order.status === "cancelled" || order.status === "paid") return;

    try {
      setLoading(true);
      const response = await api.patch(`/api/v1/checkout/cancel/${orderId}`, {
        numberAccount: "1234567890",
        bankName: "Ngân hàng ABC",
      });
      if (response.data.code === 200) {
        toast.success("Hủy đơn hàng thành công!");
        fetchOrderDetail();
      } else {
        toast.error(response.data.message || "Hủy đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          Không tìm thấy đơn hàng! Vui lòng kiểm tra lại mã đơn hàng hoặc quay lại danh sách đơn hàng.
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate("/orders")}>
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const statusData = getStatusClass(order.status);

  return (
    <>
      <Breadcrumbs title="Chi tiết đơn hàng" pagename="Chi tiết đơn hàng" />
      <section className="order-detail-section py-5">
        <Container>
          <Button variant="secondary" onClick={() => navigate("/orders")} className="mb-3">
            Quay lại danh sách đơn hàng
          </Button>
          <h1>Chi tiết đơn hàng</h1>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Thông tin đơn hàng</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Mã đơn hàng:</strong> {order.orderCode || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Ngày đặt:</strong>{" "}
                  {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "N/A"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Tổng tiền:</strong> {order.totalPrice ? order.totalPrice.toLocaleString() : "0"} VNĐ
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Trạng thái:</strong>{" "}
                  <span className={`status-badge ${statusData.className}`}>
                    {statusData.label}
                  </span>
                  {statusData.canCancel && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-3"
                      onClick={handleCancelOrder}
                      disabled={loading}
                    >
                      {loading ? <Spinner animation="border" size="sm" /> : "Hủy đơn hàng"}
                    </Button>
                  )}
                </ListGroup.Item>
              </ListGroup>

              <Card.Title className="mt-4">Thông tin người đặt</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Họ tên:</strong> {order.userInfor?.fullName || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Số điện thoại:</strong> {order.userInfor?.phone || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {order.userInfor?.email || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Ghi chú:</strong>{" "}
                  {order.userInfor?.note || "Không có ghi chú"}
                </ListGroup.Item>
              </ListGroup>

              <Card.Title className="mt-4">Danh sách tour</Card.Title>
              {tours && tours.length > 0 ? (
                tours.map((tour, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <Card.Title>Tour {index + 1}</Card.Title>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Tên Tour:</strong> {tour.tourInfo?.title || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Giá (sau giảm giá):</strong>{" "}
                          {tour.priceNew ? tour.priceNew.toLocaleString() : "0"} VNĐ
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Địa điểm tập trung:</strong> {tour.tourInfo?.gathering || "Không có"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Thời gian khởi hành:</strong>
                          {tour.timeStarts && tour.timeStarts.length > 0 ? (
                            <ul>
                              {tour.timeStarts.map((time, idx) => (
                                <li key={idx}>
                                  {new Date(time.timeDepart).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} - Số lượng: {time.stock || 0}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "Không có thời gian khởi hành"
                          )}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Tổng số lượng:</strong> {tour.quantity || 0}
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Alert variant="info">Không có tour nào trong đơn hàng này.</Alert>
              )}

              <Card.Title className="mt-4">Danh sách khách sạn</Card.Title>
              {hotels && hotels.length > 0 ? (
                hotels.map((hotel, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <Card.Title>Khách sạn {index + 1}</Card.Title>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Tên Khách sạn:</strong> {hotel.hotelInfo?.name || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Địa chỉ:</strong>{" "}
                             {hotel.hotelInfo?.location?.address
                           ? `${hotel.hotelInfo.location.address}, ${hotel.hotelInfo.location.city}, ${hotel.hotelInfo.location.country}`
                          : "Không có"}
                                </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Phòng:</strong>
                          {hotel.rooms && hotel.rooms.length > 0 ? (
                            <ul>
                              {hotel.rooms.map((room, idx) => (
                                <li key={idx}>
                                  Tên Phòng: {room.roomInfo?.name || "N/A"} - Giá: {room.price ? room.price.toLocaleString() : "0"} VNĐ - Số lượng: {room.quantity || 0}
                                  {room.checkIn && room.checkOut && (
                                    <>
                                      {" - Check-in: "}{new Date(room.checkIn).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                                      {" - Check-out: "}{new Date(room.checkOut).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                                      {" - Số đêm: "}{room.numNights || 0}
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "Không có phòng nào"
                          )}
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Alert variant="info">Không có khách sạn nào trong đơn hàng này.</Alert>
              )}

              {order.voucherCode && (
                <ListGroup variant="flush" className="mt-4">
                  <ListGroup.Item>
                    <strong>Mã giảm giá:</strong> {order.voucherCode}
                  </ListGroup.Item>
                </ListGroup>
              )}

              {order.status === "cancelled" && order.inforCancel && (
                <>
                  <Card.Title className="mt-4">Thông tin hủy đơn hàng</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Số tài khoản:</strong> {order.inforCancel.numberAccount || "Không có"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Tên ngân hàng:</strong> {order.inforCancel.bankName || "Không có"}
                    </ListGroup.Item>
                  </ListGroup>
                </>
              )}
            </Card.Body>
          </Card>
        </Container>
      </section>
    </>
  );
};

export default OrderDetail;