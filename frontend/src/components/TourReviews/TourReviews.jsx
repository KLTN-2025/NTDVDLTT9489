import React, { useState, useEffect } from "react";
import { Card, Form, Button, ListGroup, Row, Col, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TourReviews = ({ tourId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (tourId) {
      fetchReviews();
    }
  }, [tourId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tour-reviews/get/${tourId}`);
      if (response.data.code === 200) {
        setReviews(response.data.reviews);
        
        // Kiểm tra xem user đã review chưa
        if (user) {
          const userReview = response.data.reviews.find(
            (review) => review.user_id._id === user._id
          );
          setHasReviewed(!!userReview);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
      toast.error("Không thể tải danh sách đánh giá!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/tour-reviews/${tourId}`, {
        rating,
        comment,
      });

      if (response.data.code === 200) {
        toast.success("Đánh giá tour thành công!");
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      toast.error(
        error.response?.data?.message || "Không thể gửi đánh giá!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      const response = await api.delete(`/tour-reviews/delete/${reviewId}`);
      if (response.data.code === 200) {
        toast.success("Xóa đánh giá thành công!");
        fetchReviews();
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      toast.error(
        error.response?.data?.message || "Không thể xóa đánh giá!"
      );
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi bi-star${i <= rating ? "-fill" : ""}`}
          style={{ color: "#FFD700", marginRight: "2px" }}
        ></i>
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="tour-reviews-section">
      <h1 className="section-title mb-4">Đánh giá của khách hàng</h1>

      {reviews.length > 0 && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={6} className="text-center border-end">
                <h2 className="display-4 fw-bold text-warning mb-0">
                  {calculateAverageRating()}
                </h2>
                <div className="mb-2">{renderStars(Math.round(calculateAverageRating()))}</div>
                <p className="text-muted mb-0">
                  Dựa trên {reviews.length} đánh giá
                </p>
              </Col>
              <Col md={6}>
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="d-flex align-items-center mb-2">
                        <span className="me-2" style={{ minWidth: "60px" }}>
                          {star} <i className="bi bi-star-fill text-warning"></i>
                        </span>
                        <div
                          className="progress flex-grow-1 me-2"
                          style={{ height: "8px" }}
                        >
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span style={{ minWidth: "40px" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {!hasReviewed && user && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Viết đánh giá của bạn</h5>
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Đánh giá của bạn</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi bi-star${star <= rating ? "-fill" : ""}`}
                      style={{
                        fontSize: "1.5rem",
                        color: "#FFD700",
                        cursor: "pointer",
                      }}
                      onClick={() => setRating(star)}
                    ></i>
                  ))}
                  <span className="ms-2">({rating}/5)</span>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nhận xét</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !comment.trim()}
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {!user && (
        <Alert variant="info" className="mb-4">
          Vui lòng{" "}
          <Alert.Link href="/login">đăng nhập</Alert.Link> để đánh giá tour này.
        </Alert>
      )}

      {hasReviewed && user && (
        <Alert variant="success" className="mb-4">
          Bạn đã đánh giá tour này rồi. Cảm ơn bạn đã chia sẻ!
        </Alert>
      )}

      <div className="reviews-list">
        <h5 className="mb-3">Tất cả đánh giá ({reviews.length})</h5>
        {loading && reviews.length === 0 ? (
          <p>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <Alert variant="secondary">
            Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên đánh giá!
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {reviews.map((review) => (
              <ListGroup.Item key={review._id} className="px-0 py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex gap-3 flex-grow-1">
                    <div>
                      {review.user_id?.avatar ? (
                        <img
                          src={review.user_id.avatar}
                          alt={review.user_id.fullName}
                          className="rounded-circle"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: "50px", height: "50px" }}
                        >
                          <span className="fw-bold">
                            {review.user_id?.fullName?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 fw-bold">
                            {review.user_id?.fullName || "Khách hàng"}
                          </h6>
                          <div className="mb-2">{renderStars(review.rating)}</div>
                        </div>
                        <small className="text-muted">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </small>
                      </div>
                      <p className="mb-0 text-secondary">{review.comment}</p>
                      {user && review.user_id._id === user._id && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0 mt-2"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          <i className="bi bi-trash"></i> Xóa đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default TourReviews;
