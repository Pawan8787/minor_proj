import { useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Slide from "./Slide";
import road from "../../assets/Images/Pothole-homepage.jpg"
import './slider.css';
import road2 from "../../assets/Images/potholes-1-2.png";
import road3 from "../../assets/Images/potholes2.png";
const data = [
  {
    id: 1,
    src: road,
    headline: "Pothole-Vision",
    body: "A vision to make indian roads potholes-free",
    cta: "Report a Pothole",
    target: "form",
  },
  {
    id: 2,
    src: road3,
    headline: "Roads: viens of country",
    body: "There are currently no maps that displays potholes between source and destination",
    cta: "Navigate with Us",
    target: "map",
   
  },
  {
    
    id: 3,
    src: road2,
    headline: "Know the project",
    body: "what this project is about?",
    cta: "Understand the working",
    target: "working",
  },
];

const Slider = () => {
  // Manual Sliding functionality
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide(
      currentSlide === 0 ? data.length - 1 : (prevSlide) => prevSlide - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide(
      currentSlide === data.length - 1 ? 0 : (prevSlide) => prevSlide + 1
    );
  };

  return (
    <div className='slider-frame'>
      <div
        className='slider'
        style={{ transform: `translateX(-${100 * currentSlide}vw)` }}
      >
        {/* Take taka from data arrey */}
        {data.map((image) => (
          <Slide key={image.id} image={image} />
        ))}
      </div>
      <div className='slider-buttons'>
        <button onClick={prevSlide} className='prev-btn'>
          <span>
            <BsArrowLeft />
          </span>
        </button>
        <button onClick={nextSlide} className='next-btn'>
          <span>
            <BsArrowRight />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Slider;
