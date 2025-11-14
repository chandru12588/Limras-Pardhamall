import React, { useEffect, useRef } from "react";
import slide1 from "../assets/flash1.jpg";
import slide2 from "../assets/flash2.jpg";
import slide3 from "../assets/flash3.jpg";
import allahBG from "../assets/allah-bg.png"; // <--- NEW

const slides = [slide1, slide2, slide3];

const FlashSlider = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % slides.length;
      const width = slider.children[0].offsetWidth;

      slider.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden">
      <div
        ref={sliderRef}
        className="
          w-full flex overflow-x-auto 
          snap-x snap-mandatory 
          scroll-smooth no-scrollbar
        "
      >
        {slides.map((img, i) => (
          <div
            key={i}
            className="
              snap-center flex-shrink-0 
              w-screen h-[300px] sm:h-[380px] md:h-[450px]
              flex items-center justify-center
              bg-cover bg-center
            "
            style={{
              backgroundImage: `url(${allahBG})`,
              backgroundSize: "cover",
              backgroundRepeat: "repeat",
              opacity: 0.95,
            }}
          >
            <img
              src={img}
              alt={`slide-${i}`}
              className="max-w-full max-h-full object-contain drop-shadow-xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSlider;
