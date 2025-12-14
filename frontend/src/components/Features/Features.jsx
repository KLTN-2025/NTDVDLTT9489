// src/pages/Features/Features.jsx
import React from "react";
import "../Features/features.css";

import feature1 from "../../assets/images/feature/beach-umbrella.png";
import feature2 from "../../assets/images/feature/deal.png";
import feature3 from "../../assets/images/feature/location.png";
import feature4 from "../../assets/images/feature/medal.png";
import { Card, Col, Container, Row } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Features = () => {
  const settings = {
    dots: true, // Hiển thị chấm điều hướng trên mọi kích thước màn hình
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false, // Tắt hoàn toàn các nút điều hướng
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
    ],
  };

  const featureList = [
    {
      id: 0,
      image: feature1,
      title: "Khám phá những khả năng",
      description: "Với gần nửa triệu điểm tham quan, khách sạn & hơn thế nữa, bạn chắc chắn sẽ tìm thấy niềm vui.",
    },
    {
      id: 1,
      image: feature2,
      title: "Tận hưởng ưu đãi & khuyến mãi",
      description: "Hoạt động chất lượng. Giá cả tuyệt vời. Cùng với đó, tích điểm để tiết kiệm hơn.",
    },
    {
      id: 2,
      image: feature3,
      title: "Khám phá dễ dàng",
      description: "Đặt phút chót, bỏ qua hàng chờ & hủy miễn phí để chuyến đi thuận tiện hơn.",
    },
    {
      id: 3,
      image: feature4,
      title: "Hành trình đáng tin cậy",
      description: "Đọc đánh giá & nhận hỗ trợ khách hàng đáng tin cậy. Chúng tôi đồng hành cùng bạn trên từng bước đường.",
    },
  ];

  return (
    <section className="feature-section">
      <Container>
        <Row>
          <Col md="12">
            <h2 className="section-title text-center mb-5">Tại sao nên chọn chúng tôi?</h2>
            <Slider {...settings}>
              {featureList.map((feature) => (
                <Card key={feature.id} className="feature-card">
                  <Card.Img
                    variant="top"
                    src={feature.image}
                    className="img-fluid feature-image"
                    alt={feature.title}
                    loading="lazy"
                  />
                  <Card.Body>
                    <Card.Title className="feature-title">{feature.title}</Card.Title>
                    <Card.Text className="feature-description">{feature.description}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </Slider>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features;