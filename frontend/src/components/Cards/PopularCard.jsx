import React from "react";
import { Card, Stack, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../Cards/card.css";

const PopularCard = ({ val }) => {
  const navigate = useNavigate();
  const { title, images, price, discount, slug, timeStarts } = val;

  // Tính giá sau giảm giá
  const priceAfterDiscount = (price * (100 - (discount || 0)) / 100).toFixed(0);

  // Lấy thời gian khởi hành đầu tiên từ timeStarts
  const firstTimeStart = timeStarts && timeStarts.length > 0 ? timeStarts[0].timeDepart : null;

  // Lấy ngày hiện tại (không tính giờ để so sánh chính xác hơn)
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Kiểm tra nếu không có ngày khởi hành hoặc ngày khởi hành đã qua
  if (!firstTimeStart || new Date(firstTimeStart) < currentDate) {
    return null; // Không hiển thị tour nếu đã quá ngày
  }

  const handleCardClick = () => {
    if (slug) {
      navigate(`/tours/detail/${slug}`);
    } else {
      console.warn("Slug không tồn tại cho tour:", val);
    }
  };

  return (
    <Card className="rounded-2 shadow-sm popular" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <Card.Img
        variant="top"
        src={
          images && images.length > 0
            ? images[0]
            : "https://via.placeholder.com/300x200?text=Tour+Image"
        }
        className="img-fluid"
        alt={title || "Tour"}
      />
      <Card.Body>       
        <Card.Title>
          <span className="body-text text-dark text-decoration-none">
            {title || "Không có tiêu đề"}
          </span>
        </Card.Title>
        {discount > 0 && (
          <Badge bg="success" className="me-1">
            Giảm {discount}%
          </Badge>
        )}
      </Card.Body>

      <Card.Footer className="py-4">
        {discount > 0 && (
          <p className="text-decoration-line-through">
            {price.toLocaleString()} VNĐ
          </p>
        )}
        <Stack direction="horizontal" className="justify-content-between mt-3">
          <p>
            Từ <b>{Number(priceAfterDiscount).toLocaleString()} VNĐ</b>
          </p>
          <p>
            <i className="bi bi-clock"></i>{" "}
            <span>Ngày khởi hành: </span>
            {firstTimeStart
              ? new Date(firstTimeStart).toLocaleDateString("vi-VN")
              : "Chưa có ngày"}
          </p>
        </Stack>
      </Card.Footer>
    </Card>
  );
};

export default PopularCard;