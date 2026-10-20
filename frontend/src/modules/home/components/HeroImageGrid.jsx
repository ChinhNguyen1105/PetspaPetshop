import { useEffect, useRef } from "react";
import "./HeroImageGrid.css";

const PET_IMAGES = [
  "photo-1552053831-71594a27632d",
  "photo-1543466835-00a7907e9de1",
  "photo-1517849845537-4d257902454a",
  "photo-1583337130417-3346a1be7dee",
  "photo-1514888286974-6c03e2ca1dba",
  "photo-1573865526739-10659fec78a5",
  "photo-1495360010541-f48722b34f7d",
  "photo-1533738363-b7f9aef128ce",
  "photo-1587300003388-59208cc962cb",
  "photo-1548199973-03cce0bbc87b",
  "photo-1592194996308-7b43878e84a6",
  "photo-1574158622682-e40e69881006",
  "photo-1551717743-49959800b1f6",
  "photo-1596854407944-bf87f6fdd49e",
  "photo-1560807707-8cc77767d783",
  "photo-1601758228041-f3b2795255f1",
  "photo-1589924691995-400dc9ecc119",
  "photo-1541364983171-a8ba01e95cfc",
  "photo-1516734212186-a967f81ad0d7",
  "photo-1576201836106-db1758fd1c97",
  "photo-1537151608828-ea2b11777ee8",
  "photo-1543852786-1cf6624b9987",
  "photo-1561948955-570b270e7c36",
  "photo-1546975490-e8b92a360b24",
  "photo-1530281700549-e82e7bf110d6",
  "photo-1525253013412-55c1a69a5738",
  "photo-1507146426996-ef05306b995a",
  "photo-1516734212186-a967f81ad0d7",
  "photo-1535294435445-d7249524ef2e",
  "photo-1541599540903-216a46ca1dc0",
  "photo-1526336024174-e58f5cdd8e13",
  "photo-1519052537078-e6302a4968d4",
  "photo-1552728089-57bdde30beb3",
  "photo-1548767797-d8c844163c4c",
  "photo-1558944351-c8d3e7e1c8c3",
  "photo-1513360371669-4adf3dd7dff8",
  "photo-1494947665470-20322015e3a8",
  "photo-1504595403659-9088ce801e29",
  "photo-1516734212186-a967f81ad0d7",
  "photo-1548199973-03cce0bbc87b",
];

const getImageUrl = (id, index) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=420&q=80&sig=${index}`;

const HeroImageGrid = ({ pointerRef }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationFrameId;
    let disposed = false;
    let previousPoint = null;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "rgba(5, 15, 35, 0.88)";
      ctx.fillRect(0, 0, rect.width, rect.height);

      previousPoint = null;
    };

    const drawFrame = () => {
      if (disposed) return;

      const rect = container.getBoundingClientRect();
      const point = pointerRef?.current;

      // Lớp tối dần trở lại, làm vệt sáng cũ biến mất từ từ.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5, 15, 35, 0.035)";
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (point && !reducedMotionQuery.matches) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const dx = previousPoint ? point.x - previousPoint.x : 0;
        const dy = previousPoint ? point.y - previousPoint.y : 0;
        const distance = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(distance / 16));

        // Chia chuyển động thành các điểm nhỏ để vệt sáng liền mạch.
        for (let i = 0; i <= steps; i += 1) {
          const t = i / steps;
          const x = previousPoint ? previousPoint.x + dx * t : point.x;
          const y = previousPoint ? previousPoint.y + dy * t : point.y;

          const radius = 46;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

          gradient.addColorStop(0, "rgba(0, 0, 0, 0.98)");
          gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.8)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Một nét sáng rộng hơn tạo cảm giác đang quét qua ảnh.
        if (previousPoint) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
          ctx.lineWidth = 56;
          ctx.beginPath();
          ctx.moveTo(previousPoint.x, previousPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        previousPoint = { x: point.x, y: point.y };
      } else {
        previousPoint = null;
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    if (!reducedMotionQuery.matches) {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    const handleMotionPreference = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeCanvas();

      if (!reducedMotionQuery.matches) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
      }
    };

    reducedMotionQuery.addEventListener?.("change", handleMotionPreference);

    return () => {
      disposed = true;

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener?.(
        "change",
        handleMotionPreference,
      );
    };
  }, [pointerRef]);

  return (
    <div ref={containerRef} className="hero-image-grid" aria-hidden="true">
      <div className="hero-image-grid__tiles">
        {PET_IMAGES.map((id, index) => (
          <div className="hero-image-grid__tile" key={`${id}-${index}`}>
            <img
              src={getImageUrl(id, index)}
              alt=""
              loading={index < 16 ? "eager" : "lazy"}
              draggable="false"
            />
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className="hero-image-grid__overlay" />

      <div className="hero-image-grid__vignette" />
    </div>
  );
};

export default HeroImageGrid;
