import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import api from "../../utils/api";
import { toast } from "react-toastify";
import "./categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Danh mục Tour - GoTravel";
    window.scrollTo(0, 0);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/categories");
      const categoriesWithTourCount = await Promise.all(
        response.data.map(async (category) => {
          try {
            const tourResponse = await api.get(`/tours/${category.slug}`);
            return { ...category, tourCount: tourResponse.data.length };
          } catch (error) {
            console.error(`Lỗi khi lấy tour cho danh mục ${category.slug}:`, error);
            return { ...category, tourCount: 0 };
          }
        })
      );
      setCategories(categoriesWithTourCount);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      toast.error("Không thể tải danh mục!");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs title="Danh mục Tour" pagename="Danh mục" />
      <section className="py-5 categories-section">
        <Container>
          <h1 className="fs-2 font-bold mb-5 text-center">Khám Phá Các Danh Mục Tour</h1>
          {loading ? (
            <p className="text-center">Đang tải danh mục...</p>
          ) : categories.length === 0 ? (
            <p className="text-center">Không có danh mục nào.</p>
          ) : (
            <Row>
              {categories.map((category, index) => (
                <Col xl={6} lg={6} md={6} sm={6} className="mb-4" key={index}>
                  <Card className="category-card shadow-sm border-0">
                    <div className="category-image-wrapper">
                      <Card.Img
                        variant="top"
                        src={
                          category.image ||
                          "https://via.placeholder.com/300x200?text=Category+Image"
                        }
                        alt={category.title}
                        className="category-image"
                        loading="lazy"
                      />
                      <div className="category-overlay"></div>
                      <div className="category-title-overlay">
                        <h3 className="category-title">{category.title}</h3>
                      </div>
                    </div>
                    <Card.Body className="category-body">
                      <Card.Text className="category-description">
                        {category.description || "Chưa có mô tả."}
                      </Card.Text>
                      <NavLink to={`/tours/category/${category.slug}`}>
                        <Button variant="primary" className="explore-btn">
                          Khám phá <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                      </NavLink>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </>
  );
};

export default Categories;