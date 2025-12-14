import React from "react";
import { Card } from "react-bootstrap";
import "../Cards/card.css";
import { NavLink } from "react-router-dom";

const Cards = ({ destination }) => {
  return (
    <div className="img-box">
      <NavLink
        className="body-text text-dark text-decoration-none"
        to={destination.tours === "Hotel" ? `/hotel-details/${destination.id}` : `/tour-details/${destination.slug}`}
      >
        <Card>
          <Card.Img
            variant="top"
            src={destination.image}
            className="img-fluid"
            alt={destination.name}
          />
          <Card.Title>{destination.name}</Card.Title>
          <span className="tours">{destination.tours}</span>
        </Card>
      </NavLink>
    </div>
  );
};

export default Cards;