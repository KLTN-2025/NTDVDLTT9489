import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import {
  Col,
  Container,
  Row,
  Card,
  ListGroup,
  Form,
  FloatingLabel,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import image from "../../assets/images/new/contact-us.png";
import api from "../../utils/api";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    captchaToken: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const captchaRef = useRef(null);
  const scriptRef = useRef(null);
  const recaptchaRendered = useRef(false); // Theo dõi trạng thái render của reCAPTCHA

  useEffect(() => {
    document.title = "Liên Hệ";
    window.scrollTo(0, 0);

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const loadRecaptchaScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      scriptRef.current = script;

      script.onload = () => {
        const siteKey = "6LfEXzMrAAAAAFu5d_03lNZpk_pkGclN3Ma6qgTR"; // Khóa reCAPTCHA của bạn
        if (!siteKey) {
          console.error("Site key is missing or invalid.");
          setErrors((prev) => ({
            ...prev,
            captcha: "Không thể tải reCAPTCHA do thiếu site key. Vui lòng kiểm tra cấu hình!",
          }));
          return;
        }

        if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
          // Chỉ render nếu chưa được render
          if (!recaptchaRendered.current && captchaRef.current) {
            try {
              window.grecaptcha.render(captchaRef.current, {
                sitekey: siteKey,
                callback: (token) => {
                  setFormData((prev) => ({ ...prev, captchaToken: token }));
                  setErrors((prev) => ({ ...prev, captcha: "" }));
                },
                "expired-callback": () => {
                  setFormData((prev) => ({ ...prev, captchaToken: "" }));
                  setErrors((prev) => ({
                    ...prev,
                    captcha: "CAPTCHA đã hết hạn, vui lòng kiểm tra lại!",
                  }));
                },
              });
              recaptchaRendered.current = true; // Đánh dấu đã render
            } catch (error) {
              console.error("Error rendering reCAPTCHA:", error);
              setErrors((prev) => ({
                ...prev,
                captcha: "Lỗi khi hiển thị reCAPTCHA. Vui lòng thử lại!",
              }));
            }
          }
        } else {
          console.error("reCAPTCHA script loaded but grecaptcha is not available.");
          handleRecaptchaLoadFailure();
        }
      };

      script.onerror = () => {
        console.error("Failed to load reCAPTCHA script.");
        handleRecaptchaLoadFailure();
      };
    };

    const handleRecaptchaLoadFailure = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retry loading reCAPTCHA (${retryCount}/${maxRetries})...`);
        setTimeout(loadRecaptchaScript, retryDelay);
      } else {
        setErrors((prev) => ({
          ...prev,
          captcha: "Không thể tải reCAPTCHA sau nhiều lần thử. Vui lòng kiểm tra kết nối hoặc thử lại sau!",
        }));
      }
    };

    loadRecaptchaScript();

    return () => {
      // Cleanup: Xóa script và reset reCAPTCHA
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      if (captchaRef.current) {
        captchaRef.current.innerHTML = "";
      }
      if (window.grecaptcha) {
        try {
          window.grecaptcha.reset(); // Reset reCAPTCHA
        } catch (error) {
          console.error("Error resetting reCAPTCHA:", error);
        }
      }
      recaptchaRendered.current = false; // Reset trạng thái render
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên!";
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email!";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ!";
    }
    if (!formData.message.trim()) newErrors.message = "Vui lòng nhập nội dung!";
    if (!formData.captchaToken) newErrors.captcha = "Vui lòng xác minh CAPTCHA!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/v1/feedbacks", formData);
      if (response.data.code === 200) {
        setShowSuccess(true);
        toast.success("Gửi phản hồi thành công!");
        setFormData({ name: "", email: "", message: "", captchaToken: "" });
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(response.data.message || "Gửi phản hồi thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra! Vui lòng thử lại.";
      toast.error(errorMessage);
      setErrors((prev) => ({ ...prev, api: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumbs title="Liên Hệ" pagename="Liên Hệ" />
      <section className="contact pt-5">
        <Container>
          <Row>
            <Col md="12">
              <h1 className="mb-2 h1 font-bold">Kết nối với chúng tôi ngay bây giờ!</h1>
              <p className="body-text mt-1">
                Hãy liên hệ với GoTravel để nhận được sự hỗ trợ nhanh chóng nhất!
              </p>
            </Col>
          </Row>
          <Row className="py-5">
            <Col lg="4" md="6" className="mb-4 mb-lg-0">
              <Card className="border-0 shadow rounded-3 mb-4">
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-item-search my-2">
                    <div className="bg-info rounded-circle text-info shadow-sm bg-opacity-10 p-3 mb-2">
                      <i className="bi bi-headset h3"></i>
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5">Điện thoại</Card.Title>
                  <p className="mb-3 body-text">Hỗ trợ khách hàng 24/7</p>
                  <div className="d-block justify-content-between">
                    <a type="button" className="btn btn-light me-2 btn-sm">
                      <i className="bi bi-phone me-1"></i> 0878784398
                    </a>
                    <a type="button" className="btn btn-light me-2 btn-sm">
                      <i className="bi bi-telephone me-1"></i> +84 779094839
                    </a>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg="4" md="6" className="mb-4 mb-lg-0">
              <Card className="border-0 shadow rounded-3 mb-4">
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-item-search my-2">
                    <div className="bg-danger rounded-circle text-danger shadow-sm bg-opacity-10 p-3 mb-2">
                      <i className="bi bi-envelope h3"></i>
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5">Email</Card.Title>
                  <p className="mb-3 body-text">Phản hồi nhanh trong 24h</p>
                  <div className="d-block justify-content-between">
                    <a type="button" className="btn btn-light me-2 btn-sm">
                      <i className="bi bi-envelope me-2"></i> gotravel@gmail.com
                    </a>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg="4" md="12" className="mb-4 mb-lg-0">
              <Card className="border-0 shadow rounded-3 mb-4">
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-item-search my-2">
                    <div className="bg-warning rounded-circle text-warning shadow-sm bg-opacity-10 p-3 mb-2">
                      <i className="bi bi-globe h3"></i>
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5">Social Media</Card.Title>
                  <p className="mb-3 body-text">Theo dõi chúng tôi để cập nhật thông tin mới nhất</p>
                  <div className="d-block justify-content-center">
                    <ListGroup horizontal className="justify-content-center">
                      <ListGroup.Item className="border-0">
                        <a href="https://facebook.com"><i className="bi bi-facebook"></i></a>
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0">
                        <a href="https://instagram.com"><i className="bi bi-instagram"></i></a>
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0">
                        <a href="https://twitter.com"><i className="bi bi-twitter"></i></a>
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0">
                        <a href="https://youtube.com"><i className="bi bi-youtube"></i></a>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="py-5 align-items-center">
            <Col xl="6" md="6" className="d-none d-md-block">
              <img src={image} alt="" className="img-fluid me-3" />
            </Col>
            <Col xl="6" md="6">
              <Card className="bg-light p-4 border-0 shadow-sm">
                <div className="form-box">
                  <h1 className="h3 font-bold mb-4">Gửi phản hồi cho chúng tôi</h1>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md="6">
                        <FloatingLabel
                          controlId="name"
                          label="Họ và tên"
                          className="mb-4"
                        >
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Họ và tên"
                            isInvalid={!!errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>
                      <Col md="6">
                        <FloatingLabel
                          controlId="email"
                          label="Địa chỉ email"
                          className="mb-4"
                        >
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            isInvalid={!!errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>

                      <Col md="12">
                        <FloatingLabel controlId="message" label="Nội dung">
                          <Form.Control
                            as="textarea"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Nội dung"
                            style={{ height: "126px" }}
                            isInvalid={!!errors.message}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.message}
                          </Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>

                      <Col md="12" className="mt-3" ref={captchaRef}></Col>
                      {errors.captcha && (
                        <Alert variant="danger" className="mt-2">
                          {errors.captcha}
                        </Alert>
                      )}
                      {errors.api && (
                        <Alert variant="danger" className="mt-2">
                          {errors.api}
                        </Alert>
                      )}
                    </Row>
                    {showSuccess && (
                      <Alert variant="success" className="mt-3">
                        Phản hồi của bạn đã được gửi thành công!
                      </Alert>
                    )}
                    <Button
                      variant="primary"
                      className="mt-3"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Gửi tin"
                      )}
                    </Button>
                  </Form>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Contact;