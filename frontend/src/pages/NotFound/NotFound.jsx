// pages/NotFound/NotFound.jsx
import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="not-found-container text-center">
      <div className="not-found-content">
        <img
          src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129563_1280.jpg" // Hình ảnh minh họa 404
          alt="404 Not Found"
          className="not-found-image"
        />
        <h1 className="not-found-title">404 - Trang không tìm thấy</h1>
        <p className="not-found-message">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/")}
          className="not-found-button"
        >
          Quay lại Trang chủ
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;