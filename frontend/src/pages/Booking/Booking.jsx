// src/pages/Booking/Booking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Col, Container, Form, Row, Card, ListGroup } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../utils/api";
import { toast } from "react-toastify";
import "../Booking/booking.css";

const Booking = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [priceSummary, setPriceSummary] = useState({
    basePrice: 28660,
    discount: 20,
    taxes: 28660,
    total: 28660,
  });
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy tourId từ query params hoặc state
  const query = new URLSearchParams(location.search);
  const tourId = query.get("tourId") || location.state?.tourId;

  // Kiểm tra đăng nhập và lấy thông tin tour
  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để đặt tour!");
          navigate("/login");
          return;
        }

        if (!tourId) {
          toast.error("Không tìm thấy tour để đặt!");
          navigate("/tours");
          return;
        }

        const response = await api.get(`/tours/${tourId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tourData = response.data.data;
        setTour(tourData);

        // Cập nhật giá dựa trên tour
        setPriceSummary({
          basePrice: tourData.price,
          discount: tourData.price * 0.1, // Giả định giảm giá 10%
          taxes: tourData.price * 0.05, // Giả định thuế 5%
          total: tourData.price * 0.95, // Tổng sau giảm giá và thuế
        });
      } catch (error) {
        toast.error("Không thể tải thông tin tour!");
        navigate("/tours");
      }
    };

    fetchTourDetails();
    document.title = "Đặt Tour - GoTravel";
    window.scrollTo(0, 0);
  }, [tourId, navigate]);

  // Xử lý thay đổi form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Xác thực dữ liệu
    const { firstName, lastName, email, phone } = formData;
    if (!firstName || !lastName || !email || !phone) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Email không hợp lệ!");
      setLoading(false);
      return;
    }

    if (!/^\d{10,}$/.test(phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      setLoading(false);
      return;
    }

    if (endDate < startDate) {
      toast.error("Ngày về phải sau ngày đi!");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const bookingData = {
        tourId,
        userId: JSON.parse(localStorage.getItem("user"))?.id,
        firstName,
        lastName,
        email,
        phone,
        startDate,
        endDate,
        totalPrice: priceSummary.total,
      };

      await api.post("/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Đặt tour thành công!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Đặt tour thất bại! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs title="Đặt Tour" pagename="Đặt Tour" />
      <section className="booking-section py-5">
        <Container>
          <Row>
            <Col md={8} lg={8}>
              <div className="booking-form-warp border rounded-3">
                <div className="form-title px-4 border-bottom py-3">
                  <h3 className="h4 font-bold m-0">Thông Tin Của Bạn</h3>
                </div>

                <Form className="p-4" onSubmit={handleSubmit}>
                  <Row>
                    <Form.Group as={Col} md="6" controlId="firstName" className="mb-4">
                      <Form.Label>Họ</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ của bạn"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="6" controlId="lastName" className="mb-4">
                      <Form.Label>Tên</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên của bạn"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="6" controlId="email" className="mb-4">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="6" controlId="phone" className="mb-4">
                      <Form.Label>Số Điện Thoại</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="6" controlId="checkin" className="mb-4">
                      <Form.Label className="d-block">Ngày Đi</Form.Label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={new Date()}
                        className="form-control w-100"
                        dateFormat="dd, MMMM, yyyy"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="6" controlId="checkout" className="mb-4">
                      <Form.Label className="d-block">Ngày Về</Form.Label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        className="form-control w-100"
                        dateFormat="dd, MMMM, yyyy"
                      />
                    </Form.Group>

                    <Col md="12">
                      <button className="primaryBtn" type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Gửi Ngay"}
                      </button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>

            <Col md={4} lg={4}>
              <Card className="card-info p-0 shadow-sm bg-white">
                <Card.Header>
                  <h1 className="font-bold h4 mt-2">Tóm Tắt Giá</h1>
                </Card.Header>
                <Card.Body className="pb-0">
                  <ListGroup>
                    <ListGroup.Item className="border-0 d-flex justify-content-between h5 pt-0">
                      <span>Giá Cơ Bản</span>
                      <strong>{priceSummary.basePrice.toLocaleString()} VNĐ</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 d-flex justify-content-between h5 pt-0">
                      <span>
                        Giảm Giá{" "}
                        <span className="badge bg-danger">10%</span>
                      </span>
                      <strong>{priceSummary.discount.toLocaleString()} VNĐ</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 d-flex justify-content-between h5 pt-0">
                      <span>Thuế & Phí</span>
                      <strong>{priceSummary.taxes.toLocaleString()} VNĐ</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between py-4">
                  <span className="font-bold h5">Tổng Thanh Toán</span>
                  <strong className="font-bold h5">{priceSummary.total.toLocaleString()} VNĐ</strong>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Booking;