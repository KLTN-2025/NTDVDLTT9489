import React, { useEffect } from "react";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Container, Row, Col, Card } from "react-bootstrap";
import aboutImg from "../../assets/images/about/aboutimg.png";
import "./about.css";
import icons1 from "../../assets/images/icons/destination.png";
import icons2 from "../../assets/images/icons/best-price.png";
import icons3 from "../../assets/images/icons/quick.png";

const About = () => {

  useEffect(() => {
    document.title = "Giới thiệu GoTravel";
    window.scroll(0, 0);
  }, []);

  return (
    <>
      <Breadcrumbs title="Giới thiệu GoTravel" pagename="Giới thiệu" />
      <section className="py-5">
        <Container>
          <Row>
            <Col md="8">
              <div className="about-content">
                <div className="about-image position-relative">
                  <img
                    src={aboutImg}
                    alt="about"
                    className="img-fluid rounded-5"
                  />
                  <div className="about-image-content position-absolute top-50 end-0 p-md-4 p-3 rounded-5 shadow-sm">
                    <h3 className="h2 fw-bold text-white">
                      KHÁM PHÁ VIỆT NAM THEO MÙA!
                    </h3>
                  </div>
                </div>
              </div>
              <h2 className="h2 font-bold pt-4 pb-2">
                KHÁM PHÁ VIỆT NAM THEO MÙA!
              </h2>
              <p className="body-text mb-2">
                Việt Nam là một đất nước xinh đẹp với bốn mùa rõ rệt, mỗi mùa lại mang đến những trải nghiệm du lịch khác nhau. 
                <strong> GoTravel </strong> giúp bạn khám phá những điểm đến lý tưởng theo từng thời điểm trong năm:
              </p>

              <h3>🍃 Mùa xuân (Tháng 1 - Tháng 3)</h3>
              <p className="body-text mb-2">
                Trải nghiệm không khí Tết cổ truyền tại Hà Nội, Hội An, ngắm hoa đào, hoa mận nở rộ ở Mộc Châu, Sapa.
              </p>

              <h3>☀️ Mùa hè (Tháng 4 - Tháng 6)</h3>
              <p className="body-text mb-2">
                Thư giãn tại những bãi biển đẹp như Đà Nẵng, Nha Trang, Phú Quốc, hoặc khám phá vịnh Hạ Long bằng thuyền kayak.
              </p>

              <h3>🍂 Mùa thu (Tháng 7 - Tháng 9)</h3>
              <p className="body-text mb-2">
                Chiêm ngưỡng mùa lúa chín vàng rực ở Mù Cang Chải, Y Tý, tận hưởng khí trời se lạnh của Đà Lạt.
              </p>

              <h3>❄️ Mùa đông (Tháng 10 - Tháng 12)</h3>
              <p className="body-text mb-2">
                Săn tuyết tại Sapa, thưởng thức các món ăn nóng hổi đặc sản vùng cao và khám phá cao nguyên đá Đồng Văn.
              </p>
            </Col>

            <Col md="4">
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-item-center my-2">
                    <div className="rounded-circle bg-light shadow-sm bg-opacity-10 p-2">
                      <img src={icons1} alt="icon" className="img-fluid" />
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5">50+ Điểm đến hấp dẫn</Card.Title>
                  <p className="mb-2 body-text">
                    Khám phá nhiều địa danh nổi tiếng, từ bãi biển tuyệt đẹp đến núi rừng hùng vĩ.
                  </p>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-item-center my-2">
                    <div className="rounded-circle bg-light shadow-sm bg-opacity-10 p-2">
                      <img src={icons2} alt="icon" className="img-fluid" />
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5">Giá tốt nhất</Card.Title>
                  <p className="mb-2 body-text">
                    Chúng tôi cam kết mang đến giá cả hợp lý với nhiều ưu đãi hấp dẫn.
                  </p>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-item-center my-2">
                    <div className="rounded-circle bg-light shadow-sm bg-opacity-10 p-2">
                      <img src={icons3} alt="icon" className="img-fluid" />
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5">Đặt vé nhanh chóng</Card.Title>
                  <p className="mb-2 body-text">
                    Dễ dàng đặt vé và thanh toán trực tuyến chỉ với vài bước đơn giản.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default About;
