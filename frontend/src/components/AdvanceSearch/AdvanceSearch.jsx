import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../AdvanceSearch/search.css";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import api from "../../utils/api";
import { toast } from "react-toastify";

const AdvanceSearch = () => {
  const [searchTab, setSearchTab] = useState("tour");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gọi API để lấy gợi ý khi người dùng nhập
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery) {
        setSuggestions([]);
        return;
      }

      try {
        const endpoint = searchTab === "tour" ? "/search/tours" : "/search/hotels";
        const response = await api.get(endpoint, {
          params: { keyword: searchQuery, mode: "suggestion" },
        });

        if (response.data.code === 200) {
          const items = searchTab === "tour" ? response.data.tours : response.data.hotels;
          
          const formattedSuggestions = items.map(item => ({
            _id: item._id,
            name: searchTab === "tour" ? item.title : item.name,
            image: item.avatar,
            description: searchTab === "tour" ? "Tour du lịch" : `${item.location.city}, ${item.location.country}`,
            slug: item.slug
          }));
          setSuggestions(formattedSuggestions);
        } else {
          toast.error(response.data.message || "Không thể lấy gợi ý!");
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý:", error);
        toast.error("Có lỗi xảy ra khi lấy gợi ý!");
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchTab]);

  // Xử lý tìm kiếm khi nhấn nút
  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    setLoading(true);

    try {
      const endpoint = searchTab === "tour" ? "/search/tours" : "/search/hotels";
      const response = await api.get(endpoint, {
        params: { keyword: searchQuery, mode: "full" },
      });

      if (response.data.code === 200) {
        if (searchTab === "tour") {
          navigate("/tours", { state: { tours: response.data.tours } });
        } else {
          navigate("/hotel-services", { state: { hotels: response.data.hotels } });
        }
        toast.success("Tìm kiếm thành công!");
      } else {
        toast.error(response.data.message || "Tìm kiếm thất bại!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn một gợi ý
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);
    if (searchTab === "tour") {
      if (!suggestion.slug) {
        toast.error("Không tìm thấy thông tin tour!");
        return;
      }
      navigate(`/tours/detail/${suggestion.slug}`);
    } else {
      if (!suggestion._id) {
        toast.error("Không tìm thấy thông tin khách sạn!");
        return;
      }
      navigate(`/hotel-details/${suggestion._id}`); // Đã đúng, điều hướng đến /hotels/:hotelId
    }
  };

  return (
    <section className="box-search-advance">
      <Container>
        <Row>
          <Col md={12} xs={12}>
            <div className="box-search shadow-sm">
              {/* Tab Tour và Khách sạn */}
              <div className="search-tabs">
                <button
                  className={`tab-btn ${searchTab === "tour" ? "active" : ""}`}
                  onClick={() => {
                    setSearchTab("tour");
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                >
                  <i className="bi bi-bus-front me-2"></i>
                  Tour
                </button>
                <button
                  className={`tab-btn ${searchTab === "hotel" ? "active" : ""}`}
                  onClick={() => {
                    setSearchTab("hotel");
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                >
                  <i className="bi bi-building me-2"></i>
                  Hotel
                </button>
              </div>

              {/* Ô tìm kiếm */}
              <div className="search-container">
                <div className="item-search">
                  <Form.Control
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchTab === "tour" ? "Nhập tên tour" : "Nhập địa điểm"
                    }
                    className="search-input"
                  />
                  {/* Danh sách gợi ý */}
                  {suggestions.length > 0 && (
                    <div className="suggestions-container">
                      <div className="suggestions-list">
                        <h6>Gợi ý kết quả</h6>
                        <ul className="results-list">
                          {suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="result-item"
                            >
                              <img
                                src={suggestion.image || "/default-image.jpg"}
                                alt={suggestion.name}
                                className="result-image"
                              />
                              <div className="result-info">
                                <p className="result-name">{suggestion.name}</p>
                                <p className="result-description">
                                  {suggestion.description || "Không có mô tả"}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nút tìm kiếm */}
                <div className="search-btn-container">
                  <Button
                    className="search-btn"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <i className="bi bi-arrow-repeat spinning"></i>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AdvanceSearch;