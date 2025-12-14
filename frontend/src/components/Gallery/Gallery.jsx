// src/pages/Gallery/Gallery.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import api from "../../utils/api";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "./gallery.css";

// Dữ liệu tĩnh để sử dụng khi API thất bại
import GalleryImg1 from "../../assets/images/gallery/g1.jpg";
import GalleryImg3 from "../../assets/images/gallery/g3.jpg";
import GalleryImg4 from "../../assets/images/gallery/g4.jpg";
import GalleryImg6 from "../../assets/images/gallery/g6.jpg";
import GalleryImg7 from "../../assets/images/gallery/g7.jpg";

const fallbackImages = [
  { src: GalleryImg1, alt: "Person wearing shoes" },
  { src: GalleryImg3, alt: "Blonde woman wearing sunglasses" },
  { src: GalleryImg6, alt: "Random image" },
  { src: GalleryImg4, alt: "Jaipur, Rajasthan India" },
  { src: GalleryImg7, alt: "Verne Ho" },
  { src: GalleryImg6, alt: "Rann of Kutch, India" },
];

const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu ảnh từ API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await api.get("/gallery", { timeout: 10000 });
        const galleryData = response.data.map((img) => ({
          src: img.src || fallbackImages[0].src,
          alt: img.alt || "Gallery Image",
        }));

        if (galleryData.length) {
          setImages(galleryData);
        } else {
          setImages(fallbackImages);
        }
      } catch (error) {
        setImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    document.title = "Thư Viện Ảnh - GoTravel";
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <p>Đang tải bộ sưu tập ảnh...</p>
      </div>
    );
  }

  return (
    <>
      <section className="gallery-section py-5">
        <Container>
          <h2 className="text-center mb-5">Bộ Sưu Tập Ảnh</h2>
          <Row>
            {images.map((img, index) => (
              <Col md={4} sm={6} xs={12} key={index} className="mb-4">
                <div className="gallery-item">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="img-fluid"
                    loading="lazy"
                    onError={(e) => (e.target.src = fallbackImages[0].src)}
                    onClick={() => {
                      setCurrentIndex(index);
                      setOpen(true);
                    }}
                  />
                  <div className="overlay">
                    <p>{img.alt}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {open && (
            <Lightbox
              open={open}
              close={() => setOpen(false)}
              slides={images}
              index={currentIndex}
              render={{
                slide: ({ slide }) => (
                  <div className="lightbox-slide">
                    <img src={slide.src} alt={slide.alt} />
                    <div className="lightbox-caption">{slide.alt}</div>
                  </div>
                ),
              }}
            />
          )}
        </Container>
      </section>
    </>
  );
};

export default Gallery;