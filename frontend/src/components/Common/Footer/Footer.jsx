import React, { useState, useEffect } from "react";
import "../Footer/footer.css";
import { Col, Container, Row, ListGroup } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import api from "../../../utils/api"; // Import api

const Footer = () => {
  const [visible, setVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState(null); // State cho settings
  const [loading, setLoading] = useState(true); // State cho loading

  // Lấy dữ liệu từ API /api/v1/setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/api/v1/setting");
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin cài đặt:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Cập nhật mỗi giây

    return () => clearInterval(interval); // Cleanup
  }, []);

  const getFormattedDateTime = (date) => {
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh"
    });
  };

  const formattedDateTime = getFormattedDateTime(currentTime);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <div className="text-center my-3">Đang tải...</div>;
  }

  return (
    <>
      <footer className="footer">
        <Container>
          <Row className="py-5">
            <Col md="3" sm="6">
              <h4>🌍 Về Chúng Tôi</h4>
              <p>{settings?.slogan || "Chúng tôi cung cấp những tour du lịch chất lượng với trải nghiệm đáng nhớ nhất."}</p>
            </Col>

            <Col md="3" sm="6">
              <h4>🔗 Liên Kết Nhanh</h4>
              <ListGroup variant="flush">
                <ListGroup.Item><NavLink to="/">Trang Chủ</NavLink></ListGroup.Item>
                <ListGroup.Item><NavLink to="/about-us">Giới Thiệu</NavLink></ListGroup.Item>
                <ListGroup.Item><NavLink to="/contact-us">Liên Hệ</NavLink></ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md="3" sm="6">
              <h4>🌍 Khám Phá</h4>
              <ListGroup variant="flush">
                <ListGroup.Item><NavLink to="/faq">Câu Hỏi Thường Gặp</NavLink></ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md="3" sm="6">
              <h4>📍 Thông Tin Liên Hệ</h4>
              <p><i className="bi bi-geo-alt"></i> {settings?.address || "Phú Lộc, Thừa Thiên Huế"}</p>
              <p><i className="bi bi-envelope"></i> <a href={`mailto:${settings?.email || "gotravel@gmail.com"}`}>{settings?.email || "gotravel@gmail.com"}</a></p>
              <p><i className="bi bi-telephone"></i> <a href={`tel:${settings?.phone || "0779407905"}`}>{settings?.phone || "0779 407 905"}</a></p>
              <div className="social-links mt-3">
                <a href="https://www.facebook.com/profile.php?id=61575213824007" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i></a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><i className="bi bi-tiktok"></i></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="bi bi-youtube"></i></a>
              </div>
            </Col>
          </Row>

          <Row className="text-center copyright">
            <p>🕒 Hiện tại: <strong>{formattedDateTime}</strong></p>
            <Col><p>{settings?.copyright || "© 2025 Nhóm 66. All Rights Reserved."}</p></Col>
          </Row>
        </Container>
      </footer>

      {visible && (
        <div className="back-to-top" onClick={scrollTop}>
          <i className="bi bi-arrow-up"></i>
        </div>
      )}
    </>
  );
};

export default Footer;