import React from "react";
import Slider from "react-slick";
import "../styles/EventSlider.css";

const events = [
  { id: 1, image: require("../assets/event1.png") },
  { id: 2, image: require("../assets/event2.png") },
  { id: 3, image: require("../assets/event3.png") },
  { id: 4, image: require("../assets/event4.png") },
];

const EventSlider = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    
    <div className="slider-section">
      <h2>Events</h2>
      <Slider {...settings}>
        {events.map((event) => (
          <div key={event.id} className="slide-img-wrapper">
            <img src={event.image} alt={`Event ${event.id}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default EventSlider;
