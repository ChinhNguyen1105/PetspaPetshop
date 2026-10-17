import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import HeroImageGrid from "./HeroImageGrid";
import "./Hero.css";

const Hero = () => {
  const heroRef = useRef(null);
  const pointerRef = useRef(null);

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;

    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;

    pointerRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current = null;
  };

  return (
    <section
      ref={heroRef}
      className="pet-hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <HeroImageGrid pointerRef={pointerRef} />

      <div className="pet-hero__content">
        <div className="pet-hero__eyebrow">
          <Sparkles size={15} aria-hidden="true" />
          <span>YOUR PET, OUR PASSION</span>
        </div>

        <h1 className="pet-hero__title">
          Yêu thương
          <br />
          <span>bằng cả trái tim.</span>
        </h1>

        <p className="pet-hero__description">
          Từ những món đồ nhỏ xinh đến dịch vụ chăm sóc tận tâm, chúng tôi luôn
          mong muốn mang đến điều tốt nhất cho người bạn bốn chân của bạn.
        </p>

        <div className="pet-hero__actions">
          <Link
            to="/shop"
            className="pet-hero__button pet-hero__button--primary"
          >
            Khám phá cửa hàng
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <Link
            to="/spa"
            className="pet-hero__button pet-hero__button--secondary"
          >
            Dịch vụ Spa
          </Link>
        </div>

        <div className="pet-hero__note">
          <span className="pet-hero__note-line" />
          <span>Chăm sóc bằng tình yêu, mỗi ngày.</span>
        </div>
      </div>

      <div className="pet-hero__bottom-label" aria-hidden="true">
        <span>DISCOVER THE COLLECTION</span>
        <span>MOVE YOUR CURSOR TO REVEAL</span>
      </div>
    </section>
  );
};

export default Hero;
