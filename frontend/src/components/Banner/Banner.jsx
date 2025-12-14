import React, { useState, useEffect, memo } from "react";
import { Carousel } from "react-bootstrap";
import api from "../../utils/api";
import { toast } from "react-toastify";
import sliderImg from "../../assets/images/slider/4.png";
import sliderImg2 from "../../assets/images/slider/5.png";
import "../Banner/banner.css";

const fallbackSlides = [
  {
    id: "fallback-1",
    image: sliderImg,
    alt: "Khám phá Việt Nam",
    heading: "HÀNH TRÌNH <span>KHÁM PHÁ VIỆT NAM</span>",
    subText: "Một mùa hè thật hấp dẫn với nhiều ưu đãi",
  },
  {
    id: "fallback-2",
    image: sliderImg2,
    alt: "Địa điểm đẹp",
    heading: "ĐỊA ĐIỂM ĐẸP <span>ĐANG CHỜ BẠN KHÁM PHÁ</span>",
    subText: "Hãy cùng đặt tour ngay để có một kỳ nghỉ cùng gia đình của mình",
  },
];

const Banner = () => {
  const [slides, setSlides] = useState(fallbackSlides);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get("/banners", { timeout: 10000 });
        const slidesData = response.data.map((slide) => ({
          ...slide,
          id: slide.id || `slide-${Math.random().toString(36).substr(2, 9)}`,
        }));

        if (slidesData.length) setSlides(slidesData);
      } catch (error) {
      }
    };

    fetchSlides();
  }, []);

  return (
    <section className="slider" aria-label="Promotional banner">
      <Carousel
        variant="dark"
        interval={5000}
        pause="hover"
        controls
        indicators={slides.length > 1}
        prevIcon={<span className="carousel-control-prev-icon" />}
        nextIcon={<span className="carousel-control-next-icon" />}
      >
        {slides.map((slide) => (
          <Carousel.Item key={slide.id}>
            <img
              src={slide.image}
              className="d-block w-100"
              alt={slide.alt}
              loading="lazy"
              onError={(e) => (e.target.src = fallbackSlides[0].image)}
            />
            <Carousel.Caption>
              <div className="slider_des">
                <h5
                  className="heading"
                  dangerouslySetInnerHTML={{ __html: slide.heading }}
                />
                <p className="sub_text">{slide.subText}</p>
              </div>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default memo(Banner);
