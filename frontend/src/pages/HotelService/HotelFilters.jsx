// src/pages/HotelService/HotelFilters.jsx
import React, { useState } from "react";
import { Form, Button, Accordion } from "react-bootstrap";

const HotelFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    location: "",
    priceRange: [0, 5000000], // Giá từ 0 đến 5 triệu VNĐ
    starRating: "",
    amenities: [],
    roomType: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handlePriceChange = (e, index) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = Number(e.target.value);
    setFilters({ ...filters, priceRange: newPriceRange });
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFilters({ ...filters, amenities: [...filters.amenities, value] });
    } else {
      setFilters({
        ...filters,
        amenities: filters.amenities.filter((amenity) => amenity !== value),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters); // Gửi dữ liệu bộ lọc lên component cha (HotelServices)
  };

  const handleReset = () => {
    const resetFilters = {
      location: "",
      priceRange: [0, 5000000],
      starRating: "",
      amenities: [],
      roomType: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="hotel-filter-form">
      <h4 className="mb-4">Lọc khách sạn</h4>
      <Form onSubmit={handleSubmit}>
        {/* Lọc theo vị trí */}
        <Form.Group className="mb-3">
          <Form.Label>Vị trí</Form.Label>
          <Form.Control
            type="text"
            name="location"
            placeholder="Nhập thành phố"
            value={filters.location}
            onChange={handleInputChange}
          />
        </Form.Group>

        {/* Lọc theo giá */}
        <Accordion defaultActiveKey="0" className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Khoảng giá (VNĐ/đêm)</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-2">
                <Form.Label>Từ</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  min={0}
                  step={100000}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Đến</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  min={filters.priceRange[0]}
                  step={100000}
                />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Lọc theo số sao */}
        <Form.Group className="mb-3">
          <Form.Label>Số sao</Form.Label>
          <Form.Select
            name="starRating"
            value={filters.starRating}
            onChange={handleInputChange}
          >
            <option value="">Tất cả</option>
            <option value="1">1 sao</option>
            <option value="2">2 sao</option>
            <option value="3">3 sao</option>
            <option value="4">4 sao</option>
            <option value="5">5 sao</option>
          </Form.Select>
        </Form.Group>

        {/* Lọc theo tiện ích */}
        <Accordion defaultActiveKey="0" className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Tiện ích</Accordion.Header>
            <Accordion.Body>
              {["Wifi", "Hồ bơi", "Bãi đỗ xe", "Nhà hàng", "Phòng gym"].map(
                (amenity) => (
                  <Form.Check
                    key={amenity}
                    type="checkbox"
                    label={amenity}
                    value={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                  />
                )
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Lọc theo loại phòng */}
        <Form.Group className="mb-3">
          <Form.Label>Loại phòng</Form.Label>
          <Form.Select
            name="roomType"
            value={filters.roomType}
            onChange={handleInputChange}
          >
            <option value="">Tất cả</option>
            <option value="Đơn">Phòng đơn</option>
            <option value="Đôi">Phòng đôi</option>
            <option value="Gia đình">Phòng gia đình</option>
            <option value="Suite">Suite</option>
          </Form.Select>
        </Form.Group>

        {/* Nút áp dụng và reset */}
        <div className="d-flex justify-content-between">
          <Button variant="primary" type="submit">
            Áp dụng
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            Đặt lại
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default HotelFilters;