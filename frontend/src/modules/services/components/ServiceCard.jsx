import React from "react";
import { Star } from "lucide-react";
import { Button } from "../../../shared/components/Button.jsx";
import { formatPrice } from "../../../shared/utils/formatPrice.js";
import { useNavigate } from "react-router-dom";
import { useCategoryStore } from "../../categories/store/categoryStore.js";

const ServiceCard = ({ service, onBookingClick }) => {
  const navigate = useNavigate();

  if (!service) return null;

  const {
    id,
    name,
    description,
    basePrice,
    durationMin,
    averageRating,
    categoryName,
    categoryId,
    serviceImages = [],
  } = service;

  const storeCategoryName = useCategoryStore((state) => {
    const foundCategory = state.categories.find((c) => c.id === categoryId);
    return foundCategory?.name || foundCategory?.title;
  });

  const handleBooking = () => {
    if (typeof onBookingClick === "function") {
      return onBookingClick();
    }
    navigate(`/spa/booking/create?serviceId=${id}`);
  };

  const thumbnailImg = serviceImages.find((img) => img.isThumbnail)?.imageUrl;
  const firstImg = serviceImages[0]?.imageUrl;
  const fallbackDefaultImg =
    "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800";
  const displayImage = thumbnailImg || firstImg || fallbackDefaultImg;

  const displayCategoryName =
    categoryName || storeCategoryName || "Dịch vụ Spa";

  const displayRating =
    averageRating !== null && averageRating !== undefined
      ? averageRating.toFixed(1)
      : "4.8";

  return (
    <div className="bg-white rounded-2xl sm:rounded-4xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
      {/* Khối hình ảnh: Thu gọn chiều cao trên mobile (h-40) để card ngắn lại, desktop giữ h-52/h-64 */}
      <div className="relative overflow-hidden h-40 sm:h-52 bg-gray-100">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== fallbackDefaultImg) {
              e.target.src = fallbackDefaultImg;
            }
          }}
        />
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 bg-white/90 backdrop-blur-2xl rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm">
          {displayCategoryName}
        </div>
      </div>

      {/* Khối nội dung: Giảm padding trên mobile (p-3.5 thay vì p-6) để bớt khoảng trống */}
      <div className="p-3.5 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-bold text-pet-orange">
            {durationMin || 0} phút
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs sm:text-sm">
            <Star size={14} className="fill-yellow-500 sm:w-4 sm:h-4" />
            {displayRating}
          </div>
        </div>

        <h3 className="text-base sm:text-xl font-black text-slate-900 leading-tight mb-2 sm:mb-3 line-clamp-1">
          {name}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3 sm:mb-5 line-clamp-2 sm:line-clamp-3 flex-grow">
          {description ||
            "Dịch vụ chăm sóc thú cưng chuyên nghiệp, chuẩn an toàn và yêu thương."}
        </p>

        {/* Khối giá tiền */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black text-pet-orange">
              {formatPrice(basePrice || 0)}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-400 max-w-[100px] sm:max-w-[120px] truncate">
            {displayCategoryName}
          </span>
        </div>

        {/* Khối nút bấm: Thu gọn padding button trên mobile */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            className="w-full !py-1.5 sm:!py-2.5 text-xs sm:text-sm"
            onClick={() => navigate(`/spa/service/${id}`)}
            variant="outline"
          >
            Chi tiết
          </Button>
          <Button
            className="w-full !py-1.5 sm:!py-2.5 text-xs sm:text-sm"
            onClick={handleBooking}
          >
            Đặt lịch
          </Button>
        </div>
      </div>
    </div>
  );
};

export class ServiceCardWrapper {}
export default ServiceCard;
