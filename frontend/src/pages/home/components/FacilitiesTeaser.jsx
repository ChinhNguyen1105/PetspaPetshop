import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button";

const facilities = [
  {
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=85",
    title: "Phòng tắm & sấy khô",
    desc: "Bồn tắm inox chuyên dụng, máy sấy lồng tách biệt từng thú cưng, khử khuẩn sau mỗi ca.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=85",
    title: "Khu cắt tỉa lông",
    desc: "Bàn grooming chống trượt, dụng cụ thép y tế tiệt trùng, ánh sáng đèn LED chuyên nghiệp.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1200&q=85",
    title: "Phòng nghỉ cá nhân",
    desc: "Mỗi bé có ô riêng có đệm mềm, hệ thống thông gió & điều hòa 24/7, camera giám sát.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=85",
    title: "Góc kiểm tra sức khỏe",
    desc: "Cân điện tử, đèn khám da lông, bác sĩ tư vấn on-call — phát hiện sớm bất thường.",
  },
];

const stats = [
  { value: "500+", label: "Thú cưng đã phục vụ" },
  { value: "4.9★", label: "Đánh giá trung bình" },
  { value: "100%", label: "Dụng cụ tiệt trùng" },
];

const FacilitiesTeaser = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-pet-blue p-5 text-white shadow-lg sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-block rounded-full bg-pet-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Không gian chăm sóc
          </span>

          <h3 className="mt-3 text-2xl font-black uppercase leading-snug tracking-tight sm:text-3xl">
            Cơ Sở Vật Chất
            <br />
            <span className="text-pet-orange">Tiêu Chuẩn Quốc Tế</span>
          </h3>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
            Mỗi góc của Boss Spa được thiết kế riêng cho sự thoải mái và an toàn
            của thú cưng — sạch sẽ, hiện đại, kiểm soát nhiệt độ toàn thời gian.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/spa")}
          className="shrink-0 self-start border-none bg-pet-orange text-sm font-bold text-white hover:bg-orange-600 md:self-auto"
        >
          Đặt lịch trải nghiệm →
        </Button>
      </div>

      {/* Interactive image gallery */}
      <div
        className="flex h-[420px] gap-2 sm:h-[480px] sm:gap-3"
        onMouseLeave={() => setActiveIndex(0)}
      >
        {facilities.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <article
              key={item.title}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              tabIndex={0}
              aria-label={item.title}
              className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-white/15 outline-none transition-[flex] duration-700 ease-in-out focus-visible:ring-2 focus-visible:ring-pet-orange ${
                isActive ? "flex-[3]" : "flex-1"
              }`}
            >
              {/* Background image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
                  isActive ? "scale-100" : "scale-110"
                }`}
              />

              {/* Dark overlay */}
              <div
                className={`absolute inset-0 transition-colors duration-500 ${
                  isActive
                    ? "bg-gradient-to-t from-black/90 via-black/25 to-black/10"
                    : "bg-black/50 group-hover:bg-black/30"
                }`}
              />

              {/* Collapsed state */}
              <div
                className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-500 sm:p-4 ${
                  isActive
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-90"
                }`}
              >
                <span className="mb-2 block h-1 w-8 rounded-full bg-pet-orange" />

                <h4
                  className={`font-black leading-snug text-white ${
                    isActive ? "text-base sm:text-xl" : "text-xs sm:text-sm"
                  }`}
                >
                  {item.title}
                </h4>

                <p
                  className={`mt-2 text-xs leading-relaxed text-slate-200 transition-opacity duration-300 ${
                    isActive
                      ? "line-clamp-4 opacity-100 sm:text-sm"
                      : "line-clamp-2 opacity-80 sm:line-clamp-3"
                  }`}
                >
                  {item.desc}
                </p>
              </div>

              {/* Vertical title when collapsed */}
              {!isActive && (
                <div className="absolute left-1/2 top-5 -translate-x-1/2 sm:top-6">
                  <span className="rounded-full bg-black/35 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
                    0{index + 1}
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Mobile/tablet navigation indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {facilities.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Xem ${item.title}`}
            aria-pressed={activeIndex === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-8 bg-pet-orange"
                : "w-3 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xl font-black text-pet-orange sm:text-2xl">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FacilitiesTeaser;
