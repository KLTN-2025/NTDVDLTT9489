import React from "react";
import { Card, Stack, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "../../pages/HotelService/hotel.css";

const HotelCard = ({ val }) => {
  const navigate = useNavigate();

  const handleViewHotel = () => {
    navigate(`/hotel-details/${val._id}`);
  };

  return (
    <Card className="hotel-card">
      <Card.Img
        variant="top"
        src={val.images && val.images[0] ? val.images[0] : "https://via.placeholder.com/300x200?text=Hotel+Image"}
        className="img-fluid"
        alt={val.name || "Hotel"}
      />
      <Card.Body>
        <Card.Text>
          <i className="bi bi-geo-alt"></i>
          <span className="text">
            {val.location?.city || "Không xác định"}, {val.location?.country || "Không xác định"}
          </span>
        </Card.Text>
        <Card.Title>
          <NavLink
            className="body-text text-dark text-decoration-none"
            to={`/hotel-details/${val._id}`}
          >
            {val.name || "Không có tên khách sạn"}
          </NavLink>
        </Card.Title>
        {val.averageRating && (
          <p className="review">
            <span>
              <i className="bi bi-star-fill me-1"></i>
            </span>
            <span>{val.averageRating.toFixed(1)} / 5</span>
          </p>
        )}
      </Card.Body>
      <Card.Footer className="py-4">
        <Button variant="success" className="mt-3" onClick={handleViewHotel}>
          <i className="bi bi-eye"></i> Xem khách sạn
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default HotelCard;