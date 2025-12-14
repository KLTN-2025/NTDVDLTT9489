import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Common/Header/Header";
import { useCart } from "../../context/CartContext";
import "./cart.css"; // Sử dụng file CSS chung

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart, isLoading: isCartLoading } = useCart();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [orderCode, setOrderCode] = useState(null);

  useEffect(() => {
    document.title = "Kết quả thanh toán - GoTravel";
    window.scrollTo(0, 0);
    fetchPaymentStatus();
  }, []);

  const fetchPaymentStatus = () => {
    setIsCheckingPayment(true);
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");
    const message = searchParams.get("message");

    if (message) {
      setPaymentStatus({ success: false, message: decodeURIComponent(message) });
      toast.error(decodeURIComponent(message));
    } else if (status && orderCode) {
      switch (status) {
        case "success":
          setPaymentStatus({ success: true, message: "Thanh toán thành công!" });
          setOrderCode(orderCode);
          fetchCart()
            .then(() => toast.success("Giỏ hàng đã được làm mới!"))
            .catch((err) => {
              console.error("Lỗi khi làm mới giỏ hàng:", err);
              toast.error("Không thể làm mới giỏ hàng, vui lòng thử lại!");
            });
          break;
        case "fail":
          setPaymentStatus({
            success: false,
            message: "Thanh toán thất bại! Vui lòng thử lại.",
          });
          toast.error("Thanh toán thất bại!");
          break;
        case "invalid":
          setPaymentStatus({
            success: false,
            message: "Dữ liệu thanh toán không hợp lệ!",
          });
          toast.error("Dữ liệu không hợp lệ!");
          break;
        case "error":
        default:
          setPaymentStatus({
            success: false,
            message: "Có lỗi xảy ra trong quá trình thanh toán!",
          });
          toast.error("Lỗi hệ thống!");
          break;
      }
    } else {
      setPaymentStatus({
        success: false,
        message: "Thông tin thanh toán không hợp lệ!",
      });
      toast.error("Thông tin thanh toán không hợp lệ!");
    }

    setIsCheckingPayment(false);
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  return (
    <>
      <Header />
      <section className="payment-return-section">
        <Container>
          {isCheckingPayment ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Đang kiểm tra trạng thái thanh toán...</p>
            </div>
          ) : (
            <Card className="payment-card shadow-sm">
              <Card.Body>
                <h2
                  className={`text-center istnie mb-4 ${
                    paymentStatus?.success ? "text-success" : "text-danger"
                  }`}
                >
                  {paymentStatus?.success ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
                </h2>
                <p className="text-center mb-4 text-muted">{paymentStatus?.message}</p>

                {paymentStatus?.success && orderCode && (
                  <Alert variant="info" className="text-center">
                    <h4>Thông tin đơn hàng</h4>
                    <p>
                      <strong>Mã đơn hàng:</strong> {orderCode}
                    </p>
                    <p>
                      Một email xác nhận đã được gửi đến địa chỉ của bạn. Vui lòng kiểm tra!
                    </p>
                  </Alert>
                )}

                <div className="d-flex justify-content-center gap-3">
                  <Button
                    variant="primary"
                    onClick={handleReturnHome}
                    disabled={isCartLoading}
                    className="btn-hover"
                  >
                    {isCartLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang tải...
                      </>
                    ) : (
                      "Trở lại trang chủ"
                    )}
                  </Button>
                  {paymentStatus?.success && (
                    <Button
                      variant="success"
                      onClick={handleViewOrders}
                      disabled={isCartLoading}
                      className="btn-hover"
                    >
                      Đơn hàng của tôi
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>
      </section>
    </>
  );
};

export default PaymentResult;